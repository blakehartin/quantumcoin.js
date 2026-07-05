/**
 * Bundle the browser test entry (run-tests.js) plus the full SDK and
 * quantum-coin-js-sdk (with its embedded WASM) into a single browser script
 * using esbuild.
 *
 * The output is written to test/browser/dist/bundle.js and loaded by
 * index.html. Run automatically by the `test:browser` npm script.
 */

const path = require("node:path");
const esbuild = require("esbuild");

async function main() {
  const outfile = path.join(__dirname, "dist", "bundle.js");
  await esbuild.build({
    entryPoints: [path.join(__dirname, "run-tests.js")],
    bundle: true,
    outfile,
    platform: "browser",
    format: "iife",
    target: ["chrome111"],
    // IPC transport is Node-only and never invoked by the browser suite; keep
    // node:net out of the browser bundle.
    external: ["node:net"],
    logLevel: "info",
  });
  console.log("Browser test bundle written to", outfile);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
