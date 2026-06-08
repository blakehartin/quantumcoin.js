/**
 * @testCategory security
 * @blockchainRequired false
 * @transactional false
 * @description RPC quantities are untrusted. A value above
 *              Number.MAX_SAFE_INTEGER must fail loudly instead of being silently
 *              truncated by Number(BigInt(...)). The decoder keeps returning a
 *              `number` (no signature change); only out-of-range values throw.
 */

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

const { Initialize } = require("../../config");
const qc = require("../../index");
const { logSuite, logTest } = require("../verbose-logger");

// 2^53 = 9007199254740992 = one past Number.MAX_SAFE_INTEGER.
const UNSAFE_HEX = "0x20000000000000";
const TX_HASH = "0x" + "aa".repeat(32);

class NumProvider extends qc.AbstractProvider {
  constructor(map) {
    super();
    this._map = map;
  }
  async _perform(method) {
    return Object.prototype.hasOwnProperty.call(this._map, method) ? this._map[method] : null;
  }
}

describe("Security: untrusted RPC quantity bounds", () => {
  logSuite("Security: untrusted RPC quantity bounds");

  it("getBlockNumber throws for a value above MAX_SAFE_INTEGER (negative)", async () => {
    logTest("getBlockNumber rejects an out-of-range quantity", {});
    await Initialize(null);
    const p = new NumProvider({ eth_blockNumber: UNSAFE_HEX });
    await assert.rejects(() => p.getBlockNumber(), /safe integer range/i);
  });

  it("getBlock throws when block.number exceeds MAX_SAFE_INTEGER (negative)", async () => {
    logTest("getBlock rejects an out-of-range block number", {});
    await Initialize(null);
    const p = new NumProvider({
      eth_getBlockByNumber: { hash: "0x" + "11".repeat(32), number: UNSAFE_HEX, timestamp: "0x1", transactions: [] },
    });
    await assert.rejects(() => p.getBlock("latest"), /safe integer range/i);
  });

  it("getTransactionReceipt throws when a quantity exceeds MAX_SAFE_INTEGER (negative)", async () => {
    logTest("getTransactionReceipt rejects an out-of-range quantity", {});
    await Initialize(null);
    const p = new NumProvider({
      eth_getTransactionReceipt: { transactionHash: TX_HASH, blockNumber: UNSAFE_HEX, status: "0x1" },
    });
    await assert.rejects(() => p.getTransactionReceipt(TX_HASH), /safe integer range/i);
  });

  it("decodes normal in-range quantities to the correct number (positive)", async () => {
    logTest("decodes in-range quantities correctly", {});
    await Initialize(null);
    const p = new NumProvider({
      eth_blockNumber: "0x10",
      eth_getTransactionReceipt: {
        transactionHash: TX_HASH,
        blockNumber: "0x5",
        transactionIndex: "0x0",
        status: "0x1",
      },
    });
    const bn = await p.getBlockNumber();
    assert.equal(bn, 16);
    assert.equal(typeof bn, "number");

    const receipt = await p.getTransactionReceipt(TX_HASH);
    assert.equal(receipt.blockNumber, 5);
    assert.equal(typeof receipt.blockNumber, "number");
    assert.equal(receipt.status, 1);
  });
});
