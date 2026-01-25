/**
 * @testCategory unit
 * @blockchainRequired false
 * @transactional false
 * @description FilterByBlockHash shape and getLogs forwarding
 */

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

const qc = require("../../index");

describe("FilterByBlockHash", () => {
  it("validates blockHash and normalizes it", () => {
    assert.throws(() => new qc.FilterByBlockHash(null), (e) => e && e.code === "INVALID_ARGUMENT");
    assert.throws(() => new qc.FilterByBlockHash("0x1234"), (e) => e && e.code === "INVALID_ARGUMENT"); // wrong length

    const h = "0x" + "AA".repeat(32);
    const f = new qc.FilterByBlockHash(h);
    assert.equal(f.blockHash, "0x" + "aa".repeat(32));
  });

  it("is consumable by provider.getLogs (forwarded as eth_getLogs filter)", async () => {
    class P extends qc.AbstractProvider {
      constructor() {
        super();
        this.calls = [];
      }
      async _perform(method, params) {
        this.calls.push({ method, params });
        return [];
      }
    }

    const p = new P();
    const blockHash = "0x" + "11".repeat(32);
    const address = "0x" + "22".repeat(32);
    const topic0 = "0x" + "33".repeat(32);

    const filter = new qc.FilterByBlockHash(blockHash, address, [topic0]);
    const logs = await p.getLogs(filter);

    assert.deepEqual(logs, []);
    assert.equal(p.calls.length, 1);
    assert.equal(p.calls[0].method, "eth_getLogs");
    assert.equal(p.calls[0].params.length, 1);
    assert.equal(p.calls[0].params[0].blockHash, blockHash);
    assert.equal(p.calls[0].params[0].address, address);
    assert.deepEqual(p.calls[0].params[0].topics, [topic0]);
  });
});

