import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  buildTranscriptVerificationPipeline,
  diagnoseExportTranscript,
  diagnoseLiveTranscript,
} from "../../lib/diagnostics";
import type { ProtocolRecord } from "../../lib/protocol";
import {
  EVIDENCE_RECEIPT_SCHEMA,
  createEvidenceReceipt,
  createReceiptDownload,
  serializeEvidenceReceiptJson,
  serializeEvidenceReceiptMarkdown,
} from "../../lib/receipt";

interface Fixture { room: string; record: Required<ProtocolRecord> }

const fixture = JSON.parse(
  readFileSync(new URL("../fixtures/protocol/known-good.json", import.meta.url), "utf8"),
) as Fixture;
const tclk = JSON.parse(
  readFileSync(new URL("../fixtures/tclk/official-frames.json", import.meta.url), "utf8"),
) as Record<"receipt", string>;

async function receiptFor(record: ProtocolRecord, inputKind: "ROOM" | "MESSAGE" | "EXPORT" = "EXPORT") {
  const transcript = await diagnoseExportTranscript(fixture.room, JSON.stringify(record));
  const pipeline = buildTranscriptVerificationPipeline(inputKind, transcript);
  return createEvidenceReceipt(pipeline, { transcript });
}

describe("V11-05 canonical Evidence Receipt", () => {
  it("uses one versioned canonical model with stable field and stage ordering", async () => {
    const receipt = await receiptFor(fixture.record);
    expect(receipt.schema).toBe(EVIDENCE_RECEIPT_SCHEMA);
    expect(Object.keys(receipt)).toEqual([
      "schema", "source", "evidenceVerdict", "diagnosticStages",
      "firstFailedBoundary", "firstUnavailableBoundary", "operationalObservations",
      "sequenceGaps", "tclk", "limitations",
    ]);
    expect(receipt.diagnosticStages.map((item) => item.stage)).toEqual([
      "SOURCE_AVAILABILITY", "RECORD_PARSING", "MESSAGE_CLASSIFICATION", "DID_STRUCTURE",
      "DID_DECODING", "NONCE_EVIDENCE", "SWEEP_TRANSFORMATION", "CANONICAL_PAYLOAD",
      "SIGNATURE_REPRESENTATION", "ED25519_VERIFICATION", "TCLK_RECOGNITION", "TCLK_STRUCTURAL_BINDING",
    ]);
  });

  it("produces byte-stable JSON and Markdown without dynamic timestamps", async () => {
    const receipt = await receiptFor(fixture.record);
    const jsonA = serializeEvidenceReceiptJson(receipt);
    const jsonB = serializeEvidenceReceiptJson(await receiptFor(fixture.record));
    const markdownA = serializeEvidenceReceiptMarkdown(receipt);
    const markdownB = serializeEvidenceReceiptMarkdown(await receiptFor(fixture.record));
    expect(jsonA).toBe(jsonB);
    expect(markdownA).toBe(markdownB);
    expect(jsonA).not.toMatch(/createdAt|generatedAt|downloadTime|\d{4}-\d{2}-\d{2}T/u);
    expect(markdownA).not.toMatch(/createdAt|generatedAt|downloadTime|\d{4}-\d{2}-\d{2}T/u);
  });

  it("serializes JSON as the canonical model and Markdown from the same fields", async () => {
    const receipt = await receiptFor(fixture.record);
    expect(JSON.parse(serializeEvidenceReceiptJson(receipt))).toEqual(receipt);
    const markdown = serializeEvidenceReceiptMarkdown(receipt);
    expect(markdown).toContain(EVIDENCE_RECEIPT_SCHEMA);
    expect(markdown).toContain("Evidence Verdict: `VALID`");
    for (const stage of receipt.diagnosticStages) {
      expect(markdown).toContain(stage.stage);
      expect(markdown).toContain(stage.whatThisMeans);
      expect(markdown).toContain(stage.checkNext);
    }
  });

  it("excludes raw transcript/export content, unrelated records, paths, and error context", async () => {
    const secretLikeRaw = "<script>owned</script> token=secret C:\\private\\room.jsonl";
    const transcript = await diagnoseExportTranscript("lobby", [
      JSON.stringify({ from: "alice", text: secretLikeRaw, seq: "1" }),
      JSON.stringify({ from: "bob", text: "unrelated-private-record", seq: "2" }),
    ].join("\n"), { selectedIndex: 0 });
    const pipeline = buildTranscriptVerificationPipeline("EXPORT", transcript);
    const serialized = serializeEvidenceReceiptJson(createEvidenceReceipt(pipeline, { transcript }));
    expect(serialized).not.toContain(secretLikeRaw);
    expect(serialized).not.toContain("unrelated-private-record");
    expect(serialized).not.toContain("rawLine");
    expect(serialized).not.toContain("C:\\\\private");

    const failed = await diagnoseLiveTranscript("lobby", {
      ok: false,
      error: { code: "NETWORK_FAILURE", message: "Read failed.", context: { path: "C:\\private\\file" } },
    });
    const failedReceipt = createEvidenceReceipt(buildTranscriptVerificationPipeline("ROOM", failed), { transcript: failed });
    expect(failedReceipt.operationalObservations).toEqual([{ code: "NETWORK_FAILURE", message: "Read failed." }]);
    expect(serializeEvidenceReceiptJson(failedReceipt)).not.toContain("private");
  });

  it.each([
    ["VALID", fixture.record],
    ["INVALID", { ...fixture.record, text: `${fixture.record.text}!` }],
    ["UNSIGNED", { from: "alice", text: "hello" }],
    ["UNVERIFIABLE", { ...fixture.record, sig: undefined }],
  ] as const)("preserves the existing %s Evidence Verdict separately from stage status", async (verdict, record) => {
    const receipt = await receiptFor(record);
    expect(receipt.evidenceVerdict).toBe(verdict);
    expect(receipt.diagnosticStages.map((stage) => String(stage.status))).not.toContain(verdict);
  });

  it("preserves failed and conditional unavailable boundaries with deterministic guidance", async () => {
    const failed = await receiptFor({ ...fixture.record, sig: `${fixture.record.sig}=` });
    expect(failed.evidenceVerdict).toBe("UNVERIFIABLE");
    expect(failed.firstFailedBoundary?.stage).toBe("SIGNATURE_REPRESENTATION");
    expect(failed.firstUnavailableBoundary).toBeNull();
    const failedStage = failed.diagnosticStages.find((item) => item.stage === "SIGNATURE_REPRESENTATION");
    expect(failedStage?.whatThisMeans).toBe("The signature value does not have the expected representation.");
    expect(failedStage?.checkNext).toBe("Check the signature field's encoding and length.");

    const unavailable = await receiptFor({ ...fixture.record, sig: undefined });
    expect(unavailable.firstFailedBoundary).toBeNull();
    expect(unavailable.firstUnavailableBoundary?.stage).toBe("SIGNATURE_REPRESENTATION");
  });

  it("keeps gaps cause-neutral and preserves retained-window limitations", async () => {
    const transcript = await diagnoseExportTranscript("lobby", [
      JSON.stringify({ from: "alice", text: "one", seq: "1" }),
      JSON.stringify({ from: "alice", text: "three", seq: "3" }),
    ].join("\n"));
    const receipt = createEvidenceReceipt(buildTranscriptVerificationPipeline("EXPORT", transcript), { transcript });
    expect(receipt.sequenceGaps[0]?.observation).toContain("does not establish its cause");
    expect(receipt.limitations.join(" ")).toContain("may not represent complete history");
  });

  it("includes the VALID limitation without identity, truth, or trust claims", async () => {
    const receipt = await receiptFor(fixture.record);
    expect(receipt.limitations.join(" ")).toContain("does not prove identity, truth, trust");
  });

  it("keeps tclk absent or summarized without raw frame or execution conclusions", async () => {
    const absent = await receiptFor({ from: "alice", text: "ordinary" });
    expect(absent.tclk).toEqual({ status: "NOT_TCLK" });

    const observed = await receiptFor({ from: "alice", text: tclk.receipt });
    expect(observed.tclk).toMatchObject({ status: "RECOGNIZED", frameType: "receipt", transportAuthenticated: false });
    const serialized = `${serializeEvidenceReceiptJson(observed)}${serializeEvidenceReceiptMarkdown(observed)}`.toLowerCase();
    expect(serialized).not.toContain(tclk.receipt.toLowerCase());
    for (const forbidden of ["root cause", "settlement success", "payment verified", "work completed", "flop transferred"]) {
      expect(serialized).not.toContain(forbidden);
    }
    expect(observed.limitations.join(" ")).toContain("do not prove execution, settlement, payment");
  });

  it("creates deterministic browser-local download descriptors for both formats", async () => {
    const receipt = await receiptFor(fixture.record);
    const json = createReceiptDownload(receipt, "json");
    const markdown = createReceiptDownload(receipt, "markdown");
    expect(json).toEqual({
      filename: "technocore-evidence-receipt.json",
      mimeType: "application/json",
      content: serializeEvidenceReceiptJson(receipt),
    });
    expect(markdown).toEqual({
      filename: "technocore-evidence-receipt.md",
      mimeType: "text/markdown",
      content: serializeEvidenceReceiptMarkdown(receipt),
    });
  });
});
