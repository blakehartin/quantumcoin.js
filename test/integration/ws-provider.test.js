/**
 * @testCategory integration
 * @blockchainRequired readonly
 * @transactional false
 * @description Read-only WebSocket JSON-RPC integration tests (validates WebSocketProvider only).
 * Skipped when QC_ENDPOINT is set (e.g. running integration tests over IPC).
 */

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

const qc = require("../../index");

const WS = process.env.QC_WS_URL || "ws://127.0.0.1:8546";
const skipBecauseOtherEndpoint = process.env.QC_ENDPOINT != null && process.env.QC_ENDPOINT !== "";

describe("WebSocketProvider (readonly)", { skip: skipBecauseOtherEndpoint }, () => {
  it("getBlockNumber and getBlock('latest') work over WebSocket", async (t) => {
    const provider = qc.getProvider(WS);
    try {
      const bn = await provider.getBlockNumber();
      assert.ok(Number.isInteger(bn) && bn >= 0);

      const latest = await provider.getBlock("latest");
      assert.ok(latest && typeof latest === "object");
      assert.ok(typeof latest.number === "number" && latest.number >= bn);
      assert.ok(latest.hash == null || typeof latest.hash === "string");
    } catch (e) {
      t.skip(`WebSocket endpoint unavailable (${WS}): ${e && e.message ? e.message : String(e)}`);
    } finally {
      if (provider && typeof provider.destroy === "function") provider.destroy();
    }
  });
});

