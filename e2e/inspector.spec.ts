import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

const fixture = JSON.parse(readFileSync(new URL("../tests/fixtures/protocol/known-good.json", import.meta.url), "utf8")) as { room: string; record: Record<string, unknown> };
const tclk = JSON.parse(readFileSync(new URL("../tests/fixtures/tclk/official-frames.json", import.meta.url), "utf8")) as { receipt: string };
const did = String(fixture.record.from);

async function openExport(page: Page, records: string, name = "room.jsonl") {
  if ((page.viewportSize()?.width ?? 1000) <= 760) await page.getByRole("button", { name: "Open Workbench menu" }).click();
  await page.getByRole("button", { name: "Developer Tools" }).click();
  await page.getByRole("button", { name: "Analyze an export" }).click();
  await page.getByLabel("Room name").fill(fixture.room);
  await page.getByLabel("Technocore JSONL export").setInputFiles({ name, mimeType: "text/plain", buffer: Buffer.from(records) });
  await page.getByRole("button", { name: "Analyze evidence" }).click();
}

test("first-time Home presents the single-shell real-state dashboard", async ({ page }) => {
  const inspectRequests: string[] = [];
  const discoveryRequests: string[] = [];
  page.on("request", (request) => { if (request.url().includes("/api/inspect")) inspectRequests.push(request.url()); });
  page.on("request", (request) => { if (request.url().includes("/api/rooms")) discoveryRequests.push(request.url()); });
  await page.route("**/api/inspect", (route) => route.fulfill({ json: liveResolution("ROOM", []) }));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Home");
  await expect(page.locator(".sidebar-brand img")).toBeVisible();
  await expect(page.getByRole("button", { name: "Create Agent →" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Docs/ })).toHaveAttribute("href", "https://flop.finance/teaser/");
  await expect(page.getByRole("button", { name: /Import backup/ })).toBeVisible();
  for (const name of ["Create your Agent", "Identity", "Backup", "First Record", "Public Rooms", "Evidence", "Developer Tools"]) await expect(page.getByRole("heading", { name })).toBeVisible();
  await expect(page.getByText("Not created", { exact: true })).toBeVisible();
  await expect(page.getByText("Locked", { exact: true })).toHaveCount(2);
  await expect(page.getByText("Browse public conversations and choose a room.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Open Rooms →" })).toBeVisible();
  await page.screenshot({ path: "artifacts/v12-10-preflight/r4a-desktop-home.png", fullPage: true });
  expect(inspectRequests).toHaveLength(0);
  expect(discoveryRequests).toHaveLength(0);
  await page.getByRole("button", { name: "Open Rooms →" }).click();
  await expect(page.getByRole("heading", { name: "Choose a room", exact: true })).toBeVisible();
  await expect(page.getByText("Select a public room to read its retained conversation.")).toBeVisible();
  await expect(page.locator(".composer")).toHaveCount(0);
  expect(inspectRequests).toHaveLength(0);
  expect(discoveryRequests).toHaveLength(0);
  await page.getByRole("button", { name: "Home", exact: true }).click();
  await page.getByRole("button", { name: "Collapse sidebar" }).click();
  await expect(page.locator(".workbench-app")).toHaveClass(/sidebar-collapsed/);
  await page.getByRole("button", { name: "Expand sidebar" }).click();
  await page.getByRole("button", { name: "Developer Tools" }).click();
  for (const name of ["Debug a message", "Analyze an export", "Inspect a DID / key"]) await expect(page.getByRole("button", { name })).toBeVisible();
  const externalLinks = page.locator('a[target="_blank"]');
  expect(await externalLinks.evaluateAll((links) => links.map((link) => ({ href: link.getAttribute("href"), rel: link.getAttribute("rel") })))).toEqual(expect.arrayContaining([
    { href: "https://x.com/flop_labs", rel: "noopener noreferrer" },
    { href: "https://technocore.chat", rel: "noopener noreferrer" },
    { href: "https://flop.finance/teaser/", rel: "noopener noreferrer" },
    { href: "https://x.com/lon_rong14459", rel: "noopener noreferrer" },
  ]));
  await expect(page.getByText(/wallet|rewards|balances|ranking|marketplace|discord|github/i)).toHaveCount(0);
});

