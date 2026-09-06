import { readFileSync } from "node:fs";

import { afterEach, describe, expect, it, vi } from "vitest";

import { generateLocalIdentity } from "../../lib/identity";
import { canonicalSignedPayload, verifyProtocolRecord } from "../../lib/protocol";
import {
  LOCAL_SIGNING_STATE,
  prepareNonceCandidate,
  SessionNonceReservations,
  type NonceClock,
} from "../../lib/signing";

const ZERO_SEED_DID = "did:key:z6MkiTBz1ymuepAQ4HEHYSF1H8quG5GLVVQR3djdX3mDooWp";
const OTHER_DID = "did:key:z6MkkEfVktyKdqhhEyzYpotus29DcWpqrwoC29xTaKzfcUeb";
const fixedClock = (value: bigint): NonceClock => ({ nowMilliseconds: () => value });

function deterministicRandom<T extends ArrayBufferView | null>(array: T): T {
  if (array instanceof Uint8Array) array.fill(0);
  return array;
}

afterEach(() => vi.restoreAllMocks());

describe("Technocore signing preparation", () => {
  it("signs exact UTF-8 room|nonce|post-sweep-text bytes", async () => {
    vi.spyOn(crypto, "getRandomValues").mockImplementation(deterministicRandom);
    const identity = await generateLocalIdentity();
    const prepared = await identity.prepareSignedMessage(
      { room: "lobby", text: "  café\u0000message  " },
      new SessionNonceReservations(),
      fixedClock(1_700_000_000_000n),
    );

    expect(prepared.text).toBe("café message");
    expect(prepared.canonicalPayload).toBe("lobby|1700000000000|café message");
    expect(new TextDecoder().decode(canonicalSignedPayload(prepared.room, prepared.nonce, prepared.text))).toBe(
      prepared.canonicalPayload,
    );
    expect(new TextEncoder().encode(prepared.canonicalPayload)).toEqual(
      canonicalSignedPayload(prepared.room, prepared.nonce, prepared.text),
    );
    expect(prepared.canonicalPayload).not.toContain("\u0000");
    identity.lock();
  });

  it("produces deterministic canonical Ed25519 evidence and self-verifies it", async () => {
    vi.spyOn(crypto, "getRandomValues").mockImplementation(deterministicRandom);
    const identity = await generateLocalIdentity();
    const prepared = await identity.prepareSignedMessage(
      { room: "lobby", text: "hello" },
      new SessionNonceReservations(),
      fixedClock(1_700_000_000_000n),
    );

    expect(prepared.did).toBe(ZERO_SEED_DID);
    expect(prepared.signature).toBe(
      "dqzVp441QiT_ICOPIVWf_7CnOvKahIW0UNAyleGiBaMxbIT3ekK8jupSeDTfXFJF5rQBsszu71ktKFJC-bKWAQ",
    );
    await expect(
      verifyProtocolRecord(prepared.room, {
        from: prepared.did,
        nonce: prepared.nonce,
        text: prepared.text,
        sig: prepared.signature,
      }),
    ).resolves.toBe("VALID");
    identity.lock();
  });

  it.each([
    ["room", { room: "other-room" }],
    ["nonce", { nonce: "1700000000001" }],
    ["text", { text: "tampered" }],
    ["signature", { sig: "A" }],
  ])("existing verification rejects tampered %s evidence", async (_field, change) => {
    vi.spyOn(crypto, "getRandomValues").mockImplementation(deterministicRandom);
    const identity = await generateLocalIdentity();
    const prepared = await identity.prepareSignedMessage(
      { room: "lobby", text: "hello" },
      new SessionNonceReservations(),
      fixedClock(1_700_000_000_000n),
    );
    const record = {
      from: prepared.did,
      nonce: prepared.nonce,
      text: prepared.text,
      sig: prepared.signature,
      ...change,
    };
    const room = "room" in change ? change.room : prepared.room;
    await expect(verifyProtocolRecord(room, record)).resolves.not.toBe("VALID");
    identity.lock();
  });

  it("returns an immutable public locally-signed/not-published descriptor without server fields or secrets", async () => {
    const identity = await generateLocalIdentity();
    const prepared = await identity.prepareSignedMessage(
      { room: "lobby", text: "hello" },
      new SessionNonceReservations(),
      fixedClock(123n),
    );
    expect(prepared.state).toBe(LOCAL_SIGNING_STATE);
    expect(Object.isFrozen(prepared)).toBe(true);
    expect(Object.keys(prepared).sort()).toEqual(
      ["canonicalPayload", "did", "nonce", "room", "signature", "state", "text"].sort(),
    );
    expect(JSON.stringify(prepared)).not.toMatch(/seed|privateKey|passphrase|encryptionKey|decrypted|"seq"|"ts"/i);
    identity.lock();
  });

  it("refuses signing after the identity is locked", async () => {
    const identity = await generateLocalIdentity();
    identity.lock();
    await expect(
      identity.prepareSignedMessage(
        { room: "lobby", text: "hello" },
        new SessionNonceReservations(),
        fixedClock(123n),
      ),
    ).rejects.toMatchObject({ code: "IDENTITY_LOCKED" });
  });
});

