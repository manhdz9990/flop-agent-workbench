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
      message("VALID", { from: "did:key:z6MkWriter", text: "second", seq: "8", nonce: "9007199254740993", signature: "exact-signature" }),
    ]);
    expect(conversation.map((item) => item.text)).toEqual(["second", "first"]);
    expect(conversation.map((item) => item.writerKind)).toEqual(["SIGNED_DID_KEY", "UNSIGNED_NICKNAME"]);
    expect(conversation.map((item) => item.verdict)).toEqual(["VALID", "UNSIGNED"]);
    expect(conversation[0]?.signature).toBe("exact-signature");
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

  it("uses the official cursor pump while preserving fixed-origin local signing", () => {
    const source = readFileSync(new URL("../../app/rooms-chat.tsx", import.meta.url), "utf8");
    expect(source).toMatch(/publishPreparedMessage\(signed, attempts\)/);
    expect(source).toMatch(/activeIdentity\.prepareSignedMessage/);
    expect(source).toContain('fetch("/api/rooms")');
    expect(source).toContain('{ since: cursor, wait: 10 }');
    expect(source).toContain("SelectedRoomLiveSession");
    expect(source).toContain("liveSession.current?.restart()");
    expect(source).not.toMatch(/setInterval|WebSocket|EventSource|dangerouslySetInnerHTML|localStorage|sessionStorage|indexedDB|document\.cookie/);
    expect(source).not.toMatch(/href=.*(?:message\.text|item\.topic|item\.room)/);
  });

  it("merges authoritative records from current state and reconciles exact swept signed evidence", () => {
    const source = readFileSync(new URL("../../app/rooms-chat.tsx", import.meta.url), "utf8");
    expect(source).toContain("const current = messagesRef.current");
    expect(source).toContain("message.verdict === \"VALID\"");
    for (const field of ["message.writer === item.prepared!.did", "message.nonce === item.prepared!.nonce", "message.signature === item.prepared!.signature", "message.text === item.prepared!.text"]) expect(source).toContain(field);
    expect(source).toContain(".slice(0, 200)");
  });

  it("keeps a bounded follow-newest viewport and progressive message details", () => {
    const source = readFileSync(new URL("../../app/rooms-chat.tsx", import.meta.url), "utf8");
    const styles = readFileSync(new URL("../../app/globals.css", import.meta.url), "utf8");
    for (const marker of ['className="conversation-viewport"', "[...messages].reverse().map", "viewport.scrollTop = viewport.scrollHeight", "pendingScrollAnchor.current", 'className="message-details"', "Open details for message"]) expect(source).toContain(marker);
    expect(source).toContain('newMessageCount > 99 ? "99+" : newMessageCount');
    expect(styles).toMatch(/\.conversation-viewport\{[^}]*overflow-y:auto/);
    expect(styles).toMatch(/\.chat-message\{[^}]*grid-template-columns:80px 106px/);
    expect(styles).toMatch(/\.message-details\[open\]/);
  });

  it("presents a minimal direct composer without a new general message limit", () => {
    const source = readFileSync(new URL("../../app/rooms-chat.tsx", import.meta.url), "utf8");
    for (const copy of ["Read-only conversation", "Create or Import Agent", "Composer locked", "Secure Backup", "Message #", "Send", "character", "Shift"]) {
      if (copy !== "Shift") expect(source).toContain(copy);
    }
    expect(source).toContain('event.key === "Enter" && !event.shiftKey');
    expect(source).toContain("Math.min(composer.current.scrollHeight, 92)");
    expect(source).not.toMatch(/maxLength|4096|text\.slice|text\.substring|Review Message|Check publication/);
  });

  it("keeps room selection explicit and direct lobby fallback compact", () => {
    const source = readFileSync(new URL("../../app/rooms-chat.tsx", import.meta.url), "utf8");
    for (const copy of ["Choose a room", "No room is read", "direct-room-choice", 'selectRoom("lobby")', "Back to rooms", "Retained data is not complete history."]) expect(source).toContain(copy);
    expect(source).not.toContain("Direct Room Access");
    expect(source).not.toMatch(/initialRoom|ExplicitInitialRoomRead/);
  });

  it("hardens room-row containment and collapses secondary navigation by actual workspace width", () => {
    const source = readFileSync(new URL("../../app/rooms-chat.tsx", import.meta.url), "utf8");
    const styles = readFileSync(new URL("../../app/globals.css", import.meta.url), "utf8");
    expect(source).toContain("roomsPanelOpen");
    expect(source).toContain("rooms-panel-toggle");
    expect(source).toContain("rooms-panel-close");
    expect(source).toContain("setRoomsPanelOpen(false)");
    expect(styles).toContain("container:rooms-workspace / inline-size");
    expect(styles).toContain("grid-template-columns:240px minmax(0,1fr)");
    expect(styles).toContain("@container rooms-workspace (max-width:920px)");
    expect(styles).toMatch(/\.room-choice,.room-choice\.selected\{[^}]*height:auto[^}]*overflow:hidden/);
    expect(styles).toMatch(/\.room-choice\.selected::after\{content:none/);
    expect(styles).toMatch(/\.room-choice-title strong\{[^}]*text-overflow:ellipsis[^}]*white-space:nowrap/);
    expect(styles).toMatch(/\.message-content\{[^}]*word-break:normal[^}]*overflow-wrap:break-word/);
    expect(styles).toMatch(/\.room-choice,.room-choice\.selected\{[^}]*min-height:36px[^}]*height:auto/);
  });
});
