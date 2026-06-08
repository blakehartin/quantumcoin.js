/**
 * @fileoverview Provider base classes and common types.
 *
 * This module models ethers.js v6 Provider patterns, adapted for QuantumCoin.
 * The concrete JSON-RPC implementation lives in `json-rpc-provider.js`.
 */

const { EventEmitter } = require("events");
const { makeError, assertArgument } = require("../errors");
const { normalizeHex, toQuantityHex, isHexString } = require("../internal/hex");

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
 * @property {number=} nonce
 * @property {number=} chainId
 * @property {string=} remarks Optional remark field (hex, max 32 bytes)
 * @property {number|null=} signingContext Optional signing context (0, 1, 2, or null). Passed to SDK TransactionSigningRequest; default null.
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
  if (hex === "0x" || hex === "0X") return 0n;
  assertArgument(typeof hex === "string" && /^0x[0-9a-fA-F]+$/.test(hex), "invalid hex quantity", "hex", hex);
  return BigInt(hex);
}

function _hexToNumber(hex) {
  // RPC quantities are untrusted. Previously `Number(bigint)` silently
  // truncated values above 2^53, corrupting blockNumber/nonce/status/indices used
  // in confirmation math. We keep returning a `number` (no signature/type change),
  // but fail loudly for out-of-range values instead of returning a corrupted one.
  // Real chain values are far below MAX_SAFE_INTEGER, so honest flows are
  // unaffected. (Returning bigint would break field types and wait() arithmetic.)
  const bi = _hexToBigInt(hex);
  if (bi > BigInt(Number.MAX_SAFE_INTEGER) || bi < BigInt(Number.MIN_SAFE_INTEGER)) {
    throw makeError("RPC quantity exceeds safe integer range", "NUMERIC_FAULT", { value: bi.toString() });
  }
  return Number(bi);
}
  
/**
 * Convert block tag (number or string) to the format eth_getLogs expects (hex with 0x or "latest"/"pending"/"earliest").
 * @param {number|string|undefined} blockTag
 * @returns {string|undefined}
 */
/**
 * Build a lowercase Set of allowed log addresses from a filter's `address` field
 * (string or string[]). Returns null when no address constraint is present.
 * @param {string|string[]|undefined|null} address
 * @returns {Set<string>|null}
 */
function _normalizeAddressFilter(address) {
  if (address == null) return null;
  const list = Array.isArray(address) ? address : [address];
  const set = new Set();
  for (const a of list) {
    if (typeof a === "string" && a.length > 0) set.add(a.toLowerCase());
  }
  return set.size ? set : null;
}

/**
 * Check a log's topics against a requested topics filter (eth_getLogs
 * semantics). Each filter position may be null (wildcard), a string (exact
 * match), or an array of strings (any match). Used to drop logs a malicious node
 * returns that do not actually match the requested event topic(s).
 * @param {any[]} logTopics
 * @param {(string|string[]|null)[]} filterTopics
 * @returns {boolean}
 */
function _topicsMatch(logTopics, filterTopics) {
  if (!Array.isArray(filterTopics)) return true;
  const topics = Array.isArray(logTopics) ? logTopics : [];
  for (let i = 0; i < filterTopics.length; i++) {
    const want = filterTopics[i];
    if (want == null) continue; // wildcard position
    const have = typeof topics[i] === "string" ? topics[i].toLowerCase() : null;
    if (have == null) return false;
    const allowed = (Array.isArray(want) ? want : [want])
      .filter((t) => typeof t === "string")
      .map((t) => t.toLowerCase());
    if (allowed.length && !allowed.includes(have)) return false;
  }
  return true;
}

