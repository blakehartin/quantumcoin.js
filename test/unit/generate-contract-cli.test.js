/**
 * @testCategory unit
 * @blockchainRequired false
 * @transactional false
 * @description generate-sdk.js CLI help output
 */

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

describe("generate-sdk.js CLI", () => {
  it("prints detailed help when invoked with no args", () => {
    const repoRoot = path.resolve(__dirname, "..", "..");
    const cli = path.join(repoRoot, "generate-sdk.js");

    const res = spawnSync(process.execPath, [cli], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: "pipe",
      shell: false,
      windowsHide: true,
    });

    assert.equal(res.status, 0);
    const out = `${res.stdout || ""}${res.stderr || ""}`;
    assert.ok(out.includes("sdkgen"));
    assert.ok(out.includes("INPUT MODES"));
    assert.ok(out.includes("--abi"));
    assert.ok(out.includes("--bin"));
    assert.ok(out.includes("--sol"));
    assert.ok(out.includes("--artifacts-json"));
    assert.ok(out.includes("--create-package"));
    assert.ok(out.includes("--lang"));
    assert.ok(out.includes("EXAMPLES"));
  });
});

