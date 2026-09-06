import { readFileSync } from "node:fs";

import { afterEach, describe, expect, it, vi } from "vitest";

import { generateLocalIdentity } from "../../lib/identity";
import { publishPreparedMessage, PublishAttemptSession } from "../../lib/publish";
import { SessionNonceReservations, type PreparedSignedMessage } from "../../lib/signing";

const clock = { nowMilliseconds: () => 1_700_000_000_000n };

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

async function preparedFixture(text = "hello"): Promise<{
  prepared: PreparedSignedMessage;
  reservations: SessionNonceReservations;
}> {
  const identity = await generateLocalIdentity();
  const reservations = new SessionNonceReservations();
  const prepared = await identity.prepareSignedMessage({ room: "lobby", text }, reservations, clock);
  identity.lock();
  return { prepared, reservations };
}

describe("fixed browser-direct signed GET", () => {
  it("does not request anything before explicit invocation", async () => {
    const { prepared, reservations } = await preparedFixture();
    const fetcher = vi.fn<typeof fetch>();
    const attempts = new PublishAttemptSession(reservations);
    expect(fetcher).not.toHaveBeenCalled();
    expect(attempts.stateFor(prepared)).toBe("NOT_ATTEMPTED");
  });

  it("maps the exact descriptor to the fixed GET path in exact component order", async () => {
    const { prepared, reservations } = await preparedFixture();
    const attempts = new PublishAttemptSession(reservations);
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 202, statusText: "Accepted" }));

    const result = await publishPreparedMessage(prepared, attempts, { fetch: fetcher });
    expect(result).toEqual({ state: "RESPONSE_RECEIVED", status: 202 });
    expect(result).not.toHaveProperty("url");
    expect(fetcher).toHaveBeenCalledTimes(1);
    const [input, init] = fetcher.mock.calls[0] ?? [];
    const url = input as URL;
    expect(url.origin).toBe("https://technocore.chat");
    expect(url.pathname).toBe(
      `/r/${encodeURIComponent(prepared.room)}/say-signed/${encodeURIComponent(prepared.did)}/${encodeURIComponent(prepared.signature)}/${prepared.nonce}/${encodeURIComponent(prepared.text)}`,
    );
    expect(url.search).toBe("");
    expect(url.hash).toBe("");
    expect(init).toMatchObject({ method: "GET", body: null, redirect: "error", credentials: "omit", cache: "no-store" });
    expect(attempts.stateFor(prepared)).toBe("RESPONSE_RECEIVED");
    expect(reservations.isBurned(prepared.did, prepared.room, prepared.nonce)).toBe(true);
  });

  it.each([
    ["slash", "a/b"],
    ["question", "a?b"],
    ["fragment", "a#b"],
    ["percent", "a%b"],
    ["space and non-ASCII", "café 東京"],
  ])("encodes %s text once without semantic mutation", async (_label, text) => {
    const { prepared, reservations } = await preparedFixture(text);
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 200 }));
    await publishPreparedMessage(prepared, new PublishAttemptSession(reservations), { fetch: fetcher });
    const url = fetcher.mock.calls[0]?.[0] as URL;
    const segments = url.pathname.split("/");
    expect(segments).toHaveLength(8);
    expect(decodeURIComponent(segments[2] ?? "")).toBe(prepared.room);
    expect(segments[3]).toBe("say-signed");
    expect(decodeURIComponent(segments[4] ?? "")).toBe(prepared.did);
    expect(decodeURIComponent(segments[5] ?? "")).toBe(prepared.signature);
    expect(decodeURIComponent(segments[6] ?? "")).toBe(prepared.nonce);
    expect(decodeURIComponent(segments[7] ?? "")).toBe(prepared.text);
    expect(url.search).toBe("");
    expect(url.hash).toBe("");
  });

  it("rejects mutable or structurally altered descriptors before fetch", async () => {
    const { prepared, reservations } = await preparedFixture();
    const fetcher = vi.fn<typeof fetch>();
    const mutable = { ...prepared };
    await expect(
      publishPreparedMessage(mutable, new PublishAttemptSession(reservations), { fetch: fetcher }),
    ).rejects.toMatchObject({ code: "INVALID_PREPARED_MESSAGE" });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("makes arbitrary host input impossible and rejects altered public evidence", async () => {
    const { prepared, reservations } = await preparedFixture();
    const fetcher = vi.fn<typeof fetch>();
    const altered = Object.freeze({ ...prepared, did: "https://evil.test" });
    await expect(
      publishPreparedMessage(altered, new PublishAttemptSession(reservations), { fetch: fetcher }),
    ).rejects.toMatchObject({ code: "INVALID_PREPARED_MESSAGE" });
    expect(fetcher).not.toHaveBeenCalled();
  });
});

