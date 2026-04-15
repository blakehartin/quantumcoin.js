/**
 * @fileoverview JsonRpcProvider implementation.
 */

const { AbstractProvider } = require("./provider");
const { makeError } = require("../errors");
const { Config, getConfig, isInitialized } = require("../../config");

const MAX_RESPONSE_SIZE = 16 * 1024 * 1024;

function _bigIntReplacer(_key, value) {
  return typeof value === "bigint" ? "0x" + value.toString(16) : value;
}

class JsonRpcProvider extends AbstractProvider {
  /**
   * @param {string=} url RPC endpoint (defaults to Config.rpcEndpoint or https://public.rpc.quantumcoinapi.com)
   * @param {number=} chainId Chain ID (defaults to 123123)
   */
  constructor(url, chainId) {
    super();
    const active = isInitialized() ? getConfig() : null;
    const cfg = active || new Config();
    this.url = url || cfg.rpcEndpoint;
    this.chainId = chainId == null ? cfg.chainId : chainId;
    this._rpcId = 1;
  }

  /**
   * Internal JSON-RPC call.
   * @param {string} method
   * @param {any[]=} params
   * @returns {Promise<any>}
   */
  async _perform(method, params) {
    const id = this._rpcId++;
    const body = JSON.stringify({
      jsonrpc: "2.0",
      id,
      method,
      params: params || [],
    }, _bigIntReplacer);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);
    try {
      const resp = await fetch(this.url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body,
        signal: controller.signal,
      });
      const text = await resp.text().catch(() => null);
      if (text && text.length > MAX_RESPONSE_SIZE) {
        throw makeError("JSON-RPC response too large", "UNKNOWN_ERROR", {
          method, url: this.url, size: text.length, limit: MAX_RESPONSE_SIZE,
        });
      }
      const json = text ? (() => { try { return JSON.parse(text); } catch { return null; } })() : null;
      if (!resp.ok) {
        throw makeError("JSON-RPC HTTP error", "UNKNOWN_ERROR", {
          status: resp.status,
          statusText: resp.statusText,
          method,
          url: this.url,
          body: json || null,
        });
      }
      if (!json) throw makeError("invalid JSON-RPC response", "UNKNOWN_ERROR", { method });
      if (json.error) {
        throw makeError("JSON-RPC error", "UNKNOWN_ERROR", { method, error: json.error });
      }
      return json.result;
    } catch (e) {
      if (e && e.name === "AbortError") {
        throw makeError("JSON-RPC request timeout", "UNKNOWN_ERROR", { method, url: this.url });
      }
      throw e;
    } finally {
      clearTimeout(timeout);
    }
  }
}

// In ethers v6 this is a base for specific API providers; we alias for compatibility.
class JsonRpcApiProvider extends JsonRpcProvider {}

module.exports = { JsonRpcProvider, JsonRpcApiProvider };

