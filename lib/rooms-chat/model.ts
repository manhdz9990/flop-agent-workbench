import type { EvidenceField, MessageEvidence, VerificationState } from "../domain";
import type { RoomObservation } from "../live";

export type RoomWriterKind = "SIGNED_DID_KEY" | "UNSIGNED_NICKNAME";

export interface RoomConversationMessage {
  readonly index: number;
  readonly writer: string;
  readonly writerKind: RoomWriterKind;
  readonly text: string;
  readonly sequence?: string;
  readonly nonce?: string;
  readonly verdict: VerificationState;
}

const USABLE_SEQUENCE = /^\d{1,19}$/u;

export function prioritizeDiscoveredLobby(rooms: readonly RoomObservation[]): readonly RoomObservation[] {
  return rooms
    .map((room, index) => ({ room, index }))
    .sort((left, right) => {
      if (left.room.room === "lobby" && right.room.room !== "lobby") return -1;
      if (right.room.room === "lobby" && left.room.room !== "lobby") return 1;
      return left.index - right.index;
    })
    .map(({ room }) => room);
}

function value(fields: readonly EvidenceField[], name: string): unknown {
  return fields.find((field) => field.name === name)?.value;
}

function exactText(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export function buildRoomConversation(messages: readonly MessageEvidence[]): readonly RoomConversationMessage[] {
  const conversation = messages.flatMap<RoomConversationMessage>((message, index) => {
    const writer = exactText(value(message.fields, "from"));
    const text = exactText(value(message.fields, "text"));
    if (writer === undefined || text === undefined) return [];
    const sequenceValue = value(message.fields, "seq");
    const sequence = typeof sequenceValue === "string"
      ? sequenceValue
      : typeof sequenceValue === "number" && Number.isSafeInteger(sequenceValue) ? String(sequenceValue) : undefined;
    const nonce = exactText(value(message.fields, "nonce"));
    return [{
      index,
      writer,
      writerKind: writer.startsWith("did:key:") ? "SIGNED_DID_KEY" : "UNSIGNED_NICKNAME",
      text,
      ...(sequence === undefined ? {} : { sequence }),
      ...(nonce === undefined ? {} : { nonce }),
      verdict: message.verificationState,
    }];
  });

  // Technocore sequence values can exceed Number.MAX_SAFE_INTEGER. Put
  // records with usable observed sequence evidence newest-first using
  // exact BigInt comparison; retain source order for equal sequences and
  // for records that provide no usable sequence evidence.
  return [...conversation].sort((left, right) => {
    const leftUsable = left.sequence !== undefined && USABLE_SEQUENCE.test(left.sequence);
    const rightUsable = right.sequence !== undefined && USABLE_SEQUENCE.test(right.sequence);
    if (leftUsable && rightUsable) {
      const comparison = BigInt(right.sequence!) - BigInt(left.sequence!);
      return comparison > 0n ? 1 : comparison < 0n ? -1 : left.index - right.index;
    }
    if (leftUsable !== rightUsable) return leftUsable ? -1 : 1;
    return left.index - right.index;
  });
}

export function highestObservedNonceForDid(
  messages: readonly RoomConversationMessage[],
  did: string,
): string | undefined {
  let highest: bigint | undefined;
  for (const message of messages) {
    if (message.writer !== did || message.verdict !== "VALID" || message.nonce === undefined || !/^\d{1,19}$/u.test(message.nonce)) continue;
    const candidate = BigInt(message.nonce);
    if (highest === undefined || candidate > highest) highest = candidate;
  }
  return highest?.toString();
}
