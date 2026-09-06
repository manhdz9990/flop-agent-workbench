import type { OperationalError, VerificationState, Warning } from "../domain";
import {
  detectSequenceGaps,
  parseExportJsonl,
  type ExportLimits,
  type ParsedExport,
  type ParsedExportRecord,
  type SequenceGap,
} from "../export";
import type { ReadResult, RoomReadPayload } from "../live";
import {
  canonicalSignedPayload,
  decodeCanonicalSignature,
  decodeEd25519DidKey,
  NONCE_PATTERN,
  sweepSingleLine,
  verifyProtocolRecord,
  type ProtocolRecord,
} from "../protocol";
import { analyzeTclkRecord, type TclkEvidenceObservation } from "../tclk";
import { selectBoundaries } from "./boundaries";
import {
  DIAGNOSTIC_STAGES,
  type DiagnosticBoundaryResult,
  type DiagnosticCopy,
  type DiagnosticStage,
  type DiagnosticStageResult,
  type DiagnosticStatus,
} from "./contracts";
import { getDiagnosticCopy } from "./rules";

export type TranscriptSourceKind = "LIVE_ROOM" | "LOCAL_EXPORT";

export interface TranscriptSourceSummary {
  readonly kind: TranscriptSourceKind;
  readonly room: string;
  readonly available: boolean;
  readonly parsedRecordCount: number;
  readonly malformedRecordCount: number;
  readonly coverage: string;
}

export interface TranscriptStageDiagnostic extends DiagnosticStageResult, DiagnosticCopy {}

export interface TranscriptRecordDiagnostic extends DiagnosticBoundaryResult {
  readonly index: number;
  readonly lineNumber?: number;
  readonly sequence?: string;
  readonly record: ProtocolRecord;
  readonly stages: readonly TranscriptStageDiagnostic[];
  readonly evidenceVerdict?: VerificationState;
  readonly tclkObservation: TclkEvidenceObservation;
}

export interface TranscriptDiagnostics {
  readonly summary: TranscriptSourceSummary;
  readonly records: readonly TranscriptRecordDiagnostic[];
  readonly selectedRecord: TranscriptRecordDiagnostic | null;
  readonly operationalErrors: readonly OperationalError[];
  readonly gaps: readonly SequenceGap[];
  readonly warnings: readonly Warning[];
}

export interface TranscriptDiagnosticOptions {
  readonly selectedIndex?: number;
}

const COVERAGE = "This diagnosis covers only the records observed in the bounded retained transcript; it does not claim complete history.";

function stage(stage: DiagnosticStage, status: DiagnosticStatus, detail?: string): TranscriptStageDiagnostic {
  const copy = getDiagnosticCopy(stage, status);
  return { stage, status, ...copy, ...(detail === undefined ? {} : { detail }) };
}

function claimsSignedLane(record: ProtocolRecord): boolean {
  return record.from.startsWith("did:key:") || record.nonce !== undefined || record.sig !== undefined;
}

function sequenceOf(record: ProtocolRecord): string | undefined {
  if (typeof record.seq === "string") return record.seq;
  return typeof record.seq === "number" && Number.isSafeInteger(record.seq) && record.seq >= 0
    ? String(record.seq)
    : undefined;
}