describe("attempt state and nonce burning", () => {
  it("enters ATTEMPTED and burns before the single network execution", async () => {
    const { prepared, reservations } = await preparedFixture();
    const attempts = new PublishAttemptSession(reservations);
    const fetcher = vi.fn<typeof fetch>().mockImplementation(async () => {
      expect(attempts.stateFor(prepared)).toBe("ATTEMPTED");
      expect(reservations.isBurned(prepared.did, prepared.room, prepared.nonce)).toBe(true);
      return new Response(null, { status: 204 });
    });
    await publishPreparedMessage(prepared, attempts, { fetch: fetcher });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it.each([200, 400, 500])("maps observed HTTP %i only to RESPONSE_RECEIVED and keeps nonce burned", async (status) => {
    const { prepared, reservations } = await preparedFixture();
    const attempts = new PublishAttemptSession(reservations);
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response("untrusted instructions", { status }));
    const result = await publishPreparedMessage(prepared, attempts, { fetch: fetcher });
    expect(result.state).toBe("RESPONSE_RECEIVED");
    expect(JSON.stringify(result)).not.toMatch(/published|success|verified|untrusted instructions/i);
    expect(reservations.isBurned(prepared.did, prepared.room, prepared.nonce)).toBe(true);
  });

  it.each([new TypeError("network"), new TypeError("CORS")])(
    "maps ambiguous rejection to OUTCOME_UNKNOWN without retry",
    async (error) => {
      const { prepared, reservations } = await preparedFixture();
      const attempts = new PublishAttemptSession(reservations);
      const fetcher = vi.fn<typeof fetch>().mockRejectedValue(error);
      await expect(publishPreparedMessage(prepared, attempts, { fetch: fetcher })).resolves.toEqual({
        state: "OUTCOME_UNKNOWN",
        message: "Write outcome unknown. Read-back verification is required.",
      });
      expect(fetcher).toHaveBeenCalledTimes(1);
      expect(attempts.stateFor(prepared)).toBe("OUTCOME_UNKNOWN");
      expect(reservations.isBurned(prepared.did, prepared.room, prepared.nonce)).toBe(true);
    },
  );

  it("maps timeout to OUTCOME_UNKNOWN, aborts, and does not retry", async () => {
    const { prepared, reservations } = await preparedFixture();
    const attempts = new PublishAttemptSession(reservations);
    const fetcher = vi.fn<typeof fetch>().mockImplementation((_input, init) => new Promise((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")));
    }));
    const pending = publishPreparedMessage(prepared, attempts, { fetch: fetcher, timeoutMs: 25 });
    await expect(pending).resolves.toMatchObject({ state: "OUTCOME_UNKNOWN" });
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(reservations.isBurned(prepared.did, prepared.room, prepared.nonce)).toBe(true);
  });

  it("rejects the same burned nonce locally and performs no second request", async () => {
    const { prepared, reservations } = await preparedFixture();
    const attempts = new PublishAttemptSession(reservations);
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 500 }));
    await publishPreparedMessage(prepared, attempts, { fetch: fetcher });
    await expect(publishPreparedMessage(prepared, attempts, { fetch: fetcher })).rejects.toMatchObject({
      code: "NONCE_ALREADY_BURNED",
    });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});

describe("V12-03 capability boundaries", () => {
  it("does not expose response content, executable URL, secrets, POST, retry, or server relay", () => {
    const publishSources = ["publish.ts", "session.ts", "types.ts", "index.ts"]
      .map((name) => readFileSync(new URL(`../../lib/publish/${name}`, import.meta.url), "utf8"))
      .join("\n");
    const apiSources = [
      new URL("../../app/api/inspect/route.ts", import.meta.url),
      new URL("../../app/api/rooms/route.ts", import.meta.url),
    ].map((url) => readFileSync(url, "utf8")).join("\n");
    expect(publishSources).not.toMatch(/response\.(?:text|json|arrayBuffer|blob|formData)\s*\(/);
    expect(publishSources).not.toMatch(/method:\s*["']POST|retry|dangerouslySetInnerHTML|localStorage|sessionStorage|indexedDB|document\.cookie/);
    expect(publishSources).not.toMatch(/seed|privateKey|passphrase|encryptionKey|decryptedBackup/);
    expect(apiSources).not.toMatch(/say-signed|publishPreparedMessage|lib\/publish/);
  });
});
