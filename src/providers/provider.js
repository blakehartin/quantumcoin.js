/**
 * @fileoverview Provider base classes and common types.
 *
 * This module models ethers.js v6 Provider patterns, adapted for QuantumCoin.
 * The concrete JSON-RPC implementation lives in `json-rpc-provider.js`.
 */

const { EventEmitter } = require("events");
const { makeError, assertArgument } = require("../errors");
const { normalizeHex, isHexString } = require("../internal/hex");

/**
 * @typedef {import("../utils/encoding").BytesLike} BytesLike
 */

/**
 * @typedef {Object} TransactionRequest
 * @property {string=} to
 * @property {string=} from
 * @property {bigint|string|number=} value
 * @property {string=} data
 * @property {bigint|string|number=} gasLimit
 * @property {bigint|string|number=} gasPrice
 * @property {number=} nonce
 * @property {number=} chainId
 * @property {string=} remarks Optional remark field (hex, max 32 bytes)
 */

/**
 * @typedef {Object} Filter
 * @property {string|string[]=} address
 * @property {(string|string[]|null)[]=} topics
 * @property {number|string=} fromBlock
 * @property {number|string=} toBlock
 * @property {string=} blockHash
 */

function _hexToBigInt(hex) {
  if (typeof hex === "bigint") return hex;
  if (typeof hex === "number") return BigInt(hex);
  // JSON-RPC "quantity" values may be odd-length (e.g. "0x0", "0x1").
  assertArgument(typeof hex === "string" && /^0x[0-9a-fA-F]+$/.test(hex), "invalid hex quantity", "hex", hex);
  return BigInt(hex);
}

function _hexToNumber(hex) {
  return Number(_hexToBigInt(hex));
}

/**
 * Minimal Log wrapper (ethers-like).
 */
class Log {
  /**
   * @param {any} log
   * @param {AbstractProvider=} provider
   */
  constructor(log, provider) {
    this.provider = provider || null;
    this.address = log.address;
    this.topics = log.topics || [];
    this.data = log.data || "0x";
    this.blockHash = log.blockHash || null;
    this.blockNumber = log.blockNumber != null ? _hexToNumber(log.blockNumber) : null;
    this.transactionHash = log.transactionHash || null;
    this.transactionIndex = log.transactionIndex != null ? _hexToNumber(log.transactionIndex) : null;
    this.logIndex = log.logIndex != null ? _hexToNumber(log.logIndex) : null;
    this.removed = Boolean(log.removed);
  }

  async getBlock() {
    if (!this.provider || this.blockNumber == null) return null;
    return this.provider.getBlock(this.blockNumber);
  }

  async getTransaction() {
    if (!this.provider || !this.transactionHash) return null;
    return this.provider.getTransaction(this.transactionHash);
  }

  async getTransactionReceipt() {
    if (!this.provider || !this.transactionHash) return null;
    return this.provider.getTransactionReceipt(this.transactionHash);
  }
}

/**
 * Minimal TransactionReceipt wrapper (ethers-like).
 */
class TransactionReceipt {
  /**
   * @param {any} receipt
   * @param {AbstractProvider=} provider
   */
  constructor(receipt, provider) {
    this.provider = provider || null;
    this.to = receipt.to || null;
    this.from = receipt.from || null;
    this.contractAddress = receipt.contractAddress || null;
    this.transactionHash = receipt.transactionHash;
    this.blockHash = receipt.blockHash;
    this.blockNumber = receipt.blockNumber != null ? _hexToNumber(receipt.blockNumber) : null;
    this.transactionIndex = receipt.transactionIndex != null ? _hexToNumber(receipt.transactionIndex) : null;
    this.gasUsed = receipt.gasUsed != null ? _hexToBigInt(receipt.gasUsed) : null;
    this.status = receipt.status != null ? _hexToNumber(receipt.status) : null;
    this.logs = Array.isArray(receipt.logs) ? receipt.logs.map((l) => new Log(l, provider)) : [];
  }
}

