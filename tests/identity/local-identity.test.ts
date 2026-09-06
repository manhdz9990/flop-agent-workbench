import { readFileSync } from "node:fs";

import { base64urlnopad } from "@scure/base";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  AGENT_BACKUP_FORMAT,
  BACKUP_KDF_ITERATIONS,
  generateLocalIdentity,
  importEncryptedIdentity,
  parseAgentBackup,
} from "../../lib/identity";
import { decodeEd25519DidKey } from "../../lib/protocol";

const PASSPHRASE = "correct horse battery staple";
const ZERO_SEED_DID = "did:key:z6MkiTBz1ymuepAQ4HEHYSF1H8quG5GLVVQR3djdX3mDooWp";

afterEach(() => vi.restoreAllMocks());

function mutateBase64url(value: string): string {
  return `${value[0] === "A" ? "B" : "A"}${value.slice(1)}`;
}

function deterministicRandom<T extends ArrayBufferView | null>(array: T): T {
  if (array instanceof Uint8Array) array.fill(array.byteLength === 32 ? 0 : 1);
  return array;
}

async function encryptArbitraryPayload(payload: Uint8Array, did: string): Promise<string> {
  const salt = new Uint8Array(16).fill(1);
  const iv = new Uint8Array(12).fill(2);
  const passphraseBytes = new TextEncoder().encode(PASSPHRASE);
  try {
    const material = await crypto.subtle.importKey("raw", passphraseBytes, "PBKDF2", false, ["deriveKey"]);
    const key = await crypto.subtle.deriveKey(
      { name: "PBKDF2", hash: "SHA-256", salt, iterations: BACKUP_KDF_ITERATIONS },
      material,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt"],
    );
    const ciphertext = new Uint8Array(
      await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new Uint8Array(payload)),
    );
    return JSON.stringify({
      format: AGENT_BACKUP_FORMAT,
      did,
      kdf: { name: "PBKDF2", hash: "SHA-256", iterations: BACKUP_KDF_ITERATIONS, salt: base64urlnopad.encode(salt) },
      cipher: { name: "AES-GCM", keyLength: 256, iv: base64urlnopad.encode(iv) },
      ciphertext: base64urlnopad.encode(ciphertext),
    });
  } finally {
    passphraseBytes.fill(0);
  }
}

describe("browser-local identity", () => {
  it("generates exactly 32 bytes through browser cryptographic randomness", async () => {
    const random = vi.spyOn(crypto, "getRandomValues");

    const identity = await generateLocalIdentity();
    expect(random).toHaveBeenCalledTimes(1);
    expect(random.mock.calls[0]?.[0]).toBeInstanceOf(Uint8Array);
    expect(random.mock.calls[0]?.[0]?.byteLength).toBe(32);
    expect(decodeEd25519DidKey(identity.publicIdentity.did)).toHaveLength(32);
    identity.lock();
  });

  it("derives the stable Technocore-compatible DID for a fixed seed", async () => {
    vi.spyOn(crypto, "getRandomValues").mockImplementation(deterministicRandom);
    const identity = await generateLocalIdentity();
    expect(identity.publicIdentity.did).toBe(ZERO_SEED_DID);
    expect(decodeEd25519DidKey(identity.publicIdentity.did)).toEqual(
      base64urlnopad.decode(identity.publicIdentity.publicKey),
    );
    identity.lock();
  });

  it("keeps secret material out of the serializable public session model", async () => {
    const identity = await generateLocalIdentity();
    const serialized = JSON.stringify(identity);
    expect(serialized).toContain(identity.publicIdentity.did);
    expect(serialized).not.toContain("seed");
    expect(serialized).not.toContain("privateKey");
    expect(identity.backupVerificationStatus).toBe("NOT_VERIFIED");
    identity.lock();
    expect(identity.isLocked).toBe(true);
    await expect(identity.createEncryptedBackup(PASSPHRASE)).rejects.toMatchObject({ code: "IDENTITY_LOCKED" });
  });
});

