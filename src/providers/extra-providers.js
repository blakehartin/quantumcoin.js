/**
 * @fileoverview Additional provider classes (compatibility stubs).
 *
 * These are included to match the API shape described in SPEC.md. Only
 * JsonRpcProvider is fully implemented for network operations.
 */

const { AbstractProvider } = require("./provider");
const { JsonRpcProvider } = require("./json-rpc-provider");
const { makeError } = require("../errors");
const net = require("node:net");
const { JsonRpcSigner } = require("../wallet/wallet");
const { normalizeHex, isHexString } = require("../internal/hex");

let _wsRpcId = 1;
let _ipcRpcId = 1;

/**
 * Extract the first complete JSON object from a stream buffer.
 *
 * geth's IPC JSON-RPC typically uses newline-delimited JSON, but we also support
 * non-newline framing by scanning for balanced braces and respecting strings.
 *
 * @param {string} buffer
 * @returns {{ json: string, rest: string } | null}
 */
function _extractFirstJsonObject(buffer) {
  const start = buffer.indexOf("{");
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = start; i < buffer.length; i++) {
    const ch = buffer[i];

    if (inString) {
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === "\\") {
        escape = true;
        continue;
      }
      if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }

    if (ch === "{") depth++;
    if (ch === "}") depth--;

    if (depth === 0) {
      const json = buffer.slice(start, i + 1);
      const rest = buffer.slice(i + 1);
      return { json, rest };
    }
  }

  return null;
}

class WebSocketProvider extends AbstractProvider {
  /**
   * Create a WebSocket JSON-RPC provider.
   *
   * This uses the built-in global `WebSocket` available in recent Node.js
   * versions (via undici). No additional npm dependencies are required.
   *
   * @param {string} url WebSocket endpoint (e.g. ws://127.0.0.1:8546)
   * @param {number=} chainId Optional chain id (compat)
   */
  constructor(url, chainId) {
    super();
    if (typeof url !== "string" || url.trim().length === 0) {
      throw makeError("missing WebSocket url", "INVALID_ARGUMENT", { url });
    }
    this.url = url.trim();
    this.chainId = chainId == null ? 123123 : chainId;

    /** @type {any|null} */
    this._ws = null;
    /** @type {Promise<void>|null} */
    this._wsReady = null;
    /** @type {Map<number, { resolve: Function, reject: Function, timer: any }>} */
    this._pending = new Map();
  }

  /**
   * Close the underlying WebSocket connection and reject any pending requests.
   * This is important for tests so the Node.js event loop can exit cleanly.
   */
  destroy() {
    try {
      if (this._ws && typeof this._ws.close === "function") this._ws.close();
    } catch {
      // ignore
    }
    this._ws = null;
    this._wsReady = null;
    this._rejectAllPending(makeError("WebSocket closed", "UNKNOWN_ERROR", { url: this.url }));
  }

  _rejectAllPending(err) {
    for (const [id, p] of this._pending.entries()) {
      try {
        clearTimeout(p.timer);
        p.reject(err);
      } catch {
        // ignore
      }
      this._pending.delete(id);
    }
  }

