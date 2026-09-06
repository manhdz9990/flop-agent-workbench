import type { OperationalError, VerificationState } from "../domain";
import type { EvidenceReceipt } from "../receipt";
import type { VerificationPipeline } from "../diagnostics";
import type { ReadResult, RoomReadPayload } from "../live";
import type { PublishAttemptStateReader } from "../publish";
import type { PreparedSignedMessage } from "../signing";

export const READBACK_STATES = [
  "NOT_ATTEMPTED",
  "PUBLISHED_AND_VERIFIED",
  "NOT_OBSERVED",
  "OBSERVED_BUT_NOT_VERIFIED",
  "READBACK_UNAVAILABLE",
] as const;

export type ReadbackState = (typeof READBACK_STATES)[number];

export interface ObservedServerEvidence {
  readonly sequence?: string;
  readonly timestamp?: string;
}

export type ReadbackResult =
  | { readonly state: "NOT_ATTEMPTED"; readonly message: "No publish attempt is recorded for this prepared message." }
  | {
      readonly state: "PUBLISHED_AND_VERIFIED";
      readonly evidenceVerdict: "VALID";
      readonly exactCandidateCount: number;
      readonly observed: ObservedServerEvidence;
      readonly pipeline: VerificationPipeline;
      readonly receipt: EvidenceReceipt;
    }
  | {
      readonly state: "NOT_OBSERVED";
      readonly message: "Not observed yet. The bounded retained window does not prove whether the write occurred.";
    }
  | {
      readonly state: "OBSERVED_BUT_NOT_VERIFIED";
      readonly evidenceVerdict?: VerificationState;
      readonly pipeline: VerificationPipeline;
      readonly receipt: EvidenceReceipt;
      readonly message: "Related evidence was observed, but the exact signed record was not independently verified.";
    }
  | {
      readonly state: "READBACK_UNAVAILABLE";
      readonly operationalError: OperationalError;
    };

export interface ReadbackOptions {
  readonly readRoom?: (room: string) => Promise<ReadResult<RoomReadPayload>>;
}

export interface ReadbackInput {
  readonly prepared: PreparedSignedMessage;
  readonly attempts: PublishAttemptStateReader;
}
