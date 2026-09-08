import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const page = readFileSync(new URL("../../app/page.tsx", import.meta.url), "utf8");
const onboarding = readFileSync(new URL("../../app/onboarding.tsx", import.meta.url), "utf8");
const api = ["inspect", "rooms"].map((name) => readFileSync(new URL(`../../app/api/${name}/route.ts`, import.meta.url), "utf8")).join("\n");

describe("V12-09R Workbench integration boundaries", () => {
  it("exposes the compact Home and existing inspection information architecture", () => {
    for (const label of ["Restore Agent", "Create New Agent", "Rooms", "My Agent", "Evidence", "Public Rooms", "Open Rooms", "Debug a message", "Analyze an export", "Inspect a DID / key"]) expect(page).toContain(label);
    expect(page).toContain('id="inspect-debug-title">Developer Tools');
  });

  it("derives the same Home structure from real readiness and runtime Evidence only", () => {
    for (const copy of ["Next Action", "Identity", "Backup", "First Record", "Public Rooms", "Developer Tools", "Ready", "Required", "Not loaded", "Verified"]) expect(page).toContain(copy);
    expect(page).toContain('identity?.backupVerificationStatus === "VERIFIED"');
    expect(page).toContain('entry.source === "READBACK_VERIFIED"');
    expect(page).toContain('entry.observationState === "PUBLISHED_AND_VERIFIED"');
    const home = page.slice(page.indexOf("function StartScreen"), page.indexOf("function DeveloperTools"));
    expect(home).not.toMatch(/activity score|contribution|reputation score|trust score|rewards|eligibility/i);
    expect(home.match(/home-primary-grid/g)).toHaveLength(1);
    expect(home.match(/home-status-grid/g)).toHaveLength(1);
    for (const nextAction of ["Create your Agent", "Secure your backup", "Agent ready", "Open Technocore Rooms"]) expect(home).toContain(nextAction);
    expect(home).toContain('label: "Open Technocore Rooms →", run: props.onRooms');
    expect(home).toContain('verified ? "View Evidence →"');
  });

  it("keeps one resumable onboarding orchestrator and reuses debugger inputs", () => {
    expect(page.match(/<OnboardingFlow/g)).toHaveLength(1);
    expect(page).toContain('onboardingStarted && <div className="onboarding-host" hidden={screen !== "ONBOARD"}><OnboardingFlow key={onboardingGeneration}');
    expect(page).toContain('function goStart() { setScreen("START")');
    expect(page).toMatch(/openDidInspector/);
    expect(page).toMatch(/openMessageDebugger/);
    expect(onboarding).toMatch(/onInspectDid/);
    expect(onboarding).toMatch(/onDebugMessage/);
  });

  it("holds only compact public agent context without account or wallet semantics", () => {
    expect(page).toContain('aria-label="Open My Agent"');
    expect(page).toContain('onClick={onAgent}');
    expect(page).toContain("identity.publicIdentity.did");
    expect(page).not.toMatch(/Active (?:account|wallet|login)/i);
    expect(page).not.toMatch(/identity\.(?:seed|privateKey|passphrase)/);
  });

  it("uses one state-aware shell and complete navigation before and after DID creation", () => {
    for (const label of ["Home", "Rooms", "My Agent", "Evidence", "Developer Tools"]) expect(page).toContain(`"${label}"`);
    expect(page).toContain('aria-label="Workbench"');
    expect(page).toContain('aria-current={current === key ? "page" : undefined}');
    expect(page).toContain('className={`workbench-app${sidebarCollapsed ? " sidebar-collapsed" : ""}`}');
    expect(page).toContain('className="workbench-workspace"');
    expect(page).toContain('aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}');
    expect(page).toContain('aria-label={mobileMenuOpen ? "Close Workbench menu" : "Open Workbench menu"}');
    expect(page).toContain('setMobileMenuOpen(false); run();');
    expect(page.match(/const \[screen, setScreen\]/g)).toHaveLength(1);
  });

  it("uses the exact compact FLOP logo, semantic icons, and approved static resources", () => {
    expect(page).toContain('src="/brand/flop-logo.png"');
    expect(page).toContain('className="workbench-icon"');
    for (const icon of ["home", "rooms", "agent", "evidence", "tools", "docs"]) expect(page).toContain(`name === "${icon}"`);
    expect(page).not.toContain('<span className="brand-mark">F</span>');
    for (const url of ["https://x.com/flop_labs", "https://technocore.chat", "https://flop.finance/teaser/", "https://x.com/lon_rong14459"]) expect(page).toContain(url);
    expect(page).toContain('target="_blank" rel="noopener noreferrer"');
    expect(page).not.toMatch(/discord\.com|github\.com/);
  });

  it("implements no-DID Home as a deterministic dashboard", () => {
    for (const copy of ["Start, read public rooms, or inspect evidence.", "Create your Agent", "Create New Agent", "Already have an Agent?", "Restore Agent", "Not loaded", "Locked", "Needs Agent", "Empty", "Browse public conversations and choose a room.", "Open Rooms →"]) expect(page).toContain(copy);
    expect(page).toContain('<button className="primary" type="button" onClick={next.run}>{next.label}</button>');
    expect(page).toContain('<button className="text-action" type="button" onClick={() => props.onOnboard("IMPORT")}>Restore Agent</button>');
    expect(page).toContain('{identity && <div className="home-status-grid">');
    expect(page).toContain('<div className="identity-context status-only"><span>No Agent loaded</span></div>');
    expect(page).toContain('run: props.onJourney');
    expect(page).toContain('props.onOnboard("IMPORT")');
    expect(page).toContain('resource("docs", "Docs", FLOP_DOCS_URL)');
    expect(page).not.toMatch(/discord\.com|github\.com|airdrop|token price|follower count/i);
    expect(page).toContain('<RoomsChat identity={activeIdentity}');
    expect(page).not.toMatch(/onOpenLobby|openRooms\("lobby"\)|roomsEntryRoom|initialRoom/);
  });

  it("does not restore marketing presentation or fake SaaS data", () => {
    expect(page).not.toContain('className="flop-brand-hero"');
    expect(page).not.toContain('className="product-preview"');
    expect(page).not.toMatch(/Total Contacts|Active Deals|Revenue Overview|Conversion Rate|Recent Contacts|pricing|testimonial/i);
  });

  it("adds only approved encrypted local persistence and no content-derived fetch or server write relay", () => {
    const integration = `${page}\n${onboarding}`;
    expect(integration).toContain("window.localStorage");
    expect(integration).not.toMatch(/sessionStorage|indexedDB|document\.cookie|setInterval|dangerouslySetInnerHTML|say-signed|fetch\s*\(.*(?:text|topic|message)/);
    expect(api).not.toMatch(/publishPreparedMessage|say-signed|lib\/publish|lib\/signing|lib\/identity/);
  });
});