  async _connect() {
    if (this._ws && this._ws.readyState === 1) return;
    if (this._wsReady) return this._wsReady;

    const WS = globalThis.WebSocket;
    if (typeof WS !== "function") {
      throw makeError("WebSocket not available in this Node.js runtime", "NOT_IMPLEMENTED", {});
    }

    this._wsReady = new Promise((resolve, reject) => {
      const ws = new WS(this.url);
      this._ws = ws;

      const connectTimer = setTimeout(() => {
        try {
          ws.close();
        } catch {
          // ignore
        }
        reject(makeError("WebSocket connect timeout", "UNKNOWN_ERROR", { url: this.url }));
      }, 10_000);

      const onOpen = () => {
        clearTimeout(connectTimer);
        resolve();
      };

      const onError = (event) => {
        clearTimeout(connectTimer);
        reject(
          makeError("WebSocket error", "UNKNOWN_ERROR", {
            url: this.url,
            error: event && event.message ? event.message : String(event),
          }),
        );
      };

      const onClose = () => {
        clearTimeout(connectTimer);
        this._ws = null;
        this._wsReady = null;
        this._rejectAllPending(makeError("WebSocket closed", "UNKNOWN_ERROR", { url: this.url }));
      };

      const onMessage = (event) => {
        const data = event && event.data != null ? event.data : "";
        const text = typeof data === "string" ? data : data.toString();
        let msg;
        try {
          msg = JSON.parse(text);
        } catch {
          return;
        }
        if (!msg || typeof msg !== "object") return;
        if (typeof msg.id !== "number") return;

        const pending = this._pending.get(msg.id);
        if (!pending) return;
        this._pending.delete(msg.id);
        clearTimeout(pending.timer);

        if (msg.error) {
          pending.reject(makeError("JSON-RPC error", "UNKNOWN_ERROR", { error: msg.error }));
          return;
        }
        pending.resolve(msg.result);
      };

      // Prefer addEventListener API, but fall back to on* properties if needed.
      if (typeof ws.addEventListener === "function") {
        ws.addEventListener("open", onOpen);
        ws.addEventListener("error", onError);
        ws.addEventListener("close", onClose);
        ws.addEventListener("message", onMessage);
      } else {
        ws.onopen = onOpen;
        ws.onerror = onError;
        ws.onclose = onClose;
        ws.onmessage = onMessage;
      }
    }).finally(() => {
      // If connection failed, allow retries.
      if (!this._ws || this._ws.readyState !== 1) {
        this._ws = null;
        this._wsReady = null;
      }
    });

    return this._wsReady;
  }

  /**
   * @param {string} method
   * @param {any[]=} params
   * @returns {Promise<any>}
   */
  async _perform(method, params) {
    await this._connect();
    const ws = this._ws;
    if (!ws || ws.readyState !== 1) {
      throw makeError("WebSocket not connected", "UNKNOWN_ERROR", { url: this.url, method });
    }

    const id = _wsRpcId++;
    const body = JSON.stringify({ jsonrpc: "2.0", id, method, params: params || [] });

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this._pending.delete(id);
        reject(makeError("WebSocket JSON-RPC timeout", "UNKNOWN_ERROR", { url: this.url, method }));
      }, 30_000);

      this._pending.set(id, { resolve, reject, timer });

      try {
        ws.send(body);
      } catch (e) {
        clearTimeout(timer);
        this._pending.delete(id);
        reject(
          makeError("WebSocket send failed", "UNKNOWN_ERROR", {
            url: this.url,
            method,
            error: e && e.message ? e.message : String(e),
          }),
        );
      }
    });
  }
}

class IpcSocketProvider extends AbstractProvider {
  /**
   * Create an IPC provider.
   *
   * On Windows, use a named pipe path like: `\\\\.\\pipe\\geth.ipc`
   * On Unix, use a domain socket path like: `/path/to/geth.ipc`
   *
   * @param {string} path IPC socket path
   */
  constructor(path) {
    super();
    if (typeof path !== "string" || path.length === 0) {
      throw makeError("missing IPC path", "INVALID_ARGUMENT", { path });
    }
    this.path = path;
  }

