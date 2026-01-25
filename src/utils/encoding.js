/**
 * @fileoverview Encoding/decoding helpers (ethers.js v6 compatible names).
 *
 * Notes:
 * - QuantumCoin addresses are 32 bytes (not 20).
 * - This module intentionally uses only built-in Node.js APIs.
 */

const {
  isUint8Array,
  normalizeHex,
  isHexString,
  strip0x,
  add0x,
  hexToBytes,
  bytesToHex,
  utf8ToBytes,
  bytesToUtf8,
  arrayify: _arrayify,
} = require("../internal/hex");

/**
 * @typedef {string | Uint8Array} BytesLike
 */

/**
 * Converts bytes to UTF-8 string.
 * @param {BytesLike} data
 * @returns {string}
 */
function toUtf8String(data) {
  return bytesToUtf8(arrayify(data));
}

/**
 * Converts string to UTF-8 bytes.
 * @param {string} str
 * @returns {Uint8Array}
 */
function toUtf8Bytes(str) {
  return utf8ToBytes(str);
}

/**
 * Converts data to hex string.
 * @param {BytesLike} data
 * @returns {string}
 */
function toHex(data) {
  if (typeof data === "string") return normalizeHex(data);
  return bytesToHex(arrayify(data));
}

/**
 * Alias for toHex.
 * @param {BytesLike} data
 * @returns {string}
 */
function hexlify(data) {
  return toHex(data);
}

/**
 * Converts data to byte array.
 * @param {BytesLike} data
 * @returns {Uint8Array}
 */
function arrayify(data) {
  return _arrayify(data);
}

/**
 * Returns true if value is BytesLike.
 * @param {any} value
 * @returns {boolean}
 */
function isBytesLike(value) {
  return (typeof value === "string" && isHexString(value)) || isUint8Array(value);
}

/**
 * Concatenates byte arrays and returns a hex string.
 * @param {BytesLike[]} items
 * @returns {string}
 */
function concat(items) {
  if (!Array.isArray(items)) throw new TypeError("items must be an array");
  const parts = items.map((i) => arrayify(i));
  const len = parts.reduce((a, b) => a + b.length, 0);
  const out = new Uint8Array(len);
  let offset = 0;
  for (const p of parts) {
    out.set(p, offset);
    offset += p.length;
  }
  return bytesToHex(out);
}

/**
 * Strips leading zeros from a hex string.
 * @param {BytesLike} data
 * @returns {string}
 */
function stripZerosLeft(data) {
  const hex = toHex(data);
  let h = strip0x(hex);
  h = h.replace(/^0+/, "");
  if (h.length === 0) return "0x";
  if (h.length % 2 !== 0) h = "0" + h;
  return add0x(h);
}

/**
 * Pads a BytesLike value to the left with zeros (byte length).
 * @param {BytesLike} value
 * @param {number} length
 * @returns {string}
 */
function zeroPad(value, length) {
  const bytes = arrayify(value);
  if (bytes.length > length) throw new RangeError("value exceeds length");
  const out = new Uint8Array(length);
  out.set(bytes, length - bytes.length);
  return bytesToHex(out);
}

/**
 * Pads a hex value (interpreted as bytes) to the left with zeros (byte length).
 * @param {BytesLike} value
 * @param {number} length
 * @returns {string}
 */
function zeroPadValue(value, length) {
  return zeroPad(value, length);
}

/**
 * Encodes a short UTF-8 string into a bytes32 hex string.
 * @param {string} text
 * @returns {string}
 */
function encodeBytes32String(text) {
  const bytes = toUtf8Bytes(text);
  if (bytes.length > 32) throw new RangeError("string too long (max 32 bytes)");
  const out = new Uint8Array(32);
  out.set(bytes, 0);
  return bytesToHex(out);
}

/**
 * Decodes a bytes32 hex string into a UTF-8 string (trailing zeros stripped).
 * @param {BytesLike} bytes
 * @returns {string}
 */
