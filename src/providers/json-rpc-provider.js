/**
 * @fileoverview JsonRpcProvider implementation.
 */

const { AbstractProvider } = require("./provider");
const { makeError } = require("../errors");
const { Config, getConfig, isInitialized } = require("../../config");

let _rpcId = 1;

class JsonRpcProvider extends AbstractProvider {
  /**
   * @param {string=} url RPC endpoint (defaults to Config.rpcEndpoint or https://public.rpc.quantumcoinapi.com)
   * @param {number=} chainId Chain ID (defaults to 123123)
   */
  constructor(url, chainId) {
    super();
    // If not provided, attempt to use initialized config.js defaults.
    const active = isInitialized() ? getConfig() : null;
    const cfg = active || new Config();
    this.url = url || cfg.rpcEndpoint;
    this.chainId = chainId == null ? cfg.chainId : chainId;
  }

  /**
   * Internal JSON-RPC call.
   * @param {string} method
   * @param {any[]=} params
   * @returns {Promise<any>}
   */
  async _perform(method, params) {
    const id = _rpcId++;
    const body = JSON.stringify({
      jsonrpc: "2.0",
      id,
      method,
      params: params || [],
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);
    try {
      const resp = await fetch(this.url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body,
        signal: controller.signal,
      });
      const json = await resp.json().catch(() => null);
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