/**
 * Minimal TransactionResponse wrapper (ethers-like).
 */
class TransactionResponse {
  /**
   * @param {any} tx
   * @param {AbstractProvider=} provider
   */
  constructor(tx, provider) {
    this.provider = provider || null;
    this.hash = tx.hash;
    this.to = tx.to || null;
    this.from = tx.from || null;
    this.nonce = tx.nonce != null ? _hexToNumber(tx.nonce) : null;
    this.data = tx.input || tx.data || "0x";
    this.value = tx.value != null ? _hexToBigInt(tx.value) : 0n;
    this.gasLimit = tx.gas != null ? _hexToBigInt(tx.gas) : null;
    this.gasPrice = tx.gasPrice != null ? _hexToBigInt(tx.gasPrice) : null;
    this.chainId = tx.chainId != null ? _hexToNumber(tx.chainId) : null;
    this.blockNumber = tx.blockNumber != null ? _hexToNumber(tx.blockNumber) : null;
  }

  /**
   * Wait for confirmations.
   * @param {number=} confirmations
   * @param {number=} timeoutMs
   * @returns {Promise<TransactionReceipt>}
   */
  async wait(confirmations, timeoutMs) {
    if (!this.provider) throw makeError("missing provider", "UNKNOWN_ERROR", { operation: "wait" });
    const conf = confirmations == null ? 1 : confirmations;
    const start = Date.now();
    const timeout = timeoutMs == null ? 120_000 : timeoutMs;

    while (true) {
      const receipt = await this.provider.getTransactionReceipt(this.hash);
      if (receipt && receipt.blockNumber != null) {
        if (conf <= 1) return receipt;
        const current = await this.provider.getBlockNumber();
        if (current - receipt.blockNumber + 1 >= conf) return receipt;
      }
      if (Date.now() - start > timeout) {
        throw makeError("timeout waiting for transaction", "UNKNOWN_ERROR", { hash: this.hash });
      }
      await new Promise((r) => setTimeout(r, 2_000));
    }
  }
}

/**
 * Minimal Block wrapper (ethers-like).
 */
class Block {
  /**
   * @param {any} block
   * @param {AbstractProvider=} provider
   */
  constructor(block, provider) {
    this.provider = provider || null;
    this.hash = block.hash || null;
    this.parentHash = block.parentHash || null;
    this.number = block.number != null ? _hexToNumber(block.number) : null;
    this.timestamp = block.timestamp != null ? _hexToNumber(block.timestamp) : null;
    this.transactions = block.transactions || [];
  }

  async getTransaction(indexOrHash) {
    if (!this.provider) return null;
    if (typeof indexOrHash === "number") {
      const hash = this.transactions[indexOrHash];
      if (!hash) return null;
      return this.provider.getTransaction(hash);
    }
    if (typeof indexOrHash === "string") return this.provider.getTransaction(indexOrHash);
    return null;
  }

  async getTransactionReceipt(indexOrHash) {
    if (!this.provider) return null;
    const tx = await this.getTransaction(indexOrHash);
    if (!tx) return null;
    return this.provider.getTransactionReceipt(tx.hash);
  }

  getPrefetchedTransactions() {
    // This implementation returns only hashes unless `eth_getBlockByNumber(..., true)` is used.
    return [];
  }
}

/**
 * Base Provider class.
 */
class Provider extends EventEmitter {
  constructor() {
    super();
  }
}

/**
 * AbstractProvider base class (ethers-like).
 */
class AbstractProvider extends Provider {
  constructor() {
    super();
  }

  /**
   * Implemented by subclasses to perform JSON-RPC.
   * @param {string} method
   * @param {any[]=} params
   * @returns {Promise<any>}
   */
  async _perform(method, params) {
    void method;
    void params;
    throw makeError("_perform not implemented", "NOT_IMPLEMENTED", {});
  }

