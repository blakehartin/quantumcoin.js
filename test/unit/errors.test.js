/**
 * @testCategory unit
 * @blockchainRequired false
 * @transactional false
 * @description Error helpers and error classes (direct coverage)
 */
 
 const { describe, it } = require("node:test");
 const assert = require("node:assert/strict");
 
 const qc = require("../../index");
 
 describe("Errors", () => {
   it("makeError sets code and shortMessage (info omitted vs null)", () => {
     const e1 = qc.makeError("boom", "UNKNOWN_ERROR");
     const e2 = qc.makeError("boom", "UNKNOWN_ERROR", null);
 
     assert.equal(e1.code, "UNKNOWN_ERROR");
     assert.equal(e1.shortMessage, "boom");
     assert.equal(e2.code, "UNKNOWN_ERROR");
     assert.equal(e2.shortMessage, "boom");
   });
 
   it("makeError attaches info and protects message/code/name", () => {
    const e = qc.makeError("boom", "UNKNOWN_ERROR", { operation: "x" });
     assert.equal(e.code, "UNKNOWN_ERROR");
     assert.equal(e.shortMessage, "boom");
     assert.equal(e.operation, "x");
 
     assert.throws(() => qc.makeError("boom", "UNKNOWN_ERROR", { message: "nope" }));
     assert.throws(() => qc.makeError("boom", "UNKNOWN_ERROR", { code: "NOPE" }));
     assert.throws(() => qc.makeError("boom", "UNKNOWN_ERROR", { name: "Nope" }));
    // shortMessage is defined read-only by makeError; passing it via info causes a TypeError
    assert.throws(() => qc.makeError("boom", "UNKNOWN_ERROR", { shortMessage: "nope" }));
   });
 
   it("assert and assertArgument throw INVALID_ARGUMENT with metadata", () => {
     assert.throws(
       () => qc.assert(false, "bad", "INVALID_ARGUMENT", { operation: "test" }),
       (err) => err && err.code === "INVALID_ARGUMENT" && String(err.message).includes("operation"),
     );
 
     assert.throws(
       () => qc.assertArgument(false, "bad arg", "foo", 123),
       (err) => err && err.code === "INVALID_ARGUMENT" && err.argument === "foo" && err.value === 123,
     );
   });
 
   it("isError and isCallException match code", () => {
     const err = qc.makeError("x", "CALL_EXCEPTION");
     assert.equal(qc.isError(err, "CALL_EXCEPTION"), true);
     assert.equal(qc.isCallException(err), true);
     assert.equal(qc.isCallException(qc.makeError("x", "UNKNOWN_ERROR")), false);
   });
 
   it("ProviderError/TransactionError/ContractError set code and include info (info omitted vs null)", () => {
     const p1 = new qc.ProviderError("p");
     const p2 = new qc.ProviderError("p", null);
     const p3 = new qc.ProviderError("p", { operation: "op" });
     assert.equal(p1.code, "UNKNOWN_ERROR");
     assert.equal(p1.shortMessage, "p");
     assert.equal(p2.code, "UNKNOWN_ERROR");
     assert.equal(p3.operation, "op");
 
     const t1 = new qc.TransactionError("t", { reason: "r" });
     assert.equal(t1.code, "UNKNOWN_ERROR");
     assert.equal(t1.reason, "r");
 
     const c1 = new qc.ContractError("c", { contract: "X" });
     assert.equal(c1.code, "UNKNOWN_ERROR");
     assert.equal(c1.contract, "X");
   });
 });
 
