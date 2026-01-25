/**
 * @fileoverview Internal hex and bytes helpers.
 *
 * IMPORTANT:
 * - This module intentionally avoids external dependencies.
 * - All hex strings in this SDK are normalized to lowercase with a `0x` prefix.
 */

const { TextEncoder, TextDecoder } = require("util");

/** @type {TextEncoder} */
const _utf8Encoder = new TextEncoder();
/** @type {TextDecoder} */
const _utf8Decoder = new TextDecoder("utf-8", { fatal: false });

/**
 * Return true if `value` is a Uint8Array.
 * @param {any} value
 * @returns {value is Uint8Array}
 */
function isUint8Array(value) {
  return value instanceof Uint8Array;
}

/**
 * Normalize a hex string.
 * @param {string} hex
 * @returns {string}
 */
function normalizeHex(hex) {
  if (typeof hex !== "string") throw new TypeError("hex must be a string");
  let h = hex.toLowerCase();
  if (!h.startsWith("0x")) h = "0x" + h;
  if (h.length % 2 !== 0) h = "0x0" + h.slice(2);
  return h;
}

/**
 * Returns true if value is a hex string.
 * @param {any} value
 * @param {number=} lengthBytes Optional exact byte length.
 * @returns {boolean}
 */
function isHexString(value, lengthBytes) {
  if (typeof value !== "string") return false;
  const v = value.startsWith("0x") ? value.slice(2) : value;
  if (v.length === 0) return false;
  if (!/^[0-9a-fA-F]+$/.test(v)) return false;
  if (v.length % 2 !== 0) return false;
  if (lengthBytes != null) return v.length === lengthBytes * 2;
  return true;
}

/**
 * Strip 0x prefix.
 * @param {string} hex
 * @returns {string}
 */
function strip0x(hex) {
  if (typeof hex !== "string") throw new TypeError("hex must be a string");
  return hex.startsWith("0x") ? hex.slice(2) : hex;
}

/**
 * Ensure a 0x prefix.
 * @param {string} hex
 * @returns {string}
 */
function add0x(hex) {
  if (typeof hex !== "string") throw new TypeError("hex must be a string");
  return hex.startsWith("0x") ? hex : "0x" + hex;
}

/**
 * Convert a hex string to bytes.
 * @param {string} hex
 * @returns {Uint8Array}
 */
function hexToBytes(hex) {
  if (!isHexString(hex)) throw new TypeError("invalid hex string");
  const h = strip0x(hex);
  const out = new Uint8Array(h.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(h.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

/**
 * Convert bytes to hex string.
 * @param {Uint8Array} bytes
 * @returns {string}
 */
function bytesToHex(bytes) {
  if (!isUint8Array(bytes)) throw new TypeError("bytes must be Uint8Array");
  let out = "0x";
  for (const b of bytes) out += b.toString(16).padStart(2, "0");
  return out;
}

/**
 * UTF-8 encode a string to bytes.
 * @param {string} str
 * @returns {Uint8Array}
 */
function utf8ToBytes(str) {
  if (typeof str !== "string") throw new TypeError("str must be a string");
  return _utf8Encoder.encode(str);
}

/**
 * UTF-8 decode bytes to a string.
 * @param {Uint8Array} bytes
 * @returns {string}
 */
function bytesToUtf8(bytes) {
  if (!isUint8Array(bytes)) throw new TypeError("bytes must be Uint8Array");
  return _utf8Decoder.decode(bytes);
}

/**
 * Convert BytesLike to Uint8Array.
 * @param {string | Uint8Array} data
 * @returns {Uint8Array}
 */
function arrayify(data) {
  if (typeof data === "string") return hexToBytes(data);
  if (isUint8Array(data)) return new Uint8Array(data);
  throw new TypeError("unsupported BytesLike");
}

module.exports = {
  isUint8Array,
  normalizeHex,
  isHexString,
  strip0x,
  add0x,
  hexToBytes,
  bytesToHex,
  utf8ToBytes,
  bytesToUtf8,
  arrayify,
};

