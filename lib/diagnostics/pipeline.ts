import type { OperationalError, VerificationState } from "../domain";
import { decodeEd25519DidKey, ProtocolInputError } from "../protocol";
import type { TclkEvidenceObservation } from "../tclk";
import { assertCompleteOrderedWalk, selectBoundaries } from "./boundaries";
import {
  DIAGNOSTIC_STAGES,
  type DiagnosticBoundaryResult,
  type DiagnosticCopy,
  type DiagnosticStage,
  type DiagnosticStageResult,
  type DiagnosticStatus,
} from "./contracts";
import { getDiagnosticCopy } from "./rules";
import type { TranscriptDiagnostics, TranscriptRecordDiagnostic } from "./transcript";

export type VerificationPipelineInputKind = "ROOM" | "MESSAGE" | "EXPORT" | "DID";

export interface VerificationPipelineStage extends DiagnosticStageResult, DiagnosticCopy {}

export interface VerificationPipeline extends DiagnosticBoundaryResult {
  readonly inputKind: VerificationPipelineInputKind;
  readonly stages: readonly VerificationPipelineStage[];
  readonly evidenceVerdict?: VerificationState;
  readonly operationalErrors: readonly OperationalError[];
  readonly tclkObservation?: TclkEvidenceObservation;
}

function pipelineStage(
  stage: DiagnosticStage,
  status: DiagnosticStatus,
  detail?: string,
): VerificationPipelineStage {
  return {
    stage,
    status,
    ...getDiagnosticCopy(stage, status),
    ...(detail === undefined ? {} : { detail }),
  };
}

function completePipeline(
  inputKind: VerificationPipelineInputKind,
  stages: readonly VerificationPipelineStage[],
  operationalErrors: readonly OperationalError[],
  selected?: TranscriptRecordDiagnostic,
): VerificationPipeline {
  assertCompleteOrderedWalk(stages);
  return {
    inputKind,
    stages,
    ...selectBoundaries(stages),
    operationalErrors,
    ...(selected?.evidenceVerdict === undefined ? {} : { evidenceVerdict: selected.evidenceVerdict }),
    ...(selected === undefined ? {} : { tclkObservation: selected.tclkObservation }),
  };
}

function noSelectedRecordStages(diagnostics: TranscriptDiagnostics): readonly VerificationPipelineStage[] {
  if (!diagnostics.summary.available) {
    return DIAGNOSTIC_STAGES.map((stage, index) => pipelineStage(
      stage,
      index === 0 ? "UNAVAILABLE" : "NOT_OBSERVED",
      index === 0 ? "The bounded transcript source was unavailable; see operational errors." : undefined,
    ));
  }

  const parsingStatus: DiagnosticStatus = diagnostics.summary.malformedRecordCount > 0
    ? "FAIL"
    : diagnostics.summary.parsedRecordCount > 0
      ? "UNAVAILABLE"
      : "NOT_APPLICABLE";
  return DIAGNOSTIC_STAGES.map((stage, index) => {
    if (index === 0) return pipelineStage(stage, "PASS", "The bounded transcript source was available.");
    if (index === 1) return pipelineStage(
      stage,
      parsingStatus,
      parsingStatus === "FAIL"
        ? "Malformed transcript records were observed, and no parsed record is selected."
        : parsingStatus === "UNAVAILABLE"
          ? "Parsed records exist, but the requested selected record was unavailable."
          : "The available transcript contains no retained record to parse.",
    );
    return pipelineStage(stage, parsingStatus === "NOT_APPLICABLE" ? "NOT_APPLICABLE" : "NOT_OBSERVED");
  });
}

export function buildTranscriptVerificationPipeline(
  inputKind: Exclude<VerificationPipelineInputKind, "DID">,
  diagnostics: TranscriptDiagnostics,
): VerificationPipeline {
  const selected = diagnostics.selectedRecord ?? undefined;
  if (selected === undefined) {
    return completePipeline(inputKind, noSelectedRecordStages(diagnostics), diagnostics.operationalErrors);
  }

  const stages = selected.stages.map((stage) => pipelineStage(stage.stage, stage.status, stage.detail));
  return completePipeline(inputKind, stages, diagnostics.operationalErrors, selected);
}

export function buildDidVerificationPipeline(did: string): VerificationPipeline {
  const statuses = new Map<DiagnosticStage, { status: DiagnosticStatus; detail?: string }>();
  statuses.set("SOURCE_AVAILABILITY", { status: "PASS", detail: "The DID input was available for local inspection." });
  statuses.set("RECORD_PARSING", { status: "NOT_APPLICABLE" });
  statuses.set("MESSAGE_CLASSIFICATION", { status: "NOT_APPLICABLE" });

  const operationalErrors: OperationalError[] = [];
  if (!did.startsWith("did:key:")) {
    statuses.set("DID_STRUCTURE", { status: "FAIL", detail: "The input does not have the did:key structural prefix." });
    statuses.set("DID_DECODING", { status: "NOT_OBSERVED" });
  } else {
    statuses.set("DID_STRUCTURE", { status: "PASS", detail: "A did:key structural prefix was observed." });
    try {
      decodeEd25519DidKey(did);
      statuses.set("DID_DECODING", { status: "PASS", detail: "The DID decoded as canonical Ed25519 key material." });
    } catch (cause) {
      statuses.set("DID_DECODING", { status: "FAIL", detail: "The DID could not be decoded as canonical Ed25519 key material." });
      operationalErrors.push({
        code: cause instanceof ProtocolInputError ? cause.code : "INVALID_DID",
        message: cause instanceof Error ? cause.message : "The DID could not be decoded.",
      });
    }
  }

  for (const stage of DIAGNOSTIC_STAGES.slice(5)) {
    statuses.set(stage, { status: "NOT_APPLICABLE" });
  }
  const stages = DIAGNOSTIC_STAGES.map((stage) => {
    const result = statuses.get(stage);
    if (result === undefined) throw new Error(`Missing diagnostic stage ${stage}.`);
    return pipelineStage(stage, result.status, result.detail);
  });
  return completePipeline("DID", stages, operationalErrors);
}
