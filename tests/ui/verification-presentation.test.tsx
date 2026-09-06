import { readFileSync } from "node:fs";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { buildDidVerificationPipeline, buildTranscriptVerificationPipeline, diagnoseExportTranscript } from "../../lib/diagnostics";
import type { ProtocolRecord } from "../../lib/protocol";
import { TechnicalEvidence, VerificationOverview, VerificationStages, verificationMeaning } from "../../app/verification-result";

interface Fixture { room: string; record: Required<ProtocolRecord> }

const fixture = JSON.parse(readFileSync(new URL("../fixtures/protocol/known-good.json", import.meta.url), "utf8")) as Fixture;

async function pipeline(record: ProtocolRecord) {
  return buildTranscriptVerificationPipeline("EXPORT", await diagnoseExportTranscript(fixture.room, JSON.stringify(record)));
}

describe("V12-09 UI Phase 6 verification presentation", () => {
  it.each([
    ["VALID", "key control for the exact evidence only"],
    ["INVALID", "returned false"],
    ["UNSIGNED", "No supported signature evidence"],
    ["UNVERIFIABLE", "UNVERIFIABLE is not INVALID"],
  ] as const)("keeps the %s verdict semantically distinct", (verdict, copy) => {
    expect(verificationMeaning(verdict)).toContain(copy);
  });

  it("presents the conclusion and earliest FAIL before the ordered collapsed stages", async () => {
    const result = await pipeline({ ...fixture.record, text: `${fixture.record.text}!` });
    const overview = renderToStaticMarkup(<VerificationOverview pipeline={result} />);
    const stages = renderToStaticMarkup(<VerificationStages pipeline={result} />);
    expect(overview).toContain("INVALID");
    expect(overview).toContain("First failed boundary");
    expect(overview).toContain("Ed25519 verification");
    expect(stages.match(/class="stage-disclosure stage"/g)).toHaveLength(12);
    expect(stages).not.toContain("<details open");
    expect(stages.indexOf("Source availability")).toBeLessThan(stages.indexOf("tclk structural/binding"));
  });

  it("uses earliest UNAVAILABLE only when no FAIL exists", async () => {
    const result = await pipeline({ ...fixture.record, sig: undefined });
    const html = renderToStaticMarkup(<VerificationOverview pipeline={result} />);
    expect(html).toContain("UNVERIFIABLE");
    expect(html).toContain("First unavailable boundary");
    expect(html).toContain("Signature representation");
    expect(html).not.toContain("First failed boundary");
  });

  it("renders all five stage statuses without merging them into verdicts", async () => {
    const cases = [
      await pipeline(fixture.record),
      await pipeline({ from: "did:key:bad", text: "hello", nonce: "bad", sig: "bad" }),
      await pipeline({ ...fixture.record, sig: undefined }),
      buildDidVerificationPipeline(String(fixture.record.from)),
      buildDidVerificationPipeline("not-a-did"),
    ];
    const html = cases.map((item) => renderToStaticMarkup(<VerificationStages pipeline={item} />)).join("\n");
    for (const status of ["PASS", "FAIL", "UNAVAILABLE", "NOT_APPLICABLE", "NOT_OBSERVED"]) expect(html).toContain(status);
  });

  it("keeps raw technical evidence collapsed by default", () => {
    const html = renderToStaticMarkup(<TechnicalEvidence label="Raw Evidence"><pre>{"exact evidence"}</pre></TechnicalEvidence>);
    expect(html).toContain("Raw Evidence");
    expect(html).toContain("exact evidence");
    expect(html).not.toContain("<details open");
  });
});
