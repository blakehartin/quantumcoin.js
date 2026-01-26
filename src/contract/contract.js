/**
 * @fileoverview Contract implementation (ethers.js v6 compatible shape).
 */

const qcsdk = require("quantum-coin-js-sdk");
const { Interface } = require("../abi/interface");
const { makeError, assertArgument } = require("../errors");
const { getAddress } = require("../utils/address");
const { normalizeHex } = require("../internal/hex");

function _requireInitialized() {
  // eslint-disable-next-line global-require
  const { isInitialized } = require("../../config");
  if (!isInitialized()) {
    throw makeError("QuantumCoin SDK not initialized. Call Initialize() first.", "UNKNOWN_ERROR", { operation: "contract" });
  }
}

function _isProvider(obj) {
  return Boolean(obj && typeof obj === "object" && typeof obj.call === "function" && typeof obj.getBlockNumber === "function");
}

function _isSigner(obj) {
  return Boolean(obj && typeof obj === "object" && typeof obj.signTransaction === "function");
}

function _isOverridesLike(value) {
  if (!value || typeof value !== "object") return false;
  if (Array.isArray(value)) return false;
  if (value instanceof Uint8Array) return false;
  return true;
}

/**
 * BaseContract placeholder (ethers-like).
 */
class BaseContract {
  constructor() {}
}

/**
 * ContractTransactionResponse (aliasing provider TransactionResponse).
 */
class ContractTransactionResponse {
  /**
   * @param {any} tx
   */
  constructor(tx) {
    this._tx = tx;
    // Copy common enumerable fields (hash, from, to, etc.)
    Object.assign(this, tx);
  }

  /**
   * Wait for confirmations (delegated to underlying TransactionResponse).
   * @param {number=} confirmations
   * @param {number=} timeoutMs
   * @returns {Promise<any>}
   */
  wait(confirmations, timeoutMs) {
    if (!this._tx || typeof this._tx.wait !== "function") {
      throw makeError("underlying transaction does not support wait()", "UNKNOWN_ERROR", {});
    }
    return this._tx.wait(confirmations, timeoutMs);
  }

  /**
   * Return the underlying transaction response object.
   * @returns {any}
   */
  getTransaction() {
    return this._tx;
  }
}

/**
 * ContractTransactionReceipt (aliasing provider TransactionReceipt).
 */
class ContractTransactionReceipt {
  /**
   * @param {any} receipt
   */
  constructor(receipt) {
    Object.assign(this, receipt);
  }

  getEvent(eventName) {
    const list = this.getEvents(eventName);
    return list.length ? list[0] : null;
  }

  getEvents(eventName) {
    if (!this.logs) return [];
    return this.logs.filter((l) => l && l.eventName === eventName);
  }
}

/**
 * EventLog placeholder.
 */
class EventLog {
  constructor(log) {
    Object.assign(this, log);
  }
}

class Contract extends BaseContract {
  /**
   * @param {string} address
   * @param {any[]|Interface} abi
   * @param {any=} providerOrSigner
   * @param {string=} bytecode
   */
  constructor(address, abi, providerOrSigner, bytecode) {
    super();
    _requireInitialized();
    this.address = getAddress(address);
    this.target = this.address;
    this.bytecode = bytecode || null;
    this.interface = abi instanceof Interface ? abi : new Interface(abi);

    this.provider = null;
    this.signer = null;
    this.runner = null;
    if (providerOrSigner) {
      if (_isProvider(providerOrSigner)) this.provider = providerOrSigner;
      if (_isSigner(providerOrSigner)) this.signer = providerOrSigner;
      // Ethers' ContractRunner can be a provider or signer
      this.runner = providerOrSigner;
      if (!this.provider && this.signer && this.signer.provider) this.provider = this.signer.provider;
    }

    this._listeners = new Map();

    // ethers-style populateTransaction namespace:
    //   await contract.populateTransaction.someMethod(arg1, ..., overrides?)
    //
    // NOTE: This will shadow any ABI function literally named "populateTransaction".
    // Such a function can still be invoked via `contract.call("populateTransaction", ...)`
    // or `contract.send("populateTransaction", ...)`.
    const self = this;
    this.populateTransaction = new Proxy(
      {},
      {
        get(_t, prop) {
          if (typeof prop !== "string") return undefined;
          const fn = self.interface.abi.find((f) => f && f.type === "function" && f.name === prop);
          if (!fn) return undefined;
          return (...args) => self._populate(prop, args);
        },
      },
    );

    // Proxy to support dynamic method names: contract.someMethod(...)
    return new Proxy(this, {
      get: (target, prop, receiver) => {
        if (typeof prop === "string" && !(prop in target)) {
          // Treat unknown properties as function invocations if present in ABI
          const fn = target.interface.abi.find((f) => f && f.type === "function" && f.name === prop);
          if (fn) {
            return (...args) => target._invoke(prop, args);
          }
        }
        return Reflect.get(target, prop, receiver);
      },
    });
  }

  getAddress() {
    return this.address;
  }

