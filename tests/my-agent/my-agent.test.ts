import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const component = readFileSync(new URL("../../app/my-agent.tsx", import.meta.url), "utf8");
const page = readFileSync(new URL("../../app/page.tsx", import.meta.url), "utf8");
const onboarding = readFileSync(new URL("../../app/onboarding.tsx", import.meta.url), "utf8");
const rooms = readFileSync(new URL("../../app/rooms-chat.tsx", import.meta.url), "utf8");
const api = ["inspect", "rooms"].map((name) => readFileSync(new URL(`../../app/api/${name}/route.ts`, import.meta.url), "utf8")).join("\n");

describe("V12-08B and V12-09 Phase 4 My Agent integration", () => {
  it("presents truthful no-active and active public identity states", () => {
    for (const copy of ["No agent identity is active in this browser session.", "Public DID", "Active in this browser session", "Backup status", "Signing readiness", "Lock Agent"]) expect(component).toContain(copy);
    expect(component).toContain("identity.publicIdentity.did");
    expect(component).toContain('identity.backupVerificationStatus === "VERIFIED"');
    expect(component).not.toMatch(/identity\.(?:seed|privateKey|passphrase|ciphertext)/);
  });

  it("reuses existing onboarding and DID Inspector paths from the single Home-owned session", () => {
    expect(page).toContain('<MyAgent identity={activeIdentity}');
    expect(page).toContain('<RoomsChat identity={activeIdentity}');
    expect(page).toContain('onCreateOrImport={() => openOnboarding("CREATE")}');
    expect(page).toContain('onSecureBackup={() => openOnboarding("MANAGE")}');
    expect(page).toContain('<OnboardingFlow key={onboardingGeneration} entry={onboardingEntry} identity={activeIdentity}');
    expect(page).toMatch(/onCreate=\{\(\) => openOnboarding\("CREATE"\)\}/);
    expect(page).toMatch(/onImport=\{\(\) => openOnboarding\("IMPORT"\)\}/);
    expect(page).toMatch(/onBackup=\{\(\) => openOnboarding\("MANAGE"\)\}/);
    expect(page).toMatch(/onInspectDid=\{openDidInspector\}/);
    expect(onboarding).toContain('"MANAGE"');
  });

  it("locks the existing session before clearing the authoritative Home holder", () => {
    expect(component).toMatch(/identity\.lock\(\);\s*onIdentityChange\(undefined\)/);
    expect(component).toContain("Lock this Agent?");
    expect(component).toContain("Downloaded encrypted backups are not deleted.");
    expect(component).toContain("setConfirmLock(true)");
    expect(page.match(/useState<LocalIdentitySession>/g)).toHaveLength(1);
    expect(rooms).toMatch(/const activeIdentity = identity && !identity\.isLocked \? identity : undefined/);
    expect(rooms).toMatch(/const eligible = activeIdentity\?\.backupVerificationStatus === "VERIFIED"/);
  });

  it("keeps the full public DID selectable and provides clipboard failure guidance", () => {
    expect(component).toContain('className="agent-did break-anywhere" tabIndex={0}');
    expect(component).toContain("navigator.clipboard.writeText(identity.publicIdentity.did)");
    expect(component).toContain("Select and copy the full DID above.");
  });

  it("introduces no persistence, server identity route, secret getter, or alternate domain engine", () => {
    const integration = `${component}\n${page}`;
    expect(integration).not.toMatch(/localStorage|sessionStorage|indexedDB|document\.cookie/);
    expect(component).not.toMatch(/fetch\s*\(|prepareSignedMessage|publishPreparedMessage|verifyPublishedReadback/);
    expect(api).not.toMatch(/lib\/identity|LocalIdentitySession|generateLocalIdentity|importEncryptedIdentity/);
  });
});
