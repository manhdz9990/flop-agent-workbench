export const LOCAL_SIGNING_STATE = "SIGNED_LOCALLY_NOT_PUBLISHED" as const;

export interface NonceClock {
  nowMilliseconds(): bigint;
}

export interface NonceCandidateInput {
  readonly currentUnixMilliseconds: bigint;
  readonly highestObservedNonce?: string;
  readonly highestSessionNonce?: string;
}

export interface PrepareSignedMessageInput {
  readonly room: string;
  readonly text: string;
  readonly highestObservedNonce?: string;
}

export interface PreparedSignedMessage {
  readonly state: typeof LOCAL_SIGNING_STATE;
  readonly room: string;
  readonly did: string;
  readonly nonce: string;
  readonly text: string;
  readonly canonicalPayload: string;
  readonly signature: string;
}

export type SigningPreparationErrorCode =
  | "INVALID_CLOCK"
  | "NONCE_EXHAUSTED"
  | "NONCE_NOT_RESERVED"
  | "NONCE_ALREADY_BURNED"
  | "SELF_VERIFICATION_FAILED";

export class SigningPreparationError extends Error {
  constructor(
    readonly code: SigningPreparationErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "SigningPreparationError";
  }
}
