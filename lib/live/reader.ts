import type { OperationalError } from "../domain";
import { buildRoomReadUrl, InputValidationError } from "./endpoint";
import { LiveResponseError, parseRoomReadJson } from "./parser";
import { LIVE_REQUEST_TIMEOUT_MS, LIVE_RESPONSE_MAX_BYTES, TECHNOCORE_ORIGIN, type ReaderOptions, type ReadResult, type RoomReadPayload } from "./types";

const operational = (code: string, message: string, context?: Readonly<Record<string, unknown>>): OperationalError => ({ code, message, ...(context === undefined ? {} : { context }) });

async function readBoundedBody(response: Response, maxBytes: number): Promise<string> {
  const declared = response.headers.get("content-length");
  if (declared !== null && /^\d+$/u.test(declared) && BigInt(declared) > BigInt(maxBytes)) throw new LiveResponseError("UNSUPPORTED_RESPONSE", "Technocore response exceeds the configured byte limit.");
  if (response.body === null) return "";
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let size = 0;
  let text = "";
  while (true) {
    const chunk = await reader.read();
    if (chunk.done) break;
    size += chunk.value.byteLength;
    if (size > maxBytes) { await reader.cancel(); throw new LiveResponseError("UNSUPPORTED_RESPONSE", "Technocore response exceeds the configured byte limit."); }
    text += decoder.decode(chunk.value, { stream: true });
  }
  return text + decoder.decode();
}

export async function readRoom(room: string, options: ReaderOptions = {}): Promise<ReadResult<RoomReadPayload>> {
  let url: URL;
  try { url = buildRoomReadUrl(room, options.since, options.waitSeconds); }
  catch (cause) { return { ok: false, error: operational(cause instanceof InputValidationError ? cause.code : "INVALID_INPUT", cause instanceof Error ? cause.message : "Room input is invalid.") }; }
  const fetcher = options.fetch ?? fetch;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? (options.waitSeconds === undefined ? LIVE_REQUEST_TIMEOUT_MS : (options.waitSeconds + 2) * 1_000));
  const abortFromCaller = () => controller.abort();
  options.signal?.addEventListener("abort", abortFromCaller, { once: true });
  try {
    const response = await fetcher(url, { method: "GET", redirect: "manual", signal: controller.signal, headers: { accept: "application/json" } });
    if (response.status >= 300 && response.status < 400) return { ok: false, error: operational("REDIRECT_REJECTED", "Technocore redirects are rejected by the safe reader.") };
    if (!response.ok) return { ok: false, error: operational(response.status >= 500 ? "HTTP_SERVER_ERROR" : "HTTP_CLIENT_ERROR", "Technocore returned an unsuccessful HTTP status.", { status: response.status }) };
    if (response.url !== "") {
      const finalUrl = new URL(response.url);
      if (finalUrl.origin !== TECHNOCORE_ORIGIN || finalUrl.href !== url.href) return { ok: false, error: operational("ORIGIN_MISMATCH", "The response did not come from the exact approved Technocore read endpoint.") };
    }
    const contentType = response.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase();
    if (contentType !== "application/json") return { ok: false, error: operational("UNSUPPORTED_CONTENT_TYPE", "Technocore did not return the required JSON representation.") };
    const body = await readBoundedBody(response, options.maxResponseBytes ?? LIVE_RESPONSE_MAX_BYTES);
    return { ok: true, value: parseRoomReadJson(body, room) };
  } catch (cause) {
    if (cause instanceof LiveResponseError) return { ok: false, error: operational(cause.code === "MALFORMED_RESPONSE" ? "MALFORMED_RESPONSE" : "UNSUPPORTED_RESPONSE", cause.message) };
    if (controller.signal.aborted) return { ok: false, error: operational("NETWORK_TIMEOUT", "The Technocore read timed out.") };
    return { ok: false, error: operational("NETWORK_FAILURE", "The Technocore read failed.") };
  } finally { clearTimeout(timeout); options.signal?.removeEventListener("abort", abortFromCaller); }
}
