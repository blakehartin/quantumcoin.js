/**
 * Playwright configuration for the browser test suite.
 *
 * The suite lives under test/browser and validates that QuantumCoin.js runs in
 * a real (headless) browser. Build the bundle first with
 * `npm run test:browser:build` (the `test:browser` script does this for you).
 */

const { defineConfig, devices } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./test/browser",
  testMatch: /.*\.spec\.js/,
  fullyParallel: false,
  timeout: 180000,
  reporter: "list",
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
