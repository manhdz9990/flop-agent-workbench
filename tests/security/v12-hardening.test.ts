import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { DEFAULT_EXPORT_LIMITS } from "../../lib/export";
import { LIVE_REQUEST_TIMEOUT_MS, LIVE_RESPONSE_MAX_BYTES } from "../../lib/live";
import { TCLK_MAX_FRAME_CHARS } from "../../lib/tclk";

const implementationFiles = [
  "../../app/page.tsx", "../../app/onboarding.tsx",
  "../../lib/identity/backup.ts", "../../lib/identity/identity.ts",
  "../../lib/signing/nonce.ts", "../../lib/publish/publish.ts",
  "../../lib/readback/verify.ts", "../../lib/receipt/model.ts",
  "../../lib/live/endpoint.ts", "../../lib/live/parser.ts",
].map((path) => readFileSync(new URL(path, import.meta.url), "utf8"));
const implementation = implementationFiles.join("\n");
const api = ["inspect", "rooms"].map((name) => readFileSync(new URL(`../../app/api/${name}/route.ts`, import.meta.url), "utf8")).join("\n");

describe("V12-07 cross-boundary hardening", () => {
  it("keeps every locked resource limit unchanged", () => {
    expect(DEFAULT_EXPORT_LIMITS).toEqual({ maxBytes: 5 * 1024 * 1024, maxLines: 10_000, maxLineBytes: 256 * 1024 });
    expect(LIVE_RESPONSE_MAX_BYTES).toBe(2 * 1024 * 1024);
    expect(LIVE_REQUEST_TIMEOUT_MS).toBe(10_000);
    expect(TCLK_MAX_FRAME_CHARS).toBe(4096);
    expect(api).toMatch(/MAX_REQUEST_BYTES = 8 \* 1024/);
    expect(implementation).toMatch(/searchParams\.set\("limit", "200"\)|messages\.length > 200/);
  });

  it("contains no logging, plaintext secret persistence, unsafe HTML, or background polling", () => {
    expect(implementation).not.toMatch(/console\.(?:log|error|debug|warn)\s*\(/);
    expect(implementation).not.toMatch(/sessionStorage|indexedDB|document\.cookie|setInterval|dangerouslySetInnerHTML/);
  });

  it("keeps identity/signing/publish capability out of application server routes", () => {
    expect(api).not.toMatch(/lib\/(?:identity|signing|publish)|publishPreparedMessage|say-signed|privateKey|passphrase|seed/);
  });

  it("has one isolated signed-write URL constructor and no UI rendering of it", () => {
    const occurrences = implementationFiles.filter((source) => source.includes("say-signed"));
    expect(occurrences).toHaveLength(1);
    expect(implementationFiles[0]).not.toContain("say-signed");
    expect(implementationFiles[1]).not.toContain("say-signed");
  });
});
