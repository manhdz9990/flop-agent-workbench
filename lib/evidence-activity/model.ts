import type { VerificationState } from "../domain";
import type { ReadbackResult } from "../readback";
import type { EvidenceReceipt } from "../receipt";
import type { RoomConversationMessage } from "../rooms-chat";
import type { PreparedSignedMessage } from "../signing";

export type EvidenceActivitySource = "ROOM_OBSERVED" | "READBACK_VERIFIED";

export interface EvidenceActivityEntry {
  readonly id: string;
  readonly source: EvidenceActivitySource;
  readonly verdict: VerificationState;
  readonly room: string;
  readonly writer: string;
  readonly text: string;
  readonly sequence?: string;
  readonly nonce?: string;
  readonly observationState: "OBSERVED" | "PUBLISHED_AND_VERIFIED";
  readonly receipt?: EvidenceReceipt;
}

function evidenceId(source: EvidenceActivitySource, room: string, writer: string, nonce: string | undefined, sequence: string | undefined): string {
  return [source, room, writer, nonce ?? "", sequence ?? ""].join("\u0000");
}

export function createRoomObservedEvidence(room: string, message: RoomConversationMessage): EvidenceActivityEntry {
  return Object.freeze({
    id: evidenceId("ROOM_OBSERVED", room, message.writer, message.nonce, message.sequence),
    source: "ROOM_OBSERVED",
    verdict: message.verdict,
    room,
    writer: message.writer,
    text: message.text,
    ...(message.sequence === undefined ? {} : { sequence: message.sequence }),
    ...(message.nonce === undefined ? {} : { nonce: message.nonce }),
    observationState: "OBSERVED",
  });
}

export function createVerifiedPublicationEvidence(
  prepared: PreparedSignedMessage,
  readback: ReadbackResult,
): EvidenceActivityEntry | undefined {
  if (readback.state !== "PUBLISHED_AND_VERIFIED") return undefined;
  return Object.freeze({
    id: evidenceId("READBACK_VERIFIED", prepared.room, prepared.did, prepared.nonce, readback.observed.sequence),
    source: "READBACK_VERIFIED",
    verdict: readback.evidenceVerdict,
    room: prepared.room,
    writer: prepared.did,
    text: prepared.text,
    ...(readback.observed.sequence === undefined ? {} : { sequence: readback.observed.sequence }),
    nonce: prepared.nonce,
    observationState: "PUBLISHED_AND_VERIFIED",
    receipt: readback.receipt,
  });
}

export function addObservedEvidence(
  entries: readonly EvidenceActivityEntry[],
  entry: EvidenceActivityEntry | undefined,
): readonly EvidenceActivityEntry[] {
  if (entry === undefined || entries.some((item) => item.id === entry.id)) return entries;
  return [...entries, entry];
}
