/**
 * @testCategory unit
 * @blockchainRequired false
 * @transactional false
 * @description Contract behavior that can be tested offline (overrides, listeners)
 */
 
 const { describe, it } = require("node:test");
 const assert = require("node:assert/strict");
 
 const { Initialize } = require("../../config");
 const qc = require("../../index");
 
 describe("Contract", () => {
   it("_invoke treats last arg as overrides only when object-like (null is NOT overrides)", async () => {
     await Initialize(null);
     const addr = qc.Wallet.createRandom().address;
     const abi = [
       { type: "function", name: "viewFn", stateMutability: "view", inputs: [{ name: "x", type: "uint256" }], outputs: [] },
       { type: "function", name: "writeFn", stateMutability: "nonpayable", inputs: [{ name: "x", type: "uint256" }], outputs: [] },
     ];
 
     const c = new qc.Contract(addr, abi, null);
 
     /** @type {any[]} */
     const seen = [];
     c.call = async (methodName, args, overrides) => {
       seen.push({ kind: "call", methodName, args, overrides });
       return "ok";
     };
     c.send = async (methodName, args, overrides) => {
       seen.push({ kind: "send", methodName, args, overrides });
       return { hash: "0x" + "22".repeat(32) };
     };
 
     // Overrides object extracted
     await c._invoke("viewFn", [1n, { gasLimit: 123 }]);
     // Passing null is NOT treated as overrides (it becomes a second argument)
     await c._invoke("viewFn", [1n, null]);
     // State-changing path chooses send()
     await c._invoke("writeFn", [1n, { gasLimit: 456 }]);
 
     assert.deepEqual(seen[0], { kind: "call", methodName: "viewFn", args: [1n], overrides: { gasLimit: 123 } });
     assert.deepEqual(seen[1], { kind: "call", methodName: "viewFn", args: [1n, null], overrides: undefined });
     assert.deepEqual(seen[2], { kind: "send", methodName: "writeFn", args: [1n], overrides: { gasLimit: 456 } });
   });
 
   it("removeAllListeners clears all when event omitted vs null, and clears one event when provided", async () => {
     await Initialize(null);
     const addr = qc.Wallet.createRandom().address;
     const c = new qc.Contract(addr, [], null);
 
     const cb1 = () => {};
     const cb2 = () => {};
     c.on("A", cb1);
     c.on("B", cb2);
 
     c.removeAllListeners("A");
     // B remains
     assert.equal(c._listeners.get("A")?.length || 0, 0);
     assert.equal(c._listeners.get("B")?.length || 0, 1);
 
     c.removeAllListeners(null); // treated as "no event"
     assert.equal(c._listeners.size, 0);
 
     c.on("C", cb1);
     c.removeAllListeners(); // omitted => clear all
     assert.equal(c._listeners.size, 0);
   });
 });
 
 describe("ContractTransactionReceipt", () => {
   it("getEvent/getEvents filter logs by eventName", () => {
     const receipt = new qc.ContractTransactionReceipt({
       logs: [{ eventName: "A", data: 1 }, { eventName: "B", data: 2 }, { eventName: "A", data: 3 }],
     });
     assert.deepEqual(receipt.getEvents("A").map((l) => l.data), [1, 3]);
     assert.equal(receipt.getEvent("B").data, 2);
     assert.equal(receipt.getEvent("Missing"), null);
   });
 });
 