async function diagnoseRecord(
  room: string,
  parsed: ParsedExportRecord,
  index: number,
): Promise<TranscriptRecordDiagnostic> {
  const record = parsed.record;
  const signed = claimsSignedLane(record);
  const results = new Map<DiagnosticStage, { status: DiagnosticStatus; detail?: string }>();
  const set = (name: DiagnosticStage, status: DiagnosticStatus, detail?: string): void => {
    results.set(name, { status, ...(detail === undefined ? {} : { detail }) });
  };

  set("SOURCE_AVAILABILITY", "PASS", "The bounded transcript source was available.");
  set("RECORD_PARSING", "PASS", `Record ${parsed.lineNumber} parsed successfully.`);
  set("MESSAGE_CLASSIFICATION", "PASS", "The parsed value has the supported Technocore message shape.");

  let didUsable = false;
  if (!signed) {
    set("DID_STRUCTURE", "NOT_APPLICABLE");
    set("DID_DECODING", "NOT_APPLICABLE");
  } else if (!record.from.startsWith("did:key:")) {
    set("DID_STRUCTURE", "FAIL", "Signed-lane evidence does not contain a did:key sender.");
    set("DID_DECODING", "NOT_OBSERVED");
  } else {
    set("DID_STRUCTURE", "PASS", "A did:key sender value was observed.");
    try {
      decodeEd25519DidKey(record.from);
      didUsable = true;
      set("DID_DECODING", "PASS", "The DID decoded as canonical Ed25519 key material.");
    } catch {
      set("DID_DECODING", "FAIL", "The observed DID could not be decoded as canonical Ed25519 key material.");
    }
  }

  const noncePresent = record.nonce !== undefined;
  const nonceUsable = noncePresent && NONCE_PATTERN.test(record.nonce ?? "");
  if (!signed) set("NONCE_EVIDENCE", "NOT_APPLICABLE");
  else if (!noncePresent) set("NONCE_EVIDENCE", "UNAVAILABLE", "No nonce was retained for this signed-lane record.");
  else if (!nonceUsable) set("NONCE_EVIDENCE", "FAIL", "The nonce does not match the canonical 1-19 digit text contract.");
  else set("NONCE_EVIDENCE", "PASS", "The nonce is canonical text and remains exact.");

  const swept = sweepSingleLine(record.text);
  const sweepUsable = swept === record.text;
  set("SWEEP_TRANSFORMATION", sweepUsable ? "PASS" : "FAIL", sweepUsable
    ? "Stored message text already matches the required single-line sweep."
    : "Stored message text does not match the required single-line sweep.");

  let payloadUsable = false;
  if (!signed) set("CANONICAL_PAYLOAD", "NOT_APPLICABLE");
  else if (!nonceUsable || !sweepUsable) set("CANONICAL_PAYLOAD", "UNAVAILABLE", "Required canonical payload evidence is unavailable.");
  else {
    try {
      canonicalSignedPayload(room, record.nonce!, record.text);
      payloadUsable = true;
      set("CANONICAL_PAYLOAD", "PASS", "The canonical payload was constructed from room, exact nonce text, and stored message text.");
    } catch {
      set("CANONICAL_PAYLOAD", "FAIL", "The canonical payload could not be constructed from the observed fields.");
    }
  }

  const signaturePresent = record.sig !== undefined;
  const signatureUsable = signaturePresent && decodeCanonicalSignature(record.sig ?? "") !== null;
  if (!signed) set("SIGNATURE_REPRESENTATION", "NOT_APPLICABLE");
  else if (!signaturePresent) set("SIGNATURE_REPRESENTATION", "UNAVAILABLE", "No signature representation was retained.");
  else if (!signatureUsable) set("SIGNATURE_REPRESENTATION", "FAIL", "The signature representation is malformed or noncanonical.");
  else set("SIGNATURE_REPRESENTATION", "PASS", "The signature has the canonical 64-byte representation.");

  let evidenceVerdict: VerificationState | undefined;
  const verificationReady = signed && didUsable && nonceUsable && sweepUsable && payloadUsable && signatureUsable;
  if (!signed) {
    evidenceVerdict = await verifyProtocolRecord(room, record);
    set("ED25519_VERIFICATION", "NOT_APPLICABLE", "This record does not claim signed evidence.");
  } else if (!verificationReady) {
    if (!signatureUsable && didUsable && nonceUsable && sweepUsable && payloadUsable) {
      evidenceVerdict = await verifyProtocolRecord(room, record);
    }
    set("ED25519_VERIFICATION", "UNAVAILABLE", "Ed25519 verification did not execute because required evidence was unusable or unavailable.");
  } else {
    evidenceVerdict = await verifyProtocolRecord(room, record);
    set("ED25519_VERIFICATION", evidenceVerdict === "VALID" ? "PASS" : "FAIL",
      evidenceVerdict === "VALID" ? "Ed25519 verification returned true." : "Ed25519 verification executed and returned false.");
  }

  const tclkObservation = await analyzeTclkRecord(record, evidenceVerdict ?? "UNVERIFIABLE");
  if (tclkObservation.detection.status === "NOT_TCLK") {
    set("TCLK_RECOGNITION", "NOT_APPLICABLE", "No tclk/1 prefix was observed.");
    set("TCLK_STRUCTURAL_BINDING", "NOT_APPLICABLE");
  } else if (tclkObservation.detection.status === "MALFORMED_TCLK") {
    set("TCLK_RECOGNITION", "FAIL", "A tclk/1 prefix was observed, but the frame was not recognized.");
    set("TCLK_STRUCTURAL_BINDING", "NOT_OBSERVED");
  } else {
    set("TCLK_RECOGNITION", "PASS", `Recognized bounded ${tclkObservation.detection.frameType} coordination data.`);
    set("TCLK_STRUCTURAL_BINDING", tclkObservation.transportAuthenticated ? "PASS" : "FAIL",
      tclkObservation.transportAuthenticated
        ? "The recognized frame is structurally valid and bound to a matching VALID transport record."
        : "The recognized frame is structurally valid, but a matching VALID transport binding was not observed.");
  }

  const stages = DIAGNOSTIC_STAGES.map((name) => {
    const result = results.get(name);
    if (result === undefined) throw new Error(`Missing diagnostic stage ${name}.`);
    return stage(name, result.status, result.detail);
  });
  const boundaries = selectBoundaries(stages);
  return {
    index,
    lineNumber: parsed.lineNumber,
    ...(sequenceOf(record) === undefined ? {} : { sequence: sequenceOf(record) }),
    record,
    stages,
    ...boundaries,
    ...(evidenceVerdict === undefined ? {} : { evidenceVerdict }),
    tclkObservation,
  };
}

