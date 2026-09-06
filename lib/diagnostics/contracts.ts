/**
 * Diagnostic Foundation Contracts (V11-01).
 *
 * Pure, deterministic types and constants describing the shape of a
 * diagnostic boundary walk over the existing, already-verified evidence
 * pipeline. This module defines contracts only: it does not read protocol
 * data, does not perform cryptographic verification, and does not alter
 * any existing verifier/parser/safe-reader/tclk-detector/export-limit/route
 * behavior.
 *
 * A diagnostic stage result reports what was observed about one stage of
 * the pipeline. It never infers a root cause beyond that evidence.
 */

/**
 * The five mutually exclusive diagnostic statuses a pipeline stage can
 * report.
 *
 * - PASS: the stage's evidence was checked and satisfied the stage.
 * - FAIL: the stage's evidence was checked and did not satisfy the stage.
 * - UNAVAILABLE: the stage could not be checked because required evidence
 *   or capability was missing (e.g. an upstream read failed). This is not
 *   a failure of the stage itself.
 * - NOT_APPLICABLE: the stage does not apply given the input kind or an
 *   earlier, unrelated stage's outcome (e.g. tclk stages when no tclk
 *   frame is present).
 * - NOT_OBSERVED: the stage was never reached because diagnosis stopped
 *   at an earlier boundary.
 */
export const DIAGNOSTIC_STATUSES = [
  "PASS",
  "FAIL",
  "UNAVAILABLE",
  "NOT_APPLICABLE",
  "NOT_OBSERVED",
] as const;

export type DiagnosticStatus = (typeof DIAGNOSTIC_STATUSES)[number];

/**
 * The locked, ordered Verification Pipeline stages. Order is significant:
 * boundary-selection helpers rely on this exact sequence and must not
 * reorder, insert, or remove stages without a corresponding product
 * decision recorded in an ADR.
 */
export const DIAGNOSTIC_STAGES = [
  "SOURCE_AVAILABILITY",
  "RECORD_PARSING",
  "MESSAGE_CLASSIFICATION",
  "DID_STRUCTURE",
  "DID_DECODING",
  "NONCE_EVIDENCE",
  "SWEEP_TRANSFORMATION",
  "CANONICAL_PAYLOAD",
  "SIGNATURE_REPRESENTATION",
  "ED25519_VERIFICATION",
  "TCLK_RECOGNITION",
  "TCLK_STRUCTURAL_BINDING",
] as const;

export type DiagnosticStage = (typeof DIAGNOSTIC_STAGES)[number];

/** Human-readable labels for each stage, in pipeline order. Presentation
 * only; carries no evidentiary meaning. */
export const DIAGNOSTIC_STAGE_LABELS: Readonly<Record<DiagnosticStage, string>> = {
  SOURCE_AVAILABILITY: "Source availability",
  RECORD_PARSING: "Record/line parsing",
  MESSAGE_CLASSIFICATION: "Message classification",
  DID_STRUCTURE: "DID structure",
  DID_DECODING: "DID decoding",
  NONCE_EVIDENCE: "Nonce evidence",
  SWEEP_TRANSFORMATION: "Sweep transformation",
  CANONICAL_PAYLOAD: "Canonical payload",
  SIGNATURE_REPRESENTATION: "Signature representation",
  ED25519_VERIFICATION: "Ed25519 verification",
  TCLK_RECOGNITION: "tclk recognition",
  TCLK_STRUCTURAL_BINDING: "tclk structural/binding",
};

/** The result of diagnosing a single stage. Evidence-only: `detail` may
 * describe what was observed, never why it happened beyond the evidence. */
export interface DiagnosticStageResult {
  readonly stage: DiagnosticStage;
  readonly status: DiagnosticStatus;
  readonly detail?: string;
}

/** A full, ordered walk of the pipeline for one diagnosed item. Every
 * locked stage must be represented exactly once, in `DIAGNOSTIC_STAGES`
 * order. */
export type DiagnosticStageWalk = readonly DiagnosticStageResult[];

/**
 * A boundary identifies a specific stage result that diagnosis stopped or
 * paused at. It is not a claim of root cause — only a pointer to the
 * earliest relevant stage result of the given kind.
 */
export interface DiagnosticBoundary {
  readonly stage: DiagnosticStage;
  readonly status: DiagnosticStatus;
  readonly detail?: string;
}

/** User-facing copy for one stage/status combination, sourced from the
 * central rules registry (`lib/diagnostics/rules.ts`) only. */
export interface DiagnosticCopy {
  readonly whatThisMeans: string;
  readonly checkNext: string;
}

/** The outcome of boundary selection over a full stage walk. */
export interface DiagnosticBoundaryResult {
  readonly firstFailedBoundary: DiagnosticBoundary | null;
  readonly firstUnavailableBoundary: DiagnosticBoundary | null;
}
