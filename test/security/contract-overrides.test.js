/**
 * @testCategory security
 * @blockchainRequired false
 * @transactional false
 * @description Contract override spoofing. A caller-supplied `overrides`
 *              object must never be able to redirect a contract call to a
 *              different address (`to`) or replace the encoded calldata (`data`).
 *              Allow-listed fields (value, gasLimit, ...) must still apply.
 */

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { Initialize } = require("../../config");
const qc = require("../../index");
const { generateFromArtifacts } = require("../../src/generator");
const { logSuite, logTest } = require("../verbose-logger");

const ABI = [
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

function _mockSigner() {
  const captured = [];
  return {
    captured,
    signTransaction: async () => "0x",
    sendTransaction: async (tx) => {
      captured.push(tx);
      return { hash: "0x" + "22".repeat(32) };
    },
  };
}

describe("Security: contract override spoofing", () => {
  logSuite("Security: contract override spoofing");

  it("send() ignores overrides.to/data/from but applies value/gasLimit (negative + positive)", async () => {
    logTest("send() ignores overrides.to/data/from but applies value/gasLimit", {});
    await Initialize(null);

    const contractAddr = qc.Wallet.createRandom().address;
    const recipient = qc.Wallet.createRandom().address;
    const evil = qc.Wallet.createRandom().address;

    const signer = _mockSigner();
    const c = new qc.Contract(contractAddr, ABI, signer);

    await c.send("transfer", [recipient, 1n], {
      to: evil, // must be ignored
      data: "0xdeadbeef", // must be ignored
      from: evil, // must be ignored
      gasLimit: 99999, // must be applied
      value: 5n, // must be applied
      attackerKey: "x", // unknown key must be dropped
    });

    const tx = signer.captured[0];
    assert.equal(tx.to, c.address, "to must be the contract address, not the attacker's");
    assert.notEqual(tx.to, evil);
    assert.notEqual(tx.data, "0xdeadbeef", "data must be the encoded call, not attacker data");
    assert.ok(typeof tx.data === "string" && tx.data.startsWith("0x"));
    assert.equal(tx.from, undefined, "from must not be injectable via overrides");
    assert.equal(tx.gasLimit, 99999, "allow-listed gasLimit must apply");
    assert.equal(tx.value, 5n, "allow-listed value must apply");
    assert.ok(!("attackerKey" in tx), "unknown override keys must be dropped");
  });

  it("populateTransaction.<fn> protects to/data while keeping allow-listed fields", async () => {
    logTest("populateTransaction.<fn> protects to/data while keeping allow-listed fields", {});
    await Initialize(null);
    const contractAddr = qc.Wallet.createRandom().address;
    const recipient = qc.Wallet.createRandom().address;
    const evil = qc.Wallet.createRandom().address;
    const c = new qc.Contract(contractAddr, ABI);

    const tx = await c.populateTransaction.transfer(recipient, 1n, { to: evil, data: "0xbad", gasLimit: 7 });
    assert.equal(tx.to, c.address);
    assert.notEqual(tx.data, "0xbad");
    assert.equal(tx.gasLimit, 7);
  });

  it("generated factory/contract templates filter overrides (source-level assertion)", () => {
    logTest("generated factory/contract templates filter overrides", {});
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "qcgen-ov-"));
    const outDir = path.join(tmp, "out");
    const abi = [
      { type: "constructor", stateMutability: "nonpayable", inputs: [] },
      ...ABI,
    ];
    const res = generateFromArtifacts({ outDir, lang: "ts", artifacts: [{ contractName: "Tok", abi, bytecode: "0x6000" }] });
    const factorySrc = fs.readFileSync(res.contracts[0].factoryFile, "utf8");
    const contractSrc = fs.readFileSync(res.contracts[0].contractFile, "utf8");
    // The unsafe spread of raw overrides must be gone.
    assert.ok(!factorySrc.includes("...(overrides || {})"), "factory must not spread raw overrides");
    assert.ok(!contractSrc.includes("...(overrides || {})"), "contract must not spread raw overrides");
    assert.ok(factorySrc.includes("safeOverrides"), "factory must use the override allow-list");
    assert.ok(contractSrc.includes("safeOverrides"), "contract must use the override allow-list");
  });
});
