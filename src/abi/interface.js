/**
 * @fileoverview Interface and ABI encoding/decoding helpers.
 *
 * This is a compatibility layer modelled after ethers.js v6 `Interface`,
 * but adapted for QuantumCoin. ABI packing/unpacking is delegated to
 * `quantum-coin-js-sdk` (WASM) as required by SPEC.md.
 */

const qcsdk = require("quantum-coin-js-sdk");
const { makeError, assertArgument } = require("../errors");
const { normalizeHex, arrayify, bytesToHex } = require("../internal/hex");
const { EventFragment, FunctionFragment, ErrorFragment, ConstructorFragment } = require("./fragments");
const { Result } = require("../utils/result");
const { id } = require("../utils/hashing");
const jsAbi = require("./js-abi-coder");

function _requireInitialized() {
  // eslint-disable-next-line global-require
  const { isInitialized } = require("../../config");
  if (!isInitialized()) {
    throw makeError("QuantumCoin SDK not initialized. Call Initialize() first.", "UNKNOWN_ERROR", {
      operation: "abi",
    });
  }
}

function _sanitizeArg(value) {
  // quantum-coin-js-sdk WASM interop does not accept BigInt values directly.
  // Convert bigint to a decimal string (ethers-like behaviour).
  if (typeof value === "bigint") return value.toString();
  if (Array.isArray(value)) return value.map(_sanitizeArg);
  if (value && typeof value === "object") {
    // Avoid mutating user input; shallow clone.
    const out = {};
    for (const k of Object.keys(value)) out[k] = _sanitizeArg(value[k]);
    return out;
  }
  return value;
}

function _sanitizeArgs(values) {
  return (Array.isArray(values) ? values : []).map(_sanitizeArg);
}

function _asAbiArray(abi) {
  if (abi == null) return [];
  if (Array.isArray(abi)) return abi;
  if (typeof abi === "object" && typeof abi.formatJson === "function") return JSON.parse(abi.formatJson());
  throw makeError("invalid ABI", "INVALID_ARGUMENT", { abi });
}

function _isNumericString(v) {
  return typeof v === "string" && /^-?\d+$/.test(v.trim());
}

function _normalizeParamTypeForQcsdk(type, components) {
  if (typeof type !== "string") return type;

  // Arrays preserve their shape; normalize the element type.
  if (type.endsWith("]")) {
    const inner = type.slice(0, type.lastIndexOf("["));
    const suffix = type.slice(type.lastIndexOf("["));
    return _normalizeParamTypeForQcsdk(inner, components) + suffix;
  }

  // Tuples: normalize component types recursively.
  if (type === "tuple") return "tuple";

  // quantum-coin-js-sdk currently only reliably packs int256/uint256.
  if (type === "uint" || type.startsWith("uint")) return "uint256";
  if (type === "int" || type.startsWith("int")) return "int256";

  // Fixed-size bytes (bytes1..bytes32) are encoded as a single 32-byte word.
  // Encode them via uint256 (big-endian), with right-padding applied.
  if (type.startsWith("bytes")) {
    const m = type.match(/^bytes(\d+)$/);
    if (m) return "uint256";
  }

  return type;
}

function _normalizeAbiForQcsdk(abi) {
  const out = Array.isArray(abi) ? abi.map((f) => ({ ...(f || {}) })) : [];
  for (const f of out) {
    if (!f || typeof f !== "object") continue;
    const inputs = Array.isArray(f.inputs) ? f.inputs : [];
    const outputs = Array.isArray(f.outputs) ? f.outputs : [];
    const normalizeParams = (params) =>
      params.map((p) => {
        const np = { ...(p || {}) };
        np.type = _normalizeParamTypeForQcsdk(String(np.type || ""), np.components);
        if (Array.isArray(np.components) && np.components.length > 0) {
          np.components = normalizeParams(np.components);
        }
        return np;
      });
    f.inputs = normalizeParams(inputs);
    if (f.type === "function") f.outputs = normalizeParams(outputs);
    if (f.type === "event") f.inputs = normalizeParams(inputs);
    if (f.type === "error") f.inputs = normalizeParams(inputs);
    if (f.type === "constructor") f.inputs = normalizeParams(inputs);
  }
  return out;
}

