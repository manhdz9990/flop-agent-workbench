import { readFileSync } from "node:fs";

import { expect, test, type Page } from "@playwright/test";

test("owner-controlled Secret Key reveal remains masked, deliberate, local, and responsive", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const requests: string[] = [];
  page.on("request", (request) => requests.push(`${request.method()} ${request.url()} ${request.postData() ?? ""}`));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.getByRole("button", { name: "Create New Agent", exact: true }).click();
  await page.getByRole("button", { name: "Create New Agent", exact: true }).click();
  await page.getByRole("button", { name: "My Agent", exact: true }).click();
  await page.getByText("Advanced · Secret Key").click();
  await expect(page.getByLabel("Masked Secret Key")).toBeVisible();
  await expect(page.getByRole("button", { name: "Copy Secret Key" })).toHaveCount(0);
  await page.getByRole("button", { name: "Reveal Secret Key" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Cancel" }).click();
  await expect(page.getByLabel("Masked Secret Key")).toBeVisible();
  await page.getByRole("button", { name: "Reveal Secret Key" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "I understand · Reveal" }).click();
  const revealed = page.getByLabel("Revealed Secret Key");
  await expect(revealed).toHaveText(/^[0-9a-f]{64}$/);
  const secret = await revealed.textContent();
  await page.getByRole("button", { name: "Copy Secret Key" }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(secret);
  await page.getByRole("button", { name: "Hide Secret Key" }).click();
  await expect(page.getByLabel("Masked Secret Key")).toBeVisible();
  expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length, cookies: document.cookie }))).toEqual({ local: 0, session: 0, cookies: "" });
  expect(requests.join("\n")).not.toContain(secret!);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(await page.evaluate(() => document.documentElement.clientWidth));
  await page.getByRole("button", { name: "Open Workbench menu" }).click();
  await page.getByRole("navigation", { name: "Workbench" }).getByRole("button", { name: "Home", exact: true }).click();
  await page.getByRole("button", { name: "Open Workbench menu" }).click();
  await page.getByRole("navigation", { name: "Workbench" }).getByRole("button", { name: "My Agent", exact: true }).click();
  await page.getByText("Advanced · Secret Key").click();
  await expect(page.getByLabel("Masked Secret Key")).toBeVisible();
});

const fixture = JSON.parse(readFileSync(new URL("../tests/fixtures/protocol/known-good.json", import.meta.url), "utf8")) as { room: string; record: Record<string, unknown> };

async function inspectExport(page: Page, record: Record<string, unknown>, name: string) {
  await page.goto("/");
  if ((page.viewportSize()?.width ?? 1000) <= 760) await page.getByRole("button", { name: "Open Workbench menu" }).click();
  await page.getByRole("button", { name: "Developer Tools" }).click();
  await page.getByRole("button", { name: "Analyze an export" }).click();
  await page.getByLabel("Room name").fill(fixture.room);
  await page.getByLabel("Technocore JSONL export").setInputFiles({ name, mimeType: "text/plain", buffer: Buffer.from(JSON.stringify(record)) });
  await page.getByRole("button", { name: "Analyze evidence" }).click();
}

test("Phase 6 deterministic visual acceptance fixtures", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });

  await inspectExport(page, fixture.record, "valid.jsonl");
  await expect(page.getByRole("heading", { name: "VALID", exact: true })).toBeVisible();
  await page.screenshot({ path: "artifacts/phase6/desktop-valid-conclusion.png", fullPage: true });
  await page.getByRole("button", { name: /Inspect the 12-stage pipeline/ }).click();
  await page.screenshot({ path: "artifacts/phase6/desktop-valid-pipeline-collapsed.png", fullPage: true });
  await page.getByText("Raw Evidence", { exact: true }).click();
  await page.screenshot({ path: "artifacts/phase6/desktop-raw-evidence-expanded.png", fullPage: true });
  await page.getByRole("button", { name: "Create Local Evidence Receipt" }).click();
  await page.screenshot({ path: "artifacts/phase6/desktop-receipt.png", fullPage: true });

  await inspectExport(page, { ...fixture.record, text: `${fixture.record.text}!` }, "invalid.jsonl");
  await expect(page.getByRole("heading", { name: "INVALID", exact: true })).toBeVisible();
  await page.screenshot({ path: "artifacts/phase6/desktop-invalid-fail.png", fullPage: true });

  await inspectExport(page, { from: "alice", text: "Unsigned public observation" }, "unsigned.jsonl");
  await expect(page.getByRole("heading", { name: "UNSIGNED", exact: true })).toBeVisible();
  await page.screenshot({ path: "artifacts/phase6/desktop-unsigned.png", fullPage: true });

  await inspectExport(page, { ...fixture.record, sig: undefined }, "unverifiable.jsonl");
  await expect(page.getByRole("heading", { name: "UNVERIFIABLE", exact: true })).toBeVisible();
  await page.screenshot({ path: "artifacts/phase6/desktop-unverifiable-unavailable.png", fullPage: true });

  await page.goto("/");
  await page.getByRole("button", { name: "Developer Tools" }).click();
  await page.getByRole("button", { name: "Inspect a DID / key" }).click();
  await page.getByLabel("Ed25519 did:key identifier").fill(String(fixture.record.from));
  await page.getByRole("button", { name: "Analyze evidence" }).click();
  await page.screenshot({ path: "artifacts/phase6/desktop-na-no-stages.png", fullPage: true });

  await page.goto("/");
  await page.getByRole("button", { name: "Create New Agent", exact: true }).click();
  await page.getByRole("button", { name: "Create New Agent", exact: true }).click();
  await page.getByRole("button", { name: "Evidence", exact: true }).click();
  await expect(page.getByRole("heading", { name: "No evidence has been added" })).toBeVisible();
  await page.screenshot({ path: "artifacts/phase6/desktop-evidence-empty.png", fullPage: true });
  await page.getByRole("button", { name: "Open Rooms" }).click();
  await page.screenshot({ path: "artifacts/phase6/desktop-rooms-workspace.png", fullPage: true });
  await page.locator(".sidebar-brand").click();
  await page.getByRole("button", { name: "Developer Tools", exact: true }).click();
  await page.screenshot({ path: "artifacts/phase6/desktop-developer-tools.png", fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await inspectExport(page, { ...fixture.record, sig: undefined }, "mobile-long-unverifiable-record-name.jsonl");
  await page.getByRole("button", { name: /Inspect the 12-stage pipeline/ }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(await page.evaluate(() => document.documentElement.clientWidth));
  await page.keyboard.press("Tab");
  expect(await page.evaluate(() => document.activeElement !== document.body)).toBe(true);
  await page.screenshot({ path: "artifacts/phase6/mobile-unverifiable-pipeline.png", fullPage: true });
});
