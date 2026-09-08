import { parseAgentBackup, type BackupVerificationStatus, type PublicIdentity } from "../identity";
import { base64urlnopad } from "@scure/base";
import { decodeEd25519DidKey } from "../protocol";
import type { EvidenceActivityEntry } from "../evidence-activity";
import { validateAgentProfile, type AgentProfile } from "../onboarding";

export const PERSISTENT_AGENT_STORAGE_KEY = "flop.workbench.persistent-agent.v1";
export const PERSISTENT_AGENT_SCHEMA = "flop-persistent-agent/v1" as const;

export interface PersistentAgentRecord {
  readonly schema: typeof PERSISTENT_AGENT_SCHEMA;
  readonly encryptedBackup: string;
  readonly publicIdentity: PublicIdentity;
  readonly backupVerificationStatus: BackupVerificationStatus;
  readonly profile?: AgentProfile;
  readonly evidence: readonly EvidenceActivityEntry[];
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Saved Agent has an invalid shape.");
  return value as Record<string, unknown>;
}

function safeEvidence(value: unknown, did: string): readonly EvidenceActivityEntry[] {
  if (!Array.isArray(value) || value.length > 250) throw new Error("Saved Agent evidence is invalid.");
  return value.map((candidate) => {
    const item = object(candidate);
    if (typeof item.id !== "string" || item.id.length > 512 || (item.source !== "ROOM_OBSERVED" && item.source !== "READBACK_VERIFIED") ||
      (item.verdict !== "VALID" && item.verdict !== "INVALID" && item.verdict !== "UNVERIFIABLE") || typeof item.room !== "string" || item.room.length > 128 ||
      typeof item.writer !== "string" || item.writer.length > 128 || typeof item.text !== "string" || item.text.length > 16_384 ||
      (item.observationState !== "OBSERVED" && item.observationState !== "PUBLISHED_AND_VERIFIED") ||
      (item.source === "READBACK_VERIFIED" && (item.writer !== did || item.observationState !== "PUBLISHED_AND_VERIFIED" || item.verdict !== "VALID"))) {
      throw new Error("Saved Agent evidence is invalid.");
    }
    return Object.freeze({ ...item }) as unknown as EvidenceActivityEntry;
  });
}

export function parsePersistentAgent(serialized: string): PersistentAgentRecord {
  if (new TextEncoder().encode(serialized).length > 256 * 1024) throw new Error("Saved Agent exceeds the allowed size.");
  const root = object(JSON.parse(serialized) as unknown);
  if (root.schema !== PERSISTENT_AGENT_SCHEMA || typeof root.encryptedBackup !== "string" || (root.backupVerificationStatus !== "NOT_VERIFIED" && root.backupVerificationStatus !== "VERIFIED")) throw new Error("Saved Agent version is unsupported.");
  const envelope = parseAgentBackup(root.encryptedBackup);
  const identity = object(root.publicIdentity);
  if (identity.did !== envelope.did || typeof identity.publicKey !== "string" || identity.publicKey !== base64urlnopad.encode(decodeEd25519DidKey(envelope.did))) throw new Error("Saved Agent identity does not match its encrypted backup.");
  let profile: AgentProfile | undefined;
  if (root.profile !== undefined) {
    const candidate = object(root.profile);
    if (typeof candidate.displayName !== "string" || (candidate.xUsername !== undefined && typeof candidate.xUsername !== "string") || (candidate.description !== undefined && typeof candidate.description !== "string")) throw new Error("Saved Agent profile is invalid.");
    profile = validateAgentProfile({ displayName: candidate.displayName, ...(typeof candidate.xUsername === "string" ? { xUsername: candidate.xUsername } : {}), ...(typeof candidate.description === "string" ? { description: candidate.description } : {}) });
  }
  return Object.freeze({ schema: PERSISTENT_AGENT_SCHEMA, encryptedBackup: root.encryptedBackup, publicIdentity: Object.freeze({ did: envelope.did, publicKey: identity.publicKey }), backupVerificationStatus: root.backupVerificationStatus, ...(profile ? { profile } : {}), evidence: safeEvidence(root.evidence, envelope.did) });
}

export function loadPersistentAgent(storage: StorageLike): PersistentAgentRecord | undefined {
  const serialized = storage.getItem(PERSISTENT_AGENT_STORAGE_KEY);
  if (serialized === null) return undefined;
  return parsePersistentAgent(serialized);
}

export function savePersistentAgent(storage: StorageLike, value: PersistentAgentRecord): void {
  storage.setItem(PERSISTENT_AGENT_STORAGE_KEY, JSON.stringify(parsePersistentAgent(JSON.stringify(value))));
}

export function removePersistentAgent(storage: StorageLike): void {
  storage.removeItem(PERSISTENT_AGENT_STORAGE_KEY);
}
