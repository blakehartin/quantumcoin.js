/**
 * @testCategory unit
 * @blockchainRequired false
 * @transactional false
 * @description BrowserProvider (EIP-1193 wrapper) + debug event sink validation
 */

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

const qc = require("../../index");

describe("BrowserProvider", () => {
  it("wraps an EIP-1193 provider and emits debug events", async () => {
    /** @type {any[]} */
    const calls = [];

    const fakeEip1193 = {
      request: async ({ method, params }) => {
        calls.push({ method, params });
        if (method === "eth_accounts") {
          return ["0x" + "11".repeat(32)];
        }
        if (method === "eth_blockNumber") {
          return "0x10";
        }
        if (method === "eth_getBlockByNumber") {
          // params: [ "latest", false ]
          return {
            number: "0x10",
            hash: "0x" + "aa".repeat(32),
            parentHash: "0x" + "bb".repeat(32),
            timestamp: "0x1",
            transactions: [],
          };
        }
        throw new Error(`unsupported method: ${method}`);
      },
    };

    const provider = new qc.BrowserProvider(fakeEip1193);

    /** @type {any[]} */
    const debug = [];
    provider.on("debug", (ev) => debug.push(ev));

    const bn = await provider.getBlockNumber();
    assert.equal(bn, 16);

    const latest = await provider.getBlock("latest");
    assert.equal(latest.number, 16);
    assert.ok(typeof latest.hash === "string");

    const signer = await provider.getSigner();
    const addr = await signer.getAddress();
    assert.equal(addr.toLowerCase(), ("0x" + "11".repeat(32)).toLowerCase());
    assert.equal(await provider.hasSigner(addr), true);

    // Validate calls shape
    assert.deepEqual(
      calls.map((c) => c.method),
      ["eth_blockNumber", "eth_getBlockByNumber", "eth_accounts", "eth_accounts"],
    );

    // Validate debug event sink: send+receive per request in order
    const actions = debug.map((d) => d && d.action);
    assert.deepEqual(actions, [
      "sendEip1193Payload",
      "receiveEip1193Result",
      "sendEip1193Payload",
      "receiveEip1193Result",
      "sendEip1193Payload",
      "receiveEip1193Result",
      "sendEip1193Payload",
      "receiveEip1193Result",
    ]);

    assert.equal(debug[0].payload.method, "eth_blockNumber");
    assert.equal(debug[2].payload.method, "eth_getBlockByNumber");
  });
});