function malformedCount(parsed: ParsedExport): number {
  return parsed.operationalErrors.filter((item) => typeof item.context?.lineNumber === "number").length;
}

async function adaptParsed(
  kind: TranscriptSourceKind,
  room: string,
  parsed: ParsedExport,
  warnings: readonly Warning[],
  options: TranscriptDiagnosticOptions,
): Promise<TranscriptDiagnostics> {
  const records = await Promise.all(parsed.records.map((record, index) => diagnoseRecord(room, record, index)));
  const selectedRecord = records[options.selectedIndex ?? 0] ?? null;
  return {
    summary: {
      kind,
      room,
      available: true,
      parsedRecordCount: parsed.records.length,
      malformedRecordCount: malformedCount(parsed),
      coverage: COVERAGE,
    },
    records,
    selectedRecord,
    operationalErrors: parsed.operationalErrors,
    gaps: detectSequenceGaps(parsed.records),
    warnings,
  };
}

export async function diagnoseExportTranscript(
  room: string,
  input: string,
  options: TranscriptDiagnosticOptions = {},
  limits?: ExportLimits,
): Promise<TranscriptDiagnostics> {
  return adaptParsed("LOCAL_EXPORT", room, parseExportJsonl(input, limits), [{
    code: "RETAINED_WINDOW_ONLY",
    message: "This export contains records retained at capture time; it is not verified full history.",
  }], options);
}

export async function diagnoseLiveTranscript(
  room: string,
  read: ReadResult<RoomReadPayload>,
  options: TranscriptDiagnosticOptions = {},
): Promise<TranscriptDiagnostics> {
  if (!read.ok) {
    return {
      summary: { kind: "LIVE_ROOM", room, available: false, parsedRecordCount: 0, malformedRecordCount: 0, coverage: COVERAGE },
      records: [],
      selectedRecord: null,
      operationalErrors: [read.error],
      gaps: [],
      warnings: [],
    };
  }
  const parsed: ParsedExport = {
    records: read.value.messages.map((record, index) => ({ lineNumber: index + 1, rawLine: JSON.stringify(record), record })),
    operationalErrors: [],
  };
  return adaptParsed("LIVE_ROOM", room, parsed, [{
    code: "RETAINED_WINDOW_ONLY",
    message: "This room read contains only the bounded retained window; it is not verified full history.",
  }], options);
}
