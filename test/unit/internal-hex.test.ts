/**
 * @testCategory unit
 * @blockchainRequired false
 * @transactional false
 * @description Internal hex utilities (optional params, edge cases)
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { normalizeHex, toQuantityHex, toQuantity, isHexString, hexToBytes, bytesToHex, arrayify } from "../../src/internal/hex";
import { logSuite, logTest } from "../verbose-logger";

describe("internal/hex", () => {
  logSuite("internal/hex");
  it("normalizeHex lowercases, adds 0x, pads odd length", () => {
    logTest("normalizeHex lowercases, adds 0x, pads odd length", {});
    assert.equal(normalizeHex("aa"), "0xaa");
    assert.equal(normalizeHex("0xAa"), "0xaa");
    assert.equal(normalizeHex("0xa"), "0x0a");
    assert.equal(normalizeHex("0x0A"), "0x0a");
  });

  it("toQuantityHex produces spec-compliant quantities (no leading zeros, 0x0 for zero)", () => {
    logTest("toQuantityHex produces spec-compliant quantities", {});
    assert.equal(toQuantityHex(0), "0x0");
    assert.equal(toQuantityHex(0n), "0x0");
    assert.equal(toQuantityHex(1), "0x1");
    assert.equal(toQuantityHex(5), "0x5");
    assert.equal(toQuantityHex(15), "0xf");
    assert.equal(toQuantityHex(16), "0x10");
    assert.equal(toQuantityHex(255), "0xff");
    assert.equal(toQuantityHex(256), "0x100");
    assert.equal(toQuantityHex(4095), "0xfff");
    assert.equal(toQuantityHex(4096), "0x1000");
    assert.equal(toQuantityHex(65535n), "0xffff");
    assert.equal(toQuantityHex(2n ** 64n), "0x10000000000000000");

    assert.equal(toQuantity, toQuantityHex);
    assert.equal(toQuantity(5), "0x5");
  });

  it("toQuantityHex rejects invalid inputs", () => {
    logTest("toQuantityHex rejects invalid inputs", {});
    assert.throws(() => toQuantityHex(-1), RangeError);
    assert.throws(() => toQuantityHex(-1n), RangeError);
    assert.throws(() => toQuantityHex(1.5), TypeError);
    assert.throws(() => toQuantityHex(NaN), TypeError);
    assert.throws(() => toQuantityHex(Infinity), TypeError);
    assert.throws(() => toQuantityHex("5" as unknown as number), TypeError);
    assert.throws(() => toQuantityHex(null as unknown as number), TypeError);
    assert.throws(() => toQuantityHex(undefined as unknown as number), TypeError);
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
    assert.throws(() => arrayify(123 as unknown));
  });
});
