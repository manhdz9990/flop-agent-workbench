import type { OperationalError } from "../domain";
import type { ProtocolRecord } from "../protocol";
import { DEFAULT_EXPORT_LIMITS, type ExportLimits, type ParsedExport } from "./types";

const encoder = new TextEncoder();
const error = (code: string, message: string, context?: Readonly<Record<string, unknown>>): OperationalError =>
  ({ code, message, ...(context === undefined ? {} : { context }) });

function isProtocolRecord(value: unknown): value is ProtocolRecord {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return typeof record.from === "string" && typeof record.text === "string"
    && (record.nonce === undefined || typeof record.nonce === "string")
    && (record.sig === undefined || typeof record.sig === "string")
    && (record.seq === undefined || typeof record.seq === "string" || typeof record.seq === "number")
    && (record.ts === undefined || typeof record.ts === "string");
}

export function parseExportJsonl(input: string, limits: ExportLimits = DEFAULT_EXPORT_LIMITS): ParsedExport {
  const inputBytes = encoder.encode(input).byteLength;
  if (inputBytes > limits.maxBytes) return { records: [], operationalErrors: [error("EXPORT_TOO_LARGE", "The local export exceeds the configured byte limit.", { actualBytes: inputBytes, maxBytes: limits.maxBytes })] };
  if (input.length === 0) return { records: [], operationalErrors: [] };
  const lines = input.split("\n");
  if (lines.at(-1) === "") lines.pop();
  if (lines.length > limits.maxLines) return { records: [], operationalErrors: [error("EXPORT_TOO_MANY_LINES", "The local export exceeds the configured line limit.", { actualLines: lines.length, maxLines: limits.maxLines })] };

  const records: ParsedExport["records"][number][] = [];
  const operationalErrors: OperationalError[] = [];
  lines.forEach((rawLine, index) => {
    const lineNumber = index + 1;
    const lineBytes = encoder.encode(rawLine).byteLength;
    if (lineBytes > limits.maxLineBytes) { operationalErrors.push(error("EXPORT_LINE_TOO_LARGE", "An export line exceeds the configured byte limit.", { lineNumber, actualBytes: lineBytes, maxLineBytes: limits.maxLineBytes })); return; }
    if (rawLine.trim().length === 0) { operationalErrors.push(error("EXPORT_EMPTY_LINE", "An export line is empty.", { lineNumber })); return; }
    let value: unknown;
    try { value = JSON.parse(rawLine); } catch { operationalErrors.push(error("EXPORT_INVALID_JSON", "An export line is not valid JSON.", { lineNumber })); return; }
    if (!isProtocolRecord(value)) { operationalErrors.push(error("EXPORT_INVALID_RECORD", "An export line is not a supported Technocore record; nonce must remain text when present.", { lineNumber })); return; }
    records.push({ lineNumber, rawLine, record: value });
  });
  return { records, operationalErrors };
}
