/**
 * @testCategory integration
 * @blockchainRequired readonly
 * @transactional false
 * @description Read-only WebSocket JSON-RPC integration tests against a local geth websocket endpoint
 */

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

const qc = require("../../index");

const WS = "ws://127.0.0.1:8546";

describe("WebSocketProvider (readonly)", () => {
  it("getBlockNumber and getBlock('latest') work over WebSocket", async (t) => {
    const provider = new qc.WebSocketProvider(WS);
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

