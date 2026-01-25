/**
 * @testCategory security
 * @blockchainRequired false
 * @transactional false
 * @description Security tests for malformed input, edge cases, and invalid values
 */

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

const { Initialize } = require("../../config");
const qc = require("../../index");

describe("Security: Malformed Input", () => {
  it("rejects invalid address length and characters", async () => {
    await Initialize(null);
    assert.equal(qc.isAddress("0x1234"), false);
    assert.equal(qc.isAddress("not-an-address"), false);
    assert.throws(() => qc.getAddress("0x1234"), /invalid address/i);
  });

  it("rejects too-long bytes32 strings", () => {
    assert.throws(() => qc.encodeBytes32String("x".repeat(33)), /max 32/i);
  });

  it("rejects invalid parseUnits inputs", () => {
    assert.throws(() => qc.parseUnits("", 18), /invalid/i);
    assert.throws(() => qc.parseUnits("1.234", 2), /exceeds decimals/i);
  });
});

