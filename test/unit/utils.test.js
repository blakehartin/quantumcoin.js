/**
 * @testCategory unit
 * @blockchainRequired false
 * @transactional false
 * @description Utility helpers (units, encoding, hashing, rlp, abi coder)
 */

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

const { Initialize } = require("../../config");
const qc = require("../../index");

describe("Utils", () => {
  it("parseEther/formatEther roundtrip", () => {
    const wei = qc.parseEther("1.5");
    assert.equal(wei, 1500000000000000000n);
    assert.equal(qc.formatEther(wei), "1.5");
  });

  it("encodeBytes32String/decodeBytes32String roundtrip", () => {
    const hex = qc.encodeBytes32String("hello");
    assert.equal(hex.length, 66);
    assert.equal(qc.decodeBytes32String(hex), "hello");
  });

  it("base58 encode/decode roundtrip", () => {
    const bytes = qc.toUtf8Bytes("hello world");
    const b58 = qc.encodeBase58(bytes);
    const out = qc.decodeBase58(b58);
    assert.equal(qc.toUtf8String(out), "hello world");
  });

  it("RLP encode/decode roundtrip (ethers-style bytes)", () => {
    const value = ["0x68656c6c6f", "0x7b", "0x01"];
    const encoded = qc.encodeRlp(value);
    assert.ok(typeof encoded === "string" && encoded.startsWith("0x"));
    const decoded = qc.decodeRlp(encoded);
    assert.deepEqual(decoded, value);
  });

  it("AbiCoder encode/decode roundtrip", async () => {
    await Initialize(null);
    const coder = new qc.AbiCoder();
    const data = coder.encode(["uint256", "bool", "string"], [123n, true, "hello"]);
    assert.ok(typeof data === "string" && data.startsWith("0x"));
    const decoded = coder.decode(["uint256", "bool", "string"], data);
    // qcsdk returns JSON array, so we accept array-like output
    assert.equal(decoded[0].toString(), "123");
    assert.equal(Boolean(decoded[1]), true);
    assert.equal(decoded[2], "hello");
  });
});

