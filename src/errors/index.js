/**
 * @fileoverview Error helpers and error classes.
 *
 * The QuantumCoin.js SDK follows ethers.js v6 error patterns:
 * - errors include a machine-readable `code`
 * - errors include `shortMessage`
 * - errors may include extra fields depending on the failure
 */

/**
 * @typedef {"INVALID_ARGUMENT"|"NUMERIC_FAULT"|"BUFFER_OVERRUN"|"CALL_EXCEPTION"|"UNKNOWN_ERROR"|"NOT_IMPLEMENTED"} ErrorCode
 */

/**
 * Returns true if the error matches the given code.
 * @param {any} error
 * @param {string} code
 * @returns {boolean}
 */
function isError(error, code) {
  return Boolean(error && typeof error === "object" && error.code === code);
}

/**
 * Returns true if the error is a CALL_EXCEPTION.
 * @param {any} error
 * @returns {boolean}
 */
function isCallException(error) {
  return isError(error, "CALL_EXCEPTION");
}

function _stringify(value, seen) {
  if (value == null) return "null";
  if (seen == null) seen = new Set();
  if (typeof value === "object") {
    if (seen.has(value)) return "[Circular]";
    seen.add(value);
  }
  if (Array.isArray(value)) return "[ " + value.map((v) => _stringify(v, seen)).join(", ") + " ]";
  if (value instanceof Uint8Array) return `Uint8Array(${value.length})`;
  if (typeof value === "object" && typeof value.toJSON === "function") return _stringify(value.toJSON(), seen);
  switch (typeof value) {
    case "boolean":
    case "number":
    case "symbol":
      return value.toString();
    case "bigint":
      return BigInt(value).toString();
    case "string":
      return JSON.stringify(value);
    case "object": {
      const keys = Object.keys(value).sort();
      return "{ " + keys.map((k) => `${_stringify(k, seen)}: ${_stringify(value[k], seen)}`).join(", ") + " }";
    }
    default:
      return `[ COULD NOT SERIALIZE ]`;
  }
}

/**
 * Create an Error configured like ethers emits errors.
 *
 * @param {string} message
 * @param {ErrorCode} code
 * @param {Record<string, any>=} info
 * @returns {Error & { code: ErrorCode, shortMessage: string }}
 */
function makeError(message, code, info) {
  let shortMessage = message;

  const details = [];
  if (info) {
    if ("message" in info || "code" in info || "name" in info) {
      throw new Error(`value will overwrite populated values: ${_stringify(info)}`);
    }
    for (const key in info) {
      if (key === "shortMessage") continue;
      details.push(key + "=" + _stringify(info[key]));
    }
  }
  details.push(`code=${code}`);
  if (details.length) message += " (" + details.join(", ") + ")";

  /** @type {any} */
  let err;
  switch (code) {
    case "INVALID_ARGUMENT":
      err = new TypeError(message);
      break;
    case "NUMERIC_FAULT":
    case "BUFFER_OVERRUN":
      err = new RangeError(message);
      break;
    default:
      err = new Error(message);
  }

  Object.defineProperty(err, "code", { enumerable: true, value: code, writable: false });
  Object.defineProperty(err, "shortMessage", { enumerable: true, value: shortMessage, writable: false });
  if (info) Object.assign(err, info);
  return err;
}

/**
 * Assert a condition, throwing an ethers-style error otherwise.
 * @param {any} check
 * @param {string} message
 * @param {ErrorCode} code
 * @param {Record<string, any>=} info
 */
function assert(check, message, code, info) {
  if (!check) throw makeError(message, code, info);
}

/**
 * Assert an argument constraint.
 * @param {any} check
 * @param {string} message
 * @param {string} name
 * @param {any} value
 */
function assertArgument(check, message, name, value) {
  assert(check, message, "INVALID_ARGUMENT", { argument: name, value });
}

/**
 * Provider error.
 */
class ProviderError extends Error {
  /**
   * @param {string} message
   * @param {Record<string, any>=} info
   */
  constructor(message, info) {
    super(message);
    /** @type {ErrorCode} */
    this.code = "UNKNOWN_ERROR";
    this.shortMessage = message;
    if (info) Object.assign(this, info);
  }
}

/**
 * Transaction error.
 */
class TransactionError extends Error {
  /**
   * @param {string} message
   * @param {Record<string, any>=} info
   */
  constructor(message, info) {
    super(message);
    /** @type {ErrorCode} */
    this.code = "UNKNOWN_ERROR";
    this.shortMessage = message;
    if (info) Object.assign(this, info);
  }
}

/**
 * Contract error.
 */
class ContractError extends Error {
  /**
   * @param {string} message
   * @param {Record<string, any>=} info
   */
  constructor(message, info) {
    super(message);
    /** @type {ErrorCode} */
    this.code = "UNKNOWN_ERROR";
    this.shortMessage = message;
    if (info) Object.assign(this, info);
  }
}

module.exports = {
  isError,
  isCallException,
  makeError,
  assert,
  assertArgument,
  ProviderError,
  TransactionError,
  ContractError,
};

