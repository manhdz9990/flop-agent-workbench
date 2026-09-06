import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { inspectDid, resolveInspectionInput } from "../../lib/input";
import { buildRoomReadUrl, parseRoomReadJson, readRoom, type ReaderOptions } from "../../lib/live";
import type { ProtocolRecord } from "../../lib/protocol";

interface Fixture { room: string; record: Required<ProtocolRecord> }
const fixture = JSON.parse(readFileSync(new URL("../fixtures/protocol/known-good.json", import.meta.url), "utf8")) as Fixture;

function response(body: string, init: ResponseInit = {}, url = ""): Response {
  const result = new Response(body, { status: init.status ?? 200, headers: { "content-type": "application/json", ...init.headers } });
  if (url !== "") Object.defineProperty(result, "url", { value: url });
  return result;
}

function roomJson(messages: readonly object[] = [], metadata: object = {}): string {
  return JSON.stringify({ room: "lobby", count: messages.length, first_seq: messages.length === 0 ? null : 1, last_seq: messages.length === 0 ? 0 : messages.length, generation: 4, messages, ...metadata });
}

describe("allowlisted endpoint construction", () => {
  it("constructs only the approved newest-200 JSON room read", () => {
    expect(buildRoomReadUrl("mb-p-inbox").href).toBe("https://technocore.chat/r/mb-p-inbox?format=json&limit=200");
  });

  it.each(["https://evil.test/r/x", "file:", "../say", "lobby/say", "::1", "10.0.0.1", "169.254.1.1", "user@host"])(
    "S03 rejects destination-like room input %j before fetch",
    async (room) => {
      const fetcher = vi.fn<typeof fetch>();
      const result = await readRoom(room, { fetch: fetcher });
      expect(result).toMatchObject({ ok: false, error: { code: "INVALID_ROOM" } });
      expect(fetcher).not.toHaveBeenCalled();
    },
  );

  it.each(["localhost", "127_0_0_1"])("keeps valid room name %j on the fixed Technocore origin", async (room) => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(response(JSON.stringify({ room, count: 0, first_seq: null, last_seq: 0, messages: [] })));
    expect((await readRoom(room, { fetch: fetcher })).ok).toBe(true);
    expect(String(fetcher.mock.calls[0]?.[0])).toBe(`https://technocore.chat/r/${room}?format=json&limit=200`);
  });

  it.each(["say", "say-signed", "kv", "set"])("S05 cannot construct a %s path", (segment) => {
    const url = buildRoomReadUrl(segment);
    expect(url.pathname).toBe(`/r/${segment}`);
    expect(url.pathname).not.toContain("/say/");
    expect(url.pathname).not.toContain("/kv/");
    expect(url.pathname).not.toContain("/set/");
  });
});

describe("bounded safe reader failures", () => {
  it("S04 rejects an off-origin redirect without following it", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(response("", { status: 302, headers: { location: "http://127.0.0.1/secret" } }));
    const result = await readRoom("lobby", { fetch: fetcher });
    expect(result).toMatchObject({ ok: false, error: { code: "REDIRECT_REJECTED" } });
    expect(fetcher.mock.calls[0]?.[1]).toMatchObject({ redirect: "manual", method: "GET" });
  });

  it("rejects a response URL that differs from the exact approved endpoint", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(response(roomJson(), {}, "https://evil.test/r/lobby?format=json&limit=200"));
    expect(await readRoom("lobby", { fetch: fetcher })).toMatchObject({ ok: false, error: { code: "ORIGIN_MISMATCH" } });
  });

  it("N01 maps timeout to an operational error", async () => {
    const fetcher = vi.fn<typeof fetch>().mockImplementation((_input, init) => new Promise((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")));
    }));
    expect(await readRoom("lobby", { fetch: fetcher, timeoutMs: 1 })).toMatchObject({ ok: false, error: { code: "NETWORK_TIMEOUT" } });
  });

  it.each([[404, "HTTP_CLIENT_ERROR"], [503, "HTTP_SERVER_ERROR"]])("N02 maps HTTP %i separately from verdicts", async (status, code) => {
    const result = await readRoom("lobby", { fetch: vi.fn<typeof fetch>().mockResolvedValue(response("failure", { status })) });
    expect(result).toMatchObject({ ok: false, error: { code, context: { status } } });
    expect("verificationState" in (result.ok ? {} : result.error)).toBe(false);
  });

  it("N03 maps malformed JSON to an operational parser error", async () => {
    expect(await readRoom("lobby", { fetch: vi.fn<typeof fetch>().mockResolvedValue(response("{")) })).toMatchObject({ ok: false, error: { code: "MALFORMED_RESPONSE" } });
  });

  it("maps DNS/network failure to an operational error", async () => {
    const fetcher = vi.fn<typeof fetch>().mockRejectedValue(new TypeError("network unavailable"));
    expect(await readRoom("lobby", { fetch: fetcher })).toMatchObject({ ok: false, error: { code: "NETWORK_FAILURE" } });
  });

  it("rejects unsupported response shape and content type", async () => {
    expect(await readRoom("lobby", { fetch: vi.fn<typeof fetch>().mockResolvedValue(response("{}")) })).toMatchObject({ ok: false, error: { code: "UNSUPPORTED_RESPONSE" } });
    expect(await readRoom("lobby", { fetch: vi.fn<typeof fetch>().mockResolvedValue(new Response("text", { headers: { "content-type": "text/plain" } })) })).toMatchObject({ ok: false, error: { code: "UNSUPPORTED_CONTENT_TYPE" } });
  });

  it("bounds response bodies before parsing", async () => {
    const result = await readRoom("lobby", { fetch: vi.fn<typeof fetch>().mockResolvedValue(response(roomJson())), maxResponseBytes: 5 });
    expect(result).toMatchObject({ ok: false, error: { code: "UNSUPPORTED_RESPONSE" } });
  });
});

