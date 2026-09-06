import {
  DIAGNOSTIC_STAGE_LABELS,
  type DiagnosticCopy,
  type DiagnosticStage,
  type DiagnosticStatus,
} from "./contracts";

/**
 * Central diagnostic copy registry (V11-01).
 *
 * This is the single source of truth for "What this means" / "Check next"
 * text shown for any diagnostic stage/status combination. No other module
 * — present or future UI code included — may hardcode this copy; it must
 * be read from here.
 *
 * Copy describes only what the evidence shows. It never assigns a root
 * cause, never claims identity/trust/settlement, and never speaks for a
 * stage that was not actually reached.
 */

/** Per-stage copy used only when that stage reports FAIL: the stage was
 * checked and its evidence did not satisfy it. */
const FAIL_COPY: Readonly<Record<DiagnosticStage, DiagnosticCopy>> = {
  SOURCE_AVAILABILITY: {
    whatThisMeans:
      "The requested source (room, message, DID, or export) could not be read as a valid input.",
    checkNext: "Confirm the input value and input kind, then retry.",
  },
  RECORD_PARSING: {
    whatThisMeans: "One or more records could not be parsed from the source data.",
    checkNext: "Review the raw record for malformed structure or encoding.",
  },
  MESSAGE_CLASSIFICATION: {
    whatThisMeans: "The record could not be classified as a recognized message shape.",
    checkNext: "Compare the record's fields against the expected message shape.",
  },
  DID_STRUCTURE: {
    whatThisMeans: "The DID string does not have the expected structural form.",
    checkNext: "Check the DID string for missing or malformed segments.",
  },
  DID_DECODING: {
    whatThisMeans: "The DID's key material could not be decoded.",
    checkNext: "Verify the DID's encoded key segment is well-formed.",
  },
  NONCE_EVIDENCE: {
    whatThisMeans: "The nonce evidence present does not satisfy the expected nonce contract.",
    checkNext: "Check the nonce field for an unexpected type, format, or value.",
  },
  SWEEP_TRANSFORMATION: {
    whatThisMeans: "The message text failed the required sweep transformation.",
    checkNext: "Inspect the message text for characters outside the allowed sweep.",
  },
  CANONICAL_PAYLOAD: {
    whatThisMeans: "The canonical signed payload could not be constructed from the available fields.",
    checkNext: "Confirm room, nonce, and text are all present as exact evidence.",
  },
  SIGNATURE_REPRESENTATION: {
    whatThisMeans: "The signature value does not have the expected representation.",
    checkNext: "Check the signature field's encoding and length.",
  },
  ED25519_VERIFICATION: {
    whatThisMeans:
      "The signature did not verify against the canonical payload and decoded key.",
    checkNext: "Treat this record as unverified; do not assume identity or intent.",
  },
  TCLK_RECOGNITION: {
    whatThisMeans: "The message text was checked and is not a recognized tclk/1 frame.",
    checkNext: "No tclk-specific action is expected for this message.",
  },
  TCLK_STRUCTURAL_BINDING: {
    whatThisMeans:
      "The recognized tclk/1 frame's structure or transport binding did not check out.",
    checkNext:
      "Treat any tclk annotation as unauthenticated coordination text, not a settlement fact.",
  },
};

/** Per-stage copy used only when that stage reports UNAVAILABLE: the
 * stage could not be checked at all, for reasons upstream of the stage
 * itself. */
const UNAVAILABLE_COPY: Readonly<Record<DiagnosticStage, DiagnosticCopy>> = {
  SOURCE_AVAILABILITY: {
    whatThisMeans: "Whether the source is available could not be determined.",
    checkNext: "Retry the read, or check network/operational errors reported alongside this diagnosis.",
  },
  RECORD_PARSING: {
    whatThisMeans: "Parsing could not run because the source was not available.",
    checkNext: "Resolve source availability first.",
  },
  MESSAGE_CLASSIFICATION: {
    whatThisMeans: "Classification could not run because no parsed record was available.",
    checkNext: "Resolve record parsing first.",
  },
  DID_STRUCTURE: {
    whatThisMeans: "DID structure could not be checked because no DID value was available.",
    checkNext: "Confirm a DID value was actually supplied for this diagnosis.",
  },
  DID_DECODING: {
    whatThisMeans: "DID decoding could not run because DID structure was not available.",
    checkNext: "Resolve DID structure first.",
  },
  NONCE_EVIDENCE: {
    whatThisMeans: "Nonce evidence could not be checked because no classified message was available.",
    checkNext: "Resolve message classification first.",
  },
  SWEEP_TRANSFORMATION: {
    whatThisMeans: "The sweep transformation could not run because no message text was available.",
    checkNext: "Resolve message classification first.",
  },
  CANONICAL_PAYLOAD: {
    whatThisMeans: "The canonical payload could not be built because required upstream evidence was unavailable.",
    checkNext: "Resolve nonce evidence and sweep transformation first.",
  },
  SIGNATURE_REPRESENTATION: {
    whatThisMeans: "The signature could not be checked because no signature field was available.",
    checkNext: "Confirm the record actually carries a signature field.",
  },
  ED25519_VERIFICATION: {
    whatThisMeans: "Verification could not run because required upstream evidence was unavailable.",
    checkNext: "Resolve canonical payload and signature representation first.",
  },
  TCLK_RECOGNITION: {
    whatThisMeans: "tclk recognition could not run because no message text was available.",
    checkNext: "Resolve message classification first.",
  },
  TCLK_STRUCTURAL_BINDING: {
    whatThisMeans: "tclk structural/binding checks could not run because no recognized frame was available.",
    checkNext: "Resolve tclk recognition first.",
  },
};

const GENERIC_PASS_COPY: DiagnosticCopy = {
  whatThisMeans: "This stage's evidence was checked and satisfied the stage.",
  checkNext: "No action needed for this stage.",
};

const GENERIC_NOT_APPLICABLE_COPY: DiagnosticCopy = {
  whatThisMeans: "This stage does not apply to this input.",
  checkNext: "No action needed for this stage.",
};

const GENERIC_NOT_OBSERVED_COPY: DiagnosticCopy = {
  whatThisMeans: "This stage was not reached because diagnosis stopped at an earlier boundary.",
  checkNext: "Resolve the earlier boundary to reach this stage.",
};

/**
 * Returns the deterministic "What this means" / "Check next" copy for a
 * given stage/status pair. PASS, NOT_APPLICABLE, and NOT_OBSERVED use
 * status-level generic copy, since none of those statuses represents a
 * boundary needing stage-specific evidence explanation. FAIL and
 * UNAVAILABLE use stage-specific copy from the registries above.
 */
export function getDiagnosticCopy(stage: DiagnosticStage, status: DiagnosticStatus): DiagnosticCopy {
  switch (status) {
    case "PASS":
      return GENERIC_PASS_COPY;
    case "NOT_APPLICABLE":
      return GENERIC_NOT_APPLICABLE_COPY;
    case "NOT_OBSERVED":
      return GENERIC_NOT_OBSERVED_COPY;
    case "FAIL":
      return FAIL_COPY[stage];
    case "UNAVAILABLE":
      return UNAVAILABLE_COPY[stage];
    default: {
      const exhaustive: never = status;
      throw new Error(`Unhandled diagnostic status: ${String(exhaustive)}`);
    }
  }
}

/** Presentation label for a stage, sourced from the same registry module
 * family as the copy above. */
export function getDiagnosticStageLabel(stage: DiagnosticStage): string {
  return DIAGNOSTIC_STAGE_LABELS[stage];
}
