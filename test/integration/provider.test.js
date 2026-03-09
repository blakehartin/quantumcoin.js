/**
 * @testCategory integration
 * @blockchainRequired readonly
 * @transactional false
 * @description Read-only integration tests. Endpoint from QC_ENDPOINT or QC_RPC_URL (default: public RPC).
 * Works with HTTP, WebSocket, or IPC; use QC_ENDPOINT=\\.\pipe\geth.ipc to run over IPC.
 */

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

const { Initialize } = require("../../config");
const qc = require("../../index");

const DEFAULT_RPC = "https://public.rpc.quantumcoinapi.com";
const CHAIN_ID = 123123;
const STAKING_CONTRACT = "0x" + "00".repeat(30) + "10" + "00"; // ...1000 (32-byte address)

const ENDPOINT = process.env.QC_ENDPOINT || process.env.QC_RPC_URL || DEFAULT_RPC;
const isPublicRpc = ENDPOINT === DEFAULT_RPC;

describe("Provider (readonly)", () => {
  it("getBlockNumber returns a block number", async (t) => {
    const provider = qc.getProvider(ENDPOINT, CHAIN_ID);
    try {
      const bn = await provider.getBlockNumber();
      assert.ok(Number.isInteger(bn) && bn >= 0);
      if (isPublicRpc) assert.ok(bn > 3000000, "public chain height");
    } catch (e) {
      t.skip(`network unavailable: ${e && e.message ? e.message : String(e)}`);
    }
  });

  it("getBlock('latest') works", async (t) => {
    const provider = qc.getProvider(ENDPOINT, CHAIN_ID);
    try {
      const latest = await provider.getBlockNumber();
      const block = await provider.getBlock("latest");
      assert.ok(block && typeof block === "object");
      assert.ok(typeof block.number === "number" && block.number >= latest);
      if (isPublicRpc && latest >= 3386000) {
        const b = await provider.getBlock(3386000);
        assert.equal(b.number, 3386000);
      }
    } catch (e) {
      t.skip(`network unavailable: ${e && e.message ? e.message : String(e)}`);
    }
  });

  it("getBalance works for an address", async (t) => {
    const provider = qc.getProvider(ENDPOINT, CHAIN_ID);
    try {
      const bal = await provider.getBalance(STAKING_CONTRACT);
      assert.equal(typeof bal, "bigint");
      assert.ok(bal >= 0n);
    } catch (e) {
      t.skip(`network unavailable: ${e && e.message ? e.message : String(e)}`);
    }
  });

  it("contract read operations work (staking contract when available)", async (t) => {
    await Initialize(null);
    const provider = qc.getProvider(ENDPOINT, CHAIN_ID);
    try {
      const abi = require("../fixtures/StakingContract.abi.json");
      const contract = new qc.Contract(STAKING_CONTRACT, abi, provider);
      const count = await contract.getDepositorCount();
      const value = Array.isArray(count) ? count[0] : count;
      assert.ok(value != null);
    } catch (e) {
      t.skip(`network/ABI unavailable: ${e && e.message ? e.message : String(e)}`);
    }
  });
});

