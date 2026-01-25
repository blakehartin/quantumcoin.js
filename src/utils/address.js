/**
 * @fileoverview Address utilities (QuantumCoin 32-byte address format).
 *
 * QuantumCoin addresses are 32 bytes (66 hex characters including 0x).
 * Most helpers here are thin wrappers around `quantum-coin-js-sdk`.
 */

const qcsdk = require("quantum-coin-js-sdk");
const { assertArgument, makeError } = require("../errors");
const { arrayify, bytesToHex, hexToBytes, isHexString, normalizeHex } = require("../internal/hex");
const { sha256 } = require("./hashing");

function _requireInitialized() {
  // The spec requires Initialize() to be called before using the SDK.
  // config.js tracks initialization state for this package.
  // eslint-disable-next-line global-require
  const { isInitialized } = require("../../config");
  if (!isInitialized()) {
    throw makeError("QuantumCoin SDK not initialized. Call Initialize() first.", "UNKNOWN_ERROR", {
      operation: "address-utils",
    });
  }
}

/**
 * Checks if string is a valid address (32 bytes, 66 hex characters).
 * @param {string} address
 * @returns {boolean}
 */
function isAddress(address) {
  if (typeof address !== "string") return false;
  _requireInitialized();
  const result = qcsdk.isAddressValid(address);
  return result === true;
}

/**
 * Returns normalized address.
 * Note: QuantumCoin checksumming uses QuantumCoin conventions; currently this normalizes to lowercase.
 * @param {string} address
 * @returns {string}
 */
function getAddress(address) {
  assertArgument(typeof address === "string", "address must be a string", "address", address);
  _requireInitialized();
  const norm = normalizeHex(address);
  assertArgument(qcsdk.isAddressValid(norm) === true, "invalid address", "address", address);
  return norm;
}

/**
 * Returns true if value is an object implementing Addressable (has getAddress()).
 * @param {any} value
 * @returns {boolean}
 */
function isAddressable(value) {
  return Boolean(value && typeof value === "object" && typeof value.getAddress === "function");
}

/**
 * Resolve an AddressLike into a string address.
 * For QuantumCoin, ENS is not supported.
 * @param {any} target
 * @returns {string|Promise<string>}
 */
function resolveAddress(target) {
  if (typeof target === "string") return getAddress(target);
  if (isAddressable(target)) return target.getAddress();
  if (target && typeof target.then === "function") {
    return Promise.resolve(target).then((v) => resolveAddress(v));
  }
  throw makeError("unsupported AddressLike", "INVALID_ARGUMENT", { target });
}

/**
 * Calculates contract address from deployer and nonce.
 * @param {{ from: string, nonce: number }} tx
 * @returns {string}
 */
function getContractAddress(tx) {
  _requireInitialized();
  assertArgument(tx && typeof tx === "object", "invalid tx", "tx", tx);
  const from = getAddress(tx.from);
  assertArgument(Number.isInteger(tx.nonce) && tx.nonce >= 0, "invalid nonce", "nonce", tx.nonce);
  const out = qcsdk.createAddress(from, tx.nonce);
  if (typeof out !== "string") throw makeError("createAddress failed", "UNKNOWN_ERROR", { from, nonce: tx.nonce });
  return normalizeHex(out);
}

/**
 * Alias for getContractAddress.
 * @param {{ from: string, nonce: number }} tx
 * @returns {string}
 */
function getCreateAddress(tx) {
  return getContractAddress(tx);
}

/**
 * Calculates CREATE2 contract address.
 * @param {string} from
 * @param {string} salt
 * @param {string} initCodeHash
 * @returns {string}
 */
function getCreate2Address(from, salt, initCodeHash) {
  _requireInitialized();
  const f = getAddress(from);
  assertArgument(isHexString(salt), "invalid salt", "salt", salt);
  assertArgument(isHexString(initCodeHash), "invalid initCodeHash", "initCodeHash", initCodeHash);
  const out = qcsdk.createAddress2(f, normalizeHex(salt), normalizeHex(initCodeHash));
  if (typeof out !== "string") throw makeError("createAddress2 failed", "UNKNOWN_ERROR", { from: f });
  return normalizeHex(out);
}

/**
 * Computes address from a public key.
 * @param {string|Uint8Array} key
 * @returns {string}
 */
function computeAddress(key) {
  _requireInitialized();
  const bytes = typeof key === "string" ? hexToBytes(key) : arrayify(key);
  const pubArr = Array.from(bytes);
  const out = qcsdk.addressFromPublicKey(pubArr);
  if (typeof out !== "string") throw makeError("addressFromPublicKey failed", "UNKNOWN_ERROR", {});
  return normalizeHex(out);
}

function _digestMessage(message) {
  const bytes = typeof message === "string" ? new TextEncoder().encode(message) : arrayify(message);
  const digestHex = sha256(bytes);
  const digest = Array.from(hexToBytes(digestHex));
  assertArgument(digest.length === 32, "invalid digest length", "digest", digest.length);
  return digest;
}

function _signatureToBytes(signature) {
  assertArgument(typeof signature === "string", "signature must be a hex string", "signature", signature);
  assertArgument(isHexString(signature), "invalid signature hex", "signature", signature);
  return Array.from(hexToBytes(signature));
}

/**
 * Verifies a message signature and recovers the address.
 * @param {string|Uint8Array} message
 * @param {string} signature Hex string signature
 * @returns {string}
 */
function verifyMessage(message, signature) {
  return recoverAddress(message, signature);
}

/**
 * Recovers the address from a message signature.
 * @param {string|Uint8Array} message
 * @param {string} signature Hex string signature
 * @returns {string}
 */
function recoverAddress(message, signature) {
  _requireInitialized();
  const digest = _digestMessage(message);
  const sigBytes = _signatureToBytes(signature);
  const pubHex = qcsdk.publicKeyFromSignature(digest, sigBytes);
  if (typeof pubHex !== "string") throw makeError("publicKeyFromSignature failed", "UNKNOWN_ERROR", {});
  const addr = computeAddress(pubHex);
  return addr;
}

module.exports = {
  isAddress,
  getAddress,
  isAddressable,
  resolveAddress,
  getContractAddress,
  getCreateAddress,
  getCreate2Address,
  computeAddress,
  verifyMessage,
  recoverAddress,
};

