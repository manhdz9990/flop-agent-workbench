export { generateLocalIdentity, importEncryptedIdentity } from "./identity";
export { parseAgentBackup } from "./backup";
export { AGENT_BACKUP_FORMAT, BACKUP_KDF_ITERATIONS, OWNER_SECRET_REVEAL_AUTHORIZATION, IdentityBackupError } from "./types";
export type {
  AgentBackupEnvelope,
  BackupVerificationStatus,
  IdentityBackupErrorCode,
  LocalIdentitySession,
  PublicIdentity,
} from "./types";
