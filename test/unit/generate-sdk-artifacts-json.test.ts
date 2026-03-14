/**
 * @testCategory unit
 * @blockchainRequired false
 * @transactional false
 * @description generate-sdk.js artifacts JSON input (multi-contract)
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { logSuite, logTest } from "../verbose-logger";

describe("generate-sdk.js --artifacts-json", () => {
  logSuite("generate-sdk.js --artifacts-json");
  it("generates typed files for multiple ABI+BIN pairs (no package scaffold)", () => {
    logTest("generates typed files for multiple ABI+BIN pairs (no package scaffold)", {});
    const repoRoot = path.resolve(__dirname, "..", "..");
    const cli = path.join(repoRoot, "generate-sdk.js");

    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "qcgen-artjson-"));
    const outDir = path.join(tmp, "out");

    const alphaAbi = [
      { type: "function", name: "get", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint256" }] },
    ];
    const betaAbi = [
      { type: "function", name: "set", stateMutability: "nonpayable", inputs: [{ name: "value", type: "uint256" }], outputs: [] },
    ];
    const gammaAbi = [
      { type: "function", name: "ping", stateMutability: "pure", inputs: [], outputs: [{ name: "", type: "bool" }] },
    ];

    fs.writeFileSync(path.join(tmp, "Alpha.abi.json"), JSON.stringify(alphaAbi, null, 2), "utf8");
    fs.writeFileSync(path.join(tmp, "Alpha.bin"), "0x6000", "utf8");
    fs.writeFileSync(path.join(tmp, "Beta.abi.json"), JSON.stringify(betaAbi, null, 2), "utf8");
    fs.writeFileSync(path.join(tmp, "Beta.bin"), "0x6000", "utf8");

    const artifactsJsonPath = path.join(tmp, "artifacts.json");
    fs.writeFileSync(
      artifactsJsonPath,
      JSON.stringify(
        [
          { abi: "./Alpha.abi.json", bin: "./Alpha.bin" },
          { abi: "./Beta.abi.json", bin: "./Beta.bin" },
          { name: "Gamma", abi: JSON.stringify(gammaAbi), bin: "6000" },
        ],
        null,
        2,
      ),
      "utf8",
    );

    const res = spawnSync(
      process.execPath,
      [cli, "--artifacts-json", artifactsJsonPath, "--out", outDir, "--non-interactive"],
      { cwd: repoRoot, encoding: "utf8", stdio: "pipe", shell: false, windowsHide: true },
    );

    assert.equal(res.status, 0, `generator failed:\n${res.stdout}\n${res.stderr}`);

    assert.ok(fs.existsSync(path.join(outDir, "types.ts")));
    assert.ok(fs.existsSync(path.join(outDir, "index.ts")));
    assert.ok(fs.existsSync(path.join(outDir, "Alpha.ts")));
    assert.ok(fs.existsSync(path.join(outDir, "Alpha__factory.ts")));
    assert.ok(fs.existsSync(path.join(outDir, "Beta.ts")));
    assert.ok(fs.existsSync(path.join(outDir, "Beta__factory.ts")));
    assert.ok(fs.existsSync(path.join(outDir, "Gamma.ts")));
    assert.ok(fs.existsSync(path.join(outDir, "Gamma__factory.ts")));
  });

  it("supports --lang js (generates JS source + .d.ts types)", () => {
    const repoRoot = path.resolve(__dirname, "..", "..");
    const cli = path.join(repoRoot, "generate-sdk.js");

    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "qcgen-artjson-js-"));
    const outDir = path.join(tmp, "out");

    const alphaAbi = [
      { type: "function", name: "get", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint256" }] },
    ];
    fs.writeFileSync(path.join(tmp, "Alpha.abi.json"), JSON.stringify(alphaAbi, null, 2), "utf8");
    fs.writeFileSync(path.join(tmp, "Alpha.bin"), "0x6000", "utf8");

    const artifactsJsonPath = path.join(tmp, "artifacts.json");
    fs.writeFileSync(artifactsJsonPath, JSON.stringify([{ abi: "./Alpha.abi.json", bin: "./Alpha.bin" }], null, 2), "utf8");

    const res = spawnSync(
      process.execPath,
      [cli, "--lang", "js", "--artifacts-json", artifactsJsonPath, "--out", outDir, "--non-interactive"],
      { cwd: repoRoot, encoding: "utf8", stdio: "pipe", shell: false, windowsHide: true },
    );

    assert.equal(res.status, 0, `generator failed:\n${res.stdout}\n${res.stderr}`);

    assert.ok(fs.existsSync(path.join(outDir, "types.js")));
    assert.ok(fs.existsSync(path.join(outDir, "types.d.ts")));
    assert.ok(fs.existsSync(path.join(outDir, "index.js")));
    assert.ok(fs.existsSync(path.join(outDir, "index.d.ts")));
    assert.ok(fs.existsSync(path.join(outDir, "Alpha.js")));
    assert.ok(fs.existsSync(path.join(outDir, "Alpha.d.ts")));
    assert.ok(fs.existsSync(path.join(outDir, "Alpha__factory.js")));
    assert.ok(fs.existsSync(path.join(outDir, "Alpha__factory.d.ts")));

    const typesDts = fs.readFileSync(path.join(outDir, "types.d.ts"), "utf8");
    assert.ok(typesDts.includes('from "quantumcoin/types"'), "expected generated types.d.ts to reference quantumcoin/types");
  });
});
