import {
  assertNonceText,
  assertProtocolName,
  canonicalSignedPayload,
  decodeCanonicalSignature,
  decodeEd25519DidKey,
  verifyProtocolRecord,
} from "../protocol";
import { LOCAL_SIGNING_STATE, type PreparedSignedMessage } from "../signing";
import { TECHNOCORE_ORIGIN } from "../live/types";
import { PublishAttemptSession } from "./session";
import { PublishAttemptError, type BrowserPublishOptions, type PublishAttemptResult } from "./types";

export const PUBLISH_REQUEST_TIMEOUT_MS = 10_000;
const UNKNOWN_MESSAGE = "Write outcome unknown. Read-back verification is required." as const;
const PREPARED_KEYS = ["state", "room", "did", "nonce", "text", "canonicalPayload", "signature"].sort();

async function assertPreparedMessage(prepared: PreparedSignedMessage): Promise<void> {
  if (!Object.isFrozen(prepared) || prepared.state !== LOCAL_SIGNING_STATE) {
    throw new PublishAttemptError("INVALID_PREPARED_MESSAGE", "Expected an immutable locally prepared message.");
  }
  const keys = Object.keys(prepared).sort();
  if (keys.length !== PREPARED_KEYS.length || keys.some((key, index) => key !== PREPARED_KEYS[index])) {
    throw new PublishAttemptError("INVALID_PREPARED_MESSAGE", "Prepared message has an invalid public shape.");
  }
  try {
    assertProtocolName(prepared.room);
    decodeEd25519DidKey(prepared.did);
    assertNonceText(prepared.nonce);
    if (decodeCanonicalSignature(prepared.signature) === null) throw new Error("invalid signature");
    const expectedPayload = new TextDecoder().decode(
      canonicalSignedPayload(prepared.room, prepared.nonce, prepared.text),
    );
    if (prepared.canonicalPayload !== expectedPayload) throw new Error("payload mismatch");
    const verdict = await verifyProtocolRecord(prepared.room, {
      from: prepared.did,
      nonce: prepared.nonce,
      text: prepared.text,
      sig: prepared.signature,
    });
    if (verdict !== "VALID") throw new Error("signature mismatch");
  } catch {
    throw new PublishAttemptError("INVALID_PREPARED_MESSAGE", "Prepared message evidence is invalid.");
  }
}

function buildAndValidateWriteUrl(prepared: PreparedSignedMessage): URL {
  const encoded = [prepared.room, prepared.did, prepared.signature, prepared.nonce, prepared.text]
    .map((value) => encodeURIComponent(value));
  const url = new URL(`/r/${encoded[0]}/say-signed/${encoded[1]}/${encoded[2]}/${encoded[3]}/${encoded[4]}`, TECHNOCORE_ORIGIN);
  const expectedPath = `/r/${encoded[0]}/say-signed/${encoded[1]}/${encoded[2]}/${encoded[3]}/${encoded[4]}`;
  if (
    url.protocol !== "https:" ||
    url.hostname !== "technocore.chat" ||
    url.username !== "" ||
    url.password !== "" ||
    url.port !== "" ||
    url.pathname !== expectedPath ||
    url.search !== "" ||
    url.hash !== ""
  ) {
    throw new PublishAttemptError("INVALID_DESTINATION", "Signed write destination is invalid.");
  }
  return url;
}

export async function publishPreparedMessage(
  prepared: PreparedSignedMessage,
  attempts: PublishAttemptSession,
  options: BrowserPublishOptions = {},
): Promise<PublishAttemptResult> {
  await assertPreparedMessage(prepared);
  const timeoutMs = options.timeoutMs ?? PUBLISH_REQUEST_TIMEOUT_MS;
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs <= 0 || timeoutMs > PUBLISH_REQUEST_TIMEOUT_MS) {
    throw new PublishAttemptError("INVALID_TIMEOUT", "Publish timeout is outside the allowed range.");
  }
  const url = buildAndValidateWriteUrl(prepared);
  const fetcher = options.fetch ?? globalThis.fetch;
  const controller = new AbortController();
  attempts.begin(prepared);
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetcher(url, {
      method: "GET",
      body: null,
      cache: "no-store",
      credentials: "omit",
      redirect: "error",
      referrerPolicy: "no-referrer",
      signal: controller.signal,
    });
    attempts.finish(prepared, "RESPONSE_RECEIVED");
    return Object.freeze({
      state: "RESPONSE_RECEIVED",
      status: response.status,
    });
  } catch {
    attempts.finish(prepared, "OUTCOME_UNKNOWN");
    return Object.freeze({ state: "OUTCOME_UNKNOWN", message: UNKNOWN_MESSAGE });
  } finally {
    clearTimeout(timeout);
  }
}