describe("exact live parsing and input resolution", () => {
  it("preserves a raw 19-digit numeric nonce token as text", () => {
    const record = JSON.stringify(fixture.record).replace(`"nonce":"${fixture.record.nonce}"`, `"nonce":${fixture.record.nonce}`);
    const parsed = parseRoomReadJson(`{"room":"lobby","count":1,"first_seq":21337337,"last_seq":21337337,"generation":4,"messages":[${record}]}`, "lobby");
    expect(parsed.messages[0]?.nonce).toBe(fixture.record.nonce);
  });

  it("resolves a room, verifies evidence, and keeps metadata unsigned", async () => {
    const record = JSON.stringify(fixture.record).replace(`"nonce":"${fixture.record.nonce}"`, `"nonce":${fixture.record.nonce}`);
    const body = `{"room":"lobby","count":1,"first_seq":21337337,"last_seq":21337337,"generation":4,"messages":[${record}]}`;
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(response(body));
    const result = await resolveInspectionInput({ kind: "ROOM", room: "lobby" }, { reader: { fetch: fetcher } });
    expect(result.ok && result.value.report.messages[0]?.verificationState).toBe("VALID");
    expect(result.ok && "serverMetadata" in result.value && result.value.serverMetadata.every((field) => field.authority === "SERVER_ASSERTED_UNSIGNED")).toBe(true);
    expect(result.ok && result.value.report.warnings.some((warning) => warning.code === "RETAINED_WINDOW_ONLY")).toBe(true);
  });

  it("handles an empty live room without fabricated failures or verdicts", async () => {
    const result = await resolveInspectionInput({ kind: "ROOM", room: "lobby" }, { reader: { fetch: vi.fn<typeof fetch>().mockResolvedValue(response(roomJson())) } });
    expect(result.ok && result.value.report.messages).toEqual([]);
    expect(result.ok && result.value.report.operationalErrors).toEqual([]);
  });

  it("resolves MESSAGE by exact observed sequence and reports absence as unavailable", async () => {
    const message = { seq: 7, ts: "2026-09-04T00:00:00Z", from: "alice", text: "hello" };
    const options: ReaderOptions = { fetch: vi.fn<typeof fetch>().mockImplementation(async () => response(roomJson([message], { first_seq: 7, last_seq: 7 }))) };
    const found = await resolveInspectionInput({ kind: "MESSAGE", room: "lobby", sequence: "7" }, { reader: options });
    expect(found.ok && found.value.report.inputKind).toBe("MESSAGE");
    const missing = await resolveInspectionInput({ kind: "MESSAGE", room: "lobby", sequence: "8" }, { reader: options });
    expect(missing).toMatchObject({ ok: false, error: { code: "MESSAGE_NOT_OBSERVED" } });
  });

  it("rejects invalid sequence and unsupported input without fetch", async () => {
    const fetcher = vi.fn<typeof fetch>();
    expect(await resolveInspectionInput({ kind: "MESSAGE", room: "lobby", sequence: "1.0" }, { reader: { fetch: fetcher } })).toMatchObject({ ok: false, error: { code: "INVALID_SEQUENCE" } });
    expect(await resolveInspectionInput({ kind: "OTHER" } as never, { reader: { fetch: fetcher } })).toMatchObject({ ok: false, error: { code: "UNSUPPORTED_INPUT" } });
    expect(await resolveInspectionInput({ kind: "EXPORT" }, { reader: { fetch: fetcher } })).toMatchObject({ ok: false, error: { code: "LOCAL_EXPORT_REQUIRED" } });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("S02 treats a write URL in content as data and performs one approved fetch only", async () => {
    const message = { seq: 1, ts: "2026-09-04T00:00:00Z", from: "alice", text: "https://technocore.chat/r/x/say/a/pwned" };
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(response(roomJson([message])));
    const result = await resolveInspectionInput({ kind: "ROOM", room: "lobby" }, { reader: { fetch: fetcher } });
    expect(result.ok && result.value.report.messages[0]?.fields.some((field) => field.value === message.text)).toBe(true);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(String(fetcher.mock.calls[0]?.[0])).toBe("https://technocore.chat/r/lobby?format=json&limit=200");
  });

  it("keeps DID inspection local and limited to key semantics", async () => {
    const fetcher = vi.fn<typeof fetch>();
    const result = await resolveInspectionInput({ kind: "DID", did: fixture.record.from }, { reader: { fetch: fetcher } });
    expect(result.ok && result.kind === "DID" && result.value.keyType).toBe("Ed25519");
    expect(result.ok && result.kind === "DID" && result.value.meaning).toContain("locally");
    expect(fetcher).not.toHaveBeenCalled();
    expect(inspectDid("did:key:bad").report.operationalErrors[0]?.code).toBe("INVALID_DID");
  });
});
