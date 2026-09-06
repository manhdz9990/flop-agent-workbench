import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  DIAGNOSTIC_STAGES,
  diagnoseExportTranscript,
  diagnoseLiveTranscript,
} from "../../lib/diagnostics";
import type { ProtocolRecord } from "../../lib/protocol";

interface Fixture { room: string; record: Required<ProtocolRecord> }

const fixture = JSON.parse(
  readFileSync(new URL("../fixtures/protocol/known-good.json", import.meta.url), "utf8"),
) as Fixture;
const tclk = JSON.parse(
  readFileSync(new URL("../fixtures/tclk/official-frames.json", import.meta.url), "utf8"),
) as Record<"receipt", string>;

function status(result: Awaited<ReturnType<typeof diagnoseExportTranscript>>, stage: string): string | undefined {
  return result.selectedRecord?.stages.find((item) => item.stage === stage)?.status;
}

describe("V11-03 transcript diagnostics adapter", () => {
  it("adapts a valid parsed transcript into all 12 ordered stages", async () => {
    const result = await diagnoseExportTranscript(fixture.room, JSON.stringify(fixture.record));

    expect(result.summary).toMatchObject({ kind: "LOCAL_EXPORT", available: true, parsedRecordCount: 1, malformedRecordCount: 0 });
    expect(result.selectedRecord?.stages.map((item) => item.stage)).toEqual(DIAGNOSTIC_STAGES);
    expect(result.selectedRecord?.stages).toHaveLength(12);
    expect(result.selectedRecord?.stages.every((item) => item.whatThisMeans.length > 0 && item.checkNext.length > 0)).toBe(true);
    expect(result.selectedRecord?.evidenceVerdict).toBe("VALID");
    expect(status(result, "ED25519_VERIFICATION")).toBe("PASS");
    expect(result.selectedRecord?.firstFailedBoundary).toBeNull();
    expect(result.selectedRecord?.firstUnavailableBoundary).toBeNull();
  });

  it("accepts a valid empty transcript without fabricating records or boundaries", async () => {
    const result = await diagnoseExportTranscript("lobby", "");
    expect(result.summary).toMatchObject({ available: true, parsedRecordCount: 0, malformedRecordCount: 0 });
    expect(result.records).toEqual([]);
    expect(result.selectedRecord).toBeNull();
    expect(result.operationalErrors).toEqual([]);
  });

  it("tracks malformed lines separately from parsed records in mixed input", async () => {
    const input = [
      JSON.stringify({ from: "alice", text: "first", seq: "1" }),
      "not-json",
      JSON.stringify({ from: "bob", text: "second", seq: "3" }),
    ].join("\n");
    const result = await diagnoseExportTranscript("lobby", input);

    expect(result.summary).toMatchObject({ parsedRecordCount: 2, malformedRecordCount: 1 });
    expect(result.records).toHaveLength(2);
    expect(result.operationalErrors).toEqual([expect.objectContaining({ code: "EXPORT_INVALID_JSON" })]);
    expect(result.gaps[0]?.warning.message).toContain("does not establish its cause");
    expect(result.summary.coverage.toLowerCase()).toContain("does not claim complete history");
  });

  it("selects earliest FAIL and suppresses unavailable boundary when both occur", async () => {
    const result = await diagnoseExportTranscript("lobby", JSON.stringify({
      from: "did:key:bad",
      text: "message",
      nonce: "1",
      sig: "bad",
    }));
    expect(result.selectedRecord?.firstFailedBoundary?.stage).toBe("DID_DECODING");
    expect(result.selectedRecord?.firstUnavailableBoundary).toBeNull();
    expect(result.selectedRecord?.evidenceVerdict).toBeUndefined();
  });

  it("selects UNAVAILABLE only when no FAIL exists and ignores NOT_APPLICABLE", async () => {
    const record = { ...fixture.record, sig: undefined };
    const result = await diagnoseExportTranscript(fixture.room, JSON.stringify(record));
    expect(result.selectedRecord?.evidenceVerdict).toBe("UNVERIFIABLE");
    expect(result.selectedRecord?.firstFailedBoundary).toBeNull();
    expect(result.selectedRecord?.firstUnavailableBoundary?.stage).toBe("SIGNATURE_REPRESENTATION");
    expect(status(result, "TCLK_RECOGNITION")).toBe("NOT_APPLICABLE");
    expect(status(result, "TCLK_STRUCTURAL_BINDING")).toBe("NOT_APPLICABLE");
  });

  it("keeps malformed signature diagnostics separate and never reinterprets them as INVALID", async () => {
    const record = { ...fixture.record, sig: `${fixture.record.sig}=` };
    const result = await diagnoseExportTranscript(fixture.room, JSON.stringify(record));
    expect(result.selectedRecord?.evidenceVerdict).toBe("UNVERIFIABLE");
    expect(status(result, "SIGNATURE_REPRESENTATION")).toBe("FAIL");
    expect(status(result, "ED25519_VERIFICATION")).toBe("UNAVAILABLE");
    expect(result.selectedRecord?.firstFailedBoundary?.stage).toBe("SIGNATURE_REPRESENTATION");
  });

  it("preserves genuine cryptographic INVALID only after usable prerequisites", async () => {
    const record = { ...fixture.record, text: `${fixture.record.text}!` };
    const result = await diagnoseExportTranscript(fixture.room, JSON.stringify(record));
    expect(status(result, "DID_DECODING")).toBe("PASS");
    expect(status(result, "NONCE_EVIDENCE")).toBe("PASS");
    expect(status(result, "CANONICAL_PAYLOAD")).toBe("PASS");
    expect(status(result, "SIGNATURE_REPRESENTATION")).toBe("PASS");
    expect(status(result, "ED25519_VERIFICATION")).toBe("FAIL");
    expect(result.selectedRecord?.evidenceVerdict).toBe("INVALID");
  });

  it("preserves legacy unsigned semantics", async () => {
    const result = await diagnoseExportTranscript("lobby", JSON.stringify({ from: "alice", text: "hello" }));
    expect(result.selectedRecord?.evidenceVerdict).toBe("UNSIGNED");
    expect(status(result, "DID_STRUCTURE")).toBe("NOT_APPLICABLE");
    expect(status(result, "ED25519_VERIFICATION")).toBe("NOT_APPLICABLE");
    expect(result.selectedRecord?.firstFailedBoundary).toBeNull();
    expect(result.selectedRecord?.firstUnavailableBoundary).toBeNull();
  });

  it("keeps live operational errors separate from stage verdicts", async () => {
    const error = { code: "NETWORK_TIMEOUT", message: "The read timed out." };
    const result = await diagnoseLiveTranscript("lobby", { ok: false, error });
    expect(result.summary).toMatchObject({ kind: "LIVE_ROOM", available: false, parsedRecordCount: 0 });
    expect(result.operationalErrors).toEqual([error]);
    expect(result.records).toEqual([]);
    expect(JSON.stringify(result)).not.toContain('"evidenceVerdict"');
  });

  it("adapts an observed live-room transcript without another network read", async () => {
    const result = await diagnoseLiveTranscript(fixture.room, {
      ok: true,
      value: { room: fixture.room, count: 1, firstSeq: "1", lastSeq: "1", messages: [fixture.record] },
    });
    expect(result.summary).toMatchObject({ kind: "LIVE_ROOM", available: true, parsedRecordCount: 1 });
    expect(result.selectedRecord?.evidenceVerdict).toBe("VALID");
  });

  it("reports bounded tclk absence and observed structural/binding behavior", async () => {
    const absent = await diagnoseExportTranscript("lobby", JSON.stringify({ from: "alice", text: "ordinary message" }));
    expect(status(absent, "TCLK_RECOGNITION")).toBe("NOT_APPLICABLE");
    expect(absent.selectedRecord?.tclkObservation.detection.status).toBe("NOT_TCLK");

    const observed = await diagnoseExportTranscript("lobby", JSON.stringify({ from: "alice", text: tclk.receipt }));
    expect(status(observed, "TCLK_RECOGNITION")).toBe("PASS");
    expect(status(observed, "TCLK_STRUCTURAL_BINDING")).toBe("FAIL");
    expect(observed.selectedRecord?.tclkObservation).toMatchObject({
      detection: { status: "RECOGNIZED", frameType: "receipt" },
      transportAuthenticated: false,
    });
    expect(JSON.stringify(observed).toLowerCase()).not.toContain("settlement success");
  });

  it("keeps selected-record choice deterministic", async () => {
    const input = [
      JSON.stringify({ from: "alice", text: "first" }),
      JSON.stringify({ from: "bob", text: "second" }),
    ].join("\n");
    const result = await diagnoseExportTranscript("lobby", input, { selectedIndex: 1 });
    expect(result.selectedRecord?.index).toBe(1);
    expect(result.selectedRecord?.record.text).toBe("second");
  });
});
