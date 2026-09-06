import {
  DIAGNOSTIC_STAGES,
  type TranscriptDiagnostics,
  type VerificationPipeline,
} from "../diagnostics";
import type { TclkEvidenceObservation } from "../tclk";
import {
  EVIDENCE_RECEIPT_SCHEMA,
  type EvidenceReceipt,
  type ReceiptSourceReference,
  type ReceiptTclkObservation,
} from "./types";

const VALID_LIMITATION = "VALID proves successful verification against the provided key and exact evidence; it does not prove identity, truth, trust, reputation, or intent.";
const UNVERIFIABLE_LIMITATION = "UNVERIFIABLE is distinct from INVALID: required evidence could not be checked.";
const RETENTION_LIMITATION = "The source contains only observed retained-window evidence and may not represent complete history.";
const TCLK_LIMITATION = "tclk observations describe bounded coordination structure only; they do not prove execution, settlement, payment, value transfer, or work completion.";

function tclkSummary(observation: TclkEvidenceObservation | undefined): ReceiptTclkObservation {
  if (observation === undefined || observation.detection.status === "NOT_TCLK") return { status: "NOT_TCLK" };
  if (observation.detection.status === "MALFORMED_TCLK") {
    return { status: "MALFORMED_TCLK", warning: observation.detection.warning.message };
  }
  return {
    status: "RECOGNIZED",
    frameType: observation.detection.frameType,
    explanation: observation.detection.explanation,
    transportAuthenticated: observation.transportAuthenticated,
    warnings: [
      observation.detection.warning.message,
      ...(observation.transportWarning === undefined ? [] : [observation.transportWarning.message]),
    ],
  };
}

function sourceReference(pipeline: VerificationPipeline, diagnostics?: TranscriptDiagnostics, did?: string): ReceiptSourceReference {
  if (pipeline.inputKind === "DID") return { kind: "DID", ...(did === undefined ? {} : { did }) };
  const selected = diagnostics?.selectedRecord;
  return {
    kind: pipeline.inputKind,
    ...(diagnostics === undefined ? {} : { room: diagnostics.summary.room }),
    ...(selected === null || selected === undefined ? {} : { recordIndex: selected.index }),
    ...(selected?.lineNumber === undefined ? {} : { lineNumber: selected.lineNumber }),
    ...(selected?.sequence === undefined ? {} : { sequence: selected.sequence }),
  };
}

function limitationsFor(pipeline: VerificationPipeline, diagnostics?: TranscriptDiagnostics): readonly string[] {
  const limitations: string[] = [];
  if (pipeline.inputKind !== "DID") limitations.push(RETENTION_LIMITATION);
  if (pipeline.evidenceVerdict === "VALID") limitations.push(VALID_LIMITATION);
  if (pipeline.evidenceVerdict === "UNVERIFIABLE") limitations.push(UNVERIFIABLE_LIMITATION);
  if (pipeline.tclkObservation?.detection.status !== undefined && pipeline.tclkObservation.detection.status !== "NOT_TCLK") {
    limitations.push(TCLK_LIMITATION);
  }
  for (const warning of diagnostics?.warnings ?? []) {
    if (!limitations.includes(warning.message)) limitations.push(warning.message);
  }
  return limitations;
}

export function createEvidenceReceipt(
  pipeline: VerificationPipeline,
  options: { readonly transcript?: TranscriptDiagnostics; readonly did?: string } = {},
): EvidenceReceipt {
  if (pipeline.stages.length !== DIAGNOSTIC_STAGES.length || pipeline.stages.some((item, index) => item.stage !== DIAGNOSTIC_STAGES[index])) {
    throw new Error("Evidence Receipt requires the complete canonical 12-stage Verification Pipeline.");
  }
  if (pipeline.inputKind === "DID" && options.transcript !== undefined) throw new Error("DID receipts cannot include transcript diagnostics.");
  if (pipeline.inputKind !== "DID" && options.transcript === undefined) throw new Error("Transcript receipts require their bounded transcript summary.");

  return {
    schema: EVIDENCE_RECEIPT_SCHEMA,
    source: sourceReference(pipeline, options.transcript, options.did),
    ...(pipeline.evidenceVerdict === undefined ? {} : { evidenceVerdict: pipeline.evidenceVerdict }),
    diagnosticStages: pipeline.stages.map((item) => ({
      stage: item.stage,
      status: item.status,
      ...(item.detail === undefined ? {} : { detail: item.detail }),
      whatThisMeans: item.whatThisMeans,
      checkNext: item.checkNext,
    })),
    firstFailedBoundary: pipeline.firstFailedBoundary,
    firstUnavailableBoundary: pipeline.firstUnavailableBoundary,
    operationalObservations: pipeline.operationalErrors.map(({ code, message }) => ({ code, message })),
    sequenceGaps: (options.transcript?.gaps ?? []).map((gap) => ({
      previous: gap.previous,
      next: gap.next,
      missingCount: gap.missingCount,
      observation: gap.warning.message,
    })),
    tclk: tclkSummary(pipeline.tclkObservation),
    limitations: limitationsFor(pipeline, options.transcript),
  };
}