  /**
   * Invoke a contract function, dispatching to call() or send().
   * @param {string} methodName
   * @param {any[]} args
   * @returns {Promise<any>}
   */
  async _invoke(methodName, args) {
    const fn = this.interface.abi.find((f) => f && f.type === "function" && f.name === methodName);
    if (!fn) throw makeError("function not found", "INVALID_ARGUMENT", { methodName });

    const mut = fn.stateMutability || "";
    const isView = mut === "view" || mut === "pure";

    // ethers-style overrides:
    // - for nonpayable/payable: last arg may be overrides object
    // - for view/pure: last arg may be overrides (call overrides)
    const inputCount = Array.isArray(fn.inputs) ? fn.inputs.length : 0;
    let overrides = undefined;
    let callArgs = Array.isArray(args) ? args : [];

    if (callArgs.length === inputCount + 1 && _isOverridesLike(callArgs[callArgs.length - 1])) {
      overrides = callArgs[callArgs.length - 1];
      callArgs = callArgs.slice(0, inputCount);
    }

    if (isView) {
      return this.call(methodName, callArgs, overrides);
    }

    return this.send(methodName, callArgs, overrides);
  }

  /**
   * Build an unsigned transaction request for a contract method call.
   * @param {string} methodName
   * @param {any[]} args
   * @returns {Promise<import("../providers/provider").TransactionRequest>}
   */
  async _populate(methodName, args) {
    const fn = this.interface.abi.find((f) => f && f.type === "function" && f.name === methodName);
    if (!fn) throw makeError("function not found", "INVALID_ARGUMENT", { methodName });

    const inputCount = Array.isArray(fn.inputs) ? fn.inputs.length : 0;
    let overrides = undefined;
    let callArgs = Array.isArray(args) ? args : [];

    if (callArgs.length === inputCount + 1 && _isOverridesLike(callArgs[callArgs.length - 1])) {
      overrides = callArgs[callArgs.length - 1];
      callArgs = callArgs.slice(0, inputCount);
    }

    const data = this.interface.encodeFunctionData(methodName, callArgs);
    return { to: this.address, data, ...(overrides || {}) };
  }

  /**
   * Perform a read-only call.
   * @param {string} methodName
   * @param {any[]} args
   * @param {import("../providers/provider").TransactionRequest=} overrides
   * @returns {Promise<any>}
   */
  async call(methodName, args, overrides) {
    if (!this.provider) throw makeError("missing provider", "UNKNOWN_ERROR", { operation: "call" });
    const data = this.interface.encodeFunctionData(methodName, args);
    const tx = { to: this.address, data, ...(overrides || {}) };
    const raw = await this.provider.call(tx, "latest");
    const decoded = this.interface.decodeFunctionResult(methodName, raw);
    return decoded;
  }

  /**
   * Send a state-changing transaction.
   * @param {string} methodName
   * @param {any[]} args
   * @param {import("../providers/provider").TransactionRequest=} overrides
   * @returns {Promise<ContractTransactionResponse>}
   */
  async send(methodName, args, overrides) {
    if (!this.signer) throw makeError("missing signer", "UNKNOWN_ERROR", { operation: "send" });
    const data = this.interface.encodeFunctionData(methodName, args);
    const tx = { to: this.address, data, ...(overrides || {}) };
    const resp = await this.signer.sendTransaction(tx);
    return new ContractTransactionResponse(resp);
  }

  /**
   * Query logs for an event.
   * @param {any} event
   * @param {number|string=} fromBlock
   * @param {number|string=} toBlock
   * @returns {Promise<EventLog[]>}
   */
  async queryFilter(event, fromBlock, toBlock) {
    if (!this.provider) throw makeError("missing provider", "UNKNOWN_ERROR", { operation: "queryFilter" });
    const name = typeof event === "string" ? event : event?.name;
    assertArgument(typeof name === "string", "invalid event", "event", event);
    const filter = { address: this.address, fromBlock, toBlock };
    const logs = await this.provider.getLogs(filter);
    return logs.map((l) => new EventLog(l));
  }

  on(event, callback) {
    const name = typeof event === "string" ? event : event?.name;
    if (!name) throw makeError("invalid event", "INVALID_ARGUMENT", { event });
    const list = this._listeners.get(name) || [];
    list.push(callback);
    this._listeners.set(name, list);
    return this;
  }

  once(event, callback) {
    const wrap = (...args) => {
      this.removeListener(event, wrap);
      callback(...args);
    };
    return this.on(event, wrap);
  }

  removeListener(event, callback) {
    const name = typeof event === "string" ? event : event?.name;
    const list = this._listeners.get(name) || [];
    this._listeners.set(
      name,
      list.filter((cb) => cb !== callback),
    );
    return this;
  }

  removeAllListeners(event) {
    if (!event) {
      this._listeners.clear();
      return this;
    }
    const name = typeof event === "string" ? event : event?.name;
    this._listeners.delete(name);
    return this;
  }

  connect(signerOrProvider) {
    return new Contract(this.address, this.interface, signerOrProvider, this.bytecode);
  }

  attach(address) {
    return new Contract(address, this.interface, this.runner, this.bytecode);
  }

  deployTransaction() {
    return this._deployTx || null;
  }

  async getTransactionReceipt(hash) {
    if (!this.provider) return null;
    const receipt = await this.provider.getTransactionReceipt(hash);
    return receipt ? new ContractTransactionReceipt(receipt) : null;
  }

  async waitForDeployment() {
    if (!this._deployTx) return this;
    await this._deployTx.wait();
    return this;
  }

  async getDeployedCode() {
    if (!this.provider) return null;
    return this.provider.getCode(this.address, "latest");
  }

  static from(target, abi, runner) {
    const address = typeof target === "string" ? target : target?.address || target?.target;
    return new Contract(address, abi, runner);
  }
}

module.exports = {
  BaseContract,
  Contract,
  ContractTransactionResponse,
  ContractTransactionReceipt,
  EventLog,
};

