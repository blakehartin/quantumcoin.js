/**
 * @testCategory security
 * @blockchainRequired false
 * @transactional false
 * @description Do not trust the RPC node. A broadcast must be rejected if
 *              the node returns a transaction hash different from the one we
 *              signed, and event logs from foreign contract addresses must be
 *              dropped from getLogs results.
 */

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

const { Initialize } = require("../../config");
const qc = require("../../index");
const { logSuite, logTest } = require("../verbose-logger");

const SIGNED_HASH = "0x" + "aa".repeat(32);

class SendProvider extends qc.AbstractProvider {
  constructor(returnedHash) {
    super();
    this._returnedHash = returnedHash;
  }
  async _perform(method) {
    if (method === "eth_sendRawTransaction") return this._returnedHash;
    if (method === "eth_getTransactionByHash") return { hash: this._returnedHash };
    return null;
  }
}

describe("Security: RPC broadcast hash verification", () => {
  logSuite("Security: RPC broadcast hash verification");

  it("throws when the node returns a different hash than the signed tx (negative)", async () => {
    logTest("throws when the node returns a different hash than the signed tx", {});
    await Initialize(null);
    const p = new SendProvider("0x" + "bb".repeat(32));
    await assert.rejects(
      () => p.sendTransaction("0xrawsigned", { expectedHash: SIGNED_HASH }),
      /does not match the signed transaction/i,
    );
  });

  it("returns the response when the node hash matches (positive, case-insensitive)", async () => {
    logTest("returns the response when the node hash matches", {});
    await Initialize(null);
    const p = new SendProvider(SIGNED_HASH);
    const resp = await p.sendTransaction("0xrawsigned", { expectedHash: SIGNED_HASH.toUpperCase() });
    assert.ok(resp && typeof resp.hash === "string");
    assert.equal(resp.hash.toLowerCase(), SIGNED_HASH);
  });

  it("without expectedHash, sendTransaction stays backward compatible", async () => {
    logTest("without expectedHash, sendTransaction stays backward compatible", {});
    await Initialize(null);
    const p = new SendProvider(SIGNED_HASH);
    const resp = await p.sendTransaction("0xrawsigned");
    assert.equal(resp.hash, SIGNED_HASH);
  });
});

class LogProvider extends qc.AbstractProvider {
  constructor(logs) {
    super();
    this._logs = logs;
  }
  async _perform(method) {
    if (method === "eth_getLogs") return this._logs;
    return null;
  }
}

describe("Security: event-log provenance", () => {
  logSuite("Security: event-log provenance");

  it("drops logs whose address does not match the filter (negative) and keeps matching ones (positive)", async () => {
    logTest("drops foreign-address logs and keeps matching ones", {});
    await Initialize(null);
    const target = "0x" + "11".repeat(32);
    const foreign = "0x" + "99".repeat(32);
    const p = new LogProvider([
      { address: target, topics: [], data: "0x", blockNumber: "0x1" },
      { address: foreign, topics: [], data: "0x", blockNumber: "0x1" },
      { address: target.toUpperCase(), topics: [], data: "0x", blockNumber: "0x1" },
    ]);

    const logs = await p.getLogs({ address: target });
    assert.equal(logs.length, 2, "only logs from the requested address survive");
    for (const l of logs) {
      assert.equal(l.address.toLowerCase(), target.toLowerCase());
    }
  });

  it("returns all logs when no address filter is given (positive)", async () => {
    logTest("returns all logs when no address filter is given", {});
    await Initialize(null);
    const p = new LogProvider([
      { address: "0x" + "11".repeat(32), topics: [], data: "0x" },
      { address: "0x" + "99".repeat(32), topics: [], data: "0x" },
    ]);
    const logs = await p.getLogs({ fromBlock: 0 });
    assert.equal(logs.length, 2);
  });
});

const AA = "0x" + "aa".repeat(32);
const BB = "0x" + "bb".repeat(32);

class HashProvider extends qc.AbstractProvider {
  constructor(obj) {
    super();
    this._obj = obj;
  }
  async _perform(method) {
    if (method === "eth_getTransactionByHash") return this._obj;
    if (method === "eth_getTransactionReceipt") return this._obj;
    return null;
  }
}

describe("Security: read-back / confirmation hash verification", () => {
  logSuite("Security: read-back / confirmation hash verification");

  it("getTransaction throws when the returned hash differs from the requested hash (negative)", async () => {
    logTest("getTransaction rejects a mismatched returned hash", {});
    await Initialize(null);
    const p = new HashProvider({ hash: BB });
    await assert.rejects(() => p.getTransaction(AA), /does not match the requested hash/i);
  });

  it("getTransaction returns the response when the hash matches (positive)", async () => {
    logTest("getTransaction accepts a matching hash", {});
    await Initialize(null);
    const p = new HashProvider({ hash: AA });
    const tx = await p.getTransaction(AA);
    assert.equal(tx.hash, AA);
  });

  it("getTransactionReceipt throws when transactionHash differs (negative)", async () => {
    logTest("getTransactionReceipt rejects a mismatched receipt", {});
    await Initialize(null);
    const p = new HashProvider({ transactionHash: BB, blockNumber: "0x1" });
    await assert.rejects(() => p.getTransactionReceipt(AA), /does not match the requested hash/i);
  });

  it("wait() rejects when the node returns a receipt for a different tx (negative)", async () => {
    logTest("wait() rejects a mismatched receipt", {});
    await Initialize(null);
    const p = new HashProvider({ transactionHash: BB, blockNumber: "0x1" });
    const resp = new qc.TransactionResponse({ hash: AA }, p);
    await assert.rejects(() => resp.wait(1, 5000), /does not match the requested hash/i);
  });
});

describe("Security: event-log topic binding", () => {
  logSuite("Security: event-log topic binding");

  const eventAbi = [
    {
      type: "event",
      name: "Transfer",
      anonymous: false,
      inputs: [
        { name: "from", type: "address", indexed: true },
        { name: "to", type: "address", indexed: true },
        { name: "value", type: "uint256", indexed: false },
      ],
    },
  ];

  it("getLogs drops logs whose topic0 does not match the requested topic (negative+positive)", async () => {
    logTest("getLogs filters by topic0", {});
    await Initialize(null);
    const addr = "0x" + "11".repeat(32);
    const wanted = "0x" + "cc".repeat(32);
    const other = "0x" + "dd".repeat(32);
    const p = new LogProvider([
      { address: addr, topics: [wanted], data: "0x", blockNumber: "0x1" },
      { address: addr, topics: [other], data: "0x", blockNumber: "0x1" },
    ]);
    const logs = await p.getLogs({ address: addr, topics: [wanted] });
    assert.equal(logs.length, 1);
    assert.equal(logs[0].topics[0], wanted);
  });

  it("queryFilter only returns logs matching the event's topic0 (negative+positive)", async () => {
    logTest("queryFilter binds results to the event topic", {});
    await Initialize(null);
    const addr = "0x" + "11".repeat(32);
    const topic0 = new qc.Interface(eventAbi).getEventTopic("Transfer");
    const wrong = "0x" + "ee".repeat(32);
    const p = new LogProvider([
      { address: addr, topics: [topic0], data: "0x", blockNumber: "0x1" },
      { address: addr, topics: [wrong], data: "0x", blockNumber: "0x1" },
    ]);
    const contract = new qc.Contract(addr, eventAbi, p);
    const events = await contract.queryFilter("Transfer", 0, "latest");
    assert.equal(events.length, 1, "only the matching-topic log survives");
    assert.equal(events[0].topics[0], topic0);
  });
});
