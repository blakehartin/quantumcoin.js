/**
 * @testCategory unit
 * @blockchainRequired false
 * @transactional false
 * @description Core Solidity type exports exist and are wired via package exports.
 */

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

describe("core solidity types", () => {
  it("has src/types/index.d.ts with expected exports", () => {
    const repoRoot = path.resolve(__dirname, "..", "..");
    const dts = path.join(repoRoot, "src", "types", "index.d.ts");
    assert.ok(fs.existsSync(dts), "missing src/types/index.d.ts");
    const src = fs.readFileSync(dts, "utf8");

    for (const needle of [
      "export type AddressLike",
      "export type BytesLike",
      "export type BigNumberish",
      "export type SolidityTypeName",
      "export type SolidityInputValue",
      "export type SolidityOutputValue",
    ]) {
      assert.ok(src.includes(needle), `expected types module to include: ${needle}`);
    }
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

