/**
 * @fileoverview Fixed-point arithmetic (ethers.js v5/v6 compatible).
 *
 * FixedNumber stores values as a bigint multiplied by 10**decimals,
 * inside a fixed bit-width field.  All instances are immutable.
 */

const { makeError, assertArgument, assert } = require("../errors");
const { arrayify, hexlify, isBytesLike, zeroPad } = require("./encoding");

const BN_N1 = -1n;
const BN_0 = 0n;
const BN_1 = 1n;
const BN_5 = 5n;

const _guard = {};

let _zeros = "0000";
while (_zeros.length < 80) { _zeros += _zeros; }

function _getTens(decimals) {
  let z = _zeros;
  while (z.length < decimals) { z += z; }
  return BigInt("1" + z.substring(0, decimals));
}

function _fromTwos(value, width) {
  const limit = BN_1 << BigInt(width);
  if (value & (limit >> BN_1)) {
    return value - limit;
  }
  return value;
}

function _mask(value, width) {
  return value & ((BN_1 << BigInt(width)) - BN_1);
}

function _checkValue(val, format, safeOp) {
  const width = BigInt(format.width);
  if (format.signed) {
    const limit = BN_1 << (width - BN_1);
    assert(safeOp == null || (val >= -limit && val < limit), "overflow", "NUMERIC_FAULT", {
      operation: safeOp, fault: "overflow", value: val,
    });
    if (val > BN_0) {
      val = _fromTwos(_mask(val, width), format.width);
    } else if (val < BN_0) {
      val = -_fromTwos(_mask(-val, width), format.width);
    }
  } else {
    const limit = BN_1 << width;
    assert(safeOp == null || (val >= BN_0 && val < limit), "overflow", "NUMERIC_FAULT", {
      operation: safeOp, fault: "overflow", value: val,
    });
    val = ((val % limit) + limit) % limit & (limit - BN_1);
  }
  return val;
}

/**
 * @param {import("./units").BigNumberish} value
 * @returns {bigint}
 */
function _getBigInt(value) {
  if (typeof value === "bigint") return value;
  if (typeof value === "number") {
    assertArgument(Number.isInteger(value), "invalid numeric value", "value", value);
    return BigInt(value);
  }
  if (typeof value === "string") {
    const v = value.trim();
    assertArgument(v.length > 0 && /^-?(?:0x[0-9a-fA-F]+|[0-9]+)$/.test(v), "invalid BigNumberish string", "value", value);
    return BigInt(v);
  }
  assertArgument(false, "invalid BigNumberish", "value", value);
}

function _getFormat(value) {
  if (typeof value === "number") { value = `fixed128x${value}`; }

  let signed = true;
  let width = 128;
  let decimals = 18;

  if (typeof value === "string") {
    if (value === "fixed") {
      // defaults
    } else if (value === "ufixed") {
      signed = false;
    } else {
      const match = value.match(/^(u?)fixed([0-9]+)x([0-9]+)$/);
      assertArgument(match, "invalid fixed format", "format", value);
      signed = match[1] !== "u";
      width = parseInt(match[2]);
      decimals = parseInt(match[3]);
    }
  } else if (value != null && typeof value === "object") {
    const check = (key, type, defaultValue) => {
      if (value[key] == null) return defaultValue;
      assertArgument(typeof value[key] === type,
        `invalid fixed format (${key} not ${type})`, `format.${key}`, value[key]);
      return value[key];
    };
    signed = check("signed", "boolean", signed);
    width = check("width", "number", width);
    decimals = check("decimals", "number", decimals);
  }

  assertArgument(width % 8 === 0, "invalid FixedNumber width (not byte aligned)", "format.width", width);
  assertArgument(decimals <= 80, "invalid FixedNumber decimals (too large)", "format.decimals", decimals);

  const name = (signed ? "" : "u") + "fixed" + String(width) + "x" + String(decimals);
  return { signed, width, decimals, name };
}

