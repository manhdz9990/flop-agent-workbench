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
  await expect(page.getByRole("button", { name: "Create New Agent", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /Docs/ })).toHaveAttribute("href", "https://flop.finance/teaser/");
  await expect(page.getByRole("button", { name: /Restore Agent/ }).first()).toBeVisible();
  await expect(page.locator("button.primary:visible")).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Restore Agent", exact: true })).toHaveClass(/text-action/);
  for (const name of ["Create your Agent", "Public Rooms", "Developer Tools"]) await expect(page.getByRole("heading", { name })).toBeVisible();
  for (const name of ["Identity", "Backup", "First Record", "Evidence"]) await expect(page.getByRole("heading", { name, exact: true })).toHaveCount(0);
  await expect(page.getByText("No Agent loaded", { exact: true })).toBeVisible();
  await expect(page.getByText("Browse public conversations and choose a room.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Open Rooms →" })).toBeVisible();
  await page.screenshot({ path: "artifacts/v12-10-preflight/r4a-desktop-home.png", fullPage: true });
  for (const viewport of [{ width: 900, height: 760 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await expect(page.getByRole("button", { name: "Create New Agent", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Restore Agent", exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(await page.evaluate(() => document.documentElement.clientWidth));
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  expect(inspectRequests).toHaveLength(0);
  expect(discoveryRequests).toHaveLength(0);
  await page.getByRole("button", { name: "Open Rooms →" }).click();
  await expect(page.getByRole("heading", { name: "Choose a room", exact: true })).toBeVisible();
  await expect(page.getByText("Select a public room to open its chat stream.")).toBeVisible();
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
  await expect(page.locator(".room-choice").first()).toContainText("Recommended");
  expect(discoveryCount).toBe(1);
  expect(reads).toEqual([]);

  if (await page.locator(".rooms-panel-toggle").isVisible()) await page.locator(".rooms-panel-toggle").click();
  await page.locator(".room-choice").filter({ hasText: "# garden" }).click();
  await expect(page.locator(".conversation-heading").getByRole("heading", { name: "# garden" })).toBeVisible();
  await expect(page.getByText("garden retained message")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Read-only conversation" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Write to #garden" })).toHaveCount(0);
  expect(reads.slice(0, 2)).toEqual(["garden", "garden"]);

  await page.locator(".room-choice").filter({ hasText: "# lobby" }).click();
  await expect(page.locator(".conversation-heading").getByRole("heading", { name: "# lobby" })).toBeVisible();
  await expect(page.getByText("lobby retained message")).toBeVisible();
  await expect(page.getByText("garden retained message")).toHaveCount(0);
  expect(reads.slice(-2)).toEqual(["lobby", "lobby"]);
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
  expect(reads.slice(-2)).toEqual(["garden", "garden"]);
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
    const input = route.request().postDataJSON() as { since?: string };
    return route.fulfill({ json: liveResolution("ROOM", input.since ? [] : [{ from: "observer", text: "bounded view 1", seq: "1" }], "1", true) });
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.getByRole("button", { name: "Rooms", exact: true }).click();
  await page.getByRole("button", { name: "Open lobby →" }).click();
  await expect(page.getByText("bounded view 1")).toBeVisible();
  await expect(page.getByText("Live · retained window")).toBeVisible();

  failNext = true;
  await page.clock.fastForward(2_000);
  await expect(page.getByText("bounded view 1")).toBeVisible();
  await expect(page.getByText("Live read unavailable", { exact: true })).toBeVisible();
  await expect(page.getByText("temporary read failure")).toBeVisible();
  await page.screenshot({ path: "artifacts/v12-10-preflight/r4b-desktop-auto-refresh.png", fullPage: true });

  await page.evaluate(() => { Object.defineProperty(document, "visibilityState", { configurable: true, value: "hidden" }); document.dispatchEvent(new Event("visibilitychange")); });
  const readsWhenHidden = readCount;
  await page.clock.fastForward(20_000);
  expect(readCount).toBe(readsWhenHidden);
  await page.evaluate(() => { Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" }); document.dispatchEvent(new Event("visibilitychange")); });
  await expect.poll(() => readCount).toBeGreaterThan(readsWhenHidden);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Back to rooms" }).click();
  const readsWhenStopped = readCount;
  await page.clock.fastForward(20_000);
  expect(readCount).toBe(readsWhenStopped);
  expect(writes).toBe(0);
  await page.screenshot({ path: "artifacts/v12-10-preflight/r4b-mobile-room-list-stopped.png", fullPage: true });
});

test("Live Rooms default browser scheduler continues empty polls and appends a later arrival", async ({ page }) => {
  const pageErrors: string[] = [];
  const requestBodies: Array<{ room: string; since?: string; wait?: number }> = [];
  let activeReads = 0;
  let maximumConcurrentReads = 0;
  let writes = 0;
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.route("https://technocore.chat/**", (route) => { writes += 1; return route.abort(); });
  await page.route("**/api/inspect", async (route) => {
    const body = route.request().postDataJSON() as { room: string; since?: string; wait?: number };
    requestBodies.push(body);
    activeReads += 1;
    maximumConcurrentReads = Math.max(maximumConcurrentReads, activeReads);
    const ordinal = requestBodies.length;
    if (ordinal === 1) {
      await route.fulfill({ json: liveResolution("ROOM", [{ from: "reader", text: "initial retained", seq: "1" }], "1") });
      activeReads -= 1;
      return;
    }
    if (ordinal === 2) {
      await new Promise((resolve) => setTimeout(resolve, 25));
      await route.fulfill({ json: liveResolution("ROOM", [], "1", true) });
      activeReads -= 1;
      return;
    }
    if (ordinal === 3) {
      await new Promise((resolve) => setTimeout(resolve, 25));
      await route.fulfill({ json: liveResolution("ROOM", [{ from: "reader", text: "arrived after empty poll", seq: "2" }], "2", true) });
      activeReads -= 1;
      return;
    }
    await new Promise<void>(() => undefined);
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Rooms", exact: true }).click();
  await page.getByRole("button", { name: "Open lobby →" }).click();
  await expect(page.getByText("initial retained", { exact: true })).toBeVisible();
  await expect(page.getByText("arrived after empty poll", { exact: true })).toBeVisible({ timeout: 15_000 });
  await expect.poll(() => requestBodies.length).toBeGreaterThanOrEqual(4);
  expect(requestBodies.slice(0, 4).map(({ since, wait }) => [since, wait])).toEqual([
    [undefined, undefined], ["1", 10], ["1", 10], ["2", 10],
  ]);
  expect(maximumConcurrentReads).toBe(1);
  expect(pageErrors.filter((message) => /Illegal invocation/i.test(message))).toEqual([]);
  expect(writes).toBe(0);
});

test("final Rooms chat follows newest, anchors older reading, counts unseen messages, and stays viewport-bound", async ({ page }) => {
  await page.clock.install();
  const initial = Array.from({ length: 40 }, (_, index) => ({ from: "reader", text: `retained message ${index + 1}`, seq: String(index + 1) }));
  let lobbyMessages = initial;
  await page.route("**/api/rooms", (route) => route.fulfill({ json: { ok: true, value: { observations: [
    { room: "lobby", seq: "40", approxStoredSize: "4K", lastActivity: "now", topic: "Lobby" },
    { room: "garden", seq: "1", approxStoredSize: "1K", lastActivity: "now", topic: "Garden" },
  ] } } }));
  await page.route("**/api/inspect", (route) => {
    const input = route.request().postDataJSON() as { room: string };
    return route.fulfill({ json: liveResolution("ROOM", input.room === "lobby" ? lobbyMessages : [{ from: "reader", text: "garden newest", seq: "1" }]) });
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.getByRole("button", { name: "Rooms", exact: true }).click();
  await page.getByRole("button", { name: "Load rooms" }).click();
  await page.locator(".room-choice").filter({ hasText: "# lobby" }).click();
  const viewport = page.locator(".conversation-viewport");
  await expect(page.getByText("retained message 40", { exact: true })).toBeVisible();
  expect(await viewport.evaluate((node) => node.scrollHeight - node.scrollTop - node.clientHeight)).toBeLessThanOrEqual(2);
  await viewport.evaluate((node) => { node.scrollTop = 0; node.dispatchEvent(new Event("scroll")); });
  const anchored = await page.locator(".chat-message").first().evaluate((node) => ({ text: node.textContent, top: node.getBoundingClientRect().top }));

  lobbyMessages = [...initial, { from: "reader", text: "new arrival", seq: "41" }];
  await page.clock.fastForward(10_000);
  await expect(page.getByRole("button", { name: "↓ 1 new message" })).toBeVisible();
  const afterOne = await page.locator(".chat-message").first().evaluate((node) => ({ text: node.textContent, top: node.getBoundingClientRect().top }));
  expect(afterOne.text).toBe(anchored.text);
  expect(Math.abs(afterOne.top - anchored.top)).toBeLessThanOrEqual(1);
  await page.clock.fastForward(10_000);
  await expect(page.getByRole("button", { name: "↓ 1 new message" })).toBeVisible();

  lobbyMessages = [...lobbyMessages, ...Array.from({ length: 4 }, (_, index) => ({ from: "reader", text: `small arrival ${index + 1}`, seq: String(index + 42) }))];
  await page.clock.fastForward(10_000);
  await expect(page.getByRole("button", { name: "↓ 5 new messages" })).toBeVisible();
  lobbyMessages = [...lobbyMessages, ...Array.from({ length: 100 }, (_, index) => ({ from: "reader", text: `bulk arrival ${index + 1}`, seq: String(index + 46) }))];
  await page.clock.fastForward(10_000);
  const counter = page.getByRole("button", { name: "↓ 99+ new messages" });
  await expect(counter).toBeVisible();
  await counter.click();
  await expect(counter).toHaveCount(0);
  expect(await viewport.evaluate((node) => node.scrollHeight - node.scrollTop - node.clientHeight)).toBeLessThanOrEqual(2);

  for (const viewportSize of [{ width: 1800, height: 1125 }, { width: 1440, height: 900 }, { width: 1152, height: 720 }]) {
    await page.setViewportSize(viewportSize);
    const layout = await page.evaluate(() => ({ pageOverflow: document.documentElement.scrollHeight - innerHeight, composerBottom: document.querySelector(".composer")!.getBoundingClientRect().bottom, windowHeight: innerHeight, widthOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth }));
    expect(layout.pageOverflow).toBeLessThanOrEqual(1);
    expect(layout.composerBottom).toBeLessThanOrEqual(layout.windowHeight);
    expect(layout.widthOverflow).toBe(0);
  }
  expect(await page.locator(".room-choices").evaluate((node) => getComputedStyle(node).overflowY)).toBe("auto");
  if (await page.locator(".rooms-panel-toggle").isVisible()) await page.locator(".rooms-panel-toggle").click();
  await page.locator(".room-choice").filter({ hasText: "# garden" }).click();
  await expect(page.getByText("garden newest", { exact: true })).toBeVisible();
  await expect(page.locator(".new-messages")).toHaveCount(0);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator(".composer")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(await page.evaluate(() => document.documentElement.clientWidth));
});

test("newcomer journey gates backup, signing, explicit publish, read-back verification, and receipt", async ({ page }) => {
  test.setTimeout(90_000);
  await page.addInitScript(() => { Date.now = () => 1_700_000_000_000; });
  const passphrase = "correct horse battery staple";
  let observedWrite: { room: string; did: string; sig: string; nonce: string; text: string } | undefined;
  let writeCount = 0;
  let readCount = 0;
  const requestData: string[] = [];
  page.on("request", (request) => requestData.push(`${request.url()} ${request.postData() ?? ""}`));
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

  await page.goto("/"); await page.getByRole("button", { name: "Create New Agent", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Create your agent identity" }).first()).toBeVisible();
  await expect(page.getByLabel("Onboarding progress")).toBeVisible();
  await expect(page.getByLabel("Onboarding progress").getByRole("button").nth(2)).toBeDisabled();

  await page.getByRole("button", { name: "Create New Agent", exact: true }).click();
  await expect(page.getByRole("button", { name: "Open My Agent" })).toBeVisible();
  await expect(page.locator(".identity-context")).not.toContainText(/wallet|account|login|seed|private/i);
  await expect(page.locator('input[name*="seed" i], input[name*="private" i], textarea[name*="seed" i], textarea[name*="private" i]')).toHaveCount(0);
  expect(await page.locator("[data-seed], [data-private-key]").count()).toBe(0);
  await page.getByRole("button", { name: "View full DID" }).click();
  const activeDid = await page.locator(".public-did strong").textContent();
  await page.getByRole("button", { name: "Open My Agent" }).click();
  await expect(page.getByRole("heading", { name: "My Agent", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Inspect DID →" }).click();
  await expect(page.getByLabel("Ed25519 did:key identifier")).toHaveValue(activeDid!);
  await page.locator(".sidebar-brand").click();
  await expect(page.getByRole("heading", { name: "Secure your backup" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Identity" }).locator("xpath=ancestor::article")).toContainText("Ready");
  await expect(page.getByRole("heading", { name: "Backup" }).locator("xpath=ancestor::article")).toContainText("Required");
  await expect(page.getByRole("heading", { name: "First Record" }).locator("xpath=ancestor::article")).toContainText("Needs backup");
  await page.getByRole("button", { name: "Secure Backup →" }).click();
  await page.getByLabel("Backup Password").first().fill(passphrase);
  await page.getByRole("button", { name: "Create encrypted backup" }).click();
  await page.getByRole("button", { name: "Download encrypted backup ↓" }).click();
  await expect(page.getByRole("dialog")).toContainText("encrypted as");
  const downloadEvent = page.waitForEvent("download");
  await page.getByRole("dialog").getByRole("button", { name: "Download Backup" }).click();
  const backupDownload = await downloadEvent;
  const backupPath = await backupDownload.path();
  expect(backupPath).not.toBeNull();
  await expect(page.getByText("Backup downloaded")).toBeVisible();
  await expect(page.getByLabel("Onboarding progress").getByRole("button").nth(2)).toBeDisabled();

  await page.getByLabel("Encrypted Backup").setInputFiles(backupPath!);
  await page.getByLabel("Backup Password").fill("wrong passphrase");
  await page.getByRole("button", { name: "Verify My Backup" }).click();
  await expect(page.locator(".operational-error")).toContainText("decrypt");
  await page.getByLabel("Backup Password").fill(passphrase);
  await page.getByRole("button", { name: "Verify My Backup" }).click();
  await expect(page.getByText("✓ Backup verified")).toBeVisible();
  await expect(page.getByRole("button", { name: "Open Technocore Rooms →" })).toBeVisible();
  await expect(page.locator(".macro-stage-content button.primary:visible")).toHaveCount(1);
  await page.getByRole("button", { name: /Continue guided first message/ }).click();

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
  await expect(page.getByText("Verified", { exact: true })).toHaveCount(1);
  await expect(page.getByText("Observed", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Rooms", exact: true }).first().click();
  await page.getByRole("button", { name: "Load rooms" }).click();
  await page.locator(".room-choice").filter({ hasText: "# lobby" }).click();
  await expect(page.getByLabel("Cryptographic verdict VALID").first()).toBeVisible();
  await expect(page.getByText("0 characters")).toBeVisible();
  await expect(page.getByLabel("Room message")).toHaveAttribute("placeholder", "Message #lobby…");
  await page.locator(".composer").scrollIntoViewIfNeeded();
  await page.screenshot({ path: "artifacts/v12-10-preflight/r4-desktop-ready-composer.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator(".composer").scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(await page.evaluate(() => document.documentElement.clientWidth));
  await page.screenshot({ path: "artifacts/v12-10-preflight/r4-mobile-ready-composer.png" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.getByLabel("Room message").fill("Second explicit room message");
  await expect(page.getByText("28 characters")).toBeVisible();
  await page.getByLabel("Room message").press("Enter");
  await expect(page.getByLabel("Room message")).toHaveValue("");
  await expect(page.getByLabel("Room message")).toBeFocused();
  await expect.poll(() => writeCount).toBe(2);
  await expect(page.getByText("Second explicit room message", { exact: true })).toBeVisible();
  await expect(page.locator(".optimistic-message")).toHaveCount(0);
  const sentRow = page.locator(".chat-message").filter({ hasText: "Second explicit room message" });
  await expect(sentRow.getByLabel("Cryptographic verdict VALID")).toBeVisible();
  await sentRow.getByLabel(/Open details for message/).click();
  await expect(sentRow).toContainText(activeDid!);
  await sentRow.getByRole("button", { name: "Add to Evidence" }).click();
  await page.screenshot({ path: "artifacts/v12-10-preflight/final-live-rooms-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator(".composer").scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(await page.evaluate(() => document.documentElement.clientWidth));
  await page.screenshot({ path: "artifacts/v12-10-preflight/final-live-rooms-mobile.png" });
  await page.setViewportSize({ width: 1440, height: 900 });
  expect(writeCount).toBe(2); expect(readCount).toBeGreaterThanOrEqual(1);

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
  await expect(page.getByRole("heading", { name: "Your Agent is not currently unlocked in this browser." })).toBeVisible();
  await expect(page.getByText("No Agent loaded").first()).toBeVisible();
  await page.getByRole("button", { name: "Restore Workbench Agent", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Restore Agent", exact: true })).toBeVisible();
  await page.getByLabel("Encrypted Backup").setInputFiles(backupPath!);
  await page.getByLabel("Backup Password").fill(passphrase);
  await page.getByRole("button", { name: "Restore Agent", exact: true }).click();
  await expect(page.getByText("AGENT RESTORED ✓")).toBeVisible();
  await expect(page.getByText("Your original Agent identity is now active.")).toBeVisible();
  await page.getByRole("button", { name: "View full DID" }).click();
  await expect(page.locator(".public-did strong")).toHaveText(activeDid!);
  await expect(page.getByText("✓ Ready to sign", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Open Technocore Rooms →" })).toBeVisible();
  expect(requestData.join("\n")).not.toContain(passphrase);
  expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length, cookies: document.cookie }))).toEqual({ local: 0, session: 0, cookies: "" });
  await page.getByRole("button", { name: "My Agent", exact: true }).click();
  await page.getByRole("button", { name: "Lock Agent" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Lock Agent" }).click();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Home" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Restore Agent", exact: true })).toBeVisible();
  expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length }))).toEqual({ local: 0, session: 0 });
});

test("first-time entries reuse onboarding and active-DID Home remains available", async ({ page }) => {
  const external: string[] = [];
  page.on("request", (request) => { if (request.url().includes("technocore.chat")) external.push(request.url()); });
  await page.goto("/");
  await page.getByRole("button", { name: /Restore Agent/ }).first().click();
  await expect(page.getByRole("heading", { name: "Restore Agent", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Restore Agent", exact: true })).toBeDisabled();
  await expect(page.getByLabel("Onboarding progress").getByRole("button").nth(2)).toBeDisabled();
  await page.getByRole("button", { name: "Home", exact: true }).click();
  await page.getByRole("button", { name: "Create New Agent", exact: true }).click();
  await page.getByRole("button", { name: "Create New Agent", exact: true }).click();
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
  await expect(page.getByText("No Agent loaded").first()).toBeVisible();
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
  await expect(page.getByLabel("Room message")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Sign Locally|Publish Message/ })).toHaveCount(0);
  await page.screenshot({ path: "artifacts/v12-10-preflight/r4-desktop-no-agent.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  await composer.scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(await page.evaluate(() => document.documentElement.clientWidth));
  await page.screenshot({ path: "artifacts/v12-10-preflight/r4-mobile-no-agent.png" });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.getByRole("button", { name: "Create or Restore Agent →" }).click();
  await expect(page.getByRole("heading", { name: "Create your agent identity", level: 1 })).toBeVisible();
  await expect(page.getByRole("button", { name: "Restore Agent instead →" })).toBeVisible();
  await page.getByRole("button", { name: "Create New Agent", exact: true }).click();
  await page.getByRole("button", { name: "Rooms", exact: true }).click();
  await page.getByRole("button", { name: "Open lobby →" }).click();
  await composer.scrollIntoViewIfNeeded();
  await expect(page.getByRole("heading", { name: "Composer locked" })).toBeVisible();
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
  await page.getByRole("button", { name: "Create New Agent", exact: true }).click();
  await page.getByRole("button", { name: "Create New Agent", exact: true }).click();
  await page.getByRole("button", { name: "Rooms", exact: true }).click();
  await expect(page.getByText(/follow its live retained stream/)).toBeVisible();
  await page.getByRole("button", { name: "Load rooms" }).click();
  await expect(page.locator(".room-choice").first()).toContainText("# lobby");
  await expect(page.locator(".room-choice").first()).toContainText("Recommended");
  await page.getByRole("button", { name: new RegExp(fixture.room) }).click();
  await expect(page.locator(".room-choice.selected")).toHaveAttribute("aria-current", "true");
  await expect(page.getByText(hostile).last()).toBeVisible();
  await expect(page.getByLabel("Cryptographic verdict VALID").first()).toBeVisible();
  await expect(page.getByText(hostile).last()).toBeVisible();
  expect(await page.evaluate(() => (window as Window & { __chatOwned?: boolean }).__chatOwned)).toBeUndefined();
  await expect(page.locator(`a[href="https://example.invalid/path"]`)).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Composer locked" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Secure Backup →" })).toBeVisible();
  await expect(page.getByLabel("Room message")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Publish Message/ })).toHaveCount(0);
  expect(roomReads).toBe(2);
  const hostileRow = page.locator(".chat-message").filter({ hasText: hostile });
  await hostileRow.getByLabel(/Open details for message/).click();
  await hostileRow.getByRole("button", { name: "Add to Evidence" }).click();
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
  await expect.poll(() => roomReads).toBeGreaterThanOrEqual(4);
  const reloadedHostileRow = page.locator(".chat-message").filter({ hasText: hostile });
  await reloadedHostileRow.getByLabel(/Open details for message/).click();
  await reloadedHostileRow.getByRole("button", { name: "Inspect message" }).click();
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
  await expect(page.getByRole("button", { name: "Open lobby →" })).toBeVisible();
  await page.getByRole("button", { name: "Open lobby →" }).click();
  await expect(page.locator(".conversation-heading").getByRole("heading", { name: "# lobby" })).toBeVisible();
  await expect(page.getByText("Live · retained window")).toBeVisible();
  await expect(page.locator(".chat-message").first()).toContainText("older retained message");
  await expect(page.locator(".chat-message").nth(1)).toContainText("newest retained message");
  const desktopChat = await page.evaluate(() => {
    const viewport = document.querySelector<HTMLElement>(".conversation-viewport")!;
    const composer = document.querySelector<HTMLElement>(".composer")!;
    return { viewportScrollable: viewport.scrollHeight >= viewport.clientHeight, atNewest: viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight <= 2, composerBottom: composer.getBoundingClientRect().bottom, windowHeight: innerHeight };
  });
  expect(desktopChat.viewportScrollable).toBe(true);
  expect(desktopChat.atNewest).toBe(true);
  expect(desktopChat.composerBottom).toBeLessThanOrEqual(desktopChat.windowHeight);
  await expect(page.getByLabel("Cryptographic verdict VALID").first()).toBeVisible();
  await expect(page.locator(".chat-message")).toHaveCount(2);
  await expect(page.getByText("#12", { exact: true })).toBeVisible();
  await expect(page.locator('a[href="https://example.invalid/r3"]')).toHaveCount(0);
  expect(roomReads).toBe(2);
  await page.screenshot({ path: "artifacts/v12-10-preflight/r3-desktop-direct-lobby.png", fullPage: true });

  await expect.poll(() => roomReads).toBeGreaterThanOrEqual(2);
  discoveryMode = "error";
  await page.getByRole("button", { name: "Refresh rooms" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Public rooms unavailable" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Try Again" })).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole("button", { name: "Back to rooms" })).toBeVisible();
  await expect(page.locator(".composer")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(await page.evaluate(() => document.documentElement.clientWidth));
  await page.screenshot({ path: "artifacts/v12-10-preflight/r3-mobile-conversation.png", fullPage: true });
  await page.getByRole("button", { name: "Back to rooms" }).click();
  await expect(page.getByRole("button", { name: "Try Again" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(await page.evaluate(() => document.documentElement.clientWidth));
  await page.screenshot({ path: "artifacts/v12-10-preflight/r3-mobile-room-list.png", fullPage: true });
});

test("final Rooms UI stays readable across continuous responsive transitions", async ({ page }) => {
  const rooms = [
    { room: "lobby", seq: "90", approxStoredSize: "2K", lastActivity: "now", topic: "Lobby" },
    { room: "very-long-technocore-room-name-that-must-not-overlap", seq: "89", approxStoredSize: "2K", lastActivity: "now", topic: "Long" },
    { room: "wildlantern", seq: "88", approxStoredSize: "2K", lastActivity: "now", topic: "Wild" },
  ];
  await page.route("**/api/rooms", (route) => route.fulfill({ json: { ok: true, value: { observations: rooms } } }));
  await page.route("**/api/inspect", (route) => route.fulfill({ json: liveResolution("ROOM", [
    { from: "did:key:z6MkResponsiveAuthor", text: "Some ordinary message words must remain readable without character-by-character wrapping.", seq: "90", ts: "2026-09-07T00:00:00Z" },
  ], "90", true) }));
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto("/");
  await page.getByRole("button", { name: "Rooms", exact: true }).click();
  await page.getByRole("button", { name: "Load rooms" }).click();

  const roomRows = page.locator(".room-choice");
  await expect(roomRows).toHaveCount(3);
  const boxes = await roomRows.evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect()).map(({ top, bottom, height }) => ({ top, bottom, height })));
  for (let index = 0; index < boxes.length - 1; index += 1) expect(boxes[index]!.bottom).toBeLessThanOrEqual(boxes[index + 1]!.top + 0.5);
  expect(boxes.every(({ height }) => height >= 36)).toBe(true);
  await expect(roomRows.nth(1).locator("strong")).toHaveCSS("text-overflow", "ellipsis");
  const beforeSelectedHeight = boxes[2]!.height;
  await roomRows.nth(2).click();
  expect((await roomRows.nth(2).boundingBox())!.height).toBeCloseTo(beforeSelectedHeight, 0);

  const wide = [
    { width: 1600, height: 900 }, { width: 1440, height: 900 }, { width: 1280, height: 800 },
  ];
  for (const size of wide) {
    await page.setViewportSize(size);
    await expect(page.locator(".rooms-sidebar")).toBeVisible();
    await expect(page.locator(".rooms-panel-toggle")).toBeHidden();
    expect(await page.evaluate(() => document.documentElement.scrollWidth === document.documentElement.clientWidth)).toBe(true);
  }

  const constrained = [
    { width: 1180, height: 800 }, { width: 1100, height: 800 }, { width: 1000, height: 800 },
    { width: 900, height: 800 }, { width: 800, height: 844 }, { width: 768, height: 844 },
  ];
  for (const size of constrained) {
    await page.setViewportSize(size);
    await expect(page.locator(".rooms-sidebar")).toBeHidden();
    await expect(page.locator(".rooms-panel-toggle")).toBeVisible();
    await expect(page.getByText("Some ordinary message words", { exact: false })).toBeVisible();
    const messageStyle = await page.locator(".message-content").evaluate((node) => ({ width: node.getBoundingClientRect().width, wordBreak: getComputedStyle(node).wordBreak, overflowWrap: getComputedStyle(node).overflowWrap }));
    expect(messageStyle.width).toBeGreaterThan(240);
    expect(messageStyle.wordBreak).toBe("normal");
    expect(messageStyle.overflowWrap).toBe("break-word");
    expect(await page.evaluate(() => document.documentElement.scrollWidth === document.documentElement.clientWidth)).toBe(true);
  }

  await page.setViewportSize({ width: 1000, height: 800 });
  await page.screenshot({ path: "artifacts/v12-10-preflight/final-rooms-responsive-medium.png" });
  await page.locator(".rooms-panel-toggle").click();
  await expect(page.locator(".rooms-sidebar")).toBeVisible();
  await expect(page.locator(".rooms-panel-close")).toBeFocused();
  await page.screenshot({ path: "artifacts/v12-10-preflight/final-rooms-responsive-drawer.png" });
  await page.locator(".room-choice").filter({ hasText: "very-long-technocore" }).click();
  await expect(page.locator(".conversation-heading").getByRole("heading", { name: /very-long-technocore/ })).toBeVisible();
  await expect(page.locator(".rooms-sidebar")).toBeHidden();

  for (const size of [{ width: 600, height: 844 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(size);
    await expect(page.getByRole("button", { name: "Back to rooms" })).toBeVisible();
    await expect(page.locator(".rooms-panel-toggle")).toBeHidden();
    await expect(page.locator(".composer")).toBeVisible();
    await expect(page.locator(".message-details summary")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth === document.documentElement.clientWidth)).toBe(true);
    if (size.width === 390) await page.screenshot({ path: "artifacts/v12-10-preflight/final-rooms-responsive-mobile.png" });
  }

  for (const width of [390, 600, 768, 800, 900, 1000, 1100, 1180, 1280, 1440, 1600]) {
    await page.setViewportSize({ width, height: width >= 1280 ? 900 : 844 });
    await expect(page.locator(".conversation-heading").getByRole("heading", { name: /very-long-technocore/ })).toBeVisible();
  }
  for (const zoom of [0.8, 1, 1.25]) {
    await page.evaluate((value) => { document.documentElement.style.zoom = String(value); }, zoom);
    expect(await page.evaluate(() => document.documentElement.scrollWidth === document.documentElement.clientWidth)).toBe(true);
    await expect(page.locator(".composer")).toBeVisible();
  }
  await page.evaluate(() => { document.documentElement.style.zoom = ""; });
  await page.screenshot({ path: "artifacts/v12-10-preflight/final-rooms-responsive-wide.png" });
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

function liveResolution(kind: "ROOM" | "MESSAGE", records: readonly Record<string, unknown>[], lastSequence = "9", waitHeld?: boolean) {
  return { ok: true, kind, value: { report: { inputKind: kind, messages: records.map((record) => ({ verificationState: "VALID", fields: [field("room", fixture.room), field("text", record.text), field("from", record.from), field("nonce", record.nonce), field("signature", record.sig), field("seq", record.seq), field("ts", record.ts)].filter((item) => item.value !== undefined), warnings: [] })), warnings: [], operationalErrors: [] }, serverMetadata: [field("count", records.length), field("first_seq", "1"), field("last_seq", lastSequence), ...(waitHeld === undefined ? [] : [field("wait_held", waitHeld)])] } };
}
function field(name: string, value: unknown) { return { name, value, authority: "UNTRUSTED_CALLER_DATA" }; }
