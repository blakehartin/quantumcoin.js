/**
 * @fileoverview Pure-JS ABI encoder/decoder (Solidity ABI compatible).
 *
 * This exists as a fallback for ABI surfaces that `quantum-coin-js-sdk` does not
 * currently handle correctly (notably: tuples/structs and complex nested types).
 *
 * Notes:
 * - QuantumCoin addresses are 32 bytes (not 20).
 * - Integers are encoded as 32-byte words (big-endian), with range enforcement.
 */

const { makeError } = require("../errors");
const { normalizeHex, strip0x, arrayify, bytesToHex, utf8ToBytes, bytesToUtf8 } = require("../internal/hex");
const { id } = require("../utils/hashing");

function _isArrayType(type) {
  return typeof type === "string" && type.endsWith("]");
}

function _arrayInnerType(type) {
  return type.slice(0, type.lastIndexOf("["));
}

function _arrayBracket(type) {
  return type.slice(type.lastIndexOf("[") + 1, type.length - 1); // "" for dynamic
}

function _isDynamicArray(type) {
  return _isArrayType(type) && _arrayBracket(type) === "";
}

function _isFixedArray(type) {
  return _isArrayType(type) && _arrayBracket(type) !== "";
}

function _fixedArrayLength(type) {
  const n = Number(_arrayBracket(type));
  return Number.isFinite(n) ? n : 0;
}

function _isBytesN(type) {
  return /^bytes(\d+)$/.test(type);
}

function _bytesNLen(type) {
  const m = type.match(/^bytes(\d+)$/);
  const n = m ? Number(m[1]) : 0;
  return Number.isFinite(n) ? n : 0;
}

function _isUint(type) {
  return type === "uint" || /^uint(\d+)$/.test(type);
}

function _isInt(type) {
  return type === "int" || /^int(\d+)$/.test(type);
}

function _intBits(type) {
  if (type === "uint" || type === "int") return 256;
  const m = type.match(/^(u?int)(\d+)$/);
  const n = m ? Number(m[2]) : 0;
  return Number.isFinite(n) && n > 0 ? n : 256;
}

function _isDynamicType(param) {
  const type = String(param && param.type ? param.type : "");
  if (_isArrayType(type)) {
    const innerParam = { ...(param || {}), type: _arrayInnerType(type) };
    return _isDynamicArray(type) || _isDynamicType(innerParam);
  }
  if (type === "string" || type === "bytes") return true;
  if (type === "tuple") {
    const comps = Array.isArray(param.components) ? param.components : [];
    return comps.some(_isDynamicType);
  }
  return false;
}

function _staticWords(param) {
  const type = String(param && param.type ? param.type : "");
  if (_isDynamicType(param)) return 1; // head word is offset
  if (_isArrayType(type)) {
    const innerParam = { ...(param || {}), type: _arrayInnerType(type) };
    if (_isFixedArray(type)) return _fixedArrayLength(type) * _staticWords(innerParam);
    // dynamic arrays are dynamic types (handled above)
  }
  if (type === "tuple") {
    const comps = Array.isArray(param.components) ? param.components : [];
    return comps.reduce((a, c) => a + _staticWords(c), 0);
  }
  // elementary static types => 1 word
  return 1;
}

function _padRightTo32(bytes) {
  const pad = (32 - (bytes.length % 32)) % 32;
  if (pad === 0) return bytes;
  const out = new Uint8Array(bytes.length + pad);
  out.set(bytes, 0);
  return out;
}

function _concat(parts) {
  const len = parts.reduce((a, b) => a + b.length, 0);
  const out = new Uint8Array(len);
  let off = 0;
  for (const p of parts) {
    out.set(p, off);
    off += p.length;
  }
  return out;
}

function _u256ToWord(bi) {
  let x = bi;
  if (x < 0n) throw new Error("uint must be non-negative");
  let hex = x.toString(16);
  if (hex.length > 64) hex = hex.slice(-64);
  hex = hex.padStart(64, "0");
  return arrayify("0x" + hex);
}