function _fixedBytesToUint256Decimal(type, value) {
  // Allow already-normalized numeric values.
  if (typeof value === "number") return value;
  if (_isNumericString(value)) return value.trim();

  const m = String(type || "").match(/^bytes(\d+)$/);
  const n = m ? Number(m[1]) : 0;
  if (!Number.isFinite(n) || n < 1 || n > 32) return value;

  const b = arrayify(value);
  if (b.length > n) throw makeError("fixed bytes value exceeds length", "INVALID_ARGUMENT", { type, length: b.length });

  // Right-pad to N bytes, then right-pad to 32 bytes (Solidity fixed bytes encoding).
  const fixed = new Uint8Array(n);
  fixed.set(b, 0);
  const word = new Uint8Array(32);
  word.set(fixed, 0);

  const hexWord = bytesToHex(word); // 0x + 64 hex
  // Convert to decimal string for qcsdk (it can parse uint256 from decimal string).
  return BigInt(hexWord).toString();
}

function _uint256ToFixedBytesHex(type, value) {
  const m = String(type || "").match(/^bytes(\d+)$/);
  const n = m ? Number(m[1]) : 0;
  if (!Number.isFinite(n) || n < 1 || n > 32) return value;
  if (value == null) return value;

  const bi = typeof value === "bigint" ? value : BigInt(value);
  let hex = bi.toString(16);
  if (hex.length > 64) hex = hex.slice(-64);
  hex = hex.padStart(64, "0");
  // bytesN is the first N bytes (right-padded in the 32-byte word).
  return normalizeHex("0x" + hex.slice(0, n * 2));
}

function _convertInputValueForQcsdk(param, value) {
  const type = String(param && param.type ? param.type : "");

  // Apply bigint sanitization early.
  const v = _sanitizeArg(value);

  // Arrays
  if (type.endsWith("]")) {
    const innerType = type.slice(0, type.lastIndexOf("["));
    const innerParam = { ...(param || {}), type: innerType };
    if (!Array.isArray(v)) return v;
    return v.map((x) => _convertInputValueForQcsdk(innerParam, x));
  }

  // Tuples
  if (type === "tuple") {
    const comps = Array.isArray(param && param.components) ? param.components : [];
    if (Array.isArray(v)) {
      return v.map((x, idx) => _convertInputValueForQcsdk(comps[idx] || { type: "uint256" }, x));
    }
    if (v && typeof v === "object") {
      const out = {};
      for (let i = 0; i < comps.length; i++) {
        const c = comps[i];
        const name = c && typeof c.name === "string" && c.name ? c.name : String(i);
        out[name] = _convertInputValueForQcsdk(c, v[name] != null ? v[name] : v[String(i)]);
      }
      return out;
    }
    return v;
  }

  // Fixed bytes
  const mBytes = type.match(/^bytes(\d+)$/);
  if (mBytes) {
    return _fixedBytesToUint256Decimal(type, v);
  }

  return v;
}

function _convertOutputValueFromQcsdk(param, value) {
  const type = String(param && param.type ? param.type : "");

  if (type.endsWith("]")) {
    const innerType = type.slice(0, type.lastIndexOf("["));
    const innerParam = { ...(param || {}), type: innerType };
    if (!Array.isArray(value)) return value;
    return value.map((x) => _convertOutputValueFromQcsdk(innerParam, x));
  }

  if (type === "tuple") {
    const comps = Array.isArray(param && param.components) ? param.components : [];
    if (Array.isArray(value)) {
      return value.map((x, idx) => _convertOutputValueFromQcsdk(comps[idx] || { type: "uint256" }, x));
    }
    if (value && typeof value === "object") {
      const out = {};
      for (let i = 0; i < comps.length; i++) {
        const c = comps[i];
        const name = c && typeof c.name === "string" && c.name ? c.name : String(i);
        const raw = Object.prototype.hasOwnProperty.call(value, name)
          ? value[name]
          : Object.prototype.hasOwnProperty.call(value, String(i))
            ? value[String(i)]
            : undefined;
        out[name] = _convertOutputValueFromQcsdk(c, raw);
      }
      return out;
    }
    return value;
  }

  const mBytes = type.match(/^bytes(\d+)$/);
  if (mBytes) {
    return _uint256ToFixedBytesHex(type, value);
  }

  // Normalize integer outputs to bigint for consistency with core typings.
  if (type === "uint" || type.startsWith("uint") || type === "int" || type.startsWith("int")) {
    if (value == null) return value;
    if (typeof value === "bigint") return value;
    try {
      return BigInt(value);
    } catch {
      return value;
    }
  }

  return value;
}

