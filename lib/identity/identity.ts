import { getPublicKeyAsync, signAsync } from "@noble/ed25519";
import { base64urlnopad } from "@scure/base";

import { canonicalSignedPayload, encodeEd25519DidKey, sweepSingleLine, verifyProtocolRecord } from "../protocol";
import {
  LOCAL_SIGNING_STATE,
  SigningPreparationError,
  type NonceClock,
  type PreparedSignedMessage,
  type PrepareSignedMessageInput,
  type SessionNonceReservations,
} from "../signing";
import { decryptSeedBackup, encryptSeedBackup, parseAgentBackup } from "./backup";
import {
  IdentityBackupError,
  OWNER_SECRET_REVEAL_AUTHORIZATION,
  type BackupVerificationStatus,
  type LocalIdentitySession,
  type PublicIdentity,
} from "./types";

async function derivePublicIdentity(seed: Uint8Array): Promise<PublicIdentity> {
  if (seed.length !== 32) {
    throw new IdentityBackupError("INVALID_BACKUP_SEED", "Identity seed length is invalid.");
  }
  const publicKey = await getPublicKeyAsync(seed);
  return Object.freeze({
    did: encodeEd25519DidKey(publicKey),
    publicKey: base64urlnopad.encode(publicKey),
  });
}

export async function importRawSeedIdentity(seed: Uint8Array): Promise<LocalIdentitySession> {
  if (seed.length !== 32) throw new IdentityBackupError("INVALID_BACKUP_SEED", "Identity seed length is invalid.");
  const copy = seed.slice();
  try { return new SessionIdentity(copy, await derivePublicIdentity(copy), "NOT_VERIFIED"); }
  finally { copy.fill(0); }
}

class SessionIdentity implements LocalIdentitySession {
  readonly publicIdentity: PublicIdentity;
  readonly backupVerificationStatus: BackupVerificationStatus;
  #seed: Uint8Array | null;

  constructor(seed: Uint8Array, publicIdentity: PublicIdentity, status: BackupVerificationStatus) {
    this.#seed = seed.slice();
    this.publicIdentity = publicIdentity;
    this.backupVerificationStatus = status;
  }

  get isLocked(): boolean {
    return this.#seed === null;
  }

  revealSecretKeyHex(authorization: typeof OWNER_SECRET_REVEAL_AUTHORIZATION): string {
    if (authorization !== OWNER_SECRET_REVEAL_AUTHORIZATION) {
      throw new IdentityBackupError("SECRET_REVEAL_NOT_AUTHORIZED", "Explicit owner confirmation is required.");
    }
    if (this.#seed === null) {
      throw new IdentityBackupError("IDENTITY_LOCKED", "Identity session is locked.");
    }
    return Array.from(this.#seed, (byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  async createEncryptedBackup(passphrase: string): Promise<string> {
    if (this.#seed === null) {
      throw new IdentityBackupError("IDENTITY_LOCKED", "Identity session is locked.");
    }
    return encryptSeedBackup(this.#seed, this.publicIdentity.did, passphrase);
  }

  async prepareSignedMessage(
    input: PrepareSignedMessageInput,
    reservations: SessionNonceReservations,
    clock?: NonceClock,
  ): Promise<PreparedSignedMessage> {
    if (this.#seed === null) {
      throw new IdentityBackupError("IDENTITY_LOCKED", "Identity session is locked.");
    }

    const text = sweepSingleLine(input.text);
    const nonce = reservations.reserveNext(
      this.publicIdentity.did,
      input.room,
      input.highestObservedNonce,
      clock,
    );
    const payload = canonicalSignedPayload(input.room, nonce, text);
    const signature = base64urlnopad.encode(await signAsync(payload, this.#seed));
    const verified = await verifyProtocolRecord(input.room, {
      from: this.publicIdentity.did,
      nonce,
      text,
      sig: signature,
    });
    if (verified !== "VALID") {
      throw new SigningPreparationError("SELF_VERIFICATION_FAILED", "Local signature self-verification failed.");
    }

    return Object.freeze({
      state: LOCAL_SIGNING_STATE,
      room: input.room,
      did: this.publicIdentity.did,
      nonce,
      text,
      canonicalPayload: new TextDecoder().decode(payload),
      signature,
    });
  }

  lock(): void {
    this.#seed?.fill(0);
    this.#seed = null;
  }
}

function cryptoRandomSeed(): Uint8Array {
  if (!globalThis.crypto || typeof globalThis.crypto.getRandomValues !== "function") {
    throw new IdentityBackupError("CRYPTO_UNAVAILABLE", "Browser cryptography is unavailable.");
  }
  return globalThis.crypto.getRandomValues(new Uint8Array(32));
}

export async function generateLocalIdentity(): Promise<LocalIdentitySession> {
  const seed = cryptoRandomSeed();
  try {
    const publicIdentity = await derivePublicIdentity(seed);
    return new SessionIdentity(seed, publicIdentity, "NOT_VERIFIED");
  } finally {
    seed.fill(0);
  }
}

export async function importEncryptedIdentity(
  serializedBackup: string,
  passphrase: string,
): Promise<LocalIdentitySession> {
  const envelope = parseAgentBackup(serializedBackup);
  const seed = await decryptSeedBackup(envelope, passphrase);
  try {
    const publicIdentity = await derivePublicIdentity(seed);
    if (publicIdentity.did !== envelope.did) {
      throw new IdentityBackupError("BACKUP_DID_MISMATCH", "Backup identity does not match its public DID.");
    }
    return new SessionIdentity(seed, publicIdentity, "VERIFIED");
  } finally {
    seed.fill(0);
  }
}
