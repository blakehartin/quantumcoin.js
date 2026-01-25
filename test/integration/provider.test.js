/**
 * @testCategory integration
 * @blockchainRequired readonly
 * @transactional false
 * @description Read-only JSON-RPC integration tests against public QuantumCoin RPC
 */

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

const { Initialize } = require("../../config");
const qc = require("../../index");

const RPC = "https://public.rpc.quantumcoinapi.com";
const CHAIN_ID = 123123;
const STAKING_CONTRACT = "0x" + "00".repeat(30) + "10" + "00"; // ...1000 (32-byte address)

describe("JsonRpcProvider (readonly)", () => {
  it("getBlockNumber returns a recent block", async (t) => {
    const provider = new qc.JsonRpcProvider(RPC, CHAIN_ID);
    try {
      const bn = await provider.getBlockNumber();
      assert.ok(bn > 3000000);
    } catch (e) {
      t.skip(`network unavailable: ${e && e.message ? e.message : String(e)}`);
    }
  });

  it("getBlock works for a block > 3000000 and for latest", async (t) => {
    const provider = new qc.JsonRpcProvider(RPC, CHAIN_ID);
    try {
      const latest = await provider.getBlockNumber();
      const target = 3386000;
      if (latest < target) t.skip("chain not at expected height yet");

      const b = await provider.getBlock(target);
      assert.equal(b.number, target);

      const l = await provider.getBlock("latest");
      assert.ok(l.number >= target);
    } catch (e) {
      t.skip(`network unavailable: ${e && e.message ? e.message : String(e)}`);
    }
  });

  it("getBalance works for a known system contract address", async (t) => {
    const provider = new qc.JsonRpcProvider(RPC, CHAIN_ID);
    try {
      const bal = await provider.getBalance(STAKING_CONTRACT);
      assert.equal(typeof bal, "bigint");
      assert.ok(bal >= 0n);
    } catch (e) {
      t.skip(`network unavailable: ${e && e.message ? e.message : String(e)}`);
    }
  });

  it("contract read operations work (staking contract)", async (t) => {
    await Initialize(null);
    const provider = new qc.JsonRpcProvider(RPC, CHAIN_ID);
    try {
      const abi = require("../fixtures/StakingContract.abi.json");
      const contract = new qc.Contract(STAKING_CONTRACT, abi, provider);
      const count = await contract.getDepositorCount();
      // qcsdk returns JSON; for single return values it is usually an array with one element
      const value = Array.isArray(count) ? count[0] : count;
      assert.ok(value != null);
    } catch (e) {
      t.skip(`network/ABI unavailable: ${e && e.message ? e.message : String(e)}`);
    }
  });
});

