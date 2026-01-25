/**
 * @testCategory unit
 * @blockchainRequired false
 * @transactional false
 * @description Result utility (optional params, deep conversions)
 */
 
 const { describe, it } = require("node:test");
 const assert = require("node:assert/strict");
 
 const qc = require("../../index");
 
 describe("Result", () => {
   it("constructor supports items omitted vs provided and keys omitted vs null", () => {
     const r1 = new qc.Result();
     const r2 = new qc.Result(undefined, undefined);
     const r3 = new qc.Result([], null);
 
     assert.deepEqual(r1.toArray(), []);
     assert.deepEqual(r2.toArray(), []);
     assert.deepEqual(r3.toArray(), []);
     assert.deepEqual(r1.toObject(), {});
   });
 
   it("maps named keys onto indices and supports getValue()", () => {
     const r = new qc.Result([1, 2], ["a", "b"]);
     assert.equal(r.a, 1);
     assert.equal(r.b, 2);
     assert.equal(r.getValue("a"), 1);
   });
 
   it("toArray/toObject support deep=true (optional param omitted vs null)", () => {
     const inner = new qc.Result([1], ["x"]);
     const outer = new qc.Result([inner], ["inner"]);
 
     assert.deepEqual(outer.toArray(), [inner]);
     assert.deepEqual(outer.toArray(null), [inner]); // deep omitted behavior
     assert.deepEqual(outer.toArray(true), [[1]]);
 
     assert.deepEqual(outer.toObject(), { inner });
     assert.deepEqual(outer.toObject(null), { inner }); // deep omitted behavior
     assert.deepEqual(outer.toObject(true), { inner: { x: 1 } });
   });
 
   it("fromItems creates a Result and checkResultErrors returns []", () => {
     const r = qc.Result.fromItems([1, 2], ["a", "b"]);
     assert.ok(r instanceof qc.Result);
     assert.deepEqual(qc.checkResultErrors(r), []);
   });

  it("checkResultErrors finds Error instances and returns paths (nested Result)", () => {
    const e1 = new Error("outer");
    const e2 = new Error("inner");

    const inner = new qc.Result([e2], ["x"]);
    const outer = new qc.Result([e1, inner], ["a", "b"]);

    const errs = qc.checkResultErrors(outer);
    assert.equal(errs.length, 2);
    assert.equal(errs[0].error, e1);
    assert.deepEqual(errs[0].path, ["a"]);
    assert.equal(errs[1].error, e2);
    assert.deepEqual(errs[1].path, ["b", "x"]);
  });

  it("checkResultErrors walks plain objects (struct-like) and is cycle-safe", () => {
    const e = new Error("boom");
    const obj = { foo: { bar: e } };
    obj.self = obj;

    const errs = qc.checkResultErrors(obj);
    assert.equal(errs.length, 1);
    assert.equal(errs[0].error, e);
    assert.deepEqual(errs[0].path, ["foo", "bar"]);
  });
 });
 
