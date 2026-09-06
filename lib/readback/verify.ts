import { buildTranscriptVerificationPipeline, diagnoseLiveTranscript } from "../diagnostics";
import { readRoom, type ReadResult, type RoomReadPayload } from "../live";
import { verifyProtocolRecord, type ProtocolRecord } from "../protocol";
import { createEvidenceReceipt } from "../receipt";
import type { PreparedSignedMessage } from "../signing";
import type { ReadbackInput, ReadbackOptions, ReadbackResult } from "./types";

const NOT_OBSERVED_MESSAGE = "Not observed yet. The bounded retained window does not prove whether the write occurred." as const;
const RELATED_MESSAGE = "Related evidence was observed, but the exact signed record was not independently verified." as const;

function exactMatch(prepared: PreparedSignedMessage, record: ProtocolRecord): boolean {
  return record.from === prepared.did
    && record.nonce === prepared.nonce
    && record.text === prepared.text
    && record.sig === prepared.signature;
}

function relatedMatch(prepared: PreparedSignedMessage, record: ProtocolRecord): boolean {
  return record.from === prepared.did && record.nonce === prepared.nonce;
}

function serverEvidence(record: ProtocolRecord): { sequence?: string; timestamp?: string } {
  const sequence = typeof record.seq === "string"
    ? record.seq
    : typeof record.seq === "number" && Number.isSafeInteger(record.seq) ? String(record.seq) : undefined;
  return {
    ...(sequence === undefined ? {} : { sequence }),
    ...(record.ts === undefined ? {} : { timestamp: record.ts }),
  };
}

async function evidenceFor(
  prepared: PreparedSignedMessage,
  read: ReadResult<RoomReadPayload>,
  index: number,
) {
  const diagnostics = await diagnoseLiveTranscript(prepared.room, read, { selectedIndex: index });
  const pipeline = buildTranscriptVerificationPipeline("ROOM", diagnostics);
  return { diagnostics, pipeline, receipt: createEvidenceReceipt(pipeline, { transcript: diagnostics }) };
}

export async function verifyPublishedReadback(
  input: ReadbackInput,
  options: ReadbackOptions = {},
): Promise<ReadbackResult> {
  if (input.attempts.stateFor(input.prepared) === "NOT_ATTEMPTED") {
    return Object.freeze({ state: "NOT_ATTEMPTED", message: "No publish attempt is recorded for this prepared message." });
  }

  const read = await (options.readRoom ?? readRoom)(input.prepared.room);
  if (!read.ok) {
    return Object.freeze({ state: "READBACK_UNAVAILABLE", operationalError: read.error });
  }
  if (read.value.room !== input.prepared.room) {
    return Object.freeze({
      state: "READBACK_UNAVAILABLE",
      operationalError: { code: "ROOM_MISMATCH", message: "Read-back room did not match the requested room." },
    });
  }

  const exactIndices: number[] = [];
  const relatedIndices: number[] = [];
  read.value.messages.forEach((record, index) => {
    if (exactMatch(input.prepared, record)) exactIndices.push(index);
    else if (relatedMatch(input.prepared, record)) relatedIndices.push(index);
  });

  for (const index of exactIndices) {
    const record = read.value.messages[index]!;
    const verdict = await verifyProtocolRecord(input.prepared.room, record);
    const evidence = await evidenceFor(input.prepared, read, index);
    if (verdict === "VALID" && evidence.pipeline.evidenceVerdict === "VALID") {
      return Object.freeze({
        state: "PUBLISHED_AND_VERIFIED",
        evidenceVerdict: "VALID",
        exactCandidateCount: exactIndices.length,
        observed: serverEvidence(record),
        pipeline: evidence.pipeline,
        receipt: evidence.receipt,
      });
    }
    return Object.freeze({
      state: "OBSERVED_BUT_NOT_VERIFIED",
      ...(evidence.pipeline.evidenceVerdict === undefined ? {} : { evidenceVerdict: evidence.pipeline.evidenceVerdict }),
      pipeline: evidence.pipeline,
      receipt: evidence.receipt,
      message: RELATED_MESSAGE,
    });
  }

  const relatedIndex = relatedIndices[0];
  if (relatedIndex !== undefined) {
    const evidence = await evidenceFor(input.prepared, read, relatedIndex);
    return Object.freeze({
      state: "OBSERVED_BUT_NOT_VERIFIED",
      ...(evidence.pipeline.evidenceVerdict === undefined ? {} : { evidenceVerdict: evidence.pipeline.evidenceVerdict }),
      pipeline: evidence.pipeline,
      receipt: evidence.receipt,
      message: RELATED_MESSAGE,
    });
  }

  return Object.freeze({ state: "NOT_OBSERVED", message: NOT_OBSERVED_MESSAGE });
}
