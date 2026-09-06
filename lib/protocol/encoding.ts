import { base58, base64urlnopad } from "@scure/base";

import { ProtocolInputError } from "./errors";

const DID_PREFIX = "did:key:";
const DID_PATTERN = /^did:key:z6Mk[1-9A-HJ-NP-Za-km-z]{44}$/;
const SIGNATURE_PATTERN = /^[A-Za-z0-9_-]{85}[AQgw]$/;

export function decodeEd25519DidKey(did: string): Uint8Array {
  if (!DID_PATTERN.test(did)) {
    throw new ProtocolInputError("INVALID_DID", "Expected the canonical Ed25519 did:key:z6Mk... form.");
  }

  try {
    const multibase = did.slice(DID_PREFIX.length);
    const decoded = base58.decode(multibase.slice(1));
    if (
      decoded.length !== 34 ||
      decoded[0] !== 0xed ||
      decoded[1] !== 0x01 ||
      `z${base58.encode(decoded)}` !== multibase
    ) {
      throw new Error("unsupported or noncanonical key");
    }
    return decoded.slice(2);
  } catch {
    throw new ProtocolInputError("INVALID_DID", "Expected a canonical did:key containing one Ed25519 public key.");
  }
}

export function encodeEd25519DidKey(publicKey: Uint8Array): string {
  if (publicKey.length !== 32) {
    throw new ProtocolInputError("INVALID_DID", "Expected exactly one 32-byte Ed25519 public key.");
  }

  const multicodec = new Uint8Array(34);
  multicodec.set([0xed, 0x01]);
  multicodec.set(publicKey, 2);
  return `${DID_PREFIX}z${base58.encode(multicodec)}`;
}

export function decodeCanonicalSignature(signature: string): Uint8Array | null {
  if (!SIGNATURE_PATTERN.test(signature)) return null;
  try {
    const decoded = base64urlnopad.decode(signature);
    return decoded.length === 64 && base64urlnopad.encode(decoded) === signature ? decoded : null;
  } catch {
    return null;
  }
}
