import { base64urlnopad } from "@scure/base";
import { describe, expect, it, vi } from "vitest";

import {
  createSecretKeyText,
  detectIdentityFormat,
  MAX_IDENTITY_FILE_BYTES,
  validateIdentityImport,
} from "../../lib/identity-portability";
import { importRawSeedIdentity, OWNER_SECRET_REVEAL_AUTHORIZATION } from "../../lib/identity";

const SEED_HEX = "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f";
const PASSWORD = "test-only-password";
const PKCS8_PREFIX = Uint8Array.from([0x30,0x2e,0x02,0x01,0x00,0x30,0x05,0x06,0x03,0x2b,0x65,0x70,0x04,0x22,0x04,0x20]);

function seedBytes(): Uint8Array {
  return Uint8Array.from(SEED_HEX.match(/../g)!, (pair) => Number.parseInt(pair, 16));
}

async function cryptoTeluguFixture(overrides: Record<string, unknown> = {}): Promise<string> {
  const identity = await importRawSeedIdentity(seedBytes());
  const salt = Uint8Array.from({ length: 16 }, (_, index) => index + 1);
  const iv = Uint8Array.from({ length: 12 }, (_, index) => index + 17);
  const password = new TextEncoder().encode(PASSWORD);
  const material = await crypto.subtle.importKey("raw", password, "PBKDF2", false, ["deriveKey"]);
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", hash: "SHA-256", iterations: 250000, salt },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"],
  );
  const plaintext = new Uint8Array(48);
  plaintext.set(PKCS8_PREFIX);
  plaintext.set(seedBytes(), PKCS8_PREFIX.length);
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext));
  const envelope = {
    version: 4,
    format: "cryptotelugu-technocore-browser-backup",
    algorithm: "Ed25519",
    did: identity.publicIdentity.did,
    publicKey: identity.publicIdentity.publicKey,
    kdf: "PBKDF2-SHA256",
    iterations: 250000,
    salt: base64urlnopad.encode(salt),
    iv: base64urlnopad.encode(iv),
    ciphertext: base64urlnopad.encode(ciphertext),
    ...overrides,
  };
  identity.lock();
  plaintext.fill(0);
  password.fill(0);
  return JSON.stringify(envelope);
}

describe("V13-02 identity portability", () => {
  it("detects plain Secret Keys with approved case and ASCII-whitespace normalization", () => {
    expect(detectIdentityFormat(SEED_HEX)).toMatchObject({ state: "SUPPORTED", format: "PLAIN_SECRET_HEX" });
    expect(detectIdentityFormat(`\t${SEED_HEX.toUpperCase()}\r\n`)).toMatchObject({ state: "SUPPORTED", format: "PLAIN_SECRET_HEX" });
  });

  it.each(["", "00", "g".repeat(64), `${SEED_HEX} extra`, `{\"seed\":\"${SEED_HEX}\"}`])(
    "rejects or refuses to guess invalid plain material: %s",
    (value) => expect(detectIdentityFormat(value).state).toBe("UNKNOWN"),
  );

  it("rejects oversized input before parsing", () => {
    expect(() => detectIdentityFormat("a".repeat(MAX_IDENTITY_FILE_BYTES + 1))).toThrow("32 KiB");
  });

  it("classifies unknown and malformed JSON without heuristic decryption", () => {
    expect(detectIdentityFormat("{bad json").state).toBe("UNKNOWN");
    expect(detectIdentityFormat('{"format":"something-else"}').state).toBe("UNKNOWN");
  });

  it("detects Workbench Backup V1 and reuses the existing decryptor", async () => {
    const original = await importRawSeedIdentity(seedBytes());
    const backup = await original.createEncryptedBackup(PASSWORD);
    expect(detectIdentityFormat(backup)).toMatchObject({ state: "SUPPORTED", format: "WORKBENCH_BACKUP_V1" });
    const restored = await validateIdentityImport(backup, PASSWORD);
    expect(restored.publicIdentity.did).toBe(original.publicIdentity.did);
    restored.session.lock(); original.lock();
  });

  it("exports only lowercase seed hex and reimports the same DID", async () => {
    const original = await importRawSeedIdentity(seedBytes());
    const artifact = createSecretKeyText(original.revealSecretKeyHex(OWNER_SECRET_REVEAL_AUTHORIZATION));
    expect(artifact).toEqual({ filename: "technocore-agent-secret.txt", content: `${SEED_HEX}\n` });
    const restored = await validateIdentityImport(artifact.content);
    expect(restored.publicIdentity.did).toBe(original.publicIdentity.did);
    expect(restored.session.backupVerificationStatus).toBe("NOT_VERIFIED");
    restored.session.lock(); original.lock();
  });

  it("detects and imports the independently verified CryptoTelugu V4 envelope", async () => {
    const serialized = await cryptoTeluguFixture();
    expect(detectIdentityFormat(serialized)).toMatchObject({ state: "SUPPORTED", format: "CRYPTOTELUGU_BACKUP_V4", requiresPassword: true });
    const candidate = await validateIdentityImport(serialized, PASSWORD);
    const expected = await importRawSeedIdentity(seedBytes());
    expect(candidate.publicIdentity).toEqual(expected.publicIdentity);
    expect(candidate.session.backupVerificationStatus).toBe("NOT_VERIFIED");
    candidate.session.lock(); expected.lock();
  });

  it.each([
    ["version", 3],
    ["algorithm", "X25519"],
  ])("detects known but unsupported CryptoTelugu %s", async (field, value) => {
    const serialized = await cryptoTeluguFixture({ [field]: value });
    expect(detectIdentityFormat(serialized).state).toBe("UNSUPPORTED");
  });

  it("rejects a wrong CryptoTelugu password without echoing it", async () => {
    const serialized = await cryptoTeluguFixture();
    const wrong = "do-not-echo-this-password";
    await expect(validateIdentityImport(serialized, wrong)).rejects.toSatisfy((error: Error) => !error.message.includes(wrong));
  });

  it("rejects corrupted authenticated ciphertext", async () => {
    const parsed = JSON.parse(await cryptoTeluguFixture()) as Record<string, unknown>;
    const ciphertext = base64urlnopad.decode(parsed.ciphertext as string);
    ciphertext[0] ^= 1;
    parsed.ciphertext = base64urlnopad.encode(ciphertext);
    await expect(validateIdentityImport(JSON.stringify(parsed), PASSWORD)).rejects.toMatchObject({ code: "IDENTITY_DECRYPTION_FAILED" });
  });

  it.each([
    ["did", "did:key:z6MkhWrong"],
    ["publicKey", base64urlnopad.encode(new Uint8Array(32).fill(7))],
  ])("rejects asserted CryptoTelugu %s mismatch", async (field, value) => {
    await expect(validateIdentityImport(await cryptoTeluguFixture({ [field]: value }), PASSWORD)).rejects.toMatchObject({ code: "IDENTITY_MISMATCH" });
  });

  it("does not fetch or persist while importing a raw Secret Key", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const candidate = await validateIdentityImport(SEED_HEX);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(JSON.stringify(candidate.session)).not.toContain(SEED_HEX);
    candidate.session.lock(); fetchSpy.mockRestore();
  });
});
