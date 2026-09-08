import type { EvidenceActivityEntry } from "../evidence-activity";
import { EVIDENCE_RECEIPT_SCHEMA } from "../receipt";
import { createContributionReceipt, createContributionRecord, createDirectContributionRecord, serializeContributionRecord, type ContributionEvidenceReceipt, type PublicContributionRecord } from "./contribution";

export const PERSISTED_CONTRIBUTION_LIMIT = 50;

export interface PersistedContribution {
  readonly id: string;
  readonly contribution: PublicContributionRecord;
  readonly room: "lobby";
  readonly sequence: string;
  readonly status: "SIGNATURE_VERIFIED";
  readonly receipt: ContributionEvidenceReceipt;
}

function identity(room: string, did: string, sequence: string): string {
  return [room, did, sequence].join("\u0000");
}

export function qualifyContributionEvidence(entry: EvidenceActivityEntry): PersistedContribution | undefined {
  if (entry.source !== "READBACK_VERIFIED" || entry.verdict !== "VALID" || entry.observationState !== "PUBLISHED_AND_VERIFIED" || !entry.sequence || !entry.receipt ||
    entry.receipt.schema !== EVIDENCE_RECEIPT_SCHEMA || entry.receipt.evidenceVerdict !== "VALID" || entry.receipt.source.room !== entry.room || (entry.receipt.source.did !== undefined && entry.receipt.source.did !== entry.writer) || entry.receipt.source.sequence !== entry.sequence) return undefined;
  let raw: unknown;
  try { raw = JSON.parse(entry.text) as unknown; } catch { return undefined; }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const item = raw as Record<string, unknown>;
  try {
    const first = item.first_record;
    const contribution = item.type === "agent-card" && first && typeof first === "object" && !Array.isArray(first)
      ? createContributionRecord({ did: String(item.did ?? ""), displayName: String(item.display_name ?? ""), xPostUrl: String(item.x_post_url ?? ""), firstRoom: String((first as Record<string, unknown>).room ?? "") as "lobby", firstSeq: String((first as Record<string, unknown>).seq ?? "") })
      : item.type === "x-reference" ? createDirectContributionRecord({ did: String(item.did ?? ""), xPostUrl: String(item.x_post_url ?? "") }) : undefined;
    if (!contribution) return undefined;
    if (item.schema !== contribution.schema || item.type !== contribution.type || item.product !== contribution.product || serializeContributionRecord(contribution) !== entry.text || contribution.did !== entry.writer || entry.room !== "lobby") return undefined;
    const receipt = createContributionReceipt({ contribution, sequence: entry.sequence, protocolEvidence: entry.receipt });
    return Object.freeze({ id: identity(entry.room, entry.writer, entry.sequence), contribution, room: "lobby", sequence: entry.sequence, status: "SIGNATURE_VERIFIED", receipt });
  } catch { return undefined; }
}

export function addPersistedContribution(entries: readonly PersistedContribution[], candidate: PersistedContribution | undefined): readonly PersistedContribution[] {
  if (!candidate || entries.some((entry) => entry.id === candidate.id)) return entries;
  return [...entries, candidate].slice(-PERSISTED_CONTRIBUTION_LIMIT);
}

export function rebuildPersistedContributions(evidence: readonly EvidenceActivityEntry[]): readonly PersistedContribution[] {
  return evidence.reduce<readonly PersistedContribution[]>((entries, item) => addPersistedContribution(entries, qualifyContributionEvidence(item)), []);
}
