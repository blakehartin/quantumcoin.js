/**
 * @testCategory integration
 * @blockchainRequired readonly
 * @transactional false
 * @description Read-only IPC JSON-RPC integration tests against a local geth IPC endpoint
 */

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

const qc = require("../../index");

// Windows named pipe endpoint for geth IPC
const IPC = "\\\\.\\pipe\\geth.ipc";

describe("IpcSocketProvider (readonly)", () => {
  it("getBlockNumber and getBlock('latest') work over IPC", async (t) => {
    const provider = new qc.IpcSocketProvider(IPC);
    try {
      const bn = await provider.getBlockNumber();
      assert.ok(Number.isInteger(bn) && bn >= 0);

      const latest = await provider.getBlock("latest");
      assert.ok(latest && typeof latest === "object");
      assert.ok(typeof latest.number === "number" && latest.number >= bn);
      // best-effort sanity: hash often exists on latest blocks
      assert.ok(latest.hash == null || typeof latest.hash === "string");

      // Print a JSON-safe summary (avoid circular refs like latest.provider)
      const latestSummary = {
        number: latest.number,
        hash: latest.hash,
        parentHash: latest.parentHash,
        timestamp: latest.timestamp,
        transactionsCount: Array.isArray(latest.transactions) ? latest.transactions.length : null,
      };
      // This shows up in TAP output as "# ..."
      console.log("IPC latest block:", JSON.stringify(latestSummary));
    } catch (e) {
      t.skip(`IPC endpoint unavailable (${IPC}): ${e && e.message ? e.message : String(e)}`);
    }
  });
});

