import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import type { EvidenceField, MessageEvidence, VerificationState } from "../../lib/domain";
import { buildRoomConversation, highestObservedNonceForDid, prioritizeDiscoveredLobby } from "../../lib/rooms-chat";
import type { RoomObservation } from "../../lib/live";

function message(verdict: VerificationState, values: Readonly<Record<string, unknown>>): MessageEvidence {
  const fields: EvidenceField[] = Object.entries(values).map(([name, value]) => ({ name, value, authority: "UNTRUSTED_CALLER_DATA" }));
  return { verificationState: verdict, fields, warnings: [] };
}

describe("V12-08A Rooms / Chat adapter", () => {
  it("presents usable observed sequences newest-first and distinguishes signed DIDs from unsigned nicknames", () => {
    const conversation = buildRoomConversation([
      message("UNSIGNED", { from: "alice", text: "first", seq: "7" }),
      message("VALID", { from: "did:key:z6MkWriter", text: "second", seq: "8", nonce: "9007199254740993" }),
    ]);
    expect(conversation.map((item) => item.text)).toEqual(["second", "first"]);
    expect(conversation.map((item) => item.writerKind)).toEqual(["SIGNED_DID_KEY", "UNSIGNED_NICKNAME"]);
    expect(conversation.map((item) => item.verdict)).toEqual(["VALID", "UNSIGNED"]);
  });

  it("compares 19-digit sequences exactly and keeps equal or unusable evidence deterministic", () => {
    const conversation = buildRoomConversation([
      message("UNSIGNED", { from: "missing-one", text: "missing one" }),
      message("VALID", { from: "did:key:z6MkOne", text: "older", seq: "9007199254740993" }),
      message("UNSIGNED", { from: "equal-one", text: "equal one", seq: "9999999999999999999" }),
      message("UNSIGNED", { from: "equal-two", text: "equal two", seq: "9999999999999999999" }),
      message("UNSIGNED", { from: "missing-two", text: "missing two", seq: "not-usable" }),
    ]);
    expect(conversation.map((item) => item.text)).toEqual(["equal one", "equal two", "older", "missing one", "missing two"]);
    expect(conversation.slice(-2).map((item) => item.sequence)).toEqual([undefined, "not-usable"]);
  });

  it("promotes only an actually discovered lobby and preserves every observed field", () => {
    const rooms: RoomObservation[] = [
      { room: "garden", seq: "8", approxStoredSize: "2K", lastActivity: "1m ago", topic: "opaque" },
      { room: "lobby", seq: "7", approxStoredSize: "3K", lastActivity: "2m ago", topic: "also opaque" },
    ];
    expect(prioritizeDiscoveredLobby(rooms)).toEqual([rooms[1], rooms[0]]);
    const withoutLobby = prioritizeDiscoveredLobby([rooms[0]!]);
    expect(withoutLobby).toEqual([rooms[0]]);
    expect(withoutLobby.some((room) => room.room === "lobby")).toBe(false);
  });

  it("preserves hostile strings as opaque text without creating URL or markup behavior", () => {
    const hostile = '<script>window.__owned=true</script> https://example.invalid';
    expect(buildRoomConversation([message("UNSIGNED", { from: "<img src=x>", text: hostile })])).toEqual([{
      index: 0,
      writer: "<img src=x>",
      writerKind: "UNSIGNED_NICKNAME",
      text: hostile,
      verdict: "UNSIGNED",
    }]);
  });

  it("selects the exact highest usable observed nonce for the active DID without number conversion", () => {
    const did = "did:key:z6MkWriter";
    const conversation = buildRoomConversation([
      message("VALID", { from: did, text: "a", nonce: "9007199254740993" }),
      message("VALID", { from: did, text: "b", nonce: "9999999999999999998" }),
      message("VALID", { from: "did:key:z6MkOther", text: "c", nonce: "9999999999999999997" }),
      message("UNVERIFIABLE", { from: did, text: "d", nonce: "not-a-nonce" }),
      message("INVALID", { from: did, text: "forged", nonce: "9999999999999999999" }),
    ]);
    expect(highestObservedNonceForDid(conversation, did)).toBe("9999999999999999998");
  });

  it("keeps lifecycle and security behavior in existing adapters with manual actions only", () => {
    const source = readFileSync(new URL("../../app/rooms-chat.tsx", import.meta.url), "utf8");
    expect(source).toMatch(/publishPreparedMessage\(prepared, attempts\)/);
    expect(source).toMatch(/verifyPublishedReadback\(\{ prepared, attempts \}\)/);
    expect(source).toMatch(/activeIdentity\.prepareSignedMessage/);
    expect(source).toContain('fetch("/api/rooms")');
    expect(source).toContain('body: JSON.stringify({ kind: "ROOM", room })');
    expect(source).not.toMatch(/setInterval|WebSocket|EventSource|dangerouslySetInnerHTML|localStorage|sessionStorage|indexedDB|document\.cookie/);
    expect(source).not.toMatch(/href=.*(?:message\.text|room\.topic|room\.room)/);
    expect(source).not.toMatch(/api\/(?:publish|write)|method:\s*"POST"[^]*say-signed/);
  });

  it("presents the Phase 5 conversational hierarchy and explicit publish confirmation", () => {
    const source = readFileSync(new URL("../../app/rooms-chat.tsx", import.meta.url), "utf8");
    for (const copy of ["Choose a room to read its bounded retained conversation", "Room discovery remains manual", "Choose a room", "Select a public room to read its retained conversation.", "Write to", "Review before signing", "Technical signing details", "Signed locally", "Publish to #", "Publish request completed", "Published and verified", "View Receipt"]) expect(source).toContain(copy);
    expect(source).toContain("setPublishConfirm(true)");
    expect(source).toContain("Added to Evidence");
    expect(source).not.toMatch(/setInterval|WebSocket|EventSource|dangerouslySetInnerHTML/);
  });

  it("keeps R3 reads explicit, manual, and within the existing routes", () => {
    const source = readFileSync(new URL("../../app/rooms-chat.tsx", import.meta.url), "utf8");
    for (const copy of ["Loading public rooms…", "No public rooms were observed in this bounded response.", "Public rooms unavailable", "Try Again", "Direct Room Access", "Retained conversation · Auto-refresh on", "Retained data is not complete history.", "Back to rooms", "SIGNED ·", "Self-asserted nickname"]) expect(source).toContain(copy);
    expect(source).toContain('onClick={() => selectRoom("lobby")}');
    expect(source).toContain('body: JSON.stringify({ kind: "ROOM", room })');
    expect(source).not.toMatch(/setInterval|WebSocket|EventSource|dangerouslySetInnerHTML/);
  });

  it("requires explicit room selection and resets the transient draft when switching rooms", () => {
    const source = readFileSync(new URL("../../app/rooms-chat.tsx", import.meta.url), "utf8");
    expect(source).toContain("const [selectedRoom, setSelectedRoom] = useState<string>();");
    expect(source).toContain('setSelectedRoom(room); setSelectedRoomRead(false); setMessages([]); setText("");');
    expect(source).toContain("{selectedRoom && <>");
    expect(source).not.toMatch(/initialRoom|ExplicitInitialRoomRead/);
  });

  it("maps existing identity readiness to the three R4 composer presentations", () => {
    const source = readFileSync(new URL("../../app/rooms-chat.tsx", import.meta.url), "utf8");
    for (const copy of [
      "Read-only conversation",
      "Create or import an Agent to sign and publish to this room. Reading retained messages remains available.",
      "Create or Import Agent",
      "Never enter private keys, seeds, passphrases, passwords, tokens, or backup files here.",
      "Composer locked",
      "Secure backup to sign and publish.",
      "Secure Backup",
      "Write a message",
      "Messages are public and untrusted after publication. Retained history may be incomplete.",
      "Do not enter private keys, seeds, passphrases, passwords, tokens, or backup content.",
      "Review Message",
      "Sign locally",
      "Edit Message",
      "This message has not been published.",
      "Publishing is not proof of verification.",
    ]) expect(source).toContain(copy);
    expect(source).toContain("Array.from(text).length");
    expect(source).toMatch(/characterCount === 1 \? "character" : "characters"/);
    expect(source).not.toMatch(/maxLength|4096|characterCount\s*(?:>=|<=|>|<)|text\.slice|text\.substring/);
  });
});
