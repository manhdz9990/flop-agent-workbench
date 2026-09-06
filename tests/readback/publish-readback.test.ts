import { readFileSync } from "node:fs";

import { describe, expect, it, vi } from "vitest";

import { generateLocalIdentity } from "../../lib/identity";
import type { RoomReadPayload } from "../../lib/live";
import { publishPreparedMessage, PublishAttemptSession, type PublishAttemptStateReader } from "../../lib/publish";
import { verifyPublishedReadback } from "../../lib/readback";
import { SessionNonceReservations, type PreparedSignedMessage } from "../../lib/signing";

const clock = { nowMilliseconds: () => 1_700_000_000_000n };

async function fixture(): Promise<{
  prepared: PreparedSignedMessage;
  reservations: SessionNonceReservations;
  attempts: PublishAttemptSession;
}> {
  const identity = await generateLocalIdentity();
  const reservations = new SessionNonceReservations();
  const prepared = await identity.prepareSignedMessage({ room: "lobby", text: "hello" }, reservations, clock);
  identity.lock();
  return { prepared, reservations, attempts: new PublishAttemptSession(reservations) };
}

function payload(prepared: PreparedSignedMessage, messages: RoomReadPayload["messages"]): RoomReadPayload {
  return {
    room: prepared.room,
    count: messages.length,
    firstSeq: messages[0]?.seq === undefined ? null : String(messages[0].seq),
    lastSeq: messages.at(-1)?.seq === undefined ? "0" : String(messages.at(-1)?.seq),
    messages,
  };
}

function exactRecord(prepared: PreparedSignedMessage, seq: string = "42") {
  return {
    from: prepared.did,
    nonce: prepared.nonce,
    text: prepared.text,
    sig: prepared.signature,
    seq,
    ts: "2026-09-05T00:00:00Z",
  };
}

async function recordAttempt(
  prepared: PreparedSignedMessage,
  attempts: PublishAttemptSession,
  result: "RESPONSE_RECEIVED" | "OUTCOME_UNKNOWN" = "RESPONSE_RECEIVED",
): Promise<void> {
  const fetcher = result === "RESPONSE_RECEIVED"
    ? vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 202 }))
    : vi.fn<typeof fetch>().mockRejectedValue(new TypeError("network"));
  await publishPreparedMessage(prepared, attempts, { fetch: fetcher });
}

describe("V12-04 read-back precondition and exact verification", () => {
  it("does not read or claim publication when no publish attempt exists", async () => {
    const { prepared, attempts } = await fixture();
    const reader = vi.fn();
    await expect(verifyPublishedReadback({ prepared, attempts }, { readRoom: reader })).resolves.toEqual({
      state: "NOT_ATTEMPTED",
      message: "No publish attempt is recorded for this prepared message.",
    });
    expect(reader).not.toHaveBeenCalled();
  });

  it.each(["RESPONSE_RECEIVED", "OUTCOME_UNKNOWN"] as const)(
    "can independently verify exact evidence after %s",
    async (attemptResult) => {
      const { prepared, reservations, attempts } = await fixture();
      await recordAttempt(prepared, attempts, attemptResult);
      const reader = vi.fn().mockResolvedValue({ ok: true, value: payload(prepared, [exactRecord(prepared)]) });
      const result = await verifyPublishedReadback({ prepared, attempts }, { readRoom: reader });
      expect(result).toMatchObject({
        state: "PUBLISHED_AND_VERIFIED",
        evidenceVerdict: "VALID",
        exactCandidateCount: 1,
        observed: { sequence: "42", timestamp: "2026-09-05T00:00:00Z" },
        pipeline: { evidenceVerdict: "VALID" },
        receipt: { evidenceVerdict: "VALID" },
      });
      expect(reader).toHaveBeenCalledExactlyOnceWith(prepared.room);
      expect(reservations.isBurned(prepared.did, prepared.room, prepared.nonce)).toBe(true);
    },
  );

  it.each(["RESPONSE_RECEIVED", "OUTCOME_UNKNOWN"] as const)(
    "%s without exact retained evidence is cause-neutral NOT_OBSERVED and keeps the nonce burned",
    async (attemptResult) => {
      const { prepared, reservations, attempts } = await fixture();
      await recordAttempt(prepared, attempts, attemptResult);
      const result = await verifyPublishedReadback(
        { prepared, attempts },
        { readRoom: async () => ({ ok: true, value: payload(prepared, []) }) },
      );
      expect(result).toEqual({
        state: "NOT_OBSERVED",
        message: "Not observed yet. The bounded retained window does not prove whether the write occurred.",
      });
      expect(reservations.isBurned(prepared.did, prepared.room, prepared.nonce)).toBe(true);
    },
  );

  it.each([
    ["DID", { from: "did:key:other" }, "NOT_OBSERVED"],
    ["nonce", { nonce: "1700000000001" }, "NOT_OBSERVED"],
    ["post-sweep text", { text: "other" }, "OBSERVED_BUT_NOT_VERIFIED"],
    ["signature", { sig: "other" }, "OBSERVED_BUT_NOT_VERIFIED"],
  ] as const)("requires an exact %s match", async (_field, change, expectedState) => {
    const { prepared, attempts } = await fixture();
    await recordAttempt(prepared, attempts);
    const result = await verifyPublishedReadback(
      { prepared, attempts },
      { readRoom: async () => ({ ok: true, value: payload(prepared, [{ ...exactRecord(prepared), ...change }]) }) },
    );
    expect(result.state).toBe(expectedState);
  });

  it("treats seq and ts as server evidence, not signed-match inputs", async () => {
    const { prepared, attempts } = await fixture();
    await recordAttempt(prepared, attempts);
    const result = await verifyPublishedReadback(
      { prepared, attempts },
      { readRoom: async () => ({ ok: true, value: payload(prepared, [{ ...exactRecord(prepared), seq: 99, ts: undefined }]) }) },
    );
    expect(result).toMatchObject({ state: "PUBLISHED_AND_VERIFIED", observed: { sequence: "99" } });
  });

  it("selects the first retained exact candidate deterministically and reports multiplicity", async () => {
    const { prepared, attempts } = await fixture();
    await recordAttempt(prepared, attempts);
    const result = await verifyPublishedReadback(
      { prepared, attempts },
      { readRoom: async () => ({ ok: true, value: payload(prepared, [exactRecord(prepared, "7"), exactRecord(prepared, "8")]) }) },
    );
    expect(result).toMatchObject({
      state: "PUBLISHED_AND_VERIFIED",
      exactCandidateCount: 2,
      observed: { sequence: "7" },
    });
  });
});

