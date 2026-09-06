import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  DIAGNOSTIC_STAGES,
  buildDidVerificationPipeline,
  buildTranscriptVerificationPipeline,
  diagnoseExportTranscript,
  diagnoseLiveTranscript,
  getDiagnosticCopy,
} from "../../lib/diagnostics";
import type { ProtocolRecord } from "../../lib/protocol";

interface Fixture { room: string; record: Required<ProtocolRecord> }

const fixture = JSON.parse(
  readFileSync(new URL("../fixtures/protocol/known-good.json", import.meta.url), "utf8"),
) as Fixture;
const tclk = JSON.parse(
  readFileSync(new URL("../fixtures/tclk/official-frames.json", import.meta.url), "utf8"),
) as Record<"receipt", string>;

async function exportPipeline(record: ProtocolRecord) {
  const diagnostics = await diagnoseExportTranscript(fixture.room, JSON.stringify(record));
  return buildTranscriptVerificationPipeline("EXPORT", diagnostics);
}

function status(pipeline: Awaited<ReturnType<typeof exportPipeline>>, stage: string): string | undefined {
  return pipeline.stages.find((item) => item.stage === stage)?.status;
}

describe("V11-04 canonical Verification Pipeline", () => {
  it("exposes exactly the locked 12 stages with deterministic central copy", async () => {
    const pipeline = await exportPipeline(fixture.record);
    expect(pipeline.stages.map((item) => item.stage)).toEqual(DIAGNOSTIC_STAGES);
    expect(pipeline.stages).toHaveLength(12);
    for (const item of pipeline.stages) {
      expect({ whatThisMeans: item.whatThisMeans, checkNext: item.checkNext }).toEqual(
        getDiagnosticCopy(item.stage, item.status),
      );
    }
  });

  it("preserves VALID with a passing Ed25519 stage", async () => {
    const pipeline = await exportPipeline(fixture.record);
    expect(pipeline.evidenceVerdict).toBe("VALID");
    expect(status(pipeline, "ED25519_VERIFICATION")).toBe("PASS");
    expect(pipeline.firstFailedBoundary).toBeNull();
  });

  it("preserves genuine cryptographic INVALID with usable prerequisites", async () => {
    const pipeline = await exportPipeline({ ...fixture.record, text: `${fixture.record.text}!` });
    expect(status(pipeline, "DID_DECODING")).toBe("PASS");
    expect(status(pipeline, "NONCE_EVIDENCE")).toBe("PASS");
    expect(status(pipeline, "CANONICAL_PAYLOAD")).toBe("PASS");
    expect(status(pipeline, "SIGNATURE_REPRESENTATION")).toBe("PASS");
    expect(status(pipeline, "ED25519_VERIFICATION")).toBe("FAIL");
    expect(pipeline.evidenceVerdict).toBe("INVALID");
  });

  it("keeps missing signature evidence UNVERIFIABLE and selects UNAVAILABLE only without FAIL", async () => {
    const pipeline = await exportPipeline({ ...fixture.record, sig: undefined });
    expect(pipeline.evidenceVerdict).toBe("UNVERIFIABLE");
    expect(status(pipeline, "SIGNATURE_REPRESENTATION")).toBe("UNAVAILABLE");
    expect(status(pipeline, "ED25519_VERIFICATION")).toBe("UNAVAILABLE");
    expect(pipeline.firstFailedBoundary).toBeNull();
    expect(pipeline.firstUnavailableBoundary?.stage).toBe("SIGNATURE_REPRESENTATION");
  });

  it("keeps malformed signature representation UNVERIFIABLE rather than INVALID", async () => {
    const pipeline = await exportPipeline({ ...fixture.record, sig: `${fixture.record.sig}=` });
    expect(pipeline.evidenceVerdict).toBe("UNVERIFIABLE");
    expect(status(pipeline, "SIGNATURE_REPRESENTATION")).toBe("FAIL");
    expect(status(pipeline, "ED25519_VERIFICATION")).toBe("UNAVAILABLE");
    expect(pipeline.firstFailedBoundary?.stage).toBe("SIGNATURE_REPRESENTATION");
    expect(pipeline.firstUnavailableBoundary).toBeNull();
  });

  it("preserves UNSIGNED and ignores non-applicable signing stages for boundaries", async () => {
    const pipeline = await exportPipeline({ from: "alice", text: "hello" });
    expect(pipeline.evidenceVerdict).toBe("UNSIGNED");
    for (const stage of ["DID_STRUCTURE", "DID_DECODING", "NONCE_EVIDENCE", "CANONICAL_PAYLOAD", "SIGNATURE_REPRESENTATION", "ED25519_VERIFICATION"]) {
      expect(status(pipeline, stage)).toBe("NOT_APPLICABLE");
    }
    expect(pipeline.firstFailedBoundary).toBeNull();
    expect(pipeline.firstUnavailableBoundary).toBeNull();
  });

  it("selects the earliest relevant FAIL and ignores later NOT_OBSERVED", async () => {
    const pipeline = await exportPipeline({ from: "did:key:bad", text: "hello", nonce: "bad", sig: "bad" });
    expect(pipeline.firstFailedBoundary?.stage).toBe("DID_DECODING");
    expect(pipeline.firstUnavailableBoundary).toBeNull();
    expect(status(pipeline, "TCLK_STRUCTURAL_BINDING")).toBe("NOT_APPLICABLE");
  });

  it("keeps operational source errors separate from Evidence Verdict", async () => {
    const error = { code: "NETWORK_TIMEOUT", message: "The bounded read timed out." };
    const diagnostics = await diagnoseLiveTranscript("lobby", { ok: false, error });
    const pipeline = buildTranscriptVerificationPipeline("ROOM", diagnostics);
    expect(pipeline.operationalErrors).toEqual([error]);
    expect(pipeline.evidenceVerdict).toBeUndefined();
    expect(status(pipeline, "SOURCE_AVAILABILITY")).toBe("UNAVAILABLE");
    expect(status(pipeline, "RECORD_PARSING")).toBe("NOT_OBSERVED");
    expect(pipeline.firstFailedBoundary).toBeNull();
    expect(pipeline.firstUnavailableBoundary?.stage).toBe("SOURCE_AVAILABILITY");
  });

  it("represents valid empty and malformed-only transcripts without invented verdicts", async () => {
    const empty = buildTranscriptVerificationPipeline("EXPORT", await diagnoseExportTranscript("lobby", ""));
    expect(empty.evidenceVerdict).toBeUndefined();
    expect(status(empty, "RECORD_PARSING")).toBe("NOT_APPLICABLE");
    expect(empty.firstFailedBoundary).toBeNull();

    const malformed = buildTranscriptVerificationPipeline("EXPORT", await diagnoseExportTranscript("lobby", "not-json"));
    expect(malformed.evidenceVerdict).toBeUndefined();
    expect(status(malformed, "RECORD_PARSING")).toBe("FAIL");
    expect(malformed.firstFailedBoundary?.stage).toBe("RECORD_PARSING");
    expect(malformed.operationalErrors[0]?.code).toBe("EXPORT_INVALID_JSON");
  });

  it.each(["ROOM", "MESSAGE"] as const)("adapts a selected %s record without re-verifying", async (inputKind) => {
    const diagnostics = await diagnoseLiveTranscript(fixture.room, {
      ok: true,
      value: { room: fixture.room, count: 1, firstSeq: "1", lastSeq: "1", messages: [fixture.record] },
    });
    const pipeline = buildTranscriptVerificationPipeline(inputKind, diagnostics);
    expect(pipeline.inputKind).toBe(inputKind);
    expect(pipeline.evidenceVerdict).toBe("VALID");
    expect(pipeline.stages).toHaveLength(12);
  });
});