class Interface {
  /**
   * @param {any[]|Interface} abi
   */
  constructor(abi) {
    this.abi = _asAbiArray(abi);
    this._abiJson = JSON.stringify(this.abi);
    this._qcsdkAbi = _normalizeAbiForQcsdk(this.abi);
    this._qcsdkAbiJson = JSON.stringify(this._qcsdkAbi);
  }

  /**
   * Returns JSON format of ABI.
   * @returns {string}
   */
  formatJson() {
    return this._abiJson;
  }

  /**
   * Internal: normalized ABI JSON for qcsdk.
   * @returns {string}
   */
  _qcsdkFormatJson() {
    return this._qcsdkAbiJson;
  }

  /**
   * Internal: normalize argument values for qcsdk based on original ABI params.
   * @param {Array<any>} params
   * @param {Array<any>} values
   * @returns {Array<any>}
   */
  _qcsdkNormalizeValues(params, values) {
    const ps = Array.isArray(params) ? params : [];
    const vs = Array.isArray(values) ? values : [];
    return ps.map((p, i) => _convertInputValueForQcsdk(p, vs[i]));
  }

  /**
   * Basic formatter (ethers supports multiple formats).
   * @param {string=} format
   * @returns {string}
   */
  format(format) {
    void format;
    return this._abiJson;
  }

  /**
   * Get a function fragment by name (first match).
   * @param {string} nameOrSignature
   * @returns {FunctionFragment}
   */
  getFunction(nameOrSignature) {
    assertArgument(typeof nameOrSignature === "string", "name must be a string", "nameOrSignature", nameOrSignature);
    const found = this.abi.find((f) => f && f.type === "function" && f.name === nameOrSignature);
    if (!found) throw makeError("function not found", "INVALID_ARGUMENT", { nameOrSignature });
    return new FunctionFragment(found);
  }

  /**
   * Get an event fragment by name (first match).
   * @param {string} nameOrSignature
   * @returns {EventFragment}
   */
  getEvent(nameOrSignature) {
    assertArgument(typeof nameOrSignature === "string", "name must be a string", "nameOrSignature", nameOrSignature);
    const found = this.abi.find((f) => f && f.type === "event" && f.name === nameOrSignature);
    if (!found) throw makeError("event not found", "INVALID_ARGUMENT", { nameOrSignature });
    return new EventFragment(found);
  }

  /**
   * Get an error fragment by name (first match).
   * @param {string} nameOrSignature
   * @returns {ErrorFragment}
   */
  getError(nameOrSignature) {
    assertArgument(typeof nameOrSignature === "string", "name must be a string", "nameOrSignature", nameOrSignature);
    const found = this.abi.find((f) => f && f.type === "error" && f.name === nameOrSignature);
    if (!found) throw makeError("error not found", "INVALID_ARGUMENT", { nameOrSignature });
    return new ErrorFragment(found);
  }

  /**
   * Returns the constructor fragment if present.
   * @returns {ConstructorFragment|null}
   */
  getConstructor() {
    const found = this.abi.find((f) => f && f.type === "constructor");
    return found ? new ConstructorFragment(found) : null;
  }

  /**
   * Encode function data using quantum-coin-js-sdk.
   * @param {FunctionFragment|string} functionFragment
   * @param {any[]} values
   * @returns {string}
   */
  encodeFunctionData(functionFragment, values) {
    _requireInitialized();
    const name = typeof functionFragment === "string" ? functionFragment : functionFragment?.name;
    assertArgument(typeof name === "string" && name.length > 0, "invalid function", "functionFragment", functionFragment);
    const frag = this.getFunction(name);
    const inputs = Array.isArray(frag.inputs) ? frag.inputs : [];
    const rawArgs = Array.isArray(values) ? values : [];

    // Fallback for complex ABI surfaces where qcsdk packing is unreliable.
    if (jsAbi.needsJsAbi(inputs)) {
      return jsAbi.encodeFunctionData(name, inputs, rawArgs);
    }

    const args = inputs.map((p, idx) => _convertInputValueForQcsdk(p, rawArgs[idx]));
    const res = qcsdk.packMethodData(this._qcsdkAbiJson, name, ...args);
    if (!res || typeof res.error !== "string") throw makeError("packMethodData failed", "UNKNOWN_ERROR", {});
    if (res.error) throw makeError(res.error, "UNKNOWN_ERROR", { operation: "packMethodData", function: name });
    return normalizeHex(res.result);
  }

