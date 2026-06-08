/**
 * @testCategory security
 * @blockchainRequired false
 * @transactional false
 * @description The pure-JS ABI decoder must bound dynamic array/bytes/string
 *              lengths against the available data so a hostile RPC response cannot
 *              trigger huge allocations or silent truncation.
 */

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

const jsAbi = require("../../src/abi/js-abi-coder");
const { logSuite, logTest } = require("../verbose-logger");

function num(n) {
  return BigInt(n).toString(16).padStart(64, "0");
}

describe("Security: ABI decoder allocation bounds", () => {
  logSuite("Security: ABI decoder allocation bounds");

  it("rejects a dynamic array declaring more elements than the data can hold (negative)", () => {
    logTest("rejects an over-long dynamic array length", {});
    // head: offset(0x20) -> tail: huge length, no element data
    const data = "0x" + num(32) + num(1_000_000);
    assert.throws(
      () => jsAbi.decodeFunctionResult([{ type: "uint256[]" }], data),
      /array length exceeds available data/i,
    );
  });

  it("rejects dynamic bytes declaring more than the data can hold (negative)", () => {
    logTest("rejects an over-long bytes length", {});
    const data = "0x" + num(32) + num(1_000_000);
    assert.throws(
      () => jsAbi.decodeFunctionResult([{ type: "bytes" }], data),
      /bytes length exceeds available data/i,
    );
  });

  it("rejects a string declaring more than the data can hold (negative)", () => {
    logTest("rejects an over-long string length", {});
    const data = "0x" + num(32) + num(1_000_000);
    assert.throws(
      () => jsAbi.decodeFunctionResult([{ type: "string" }], data),
      /string length exceeds available data/i,
    );
  });

  it("decodes a well-formed dynamic array (positive)", () => {
    logTest("decodes a well-formed dynamic array", {});
    const data = "0x" + num(32) + num(2) + num(1) + num(2);
    const [arr] = jsAbi.decodeFunctionResult([{ type: "uint256[]" }], data);
    assert.deepEqual(arr, [1n, 2n]);
  });

  it("decodes well-formed dynamic bytes (positive)", () => {
    logTest("decodes well-formed dynamic bytes", {});
    // length 3, value 0x010203 left-aligned in the data word
    const data = "0x" + num(32) + num(3) + "010203".padEnd(64, "0");
    const [bytes] = jsAbi.decodeFunctionResult([{ type: "bytes" }], data);
    assert.equal(bytes, "0x010203");
  });
});

describe("Security: ABI decoder static reads, offset aliasing & fixed arrays", () => {
  logSuite("Security: ABI decoder static reads, offset aliasing & fixed arrays");

  it("rejects a static word read past the end of the data (negative)", () => {
    logTest("rejects an out-of-bounds static uint256 read", {});
    // Truncated data (10 bytes < one 32-byte word): previously _readWordAsBigInt
    // silently sliced a short array and returned a corrupted/zero value.
    const data = "0x" + "12".repeat(10);
    assert.throws(() => jsAbi.decodeFunctionResult([{ type: "uint256" }], data), /read past end of data/i);
  });

  it("rejects an out-of-bounds static address read (negative)", () => {
    logTest("rejects an out-of-bounds static address read", {});
    const data = "0x" + "12".repeat(10);
    assert.throws(() => jsAbi.decodeFunctionResult([{ type: "address" }], data), /read past end of data/i);
  });

  it("rejects a dynamic offset that points back into the head region / aliasing (negative)", () => {
    logTest("rejects a dynamic offset aliasing into the head", {});
    // Single dynamic param; head word holds offset 0 (< headSize 32).
    const data = "0x" + num(0);
    assert.throws(() => jsAbi.decodeFunctionResult([{ type: "bytes" }], data), /points into head region/i);
  });

  it("rejects a dynamic offset that points outside the data (negative)", () => {
    logTest("rejects a dynamic offset out of bounds", {});
    const data = "0x" + num(1_000_000);
    assert.throws(() => jsAbi.decodeFunctionResult([{ type: "bytes" }], data), /dynamic offset out of bounds/i);
  });

  it("rejects an enormous fixed-array dimension before allocating (negative)", () => {
    logTest("rejects an over-large fixed array length", {});
    const data = "0x" + num(1);
    assert.throws(
      () => jsAbi.decodeFunctionResult([{ type: "uint256[1000000000]" }], data),
      /fixed array length exceeds available data/i,
    );
  });

  it("decodes well-formed static values (positive)", () => {
    logTest("decodes well-formed static uint256 + address", {});
    const addrWord = "00".repeat(31) + "ab"; // 32-byte word ending in 0xab
    const data = "0x" + num(5) + addrWord;
    const [n, addr] = jsAbi.decodeFunctionResult([{ type: "uint256" }, { type: "address" }], data);
    assert.equal(n, 5n);
    assert.equal(typeof addr, "string");
    assert.ok(addr.toLowerCase().endsWith("ab"));
  });

  it("decodes a well-formed small fixed array (positive)", () => {
    logTest("decodes a well-formed uint256[2]", {});
    const data = "0x" + num(7) + num(8);
    const [arr] = jsAbi.decodeFunctionResult([{ type: "uint256[2]" }], data);
    assert.deepEqual(arr, [7n, 8n]);
  });
});
