export const AGENT_BACKUP_FORMAT = "technocore-agent-backup/v1" as const;
export const BACKUP_KDF_ITERATIONS = 600_000 as const;

export interface PublicIdentity {
  readonly did: string;
  readonly publicKey: string;
}

export type BackupVerificationStatus = "NOT_VERIFIED" | "VERIFIED";

export interface AgentBackupEnvelope {
  readonly format: typeof AGENT_BACKUP_FORMAT;
  readonly did: string;
  readonly kdf: {
    readonly name: "PBKDF2";
    readonly hash: "SHA-256";
    readonly iterations: typeof BACKUP_KDF_ITERATIONS;
    readonly salt: string;
  };
  readonly cipher: {
    readonly name: "AES-GCM";
    readonly keyLength: 256;
    readonly iv: string;
  };
  readonly ciphertext: string;
}

export interface LocalIdentitySession {
  readonly publicIdentity: PublicIdentity;
  readonly backupVerificationStatus: BackupVerificationStatus;
  readonly isLocked: boolean;
  createEncryptedBackup(passphrase: string): Promise<string>;
  prepareSignedMessage(
    input: PrepareSignedMessageInput,
    reservations: SessionNonceReservations,
    clock?: NonceClock,
  ): Promise<PreparedSignedMessage>;
  lock(): void;
}

export type IdentityBackupErrorCode =
  | "CRYPTO_UNAVAILABLE"
  | "IDENTITY_LOCKED"
  | "INVALID_PASSPHRASE"
  | "INVALID_BACKUP"
  | "UNSUPPORTED_BACKUP_VERSION"
  | "BACKUP_DECRYPTION_FAILED"
  | "INVALID_BACKUP_SEED"
  | "BACKUP_DID_MISMATCH";

export class IdentityBackupError extends Error {
  constructor(
    readonly code: IdentityBackupErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "IdentityBackupError";
  }
}
import type {
  NonceClock,
  PreparedSignedMessage,
  PrepareSignedMessageInput,
  SessionNonceReservations,
} from "../signing";
