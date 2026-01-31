/**
 * @testCategory unit
 * @blockchainRequired false
 * @transactional false
 * @description populateTransaction namespace and sendRawTransaction API
 */

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

const { Initialize } = require("../../config");
const qc = require("../../index");

describe("populateTransaction + sendRawTransaction", () => {
  it("contract.populateTransaction.<fn> builds tx request without provider/signer", async () => {
    await Initialize(null);

    const abi = [
      {
        type: "function",
        name: "setValue",
        stateMutability: "nonpayable",
        inputs: [{ name: "value", type: "uint256" }],
        outputs: [],
      },
    ];

    const addr = "0x" + "11".repeat(32);
    const contract = new qc.Contract(addr, abi);

    const tx = await contract.populateTransaction.setValue(123, { gasLimit: 50000 });
    assert.equal(tx.to, addr);
    assert.equal(typeof tx.data, "string");
    assert.ok(tx.data.startsWith("0x") && tx.data.length > 10);
    assert.equal(tx.gasLimit, 50000);
  });

  it("provider.sendRawTransaction exists and forwards to eth_sendRawTransaction", async () => {
    await Initialize(null);

    class TestProvider extends qc.AbstractProvider {
      constructor() {
        super();
        this.calls = [];
      }
      async _perform(method, params) {
        this.calls.push({ method, params });
        if (method === "eth_sendRawTransaction") return "0x" + "aa".repeat(32);
        if (method === "eth_getTransactionByHash") return null;
        return null;
      }
    }

    const p = new TestProvider();
    const raw = "0xdeadbeef";
    const resp = await p.sendRawTransaction(raw);
    assert.ok(resp && typeof resp.hash === "string");
    assert.equal(p.calls[0].method, "eth_sendRawTransaction");
    assert.deepEqual(p.calls[0].params, [raw]);
  });
});

