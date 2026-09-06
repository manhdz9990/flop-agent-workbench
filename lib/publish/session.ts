import type { PreparedSignedMessage, SessionNonceReservations } from "../signing";
import type { PublishAttemptState, PublishAttemptStateReader } from "./types";

function attemptKey(prepared: PreparedSignedMessage): string {
  return `${prepared.did}\u0000${prepared.room}\u0000${prepared.nonce}`;
}

export class PublishAttemptSession implements PublishAttemptStateReader {
  readonly #states = new Map<string, PublishAttemptState>();
  readonly #nonces: SessionNonceReservations;

  constructor(nonces: SessionNonceReservations) {
    this.#nonces = nonces;
  }

  stateFor(prepared: PreparedSignedMessage): PublishAttemptState {
    return this.#states.get(attemptKey(prepared)) ?? "NOT_ATTEMPTED";
  }

  begin(prepared: PreparedSignedMessage): void {
    this.#nonces.burnForPublish(prepared.did, prepared.room, prepared.nonce);
    this.#states.set(attemptKey(prepared), "ATTEMPTED");
  }

  finish(prepared: PreparedSignedMessage, state: "RESPONSE_RECEIVED" | "OUTCOME_UNKNOWN"): void {
    this.#states.set(attemptKey(prepared), state);
  }
}
