/**
 * @testCategory unit
 * @blockchainRequired false
 * @transactional false
 * @description Typed contract generator (file output shape)
 */

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { generate, generateFromArtifacts, generateTransactionalTestJs } = require("../../src/generator");
const { logSuite, logTest } = require("../verbose-logger");

describe("typed contract generator", () => {
  logSuite("typed contract generator");
  it("generates contract + factory + types + index files", () => {
    logTest("generates contract + factory + types + index files", {});
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "qcgen-"));
    const abiPath = path.join(tmp, "Test.abi.json");
    const binPath = path.join(tmp, "Test.bin");
    const outDir = path.join(tmp, "out");

    const abi = [
      {
        type: "function",
        name: "balanceOf",
        stateMutability: "view",
        inputs: [{ name: "account", type: "address" }],
        outputs: [{ name: "", type: "uint256" }],
      },
      {
        type: "function",
        name: "transfer",
        stateMutability: "nonpayable",
        inputs: [
          { name: "to", type: "address" },
          { name: "amount", type: "uint256" },
        ],
        outputs: [{ name: "", type: "bool" }],
      },
    ];

    fs.writeFileSync(abiPath, JSON.stringify(abi, null, 2), "utf8");
    fs.writeFileSync(binPath, "0x6000", "utf8");

    const res = generate({ abiPath, binPath, outDir, contractName: "TestToken" });
    assert.ok(fs.existsSync(res.contractFile));
    assert.ok(fs.existsSync(res.factoryFile));
    assert.ok(fs.existsSync(res.typesFile));
    assert.ok(fs.existsSync(res.indexFile));

    const contractSrc = fs.readFileSync(res.contractFile, "utf8");
    assert.ok(contractSrc.includes("export class TestToken"));
    assert.ok(contractSrc.includes("async balanceOf"));
    assert.ok(contractSrc.includes("async transfer"));
    assert.ok(contractSrc.includes("populateTransaction"));

    const factorySrc = fs.readFileSync(res.factoryFile, "utf8");
    assert.ok(factorySrc.includes("export class TestToken__factory"));
  });

  it("generated test for a concrete contract (with bytecode) contains the provider.getCode bytecode assertion", () => {
    logTest("generated test for a concrete contract contains the bytecode assertion", {});
    const src = generateTransactionalTestJs({
      contractName: "ConcreteToken",
      abi: [{ type: "constructor", inputs: [], stateMutability: "nonpayable" }],
      bytecode: "0x6080604052",
    });
    assert.ok(src.includes("provider.getCode(contract.target"));
    assert.ok(src.includes('assert.ok(code && code !== "0x")'));
    assert.ok(!src.includes("Skipping bytecode check"));
  });

  it("generated test for an interface (bytecode '0x') omits the provider.getCode bytecode assertion", () => {
    logTest("generated test for an interface omits the bytecode assertion", {});
    const src = generateTransactionalTestJs({
      contractName: "IThing",
      abi: [{
        type: "function", name: "doThing",
        inputs: [], outputs: [], stateMutability: "nonpayable",
      }],
      bytecode: "0x",
    });
    assert.ok(!src.includes("provider.getCode(contract.target"));
    assert.ok(!src.includes('assert.ok(code && code !== "0x")'));
    assert.ok(src.includes("Skipping bytecode check"));
    assert.ok(src.includes("IThing is an interface"));
  });

  it("empty/undefined/null/'0X' bytecode variants are all treated as interface", () => {
    logTest("empty bytecode variants are all treated as interface", {});
    for (const bc of [undefined, null, "", "0x", "0X", "  0x  "]) {
      const src = generateTransactionalTestJs({
        contractName: "IThing",
        abi: [],
        bytecode: bc,
      });
      assert.ok(
        !src.includes("provider.getCode(contract.target"),
        `bytecode=${JSON.stringify(bc)} should be treated as interface (no getCode assertion)`,
      );
      assert.ok(
        src.includes("Skipping bytecode check"),
        `bytecode=${JSON.stringify(bc)} should emit skip comment`,
      );
    }
  });

  it("includes injected docs in generated TypeScript", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "qcgen-docs-"));
    const outDir = path.join(tmp, "out");

    const abi = [
      {
        type: "function",
        name: "set",
        stateMutability: "nonpayable",
        inputs: [{ name: "value", type: "uint256" }],
        outputs: [],
      },
    ];

    const res = generateFromArtifacts({
      outDir,
      artifacts: [
        {
          contractName: "DocToken",
          abi,
          bytecode: "0x6000",
          docs: {
            contract: "Example contract doc from Solidity.",
            functions: {
              set: "Example function doc from Solidity.",
            },
          },
        },
      ],
    });

    const contractFile = res.contracts[0].contractFile;
    const src = fs.readFileSync(contractFile, "utf8");
    assert.ok(src.includes("Example contract doc from Solidity."));
    assert.ok(src.includes("Example function doc from Solidity."));
  });
});

