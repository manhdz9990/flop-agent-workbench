import { afterEach, describe, expect, it, vi } from "vitest";

import { GET } from "../../app/api/rooms/route";
import { POST } from "../../app/api/inspect/route";

function textResponse(body: string, init: ResponseInit = {}): Response {
  return new Response(body, { status: init.status ?? 200, headers: { "content-type": "text/plain; charset=utf-8", ...init.headers } });
}

describe("GET /api/rooms — bounded public room discovery route", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("accepts no request and performs exactly one fixed-destination read", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(textResponse("# 1 of 1 rooms (cap 81920, 1.0K of 5.0G stored), newest first\n/r/lobby seq 1 1.0K 0s ago"));
    vi.stubGlobal("fetch", fetcher);

    const response = await GET();
    const body = (await response.json()) as { ok: boolean; value?: { observations: unknown[] } };

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(String(fetcher.mock.calls[0]?.[0])).toBe("https://technocore.chat/rooms");
    expect(fetcher.mock.calls[0]?.[1]).toMatchObject({ method: "GET", redirect: "manual" });
    expect(body.ok).toBe(true);
    expect(body.value?.observations).toEqual([{ room: "lobby", seq: "1", approxStoredSize: "1.0K", lastActivity: "0s ago" }]);
  });

  it("surfaces a discovery failure as an operational outcome, never a verdict", async () => {
    vi.stubGlobal("fetch", vi.fn<typeof fetch>().mockRejectedValue(new TypeError("network unavailable")));

    const response = await GET();
    const body = (await response.json()) as { ok: boolean; error?: { code: string } };

    expect(body.ok).toBe(false);
    expect(body.error?.code).toBe("NETWORK_FAILURE");
    for (const verdict of ["VALID", "INVALID", "UNSIGNED", "UNVERIFIABLE"]) {
      expect(JSON.stringify(body)).not.toContain(verdict);
    }
  });
});

describe("existing /api/inspect behavior remains unchanged by V11-02", () => {
  it("still rejects an oversized declared request before consuming its body", async () => {
    const request = { headers: new Headers({ "content-length": "8193" }), get body(): never { throw new Error("body must not be consumed"); } } as unknown as Request;
    const response = await POST(request);
    expect(response.status).toBe(413);
  });
});