describe("V12-04 evidence and operational boundaries", () => {
  it.each([
    ["malformed", "%%%", "UNVERIFIABLE"],
    ["non-canonical", "A".repeat(88), "UNVERIFIABLE"],
    ["missing", undefined, "UNVERIFIABLE"],
  ] as const)("preserves %s signature evidence as %s rather than INVALID", async (_kind, sig, verdict) => {
    const { prepared, attempts } = await fixture();
    await recordAttempt(prepared, attempts);
    const record = { ...exactRecord(prepared), sig };
    const result = await verifyPublishedReadback(
      { prepared, attempts },
      { readRoom: async () => ({ ok: true, value: payload(prepared, [record]) }) },
    );
    expect(result).toMatchObject({ state: "OBSERVED_BUT_NOT_VERIFIED", evidenceVerdict: verdict });
  });

  it("preserves genuine canonical cryptographic mismatch as INVALID", async () => {
    const { prepared, attempts } = await fixture();
    await recordAttempt(prepared, attempts);
    const wrongSignature = `${prepared.signature[0] === "A" ? "B" : "A"}${prepared.signature.slice(1)}`;
    const result = await verifyPublishedReadback(
      { prepared, attempts },
      { readRoom: async () => ({ ok: true, value: payload(prepared, [{ ...exactRecord(prepared), sig: wrongSignature }]) }) },
    );
    expect(result).toMatchObject({ state: "OBSERVED_BUT_NOT_VERIFIED", evidenceVerdict: "INVALID" });
  });

  it.each(["NETWORK_TIMEOUT", "NETWORK_ERROR"])("keeps %s operational failure separate", async (code) => {
    const { prepared, reservations, attempts } = await fixture();
    await recordAttempt(prepared, attempts);
    const result = await verifyPublishedReadback(
      { prepared, attempts },
      { readRoom: async () => ({ ok: false, error: { code, message: "read unavailable" } }) },
    );
    expect(result).toEqual({
      state: "READBACK_UNAVAILABLE",
      operationalError: { code, message: "read unavailable" },
    });
    expect(result.state).not.toBe("NOT_OBSERVED");
    expect(result).not.toHaveProperty("evidenceVerdict");
    expect(reservations.isBurned(prepared.did, prepared.room, prepared.nonce)).toBe(true);
  });

  it("rejects a mismatched reader room without converting it to evidence", async () => {
    const { prepared, attempts } = await fixture();
    await recordAttempt(prepared, attempts);
    const result = await verifyPublishedReadback(
      { prepared, attempts },
      { readRoom: async () => ({ ok: true, value: { ...payload(prepared, []), room: "other" } }) },
    );
    expect(result).toMatchObject({ state: "READBACK_UNAVAILABLE", operationalError: { code: "ROOM_MISMATCH" } });
  });

  it("keeps receipts bounded, deterministic, and free of secrets or positive identity/trust claims", async () => {
    const { prepared, attempts } = await fixture();
    await recordAttempt(prepared, attempts);
    const reader = async () => ({ ok: true as const, value: payload(prepared, [exactRecord(prepared)]) });
    const first = await verifyPublishedReadback({ prepared, attempts }, { readRoom: reader });
    const second = await verifyPublishedReadback({ prepared, attempts }, { readRoom: reader });
    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
    expect(JSON.stringify(first)).not.toMatch(/seed|privateKey|passphrase|encryptionKey|decryptedBackup/i);
    expect(first).not.toMatchObject({ receipt: { provesIdentity: true, provesTrust: true, provesIntent: true } });
  });

  it("reuses the existing safe reader, verifier, diagnostics, and receipt adapters without write capability", () => {
    const source = readFileSync(new URL("../../lib/readback/verify.ts", import.meta.url), "utf8");
    expect(source).toMatch(/readRoom/);
    expect(source).toMatch(/verifyProtocolRecord/);
    expect(source).toMatch(/diagnoseLiveTranscript/);
    expect(source).toMatch(/buildTranscriptVerificationPipeline/);
    expect(source).toMatch(/createEvidenceReceipt/);
    expect(source).not.toMatch(/publishPreparedMessage|say-signed|method:\s*["'](?:POST|PUT|PATCH|DELETE)|retry|localStorage|sessionStorage|indexedDB/);
  });

  it("accepts an already-recorded ATTEMPTED state without fabricating transport outcome", async () => {
    const { prepared } = await fixture();
    const attempts: PublishAttemptStateReader = { stateFor: () => "ATTEMPTED" };
    const result = await verifyPublishedReadback(
      { prepared, attempts },
      { readRoom: async () => ({ ok: true, value: payload(prepared, [exactRecord(prepared)]) }) },
    );
    expect(result.state).toBe("PUBLISHED_AND_VERIFIED");
  });
});
