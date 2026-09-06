import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { inspectLocalExport, parseExportJsonl } from "../../lib/export";
import type { ProtocolRecord } from "../../lib/protocol";

interface Fixture { room: string; record: Required<ProtocolRecord> }
const knownGood = JSON.parse(readFileSync(new URL("../fixtures/protocol/known-good.json", import.meta.url), "utf8")) as Fixture;
const mixed = readFileSync(new URL("../fixtures/export/mixed.jsonl", import.meta.url), "utf8");

describe("bounded local JSONL parsing", () => {
  it("accepts the official empty-export body as zero retained records", async () => {
    const parsed = parseExportJsonl("");
    expect(parsed).toEqual({ records: [], operationalErrors: [] });

    const inspected = await inspectLocalExport("lobby", "");
    expect(inspected.report.messages).toEqual([]);
    expect(inspected.report.operationalErrors).toEqual([]);
  });

  it("E01 preserves raw lines and exact 19-digit nonce text", () => {
    const rawLine = JSON.stringify(knownGood.record);
    const parsed = parseExportJsonl(`${rawLine}\n`);
    expect(parsed.operationalErrors).toEqual([]);
    expect(parsed.records[0]).toMatchObject({ lineNumber: 1, rawLine });
    expect(parsed.records[0]?.record.nonce).toBe("1788454091844223020");
  });

  it("E02 continues after malformed lines without fabricating records", () => {
    const parsed = parseExportJsonl(mixed);
    expect(parsed.records).toHaveLength(3);
    expect(parsed.operationalErrors).toEqual([expect.objectContaining({ code: "EXPORT_INVALID_JSON", context: { lineNumber: 2 } })]);
  });

  it("rejects numeric nonces rather than losing precision", () => {
    const parsed = parseExportJsonl('{"from":"did:key:x","text":"x","nonce":1788454091844223020}');
    expect(parsed.records).toHaveLength(0);
    expect(parsed.operationalErrors[0]?.code).toBe("EXPORT_INVALID_RECORD");
  });

  it.each([
    ["EXPORT_TOO_LARGE", "{}", { maxBytes: 1, maxLines: 10, maxLineBytes: 10 }],
    ["EXPORT_TOO_MANY_LINES", "{}\n{}", { maxBytes: 100, maxLines: 1, maxLineBytes: 10 }],
    ["EXPORT_LINE_TOO_LARGE", "{123}", { maxBytes: 100, maxLines: 10, maxLineBytes: 2 }],
  ])("bounds hostile input with %s", (code, input, limits) => {
    expect(parseExportJsonl(input, limits).operationalErrors[0]?.code).toBe(code);
  });
});

describe("export report and transcript evidence", () => {
  it("verifies a valid large-nonce export locally", async () => {
    const result = await inspectLocalExport(knownGood.room, JSON.stringify(knownGood.record), { generation: "epoch-1" });
    expect(result.report.messages.map((message) => message.verificationState)).toEqual(["VALID"]);
    expect(result.report.messages[0]?.fields).toContainEqual({ name: "signature", value: knownGood.record.sig, authority: "UNTRUSTED_CALLER_DATA" });
    expect(result.report.operationalErrors).toEqual([]);
    expect(result.report.warnings.map((warning) => warning.code)).toContain("RETAINED_WINDOW_ONLY");
    expect(result.report.warnings.map((warning) => warning.code)).not.toContain("GENERATION_METADATA_UNAVAILABLE");
  });

  it("T01 reports 11 to 14 as observation only with no invented cause", async () => {
    const result = await inspectLocalExport("lobby", mixed);
    expect(result.gaps).toEqual([expect.objectContaining({ previous: "11", next: "14", missingCount: "2" })]);
    expect(result.gaps[0]?.warning.message).toContain("does not establish its cause");
    expect(result.report.messages).toHaveLength(3);
    expect(result.report.operationalErrors[0]?.code).toBe("EXPORT_INVALID_JSON");
  });

  it("T02/E03 describes retention and unavailable generation without invalidating evidence", async () => {
    const result = await inspectLocalExport("lobby", '{"seq":10,"from":"alice","text":"hello"}');
    expect(result.report.messages[0]?.verificationState).toBe("UNSIGNED");
    expect(result.report.messages[0]?.fields.find((field) => field.name === "text")?.authority).toBe("UNTRUSTED_CALLER_DATA");
    expect(result.report.warnings.map((warning) => warning.code)).toEqual(expect.arrayContaining(["RETAINED_WINDOW_ONLY", "EARLIER_SEQUENCE_NOT_OBSERVED", "GENERATION_METADATA_UNAVAILABLE"]));
    expect(result.report.warnings.map((warning) => warning.message).join(" ")).toContain("not verified full history");
  });

  it("keeps hostile markup and URLs inert as local field data", async () => {
    const result = await inspectLocalExport("lobby", mixed);
    expect(result.report.messages[0]?.fields).toContainEqual({ name: "textMeaning", value: "<script>alert(1)</script> https://technocore.chat/say?room=x", authority: "UNTRUSTED_CALLER_DATA" });
  });

  it("keeps malformed signed evidence operational instead of inventing INVALID", async () => {
    const result = await inspectLocalExport("lobby", JSON.stringify({ from: "did:key:bad", text: "x", nonce: "1", sig: "bad" }));
    expect(result.report.messages).toEqual([]);
    expect(result.report.operationalErrors[0]?.code).toBe("INVALID_DID");
  });
});
