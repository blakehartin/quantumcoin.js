/**
 * @testCategory unit
 * @blockchainRequired false
 * @transactional false
 * @description generate-sdk.js CLI help output
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { logSuite, logTest } from "../verbose-logger";

describe("generate-sdk.js CLI", () => {
  logSuite("generate-sdk.js CLI");
  it("prints detailed help when invoked with no args", () => {
    logTest("prints detailed help when invoked with no args", {});
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
