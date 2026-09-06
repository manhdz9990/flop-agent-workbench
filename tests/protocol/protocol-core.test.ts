import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  canonicalSignedPayload,
  decodeCanonicalSignature,
  decodeEd25519DidKey,
  parseRoomClasses,
  ProtocolInputError,
  sweepSingleLine,
  verifyProtocolRecord,
  type ProtocolRecord,
} from "../../lib/protocol";

interface Fixture {
  room: string;
  record: Required<ProtocolRecord>;
}

const fixture = JSON.parse(
  readFileSync(new URL("../fixtures/protocol/known-good.json", import.meta.url), "utf8"),
) as Fixture;

describe("official single-line sweep", () => {
  it("C02 replaces every locked Unicode category and trims", () => {
    expect(sweepSingleLine("\u0000\u200d\ud800\ue000\u2028\u2029 visible \u000a")).toBe("visible");
    expect(sweepSingleLine("a\u0000b\u200dc\ud800d\ue000e\u2028f\u2029g")).toBe("a b c d e f g");
  });

  it("C03 preserves distinct NFC and NFD bytes", () => {
    const nfc = sweepSingleLine("caf\u00e9");
    const nfd = sweepSingleLine("cafe\u0301");
    expect(nfc).not.toBe(nfd);
    expect(canonicalSignedPayload("lobby", "1", nfc)).not.toEqual(canonicalSignedPayload("lobby", "1", nfd));
  });
});

describe("canonical encodings", () => {
  it("builds exact UTF-8 bytes and retains all nonce digits", () => {
    expect(new TextDecoder().decode(canonicalSignedPayload(fixture.room, fixture.record.nonce, fixture.record.text))).toBe(
      `${fixture.room}|${fixture.record.nonce}|${fixture.record.text}`,
    );
  });

  it("accepts only a canonical 32-byte Ed25519 did:key", () => {
    expect(decodeEd25519DidKey(fixture.record.from)).toHaveLength(32);
    expect(() => decodeEd25519DidKey("did:key:z6LSunsupported")).toThrow(ProtocolInputError);
    expect(() => decodeEd25519DidKey(`${fixture.record.from}1`)).toThrow(ProtocolInputError);
  });

  it.each(["", "Uppercase", "a.b", "a/room", "a".repeat(49)])(
    "enforces the official name grammar for %j",
    (room) => {
      expect(() => canonicalSignedPayload(room, "1", "text")).toThrowError(
        expect.objectContaining({ code: "INVALID_NAME" }),
      );
    },
  );

  it.each(["", "-1", "1.0", " 1", "12345678901234567890"])(
    "keeps invalid nonce text out of canonical bytes for %j",
    (nonce) => {
      expect(() => canonicalSignedPayload("lobby", nonce, "text")).toThrowError(
        expect.objectContaining({ code: "INVALID_NONCE" }),
      );
    },
  );

  it("accepts only canonical unpadded 64-byte signatures", () => {
    expect(decodeCanonicalSignature(fixture.record.sig)).toHaveLength(64);
    expect(decodeCanonicalSignature(`${fixture.record.sig}=`)).toBeNull();
    expect(decodeCanonicalSignature(`${fixture.record.sig.slice(0, -1)}B`)).toBeNull();
  });
});

describe("evidence verdicts", () => {
  it("V01/C04 verifies an independent 19-digit known-good fixture", async () => {
    expect(BigInt(fixture.record.nonce)).toBeGreaterThan(BigInt(Number.MAX_SAFE_INTEGER));
    await expect(verifyProtocolRecord(fixture.room, fixture.record)).resolves.toBe("VALID");
  });

  it.each([
    ["V02 text", fixture.room, { ...fixture.record, text: `${fixture.record.text}!` }],
    ["V03 room", "other-room", fixture.record],
    ["V04 nonce", fixture.room, { ...fixture.record, nonce: "1788454091844223021" }],
  ])("%s mutation is INVALID", async (_label, room, record) => {
    await expect(verifyProtocolRecord(room, record)).resolves.toBe("INVALID");
  });

  it("V05 classifies malformed/noncanonical signatures as UNVERIFIABLE", async () => {
    await expect(verifyProtocolRecord(fixture.room, { ...fixture.record, sig: `${fixture.record.sig}=` })).resolves.toBe("UNVERIFIABLE");
  });

  it("V06 reports malformed/unsupported DIDs as operational input errors", async () => {
    await expect(verifyProtocolRecord(fixture.room, { ...fixture.record, from: "did:key:z6LSunsupported" })).rejects.toMatchObject({ code: "INVALID_DID" });
  });

  it("a different structurally valid DID cannot verify the fixture", async () => {
    await expect(
      verifyProtocolRecord(fixture.room, {
        ...fixture.record,
        from: "did:key:z6MkkEfVktyKdqhhEyzYpotus29DcWpqrwoC29xTaKzfcUeb",
      }),
    ).resolves.toBe("INVALID");
  });

  it("V07 classifies unsigned activity as UNSIGNED", async () => {
    await expect(verifyProtocolRecord("lobby", { from: "alice", text: "hello" })).resolves.toBe("UNSIGNED");
  });

  it("V08 classifies legacy signed evidence without retained sig as UNVERIFIABLE", async () => {
    const legacy: ProtocolRecord = { ...fixture.record, sig: undefined };
    await expect(verifyProtocolRecord(fixture.room, legacy)).resolves.toBe("UNVERIFIABLE");
  });

  it("C01 excludes seq and ts from verification", async () => {
    await expect(verifyProtocolRecord(fixture.room, { ...fixture.record, seq: "changed", ts: "changed" })).resolves.toBe("VALID");
  });
});

describe("composable room classes", () => {
  it.each([
    ["p-secret", ["p"]],
    ["mb-p-inbox", ["mb", "p"]],
    ["e-p-short", ["e", "p"]],
    ["d-mb-p-owned-inbox", ["d", "mb", "p"]],
    ["pastel", []],
    ["mb-topic-p-later", ["mb"]],
  ])("R01 parses %s", (room, expected) => {
    const parsed = parseRoomClasses(room);
    expect([...parsed.markers]).toEqual(expected);
    expect(parsed.unlisted).toBe(expected.includes("p"));
    expect(parsed.mailbox).toBe(expected.includes("mb"));
    expect(parsed.ownable).toBe(expected.includes("d"));
    expect(parsed.ephemeral).toBe(expected.includes("e"));
  });
});
