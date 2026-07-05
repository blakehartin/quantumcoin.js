/**
 * Playwright browser test.
 *
 * Loads the esbuild-bundled SDK test harness (index.html + dist/bundle.js) in a
 * headless browser, waits for the in-page suite to finish, and asserts that
 * every platform-agnostic check passed. This proves the SDK (and its crypto,
 * provided by quantum-coin-js-sdk WASM) runs in a real browser environment.
 */

const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { test, expect } = require("@playwright/test");

const pageUrl = pathToFileURL(path.join(__dirname, "index.html")).href;

test("SDK runs its platform-agnostic suite in the browser", async ({ page }) => {
  const consoleErrors = [];
  page.on("pageerror", (err) => consoleErrors.push(String(err)));

  await page.goto(pageUrl);

  // WASM instantiation + the crypto/wallet checks can take a little while.
  await page.waitForFunction(() => window.__TEST_DONE__ === true, null, { timeout: 120000 });

  const results = await page.evaluate(() => window.__TEST_RESULTS__);

  expect(Array.isArray(results)).toBe(true);
  expect(results.length).toBeGreaterThan(0);

  const failures = results.filter((r) => !r.ok);
  if (failures.length > 0) {
    const detail = failures.map((f) => `- ${f.name}: ${f.error}`).join("\n");
    throw new Error(`Browser suite had ${failures.length} failure(s):\n${detail}`);
  }

  expect(consoleErrors).toEqual([]);
});