function _checkUintRange(bi, bits) {
  const b = BigInt(bits);
  const max = 1n << b;
  if (bi < 0n || bi >= max) {
    throw makeError("uint value out of range", "INVALID_ARGUMENT", { value: bi.toString(), bits });
  }
}

function _checkIntRange(bi, bits) {
  const b = BigInt(bits);
  const min = -(1n << (b - 1n));
  const max = (1n << (b - 1n)) - 1n;
  if (bi < min || bi > max) {
    throw makeError("int value out of range", "INVALID_ARGUMENT", { value: bi.toString(), bits });
  }
}

function _encodeIntWord(bi, bits) {
  // Solidity ABI sign-extends int<M> to 256 bits.
  _checkIntRange(bi, bits);
  const mod256 = 1n << 256n;
  const x = bi < 0n ? mod256 + bi : bi;
  return _u256ToWord(x);
}

function _asBigInt(value) {
  if (typeof value === "bigint") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw makeError("invalid number", "INVALID_ARGUMENT", { value });
    return BigInt(Math.trunc(value));
  }
  if (typeof value === "string") {
    const s = value.trim();
    if (/^0x[0-9a-fA-F]+$/.test(s)) return BigInt(s);
    if (/^-?\d+$/.test(s)) return BigInt(s);
  }
  throw makeError("invalid bigint-ish value", "INVALID_ARGUMENT", { value });
}

function _encodeAddress(value) {
  const h = normalizeHex(String(value));
  const b = arrayify(h);
  if (b.length > 32) throw makeError("address too long", "INVALID_ARGUMENT", { value });
  // Left-pad to 32 bytes.
  const out = new Uint8Array(32);
  out.set(b, 32 - b.length);
  return out;
}

function _encodeFixedBytes(type, value) {
  const n = _bytesNLen(type);
  const b = arrayify(value);
  if (b.length !== n) throw makeError("invalid fixed bytes length", "INVALID_ARGUMENT", { type, length: b.length });
  const out = new Uint8Array(32);
  out.set(b, 0);
  return out;
}

function _encodeBytesDynamic(value) {
  const b = arrayify(value);
  const lenWord = _u256ToWord(BigInt(b.length));
  return _concat([lenWord, _padRightTo32(b)]);
}

function _encodeString(value) {
  const bytes = utf8ToBytes(String(value));
  const lenWord = _u256ToWord(BigInt(bytes.length));
  return _concat([lenWord, _padRightTo32(bytes)]);
}

function _tupleValues(components, value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") {
    return components.map((c, i) => {
      const name = c && typeof c.name === "string" && c.name ? c.name : String(i);
      if (Object.prototype.hasOwnProperty.call(value, name)) return value[name];
      if (Object.prototype.hasOwnProperty.call(value, String(i))) return value[String(i)];
      return undefined;
    });
  }
  return [];
}

function encodeTupleLike(params, values) {
  const ps = Array.isArray(params) ? params : [];
  const vs = Array.isArray(values) ? values : [];

  const headWords = ps.reduce((a, p) => a + (_isDynamicType(p) ? 1 : _staticWords(p)), 0);
  const headSize = headWords * 32;

  /** @type {Uint8Array[]} */
  const headParts = [];
  /** @type {Uint8Array[]} */
  const tailParts = [];
  let tailOffset = 0;

  for (let i = 0; i < ps.length; i++) {
    const p = ps[i];
    const v = vs[i];
    if (_isDynamicType(p)) {
      const encTail = encodeParam(p, v);
      headParts.push(_u256ToWord(BigInt(headSize + tailOffset)));
      tailParts.push(encTail);
      tailOffset += encTail.length;
    } else {
      headParts.push(encodeParam(p, v));
    }
  }

  return _concat([...headParts, ...tailParts]);
}

