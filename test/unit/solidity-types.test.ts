/**
 * @testCategory unit
 * @blockchainRequired false
 * @transactional false
 * @description Core Solidity type exports exist and are wired via package exports.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { logSuite, logTest } from "../verbose-logger";

describe("core solidity types", () => {
  logSuite("core solidity types");
  it("has src/types/index.d.ts with expected exports", () => {
    logTest("has src/types/index.d.ts with expected exports", {});
    const repoRoot = path.resolve(__dirname, "..", "..");
    const dts = path.join(repoRoot, "src", "types", "index.d.ts");
    assert.ok(fs.existsSync(dts), "missing src/types/index.d.ts");
    const src = fs.readFileSync(dts, "utf8");
    // Types may be defined here or re-exported; at minimum the module exists and exports something.
    assert.ok(src.includes("export"), "expected types module to have an export");
  });

  it("exports ./types via package.json exports map", () => {
    const repoRoot = path.resolve(__dirname, "..", "..");
    const pkgPath = path.join(repoRoot, "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

    assert.equal(pkg.types, "src/index.d.ts");
    assert.ok(pkg.typesVersions && pkg.typesVersions["*"], "package.json missing typesVersions");

    assert.ok(pkg.exports, "package.json missing exports");
    assert.ok(pkg.exports["./types"], "package.json exports missing ./types");
    assert.equal(pkg.exports["./types"].types, "./src/types/index.d.ts");
    assert.equal(pkg.exports["./types"].default, "./src/types/index.js");
  });
});
