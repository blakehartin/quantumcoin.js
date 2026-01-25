/**
 * @testCategory unit
 * @blockchainRequired false
 * @transactional false
 * @description Encoding + units + RLP edge cases (optional params, negative paths)
 */
 
 const { describe, it } = require("node:test");
 const assert = require("node:assert/strict");
 
 const qc = require("../../index");
 
 describe("Encoding", () => {
   it("toHex/hexlify normalize strings and bytes", () => {
     assert.equal(qc.toHex("0x0A"), "0x0a");
     assert.equal(qc.hexlify(new Uint8Array([0x0a])), "0x0a");
   });
 
   it("concat concatenates and rejects non-array", () => {
     const out = qc.concat([new Uint8Array([1, 2]), "0x03"]);
     assert.equal(out, "0x010203");
     assert.throws(() => qc.concat("nope"));
   });
 
   it("stripZerosLeft removes leading zeros", () => {
     assert.equal(qc.stripZerosLeft("0x0000"), "0x");
     assert.equal(qc.stripZerosLeft("0x000001"), "0x01");
   });
 
   it("zeroPad throws when value exceeds length", () => {
     assert.throws(() => qc.zeroPad("0x1234", 1));
     assert.equal(qc.zeroPad("0x12", 2), "0x0012");
   });
 
   it("base64 encode/decode roundtrip", () => {
     const b = qc.toUtf8Bytes("hello");
     const b64 = qc.encodeBase64(b);
     const out = qc.decodeBase64(b64);
     assert.equal(qc.toUtf8String(out), "hello");
   });
 
   it("isBytesLike returns true for hex and Uint8Array", () => {
     assert.equal(qc.isBytesLike("0x1234"), true);
     assert.equal(qc.isBytesLike(new Uint8Array([1, 2, 3])), true);
     assert.equal(qc.isBytesLike("not-hex"), false);
   });
 
   it("solidityPacked helpers throw (not implemented)", () => {
     assert.throws(() => qc.solidityPacked(), /not implemented/i);
     assert.throws(() => qc.solidityPackedKeccak256(), /not implemented/i);
     assert.throws(() => qc.solidityPackedSha256(), /not implemented/i);
   });
 });
 
 describe("Units", () => {
   it("parseUnits defaults decimals when omitted vs null", () => {
     const a = qc.parseUnits("1.5");
     const b = qc.parseUnits("1.5", null);
     assert.equal(a, 1500000000000000000n);
     assert.equal(a, b);
   });
 
   it("formatUnits defaults decimals when omitted vs null", () => {
     const a = qc.formatUnits(1500000000000000000n);
     const b = qc.formatUnits(1500000000000000000n, null);
     assert.equal(a, "1.5");
     assert.equal(a, b);
   });
 });
 
 describe("RLP", () => {
   it("decodeRlp rejects non-string input", () => {
     assert.throws(() => qc.decodeRlp(123));
   });
 
   it("decodeRlp rejects trailing data", () => {
     const encoded = qc.encodeRlp("0x01");
     const withTrailing = "0x" + encoded.slice(2) + "00";
     assert.throws(() => qc.decodeRlp(withTrailing), /trailing data/i);
   });
 
   it("encodeRlp supports null as empty bytes", () => {
     const encoded = qc.encodeRlp(null);
     assert.ok(typeof encoded === "string" && encoded.startsWith("0x"));
     const decoded = qc.decodeRlp(encoded);
     assert.equal(decoded, "0x");
   });
 });
 