function encodeParam(param, value) {
  const type = String(param && param.type ? param.type : "");

  if (_isArrayType(type)) {
    const innerType = _arrayInnerType(type);
    const innerParam = { ...(param || {}), type: innerType };
    const arr = Array.isArray(value) ? value : [];

    if (_isDynamicArray(type)) {
      const lenWord = _u256ToWord(BigInt(arr.length));
      const elems = encodeTupleLike(Array.from({ length: arr.length }).map(() => innerParam), arr);
      return _concat([lenWord, elems]);
    }

    // fixed array
    const n = _fixedArrayLength(type);
    const elems = encodeTupleLike(Array.from({ length: n }).map(() => innerParam), arr.slice(0, n));
    return elems;
  }

  if (type === "tuple") {
    const comps = Array.isArray(param.components) ? param.components : [];
    const vals = _tupleValues(comps, value);
    return encodeTupleLike(comps, vals);
  }

  if (_isUint(type)) {
    const bits = _intBits(type);
    const bi = _asBigInt(value);
    _checkUintRange(bi, bits);
    return _u256ToWord(bi);
  }
  if (_isInt(type)) return _encodeIntWord(_asBigInt(value), _intBits(type));
  if (type === "bool") return _u256ToWord(value ? 1n : 0n);
  if (type === "address") return _encodeAddress(value);
  if (type === "string") return _encodeString(value);
  if (type === "bytes") return _encodeBytesDynamic(value);
  if (_isBytesN(type)) return _encodeFixedBytes(type, value);

  throw makeError("unsupported ABI type", "NOT_IMPLEMENTED", { type });
}

function canonicalType(param) {
  const type = String(param && param.type ? param.type : "");
  if (_isArrayType(type)) {
    const innerType = _arrayInnerType(type);
    const suffix = type.slice(type.lastIndexOf("["));
    return canonicalType({ ...(param || {}), type: innerType }) + suffix;
  }
  if (type === "tuple") {
    const comps = Array.isArray(param.components) ? param.components : [];
    return `(${comps.map((c) => canonicalType(c)).join(",")})`;
  }
  return type;
}

function functionSelectorHex(name, inputs) {
  const sig = `${name}(${(inputs || []).map((i) => canonicalType(i)).join(",")})`;
  return normalizeHex(id(sig)).slice(0, 10);
}

function encodeFunctionData(name, inputs, values) {
  const selector = functionSelectorHex(name, inputs);
  const enc = encodeTupleLike(inputs, values || []);
  return normalizeHex(selector + strip0x(bytesToHex(enc)));
}

function _readWordAsBigInt(data, offset) {
  const chunk = data.slice(offset, offset + 32);
  const hex = bytesToHex(chunk);
  return BigInt(hex);
}

function _readWordAsNumber(data, offset) {
  const bi = _readWordAsBigInt(data, offset);
  if (bi > BigInt(Number.MAX_SAFE_INTEGER)) throw makeError("offset too large", "INVALID_ARGUMENT", { offset: bi.toString() });
  return Number(bi);
}

function _decodeUint(type, data, offset) {
  void type;
  return _readWordAsBigInt(data, offset);
}

function _decodeInt(type, data, offset) {
  const bits = _intBits(type);
  const bi = _readWordAsBigInt(data, offset);
  const mod = 1n << BigInt(bits);
  const mask = mod - 1n;
  const trunc = bi & mask; // int<M> is sign-extended; recover the low M bits
  const signBit = 1n << BigInt(bits - 1);
  const signed = trunc & signBit ? trunc - mod : trunc;
  return signed;
}

function _decodeBool(data, offset) {
  const bi = _readWordAsBigInt(data, offset);
  return bi !== 0n;
}

function _decodeAddress(data, offset) {
  const chunk = data.slice(offset, offset + 32);
  return normalizeHex(bytesToHex(chunk));
}

function _decodeFixedBytes(type, data, offset) {
  const n = _bytesNLen(type);
  const chunk = data.slice(offset, offset + 32);
  return normalizeHex(bytesToHex(chunk.slice(0, n)));
}

function _decodeBytesDynamic(data, baseOffset) {
  const len = _readWordAsNumber(data, baseOffset);
  const start = baseOffset + 32;
  const out = data.slice(start, start + len);
  return normalizeHex(bytesToHex(out));
}