function _toString(val, decimals) {
  let negative = "";
  if (val < BN_0) {
    negative = "-";
    val *= BN_N1;
  }
  let str = val.toString();
  if (decimals === 0) return negative + str;

  while (str.length <= decimals) { str = _zeros + str; }
  const index = str.length - decimals;
  str = str.substring(0, index) + "." + str.substring(index);

  while (str[0] === "0" && str[1] !== ".") { str = str.substring(1); }
  while (str[str.length - 1] === "0" && str[str.length - 2] !== ".") { str = str.substring(0, str.length - 1); }

  return negative + str;
}

class FixedNumber {
  /**
   * @param {any} guard
   * @param {bigint} value
   * @param {any} format
   */
  constructor(guard, value, format) {
    assertArgument(guard === _guard, "cannot use FixedNumber constructor; use FixedNumber.from", "guard", "INVALID");

    /** @type {bigint} */
    this._val = value;
    /** @type {{ signed: boolean, width: number, decimals: number, name: string }} */
    this._format = format;
    /** @type {string} */
    this.format = format.name;
    /** @type {string} */
    this._value = _toString(value, format.decimals);
    /** @type {bigint} */
    this._tens = _getTens(format.decimals);

    Object.freeze(this);
  }

  get signed() { return this._format.signed; }
  get width() { return this._format.width; }
  get decimals() { return this._format.decimals; }
  get value() { return this._val; }

  _checkFormat(other) {
    assertArgument(this.format === other.format,
      "incompatible format; use fixedNumber.toFormat", "other", other);
  }

  _checkValue(val, safeOp) {
    val = _checkValue(val, this._format, safeOp);
    return new FixedNumber(_guard, val, this._format);
  }

  // --- Arithmetic -----------------------------------------------------------

  _add(o, safeOp) {
    this._checkFormat(o);
    return this._checkValue(this._val + o._val, safeOp);
  }
  addUnsafe(other) { return this._add(other); }
  add(other) { return this._add(other, "add"); }

  _sub(o, safeOp) {
    this._checkFormat(o);
    return this._checkValue(this._val - o._val, safeOp);
  }
  subUnsafe(other) { return this._sub(other); }
  sub(other) { return this._sub(other, "sub"); }

  _mul(o, safeOp) {
    this._checkFormat(o);
    return this._checkValue((this._val * o._val) / this._tens, safeOp);
  }
  mulUnsafe(other) { return this._mul(other); }
  mul(other) { return this._mul(other, "mul"); }

  mulSignal(other) {
    this._checkFormat(other);
    const value = this._val * other._val;
    assert(value % this._tens === BN_0, "precision lost during signalling mul", "NUMERIC_FAULT", {
      operation: "mulSignal", fault: "underflow", value: this,
    });
    return this._checkValue(value / this._tens, "mulSignal");
  }

  _div(o, safeOp) {
    assert(o._val !== BN_0, "division by zero", "NUMERIC_FAULT", {
      operation: "div", fault: "divide-by-zero", value: this,
    });
    this._checkFormat(o);
    return this._checkValue((this._val * this._tens) / o._val, safeOp);
  }
  divUnsafe(other) { return this._div(other); }
  div(other) { return this._div(other, "div"); }

  divSignal(other) {
    assert(other._val !== BN_0, "division by zero", "NUMERIC_FAULT", {
      operation: "div", fault: "divide-by-zero", value: this,
    });
    this._checkFormat(other);
    const value = this._val * this._tens;
    assert(value % other._val === BN_0, "precision lost during signalling div", "NUMERIC_FAULT", {
      operation: "divSignal", fault: "underflow", value: this,
    });
    return this._checkValue(value / other._val, "divSignal");
  }

  // --- Comparison -----------------------------------------------------------

  cmp(other) {
    let a = this._val, b = other._val;
    const delta = this.decimals - other.decimals;
    if (delta > 0) { b *= _getTens(delta); }
    else if (delta < 0) { a *= _getTens(-delta); }
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  }

  eq(other) { return this.cmp(other) === 0; }
  lt(other) { return this.cmp(other) < 0; }
  lte(other) { return this.cmp(other) <= 0; }
  gt(other) { return this.cmp(other) > 0; }
  gte(other) { return this.cmp(other) >= 0; }

