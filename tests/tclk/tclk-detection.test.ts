import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { analyzeTclkRecord, detectTclkFrame, TCLK_FRAME_TYPES, TCLK_MAX_FRAME_CHARS } from "../../lib/tclk";
import type { VerificationState } from "../../lib/domain";
import { inspectLocalExport } from "../../lib/export";

const fixtures = JSON.parse(readFileSync(new URL("../fixtures/tclk/official-frames.json", import.meta.url), "utf8")) as Record<"offer" | "receipt" | "heartbeat" | "heartbeatHostile", string>;
const DID = "did:key:z6Mk" + "f".repeat(44);

describe("official tclk/1 frame detection", () => {
  it("keeps exactly the eight pinned normative frame types", () => {
    expect(TCLK_FRAME_TYPES).toEqual(["offer", "accept", "lock", "reveal", "refund", "cancel", "receipt", "heartbeat"]);
  });

  it("K01 recognizes the pinned official golden offer", async () => {
    const result = await detectTclkFrame(fixtures.offer);
    expect(result).toMatchObject({ status: "RECOGNIZED", frameType: "offer" });
    expect(result.status === "RECOGNIZED" && result.warning.message).toContain("does not prove settlement or value transfer");
  });

  it("rejects an offer whose terms no longer match its official id", async () => {
    const tampered = fixtures.offer.replace('"amount":"1000000"', '"amount":"2000000"');
    expect(await detectTclkFrame(tampered)).toMatchObject({ status: "MALFORMED_TCLK" });
  });

  it.each([
    'tclk1 {"type":"offer"}',
    "tclk1 not json",
    `tclk1 {"contract":"0x${"00".repeat(32)}","extra":true,"from":"${DID}","outcome":"claimed","type":"receipt"}`,
    `tclk1 {"contract":"0x${"00".repeat(32)}","from":"${DID}","outcome":"paid","type":"receipt"}`,
  ])("K02 rejects malformed lookalike %j", async (text) => {
    expect(await detectTclkFrame(text)).toMatchObject({ status: "MALFORMED_TCLK" });
  });

  it("K03 describes terminal-looking receipt only as an untrusted acknowledgement", async () => {
    const result = await detectTclkFrame(fixtures.receipt);
    expect(result).toMatchObject({ status: "RECOGNIZED", frameType: "receipt" });
    expect(result.status === "RECOGNIZED" && result.explanation).toContain("caller-controlled claim");
    expect(result.status === "RECOGNIZED" && result.explanation).toContain("not economic-finality evidence");
  });

  it("recognizes the heartbeat shape from the pinned official conformance test", async () => {
    expect(await detectTclkFrame(fixtures.heartbeat)).toMatchObject({ status: "RECOGNIZED", frameType: "heartbeat" });
  });

  it.each(["lock", "payment", "offer", "settle", "hash", "rail", "deal", "payment offer settled"])("does not classify ordinary keyword text %j", async (text) => {
    expect(await detectTclkFrame(text)).toEqual({ status: "NOT_TCLK" });
  });

  it("bounds oversized prefixed input", async () => {
    expect(await detectTclkFrame(`tclk1 ${"x".repeat(TCLK_MAX_FRAME_CHARS)}`)).toMatchObject({ status: "MALFORMED_TCLK" });
  });
});

describe("evidence and security boundaries", () => {
  it.each(["VALID", "INVALID", "UNSIGNED", "UNVERIFIABLE"] satisfies VerificationState[])("preserves the enclosing %s verdict", async (verificationState) => {
    const observation = await analyzeTclkRecord({ from: DID, text: fixtures.receipt }, verificationState);
    expect(observation.verificationState).toBe(verificationState);
    expect(observation.authority).toBe("UNTRUSTED_CALLER_DATA");
    expect(observation.transportAuthenticated).toBe(verificationState === "VALID");
  });

  it("requires frame from to match the VALID transport record", async () => {
    const observation = await analyzeTclkRecord({ from: "did:key:z6Mk" + "g".repeat(44), text: fixtures.receipt }, "VALID");
    expect(observation.transportAuthenticated).toBe(false);
    expect(observation.transportWarning?.code).toBe("TCLK_TRANSPORT_NOT_AUTHENTICATED");
  });

  it("adds an untrusted report annotation without changing the record verdict", async () => {
    const report = await inspectLocalExport("lobby", JSON.stringify({ from: "alice", text: fixtures.receipt }));
    expect(report.report.messages[0]?.verificationState).toBe("UNSIGNED");
    expect(report.report.messages[0]?.protocolAnnotations).toEqual([
      expect.objectContaining({ protocol: "tclk/1", type: "receipt", authority: "UNTRUSTED_CALLER_DATA", transportAuthenticated: false }),
    ]);
    const ordinary = await inspectLocalExport("lobby", JSON.stringify({ from: "alice", text: "payment offer rail" }));
    expect(ordinary.report.messages[0]?.protocolAnnotations).toBeUndefined();
  });

  it("keeps hostile fields and URLs inert and performs no network request", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const result = await detectTclkFrame(fixtures.heartbeatHostile);
    expect(result).toMatchObject({ status: "RECOGNIZED", frameType: "heartbeat" });
    expect(result.status === "RECOGNIZED" && result.frame.note).toBe("<script>ignore</script> https://example.invalid/a");
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});