function _decodeString(data, baseOffset) {
  const len = _readWordAsNumber(data, baseOffset);
  const start = baseOffset + 32;
  const out = data.slice(start, start + len);
  return bytesToUtf8(out);
}

function decodeTupleLike(params, data, baseOffset) {
  const ps = Array.isArray(params) ? params : [];

  // Compute head size for this tuple-like block.
  const headWords = ps.reduce((a, p) => a + (_isDynamicType(p) ? 1 : _staticWords(p)), 0);
  const headSize = headWords * 32;

  /** @type {any[]} */
  const values = [];
  let headOff = 0;

  for (let i = 0; i < ps.length; i++) {
    const p = ps[i];
    if (_isDynamicType(p)) {
      const rel = _readWordAsNumber(data, baseOffset + headOff);
      values.push(decodeParam(p, data, baseOffset + rel));
      headOff += 32;
    } else {
      values.push(decodeParam(p, data, baseOffset + headOff));
      headOff += _staticWords(p) * 32;
    }
  }

  // Ignore headSize; decodeParam consumes offsets itself.
  void headSize;
  return values;
}

function decodeParam(param, data, offset) {
  const type = String(param && param.type ? param.type : "");

  if (_isArrayType(type)) {
    const innerType = _arrayInnerType(type);
    const innerParam = { ...(param || {}), type: innerType };

    if (_isDynamicArray(type)) {
      const len = _readWordAsNumber(data, offset);
      const elems = decodeTupleLike(Array.from({ length: len }).map(() => innerParam), data, offset + 32);
      return elems;
    }

    const n = _fixedArrayLength(type);
    return decodeTupleLike(Array.from({ length: n }).map(() => innerParam), data, offset);
  }

  if (type === "tuple") {
    const comps = Array.isArray(param.components) ? param.components : [];
    const vals = decodeTupleLike(comps, data, offset);
    const out = {};
    for (let i = 0; i < comps.length; i++) {
      const c = comps[i];
      const name = c && typeof c.name === "string" && c.name ? c.name : String(i);
      out[name] = vals[i];
    }
    return out;
  }

  if (_isUint(type)) return _decodeUint(type, data, offset);
  if (_isInt(type)) return _decodeInt(type, data, offset);
  if (type === "bool") return _decodeBool(data, offset);
  if (type === "address") return _decodeAddress(data, offset);
  if (type === "bytes") return _decodeBytesDynamic(data, offset);
  if (type === "string") return _decodeString(data, offset);
  if (_isBytesN(type)) return _decodeFixedBytes(type, data, offset);

  throw makeError("unsupported ABI type", "NOT_IMPLEMENTED", { type });
}

function decodeFunctionResult(outputs, dataHex) {
  const data = arrayify(dataHex);
  return decodeTupleLike(outputs || [], data, 0);
}

function hasTuple(params) {
  const ps = Array.isArray(params) ? params : [];
  for (const p of ps) {
    const type = String(p && p.type ? p.type : "");
    if (type === "tuple") return true;
    if (_isArrayType(type) && hasTuple([{ ...(p || {}), type: _arrayInnerType(type) }])) return true;
    if (Array.isArray(p && p.components) && hasTuple(p.components)) return true;
  }
  return false;
}

function hasNestedArrays(params) {
  const ps = Array.isArray(params) ? params : [];
  for (const p of ps) {
    const type = String(p && p.type ? p.type : "");
    if (_isArrayType(type)) {
      const inner = _arrayInnerType(type);
      if (_isArrayType(inner)) return true;
      if (hasNestedArrays([{ ...(p || {}), type: inner }])) return true;
    }
    if (type === "tuple" && Array.isArray(p && p.components) && hasNestedArrays(p.components)) return true;
    if (Array.isArray(p && p.components) && hasNestedArrays(p.components)) return true;
  }
  return false;
}

function needsJsAbi(params) {
  return hasTuple(params) || hasNestedArrays(params);
}

module.exports = {
  hasTuple,
  hasNestedArrays,
  needsJsAbi,
  canonicalType,
  functionSelectorHex,
  encodeFunctionData,
  encodeTupleLike,
  decodeFunctionResult,
};

