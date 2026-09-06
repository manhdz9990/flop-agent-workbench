export type ProtocolInputErrorCode =
  | "INVALID_NAME"
  | "INVALID_NONCE"
  | "INVALID_DID"
  | "MISSING_SIGNED_EVIDENCE";

export class ProtocolInputError extends Error {
  constructor(readonly code: ProtocolInputErrorCode, message: string) {
    super(message);
    this.name = "ProtocolInputError";
  }
}
