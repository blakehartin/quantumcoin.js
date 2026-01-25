/**
 * @testCategory unit
 * @blockchainRequired false
 * @transactional false
 * @description ABI fragments + Interface (optional params, not-implemented stubs)
 */
 
 const { describe, it } = require("node:test");
 const assert = require("node:assert/strict");
 
 const { Initialize } = require("../../config");
 const qc = require("../../index");
 
 describe("ABI fragments", () => {
   it("Fragment defaults inputs/outputs and format ignores optional format param", () => {
     const f = new qc.Fragment({ type: "function", name: "foo" });
     assert.deepEqual(f.inputs, []);
     assert.deepEqual(f.outputs, []);
     assert.equal(typeof f.format(), "string");
     assert.equal(typeof f.format("full"), "string");
     assert.equal(f.format(null), f.format());
   });
 });
 
 describe("Interface", () => {
   it("constructor accepts null ABI and format ignores optional format param", () => {
     const i1 = new qc.Interface(null);
     assert.equal(i1.formatJson(), "[]");
     assert.equal(i1.format(), "[]");
     assert.equal(i1.format("full"), "[]");
     assert.equal(i1.format(null), "[]");
   });
 
   it("getFunction/getEvent/getError/getConstructor behave as expected", () => {
     const abi = [
       { type: "function", name: "foo", inputs: [], outputs: [] },
       { type: "event", name: "E", inputs: [], anonymous: false },
       { type: "error", name: "Bad", inputs: [] },
       { type: "constructor", inputs: [{ name: "x", type: "uint256" }] },
     ];
     const iface = new qc.Interface(abi);
     assert.ok(iface.getFunction("foo") instanceof qc.FunctionFragment);
     assert.ok(iface.getEvent("E") instanceof qc.EventFragment);
     assert.ok(iface.getError("Bad") instanceof qc.ErrorFragment);
     assert.ok(iface.getConstructor() instanceof qc.ConstructorFragment);
     assert.throws(() => iface.getFunction("missing"));
   });
 
   it("encodeFunctionData accepts values omitted vs null vs [] for zero-arg functions", async () => {
     await Initialize(null);
     const abi = [{ type: "function", name: "foo", inputs: [], outputs: [] }];
     const iface = new qc.Interface(abi);
 
     const a = iface.encodeFunctionData("foo");
     const b = iface.encodeFunctionData("foo", null);
     const c = iface.encodeFunctionData("foo", []);
     const d = iface.encodeFunctionData(iface.getFunction("foo"), []);
 
     assert.equal(typeof a, "string");
     assert.ok(a.startsWith("0x"));
     assert.equal(a, b);
     assert.equal(a, c);
     assert.equal(a, d);
   });
 
   it("encodeEventLog accepts values omitted vs null vs [] for zero-arg events", async () => {
     await Initialize(null);
     const abi = [{ type: "event", name: "E", inputs: [], anonymous: false }];
     const iface = new qc.Interface(abi);
 
     const a = iface.encodeEventLog("E");
     const b = iface.encodeEventLog("E", null);
     const c = iface.encodeEventLog("E", []);
 
     assert.ok(a && Array.isArray(a.topics));
     assert.equal(typeof a.data, "string");
     assert.deepEqual(a, b);
     assert.deepEqual(a, c);
   });
 
   it("not-implemented Interface methods throw NOT_IMPLEMENTED", () => {
     const iface = new qc.Interface([]);
     assert.throws(() => iface.parseTransaction(), (e) => e && e.code === "NOT_IMPLEMENTED");
     assert.throws(() => iface.parseError(), (e) => e && e.code === "NOT_IMPLEMENTED");
     assert.throws(() => iface.getSighash(), (e) => e && e.code === "NOT_IMPLEMENTED");
     assert.throws(() => iface.getEventTopic(), (e) => e && e.code === "NOT_IMPLEMENTED");
     assert.equal(iface.getFallback(), null);
     assert.equal(iface.getReceive(), null);
   });
 });
 
 describe("AbiCoder", () => {
   it("getDefaultValue returns array of nulls", () => {
     const coder = new qc.AbiCoder();
     assert.deepEqual(coder.getDefaultValue(["uint256", "bool"]), [null, null]);
   });
 });
 
