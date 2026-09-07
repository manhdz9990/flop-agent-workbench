import { readFileSync, readdirSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { DEFAULT_EXPORT_LIMITS } from "../../lib/export";
import { DISCOVERY_MAX_OBSERVATIONS, LIVE_REQUEST_TIMEOUT_MS, LIVE_RESPONSE_MAX_BYTES } from "../../lib/live";
import { TCLK_MAX_FRAME_CHARS } from "../../lib/tclk";

const appSources = ["page", "onboarding", "rooms-chat", "my-agent", "evidence"]
  .map((name) => readFileSync(new URL(`../../app/${name}.tsx`, import.meta.url), "utf8"));
const librarySources = [
  "identity/identity", "identity/backup", "signing/nonce", "publish/publish", "publish/session",
  "readback/verify", "evidence-activity/model", "diagnostics/pipeline", "receipt/model",
  "live/reader", "live/rooms-reader", "live/endpoint",
].map((name) => readFileSync(new URL(`../../lib/${name}.ts`, import.meta.url), "utf8"));
const implementation = [...appSources, ...librarySources].join("\n");
const page = appSources[0]!;
const onboarding = appSources[1]!;
const rooms = appSources[2]!;
const apiRoot = new URL("../../app/api/", import.meta.url);
const apiRouteNames = readdirSync(apiRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
const api = apiRouteNames.map((name) => readFileSync(new URL(`${name}/route.ts`, apiRoot), "utf8")).join("\n");

describe("V12-08D combined integration and security boundaries", () => {
  it("keeps one Home-owned identity and one shared page-runtime nonce/publish lifecycle", () => {
    expect(page.match(/useState<LocalIdentitySession>/g)).toHaveLength(1);
    expect(page.match(/new SessionNonceReservations\(\)/g)).toHaveLength(1);
    expect(page.match(/new PublishAttemptSession\(reservations\)/g)).toHaveLength(1);
    expect(page.match(/reservations=\{publishLifecycle\.current\.reservations\}/g)).toHaveLength(3);
    expect(page.match(/attempts=\{publishLifecycle\.current\.attempts\}/g)).toHaveLength(3);
    expect(onboarding).not.toMatch(/new SessionNonceReservations|new PublishAttemptSession|createPublishLifecycle/);
    expect(rooms).not.toMatch(/new SessionNonceReservations|new PublishAttemptSession|createLifecycle/);
  });

  it("keeps preview, signing, publish, and read-back on that shared lifecycle", () => {
    expect(onboarding).toMatch(/reservations\.previewNext/);
    expect(onboarding).toMatch(/prepareSignedMessage\([^]*reservations/);
    expect(onboarding).toMatch(/publishPreparedMessage\(prepared, attempts\)/);
    expect(onboarding).toMatch(/verifyPublishedReadback\(\{ prepared, attempts \}\)/);
    expect(rooms).toMatch(/activeIdentity\.prepareSignedMessage\([^]*reservations/);
    expect(rooms).toMatch(/publishPreparedMessage\(signed, attempts\)/);
    expect(rooms).toMatch(/message\.verdict === "VALID"[^]*message\.signature === item\.prepared!\.signature/);
  });

  it("contains no persistence, unsafe HTML sink, background network loop, or sensitive logging", () => {
    expect(implementation).not.toMatch(/localStorage|sessionStorage|indexedDB|document\.cookie|caches\.(?:open|match|put)|serviceWorker\.register/);
    expect(implementation).not.toMatch(/dangerouslySetInnerHTML|innerHTML\s*=|eval\s*\(|new Function\s*\(/);
    expect(implementation).not.toMatch(/setInterval|WebSocket|EventSource/);
    expect(implementation).not.toMatch(/console\.(?:log|error|warn|debug)\s*\(/);
  });

  it("keeps server routes read-only and free of identity, signing, publishing, and Evidence custody", () => {
    expect(apiRouteNames).toEqual(["inspect", "rooms"]);
    expect(api).not.toMatch(/lib\/(?:identity|signing|publish|evidence-activity)|LocalIdentitySession|say-signed|privateKey|passphrase|seed/);
  });

  it("keeps exactly one internal signed-write constructor and no UI write URL", () => {
    expect(librarySources.filter((source) => source.includes("say-signed"))).toHaveLength(1);
    expect(appSources.some((source) => source.includes("say-signed"))).toBe(false);
    expect(onboarding).not.toMatch(/fetch\s*\(/);
  });

  it("retains all locked resource ceilings", () => {
    expect(DEFAULT_EXPORT_LIMITS).toEqual({ maxBytes: 5 * 1024 * 1024, maxLines: 10_000, maxLineBytes: 256 * 1024 });
    expect(LIVE_RESPONSE_MAX_BYTES).toBe(2 * 1024 * 1024);
    expect(LIVE_REQUEST_TIMEOUT_MS).toBe(10_000);
    expect(DISCOVERY_MAX_OBSERVATIONS).toBe(50);
    expect(TCLK_MAX_FRAME_CHARS).toBe(4096);
    expect(api).toMatch(/MAX_REQUEST_BYTES = 8 \* 1024/);
    expect(implementation).toMatch(/searchParams\.set\("limit", "200"\)|messages\.length > 200/);
  });

  it("uses only limitation copy for prohibited identity, history, and scoring claims", () => {
    expect(page).toContain("not a system of record");
    expect(appSources[3]).toContain("not an account, login, wallet, or persistent profile");
    expect(appSources[4]).toContain("not durable account history, complete activity, contribution credit, rewards, eligibility, reputation, or a trust score");
    expect(rooms).toContain("Retained data is not complete history.");
  });
});
