import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

test("V13-02 downloads and locally reimports the same raw Secret Key with explicit confirmation", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.getByRole("button", { name: "Create New Agent", exact: true }).click();
  await page.getByRole("button", { name: "Create New Agent", exact: true }).click();
  await page.getByRole("button", { name: "My Agent", exact: true }).click();

  const originalDid = await page.locator(".agent-did").textContent();
  expect(originalDid).toMatch(/^did:key:z6Mk/);
  await page.getByText("Advanced · Secret Key").click();
  await page.getByRole("button", { name: "Reveal Secret Key" }).click();
  await expect(page.getByRole("dialog", { name: "Reveal your Secret Key?" })).toBeVisible();
  await page.getByRole("button", { name: "I understand · Reveal" }).click();
  await page.getByRole("button", { name: "Download Secret Key (.txt)" }).click();
  const dialog = page.getByRole("dialog", { name: "Download a plain-text Secret Key?" });
  await expect(dialog).toContainText("commit it to GitHub");
  const downloadEvent = page.waitForEvent("download");
  await dialog.getByRole("button", { name: "Download Secret Key (.txt)" }).click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe("technocore-agent-secret.txt");
  const downloadPath = await download.path();
  expect(downloadPath).not.toBeNull();
  const content = await readFile(downloadPath!, "utf8");
  expect(content).toMatch(/^[0-9a-f]{64}\n$/);

  await page.getByRole("button", { name: "Lock Agent" }).click();
  await page.getByRole("dialog", { name: "Lock this Agent?" }).getByRole("button", { name: "Lock Agent" }).click();
  await page.getByRole("button", { name: "Import Existing Agent" }).click();
  await page.getByLabel("Identity file").setInputFiles(downloadPath!);
  await expect(page.getByRole("heading", { name: "Plain 32-byte Ed25519 Secret Key" })).toBeVisible();
  await page.getByRole("button", { name: "Validate Identity" }).click();
  await expect(page.getByText(originalDid!, { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Load This Agent" }).click();
  await expect(page.getByRole("heading", { name: "Secure your Agent" })).toBeVisible();

  expect(await page.evaluate(async () => ({ local: localStorage.length, session: sessionStorage.length, cookies: document.cookie, databases: (await indexedDB.databases()).length }))).toEqual({ local: 0, session: 0, cookies: "", databases: 0 });
  expect(requests.filter((url) => url.includes("/api/") || url.includes("technocore.chat"))).toHaveLength(0);
  expect(requests.join("\n")).not.toContain(content.trim());
  await page.getByRole("button", { name: "My Agent", exact: true }).click();
  await page.getByRole("button", { name: "Lock Agent" }).click();
  await page.getByRole("dialog", { name: "Lock this Agent?" }).getByRole("button", { name: "Lock Agent" }).click();
  await expect(page.getByRole("heading", { name: "Your Agent is not currently unlocked in this browser." })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(await page.evaluate(() => document.documentElement.clientWidth));
});

test("V13-02 redirects Workbench V1 files to the existing restore flow", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Create New Agent", exact: true }).click();
  await page.getByRole("button", { name: "Create New Agent", exact: true }).click();
  const password = "v13-portability-backup-password";
  await page.getByLabel("Backup Password").fill(password);
  await page.getByRole("button", { name: "Create Encrypted Backup" }).click();
  const backupEvent = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download Encrypted Backup" }).click();
  const backupPath = await (await backupEvent).path();
  await page.getByRole("button", { name: "My Agent", exact: true }).click();
  await page.getByRole("button", { name: "Lock Agent" }).click();
  await page.getByRole("dialog", { name: "Lock this Agent?" }).getByRole("button", { name: "Lock Agent" }).click();
  await page.getByRole("button", { name: "Import Existing Agent" }).click();
  await page.getByLabel("Identity file").setInputFiles(backupPath!);
  await expect(page.getByRole("heading", { name: "FLOP Agent Workbench Backup V1" })).toBeVisible();
  await page.getByRole("button", { name: "Continue to Restore Workbench Agent" }).click();
  await expect(page.getByRole("heading", { name: "Restore Agent" })).toBeVisible();
  await expect(page.getByLabel("Encrypted Backup")).toBeVisible();
});
