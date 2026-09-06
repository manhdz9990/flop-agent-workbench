import type { ProtocolRecord } from "../protocol";
import type { RoomReadPayload } from "./types";

export class LiveResponseError extends Error {
  constructor(readonly code: "MALFORMED_RESPONSE" | "UNSUPPORTED_RESPONSE", message: string) {
    super(message);
    this.name = "LiveResponseError";
  }
}

function preserveNumericNonceTokens(input: string): string {
  let output = "";
  let index = 0;
  while (index < input.length) {
    if (input[index] !== '"') { output += input[index]; index += 1; continue; }
    const start = index;
    index += 1;
    while (index < input.length) {
      if (input[index] === "\\") { index += 2; continue; }
      if (input[index] === '"') { index += 1; break; }
      index += 1;
    }
    const token = input.slice(start, index);
    output += token;
    let cursor = index;
    while (/\s/u.test(input[cursor] ?? "")) cursor += 1;
    if (input[cursor] !== ":") continue;
    let key: unknown;
    try { key = JSON.parse(token); } catch { continue; }
    if (key !== "nonce") continue;
    output += input.slice(index, cursor + 1);
    cursor += 1;
    const whitespaceStart = cursor;
    while (/\s/u.test(input[cursor] ?? "")) cursor += 1;
    output += input.slice(whitespaceStart, cursor);
    const match = /^(\d{1,19})(?=\s*[,}])/u.exec(input.slice(cursor));
    if (match === null) { index = cursor; continue; }
    output += `"${match[1]}"`;
    index = cursor + match[1].length;
  }
  return output;
}

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const isSequence = (value: unknown): value is string | number =>
  (typeof value === "string" && /^(?:0|[1-9]\d*)$/u.test(value)) || (typeof value === "number" && Number.isSafeInteger(value) && value >= 0);

function parseRecord(value: unknown): ProtocolRecord | undefined {
  if (!isObject(value) || typeof value.from !== "string" || typeof value.text !== "string" || !isSequence(value.seq) || typeof value.ts !== "string") return undefined;
  if (value.nonce !== undefined && (typeof value.nonce !== "string" || !/^\d{1,19}$/u.test(value.nonce))) return undefined;
  if (value.sig !== undefined && typeof value.sig !== "string") return undefined;
  return { from: value.from, text: value.text, seq: String(value.seq), ts: value.ts, ...(value.nonce === undefined ? {} : { nonce: value.nonce }), ...(value.sig === undefined ? {} : { sig: value.sig }) };
}

export function parseRoomReadJson(input: string, expectedRoom: string): RoomReadPayload {
  let value: unknown;
  try { value = JSON.parse(preserveNumericNonceTokens(input)); }
  catch { throw new LiveResponseError("MALFORMED_RESPONSE", "Technocore returned malformed JSON."); }
  if (!isObject(value) || value.room !== expectedRoom || typeof value.count !== "number" || !Number.isSafeInteger(value.count) || value.count < 0 || value.count > 200 || !isSequence(value.last_seq) || !Array.isArray(value.messages) || value.messages.length > 200) {
    throw new LiveResponseError("UNSUPPORTED_RESPONSE", "Technocore returned an unsupported room response shape.");
  }
  const firstSeq = value.first_seq === null || value.first_seq === undefined ? null : isSequence(value.first_seq) ? String(value.first_seq) : undefined;
  if (firstSeq === undefined) throw new LiveResponseError("UNSUPPORTED_RESPONSE", "Technocore returned invalid first-sequence metadata.");
  const messages = value.messages.map(parseRecord);
  if (messages.some((record) => record === undefined)) throw new LiveResponseError("UNSUPPORTED_RESPONSE", "Technocore returned an unsupported message record.");
  if (value.count !== messages.length) throw new LiveResponseError("UNSUPPORTED_RESPONSE", "Technocore response count does not match its message array.");
  const generation = value.generation === undefined ? undefined : isSequence(value.generation) ? String(value.generation) : null;
  if (generation === null) throw new LiveResponseError("UNSUPPORTED_RESPONSE", "Technocore returned invalid generation metadata.");
  return { room: expectedRoom, count: value.count, firstSeq, lastSeq: String(value.last_seq), ...(generation === undefined ? {} : { generation }), messages: messages as ProtocolRecord[] };
}