function _blockTagToHex(blockTag) {
  if (blockTag === undefined || blockTag === null) return undefined;
  const s = String(blockTag).toLowerCase();
  if (s === "latest" || s === "pending" || s === "earliest") return s;
  const n = typeof blockTag === "number" ? blockTag : Number(blockTag);
  if (!Number.isInteger(n) || n < 0) return undefined;
  return toQuantityHex(n);
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
    this.chainId = tx.chainId != null ? _hexToNumber(tx.chainId) : null;
    this.blockNumber = tx.blockNumber != null ? _hexToNumber(tx.blockNumber) : null;
    this.txType = tx.type != null ? _hexToNumber(tx.type) : null;
    this.remarks = tx.remarks != null ? normalizeHex(tx.remarks) : null;
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
    const tag = blockNumber === "latest" ? "latest" : toQuantityHex(blockNumber);
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
    const result = new TransactionResponse(tx, this);
    // Do not trust the node to return the transaction we actually asked for.
    // When the response carries a hash, it must match the requested hash;
    // otherwise a malicious node could substitute a different transaction.
    if (
      typeof txHash === "string" &&
      typeof result.hash === "string" &&
      result.hash.length > 0 &&
      result.hash.toLowerCase() !== txHash.toLowerCase()
    ) {
      throw makeError("RPC node returned a transaction whose hash does not match the requested hash", "UNKNOWN_ERROR", {
        operation: "getTransaction",
        expected: txHash,
        got: result.hash,
      });
    }
    return result;
  }

  /**
   * @param {string} txHash
   * @returns {Promise<TransactionReceipt>}
   */
  async getTransactionReceipt(txHash) {
    const receipt = await this._perform("eth_getTransactionReceipt", [txHash]);
    if (!receipt) return null;
    const result = new TransactionReceipt(receipt, this);
    // The receipt must belong to the transaction we asked about. A node must
    // not be able to confirm an unrelated/fabricated transaction (which would let
    // wait() report success for the wrong tx).
    if (
      typeof txHash === "string" &&
      typeof result.transactionHash === "string" &&
      result.transactionHash.length > 0 &&
      result.transactionHash.toLowerCase() !== txHash.toLowerCase()
    ) {
      throw makeError("RPC node returned a receipt whose hash does not match the requested hash", "UNKNOWN_ERROR", {
        operation: "getTransactionReceipt",
        expected: txHash,
        got: result.transactionHash,
      });
    }
    return result;
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
   * @param {{ expectedHash?: string }=} opts Optional. When `expectedHash` is set,
   *   the hash returned by the node (and the fetched-back transaction's hash) must
   *   match it, otherwise an error is thrown (do not trust the RPC node to
   *   broadcast the exact transaction that was signed).
   * @returns {Promise<TransactionResponse>}
   */
  async sendTransaction(tx, opts) {
    // For QuantumCoin.js, tx is expected to be a signed raw transaction hex string.
    const raw = typeof tx === "string" ? tx : tx?.raw;
    if (typeof raw !== "string") throw makeError("sendTransaction requires a signed raw transaction string", "INVALID_ARGUMENT", { tx });
    const expectedHash =
      opts && typeof opts.expectedHash === "string" && opts.expectedHash.length > 0 ? opts.expectedHash.toLowerCase() : null;

    const hash = await this._perform("eth_sendRawTransaction", [raw]);

    // The node returns the hash it claims to have accepted. If we know the
    // hash of the transaction we signed, reject any mismatch — a malicious or
    // buggy node must not be able to silently substitute a different transaction.
    if (expectedHash != null && typeof hash === "string" && hash.length > 0) {
      if (hash.toLowerCase() !== expectedHash) {
        throw makeError("RPC node returned a transaction hash that does not match the signed transaction", "UNKNOWN_ERROR", {
          operation: "sendTransaction",
          expected: expectedHash,
          got: hash,
        });
      }
    }

    // Fetch back transaction (best-effort)
    const result = await this.getTransaction(hash);

    // Verify the fetched-back transaction's hash too, so a node cannot return
    // a fabricated transaction object under the correct hash lookup.
    if (result && expectedHash != null && typeof result.hash === "string" && result.hash.toLowerCase() !== expectedHash) {
      throw makeError("RPC node returned a transaction whose hash does not match the signed transaction", "UNKNOWN_ERROR", {
        operation: "sendTransaction",
        expected: expectedHash,
        got: result.hash,
      });
    }

    return result || new TransactionResponse({ hash }, this);
  }

  /**
   * Broadcast a signed raw transaction.
   * Alias of sendTransaction(rawTx) for clarity when doing offline signing flows.
   *
   * @param {string} rawTx
   * @returns {Promise<TransactionResponse>}
   */
  async sendRawTransaction(rawTx) {
    assertArgument(typeof rawTx === "string", "invalid rawTx", "rawTx", rawTx);
    return this.sendTransaction(rawTx);
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
    const fromBlock = _blockTagToHex(filter.fromBlock);
    const toBlock = _blockTagToHex(filter.toBlock);
    const normalized = { ...filter };
    if (fromBlock !== undefined) normalized.fromBlock = fromBlock;
    if (toBlock !== undefined) normalized.toBlock = toBlock;
    const logs = await this._perform("eth_getLogs", [normalized]);
    const mapped = (logs || []).map((l) => new Log(l, this));

    // A malicious node could return logs emitted by contracts other than the
    // one(s) requested. When the filter constrains the address, drop any log whose
    // address is not in that set so foreign-contract events cannot be injected.
    const allowed = _normalizeAddressFilter(filter.address);
    // A malicious node could return logs for a different event (different
    // topic0) or from foreign contracts. Drop anything that does not match the
    // requested address and topic constraints.
    const hasTopicFilter = Array.isArray(filter.topics) && filter.topics.some((t) => t != null);
    if (allowed || hasTopicFilter) {
      return mapped.filter((l) => {
        if (!l) return false;
        if (allowed && !(typeof l.address === "string" && allowed.has(l.address.toLowerCase()))) return false;
        if (hasTopicFilter && !_topicsMatch(l.topics, filter.topics)) return false;
        return true;
      });
    }
    return mapped;
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

