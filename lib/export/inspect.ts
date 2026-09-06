import type { EvidenceField, MessageEvidence, OperationalError, VerificationState, Warning } from "../domain";
import { ProtocolInputError, verifyProtocolRecord } from "../protocol";
import { analyzeTclkRecord } from "../tclk";
import { parseExportJsonl } from "./parser";
import { detectSequenceGaps, firstObservedSequenceWarning, GENERATION_UNAVAILABLE_WARNING, RETAINED_WINDOW_WARNING } from "./transcript";
import type { ExportInspection, ExportLimits, ExportMetadata, ParsedExportRecord } from "./types";

function fieldsFor(room: string, parsed: ParsedExportRecord, state: VerificationState): readonly EvidenceField[] {
  const { record } = parsed;
  const payloadAuthority = state === "VALID" ? "SIGNED" : "UNTRUSTED_CALLER_DATA";
  const fields: EvidenceField[] = [
    { name: "room", value: room, authority: payloadAuthority },
    { name: "text", value: record.text, authority: payloadAuthority },
    { name: "textMeaning", value: record.text, authority: "UNTRUSTED_CALLER_DATA" },
    { name: "from", value: record.from, authority: "UNTRUSTED_CALLER_DATA" },
  ];
  if (record.sig !== undefined) fields.push({ name: "signature", value: record.sig, authority: "UNTRUSTED_CALLER_DATA" });
  if (record.nonce !== undefined) fields.push({ name: "nonce", value: record.nonce, authority: payloadAuthority });
  if (record.seq !== undefined) fields.push({ name: "seq", value: record.seq, authority: "SERVER_ASSERTED_UNSIGNED" });
  if (record.ts !== undefined) fields.push({ name: "ts", value: record.ts, authority: "SERVER_ASSERTED_UNSIGNED" });
  return fields;
}

function verificationError(parsed: ParsedExportRecord, cause: unknown): OperationalError {
  return { code: cause instanceof ProtocolInputError ? cause.code : "VERIFICATION_FAILED", message: cause instanceof Error ? cause.message : "The record could not be verified.", context: { lineNumber: parsed.lineNumber } };
}

export async function inspectLocalExport(room: string, input: string, metadata: ExportMetadata = {}, limits?: ExportLimits): Promise<ExportInspection> {
  const parsed = parseExportJsonl(input, limits);
  const messages: MessageEvidence[] = [];
  const operationalErrors = [...parsed.operationalErrors];
  for (const item of parsed.records) {
    try {
      const verificationState = await verifyProtocolRecord(room, item.record);
      const tclk = await analyzeTclkRecord(item.record, verificationState);
      messages.push({
        verificationState,
        fields: fieldsFor(room, item, verificationState),
        warnings: [],
        ...(tclk.detection.status === "RECOGNIZED" ? {
          protocolAnnotations: [{
            protocol: "tclk/1",
            type: tclk.detection.frameType,
            summary: tclk.detection.explanation,
            authority: "UNTRUSTED_CALLER_DATA" as const,
            transportAuthenticated: tclk.transportAuthenticated,
            warnings: [tclk.detection.warning, ...(tclk.transportWarning === undefined ? [] : [tclk.transportWarning])],
          }],
        } : {}),
      });
    }
    catch (cause) { operationalErrors.push(verificationError(item, cause)); }
  }
  const gaps = detectSequenceGaps(parsed.records);
  const warnings: Warning[] = [RETAINED_WINDOW_WARNING, ...gaps.map((gap) => gap.warning)];
  const firstSequenceWarning = firstObservedSequenceWarning(parsed.records);
  if (firstSequenceWarning !== undefined) warnings.push(firstSequenceWarning);
  if (metadata.generation === undefined) warnings.push(GENERATION_UNAVAILABLE_WARNING);
  return { metadata, gaps, report: { inputKind: "EXPORT", messages, warnings, operationalErrors } };
}