function decodeBytes32String(bytes) {
  const b = arrayify(bytes);
  if (b.length !== 32) throw new RangeError("invalid bytes32 length");
  let end = b.length;
  while (end > 0 && b[end - 1] === 0) end--;
  return bytesToUtf8(b.slice(0, end));
}

/**
 * Base64 decode to bytes.
 * @param {string} data
 * @returns {Uint8Array}
 */
function decodeBase64(data) {
  const buf = Buffer.from(data, "base64");
  return new Uint8Array(buf);
}

/**
 * Base64 encode BytesLike.
 * @param {BytesLike} data
 * @returns {string}
 */
function encodeBase64(data) {
  return Buffer.from(arrayify(data)).toString("base64");
}

// Minimal base58 implementation (Bitcoin alphabet) for compatibility with ethers helpers.
const _B58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const _B58_INDEX = new Map(_B58_ALPHABET.split("").map((c, i) => [c, i]));

/**
 * Decode Base58 string to bytes.
 * @param {string} data
 * @returns {Uint8Array}
 */
function decodeBase58(data) {
  if (typeof data !== "string" || data.length === 0) throw new TypeError("invalid base58 string");

  let bytes = [0];
  for (const ch of data) {
    const val = _B58_INDEX.get(ch);
    if (val == null) throw new TypeError("invalid base58 character");

    let carry = val;
    for (let i = 0; i < bytes.length; i++) {
      const x = bytes[i] * 58 + carry;
      bytes[i] = x & 0xff;
      carry = x >> 8;
    }
    while (carry > 0) {
      bytes.push(carry & 0xff);
      carry >>= 8;
    }
  }

  // Deal with leading zeros
  let leading = 0;
  for (const ch of data) {
    if (ch === "1") leading++;
    else break;
  }

  const out = new Uint8Array(leading + bytes.length);
  for (let i = 0; i < bytes.length; i++) out[out.length - 1 - i] = bytes[i];
  return out;
}

/**
 * Encode BytesLike as Base58.
 * @param {BytesLike} data
 * @returns {string}
 */
function encodeBase58(data) {
  const bytes = arrayify(data);
  let digits = [0];

  for (const b of bytes) {
    let carry = b;
    for (let i = 0; i < digits.length; i++) {
      const x = digits[i] * 256 + carry;
      digits[i] = x % 58;
      carry = (x / 58) | 0;
    }
    while (carry > 0) {
      digits.push(carry % 58);
      carry = (carry / 58) | 0;
    }
  }

  // Leading zeros
  let leading = 0;
  for (const b of bytes) {
    if (b === 0) leading++;
    else break;
  }

  let out = "1".repeat(leading);
  for (let i = digits.length - 1; i >= 0; i--) out += _B58_ALPHABET[digits[i]];
  return out;
}

/**
 * Returns UTF-8 code points for a string.
 * @param {string} str
 * @returns {number[]}
 */
function toUtf8CodePoints(str) {
  return Array.from(str).map((c) => c.codePointAt(0) || 0);
}

/**
 * Solidity packed encoding.
 * This is a complex helper in ethers.js; in QuantumCoin.js it is currently not implemented.
 * @throws
 */
function solidityPacked() {
  throw new Error("solidityPacked is not implemented in QuantumCoin.js yet");
}
function solidityPackedKeccak256() {
  throw new Error("solidityPackedKeccak256 is not implemented in QuantumCoin.js yet");
}
function solidityPackedSha256() {
  throw new Error("solidityPackedSha256 is not implemented in QuantumCoin.js yet");
}

module.exports = {
  toUtf8String,
  toUtf8Bytes,
  toHex,
  hexlify,
  arrayify,
  concat,
  stripZerosLeft,
  encodeBytes32String,
  decodeBytes32String,
  decodeBase58,
  decodeBase64,
  encodeBase58,
  encodeBase64,
  toUtf8CodePoints,
  isHexString,
  isBytesLike,
  zeroPad,
  zeroPadValue,
  solidityPacked,
  solidityPackedKeccak256,
  solidityPackedSha256,
  bytesToHex,
  hexToBytes,
};

