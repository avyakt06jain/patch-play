import { expect, test } from "@playwright/test";

async function pressPath(page, keys) {
  for (const key of keys) await page.locator("body").press(key);
}

async function replaceEditor(page, source) {
  const editor = page.locator(".cm-content");
  await editor.click();
  await editor.press(process.platform === "darwin" ? "Meta+A" : "Control+A");
  await editor.fill(source);
}

test("Level 1 runs two real incidents with regression-gated deployment", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /ENTER LEVEL_01/ }).click();
  await expect(page.getByText("READY", { exact: true })).toBeVisible({ timeout: 15_000 });

  await pressPath(page, ["w", "w", "w", "w", "w", "d", "s", "s", "d", "d", "d", "d", "d", "d"]);
  await expect(page.locator(".v3-incident-overlay")).toContainText("BRG-101");
  await page.getByRole("button", { name: "REPORT TO DEV_02" }).click();
  await expect(page.getByText(/GUIDED TRACE · bridge.controller.ts:3/)).toBeVisible();

  await replaceEditor(page, `export function shouldCollapse(stepsOnBridge: number, maxSafeSteps: number) {\n  return stepsOnBridge > maxSafeSteps;\n}\n`);
  await page.getByRole("button", { name: /TEST CANDIDATE/ }).click();
  await expect(page.getByText("4/4 PASSED", { exact: true })).toBeVisible({ timeout: 15_000 });
  await page.getByRole("button", { name: /DEPLOY v1/ }).click();
  await pressPath(page, ["d", "d", "d"]);
  await expect(page.getByText(/Patch verified. A deeper facility fault/)).toBeVisible();

  await pressPath(page, ["d", "d", "d", "d", "d", "d", "d", "d", "w", "e"]);
  await expect(page.locator(".v3-incident-overlay")).toContainText("GATE-102");
  await page.getByRole("button", { name: "REPORT TO DEV_02" }).click();
  await expect(page.getByText(/GUIDED TRACE · access-gate.ts:3/)).toBeVisible();
  await expect(page.locator(".editor-tabs")).toContainText("access-gate.ts");

  await replaceEditor(page, `export function authorizeGate(hasKey: boolean, powerOnline: boolean) {\n  let keyAvailable = hasKey;\n  const opened = powerOnline && keyAvailable;\n  if (opened) keyAvailable = false;\n  return { opened, keyRetained: !opened && keyAvailable };\n}\n`);
  await page.getByRole("button", { name: /TEST CANDIDATE/ }).click();
  await expect(page.getByText("7/7 PASSED", { exact: true })).toBeVisible({ timeout: 15_000 });
  await page.getByRole("button", { name: /DEPLOY v2/ }).click();
  await pressPath(page, ["d", "e"]);

  await expect(page.locator(".level-victory")).toContainText("WING STABILIZED");
  await expect(page.getByText("2/2 INCIDENTS VERIFIED")).toBeVisible();
});

test("Challenge mode hides deterministic source locations", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /CHALLENGE trace only/ }).click();
  await page.getByRole("button", { name: /ENTER LEVEL_01/ }).click();
  await expect(page.getByText("READY", { exact: true })).toBeVisible({ timeout: 15_000 });
  await pressPath(page, ["w", "w", "w", "w", "w", "d", "s", "s", "d", "d", "d", "d", "d", "d"]);
  await page.getByRole("button", { name: "REPORT TO DEV_02" }).click();
  await expect(page.getByText("TRACE REQUIRED", { exact: true })).toBeVisible();
  await expect(page.getByText(/bridge.controller.ts:3/)).toHaveCount(0);
});

test("detached Gamer window controls and receives the authoritative host snapshot", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /ENTER LEVEL_01/ }).click();
  await expect(page.getByText("READY", { exact: true })).toBeVisible({ timeout: 15_000 });
  const popupPromise = page.waitForEvent("popup");
  await page.getByRole("button", { name: "OPEN GAMER" }).click();
  const gamer = await popupPromise;
  await expect(gamer.getByText(/GAMER WINDOW · CONNECTED/)).toBeVisible({ timeout: 10_000 });
  await gamer.locator("body").press("d");
  await expect(page.getByText(/POS \(3, 7\)/)).toBeVisible();
  await expect(gamer.getByText(/POS \(3, 7\)/)).toBeVisible();
});

for (const viewport of [{ width: 1280, height: 720 }, { width: 1440, height: 900 }]) {
  test(`split workspace has no horizontal overflow at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await page.getByRole("button", { name: /ENTER LEVEL_01/ }).click();
    await expect(page.getByText("READY", { exact: true })).toBeVisible({ timeout: 15_000 });
    const dimensions = await page.evaluate(() => ({ viewport: window.innerWidth, document: document.documentElement.scrollWidth }));
    expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport);
    await expect(page.locator(".gamer-panel")).toBeVisible();
    await expect(page.locator(".coder-panel-v3")).toBeVisible();
  });
}