  async getBlockNumber() {
    const hex = await this._perform("eth_blockNumber", []);
    return _hexToNumber(hex);
  }

  /**
   * @param {number|"latest"} blockNumber
   * @returns {Promise<Block>}
   */
  async getBlock(blockNumber) {
    const tag = blockNumber === "latest" ? "latest" : normalizeHex("0x" + Number(blockNumber).toString(16));
    const block = await this._perform("eth_getBlockByNumber", [tag, false]);
    return new Block(block, this);
  }

  /**
   * @param {string} txHash
   * @returns {Promise<TransactionResponse>}
   */
  async getTransaction(txHash) {
    const tx = await this._perform("eth_getTransactionByHash", [txHash]);
    if (!tx) return null;
    return new TransactionResponse(tx, this);
  }

  /**
   * @param {string} txHash
   * @returns {Promise<TransactionReceipt>}
   */
  async getTransactionReceipt(txHash) {
    const receipt = await this._perform("eth_getTransactionReceipt", [txHash]);
    if (!receipt) return null;
    return new TransactionReceipt(receipt, this);
  }

  /**
   * @param {string} address
   * @returns {Promise<bigint>}
   */
  async getBalance(address) {
    const bal = await this._perform("eth_getBalance", [address, "latest"]);
    return _hexToBigInt(bal);
  }

  /**
   * @param {string} address
   * @param {string=} blockTag
   * @returns {Promise<number>}
   */
  async getTransactionCount(address, blockTag) {
    const tag = blockTag || "latest";
    const nonce = await this._perform("eth_getTransactionCount", [address, tag]);
    return _hexToNumber(nonce);
  }

  /**
   * Broadcasts a signed transaction.
   * @param {TransactionRequest|string} tx
   * @returns {Promise<TransactionResponse>}
   */
  async sendTransaction(tx) {
    // For QuantumCoin.js, tx is expected to be a signed raw transaction hex string.
    const raw = typeof tx === "string" ? tx : tx?.raw;
    if (typeof raw !== "string") throw makeError("sendTransaction requires a signed raw transaction string", "INVALID_ARGUMENT", { tx });
    const hash = await this._perform("eth_sendRawTransaction", [raw]);
    // Fetch back transaction (best-effort)
    const result = await this.getTransaction(hash);
    return result || new TransactionResponse({ hash }, this);
  }

  /**
   * Perform a call (read-only) and return hex data.
   * @param {TransactionRequest} tx
   * @param {string=} blockTag
   * @returns {Promise<string>}
   */
  async call(tx, blockTag) {
    const tag = blockTag || "latest";
    return this._perform("eth_call", [tx, tag]);
  }

  /**
   * Estimate gas for a call/transaction.
   * @param {TransactionRequest} tx
   * @returns {Promise<bigint>}
   */
  async estimateGas(tx) {
    const gas = await this._perform("eth_estimateGas", [tx]);
    return _hexToBigInt(gas);
  }

  /**
   * @param {string} address
   * @param {string=} blockTag
   * @returns {Promise<string>}
   */
  async getCode(address, blockTag) {
    const tag = blockTag || "latest";
    return this._perform("eth_getCode", [address, tag]);
  }

  /**
   * @param {string} address
   * @param {bigint} position
   * @param {string=} blockTag
   * @returns {Promise<string>}
   */
  async getStorageAt(address, position, blockTag) {
    const tag = blockTag || "latest";
    return this._perform("eth_getStorageAt", [address, "0x" + position.toString(16), tag]);
  }

  /**
   * @param {Filter} filter
   * @returns {Promise<Log[]>}
   */
  async getLogs(filter) {
    const logs = await this._perform("eth_getLogs", [filter]);
    return (logs || []).map((l) => new Log(l, this));
  }
}

module.exports = {
  Provider,
  AbstractProvider,
  Block,
  TransactionResponse,
  TransactionReceipt,
  Log,
};

