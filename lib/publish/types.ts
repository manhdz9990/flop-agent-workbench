import type { PreparedSignedMessage } from "../signing";

export const PUBLISH_ATTEMPT_STATES = [
  "NOT_ATTEMPTED",
  "ATTEMPTED",
  "RESPONSE_RECEIVED",
  "OUTCOME_UNKNOWN",
] as const;

export type PublishAttemptState = (typeof PUBLISH_ATTEMPT_STATES)[number];

export type PublishAttemptResult =
  | {
      readonly state: "RESPONSE_RECEIVED";
      readonly status: number;
    }
  | {
      readonly state: "OUTCOME_UNKNOWN";
      readonly message: "Write outcome unknown. Read-back verification is required.";
    };

export interface BrowserPublishOptions {
  readonly fetch?: typeof fetch;
  readonly timeoutMs?: number;
}

export type PublishAttemptErrorCode =
  | "INVALID_PREPARED_MESSAGE"
  | "INVALID_DESTINATION"
  | "INVALID_TIMEOUT";

export class PublishAttemptError extends Error {
  constructor(
    readonly code: PublishAttemptErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "PublishAttemptError";
  }
}

export interface PublishAttemptStateReader {
  stateFor(prepared: PreparedSignedMessage): PublishAttemptState;
}
