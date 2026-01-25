/**
 * @testCategory unit
 * @blockchainRequired false
 * @transactional false
 * @description Provider helpers, wrappers, defaults, and extra providers
 */
 
 const { describe, it } = require("node:test");
 const assert = require("node:assert/strict");
 
 const qc = require("../../index");
 
 describe("JsonRpcProvider", () => {
   it("defaults url/chainId when omitted vs null (no Initialize required)", () => {
     const p1 = new qc.JsonRpcProvider();
     const p2 = new qc.JsonRpcProvider(null, null);
 
     assert.equal(typeof p1.url, "string");
     assert.ok(p1.url.length > 0);
     assert.equal(p1.chainId, 123123);
 
     assert.equal(p2.url, p1.url);
     assert.equal(p2.chainId, 123123);
   });
 
   it("_perform defaults params when omitted vs null", async (t) => {
     if (typeof fetch !== "function") {
       t.skip("global fetch not available");
       return;
     }
 
     const originalFetch = fetch;
     /** @type {any[]} */
     const seen = [];
 
     global.fetch = async (_url, init) => {
       const body = JSON.parse(init.body);
       seen.push(body.params);
       return {
         ok: true,
         json: async () => ({ jsonrpc: "2.0", id: body.id, result: "0x1" }),
       };
     };
 
     try {
       const p = new qc.JsonRpcProvider("http://example.invalid", 123123);
       const a = await p._perform("eth_blockNumber");
       const b = await p._perform("eth_blockNumber", null);
       assert.equal(a, "0x1");
       assert.equal(b, "0x1");
       assert.deepEqual(seen, [[], []]);
     } finally {
       global.fetch = originalFetch;
     }
   });
 });
 
 describe("AbstractProvider defaults", () => {
   it("getTransactionCount/call/getCode default blockTag when omitted vs null", async () => {
     class P extends qc.AbstractProvider {
       constructor() {
         super();
         this.calls = [];
       }
       async _perform(method, params) {
         this.calls.push({ method, params });
         if (method === "eth_getTransactionCount") return "0x2";
         if (method === "eth_call") return "0x";
         if (method === "eth_getCode") return "0x";
         throw new Error("unexpected");
       }
     }
 
     const p = new P();
     await p.getTransactionCount("0x" + "11".repeat(32));
     await p.getTransactionCount("0x" + "11".repeat(32), null);
     await p.call({ to: "0x" + "11".repeat(32), data: "0x" });
     await p.call({ to: "0x" + "11".repeat(32), data: "0x" }, null);
     await p.getCode("0x" + "11".repeat(32));
     await p.getCode("0x" + "11".repeat(32), null);
 
     const tags = p.calls.map((c) => c.params[c.params.length - 1]);
     // All these methods use `blockTag || "latest"`, so omitted/null => "latest"
     assert.deepEqual(tags, ["latest", "latest", "latest", "latest", "latest", "latest"]);
   });
 });
 
 describe("TransactionResponse.wait", () => {
   it("uses default confirmations when omitted vs null", async () => {
     const fakeProvider = {
       getTransactionReceipt: async () => ({ blockNumber: 1 }),
       getBlockNumber: async () => 1,
     };
     const tx = new qc.TransactionResponse({ hash: "0x" + "11".repeat(32) }, fakeProvider);
     const r1 = await tx.wait();
     const r2 = await tx.wait(null, null);
     assert.deepEqual(r1, { blockNumber: 1 });
     assert.deepEqual(r2, { blockNumber: 1 });
   });
 
   it("throws if provider missing", async () => {
     const tx = new qc.TransactionResponse({ hash: "0x" + "11".repeat(32) }, null);
     await assert.rejects(() => tx.wait(), (e) => e && e.code === "UNKNOWN_ERROR" && /missing provider/i.test(e.message));
   });
 });
 
 describe("Extra providers", () => {
  it("BrowserProvider requires an EIP-1193 provider with request()", () => {
     assert.throws(() => new qc.BrowserProvider(null), (e) => e && e.code === "INVALID_ARGUMENT");
     assert.throws(() => new qc.BrowserProvider({}), (e) => e && e.code === "INVALID_ARGUMENT");
     const p = new qc.BrowserProvider({ request: async () => null });
     assert.ok(p);
   });
 
 it("WebSocketProvider requires a url and stores it", () => {
   assert.throws(() => new qc.WebSocketProvider(), (e) => e && e.code === "INVALID_ARGUMENT");
   const p = new qc.WebSocketProvider("ws://127.0.0.1:8546 ");
   assert.equal(p.url, "ws://127.0.0.1:8546");
 });

  it("IpcSocketProvider requires a path and stores it", () => {
    assert.throws(() => new qc.IpcSocketProvider(), (e) => e && e.code === "INVALID_ARGUMENT");
    const p = new qc.IpcSocketProvider("\\\\.\\pipe\\geth.ipc");
    assert.equal(p.path, "\\\\.\\pipe\\geth.ipc");
  });

   it("FallbackProvider accepts single vs array and tries providers in order", async () => {
     const p1 = { _perform: async () => "0x10" };
     const fp1 = new qc.FallbackProvider(p1);
     const bn1 = await fp1.getBlockNumber();
     assert.equal(bn1, 16);
 
     const pFail = { _perform: async () => { throw new Error("fail"); } };
     const pOk = { _perform: async () => "0x02" };
     const fp2 = new qc.FallbackProvider([pFail, pOk]);
     const bn2 = await fp2.getBlockNumber();
     assert.equal(bn2, 2);
   });
 
   it("FallbackProvider throws when no providers provided", () => {
     assert.throws(() => new qc.FallbackProvider([]));
   });
 });
 
