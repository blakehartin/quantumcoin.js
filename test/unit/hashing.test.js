/**
 * @testCategory unit
 * @blockchainRequired false
 * @transactional false
 * @description Hashing helpers (optional params, deterministic behavior)
 */
 
 const { describe, it } = require("node:test");
 const assert = require("node:assert/strict");
 
 const qc = require("../../index");
 
 describe("Hashing", () => {
   it("keccak256 returns a 32-byte hex digest for empty bytes", () => {
     const out = qc.keccak256(new Uint8Array([]));
     assert.equal(typeof out, "string");
     assert.ok(out.startsWith("0x"));
     assert.equal(out.length, 66);
   });
 
   it("sha256/sha512/ripemd160 output lengths are correct", () => {
     const data = qc.toUtf8Bytes("hello");
     assert.equal(qc.sha256(data).length, 66);
     assert.equal(qc.sha512(data).length, 130);
     assert.equal(qc.ripemd160(data).length, 42);
   });
 
   it("randomBytes returns requested length", () => {
     const b = qc.randomBytes(16);
     assert.ok(b instanceof Uint8Array);
     assert.equal(b.length, 16);
   });
 
   it("pbkdf2 algorithm defaults when omitted vs null vs explicit", () => {
     const pw = qc.toUtf8Bytes("password");
     const salt = qc.toUtf8Bytes("salt");
 
     const a = qc.pbkdf2(pw, salt, 1, 32);
     const b = qc.pbkdf2(pw, salt, 1, 32, "sha256");
     const c = qc.pbkdf2(pw, salt, 1, 32, null);
 
     assert.equal(a, b);
     assert.equal(a, c);
     assert.ok(a.startsWith("0x") && a.length === 66);
   });
 
   it("computeHmac produces a hex string", () => {
     const key = qc.toUtf8Bytes("key");
     const data = qc.toUtf8Bytes("data");
     const out = qc.computeHmac("sha256", key, data);
     assert.ok(typeof out === "string" && out.startsWith("0x") && out.length === 66);
   });
 });
 
