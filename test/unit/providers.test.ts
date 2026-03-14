/**
 * @testCategory unit
 * @blockchainRequired false
 * @transactional false
 * @description Provider helpers, wrappers, defaults, and extra providers
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import qc from "../../index";
import { logSuite, logTest } from "../verbose-logger";

describe("JsonRpcProvider", () => {
  logSuite("JsonRpcProvider");
  it("defaults url/chainId when omitted vs null (no Initialize required)", () => {
    logTest("defaults url/chainId when omitted vs null (no Initialize required)", {});
    const p1 = new qc.JsonRpcProvider();
    const p2 = new qc.JsonRpcProvider(null, null);

    assert.equal(typeof p1.url, "string");
    assert.ok(p1.url.length > 0);
    assert.equal(p1.chainId, 123123);

    assert.equal(p2.url, p1.url);
    assert.equal(p2.chainId, 123123);
  });

  it("_perform defaults params when omitted vs null", async (t: { skip: (msg: string) => void }) => {
    logTest("_perform defaults params when omitted vs null", {});
    if (typeof (globalThis as unknown as { fetch?: unknown }).fetch !== "function") {
      t.skip("global fetch not available");
      return;
    }

    const originalFetch = (globalThis as unknown as { fetch: typeof fetch }).fetch;
    const seen: unknown[][] = [];

    (globalThis as unknown as { fetch: typeof fetch }).fetch = async (_url: string, init: RequestInit) => {
      const body = JSON.parse(init.body as string);
      seen.push(body.params);
      return {
        ok: true,
        json: async () => ({ jsonrpc: "2.0", id: body.id, result: "0x1" }),
      } as Response;
    };

    try {
      const p = new qc.JsonRpcProvider("http://example.invalid", 123123);
      const a = await p._perform("eth_blockNumber");
      const b = await p._perform("eth_blockNumber", null);
      assert.equal(a, "0x1");
      assert.equal(b, "0x1");
      assert.deepEqual(seen, [[], []]);
    } finally {
      (globalThis as unknown as { fetch: typeof fetch }).fetch = originalFetch;
    }
  });
});

describe("AbstractProvider defaults", () => {
  logSuite("AbstractProvider defaults");
  it("getTransactionCount/call/getCode default blockTag when omitted vs null", async () => {
    logTest("getTransactionCount/call/getCode default blockTag when omitted vs null", {});
    class P extends qc.AbstractProvider {
      calls: { method: string; params: unknown[] }[] = [];
      constructor() {
        super();
      }
      async _perform(method: string, params: unknown[]) {
        this.calls.push({ method, params });
        if (method === "eth_getTransactionCount") return "0x2";
        if (method === "eth_call") return "0x";
        if (method === "eth_getCode") return "0x";
        throw new Error("unexpected");
      }
    }

    const p = new P();
    await p.getTransactionCount("0x" + "11".repeat(32));
    await p.getTransactionCount("0x" + "11".repeat(32), null);
    await p.call({ to: "0x" + "11".repeat(32), data: "0x" });
    await p.call({ to: "0x" + "11".repeat(32), data: "0x" }, null);
    await p.getCode("0x" + "11".repeat(32));
    await p.getCode("0x" + "11".repeat(32), null);

    const tags = p.calls.map((c) => c.params[c.params.length - 1]);
    assert.deepEqual(tags, ["latest", "latest", "latest", "latest", "latest", "latest"]);
  });
});

describe("TransactionResponse.wait", () => {
  logSuite("TransactionResponse.wait");
  it("uses default confirmations when omitted vs null", async () => {
    logTest("uses default confirmations when omitted vs null", {});
    const fakeProvider = {
      getTransactionReceipt: async () => ({ blockNumber: 1 }),
      getBlockNumber: async () => 1,
    };
    const tx = new qc.TransactionResponse({ hash: "0x" + "11".repeat(32) }, fakeProvider as unknown as qc.Provider);
    const r1 = await tx.wait();
    const r2 = await tx.wait(null, null);
    assert.deepEqual(r1, { blockNumber: 1 });
    assert.deepEqual(r2, { blockNumber: 1 });
  });

  it("throws if provider missing", async () => {
    logTest("throws if provider missing", {});
    const tx = new qc.TransactionResponse({ hash: "0x" + "11".repeat(32) }, null);
    await assert.rejects(() => tx.wait(), (e: Error & { code?: string; message?: string }) => e && e.code === "UNKNOWN_ERROR" && /missing provider/i.test(e.message ?? ""));
  });
});

describe("getProvider", () => {
  logSuite("getProvider");
  it("returns JsonRpcProvider for http/https URLs", () => {
    logTest("returns JsonRpcProvider for http/https URLs", {});
    const p1 = qc.getProvider("https://public.rpc.quantumcoinapi.com", 123123);
    const p2 = qc.getProvider("http://localhost:8545");
    assert.ok(p1 instanceof qc.JsonRpcProvider);
    assert.ok(p2 instanceof qc.JsonRpcProvider);
    assert.equal(p1.url, "https://public.rpc.quantumcoinapi.com");
    assert.equal(p1.chainId, 123123);
  });

  it("returns WebSocketProvider for ws/wss URLs", () => {
    logTest("returns WebSocketProvider for ws/wss URLs", {});
    const p1 = qc.getProvider("ws://127.0.0.1:8546");
    const p2 = qc.getProvider("wss://example.com/ws", 1);
    assert.ok(p1 instanceof qc.WebSocketProvider);
    assert.ok(p2 instanceof qc.WebSocketProvider);
    assert.equal(p1.url, "ws://127.0.0.1:8546");
    assert.equal(p2.chainId, 1);
  });

  it("returns IpcSocketProvider for IPC paths", () => {
    logTest("returns IpcSocketProvider for IPC paths", {});
    const p = qc.getProvider("\\\\.\\pipe\\geth.ipc");
    assert.ok(p instanceof qc.IpcSocketProvider);
    assert.equal(p.path, "\\\\.\\pipe\\geth.ipc");
  });

  it("returns JsonRpcProvider with default url/chainId when endpoint omitted or empty", () => {
    logTest("returns JsonRpcProvider with default url/chainId when endpoint omitted or empty", {});
    const p1 = qc.getProvider();
    const p2 = qc.getProvider("");
    assert.ok(p1 instanceof qc.JsonRpcProvider);
    assert.ok(p2 instanceof qc.JsonRpcProvider);
    assert.ok(p1.url.length > 0);
    assert.equal(p1.chainId, 123123);
  });
});

describe("Extra providers", () => {
  logSuite("Extra providers");
  it("BrowserProvider requires an EIP-1193 provider with request()", () => {
    logTest("BrowserProvider requires an EIP-1193 provider with request()", {});
    assert.throws(() => new qc.BrowserProvider(null), (e: Error & { code?: string }) => e && e.code === "INVALID_ARGUMENT");
    assert.throws(() => new qc.BrowserProvider({}), (e: Error & { code?: string }) => e && e.code === "INVALID_ARGUMENT");
    const p = new qc.BrowserProvider({ request: async () => null });
    assert.ok(p);
  });

  it("WebSocketProvider requires a url and stores it", () => {
    logTest("WebSocketProvider requires a url and stores it", {});
    assert.throws(() => new qc.WebSocketProvider(), (e: Error & { code?: string }) => e && e.code === "INVALID_ARGUMENT");
    const p = new qc.WebSocketProvider("ws://127.0.0.1:8546 ");
    assert.equal(p.url, "ws://127.0.0.1:8546");
  });

  it("IpcSocketProvider requires a path and stores it", () => {
    logTest("IpcSocketProvider requires a path and stores it", {});
    assert.throws(() => new qc.IpcSocketProvider(), (e: Error & { code?: string }) => e && e.code === "INVALID_ARGUMENT");
    const p = new qc.IpcSocketProvider("\\\\.\\pipe\\geth.ipc");
    assert.equal(p.path, "\\\\.\\pipe\\geth.ipc");
  });

  it("FallbackProvider accepts single vs array and tries providers in order", async () => {
    logTest("FallbackProvider accepts single vs array and tries providers in order", {});
    const p1 = { _perform: async () => "0x10" };
    const fp1 = new qc.FallbackProvider(p1 as unknown as qc.Provider);
    const bn1 = await fp1.getBlockNumber();
    assert.equal(bn1, 16);

    const pFail = { _perform: async () => { throw new Error("fail"); } };
    const pOk = { _perform: async () => "0x02" };
    const fp2 = new qc.FallbackProvider([pFail, pOk] as unknown as qc.Provider[]);
    const bn2 = await fp2.getBlockNumber();
    assert.equal(bn2, 2);
  });

  it("FallbackProvider throws when no providers provided", () => {
    logTest("FallbackProvider throws when no providers provided", {});
    assert.throws(() => new qc.FallbackProvider([]));
  });
});