  /**
   * @param {string} method
   * @param {any[]=} params
   * @returns {Promise<any>}
   */
  async _perform(method, params) {
    const id = _ipcRpcId++;
    const body =
      JSON.stringify({
        jsonrpc: "2.0",
        id,
        method,
        params: params || [],
      }) + "\n";

    return new Promise((resolve, reject) => {
      /** @type {boolean} */
      let done = false;
      /** @type {string} */
      let buffer = "";

      const socket = net.createConnection(this.path);
      socket.setEncoding("utf8");
      socket.setTimeout(30_000);

      function finish(err, value) {
        if (done) return;
        done = true;
        try {
          socket.destroy();
        } catch {
          // ignore
        }
        if (err) reject(err);
        else resolve(value);
      }

      socket.on("connect", () => {
        try {
          socket.write(body);
        } catch (e) {
          finish(
            makeError("IPC write failed", "UNKNOWN_ERROR", {
              method,
              path: this.path,
              error: e && e.message ? e.message : String(e),
            }),
          );
        }
      });

      socket.on("timeout", () => {
        finish(makeError("IPC request timeout", "UNKNOWN_ERROR", { method, path: this.path }));
      });

      socket.on("error", (e) => {
        finish(
          makeError("IPC socket error", "UNKNOWN_ERROR", {
            method,
            path: this.path,
            error: e && e.message ? e.message : String(e),
          }),
        );
      });

      socket.on("data", (chunk) => {
        buffer += String(chunk);

        // Fast path: newline-delimited JSON responses.
        while (buffer.includes("\n")) {
          const idx = buffer.indexOf("\n");
          const line = buffer.slice(0, idx).trim();
          buffer = buffer.slice(idx + 1);
          if (!line) continue;
          try {
            const json = JSON.parse(line);
            if (json && json.id === id) {
              if (json.error) {
                finish(makeError("JSON-RPC error", "UNKNOWN_ERROR", { method, error: json.error }));
                return;
              }
              finish(null, json.result);
              return;
            }
          } catch {
            // If parsing fails, fall through to brace-balanced extraction on the accumulated buffer.
            buffer = line + "\n" + buffer;
            break;
          }
        }

        // Robust path: find a complete JSON object by balanced braces.
        while (true) {
          const extracted = _extractFirstJsonObject(buffer);
          if (!extracted) return;
          buffer = extracted.rest;
          try {
            const json = JSON.parse(extracted.json);
            if (json && json.id === id) {
              if (json.error) {
                finish(makeError("JSON-RPC error", "UNKNOWN_ERROR", { method, error: json.error }));
                return;
              }
              finish(null, json.result);
              return;
            }
          } catch {
            // ignore malformed object and continue scanning remainder
          }
        }
      });

      socket.on("end", () => {
        if (!done) finish(makeError("IPC connection ended before response", "UNKNOWN_ERROR", { method, path: this.path }));
      });
    });
  }
}

class BrowserProvider extends AbstractProvider {
  /**
   * Create a BrowserProvider from an EIP-1193 provider (e.g. MetaMask).
   *
   * This is a lightweight implementation that focuses on the core behaviors:
   * - `send(method, params)` dispatches EIP-1193 requests
   * - `getSigner()` resolves the connected account
   * - emits ethers-like `debug` events for request/response tracking
   *
   * @param {{ request: Function }} eip1193Provider
   * @param {any=} network Unused (compat)
   * @param {{ providerInfo?: any }=} options
   */
  constructor(eip1193Provider, network, options) {
    super();
    void network;
    this.provider = eip1193Provider;
    this.providerInfo = options && options.providerInfo ? options.providerInfo : null;

    if (!this.provider || typeof this.provider.request !== "function") {
      throw makeError("invalid EIP-1193 provider (missing request)", "INVALID_ARGUMENT", { provider: this.provider });
    }
  }

  /**
   * Send an EIP-1193 JSON-RPC request.
   * @param {string} method
   * @param {any[]|Record<string, any>=} params
   * @returns {Promise<any>}
   */
  async send(method, params) {
    const payload = { method, params: params == null ? [] : params };
    this.emit("debug", { action: "sendEip1193Payload", payload });

    try {
      const result = await this.provider.request(payload);
      this.emit("debug", { action: "receiveEip1193Result", result });
      return result;
    } catch (e) {
      const err = this.getRpcError(payload, e);
      this.emit("debug", { action: "receiveEip1193Error", error: err });
      throw err;
    }
  }