  /**
   * Decode function result using quantum-coin-js-sdk.
   * @param {FunctionFragment|string} functionFragment
   * @param {string} data
   * @returns {any}
   */
  decodeFunctionResult(functionFragment, data) {
    _requireInitialized();
    const name = typeof functionFragment === "string" ? functionFragment : functionFragment?.name;
    assertArgument(typeof name === "string" && name.length > 0, "invalid function", "functionFragment", functionFragment);
    assertArgument(typeof data === "string", "data must be a hex string", "data", data);
    const frag = this.getFunction(name);
    const outputs = Array.isArray(frag.outputs) ? frag.outputs : [];

    // Fallback for complex output surfaces.
    if (jsAbi.needsJsAbi(outputs)) {
      return jsAbi.decodeFunctionResult(outputs, data);
    }

    const res = qcsdk.unpackMethodData(this._qcsdkAbiJson, name, data);
    if (!res || typeof res.error !== "string") throw makeError("unpackMethodData failed", "UNKNOWN_ERROR", {});
    if (res.error) throw makeError(res.error, "UNKNOWN_ERROR", { operation: "unpackMethodData", function: name });
    try {
      const decoded = JSON.parse(res.result);
      // qcsdk generally returns an array for function outputs; convert bytesN back to hex.
      if (Array.isArray(decoded)) {
        return decoded.map((v, i) => _convertOutputValueFromQcsdk(outputs[i] || { type: "uint256" }, v));
      }
      return _convertOutputValueFromQcsdk(outputs[0] || { type: "uint256" }, decoded);
    } catch {
      return res.result;
    }
  }

  /**
   * Encode an event log from values.
   * @param {EventFragment|any} eventFragment
   * @param {any[]} values
   * @returns {{ topics: string[], data: string }}
   */
  encodeEventLog(eventFragment, values) {
    _requireInitialized();
    const name = typeof eventFragment === "string" ? eventFragment : eventFragment?.name;
    assertArgument(typeof name === "string" && name.length > 0, "invalid event", "eventFragment", eventFragment);
    const frag = this.getEvent(name);
    const inputs = Array.isArray(frag.inputs) ? frag.inputs : [];
    const rawArgs = Array.isArray(values) ? values : [];
    const args = inputs.map((p, idx) => _convertInputValueForQcsdk(p, rawArgs[idx]));
    const res = qcsdk.encodeEventLog(this._qcsdkAbiJson, name, ...args);
    if (!res || typeof res.error !== "string") throw makeError("encodeEventLog failed", "UNKNOWN_ERROR", {});
    if (res.error) throw makeError(res.error, "UNKNOWN_ERROR", { operation: "encodeEventLog", event: name });
    return res.result;
  }

  /**
   * Decode an event log.
   * @param {EventFragment|any} eventFragment
   * @param {string[]} topics
   * @param {string} data
   * @returns {any}
   */
  decodeEventLog(eventFragment, topics, data) {
    _requireInitialized();
    const name = typeof eventFragment === "string" ? eventFragment : eventFragment?.name;
    assertArgument(typeof name === "string" && name.length > 0, "invalid event", "eventFragment", eventFragment);
    assertArgument(Array.isArray(topics), "topics must be an array", "topics", topics);
    assertArgument(typeof data === "string", "data must be a string", "data", data);
    const frag = this.getEvent(name);
    const inputs = Array.isArray(frag.inputs) ? frag.inputs : [];
    const res = qcsdk.decodeEventLog(this._qcsdkAbiJson, name, topics, data);
    if (!res || typeof res.error !== "string") throw makeError("decodeEventLog failed", "UNKNOWN_ERROR", {});
    if (res.error) throw makeError(res.error, "UNKNOWN_ERROR", { operation: "decodeEventLog", event: name });
    try {
      const decoded = JSON.parse(res.result);
      if (Array.isArray(decoded)) {
        return decoded.map((v, i) => _convertOutputValueFromQcsdk(inputs[i] || { type: "uint256" }, v));
      }
      return decoded;
    } catch {
      return res.result;
    }
  }

