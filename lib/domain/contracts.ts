export const INPUT_KINDS = ["ROOM", "MESSAGE", "DID", "EXPORT"] as const;
export type InputKind = (typeof INPUT_KINDS)[number];

export const VERIFICATION_STATES = [
  "VALID",
  "INVALID",
  "UNSIGNED",
  "UNVERIFIABLE",
] as const;
export type VerificationState = (typeof VERIFICATION_STATES)[number];

export const EVIDENCE_AUTHORITIES = [
  "SIGNED",
  "SERVER_ASSERTED_UNSIGNED",
  "UNTRUSTED_CALLER_DATA",
] as const;
export type EvidenceAuthority = (typeof EVIDENCE_AUTHORITIES)[number];

export interface OperationalError {
  readonly code: string;
  readonly message: string;
  readonly context?: Readonly<Record<string, unknown>>;
}

export interface Warning {
  readonly code: string;
  readonly message: string;
}

export interface EvidenceField {
  readonly name: string;
  readonly value: unknown;
  readonly authority: EvidenceAuthority;
}

export interface MessageEvidence {
  readonly verificationState: VerificationState;
  readonly fields: readonly EvidenceField[];
  readonly warnings: readonly Warning[];
  readonly protocolAnnotations?: readonly ProtocolAnnotation[];
}

export interface ProtocolAnnotation {
  readonly protocol: "tclk/1";
  readonly type: string;
  readonly summary: string;
  readonly authority: "UNTRUSTED_CALLER_DATA";
  readonly transportAuthenticated: boolean;
  readonly warnings: readonly Warning[];
}

export interface TrustReport {
  readonly inputKind: InputKind;
  readonly messages: readonly MessageEvidence[];
  readonly warnings: readonly Warning[];
  readonly operationalErrors: readonly OperationalError[];
}
