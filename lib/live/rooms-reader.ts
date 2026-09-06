import type { OperationalError } from "../domain";
import { buildRoomsDiscoveryUrl } from "./rooms-endpoint";
import { RoomsDiscoveryError, parseRoomsDiscoveryText } from "./rooms-parser";
import {
  DISCOVERY_RESPONSE_MAX_BYTES,
  LIVE_REQUEST_TIMEOUT_MS,
  TECHNOCORE_ORIGIN,
  type ReaderOptions,
  type ReadResult,
  type RoomsDiscoveryPayload,
} from "./types";

/**
 * V11-02 — Safe Public Room Discovery reader.
 *
 * Reuses the exact security pattern already verified for `readRoom` in
 * `./reader.ts` (fixed origin, GET only, manual redirect handling, an
 * abort-based timeout, and a byte-bounded streaming body read) rather than
 * introducing a new generic fetch layer. This module intentionally does
 * not import from `./reader.ts` so the already-verified per-room reader is
 * left completely untouched.
 *
 * This performs at most one outbound request per call, to a hard-coded
 * destination. There is no pagination, no polling, no `/events` stream,
 * and no caller-supplied destination of any kind.
 */

const operational = (code: string, message: string, context?: Readonly<Record<string, unknown>>): OperationalError => ({
  code,
  message,
  ...(context === undefined ? {} : { context }),
});

async function readBoundedText(response: Response, maxBytes: number): Promise<string> {
  const declared = response.headers.get("content-length");
  if (declared !== null && /^\d+$/u.test(declared) && BigInt(declared) > BigInt(maxBytes)) {
    throw new RoomsDiscoveryError("UNSUPPORTED_RESPONSE", "Technocore rooms discovery response exceeds the configured byte limit.");
  }
  if (response.body === null) return "";
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let size = 0;
  let text = "";
  while (true) {
    const chunk = await reader.read();
    if (chunk.done) break;
    size += chunk.value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      throw new RoomsDiscoveryError("UNSUPPORTED_RESPONSE", "Technocore rooms discovery response exceeds the configured byte limit.");
    }
    text += decoder.decode(chunk.value, { stream: true });
  }
  return text + decoder.decode();
}

export async function readRoomsDiscovery(options: ReaderOptions = {}): Promise<ReadResult<RoomsDiscoveryPayload>> {
  const url = buildRoomsDiscoveryUrl();
  const fetcher = options.fetch ?? fetch;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? LIVE_REQUEST_TIMEOUT_MS);
  try {
    const response = await fetcher(url, {
      method: "GET",
      redirect: "manual",
      signal: controller.signal,
      headers: { accept: "text/plain" },
    });
    if (response.status >= 300 && response.status < 400) {
      return { ok: false, error: operational("REDIRECT_REJECTED", "Technocore rooms discovery redirects are rejected by the safe reader.") };
    }
    if (!response.ok) {
      return {
        ok: false,
        error: operational(response.status >= 500 ? "HTTP_SERVER_ERROR" : "HTTP_CLIENT_ERROR", "Technocore returned an unsuccessful HTTP status.", { status: response.status }),
      };
    }
    if (response.url !== "") {
      const finalUrl = new URL(response.url);
      if (finalUrl.origin !== TECHNOCORE_ORIGIN || finalUrl.href !== url.href) {
        return { ok: false, error: operational("ORIGIN_MISMATCH", "The response did not come from the exact approved rooms discovery endpoint.") };
      }
    }
    const contentType = response.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase();
    if (contentType !== "text/plain") {
      return { ok: false, error: operational("UNSUPPORTED_CONTENT_TYPE", "Technocore did not return the required plain-text rooms listing.") };
    }
    const body = await readBoundedText(response, options.maxResponseBytes ?? DISCOVERY_RESPONSE_MAX_BYTES);
    return { ok: true, value: parseRoomsDiscoveryText(body) };
  } catch (cause) {
    if (cause instanceof RoomsDiscoveryError) return { ok: false, error: operational(cause.code, cause.message) };
    if (controller.signal.aborted) return { ok: false, error: operational("NETWORK_TIMEOUT", "The Technocore rooms discovery read timed out.") };
    return { ok: false, error: operational("NETWORK_FAILURE", "The Technocore rooms discovery read failed.") };
  } finally {
    clearTimeout(timeout);
  }
}
