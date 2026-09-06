import { verifyAsync } from "@noble/ed25519";

import type { VerificationState } from "../domain";
import { assertNonceText, canonicalSignedPayload } from "./canonical";
import { decodeCanonicalSignature, decodeEd25519DidKey } from "./encoding";
import { ProtocolInputError } from "./errors";

export interface ProtocolRecord {
  readonly from: string;
  readonly text: string;
  readonly nonce?: string;
  readonly sig?: string;
  readonly seq?: string | number;
  readonly ts?: string;
}

export async function verifyProtocolRecord(room: string, record: ProtocolRecord): Promise<VerificationState> {
  const claimsSignedLane = record.from.startsWith("did:key:") || record.nonce !== undefined || record.sig !== undefined;
  if (!claimsSignedLane) return "UNSIGNED";

  const publicKey = decodeEd25519DidKey(record.from);
  if (record.sig === undefined) return "UNVERIFIABLE";
  if (record.nonce === undefined) {
    throw new ProtocolInputError("MISSING_SIGNED_EVIDENCE", "A retained signature cannot be checked without its nonce.");
  }

  assertNonceText(record.nonce);
  const signature = decodeCanonicalSignature(record.sig);
  if (signature === null) return "UNVERIFIABLE";
  const payload = canonicalSignedPayload(room, record.nonce, record.text);
  try {
    return (await verifyAsync(signature, payload, publicKey)) ? "VALID" : "INVALID";
  } catch {
    // Once the encodings are structurally valid, Noble point/signature rejection is a
    // cryptographic mismatch, not an operational parser failure.
    return "INVALID";
  }
}
