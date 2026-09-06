import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("../../app/onboarding.tsx", import.meta.url), "utf8");

describe("V12-09 UI Phase 3 guided onboarding contract", () => {
  it("reuses only the approved identity, backup, signing, publishing, read-back, and receipt APIs", () => {
    for (const api of ["generateLocalIdentity", "importEncryptedIdentity", "prepareSignedMessage", "publishPreparedMessage", "verifyPublishedReadback", "createReceiptDownload"]) expect(source).toContain(api);
  });

  it("contains no persistence, generic fetch, relay, executable write URL, or raw-secret field", () => {
    expect(source).not.toMatch(/localStorage|sessionStorage|indexedDB|document\.cookie|fetch\s*\(|say-signed|api\/(?:publish|write)|dangerouslySetInnerHTML/);
    expect(source).not.toMatch(/type=["'](?:text|password)["'][^>]+(?:seed|private.key)|(?:seed|private.key)[^<]+<input/i);
  });

  it("presents four domain-gated macro stages without the legacy eight-card dashboard", () => {
    for (const label of ["Identity", "Backup", "Publish", "Verify", "CURRENT", "COMPLETE", "LOCKED", "Step {current} of 4"]) expect(source).toContain(label);
    expect(source).not.toContain("onboarding-steps");
    expect(source).not.toContain("<Card");
    expect(source).toMatch(/disabled={!unlocked\(n\)}/);
  });

  it("keeps signing, publishing, confirmation, and read-back as distinct explicit actions", () => {
    for (const copy of ["Sign locally", "Publish Message", "Publish to #", "Publish message", "Cancel", "Check publication"]) expect(source).toContain(copy);
    expect(source).not.toMatch(/Retry publish/i);
  });

  it("retains operation and revision guards against duplicate or stale state", () => {
    expect(source).toMatch(/operation\.current !== undefined/);
    expect(source).toMatch(/revision\.current \+= 1/);
    expect(source.match(/revision\.current === startedAt/g)?.length).toBeGreaterThanOrEqual(3);
  });

  it("preserves canonical pre-sign inspection, edit invalidation, and cause-neutral outcomes", () => {
    for (const copy of ["Technical signing details", "Full DID", "Nonce", "Post-sweep text", "Canonical payload", "Message changed", "The previous signature no longer applies", "Publish request completed", "Publication outcome unknown", "Not observed yet", "Unable to check publication", "Record observed, verification not confirmed", "Published and verified", "Add to Evidence", "View Receipt"]) expect(source).toContain(copy);
  });
});
