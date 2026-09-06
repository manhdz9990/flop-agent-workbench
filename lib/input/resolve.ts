import type { EvidenceField, OperationalError, TrustReport } from "../domain";
import { inspectLocalExport } from "../export";
import { readRoom, validateSequence, type RoomReadPayload } from "../live";
import { InputValidationError } from "../live";
import { decodeEd25519DidKey, ProtocolInputError } from "../protocol";
import type { DidInspection, InputResolution, InspectionInput, ResolveOptions, ResolvedLiveInspection } from "./types";

const operational = (code: string, message: string): OperationalError => ({ code, message });

function serverMetadata(value: RoomReadPayload): readonly EvidenceField[] {
  return [
    { name: "count", value: value.count, authority: "SERVER_ASSERTED_UNSIGNED" },
    { name: "first_seq", value: value.firstSeq, authority: "SERVER_ASSERTED_UNSIGNED" },
    { name: "last_seq", value: value.lastSeq, authority: "SERVER_ASSERTED_UNSIGNED" },
    ...(value.generation === undefined ? [] : [{ name: "generation", value: value.generation, authority: "SERVER_ASSERTED_UNSIGNED" as const }]),
  ];
}

export function inspectDid(did: string): DidInspection {
  try {
    const key = decodeEd25519DidKey(did);
    return {
      report: {
        inputKind: "DID",
        messages: [],
        warnings: [{ code: "KEY_CONTROL_ONLY", message: "A valid signature from this key proves key control for its exact signed payload only; it does not prove identity, reputation, honesty, wallet ownership, or truth." }],
        operationalErrors: [],
      },
      keyType: "Ed25519",
      publicKeyHex: Array.from(key, (byte) => byte.toString(16).padStart(2, "0")).join(""),
      meaning: "Supported Ed25519 did:key; decoded locally without identity resolution or network lookup.",
    };
  } catch (cause) {
    return { report: { inputKind: "DID", messages: [], warnings: [], operationalErrors: [{ code: cause instanceof ProtocolInputError ? cause.code : "INVALID_DID", message: cause instanceof Error ? cause.message : "The DID is invalid." }] } };
  }
}

async function resolveRoomInspection(room: string, kind: "ROOM" | "MESSAGE", sequence: string | undefined, options: ResolveOptions): Promise<InputResolution> {
  if (sequence !== undefined) {
    try { validateSequence(sequence); }
    catch (cause) { return { ok: false, error: operational(cause instanceof InputValidationError ? cause.code : "INVALID_SEQUENCE", cause instanceof Error ? cause.message : "Message sequence is invalid.") }; }
  }
  const read = await readRoom(room, options.reader);
  if (!read.ok) return read;
  const records = sequence === undefined ? read.value.messages : read.value.messages.filter((record) => String(record.seq) === sequence);
  if (sequence !== undefined && records.length === 0) return { ok: false, error: operational("MESSAGE_NOT_OBSERVED", "The requested sequence was not present in the bounded room window; its retention status cannot be determined from this response.") };
  const jsonl = records.map((record) => JSON.stringify(record)).join("\n");
  const inspected = await inspectLocalExport(room, jsonl, { generation: read.value.generation });
  const report: TrustReport = { ...inspected.report, inputKind: kind };
  const value: ResolvedLiveInspection = { report, serverMetadata: serverMetadata(read.value) };
  return { ok: true, kind, value };
}

export async function resolveInspectionInput(input: InspectionInput, options: ResolveOptions = {}): Promise<InputResolution> {
  switch (input.kind) {
    case "ROOM": return resolveRoomInspection(input.room, "ROOM", undefined, options);
    case "MESSAGE": return resolveRoomInspection(input.room, "MESSAGE", input.sequence, options);
    case "DID": return { ok: true, kind: "DID", value: inspectDid(input.did) };
    case "EXPORT": return { ok: false, error: operational("LOCAL_EXPORT_REQUIRED", "EXPORT input is handled only by the local export pipeline.") };
    default: return { ok: false, error: operational("UNSUPPORTED_INPUT", "The inspection input kind is unsupported.") };
  }
}