  /**
   * Map an EIP-1193 error into a normalized Error.
   * @param {{ method: string, params?: any }} payload
   * @param {any} error
   * @returns {Error}
   */
  getRpcError(payload, error) {
    if (error instanceof Error) return error;
    return makeError("EIP-1193 error", "UNKNOWN_ERROR", { payload, error });
  }

  /**
   * Ethers compatibility: internal send for single or batched payloads.
   * @param {any|any[]} payload
   * @returns {Promise<any>}
   */
  async _send(payload) {
    if (Array.isArray(payload)) {
      const out = [];
      for (const p of payload) {
        // eslint-disable-next-line no-await-in-loop
        out.push(await this.send(p.method, p.params));
      }
      return out;
    }
    return this.send(payload.method, payload.params);
  }

  /**
   * @param {string} method
   * @param {any[]=} params
   * @returns {Promise<any>}
   */
  async _perform(method, params) {
    return this.send(method, params || []);
  }

  /**
   * Returns a signer for the specified account index or address.
   * @param {number|string=} address
   * @returns {Promise<JsonRpcSigner>}
   */
  async getSigner(address) {
    const accounts = await this.send("eth_accounts", []);
    if (!Array.isArray(accounts) || accounts.length === 0) {
      throw makeError("no accounts available from EIP-1193 provider", "UNKNOWN_ERROR", {});
    }

    if (address == null) {
      return new JsonRpcSigner(this, accounts[0]);
    }

    if (typeof address === "number") {
      const a = accounts[address];
      if (!a) throw makeError("account index out of range", "INVALID_ARGUMENT", { address });
      return new JsonRpcSigner(this, a);
    }

    if (typeof address === "string") {
      const found = accounts.find((a) => typeof a === "string" && a.toLowerCase() === address.toLowerCase());
      if (!found) throw makeError("account not found", "INVALID_ARGUMENT", { address });
      return new JsonRpcSigner(this, found);
    }

    throw makeError("invalid signer address/index", "INVALID_ARGUMENT", { address });
  }

  /**
   * Resolve whether this provider manages the address/index.
   * @param {number|string} address
   * @returns {Promise<boolean>}
   */
  async hasSigner(address) {
    const accounts = await this.send("eth_accounts", []);
    if (!Array.isArray(accounts)) return false;
    if (typeof address === "number") return address >= 0 && address < accounts.length;
    if (typeof address === "string") return accounts.some((a) => typeof a === "string" && a.toLowerCase() === address.toLowerCase());
    return false;
  }
}

/**
 * FallbackProvider - uses the first provider in the list.
 */
class FallbackProvider extends AbstractProvider {
  /**
   * @param {AbstractProvider[]|AbstractProvider} providers
   */
  constructor(providers) {
    super();
    this.providers = Array.isArray(providers) ? providers : [providers];
    if (!this.providers.length) throw makeError("no providers provided", "INVALID_ARGUMENT", {});
  }

  async _perform(method, params) {
    // Simple strategy: try providers in order.
    let lastErr;
    for (const p of this.providers) {
      try {
        // eslint-disable-next-line no-await-in-loop
        return await p._perform(method, params);
      } catch (e) {
        lastErr = e;
      }
    }
    throw lastErr || makeError("all providers failed", "UNKNOWN_ERROR", { method });
  }
}

/**
 * FilterByBlockHash placeholder.
 */
class FilterByBlockHash {
  constructor(blockHash, address, topics) {
    if (typeof blockHash !== "string" || !isHexString(blockHash, 32)) {
      throw makeError("invalid blockHash", "INVALID_ARGUMENT", { blockHash });
    }
    this.blockHash = normalizeHex(blockHash);
    if (address != null) this.address = address;
    if (topics != null) this.topics = topics;
  }

  toJSON() {
    // Ensure JSON serialization includes only the filter fields.
    return {
      blockHash: this.blockHash,
      address: this.address,
      topics: this.topics,
    };
  }
}

module.exports = {
  WebSocketProvider,
  IpcSocketProvider,
  BrowserProvider,
  FallbackProvider,
  FilterByBlockHash,
};