describe("encrypted identity backup", () => {
  it("uses the canonical schema and verifies only after successful re-import", async () => {
    const identity = await generateLocalIdentity();
    const backup = await identity.createEncryptedBackup(PASSPHRASE);
    const envelope = parseAgentBackup(backup);

    expect(envelope).toEqual({
      format: AGENT_BACKUP_FORMAT,
      did: identity.publicIdentity.did,
      kdf: {
        name: "PBKDF2",
        hash: "SHA-256",
        iterations: 600_000,
        salt: expect.any(String),
      },
      cipher: { name: "AES-GCM", keyLength: 256, iv: expect.any(String) },
      ciphertext: expect.any(String),
    });
    expect(identity.backupVerificationStatus).toBe("NOT_VERIFIED");

    const restored = await importEncryptedIdentity(backup, PASSPHRASE);
    expect(restored.publicIdentity).toEqual(identity.publicIdentity);
    expect(restored.backupVerificationStatus).toBe("VERIFIED");
    identity.lock();
    restored.lock();
  });

  it("contains neither plaintext seed material nor the passphrase", async () => {
    vi.spyOn(crypto, "getRandomValues").mockImplementation(deterministicRandom);

    const identity = await generateLocalIdentity();
    const backup = await identity.createEncryptedBackup(PASSPHRASE);
    expect(backup).not.toContain(base64urlnopad.encode(new Uint8Array(32)));
    expect(backup).not.toContain(PASSPHRASE);
    expect(identity.publicIdentity.did).toBe(ZERO_SEED_DID);
    expect(JSON.stringify(identity.publicIdentity)).not.toContain("seed");
    identity.lock();
  });

  it("rejects a wrong passphrase and authenticated ciphertext tampering", async () => {
    const identity = await generateLocalIdentity();
    const backup = await identity.createEncryptedBackup(PASSPHRASE);
    await expect(importEncryptedIdentity(backup, "wrong passphrase")).rejects.toMatchObject({ code: "BACKUP_DECRYPTION_FAILED" });

    const envelope = JSON.parse(backup) as Record<string, unknown>;
    envelope.ciphertext = mutateBase64url(envelope.ciphertext as string);
    await expect(importEncryptedIdentity(JSON.stringify(envelope), PASSPHRASE)).rejects.toMatchObject({ code: "BACKUP_DECRYPTION_FAILED" });
    identity.lock();
  });

  it.each(["salt", "iv"])("fails safely for malformed and tampered %s", async (field) => {
    const identity = await generateLocalIdentity();
    const backup = await identity.createEncryptedBackup(PASSPHRASE);
    const malformed = JSON.parse(backup) as { kdf: { salt: string }; cipher: { iv: string } };
    if (field === "salt") malformed.kdf.salt = "not+base64url";
    else malformed.cipher.iv = "not+base64url";
    await expect(importEncryptedIdentity(JSON.stringify(malformed), PASSPHRASE)).rejects.toMatchObject({ code: "INVALID_BACKUP" });

    const tampered = JSON.parse(backup) as { kdf: { salt: string }; cipher: { iv: string } };
    if (field === "salt") tampered.kdf.salt = mutateBase64url(tampered.kdf.salt);
    else tampered.cipher.iv = mutateBase64url(tampered.cipher.iv);
    await expect(importEncryptedIdentity(JSON.stringify(tampered), PASSPHRASE)).rejects.toMatchObject({ code: "BACKUP_DECRYPTION_FAILED" });
    identity.lock();
  });

  it("rejects malformed JSON, unsupported versions, and extra fields", () => {
    expect(() => parseAgentBackup("{" )).toThrowError(expect.objectContaining({ code: "INVALID_BACKUP" }));
    expect(() => parseAgentBackup(JSON.stringify({ format: "technocore-agent-backup/v2" }))).toThrowError(
      expect.objectContaining({ code: "UNSUPPORTED_BACKUP_VERSION" }),
    );
    expect(() => parseAgentBackup(JSON.stringify({
      format: AGENT_BACKUP_FORMAT,
      did: ZERO_SEED_DID,
      kdf: {},
      cipher: {},
      ciphertext: "AA",
      privatePath: "C:/secret",
    }))).toThrowError(expect.objectContaining({ code: "INVALID_BACKUP" }));
  });

  it("rejects missing or manipulated KDF/cipher metadata before expensive key derivation", async () => {
    const identity = await generateLocalIdentity();
    const backup = await identity.createEncryptedBackup(PASSPHRASE);
    const canonical = JSON.parse(backup) as Record<string, unknown>;
    const deriveKey = vi.spyOn(crypto.subtle, "deriveKey");
    deriveKey.mockClear();

    const variants: Record<string, unknown>[] = [];
    const missingCiphertext = structuredClone(canonical);
    delete missingCiphertext.ciphertext;
    variants.push(missingCiphertext);
    const changedIterations = structuredClone(canonical);
    (changedIterations.kdf as Record<string, unknown>).iterations = BACKUP_KDF_ITERATIONS - 1;
    variants.push(changedIterations);
    const changedHash = structuredClone(canonical);
    (changedHash.kdf as Record<string, unknown>).hash = "SHA-1";
    variants.push(changedHash);
    const changedCipher = structuredClone(canonical);
    (changedCipher.cipher as Record<string, unknown>).name = "AES-CBC";
    variants.push(changedCipher);
    const changedKeyLength = structuredClone(canonical);
    (changedKeyLength.cipher as Record<string, unknown>).keyLength = 128;
    variants.push(changedKeyLength);

    for (const variant of variants) {
      await expect(importEncryptedIdentity(JSON.stringify(variant), PASSPHRASE)).rejects.toMatchObject({ code: "INVALID_BACKUP" });
    }
    expect(deriveKey).not.toHaveBeenCalled();
    identity.lock();
  });

  it("rejects oversized input before invoking key derivation", async () => {
    const deriveKey = vi.spyOn(crypto.subtle, "deriveKey");
    await expect(importEncryptedIdentity("x".repeat(16 * 1024 + 1), PASSPHRASE)).rejects.toMatchObject({ code: "INVALID_BACKUP" });
    expect(deriveKey).not.toHaveBeenCalled();
  });

  it("rejects decrypted payloads that are not exactly a 32-byte seed", async () => {
    const backup = await encryptArbitraryPayload(new Uint8Array(31), ZERO_SEED_DID);
    await expect(importEncryptedIdentity(backup, PASSPHRASE)).rejects.toMatchObject({ code: "INVALID_BACKUP_SEED" });
  });

  it("rejects a valid but mismatched envelope DID", async () => {
    const backup = await encryptArbitraryPayload(new Uint8Array(32), "did:key:z6MkkEfVktyKdqhhEyzYpotus29DcWpqrwoC29xTaKzfcUeb");
    await expect(importEncryptedIdentity(backup, PASSPHRASE)).rejects.toMatchObject({ code: "BACKUP_DID_MISMATCH" });
  });
});

describe("V12-01 forbidden capabilities", () => {
  it("contains no storage persistence or network-write capability", () => {
    const sources = ["backup.ts", "identity.ts", "index.ts", "types.ts"]
      .map((name) => readFileSync(new URL(`../../lib/identity/${name}`, import.meta.url), "utf8"))
      .join("\n");
    expect(sources).not.toMatch(/localStorage|sessionStorage|indexedDB|document\.cookie|fetch\s*\(|XMLHttpRequest|\/say(?:-signed)?/);
  });
});