  // --- Rounding -------------------------------------------------------------

  floor() {
    let val = this._val;
    if (val < BN_0) { val -= this._tens - BN_1; }
    val = (val / this._tens) * this._tens;
    return this._checkValue(val, "floor");
  }

  ceiling() {
    let val = this._val;
    if (val > BN_0) { val += this._tens - BN_1; }
    val = (val / this._tens) * this._tens;
    return this._checkValue(val, "ceiling");
  }

  round(decimals) {
    if (decimals == null) { decimals = 0; }
    if (decimals >= this.decimals) return this;
    const delta = this.decimals - decimals;
    const bump = BN_5 * _getTens(delta - 1);
    let value = this._val;
    if (value < BN_0) { value -= bump; } else { value += bump; }
    const tens = _getTens(delta);
    value = (value / tens) * tens;
    _checkValue(value, this._format, "round");
    return new FixedNumber(_guard, value, this._format);
  }

  // --- Inspection -----------------------------------------------------------

  isZero() { return this._val === BN_0; }
  isNegative() { return this._val < BN_0; }

  // --- Conversion -----------------------------------------------------------

  toString() { return this._value; }
  toUnsafeFloat() { return parseFloat(this.toString()); }

  toFormat(format) {
    return FixedNumber.fromString(this._value, format);
  }

  toHexString(width) {
    let val = this._val;
    const w = width || this.width;
    if (this._format.signed && val < BN_0) {
      val = (BN_1 << BigInt(w)) + val;
    }
    let hex = val.toString(16);
    const byteLen = w / 8;
    while (hex.length < byteLen * 2) { hex = "0" + hex; }
    return "0x" + hex;
  }

  // --- Static factories -----------------------------------------------------

  static fromValue(_value, decimals, _format) {
    if (decimals == null) { decimals = 0; }
    const format = _getFormat(_format);
    let value = _getBigInt(_value);
    const delta = decimals - format.decimals;
    if (delta > 0) {
      const tens = _getTens(delta);
      assert(value % tens === BN_0, "value loses precision for format", "NUMERIC_FAULT", {
        operation: "fromValue", fault: "underflow", value: _value,
      });
      value /= tens;
    } else if (delta < 0) {
      value *= _getTens(-delta);
    }
    _checkValue(value, format, "fromValue");
    return new FixedNumber(_guard, value, format);
  }

  static fromString(_value, _format) {
    const match = _value.match(/^(-?)([0-9]*)\.?([0-9]*)$/);
    assertArgument(match && (match[2].length + match[3].length) > 0,
      "invalid FixedNumber string value", "value", _value);
    const format = _getFormat(_format);
    let whole = match[2] || "0";
    let decimal = match[3] || "";

    while (decimal.length < format.decimals) { decimal += _zeros; }

    assert(decimal.substring(format.decimals).match(/^0*$/),
      "too many decimals for format", "NUMERIC_FAULT", {
        operation: "fromString", fault: "underflow", value: _value,
      });
    decimal = decimal.substring(0, format.decimals);

    const value = BigInt(match[1] + whole + decimal);
    _checkValue(value, format, "fromString");
    return new FixedNumber(_guard, value, format);
  }

  static fromBytes(_value, _format) {
    let value = BigInt("0x" + hexlify(arrayify(_value)).replace(/^0x/, ""));
    const format = _getFormat(_format);
    if (format.signed) { value = _fromTwos(value, format.width); }
    _checkValue(value, format, "fromBytes");
    return new FixedNumber(_guard, value, format);
  }

  static from(value, format) {
    if (typeof value === "string") return FixedNumber.fromString(value, format);
    if (isBytesLike(value)) return FixedNumber.fromBytes(value, format);
    try {
      return FixedNumber.fromValue(value, 0, format);
    } catch (error) {
      if (error.code !== "INVALID_ARGUMENT") throw error;
    }
    return assertArgument(false, "invalid FixedNumber value", "value", value);
  }

  static isFixedNumber(value) {
    return !!(value && value instanceof FixedNumber);
  }
}

module.exports = { FixedNumber };
