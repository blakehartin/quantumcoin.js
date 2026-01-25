/**
 * @testCategory unit
 * @blockchainRequired false
 * @transactional false
 * @description SDK initialization and basic constants
 */

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

const { Initialize, isInitialized, Config } = require("../../config");
const qc = require("../../index");

describe("Initialize()", () => {
  it("initializes with default config (null)", async () => {
    const ok = await Initialize(null);
    assert.equal(ok, true);
    assert.equal(isInitialized(), true);
  });

  it("exposes constants with QuantumCoin address size", async () => {
    await Initialize(null);
    assert.equal(typeof qc.version, "string");
    assert.equal(qc.ZeroAddress.length, 66);
    assert.equal(qc.ZeroHash.length, 66);
    assert.equal(qc.ZeroAddress, "0x" + "00".repeat(32));
    assert.equal(qc.WeiPerEther, 1000000000000000000n);
  });

  it("Config defaults match SPEC.md", () => {
    const cfg = new Config();
    assert.equal(cfg.chainId, 123123);
    assert.equal(cfg.rpcEndpoint, "https://public.rpc.quantumcoinapi.com");
  });
});

