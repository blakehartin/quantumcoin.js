/**
 * @fileoverview Minimal ABI fragment classes (ethers.js v6 compatible surface).
 *
 * This SDK keeps fragment handling lightweight and delegates ABI encoding/decoding
 * to `quantum-coin-js-sdk` (WASM).
 */

class Fragment {
  /**
   * @param {any} fragment
   */
  constructor(fragment) {
    this.type = fragment?.type;
    this.name = fragment?.name;
    this.inputs = fragment?.inputs || [];
    this.outputs = fragment?.outputs || [];
    this.stateMutability = fragment?.stateMutability;
    this.anonymous = fragment?.anonymous;
  }

  /**
   * Formats the fragment.
   * @param {string=} format
   * @returns {string}
   */
  format(format) {
    // For now, return JSON-ish format (compatible enough for tooling).
    // ethers supports "sighash", "full", etc.
    void format;
    return JSON.stringify(this.toJSON());
  }

  /**
   * @returns {any}
   */
  toJSON() {
    const out = {};
    for (const k of ["type", "name", "inputs", "outputs", "stateMutability", "anonymous"]) {
      if (this[k] != null) out[k] = this[k];
    }
    return out;
  }
}

class NamedFragment extends Fragment {}
class FunctionFragment extends NamedFragment {}
class EventFragment extends NamedFragment {}
class ErrorFragment extends NamedFragment {}
class ConstructorFragment extends Fragment {}
class StructFragment extends Fragment {}
class FallbackFragment extends Fragment {}

module.exports = {
  Fragment,
  NamedFragment,
  FunctionFragment,
  EventFragment,
  ErrorFragment,
  ConstructorFragment,
  StructFragment,
  FallbackFragment,
};

