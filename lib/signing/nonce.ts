import { assertNonceText, assertProtocolName, decodeEd25519DidKey } from "../protocol";
import { SigningPreparationError, type NonceCandidateInput, type NonceClock } from "./types";

const MAX_NONCE = 9_999_999_999_999_999_999n;

function parseNonce(value: string | undefined): bigint | undefined {
  if (value === undefined) return undefined;
  assertNonceText(value);
  return BigInt(value);
}

export function prepareNonceCandidate(input: NonceCandidateInput): string {
  if (input.currentUnixMilliseconds < 0n || input.currentUnixMilliseconds > MAX_NONCE) {
    throw new SigningPreparationError("INVALID_CLOCK", "Current Unix time is outside the supported nonce range.");
  }

  const observed = parseNonce(input.highestObservedNonce);
  const session = parseNonce(input.highestSessionNonce);
  let candidate = input.currentUnixMilliseconds;
  if (observed !== undefined && observed >= candidate) candidate = observed + 1n;
  if (session !== undefined && session >= candidate) candidate = session + 1n;
  if (candidate > MAX_NONCE) {
    throw new SigningPreparationError("NONCE_EXHAUSTED", "No supported nonce remains for this identity and room.");
  }
  return candidate.toString(10);
}

const SYSTEM_NONCE_CLOCK: NonceClock = {
  nowMilliseconds: () => BigInt(Date.now()),
};

export class SessionNonceReservations {
  readonly #reserved = new Map<string, Map<string, string>>();
  readonly #prepared = new Map<string, Map<string, Set<string>>>();
  readonly #burned = new Map<string, Map<string, Set<string>>>();

  previewNext(
    did: string,
    room: string,
    highestObservedNonce?: string,
    clock: NonceClock = SYSTEM_NONCE_CLOCK,
  ): string {
    decodeEd25519DidKey(did);
    assertProtocolName(room);
    const currentUnixMilliseconds = clock.nowMilliseconds();
    if (typeof currentUnixMilliseconds !== "bigint") {
      throw new SigningPreparationError("INVALID_CLOCK", "Nonce clock must return exact integer milliseconds.");
    }
    return prepareNonceCandidate({
      currentUnixMilliseconds,
      highestObservedNonce,
      highestSessionNonce: this.#reserved.get(did)?.get(room),
    });
  }

  reserveNext(
    did: string,
    room: string,
    highestObservedNonce?: string,
    clock: NonceClock = SYSTEM_NONCE_CLOCK,
  ): string {
    const byRoom = this.#reserved.get(did);
    const candidate = this.previewNext(did, room, highestObservedNonce, clock);
    if (byRoom) byRoom.set(room, candidate);
    else this.#reserved.set(did, new Map([[room, candidate]]));
    const preparedByRoom = this.#prepared.get(did);
    if (preparedByRoom) {
      const prepared = preparedByRoom.get(room);
      if (prepared) prepared.add(candidate);
      else preparedByRoom.set(room, new Set([candidate]));
    } else {
      this.#prepared.set(did, new Map([[room, new Set([candidate])]]));
    }
    return candidate;
  }

  burnForPublish(did: string, room: string, nonce: string): void {
    decodeEd25519DidKey(did);
    assertProtocolName(room);
    assertNonceText(nonce);
    if (!this.#prepared.get(did)?.get(room)?.has(nonce)) {
      throw new SigningPreparationError("NONCE_NOT_RESERVED", "Prepared nonce is not reserved in this session.");
    }
    const burnedByRoom = this.#burned.get(did);
    const burned = burnedByRoom?.get(room);
    if (burned?.has(nonce)) {
      throw new SigningPreparationError("NONCE_ALREADY_BURNED", "Prepared nonce has already been used for a publish attempt.");
    }
    if (burned) burned.add(nonce);
    else if (burnedByRoom) burnedByRoom.set(room, new Set([nonce]));
    else this.#burned.set(did, new Map([[room, new Set([nonce])]]));
  }

  isBurned(did: string, room: string, nonce: string): boolean {
    return this.#burned.get(did)?.get(room)?.has(nonce) ?? false;
  }
}
