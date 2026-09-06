import type { EvidenceAuthority, VerificationState, Warning } from "../domain";
import type { ProtocolRecord } from "../protocol";

export const TCLK_PREFIX = "tclk1 ";
export const TCLK_MAX_FRAME_CHARS = 4096;
export const TCLK_FRAME_TYPES = ["offer", "accept", "lock", "reveal", "refund", "cancel", "receipt", "heartbeat"] as const;
export type TclkFrameType = (typeof TCLK_FRAME_TYPES)[number];

export type TclkDetection =
  | { readonly status: "NOT_TCLK" }
  | { readonly status: "MALFORMED_TCLK"; readonly warning: Warning }
  | { readonly status: "RECOGNIZED"; readonly frameType: TclkFrameType; readonly frame: Readonly<Record<string, unknown>>; readonly explanation: string; readonly warning: Warning };

export interface TclkEvidenceObservation {
  readonly detection: TclkDetection;
  readonly verificationState: VerificationState;
  readonly authority: EvidenceAuthority;
  readonly transportAuthenticated: boolean;
  readonly transportWarning?: Warning;
}

export interface TclkRecordInput extends ProtocolRecord { readonly text: string }