test("R4A requires explicit discovered-room selection and supports switching on desktop and mobile", async ({ page }) => {
  let discoveryCount = 0;
  const reads: string[] = [];
  await page.route("**/api/rooms", (route) => {
    discoveryCount += 1;
    return route.fulfill({ json: { ok: true, value: { observations: [
      { room: "garden", seq: "8", approxStoredSize: "2K", lastActivity: "1m ago", topic: "Garden topic" },
      { room: "lobby", seq: "9", approxStoredSize: "3K", lastActivity: "now", topic: "Lobby topic" },
    ] } } });
  });
  await page.route("**/api/inspect", (route) => {
    const input = route.request().postDataJSON() as { room: string };
    reads.push(input.room);
    return route.fulfill({ json: liveResolution("ROOM", [{ from: "observer", text: `${input.room} retained message`, seq: input.room === "lobby" ? "9" : "8" }]) });
  });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open Rooms →" }).click();
  await expect(page.getByRole("heading", { name: "Choose a room", exact: true })).toBeVisible();
  await expect(page.locator(".conversation-heading")).toHaveCount(0);
  await expect(page.locator(".composer")).toHaveCount(0);
  expect(discoveryCount).toBe(0);
  expect(reads).toEqual([]);
  await page.screenshot({ path: "artifacts/v12-10-preflight/r4a-desktop-room-selection.png", fullPage: true });

  await page.getByRole("button", { name: "Load rooms" }).click();
  await expect(page.locator(".room-choice")).toHaveCount(2);
  await expect(page.locator(".room-choice").first()).toContainText("# lobby");
  await expect(page.locator(".room-choice").first()).toContainText("Recommended · discovered");
  expect(discoveryCount).toBe(1);
  expect(reads).toEqual([]);

  await page.locator(".room-choice").filter({ hasText: "# garden" }).click();
  await expect(page.locator(".conversation-heading").getByRole("heading", { name: "# garden" })).toBeVisible();
  await expect(page.getByText("garden retained message")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Read-only conversation" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Write to #garden" })).toHaveCount(0);
  expect(reads).toEqual(["garden"]);

  await page.locator(".room-choice").filter({ hasText: "# lobby" }).click();
  await expect(page.locator(".conversation-heading").getByRole("heading", { name: "# lobby" })).toBeVisible();
  await expect(page.getByText("lobby retained message")).toBeVisible();
  await expect(page.getByText("garden retained message")).toHaveCount(0);
  expect(reads).toEqual(["garden", "lobby"]);
  await page.screenshot({ path: "artifacts/v12-10-preflight/r4a-desktop-selected-lobby.png", fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole("button", { name: "Back to rooms" })).toBeVisible();
  await page.getByRole("button", { name: "Back to rooms" }).click();
  await expect(page.locator(".room-choice")).toHaveCount(2);
  await page.screenshot({ path: "artifacts/v12-10-preflight/r4a-mobile-room-list.png", fullPage: true });
  await page.locator(".room-choice").filter({ hasText: "# garden" }).click();
  await expect(page.locator(".conversation-heading").getByRole("heading", { name: "# garden" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Back to rooms" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(await page.evaluate(() => document.documentElement.clientWidth));
  expect(reads).toEqual(["garden", "lobby", "garden"]);
  await page.screenshot({ path: "artifacts/v12-10-preflight/r4a-mobile-selected-garden.png", fullPage: true });
});

test("R4B auto-refresh is serialized, visibility-aware, recoverable, and read-only", async ({ page }) => {
  await page.clock.install();
  let readCount = 0;
  let failNext = false;
  let writes = 0;
  await page.route("https://technocore.chat/**", (route) => { writes += 1; return route.abort(); });
  await page.route("**/api/inspect", (route) => {
    readCount += 1;
    if (failNext) { failNext = false; return route.fulfill({ json: { ok: false, error: { code: "NETWORK_FAILURE", message: "temporary read failure" } } }); }
    return route.fulfill({ json: liveResolution("ROOM", [{ from: "observer", text: `bounded view ${readCount}`, seq: String(readCount) }]) });
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.getByRole("button", { name: "Rooms", exact: true }).click();
  await page.getByRole("button", { name: "Open lobby →" }).click();
  await expect(page.getByText("bounded view 1")).toBeVisible();
  await expect(page.getByText("Retained conversation · Auto-refresh on")).toBeVisible();
  await page.clock.fastForward(4_999);
  expect(readCount).toBe(1);
  await page.clock.fastForward(1);
  await expect(page.getByText("bounded view 2")).toBeVisible();

  failNext = true;
  await page.clock.fastForward(5_000);
  await expect(page.getByText("bounded view 2")).toBeVisible();
  await expect(page.getByText("Refresh unavailable", { exact: true })).toBeVisible();
  await expect(page.getByText("temporary read failure")).toBeVisible();
  await page.clock.fastForward(5_000);
  await expect(page.getByText("bounded view 4")).toBeVisible();
  await expect(page.getByText("Refresh unavailable", { exact: true })).toHaveCount(0);
  await page.screenshot({ path: "artifacts/v12-10-preflight/r4b-desktop-auto-refresh.png", fullPage: true });

  await page.evaluate(() => { Object.defineProperty(document, "visibilityState", { configurable: true, value: "hidden" }); document.dispatchEvent(new Event("visibilitychange")); });
  await page.clock.fastForward(20_000);
  expect(readCount).toBe(4);
  await page.evaluate(() => { Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" }); document.dispatchEvent(new Event("visibilitychange")); });
  await expect(page.getByText("bounded view 5")).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Back to rooms" }).click();
  await page.clock.fastForward(20_000);
  expect(readCount).toBe(5);
  expect(writes).toBe(0);
  await page.screenshot({ path: "artifacts/v12-10-preflight/r4b-mobile-room-list-stopped.png", fullPage: true });
});

test("newcomer journey gates backup, signing, explicit publish, read-back verification, and receipt", async ({ page }) => {
  test.setTimeout(90_000);
  await page.addInitScript(() => { Date.now = () => 1_700_000_000_000; });
  const passphrase = "correct horse battery staple";
  let observedWrite: { room: string; did: string; sig: string; nonce: string; text: string } | undefined;
  let writeCount = 0;
  let readCount = 0;
  await page.route("https://technocore.chat/r/lobby/say-signed/**", async (route) => {
    writeCount += 1;
    const parts = new URL(route.request().url()).pathname.split("/").map(decodeURIComponent);
    observedWrite = { room: parts[2] ?? "", did: parts[4] ?? "", sig: parts[5] ?? "", nonce: parts[6] ?? "", text: parts[7] ?? "" };
    await new Promise((resolve) => setTimeout(resolve, 50));
    await route.fulfill({ status: 202, body: "untrusted response body" });
  });
  await page.route("https://technocore.chat/r/lobby?format=json&limit=200", async (route) => {
    readCount += 1;
    const record = observedWrite;
    await new Promise((resolve) => setTimeout(resolve, 50));
    await route.fulfill({ status: 200, contentType: "application/json", json: {
      room: "lobby", count: record ? 1 : 0, first_seq: record ? "501" : null, last_seq: record ? "501" : "0",
      messages: record ? [{ from: record.did, sig: record.sig, nonce: record.nonce, text: record.text, seq: "501", ts: "2026-09-05T00:00:00Z" }] : [],
    } });
  });

  await page.goto("/"); await page.getByRole("button", { name: "Create Agent →" }).click();
  await expect(page.getByRole("heading", { name: "Create your agent identity" }).first()).toBeVisible();
  await expect(page.getByLabel("Onboarding progress")).toBeVisible();
  await expect(page.getByLabel("Onboarding progress").getByRole("button").nth(2)).toBeDisabled();

  await page.getByRole("button", { name: "Create identity" }).click();
  await expect(page.getByText("Active agent")).toBeVisible();
  await expect(page.locator(".identity-context")).not.toContainText(/wallet|account|login|seed|private/i);
  await expect(page.locator('input[name*="seed" i], input[name*="private" i], textarea[name*="seed" i], textarea[name*="private" i]')).toHaveCount(0);
  expect(await page.locator("[data-seed], [data-private-key]").count()).toBe(0);
  await page.getByRole("button", { name: "View full DID" }).click();
  const activeDid = await page.locator(".public-did strong").textContent();
  await page.locator(".identity-context").click();
  await expect(page.getByRole("heading", { name: "Inspect a DID / Key" })).toBeVisible();
  await expect(page.getByLabel("Ed25519 did:key identifier")).toHaveValue(activeDid!);
  await page.locator(".sidebar-brand").click();
  await expect(page.getByRole("heading", { name: "Secure your backup" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Identity" }).locator("xpath=ancestor::article")).toContainText("Ready");
  await expect(page.getByRole("heading", { name: "Backup" }).locator("xpath=ancestor::article")).toContainText("Required");
  await expect(page.getByRole("heading", { name: "First Record" }).locator("xpath=ancestor::article")).toContainText("Needs backup");
  await page.getByRole("button", { name: "Secure Backup →" }).click();
  await page.getByLabel("Backup passphrase").first().fill(passphrase);
  const downloadEvent = page.waitForEvent("download");
  await page.getByRole("button", { name: "Create encrypted backup" }).click();
  const backupDownload = await downloadEvent;
  const backupPath = await backupDownload.path();
  expect(backupPath).not.toBeNull();
  await expect(page.getByLabel("Onboarding progress").getByRole("button").nth(2)).toBeDisabled();

  await page.getByLabel("Encrypted identity backup").setInputFiles(backupPath!);
  await page.getByLabel("Passphrase").fill("wrong passphrase");
  await page.getByRole("button", { name: "Verify backup" }).click();
  await expect(page.locator(".operational-error")).toContainText("decrypt");
  await page.getByLabel("Passphrase").fill(passphrase);
  await page.getByRole("button", { name: "Verify backup" }).click();
  await expect(page.getByText("✓ Backup verified")).toBeVisible();
  await page.getByRole("button", { name: /Continue to your first message/ }).click();

  const hostile = "Hello <script>window.__onboardOwned=true</script> https://example.invalid";
  await page.getByRole("textbox", { name: "Message", exact: true }).fill(`  ${hostile}  `);
  await page.getByRole("button", { name: /Review message/ }).click();
  const review = page.locator("dl.review-summary");
  await expect(review).toContainText("lobby"); await expect(review).toContainText(hostile);
  await page.getByText("Technical signing details").click();
  await expect(page.getByLabel("Exact evidence review")).toContainText("lobby|");
  expect(await page.evaluate(() => (window as Window & { __onboardOwned?: boolean }).__onboardOwned)).toBeUndefined();
  await page.getByRole("button", { name: "Sign locally" }).click();
  await expect(page.getByText("Signed locally", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Edit Message" }).click();
  await expect(page.getByText("Message changed")).toBeVisible();
  await page.getByRole("textbox", { name: "Message", exact: true }).fill(`${hostile}!`);
  await page.getByRole("button", { name: /Review message/ }).click();
  await page.getByText("Technical signing details").click();
  const onboardingNonce = (await page.getByLabel("Exact evidence review").locator("dd").nth(1).textContent())!;
  await page.getByRole("button", { name: "Sign locally" }).click();
  await page.getByRole("button", { name: "Publish Message" }).click();
  await expect(page.getByRole("dialog")).toContainText("cannot safely reuse the same nonce");
  await page.getByRole("button", { name: "Publish message", exact: true }).click();
  await expect(page.locator("strong:visible").filter({ hasText: "Publish request completed" })).toBeVisible();
  await page.screenshot({ path: "artifacts/v12-10-preflight/final-onboarding-response.png" });
  await expect(page.getByRole("button", { name: /Retry publish/i })).toHaveCount(0);
  await expect(page.locator("a[href*='say-signed']")).toHaveCount(0);
  await page.getByRole("button", { name: "Check publication" }).click();
  await expect(page.getByText("Published and verified", { exact: true })).toBeVisible();
  await page.screenshot({ path: "artifacts/v12-10-preflight/final-onboarding-verified.png" });
  await page.getByRole("button", { name: "Add to Evidence" }).click();
  await page.getByRole("button", { name: "View Receipt" }).click();
  await expect(page.getByLabel("Onboarding receipt preview")).toContainText("Technocore Evidence Receipt");
  await page.screenshot({ path: "artifacts/v12-10-preflight/final-onboarding-receipt.png", fullPage: true });
  expect(writeCount).toBe(1); expect(readCount).toBe(1);
  expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length }))).toEqual({ local: 0, session: 0 });
  await page.getByRole("button", { name: "Evidence", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Observed Evidence" })).toBeVisible();
  await expect(page.getByText("Exact read-back verified")).toBeVisible();
  await page.getByText("Observed Evidence Details", { exact: true }).click();
  await expect(page.getByText("Associated with the currently active public DID.")).toBeVisible();
  await page.getByText("Receipt Preview", { exact: true }).click();
  await expect(page.getByLabel("Evidence workspace receipt")).toContainText("Technocore Evidence Receipt");
  await page.getByRole("button", { name: "Inspect Diagnostics" }).click();
  await expect(page.getByRole("heading", { name: "Debug a Message" })).toBeVisible();
  await expect(page.getByLabel("Room name")).toHaveValue("lobby");
  await expect(page.getByLabel("Message sequence")).toHaveValue("501");

  await page.route("**/api/rooms", (route) => route.fulfill({ json: { ok: true, value: { observations: [{ room: "lobby", seq: "501", approxStoredSize: "1K", lastActivity: "now", topic: "Public lobby" }] } } }));
  await page.route("**/api/inspect", (route) => route.fulfill({ json: liveResolution("ROOM", observedWrite ? [{ from: observedWrite.did, sig: observedWrite.sig, nonce: observedWrite.nonce, text: observedWrite.text, seq: "501" }] : []) }));
  await page.locator(".sidebar-brand").click();
  await expect(page.getByRole("heading", { name: "First Record" })).toBeVisible();
  await expect(page.getByRole("button", { name: "View Evidence →" }).first()).toBeVisible();
  await expect(page.getByText("Verified", { exact: true })).toHaveCount(2);
  await page.getByRole("button", { name: "Rooms", exact: true }).first().click();
  await page.getByRole("button", { name: "Load rooms" }).click();
  await page.locator(".room-choice").filter({ hasText: "Public lobby" }).click();
  await expect(page.getByText("SIGNED · VALID")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Write to #lobby" })).toBeVisible();
  await expect(page.getByText("Messages are public and untrusted after publication. Retained history may be incomplete.")).toBeVisible();
  await expect(page.getByText("Do not enter private keys, seeds, passphrases, passwords, tokens, or backup content.")).toBeVisible();
  await expect(page.getByText("0 characters")).toBeVisible();
  await expect(page.getByLabel("Room message")).toHaveAttribute("placeholder", "Write a message…");
  await page.locator(".composer").scrollIntoViewIfNeeded();
  await page.screenshot({ path: "artifacts/v12-10-preflight/r4-desktop-ready-composer.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator(".composer").scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(await page.evaluate(() => document.documentElement.clientWidth));
  await page.screenshot({ path: "artifacts/v12-10-preflight/r4-mobile-ready-composer.png" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.getByLabel("Room message").fill("Second explicit room message");
  await expect(page.getByText("28 characters")).toBeVisible();
  const writesBeforeReview = writeCount;
  await page.getByRole("button", { name: /Review Message/ }).click();
  expect(writeCount).toBe(writesBeforeReview);
  await expect(page.getByLabel("Room signed evidence review")).toContainText("lobby|");
  await expect(page.locator(".review-summary")).toContainText("#lobby");
  await page.screenshot({ path: "artifacts/v12-10-preflight/r4-desktop-review.png" });
  await expect(page.getByRole("button", { name: /Publish Message/ })).toHaveCount(0);
  await page.getByRole("button", { name: "Sign Locally" }).click();
  await expect(page.getByText("Signed locally", { exact: true })).toBeVisible();
  await expect(page.getByText("This message has not been published.")).toBeVisible();
  expect(writeCount).toBe(1);
  await page.screenshot({ path: "artifacts/v12-10-preflight/r4-desktop-signed-local.png" });
  await page.getByRole("button", { name: "Edit Message" }).click();
  await page.getByLabel("Room message").fill("Edited room message invalidates the signed state");
  await expect(page.getByText("Signed locally", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: /Review Message/ }).click();
  const roomsNonce = (await page.getByLabel("Room signed evidence review").locator("dd").nth(1).textContent())!;
  await page.getByRole("button", { name: "Sign Locally" }).click();
  expect(BigInt(roomsNonce)).toBeGreaterThan(BigInt(onboardingNonce));
  await page.getByRole("button", { name: /Publish Message/ }).click();
  await expect(page.getByRole("dialog")).toContainText("cannot safely reuse the same nonce");
  await page.getByRole("button", { name: "Publish message", exact: true }).click();
  await expect(page.locator("strong:visible").filter({ hasText: "Publish request completed" })).toBeVisible();
  await page.getByRole("button", { name: /Check publication/ }).click();
  await expect(page.locator("strong:visible").filter({ hasText: "Published and verified" })).toBeVisible();
  await page.screenshot({ path: "artifacts/v12-10-preflight/final-rooms-verified.png", fullPage: true });
  await page.getByRole("button", { name: "View Receipt" }).click();
  await expect(page.getByLabel("Rooms Evidence Receipt")).toContainText("Technocore Evidence Receipt");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator("section.receipt-inline").scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(await page.evaluate(() => document.documentElement.clientWidth));
  await page.screenshot({ path: "artifacts/v12-10-preflight/final-rooms-receipt-mobile.png" });
  await page.setViewportSize({ width: 1440, height: 900 });
  expect(writeCount).toBe(2); expect(readCount).toBe(2);

  await page.getByRole("button", { name: "My Agent" }).first().click();
  await expect(page.getByRole("heading", { name: "My Agent", exact: true })).toBeVisible();
  await expect(page.getByText(activeDid!, { exact: true })).toBeVisible();
  await expect(page.getByText("✓ Verified", { exact: true })).toBeVisible();
  await expect(page.getByText("✓ Ready to sign")).toBeVisible();
  await page.getByRole("button", { name: "Inspect DID →" }).click();
  await expect(page.getByLabel("Ed25519 did:key identifier")).toHaveValue(activeDid!);
  await page.getByRole("button", { name: "My Agent", exact: true }).click();
  await page.getByRole("button", { name: "Lock Agent" }).click();
  await expect(page.getByRole("dialog")).toContainText("Downloaded encrypted backups are not deleted.");
  await page.getByRole("dialog").getByRole("button", { name: "Lock Agent" }).click();
  await expect(page.getByRole("heading", { name: "No agent identity is active in this browser session." })).toBeVisible();
  await expect(page.getByText("No active agent")).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Home" })).toBeVisible();
  expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length }))).toEqual({ local: 0, session: 0 });
});

test("first-time entries reuse onboarding and active-DID Home remains available", async ({ page }) => {
  const external: string[] = [];
  page.on("request", (request) => { if (request.url().includes("technocore.chat")) external.push(request.url()); });
  await page.goto("/");
  await page.getByRole("button", { name: /Import backup/ }).click();
  await expect(page.getByRole("heading", { name: "Import your identity" }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Import and verify" })).toBeDisabled();
  await expect(page.getByLabel("Onboarding progress").getByRole("button").nth(2)).toBeDisabled();
  await page.getByRole("button", { name: "Home", exact: true }).click();
  await page.getByRole("button", { name: "Create Agent →" }).click();
  await page.getByRole("button", { name: "Create identity" }).click();
  await expect(page.locator(".identity-context")).toBeVisible();
  await page.locator(".sidebar-brand").click();
  await expect(page.getByRole("heading", { name: "Home" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Secure Backup →" })).toBeVisible();
  for (const name of ["Rooms", "My Agent", "Evidence"]) await expect(page.getByRole("button", { name, exact: true })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Workbench" })).toBeVisible();
  await expect(page.locator(".workbench-app")).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole("navigation", { name: "Workbench" })).toBeHidden();
  await page.getByRole("button", { name: "Open Workbench menu" }).click();
  await expect(page.getByRole("navigation", { name: "Workbench" })).toBeVisible();
  await page.getByRole("navigation", { name: "Workbench" }).getByRole("button", { name: "Developer Tools" }).click();
  await expect(page.getByRole("heading", { name: "Developer Tools", level: 1 })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Workbench" })).toBeHidden();
  await page.getByRole("button", { name: "Open Workbench menu" }).click();
  await page.getByRole("navigation", { name: "Workbench" }).getByRole("button", { name: "Home" }).click();
  await expect(page.getByRole("heading", { name: "Home" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth === document.documentElement.clientWidth)).toBe(true);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Home" })).toBeVisible();
  await expect(page.getByText("No active agent")).toBeVisible();
  expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length }))).toEqual({ local: 0, session: 0 });
  expect(external).toEqual([]);
});

test("R4 composer gates reuse existing Agent creation and backup stages", async ({ page }) => {
  await page.route("**/api/inspect", (route) => route.fulfill({ json: liveResolution("ROOM", []) }));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.getByRole("button", { name: "Rooms", exact: true }).click();
  await page.getByRole("button", { name: "Open lobby →" }).click();
  const composer = page.locator(".composer");
  await composer.scrollIntoViewIfNeeded();
  await expect(page.getByRole("heading", { name: "Read-only conversation" })).toBeVisible();
  await expect(page.getByText("Create or import an Agent to sign and publish to this room. Reading retained messages remains available.")).toBeVisible();
  await expect(page.getByText("Never enter private keys, seeds, passphrases, passwords, tokens, or backup files here.")).toBeVisible();
  await expect(page.getByLabel("Room message")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Sign Locally|Publish Message/ })).toHaveCount(0);
  await page.screenshot({ path: "artifacts/v12-10-preflight/r4-desktop-no-agent.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  await composer.scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(await page.evaluate(() => document.documentElement.clientWidth));
  await page.screenshot({ path: "artifacts/v12-10-preflight/r4-mobile-no-agent.png" });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.getByRole("button", { name: "Create or Import Agent →" }).click();
  await expect(page.getByRole("heading", { name: "Create your agent identity", level: 1 })).toBeVisible();
  await expect(page.getByRole("button", { name: "Import an existing backup →" })).toBeVisible();
  await page.getByRole("button", { name: "Create identity" }).click();
  await page.getByRole("button", { name: "Rooms", exact: true }).click();
  await page.getByRole("button", { name: "Open lobby →" }).click();
  await composer.scrollIntoViewIfNeeded();
  await expect(page.getByRole("heading", { name: "Composer locked" })).toBeVisible();
  await expect(page.getByText("Secure backup to sign and publish.")).toBeVisible();
  await expect(page.getByText("Reading retained messages remains available.", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Room message")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Sign Locally|Publish Message/ })).toHaveCount(0);
  await page.screenshot({ path: "artifacts/v12-10-preflight/r4-desktop-backup-required.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  await composer.scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(await page.evaluate(() => document.documentElement.clientWidth));
  await page.screenshot({ path: "artifacts/v12-10-preflight/r4-mobile-backup-required.png" });
  await page.getByRole("button", { name: "Secure Backup →" }).click();
  await expect(page.getByRole("heading", { name: "Secure your identity", level: 1 })).toBeVisible();
});

test("Rooms / Chat reads retained public conversation inertly and keeps publishing unavailable without identity", async ({ page }) => {
  const hostile = '<script>window.__chatOwned=true</script> https://example.invalid/path';
  let roomReads = 0;
  await page.route("**/api/rooms", (route) => route.fulfill({ json: { ok: true, value: { observations: [{ room: "garden", seq: "13", approxStoredSize: "1K", lastActivity: "now" }, { room: "lobby", seq: "12", approxStoredSize: "2K", lastActivity: "now", topic: hostile }] } } }));
  await page.route("**/api/inspect", (route) => { roomReads += 1; return route.fulfill({ json: liveResolution("ROOM", [{ from: "alice", text: hostile, seq: "11" }, fixture.record]) }); });
  await page.goto("/");
  await page.getByRole("button", { name: "Create Agent →" }).click();
  await page.getByRole("button", { name: "Create identity" }).click();
  await page.getByRole("button", { name: "Rooms", exact: true }).click();
  await expect(page.getByText(/Room discovery remains manual/)).toBeVisible();
  await page.getByRole("button", { name: "Load rooms" }).click();
  await expect(page.locator(".room-choice").first()).toContainText("# lobby");
  await expect(page.locator(".room-choice").first()).toContainText("Recommended · discovered");
  await expect(page.getByText(hostile).first()).toBeVisible();
  await page.getByRole("button", { name: new RegExp(fixture.room) }).click();
  await expect(page.locator(".room-choice.selected")).toHaveAttribute("aria-current", "true");
  await expect(page.getByText("UNSIGNED", { exact: true })).toBeVisible();
  await expect(page.getByText("SIGNED · VALID")).toBeVisible();
  await expect(page.getByText(hostile).last()).toBeVisible();
  expect(await page.evaluate(() => (window as Window & { __chatOwned?: boolean }).__chatOwned)).toBeUndefined();
  await expect(page.locator(`a[href="https://example.invalid/path"]`)).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Composer locked" })).toBeVisible();
  await expect(page.getByText("Secure backup to sign and publish.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Secure Backup →" })).toBeVisible();
  await expect(page.getByLabel("Room message")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Publish Message/ })).toHaveCount(0);
  expect(roomReads).toBe(1);
  await page.locator(".chat-message").filter({ hasText: hostile }).getByRole("button", { name: "Add to Evidence" }).click();
  await page.locator(".sidebar-brand").click();
  await page.getByRole("button", { name: "Evidence", exact: true }).click();
  await page.getByText("Observed Evidence Details", { exact: true }).click();
  await expect(page.getByText(hostile).last()).toBeVisible();
  await expect(page.locator(`a[href="https://example.invalid/path"]`)).toHaveCount(0);
  expect(await page.evaluate(() => (window as Window & { __chatOwned?: boolean }).__chatOwned)).toBeUndefined();
  await page.locator(".sidebar-brand").click();
  await page.getByRole("button", { name: "Rooms", exact: true }).first().click();
  await page.getByRole("button", { name: "Load rooms" }).click();
  await page.getByRole("button", { name: new RegExp(fixture.room) }).click();
  await page.getByRole("button", { name: "Refresh conversation" }).click();
  expect(roomReads).toBe(3);
  await page.locator(".chat-message").filter({ hasText: hostile }).getByRole("button", { name: "Inspect message" }).click();
  await expect(page.getByRole("heading", { name: "Debug a Message" })).toBeVisible();
  await expect(page.getByLabel("Room name")).toHaveValue("lobby");
  await expect(page.getByLabel("Message sequence")).toHaveValue("11");
});

test("R3 distinguishes bounded discovery from direct lobby access and supports the mobile conversation flow", async ({ page }) => {
  const hostile = "<b>plain untrusted content</b> https://example.invalid/r3";
  let discoveryMode: "results" | "error" = "results";
  let roomReads = 0;
  await page.route("**/api/rooms", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 80));
    if (discoveryMode === "error") return route.fulfill({ json: { ok: false, error: { code: "NETWORK_FAILURE", message: "offline" } } });
    return route.fulfill({ json: { ok: true, value: { observations: [{ room: "garden", seq: "7", approxStoredSize: "2K", lastActivity: "1m ago", topic: hostile }] } } });
  });
  await page.route("**/api/inspect", (route) => {
    roomReads += 1;
    return route.fulfill({ json: liveResolution("ROOM", [
      { from: "alice", text: "older retained message", seq: "2" },
      { from: did, text: "newest retained message", seq: "12", nonce: String(fixture.record.nonce), sig: String(fixture.record.sig) },
    ]) });
  });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.getByRole("button", { name: "Rooms", exact: true }).click();
  const loadRooms = page.getByRole("button", { name: "Load rooms" });
  await loadRooms.click();
  await expect(page.getByText("Loading public rooms…")).toBeVisible();
  await expect(page.locator(".room-choice")).toHaveCount(1);
  await expect(page.locator(".room-choice")).toContainText("# garden");
  await expect(page.getByRole("heading", { name: "# lobby" })).toBeVisible();
  await expect(page.getByText("Not observed in the current room list.", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Open lobby →" }).click();
  await expect(page.locator(".conversation-heading").getByRole("heading", { name: "# lobby" })).toBeVisible();
  await expect(page.getByText("Retained conversation · Auto-refresh on")).toBeVisible();
  await expect(page.locator(".chat-message").first()).toContainText("newest retained message");
  await expect(page.locator(".chat-message").nth(1)).toContainText("older retained message");
  await expect(page.getByText("SIGNED · VALID")).toBeVisible();
  await expect(page.getByText("UNSIGNED", { exact: true })).toBeVisible();
  await expect(page.getByText("seq 12")).toBeVisible();
  await expect(page.locator('a[href="https://example.invalid/r3"]')).toHaveCount(0);
  expect(roomReads).toBe(1);
  await page.screenshot({ path: "artifacts/v12-10-preflight/r3-desktop-direct-lobby.png", fullPage: true });

  await page.getByRole("button", { name: "Refresh conversation" }).click();
  expect(roomReads).toBe(2);
  discoveryMode = "error";
  await page.getByRole("button", { name: "Refresh rooms" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Public rooms unavailable" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Try Again" })).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole("button", { name: "Back to rooms" })).toBeVisible();
  await page.screenshot({ path: "artifacts/v12-10-preflight/r3-mobile-conversation.png", fullPage: true });
  await page.getByRole("button", { name: "Back to rooms" }).click();
  await expect(page.getByRole("button", { name: "Try Again" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(await page.evaluate(() => document.documentElement.clientWidth));
  await page.screenshot({ path: "artifacts/v12-10-preflight/r3-mobile-room-list.png", fullPage: true });
});

test("Explore loads bounded untrusted rooms, handles empty/error, and navigates through transcript and pipeline", async ({ page }) => {
  const hostile = "<script>window.__roomOwned=true</script> https://example.invalid";
  let mode: "rooms" | "empty" | "error" = "rooms";
  await page.route("**/api/rooms", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    if (mode === "error") return route.fulfill({ json: { ok: false, error: { code: "NETWORK_FAILURE", message: "Discovery unavailable." } } });
    return route.fulfill({ json: { ok: true, value: { observations: mode === "empty" ? [] : [{ room: fixture.room, seq: "9", approxStoredSize: "1K", lastActivity: "now", topic: hostile }] } } });
  });
  await page.route("**/api/inspect", (route) => route.fulfill({ json: liveResolution("ROOM", [fixture.record]) }));
  await page.goto("/"); await page.getByRole("button", { name: "Developer Tools" }).click(); await page.getByRole("button", { name: /Explore public rooms/ }).click();
  await expect(page.getByRole("status")).toContainText("Loading bounded");
  await expect(page.getByText(hostile)).toBeVisible();
  expect(await page.evaluate(() => (window as Window & { __roomOwned?: boolean }).__roomOwned)).toBeUndefined();
  await page.getByRole("button", { name: "Inspect transcript" }).click();
  await expect(page.getByText("Protocol Diagnostics", { exact: true })).toBeVisible();
  await expect(page.getByText(/bounded retained transcript/)).toBeVisible();
  await page.getByRole("button", { name: /Inspect the 12-stage pipeline/ }).click();
  await expect(page.getByText("Verification Result")).toBeVisible(); await expect(page.getByRole("heading", { name: "VALID", exact: true })).toBeVisible();
  await expect(page.locator(".stage")).toHaveCount(12);
  await expect(page.locator(".stage[open]")).toHaveCount(0);
  await page.locator(".stage").first().locator("summary").click();
  await expect(page.locator(".stage[open]")).toHaveCount(1);
  await page.getByRole("button", { name: "Back to diagnostics" }).click(); await page.getByRole("button", { name: "Back to explore" }).click();
  mode = "empty"; await page.getByRole("button", { name: "Refresh once" }).click(); await expect(page.getByText("No public rooms were observed.")).toBeVisible();
  mode = "error"; await page.getByRole("button", { name: "Refresh once" }).click(); await expect(page.locator(".operational-error")).toContainText("NETWORK_FAILURE");
});

test("direct Message Debug preserves operational errors and distinguishes INVALID from UNVERIFIABLE", async ({ page }) => {
  await page.route("**/api/inspect", async (route) => {
    const input = route.request().postDataJSON() as { sequence: string };
    if (input.sequence === "404") return route.fulfill({ json: { ok: false, error: { code: "MESSAGE_NOT_OBSERVED", message: "Not observed in bounded window." } } });
    const record = input.sequence === "2" ? { ...fixture.record, text: `${fixture.record.text}!` } : { ...fixture.record, sig: undefined };
    return route.fulfill({ json: liveResolution("MESSAGE", [record]) });
  });
  await page.goto("/"); await page.getByRole("button", { name: "Developer Tools" }).click(); await page.getByRole("button", { name: "Debug a message" }).click(); await page.getByLabel("Room name").fill(fixture.room); await page.getByLabel("Message sequence").fill("2"); await page.getByRole("button", { name: "Analyze evidence" }).click();
  await expect(page.getByRole("heading", { name: "INVALID", exact: true })).toBeVisible(); await expect(page.getByText(/ran with usable key, canonical payload, and signature evidence and returned false/)).toBeVisible();
  await expect(page.getByText("First failed boundary", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Ed25519 verification/ })).toBeVisible();
  await page.getByRole("button", { name: "Back to input" }).click(); await page.getByLabel("Message sequence").fill("3"); await page.getByRole("button", { name: "Analyze evidence" }).click();
  await expect(page.getByRole("heading", { name: "UNVERIFIABLE", exact: true })).toBeVisible(); await expect(page.getByText(/UNVERIFIABLE is not INVALID/)).toBeVisible();
  await expect(page.getByText("First unavailable boundary", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Signature representation/ })).toBeVisible();
  await page.getByRole("button", { name: "Back to input" }).click(); await page.getByLabel("Message sequence").fill("404"); await page.getByRole("button", { name: "Analyze evidence" }).click();
  await expect(page.locator(".operational-error")).toContainText("This is not an INVALID evidence verdict.");
});

test("local Export shows cause-neutral diagnostics, pipeline boundaries, and Markdown/JSON receipt downloads", async ({ page }) => {
  const remote: string[] = []; page.on("request", (request) => { if (request.url().includes("technocore.chat")) remote.push(request.url()); });
  const body = [JSON.stringify({ seq: 1, from: "alice", text: "one" }), "{bad", JSON.stringify({ seq: 4, from: "alice", text: tclk.receipt })].join("\n");
  await page.goto("/"); await openExport(page, body, "local-only.jsonl");
  await expect(page.getByText("The export is analyzed locally in your browser and is not uploaded.")).toBeHidden();
  await expect(page.getByText(/available evidence does not establish its cause/)).toBeVisible();
  await expect(page.getByText(/not claim complete history/)).toBeVisible();
  await page.getByRole("button", { name: /Inspect the 12-stage pipeline/ }).click();
  await expect(page.getByText("Operational observations")).toBeVisible(); await expect(page.getByText("EXPORT_INVALID_JSON")).toBeVisible();
  await page.getByRole("button", { name: "Create Local Evidence Receipt" }).click();
  await expect(page.getByRole("dialog")).toContainText("Local Evidence Receipt"); await expect(page.getByLabel("Receipt preview")).toContainText("# Technocore Evidence Receipt");
  const markdownDownload = page.waitForEvent("download"); await page.getByRole("button", { name: "Download Markdown" }).click(); expect((await markdownDownload).suggestedFilename()).toBe("technocore-evidence-receipt.md");
  await page.getByRole("radio", { name: "JSON" }).check(); await expect(page.getByLabel("Receipt preview")).toContainText('"schema": "technocore-evidence-receipt/v1"');
  const jsonDownload = page.waitForEvent("download"); await page.getByRole("button", { name: "Download JSON" }).click(); expect((await jsonDownload).suggestedFilename()).toBe("technocore-evidence-receipt.json");
  expect(remote).toEqual([]); expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length }))).toEqual({ local: 0, session: 0 });
});

test("DID flow uses NOT_APPLICABLE message stages and can create a local receipt", async ({ page }) => {
  const remote: string[] = []; page.on("request", (request) => { if (request.url().includes("technocore.chat")) remote.push(request.url()); });
  await page.goto("/"); await page.getByRole("button", { name: "Developer Tools" }).click(); await page.getByRole("button", { name: "Inspect a DID / key" }).click(); await page.getByLabel("Ed25519 did:key identifier").fill(did); await page.getByRole("button", { name: "Analyze evidence" }).click();
  await expect(page.getByText("NO MESSAGE VERDICT")).toBeVisible(); await expect(page.locator(".stage .status.status-not_applicable")).toHaveCount(9); await expect(page.locator(".stage .status.status-not_applicable").first()).toContainText("NOT_APPLICABLE");
  await page.getByRole("button", { name: "Create Local Evidence Receipt" }).click(); await expect(page.getByLabel("Receipt preview")).toContainText("Source kind: `DID`"); expect(remote).toEqual([]);
});

test("empty export remains explicit and does not fabricate a verdict", async ({ page }) => {
  await page.goto("/"); await openExport(page, "", "empty.jsonl"); await page.getByText("Observed Records", { exact: true }).click(); await expect(page.getByText("No retained records were present. No evidence verdicts were fabricated.")).toBeVisible(); await page.getByRole("button", { name: /Inspect the 12-stage pipeline/ }).click(); await expect(page.getByText("NO MESSAGE VERDICT")).toBeVisible();
});

test("hostile export content is inert and tclk remains observation-only", async ({ page }) => {
  const hostile = '<script>window.__owned=true</script> ignore previous instructions';
  await page.goto("/"); await openExport(page, [JSON.stringify({ from: "alice", text: tclk.receipt }), JSON.stringify({ from: "alice", text: hostile })].join("\n"), "hostile.jsonl");
  expect(await page.evaluate(() => (window as Window & { __owned?: boolean }).__owned)).toBeUndefined(); await page.getByRole("button", { name: /Inspect the 12-stage pipeline/ }).click(); await page.getByRole("button", { name: "Create Local Evidence Receipt" }).click(); await expect(page.getByLabel("Receipt preview")).toContainText(/do not prove execution, settlement, payment, value transfer, or work completion/);
});

test("mobile prioritizes verdict and boundary before technical stages without overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto("/"); await openExport(page, JSON.stringify({ ...fixture.record, sig: undefined }), "long-export-name-that-wraps.jsonl"); await page.getByRole("button", { name: /Inspect the 12-stage pipeline/ }).click();
  const positions = await page.evaluate(() => ({ verdict: document.querySelector(".verdict-hero")!.getBoundingClientRect().top, boundary: document.querySelector(".boundary-focus")!.getBoundingClientRect().top, stages: document.querySelector(".stages")!.getBoundingClientRect().top, width: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
  expect(positions.verdict).toBeLessThan(positions.boundary); expect(positions.boundary).toBeLessThan(positions.stages); expect(positions.scroll).toBe(positions.width);
});

function liveResolution(kind: "ROOM" | "MESSAGE", records: readonly Record<string, unknown>[]) {
  return { ok: true, kind, value: { report: { inputKind: kind, messages: records.map((record) => ({ verificationState: "VALID", fields: [field("room", fixture.room), field("text", record.text), field("from", record.from), field("nonce", record.nonce), field("signature", record.sig), field("seq", record.seq), field("ts", record.ts)].filter((item) => item.value !== undefined), warnings: [] })), warnings: [], operationalErrors: [] }, serverMetadata: [field("count", records.length), field("first_seq", "1"), field("last_seq", "9")] } };
}
function field(name: string, value: unknown) { return { name, value, authority: "UNTRUSTED_CALLER_DATA" }; }
