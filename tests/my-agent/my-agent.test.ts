import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const component = readFileSync(new URL("../../app/my-agent.tsx", import.meta.url), "utf8");
const page = readFileSync(new URL("../../app/page.tsx", import.meta.url), "utf8");
const onboarding = readFileSync(new URL("../../app/onboarding.tsx", import.meta.url), "utf8");
const rooms = readFileSync(new URL("../../app/rooms-chat.tsx", import.meta.url), "utf8");
const api = ["inspect", "rooms"].map((name) => readFileSync(new URL(`../../app/api/${name}/route.ts`, import.meta.url), "utf8")).join("\n");

describe("V12-08B and V12-09 Phase 4 My Agent integration", () => {
  it("shows persistent qualifying contributions publicly while keeping new signing locked", () => {
    for (const copy of ["My Contributions", "Add Contribution", "No verified contributions recorded yet.", "Signature Verified", "View Evidence", "Public Evidence Receipt"]) expect(component).toContain(copy);
    expect(component).toContain("disabled={identity.isLocked}");
    expect(page).toContain("contributions={persistedAgent?.contributions ?? []}");
    expect(page).toContain("onAddContribution={openAddContribution}");
    expect(page).toContain("contributionOnly={addingContribution}");
    expect(page).not.toContain("Add Contribution needs an existing signature-verified Technocore record");
    expect(component).not.toMatch(/fetch\s*\(|prepareSignedMessage|publishPreparedMessage|verifyPublishedReadback/);
  });
  it("presents truthful no-active and active public identity states", () => {
    for (const copy of ["Agent not loaded", "Your Agent is not currently unlocked in this browser.", "Restore Workbench Agent", "Import Existing Agent", "Create New Agent", "Public DID", "Unlocked for this browser session", "Backup verification", "Signing readiness", "Lock Agent", "Welcome back", "Remove Agent from this browser"]) expect(component).toContain(copy);
    expect(component).toContain("identity.publicIdentity.did");
    expect(component).toContain('identity.backupVerificationStatus === "VERIFIED"');
    expect(component).not.toMatch(/identity\.(?:seed|privateKey|passphrase|ciphertext)/);
  });

  it("distinguishes ownership from the loaded session and reuses the V1 restore path", () => {
    expect(component).toContain("Already have an Agent?");
    expect(component).toContain('<button className="primary" type="button" onClick={onCreate}>Create New Agent</button>');
    expect(component).toContain('<button className="text-action" type="button" onClick={onImport}>Restore Workbench Agent</button>');
    expect(component).toContain("Restore the same DID using your Encrypted Backup and Backup Password.");
    expect(onboarding).toContain("AGENT RESTORED ✓");
    expect(onboarding).toContain("Backup decrypted locally");
    expect(onboarding).toContain("DID matched");
    expect(onboarding).toContain("Open Technocore Rooms →");
    expect(onboarding).toContain("importEncryptedIdentity(content, verifyPassphrase)");
  });

  it("reuses existing onboarding and DID Inspector paths from the single Home-owned session", () => {
    expect(page).toContain('<MyAgent identity={activeIdentity}');
    expect(page).toContain('<RoomsChat identity={activeIdentity}');
    expect(page).toContain('onCreateOrImport={() => openOnboarding("CREATE")}');
    expect(page).toContain('onSecureBackup={() => openOnboarding("MANAGE")}');
    expect(page).toContain('<OnboardingFlow key={onboardingGeneration} entry={onboardingEntry} identity={onboardingEntry === "IMPORT" && activeIdentity?.isLocked ? undefined : activeIdentity}');
    expect(page).toMatch(/onCreate=\{\(\) => openOnboarding\("CREATE"\)\}/);
    expect(page).toMatch(/onImport=\{\(\) => openOnboarding\("IMPORT"\)\}/);
    expect(page).toMatch(/onBackup=\{\(\) => openOnboarding\("MANAGE"\)\}/);
    expect(page).toMatch(/onRooms=\{openRooms\}/);
    expect(page).toMatch(/onInspectDid=\{openDidInspector\}/);
    expect(onboarding).toContain('"MANAGE"');
  });

  it("locks the existing session before clearing the authoritative Home holder", () => {
    expect(component).toMatch(/hideSecret\(\);\s*onLock\(\)/);
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

  it("gates the bounded owner-only Secret Key reveal and copy behind explicit confirmation", () => {
    expect(component).toContain("Reveal Secret Key");
    expect(component).toContain("I understand · Reveal");
    expect(component).toContain("OWNER_SECRET_REVEAL_AUTHORIZATION");
    expect(component).toMatch(/!secretRevealed \? .*Reveal Secret Key/s);
    expect(component).toMatch(/secretRevealed\) return/);
    expect(component).toContain("Hide Secret Key");
    expect(component).toContain("Copy Secret Key");
    expect(component).toMatch(/hideSecret\(\);\s*onLock\(\)/);
  });

  it("keeps persistence browser-local with no server identity route or alternate domain engine", () => {
    expect(page).toContain("window.localStorage");
    expect(page).not.toMatch(/sessionStorage|indexedDB|document\.cookie/);
    expect(component).not.toMatch(/fetch\s*\(|prepareSignedMessage|publishPreparedMessage|verifyPublishedReadback/);
    expect(api).not.toMatch(/lib\/identity|LocalIdentitySession|generateLocalIdentity|importEncryptedIdentity/);
  });
});
