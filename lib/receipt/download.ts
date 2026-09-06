import { serializeEvidenceReceiptJson, serializeEvidenceReceiptMarkdown } from "./serialize";
import type { EvidenceReceipt, EvidenceReceiptFormat, ReceiptDownload } from "./types";

export function createReceiptDownload(receipt: EvidenceReceipt, format: EvidenceReceiptFormat): ReceiptDownload {
  return format === "json"
    ? { filename: "technocore-evidence-receipt.json", mimeType: "application/json", content: serializeEvidenceReceiptJson(receipt) }
    : { filename: "technocore-evidence-receipt.md", mimeType: "text/markdown", content: serializeEvidenceReceiptMarkdown(receipt) };
}

export function downloadReceiptLocally(download: ReceiptDownload): void {
  const url = URL.createObjectURL(new Blob([download.content], { type: `${download.mimeType};charset=utf-8` }));
  try {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = download.filename;
    anchor.rel = "noopener";
    anchor.click();
  } finally {
    URL.revokeObjectURL(url);
  }
}