describe("DID/key diagnostic subset", () => {
  it("passes canonical DID structure and decoding without inventing message evidence", () => {
    const pipeline = buildDidVerificationPipeline(fixture.record.from);
    expect(pipeline.stages.map((item) => item.stage)).toEqual(DIAGNOSTIC_STAGES);
    expect(status(pipeline, "SOURCE_AVAILABILITY")).toBe("PASS");
    expect(status(pipeline, "DID_STRUCTURE")).toBe("PASS");
    expect(status(pipeline, "DID_DECODING")).toBe("PASS");
    expect(status(pipeline, "ED25519_VERIFICATION")).toBe("NOT_APPLICABLE");
    expect(status(pipeline, "TCLK_RECOGNITION")).toBe("NOT_APPLICABLE");
    expect(pipeline.evidenceVerdict).toBeUndefined();
  });

  it("distinguishes malformed DID structure from did:key decoding failure", () => {
    const malformed = buildDidVerificationPipeline("not-a-did");
    expect(status(malformed, "DID_STRUCTURE")).toBe("FAIL");
    expect(status(malformed, "DID_DECODING")).toBe("NOT_OBSERVED");
    expect(malformed.firstFailedBoundary?.stage).toBe("DID_STRUCTURE");

    const undecodable = buildDidVerificationPipeline("did:key:bad");
    expect(status(undecodable, "DID_STRUCTURE")).toBe("PASS");
    expect(status(undecodable, "DID_DECODING")).toBe("FAIL");
    expect(undecodable.firstFailedBoundary?.stage).toBe("DID_DECODING");
    expect(undecodable.operationalErrors[0]?.code).toBe("INVALID_DID");
  });
});

describe("bounded tclk stages", () => {
  it("represents not observed, malformed, and recognized tclk without execution claims", async () => {
    const absent = await exportPipeline({ from: "alice", text: "ordinary" });
    expect(status(absent, "TCLK_RECOGNITION")).toBe("NOT_APPLICABLE");

    const malformed = await exportPipeline({ from: "alice", text: 'tclk1 {"type":"offer"}' });
    expect(status(malformed, "TCLK_RECOGNITION")).toBe("FAIL");
    expect(status(malformed, "TCLK_STRUCTURAL_BINDING")).toBe("NOT_OBSERVED");

    const recognized = await exportPipeline({ from: "alice", text: tclk.receipt });
    expect(status(recognized, "TCLK_RECOGNITION")).toBe("PASS");
    expect(status(recognized, "TCLK_STRUCTURAL_BINDING")).toBe("FAIL");
    expect(recognized.tclkObservation?.detection.status).toBe("RECOGNIZED");

    const language = JSON.stringify([absent, malformed, recognized]).toLowerCase();
    for (const forbidden of ["root cause", "settlement success", "payment verified", "work completed", "flop transferred"]) {
      expect(language).not.toContain(forbidden);
    }
  });
});
