/**
 * @testCategory unit
 * @blockchainRequired false
 * @transactional false
 * @description Internal hex utilities (optional params, edge cases)
 */
 
 const { describe, it } = require("node:test");
 const assert = require("node:assert/strict");
 
 const { normalizeHex, isHexString, hexToBytes, bytesToHex, arrayify } = require("../../src/internal/hex");
 
 describe("internal/hex", () => {
   it("normalizeHex lowercases, adds 0x, pads odd length", () => {
     assert.equal(normalizeHex("aa"), "0xaa");
    assert.equal(normalizeHex("0xAa"), "0xaa");
    assert.equal(normalizeHex("0xa"), "0x0a");
     assert.equal(normalizeHex("0x0A"), "0x0a");
   });
 
   it("isHexString validates and supports optional lengthBytes", () => {
     const h32 = "0x" + "11".repeat(32);
     assert.equal(isHexString(h32), true);
     assert.equal(isHexString(h32, 32), true);
     assert.equal(isHexString(h32, null), true); // optional param passed as null => ignored
     assert.equal(isHexString(h32, 31), false);
 
     assert.equal(isHexString("0x"), false);
     assert.equal(isHexString("0x0"), false); // odd length after 0x
     assert.equal(isHexString("0xzz"), false);
   });
 
   it("hexToBytes/bytesToHex roundtrip", () => {
     const h = "0x1234abcd";
     const b = hexToBytes(h);
     assert.ok(b instanceof Uint8Array);
     assert.equal(bytesToHex(b), h);
   });
 
   it("arrayify accepts hex string and Uint8Array; rejects others", () => {
     assert.deepEqual(arrayify("0x1234"), new Uint8Array([0x12, 0x34]));
     assert.deepEqual(arrayify(new Uint8Array([1, 2, 3])), new Uint8Array([1, 2, 3]));
     assert.throws(() => arrayify("not-hex"));
     assert.throws(() => arrayify(123));
   });
 });
 
