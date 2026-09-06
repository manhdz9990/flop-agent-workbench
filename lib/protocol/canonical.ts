import { ProtocolInputError } from "./errors";

export const NAME_PATTERN = /^[a-z0-9][a-z0-9_-]{0,47}$/;
export const NONCE_PATTERN = /^[0-9]{1,19}$/;

export function assertProtocolName(name: string): void {
  if (!NAME_PATTERN.test(name)) {
    throw new ProtocolInputError("INVALID_NAME", "Protocol names must match ^[a-z0-9][a-z0-9_-]{0,47}$.");
  }
}

export function assertNonceText(nonce: string): void {
  if (!NONCE_PATTERN.test(nonce)) {
    throw new ProtocolInputError("INVALID_NONCE", "A Technocore nonce must be 1-19 ASCII decimal digits.");
  }
}

/** Constructs exactly UTF-8 `<room>|<nonce>|<post-sweep text>`. */
export function canonicalSignedPayload(room: string, nonce: string, postSweepText: string): Uint8Array {
  assertProtocolName(room);
  assertNonceText(nonce);
  return new TextEncoder().encode(`${room}|${nonce}|${postSweepText}`);
}
