import type { VerificationState } from "../domain";
import type {
  DiagnosticBoundary,
  DiagnosticStage,
  DiagnosticStatus,
  VerificationPipelineInputKind,
} from "../diagnostics";

export const EVIDENCE_RECEIPT_SCHEMA = "technocore-evidence-receipt/v1" as const;
export type EvidenceReceiptSchema = typeof EVIDENCE_RECEIPT_SCHEMA;

export interface ReceiptSourceReference {
  readonly kind: VerificationPipelineInputKind;
  readonly room?: string;
  readonly recordIndex?: number;
  readonly lineNumber?: number;
  readonly sequence?: string;
  readonly did?: string;
}

export interface ReceiptDiagnosticStage {
  readonly stage: DiagnosticStage;
  readonly status: DiagnosticStatus;
  readonly detail?: string;
  readonly whatThisMeans: string;
  readonly checkNext: string;
}

export type ReceiptBoundary = DiagnosticBoundary;

export interface ReceiptOperationalObservation {
  readonly code: string;
  readonly message: string;
}

export interface ReceiptSequenceGap {
  readonly previous: string;
  readonly next: string;
  readonly missingCount: string;
  readonly observation: string;
}

export type ReceiptTclkObservation =
  | { readonly status: "NOT_TCLK" }
  | { readonly status: "MALFORMED_TCLK"; readonly warning: string }
  | {
      readonly status: "RECOGNIZED";
      readonly frameType: string;
      readonly explanation: string;
      readonly transportAuthenticated: boolean;
      readonly warnings: readonly string[];
    };

export interface EvidenceReceipt {
  readonly schema: EvidenceReceiptSchema;
  readonly source: ReceiptSourceReference;
  readonly evidenceVerdict?: VerificationState;
  readonly diagnosticStages: readonly ReceiptDiagnosticStage[];
  readonly firstFailedBoundary: ReceiptBoundary | null;
  readonly firstUnavailableBoundary: ReceiptBoundary | null;
  readonly operationalObservations: readonly ReceiptOperationalObservation[];
  readonly sequenceGaps: readonly ReceiptSequenceGap[];
  readonly tclk: ReceiptTclkObservation;
  readonly limitations: readonly string[];
}

export type EvidenceReceiptFormat = "json" | "markdown";

export interface ReceiptDownload {
  readonly filename: string;
  readonly mimeType: string;
  readonly content: string;
}
