/**
 * @fileoverview RLP encoding utilities.
 *
 * SPEC.md section 5.9 mirrors ethers.js v6 RLP helpers.
 *
 * This implementation is self-contained (no vendored ethers.js dependency).
 */

const { arrayify, bytesToHex, hexToBytes, isHexString, normalizeHex, utf8ToBytes } = require("../internal/hex");

function _toBytes(value) {
  if (value == null) return new Uint8Array([]);

  if (value instanceof Uint8Array) return new Uint8Array(value);
  if (Buffer.isBuffer(value)) return new Uint8Array(value);

  if (Array.isArray(value)) {
    // List gets handled elsewhere; here we accept array-of-bytes as a BytesLike.
    if (value.every((v) => Number.isInteger(v) && v >= 0 && v <= 255)) {
      return new Uint8Array(value);
    }
    throw new TypeError("invalid RLP bytes array");
  }

  if (typeof value === "string") {
    // Prefer hex strings (ethers-style); otherwise treat as utf8.
    if (value === "0x" || value === "") return new Uint8Array([]);
    if (isHexString(value)) return hexToBytes(normalizeHex(value));
    return utf8ToBytes(value);
  }

  if (typeof value === "number") {
    if (!Number.isSafeInteger(value) || value < 0) throw new TypeError("invalid RLP number");
    if (value === 0) return new Uint8Array([]);
    let n = BigInt(value);
    const out = [];
    while (n > 0n) {
      out.push(Number(n & 0xffn));
      n >>= 8n;
    }
    out.reverse();
    return new Uint8Array(out);
  }

  if (typeof value === "bigint") {
    if (value < 0n) throw new TypeError("invalid RLP bigint");
    if (value === 0n) return new Uint8Array([]);
    let n = value;
    const out = [];
    while (n > 0n) {
      out.push(Number(n & 0xffn));
      n >>= 8n;
    }
    out.reverse();
    return new Uint8Array(out);
  }

  throw new TypeError("unsupported RLP value type");
}

function _encodeLen(len, offsetShort, offsetLong) {
  if (len <= 55) {
    return new Uint8Array([offsetShort + len]);
  }
  // length-of-length (big-endian)
  let l = len;
  const bytes = [];
  while (l > 0) {
    bytes.push(l & 0xff);
    l >>= 8;
  }
  bytes.reverse();
  return new Uint8Array([offsetLong + bytes.length, ...bytes]);
}

function _concat(a, b) {
  const out = new Uint8Array(a.length + b.length);
  out.set(a, 0);
  out.set(b, a.length);
  return out;
}

function _encode(value) {
  if (Array.isArray(value) && !value.every((v) => Number.isInteger(v) && v >= 0 && v <= 255)) {
    // List
    let payload = new Uint8Array([]);
    for (const item of value) {
      payload = _concat(payload, _encode(item));
    }
    const prefix = _encodeLen(payload.length, 0xc0, 0xf7);
    return _concat(prefix, payload);
  }

  // String/bytes/integer
  const bytes = _toBytes(value);
  if (bytes.length === 1 && bytes[0] < 0x80) {
    return bytes;
  }
  const prefix = _encodeLen(bytes.length, 0x80, 0xb7);
  return _concat(prefix, bytes);
}

function _readLen(bytes, offset, lenOfLen) {
  if (lenOfLen === 0) return 0;
  if (offset + lenOfLen > bytes.length) throw new Error("RLP: insufficient data for length");
  let len = 0;
  for (let i = 0; i < lenOfLen; i++) {
    len = (len << 8) | bytes[offset + i];
  }
  return len;
}

function _decode(bytes, start, end) {
  if (start >= end) throw new Error("RLP: empty input");
  const prefix = bytes[start];

  // Single byte
  if (prefix <= 0x7f) {
    return { value: bytesToHex(new Uint8Array([prefix])), next: start + 1 };
  }

  // Short string
  if (prefix <= 0xb7) {
    const len = prefix - 0x80;
    const dataStart = start + 1;
    const dataEnd = dataStart + len;
    if (dataEnd > end) throw new Error("RLP: out of bounds");
    const out = bytesToHex(bytes.slice(dataStart, dataEnd));
    return { value: out, next: dataEnd };
  }

  // Long string
  if (prefix <= 0xbf) {
    const lenOfLen = prefix - 0xb7;
    const len = _readLen(bytes, start + 1, lenOfLen);
    const dataStart = start + 1 + lenOfLen;
    const dataEnd = dataStart + len;
    if (dataEnd > end) throw new Error("RLP: out of bounds");
    const out = bytesToHex(bytes.slice(dataStart, dataEnd));
    return { value: out, next: dataEnd };
  }

  // Short list
  if (prefix <= 0xf7) {
    const len = prefix - 0xc0;
    const dataStart = start + 1;
    const dataEnd = dataStart + len;
    if (dataEnd > end) throw new Error("RLP: out of bounds");
    const out = [];
    let pos = dataStart;
    while (pos < dataEnd) {
      const decoded = _decode(bytes, pos, dataEnd);
      out.push(decoded.value);
      pos = decoded.next;
    }
    if (pos !== dataEnd) throw new Error("RLP: list length mismatch");
    return { value: out, next: dataEnd };
  }

  // Long list
  const lenOfLen = prefix - 0xf7;
  const len = _readLen(bytes, start + 1, lenOfLen);
  const dataStart = start + 1 + lenOfLen;
  const dataEnd = dataStart + len;
  if (dataEnd > end) throw new Error("RLP: out of bounds");
  const out = [];
  let pos = dataStart;
  while (pos < dataEnd) {
    const decoded = _decode(bytes, pos, dataEnd);
    out.push(decoded.value);
    pos = decoded.next;
  }
  if (pos !== dataEnd) throw new Error("RLP: list length mismatch");
  return { value: out, next: dataEnd };
}

/**
 * RLP-encode a value.
 * @param {any} value
 * @returns {string}
 */
function encodeRlp(value) {
  return bytesToHex(_encode(value));
}

/**
 * RLP-decode a hex string.
 * @param {string} data
 * @returns {any}
 */
function decodeRlp(data) {
  if (typeof data !== "string") throw new TypeError("RLP data must be a hex string");
  const bytes = arrayify(data);
  const decoded = _decode(bytes, 0, bytes.length);
  if (decoded.next !== bytes.length) throw new Error("RLP: trailing data");
  return decoded.value;
}

module.exports = { encodeRlp, decodeRlp };

