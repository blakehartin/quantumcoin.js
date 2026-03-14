/**
 * @testCategory unit
 * @blockchainRequired false
 * @transactional false
 * @description SDK initialization and basic constants
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { Initialize, isInitialized, Config } from "../../config";
import qc from "../../index";
import { logSuite, logTest } from "../verbose-logger";

describe("Initialize()", () => {
  logSuite("Initialize()");
  it("initializes with default config (null)", async () => {
    logTest("initializes with default config (null)", {});
    const ok = await Initialize(null);
    assert.equal(ok, true);
    assert.equal(isInitialized(), true);
  });

  it("exposes constants with QuantumCoin address size", async () => {
    await Initialize(null);
    assert.equal(typeof qc.version, "string");
    assert.equal(qc.ZeroAddress.length, 66);
    assert.equal(qc.ZeroHash.length, 66);
    assert.equal(qc.ZeroAddress, "0x" + "00".repeat(32));
    assert.equal(qc.WeiPerEther, 1000000000000000000n);
  });

  it("Config defaults match SPEC.md", () => {
    const cfg = new Config();
    assert.equal(cfg.chainId, 123123);
    assert.equal(cfg.rpcEndpoint, "https://public.rpc.quantumcoinapi.com");
  });
});
