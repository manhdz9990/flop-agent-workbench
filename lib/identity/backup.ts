import { base64urlnopad } from "@scure/base";

import { decodeEd25519DidKey } from "../protocol";
import {
  AGENT_BACKUP_FORMAT,
  BACKUP_KDF_ITERATIONS,
  IdentityBackupError,
  type AgentBackupEnvelope,
} from "./types";

const MAX_BACKUP_BYTES = 16 * 1024;
const MAX_PASSPHRASE_BYTES = 1024;
const MAX_CIPHERTEXT_BYTES = 256;
const BASE64URL_PATTERN = /^[A-Za-z0-9_-]+$/;
const textEncoder = new TextEncoder();

function browserCrypto(): Crypto {
  if (!globalThis.crypto?.subtle || typeof globalThis.crypto.getRandomValues !== "function") {
    throw new IdentityBackupError("CRYPTO_UNAVAILABLE", "Browser cryptography is unavailable.");
  }
  return globalThis.crypto;
}

function assertExactKeys(value: Record<string, unknown>, expected: readonly string[]): void {
  const keys = Object.keys(value).sort();
  const required = [...expected].sort();
  if (keys.length !== required.length || keys.some((key, index) => key !== required[index])) {
    throw new IdentityBackupError("INVALID_BACKUP", "Backup has an invalid shape.");
  }
}

function recordValue(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new IdentityBackupError("INVALID_BACKUP", "Backup has an invalid shape.");
  }
  return value as Record<string, unknown>;
}

function decodeCanonical(value: unknown, expectedLength?: number): Uint8Array {
  if (typeof value !== "string" || !BASE64URL_PATTERN.test(value) || value.length > 512) {
    throw new IdentityBackupError("INVALID_BACKUP", "Backup contains invalid encoded data.");
  }
  try {
    const decoded = base64urlnopad.decode(value);
    if (base64urlnopad.encode(decoded) !== value || (expectedLength !== undefined && decoded.length !== expectedLength)) {
      throw new Error("noncanonical or unexpected length");
    }
    return decoded;
  } catch {
    throw new IdentityBackupError("INVALID_BACKUP", "Backup contains invalid encoded data.");
  }
}

export function parseAgentBackup(serialized: string): AgentBackupEnvelope {
  if (textEncoder.encode(serialized).length > MAX_BACKUP_BYTES) {
    throw new IdentityBackupError("INVALID_BACKUP", "Backup exceeds the allowed size.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(serialized);
  } catch {
    throw new IdentityBackupError("INVALID_BACKUP", "Backup is not valid JSON.");
  }

  const envelope = recordValue(parsed);
  if (envelope.format !== AGENT_BACKUP_FORMAT) {
    throw new IdentityBackupError("UNSUPPORTED_BACKUP_VERSION", "Backup format is unsupported.");
  }
  assertExactKeys(envelope, ["format", "did", "kdf", "cipher", "ciphertext"]);
  if (typeof envelope.did !== "string" || envelope.did.length > 100) {
    throw new IdentityBackupError("INVALID_BACKUP", "Backup DID is invalid.");
  }
  try {
    decodeEd25519DidKey(envelope.did);
  } catch {
    throw new IdentityBackupError("INVALID_BACKUP", "Backup DID is invalid.");
  }

  const kdf = recordValue(envelope.kdf);
  assertExactKeys(kdf, ["name", "hash", "iterations", "salt"]);
  if (kdf.name !== "PBKDF2" || kdf.hash !== "SHA-256" || kdf.iterations !== BACKUP_KDF_ITERATIONS) {
    throw new IdentityBackupError("INVALID_BACKUP", "Backup key-derivation parameters are invalid.");
  }
  decodeCanonical(kdf.salt, 16);

  const cipher = recordValue(envelope.cipher);
  assertExactKeys(cipher, ["name", "keyLength", "iv"]);
  if (cipher.name !== "AES-GCM" || cipher.keyLength !== 256) {
    throw new IdentityBackupError("INVALID_BACKUP", "Backup cipher parameters are invalid.");
  }
  decodeCanonical(cipher.iv, 12);
  const ciphertext = decodeCanonical(envelope.ciphertext);
  if (ciphertext.length < 17 || ciphertext.length > MAX_CIPHERTEXT_BYTES) {
    throw new IdentityBackupError("INVALID_BACKUP", "Backup ciphertext length is invalid.");
  }

  return envelope as unknown as AgentBackupEnvelope;
}

async function deriveBackupKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const crypto = browserCrypto();
  const passphraseBytes = textEncoder.encode(passphrase);
  if (passphraseBytes.length === 0 || passphraseBytes.length > MAX_PASSPHRASE_BYTES) {
    passphraseBytes.fill(0);
    throw new IdentityBackupError("INVALID_PASSPHRASE", "Passphrase must be between 1 and 1024 UTF-8 bytes.");
  }
  try {
    const material = await crypto.subtle.importKey("raw", passphraseBytes, "PBKDF2", false, ["deriveKey"]);
    return await crypto.subtle.deriveKey(
      { name: "PBKDF2", hash: "SHA-256", salt: new Uint8Array(salt), iterations: BACKUP_KDF_ITERATIONS },
      material,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"],
    );
  } finally {
    passphraseBytes.fill(0);
  }
}

export async function encryptSeedBackup(seed: Uint8Array, did: string, passphrase: string): Promise<string> {
  if (seed.length !== 32) {
    throw new IdentityBackupError("INVALID_BACKUP_SEED", "Identity seed length is invalid.");
  }
  const crypto = browserCrypto();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveBackupKey(passphrase, salt);
  const plaintext = seed.slice();
  try {
    const encrypted = new Uint8Array(
      await crypto.subtle.encrypt({ name: "AES-GCM", iv: new Uint8Array(iv) }, key, new Uint8Array(plaintext)),
    );
    const envelope: AgentBackupEnvelope = {
      format: AGENT_BACKUP_FORMAT,
      did,
      kdf: { name: "PBKDF2", hash: "SHA-256", iterations: BACKUP_KDF_ITERATIONS, salt: base64urlnopad.encode(salt) },
      cipher: { name: "AES-GCM", keyLength: 256, iv: base64urlnopad.encode(iv) },
      ciphertext: base64urlnopad.encode(encrypted),
    };
    return JSON.stringify(envelope, null, 2);
  } finally {
    plaintext.fill(0);
  }
}

export async function decryptSeedBackup(envelope: AgentBackupEnvelope, passphrase: string): Promise<Uint8Array> {
  const crypto = browserCrypto();
  const salt = decodeCanonical(envelope.kdf.salt, 16);
  const iv = decodeCanonical(envelope.cipher.iv, 12);
  const ciphertext = decodeCanonical(envelope.ciphertext);
  const key = await deriveBackupKey(passphrase, salt);
  let plaintext: Uint8Array;
  try {
    plaintext = new Uint8Array(
      await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: new Uint8Array(iv) },
        key,
        new Uint8Array(ciphertext),
      ),
    );
  } catch {
    throw new IdentityBackupError("BACKUP_DECRYPTION_FAILED", "Backup authentication or decryption failed.");
  }
  if (plaintext.length !== 32) {
    plaintext.fill(0);
    throw new IdentityBackupError("INVALID_BACKUP_SEED", "Decrypted identity seed is invalid.");
  }
  return plaintext;
}
