import { expect, test } from "@playwright/test";

test("complete player-to-coder-to-player verification loop", async ({ page }) => {
  await page.goto("/");
  const body = page.locator("body");
  const keys = ["w", "w", "w", "w", "d", "a", "s", "s", "s", "d", "e", "w", "d", "d", "d", "d", "d"];
  for (const key of keys) await body.press(key);

  await expect(page.getByText("GLITCH CAPTURED")).toBeVisible();
  await page.getByRole("checkbox", { name: "Attach scanner telemetry" }).check();
  await page.getByRole("button", { name: "SEND INCIDENT TO DEV_02" }).click();
  await expect(page.getByText("BUG-001 · BOUNDARY FAILURE")).toBeVisible();

  const beforeReplay = await page.getByText("(5, 4)").textContent();
  await page.getByRole("button", { name: "▷ REPLAY" }).click();
  await page.waitForTimeout(700);
  await expect(page.getByText("(5, 4)")).toHaveText(beforeReplay);
  await page.getByRole("button", { name: "■ STOP" }).click();

  await page.getByRole("textbox", { name: "Bridge comparison expression" }).fill("stepsOnBridge > maxSafeSteps");
  await page.getByRole("button", { name: "▷ TEST CANDIDATE" }).click();
  await expect(page.getByText("4/4 PASSED", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "⇧ DEPLOY PATCH" }).click();

  for (const key of ["d", "d", "d", "d", "w", "w", "d", "d", "e"]) await body.press(key);
  await expect(page.getByRole("heading", { name: /The world changed because/ })).toBeVisible();
});
