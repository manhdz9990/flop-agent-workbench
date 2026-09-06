import { describe, expect, it } from "vitest";

import { POST } from "../../app/api/inspect/route";

describe("bounded inspection route input", () => {
  it("rejects an oversized declared request before consuming its body", async () => {
    const request = { headers: new Headers({ "content-length": "8193" }), get body(): never { throw new Error("body must not be consumed"); } } as unknown as Request;
    const response = await POST(request);
    expect(response.status).toBe(413);
  });

  it("bounds a chunked body and cancels once the byte limit is crossed", async () => {
    let cancelled = false;
    const body = new ReadableStream<Uint8Array>({
      start(controller) { controller.enqueue(new Uint8Array(8193)); },
      cancel() { cancelled = true; },
    });
    const request = new Request("http://localhost/api/inspect", { method: "POST", body, duplex: "half" } as RequestInit);
    const response = await POST(request);
    expect(response.status).toBe(413);
    expect(cancelled).toBe(true);
  });
});
