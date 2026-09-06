import { expect, test } from "@playwright/test";

test("V12-09R corrected single-shell visual preflight", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  const compactLogo = page.locator(".sidebar-brand img");
  await expect(compactLogo).toBeVisible();
  await expect(compactLogo).toHaveAttribute("src", "/brand/flop-logo.png");
  for (const name of ["Home", "Rooms", "My Agent", "Evidence", "Developer Tools"]) await expect(page.getByRole("button", { name, exact: true })).toBeVisible();
  for (const name of ["FLOP Labs", "Technocore Chat", "Docs", "Built by Manh100"]) await expect(page.getByRole("link", { name: new RegExp(name) })).toBeVisible();
  await page.getByRole("button", { name: "Collapse sidebar" }).click();
  await expect(page.locator(".workbench-app")).toHaveClass(/sidebar-collapsed/);
  await expect(compactLogo).toBeVisible();
  await page.screenshot({ path: "artifacts/v12-10-preflight/desktop-sidebar-collapsed.png", fullPage: true });
  await page.getByRole("button", { name: "Expand sidebar" }).click();
  await expect(page.locator(".sidebar-brand img")).toBeVisible();
  await expect(page.getByRole("button", { name: "Create Agent →" })).toBeVisible();
  await page.screenshot({ path: "artifacts/v12-10-preflight/desktop-no-did-landing.png", fullPage: true });

  await page.getByRole("button", { name: "Create Agent →" }).click();
  await page.getByRole("button", { name: "Create identity" }).click();
  await page.locator(".sidebar-brand").click();
  await expect(page.getByRole("heading", { name: "Home" })).toBeVisible();
  await page.screenshot({ path: "artifacts/v12-10-preflight/desktop-active-home.png", fullPage: true });

  await page.getByRole("button", { name: "My Agent", exact: true }).click();
  await expect(page.getByRole("heading", { name: "My Agent", exact: true })).toBeVisible();
  await page.screenshot({ path: "artifacts/v12-10-preflight/desktop-my-agent.png", fullPage: true });

  await page.getByRole("button", { name: "Evidence", exact: true }).click();
  await expect(page.getByRole("heading", { name: "No evidence has been added" })).toBeVisible();
  await page.screenshot({ path: "artifacts/v12-10-preflight/desktop-evidence-empty.png", fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole("navigation", { name: "Workbench" })).toBeHidden();
  await page.getByRole("button", { name: "Open Workbench menu" }).click();
  await expect(page.getByRole("navigation", { name: "Workbench" })).toBeVisible();
  await expect(page.locator(".mobile-brand-logo")).toBeVisible();
  await expect(page.getByRole("link", { name: /Built by Manh100/ })).toBeVisible();
  await page.screenshot({ path: "artifacts/v12-10-preflight/mobile-menu-open.png", fullPage: true });
  await page.getByRole("navigation", { name: "Workbench" }).getByRole("button", { name: "Home" }).click();
  await expect(page.getByRole("navigation", { name: "Workbench" })).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(await page.evaluate(() => document.documentElement.clientWidth));
  await page.screenshot({ path: "artifacts/v12-10-preflight/mobile-active-home.png", fullPage: true });
});
