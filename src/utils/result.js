/**
 * @fileoverview Result utility (ethers.js v6 compatible).
 *
 * ethers.js Result is an Array-like with optional named keys.
 * This simplified implementation covers the common patterns used in this SDK.
 */

class Result extends Array {
  /**
   * @param {any[]=} items
   * @param {(null|string)[]=} keys
   */
  constructor(items, keys) {
    super();
    if (Array.isArray(items)) this.push(...items);
    /** @type {(null|string)[]|null} */
    this._keys = Array.isArray(keys) ? keys : null;

    if (this._keys) {
      for (let i = 0; i < this._keys.length; i++) {
        const k = this._keys[i];
        if (k) this[k] = this[i];
      }
    }
  }

  /**
   * @param {Array<any>} items
   * @param {Array<null|string>=} keys
   * @returns {Result}
   */
  static fromItems(items, keys) {
    return new Result(items, keys);
  }

  /**
   * Get a value by key.
   * @param {string} name
   * @returns {any}
   */
  getValue(name) {
    return this[name];
  }

  /**
   * Convert to array (optionally deep).
   * @param {boolean=} deep
   * @returns {any[]}
   */
  toArray(deep) {
    if (!deep) return Array.from(this);
    return Array.from(this).map((v) => (v instanceof Result ? v.toArray(true) : v));
  }

  /**
   * Convert to object (optionally deep).
   * @param {boolean=} deep
   * @returns {Record<string, any>}
   */
  toObject(deep) {
    const out = {};
    if (!this._keys) return out;
    for (const k of this._keys) {
      if (!k) continue;
      const v = this[k];
      out[k] = deep && v instanceof Result ? v.toObject(true) : v;
    }
    return out;
  }
}

/**
 * Scan a decoded Result (or nested structure) for embedded Error objects.
 *
 * ethers.js uses this to surface nested decode errors (especially for tuples
 * and structs). This lightweight implementation walks:
 * - Result instances (by index; prefers named keys in the path when available)
 * - Arrays
 * - Plain objects (for struct-like outputs)
 *
 * It is cycle-safe.
 *
 * @param {any} result
 * @returns {Array<{ error: Error, path: Array<string|number> }>}
 */
function checkResultErrors(result) {
  /** @type {Array<{ error: Error, path: Array<string|number> }>} */
  const out = [];
  const seen = new WeakSet();

  /**
   * @param {any} value
   * @param {Array<string|number>} path
   */
  function walk(value, path) {
    if (value instanceof Error) {
      out.push({ error: value, path });
      return;
    }
    if (!value || (typeof value !== "object" && typeof value !== "function")) return;
    if (seen.has(value)) return;
    seen.add(value);

    // Prefer walking Result/Array by index to avoid duplicates (Result also has named keys).
    if (value instanceof Result || Array.isArray(value)) {
      const keys = value instanceof Result ? value._keys : null;
      for (let i = 0; i < value.length; i++) {
        const k = Array.isArray(keys) && keys[i] ? keys[i] : i;
        walk(value[i], path.concat([k]));
      }
      return;
    }

    // Walk only plain objects to avoid traversing things like Buffers, Dates, etc.
    const proto = Object.getPrototypeOf(value);
    if (proto === Object.prototype || proto === null) {
      for (const k of Object.keys(value)) {
        walk(value[k], path.concat([k]));
      }
    }
  }

  walk(result, []);
  return out;
}

module.exports = { Result, checkResultErrors };