  // The following methods exist in ethers.js v6. We provide placeholders to keep API shape.
  parseTransaction() {
    throw makeError("parseTransaction not implemented", "NOT_IMPLEMENTED", {});
  }
  parseLog() {
    _requireInitialized();
    const log = arguments.length > 0 ? arguments[0] : null;
    assertArgument(log && typeof log === "object", "log must be an object", "log", log);

    const topics = log.topics;
    const data = log.data;
    assertArgument(Array.isArray(topics), "log.topics must be an array", "log.topics", topics);
    assertArgument(typeof data === "string", "log.data must be a string", "log.data", data);
    assertArgument(topics.length > 0, "log.topics must contain at least 1 topic", "log.topics", topics);

    const topic0 = normalizeHex(String(topics[0]));

    // Find event by signature topic. (Anonymous events cannot be auto-detected.)
    /** @type {any|null} */
    let matched = null;
    /** @type {string|null} */
    let signature = null;

    for (const f of this.abi) {
      if (!f || f.type !== "event") continue;
      if (f.anonymous) continue;
      if (!f.name) continue;
      const inputs = Array.isArray(f.inputs) ? f.inputs : [];
      const sig = `${f.name}(${inputs.map((i) => String(i.type || "")).join(",")})`;
      const t = normalizeHex(id(sig));
      if (t === topic0) {
        matched = f;
        signature = sig;
        break;
      }
    }

    if (!matched) {
      throw makeError("no matching event for log.topics[0]", "INVALID_ARGUMENT", { topic0 });
    }

    const fragment = new EventFragment(matched);
    const decoded = this.decodeEventLog(fragment.name, topics.map((t) => normalizeHex(String(t))), normalizeHex(data));

    const inputs = Array.isArray(matched.inputs) ? matched.inputs : [];
    const keys = inputs.map((i) => (i && typeof i.name === "string" && i.name.length ? i.name : null));

    let items = [];
    if (Array.isArray(decoded)) {
      items = decoded;
    } else if (decoded && typeof decoded === "object") {
      items = inputs.map((i, idx) => {
        const n = i && typeof i.name === "string" ? i.name : null;
        if (n && Object.prototype.hasOwnProperty.call(decoded, n)) return decoded[n];
        if (Object.prototype.hasOwnProperty.call(decoded, String(idx))) return decoded[String(idx)];
        return undefined;
      });
    } else {
      items = inputs.map(() => decoded);
    }

    const args = Result.fromItems(items, keys);
    return {
      fragment,
      name: fragment.name,
      signature: signature || fragment.name,
      topic: topic0,
      args,
    };
  }
  parseError() {
    throw makeError("parseError not implemented", "NOT_IMPLEMENTED", {});
  }
  getSighash() {
    throw makeError("getSighash not implemented", "NOT_IMPLEMENTED", {});
  }
  getEventTopic() {
    throw makeError("getEventTopic not implemented", "NOT_IMPLEMENTED", {});
  }
  getFallback() {
    return null;
  }
  getReceive() {
    return null;
  }
}

class AbiCoder {
  /**
   * Encode values by types into ABI data.
   * @param {(string|any)[]} types
   * @param {any[]} values
   * @returns {string}
   */
  encode(types, values) {
    _requireInitialized();
    assertArgument(Array.isArray(types), "types must be an array", "types", types);
    assertArgument(Array.isArray(values), "values must be an array", "values", values);

    const abi = [
      {
        type: "function",
        name: "__encode",
        stateMutability: "pure",
        inputs: types.map((t, i) => ({ name: `arg${i}`, type: String(t) })),
        outputs: [],
      },
    ];
    const iface = new Interface(abi);
    const full = iface.encodeFunctionData("__encode", values);
    // Strip the 4-byte selector (8 hex chars) + 0x
    return "0x" + full.slice(10);
  }

  /**
   * Decode ABI data by output types.
   * @param {(string|any)[]} types
   * @param {string} data
   * @returns {any}
   */
  decode(types, data) {
    _requireInitialized();
    assertArgument(Array.isArray(types), "types must be an array", "types", types);
    assertArgument(typeof data === "string", "data must be a string", "data", data);

    const abi = [
      {
        type: "function",
        name: "__decode",
        stateMutability: "pure",
        inputs: [],
        outputs: types.map((t, i) => ({ name: `ret${i}`, type: String(t) })),
      },
    ];
    const iface = new Interface(abi);
    return iface.decodeFunctionResult("__decode", data);
  }

  /**
   * Return a default value for types.
   * @param {(string|any)[]} types
   * @returns {any}
   */
  getDefaultValue(types) {
    // Lightweight default; ethers returns a Result. Here we return array of nulls.
    assertArgument(Array.isArray(types), "types must be an array", "types", types);
    return types.map(() => null);
  }
}

module.exports = { Interface, AbiCoder };

