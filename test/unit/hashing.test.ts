/**
 * @testCategory unit
 * @blockchainRequired false
 * @transactional false
 * @description Hashing helpers (optional params, deterministic behavior)
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import qc from "../../index";
import { logSuite, logTest } from "../verbose-logger";

describe("Hashing", () => {
  logSuite("Hashing");
  it("keccak256 returns a 32-byte hex digest for empty bytes", () => {
    logTest("keccak256 returns a 32-byte hex digest for empty bytes", {});
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

  it("hashMessage follows EIP-191 / ethers.js pattern (prefix + length + message, keccak256)", () => {
    // Known digest from ethers.js hashMessage("Hello World")
    const expectedHelloWorld = "0xa1de988600a42c4b4ab089b619297c17d53cffae5d5120d82d8a92d0bb3b78f2";
    assert.equal(qc.hashMessage("Hello World"), expectedHelloWorld);
    // String and UTF-8 bytes of same content produce the same digest
    assert.equal(qc.hashMessage("Hello World"), qc.hashMessage(qc.toUtf8Bytes("Hello World")));
    // Empty message
    const emptyDigest = qc.hashMessage("");
    assert.ok(emptyDigest.startsWith("0x") && emptyDigest.length === 66);
  });
});