describe("exact nonce preparation", () => {
  it("uses current milliseconds when greatest", () => {
    expect(prepareNonceCandidate({
      currentUnixMilliseconds: 500n,
      highestObservedNonce: "10",
      highestSessionNonce: "20",
    })).toBe("500");
  });

  it("uses observed nonce plus one when greatest", () => {
    expect(prepareNonceCandidate({
      currentUnixMilliseconds: 500n,
      highestObservedNonce: "900",
      highestSessionNonce: "700",
    })).toBe("901");
  });

  it("uses session nonce plus one when greatest", () => {
    expect(prepareNonceCandidate({
      currentUnixMilliseconds: 500n,
      highestObservedNonce: "700",
      highestSessionNonce: "900",
    })).toBe("901");
  });

  it("keeps arithmetic exact beyond Number.MAX_SAFE_INTEGER", () => {
    expect(prepareNonceCandidate({
      currentUnixMilliseconds: 1n,
      highestObservedNonce: "9007199254740992",
    })).toBe("9007199254740993");
  });

  it.each(["", "+1", "-1", "1.0", "1e3", " 1", "1 ", "abc", "12345678901234567890"])(
    "rejects malformed or out-of-range nonce evidence %j",
    (highestObservedNonce) => {
      expect(() => prepareNonceCandidate({ currentUnixMilliseconds: 1n, highestObservedNonce })).toThrow();
    },
  );

  it("rejects a clock outside the supported 19-digit nonce range", () => {
    expect(() => prepareNonceCandidate({ currentUnixMilliseconds: -1n })).toThrowError(
      expect.objectContaining({ code: "INVALID_CLOCK" }),
    );
    expect(() => prepareNonceCandidate({ currentUnixMilliseconds: 10_000_000_000_000_000_000n })).toThrowError(
      expect.objectContaining({ code: "INVALID_CLOCK" }),
    );
  });

  it("isolates reservations by DID and room and prevents local reuse", () => {
    const reservations = new SessionNonceReservations();
    expect(reservations.reserveNext(ZERO_SEED_DID, "lobby", undefined, fixedClock(100n))).toBe("100");
    expect(reservations.reserveNext(ZERO_SEED_DID, "lobby", undefined, fixedClock(100n))).toBe("101");
    expect(reservations.reserveNext(ZERO_SEED_DID, "other-room", undefined, fixedClock(100n))).toBe("100");
    expect(reservations.reserveNext(OTHER_DID, "lobby", undefined, fixedClock(100n))).toBe("100");
  });

  it("previews the same exact candidate that will be reserved and advances across shared consumers", () => {
    const reservations = new SessionNonceReservations();
    expect(reservations.previewNext(ZERO_SEED_DID, "lobby", "9007199254740992", fixedClock(100n))).toBe("9007199254740993");
    expect(reservations.reserveNext(ZERO_SEED_DID, "lobby", "9007199254740992", fixedClock(100n))).toBe("9007199254740993");
    expect(reservations.previewNext(ZERO_SEED_DID, "lobby", undefined, fixedClock(100n))).toBe("9007199254740994");
    expect(reservations.reserveNext(ZERO_SEED_DID, "lobby", undefined, fixedClock(100n))).toBe("9007199254740994");
  });
});

describe("V12-02 hard boundaries", () => {
  it("contains no persistence, network request, write endpoint, or publish capability", () => {
    const sources = [
      new URL("../../lib/signing/nonce.ts", import.meta.url),
      new URL("../../lib/signing/types.ts", import.meta.url),
      new URL("../../lib/signing/index.ts", import.meta.url),
      new URL("../../lib/identity/identity.ts", import.meta.url),
    ].map((url) => readFileSync(url, "utf8")).join("\n");
    expect(sources).not.toMatch(
      /localStorage|sessionStorage|indexedDB|document\.cookie|fetch\s*\(|XMLHttpRequest|\/say(?:-signed)?|publish(?:Message)?\s*\(/,
    );
  });
});
