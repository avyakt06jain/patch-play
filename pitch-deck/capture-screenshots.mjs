import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { chromium } from "@playwright/test";

const deckRoot = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(deckRoot, "..");
const outputDir = path.join(deckRoot, "assets", "screenshots");
const baseURL = "http://127.0.0.1:4177";
const viteCLI = path.join(projectRoot, "node_modules", "vite", "bin", "vite.js");

const server = spawn(process.execPath, [viteCLI, "--host", "127.0.0.1", "--port", "4177", "--strictPort"], {
  cwd: projectRoot,
  stdio: ["ignore", "pipe", "pipe"],
});

async function waitForServer() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(baseURL);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error("The local Vite preview did not start.");
}

async function pressPath(page, keys) {
  await page.locator("body").click({ position: { x: 10, y: 10 } });
  for (const key of keys) {
    await page.keyboard.press(key);
    await page.waitForTimeout(35);
  }
}

async function replaceEditor(page, source) {
  const editor = page.locator(".cm-content");
  await editor.click();
  await editor.press(process.platform === "darwin" ? "Meta+A" : "Control+A");
  await editor.fill(source);
}

async function capture(page, filename) {
  await page.waitForTimeout(250);
  await page.screenshot({ path: path.join(outputDir, filename), animations: "disabled" });
}

async function enterLevel(page, number, title) {
  await page.getByRole("button", { name: new RegExp(`${number}.*${title}`, "i") }).click();
  await page.getByRole("button", { name: new RegExp(`ENTER LEVEL_${number}`) }).click();
  try {
    await page.locator(".runtime-pill", { hasText: "READY" }).waitFor({ timeout: 45_000 });
  } catch (error) {
    console.error((await page.locator("body").innerText()).slice(0, 4000));
    throw error;
  }
}

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({ viewport: { width: 1600, height: 900 }, reducedMotion: "reduce", colorScheme: "dark" });
  const page = await context.newPage();
  await page.addInitScript(() => localStorage.clear());
  await page.goto(baseURL);
  await capture(page, "01-campaign-menu.png");

  await enterLevel(page, "01", "THE BROKEN CROSSING");
  await capture(page, "02-level1-split-start.png");

  await page.getByRole("button", { name: "UNDER THE HOOD" }).click();
  await capture(page, "03-under-the-hood.png");
  await page.getByRole("button", { name: "×" }).click();

  await pressPath(page, ["d", "d", "w", "e", "w", "w", "w", "w", "a", "s", "s", "d", "d", "d", "d", "d", "d"]);
  await page.locator(".v3-incident-overlay").waitFor();
  await capture(page, "04-live-incident.png");

  await page.getByRole("button", { name: "REPORT TO DEV_02" }).click();
  await page.getByText(/GUIDED TRACE · bridge.controller.ts:3/).waitFor();
  await capture(page, "05-coder-diagnosis.png");

  const popupPromise = page.waitForEvent("popup");
  await page.getByRole("button", { name: "OPEN CODER" }).click();
  const coderWindow = await popupPromise;
  await coderWindow.getByText(/CODER WINDOW · CONNECTED/).waitFor({ timeout: 10_000 });
  await capture(coderWindow, "06-detached-coder.png");
  await coderWindow.close();

  await replaceEditor(page, `export function shouldCollapse(stepsOnBridge: number, maxSafeSteps: number) {\n  return stepsOnBridge > maxSafeSteps;\n}\n`);
  await page.getByRole("button", { name: /TEST CANDIDATE/ }).click();
  await page.getByText("4/4 PASSED", { exact: true }).waitFor({ timeout: 15_000 });
  await capture(page, "07-tests-passed.png");

  await page.getByRole("button", { name: /DEPLOY v1/ }).click();
  await page.locator(".verification-banner").waitFor();
  await capture(page, "08-patch-deployed.png");
  await pressPath(page, ["d", "d", "d"]);

  await pressPath(page, ["d", "d", "d", "d", "d", "d", "d", "d", "w", "e"]);
  await page.locator(".v3-incident-overlay").waitFor();
  await capture(page, "09-second-incident.png");
  await page.getByRole("button", { name: "REPORT TO DEV_02" }).click();
  await replaceEditor(page, `export function authorizeGate(hasKey: boolean, powerOnline: boolean) {\n  let keyAvailable = hasKey;\n  const opened = powerOnline && keyAvailable;\n  if (opened) keyAvailable = false;\n  return { opened, keyRetained: !opened && keyAvailable };\n}\n`);
  await page.getByRole("button", { name: /TEST CANDIDATE/ }).click();
  await page.getByText("7/7 PASSED", { exact: true }).waitFor({ timeout: 15_000 });
  await page.getByRole("button", { name: /DEPLOY v2/ }).click();
  await pressPath(page, ["d", "e"]);
  await page.locator(".level-victory").waitFor();
  await capture(page, "10-wing-stabilized.png");
  await page.getByRole("button", { name: "RETURN TO CAMPAIGN" }).click();
  await capture(page, "11-campaign-progress.png");

  for (const level of [
    { number: "02", title: "SEQUENCE BREACH", file: "12-signal-wing.png" },
    { number: "03", title: "GHOST CARGO", file: "13-cargo-wing.png" },
    { number: "04", title: "PRIORITY ZERO", file: "14-reactor-wing.png" },
  ]) {
    await enterLevel(page, level.number, level.title);
    await page.getByRole("button", { name: "PLAYER", exact: true }).click();
    await capture(page, level.file);
    await page.getByRole("button", { name: "EXIT LEVEL" }).click();
  }

  console.log(`Captured 14 prototype screenshots in ${outputDir}`);
} finally {
  await browser?.close();
  server.kill();
}
