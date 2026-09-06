import type { EvidenceReceipt } from "./types";

export function serializeEvidenceReceiptJson(receipt: EvidenceReceipt): string {
  return `${JSON.stringify(receipt, null, 2)}\n`;
}

function text(value: unknown): string {
  return String(value).replace(/\\/gu, "\\\\").replace(/\|/gu, "\\|").replace(/\r?\n/gu, " ").replace(/`/gu, "\\`");
}

function boundary(value: EvidenceReceipt["firstFailedBoundary"]): string {
  return value === null ? "None" : `${value.stage} (${value.status})${value.detail === undefined ? "" : ` — ${text(value.detail)}`}`;
}

export function serializeEvidenceReceiptMarkdown(receipt: EvidenceReceipt): string {
  const lines = [
    "# Technocore Evidence Receipt",
    "",
    `- Schema: \`${text(receipt.schema)}\``,
    `- Source kind: \`${text(receipt.source.kind)}\``,
    ...(receipt.source.room === undefined ? [] : [`- Room: \`${text(receipt.source.room)}\``]),
    ...(receipt.source.recordIndex === undefined ? [] : [`- Record index: \`${receipt.source.recordIndex}\``]),
    ...(receipt.source.lineNumber === undefined ? [] : [`- Line number: \`${receipt.source.lineNumber}\``]),
    ...(receipt.source.sequence === undefined ? [] : [`- Sequence: \`${text(receipt.source.sequence)}\``]),
    ...(receipt.source.did === undefined ? [] : [`- DID: \`${text(receipt.source.did)}\``]),
    `- Evidence Verdict: ${receipt.evidenceVerdict === undefined ? "Not available" : `\`${receipt.evidenceVerdict}\``}`,
    "",
    "## Diagnostic stages",
    "",
    "| # | Stage | Status | Detail | What this means | Check next |",
    "|---:|---|---|---|---|---|",
    ...receipt.diagnosticStages.map((item, index) =>
      `| ${index + 1} | ${text(item.stage)} | ${text(item.status)} | ${text(item.detail ?? "")} | ${text(item.whatThisMeans)} | ${text(item.checkNext)} |`,
    ),
    "",
    "## Boundaries",
    "",
    `- First failed boundary: ${boundary(receipt.firstFailedBoundary)}`,
    `- First unavailable boundary: ${boundary(receipt.firstUnavailableBoundary)}`,
    "",
    "## Operational observations",
    "",
    ...(receipt.operationalObservations.length === 0
      ? ["None."]
      : receipt.operationalObservations.map((item) => `- \`${text(item.code)}\`: ${text(item.message)}`)),
    "",
    "## Sequence gaps",
    "",
    ...(receipt.sequenceGaps.length === 0
      ? ["None observed in this receipt."]
      : receipt.sequenceGaps.map((gap) => `- ${text(gap.previous)} → ${text(gap.next)} (${text(gap.missingCount)} not observed): ${text(gap.observation)}`)),
    "",
    "## tclk observation",
    "",
    `- Status: \`${receipt.tclk.status}\``,
    ...(receipt.tclk.status === "MALFORMED_TCLK" ? [`- Warning: ${text(receipt.tclk.warning)}`] : []),
    ...(receipt.tclk.status === "RECOGNIZED" ? [
      `- Frame type: \`${text(receipt.tclk.frameType)}\``,
      `- Explanation: ${text(receipt.tclk.explanation)}`,
      `- Transport authenticated: \`${receipt.tclk.transportAuthenticated}\``,
      ...receipt.tclk.warnings.map((warning) => `- Warning: ${text(warning)}`),
    ] : []),
    "",
    "## Limitations",
    "",
    ...(receipt.limitations.length === 0 ? ["None recorded."] : receipt.limitations.map((item) => `- ${text(item)}`)),
    "",
  ];
  return lines.join("\n");
}
