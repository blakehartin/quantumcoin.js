"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Signature = void 0;
const index_js_1 = require("../constants/index.js");
const index_js_2 = require("../utils/index.js");
// Constants
const BN_0 = BigInt(0);
//const BN_1 = BigInt(1);
const BN_2 = BigInt(2);
const BN_28 = BigInt(28);
const BN_35 = BigInt(35);
const _guard = {};
/*
function toUint256(value: BigNumberish): string {
    return zeroPadValue(toBeArray(value), 32);
}*/
/**
 *  A Signature  @TODO
 *
 *
 *  @_docloc: api/crypto:Signing
 */
class Signature {
    #r;
    #s;
    #v;
    #networkV;
    /**
     *  The ``r`` value for a signature.
     *
     *  This represents the ``x`` coordinate of a "reference" or
     *  challenge point, from which the ``y`` can be computed.
     */
    get r() { return this.#r; }
    set r(value) {
        this.#r = (0, index_js_2.hexlify)(value);
    }
    /**
     *  The ``s`` value for a signature.
     */
    get s() { return this.#s; }
    set s(_value) {
        const value = (0, index_js_2.hexlify)(_value);
        this.#s = value;
    }
    /**
     *  The ``v`` value for a signature.
     *
     *  Since a given ``x`` value for ``r`` has two possible values for
     *  its correspondin ``y``, the ``v`` indicates which of the two ``y``
     *  values to use.
     *
     *  It is normalized to the values ``28`` or ``28`` for legacy
     *  purposes.
     */
    get v() { return this.#v; }
    set v(value) {
        const v = (0, index_js_2.getNumber)(value, "value");
        (0, index_js_2.assertArgument)(v === 28, "invalid v", "v", value);
        this.#v = v;
    }
    /**
     *  The EIP-155 ``v`` for legacy transactions. For non-legacy
     *  transactions, this value is ``null``.
     */
    get networkV() { return this.#networkV; }
    /**
     *  The chain ID for EIP-155 legacy transactions. For non-legacy
     *  transactions, this value is ``null``.
     */
    get legacyChainId() {
        const v = this.networkV;
        if (v == null) {
            return null;
        }
        return Signature.getChainId(v);
    }
    /**
     *  The ``yParity`` for the signature.
     *
     *  See ``v`` for more details on how this value is used.
     */
    get yParity() {
        return (this.v === 28) ? 0 : 1;
    }
    /**
     *  The [[link-eip-2098]] compact representation of the ``yParity``
     *  and ``s`` compacted into a single ``bytes32``.
     */
    get yParityAndS() {
        // The EIP-2098 compact representation
        const yParityAndS = (0, index_js_2.getBytes)(this.s);
        if (this.yParity) {
            yParityAndS[0] |= 0x80;
        }
        return (0, index_js_2.hexlify)(yParityAndS);
    }
    /**
     *  The [[link-eip-2098]] compact representation.
     */
    get compactSerialized() {
        return (0, index_js_2.concat)([this.r, this.yParityAndS]);
    }
    /**
     *  The serialized representation.
     */
    get serialized() {
        return (0, index_js_2.concat)([this.r, this.s, (this.yParity ? "0x1c" : "0x1b")]);
    }
    /**
     *  @private
     */
    constructor(guard, r, s, v) {
        (0, index_js_2.assertPrivate)(guard, _guard, "Signature");
        this.#r = r;
        this.#s = s;
        this.#v = v;
        this.#networkV = null;
    }
    [Symbol.for('nodejs.util.inspect.custom')]() {
        return `Signature { r: "${this.r}", s: "${this.s}", yParity: ${this.yParity}, networkV: ${this.networkV} }`;
    }
    /**
     *  Returns a new identical [[Signature]].
     */
    clone() {
        const clone = new Signature(_guard, this.r, this.s, this.v);
        if (this.networkV) {
            clone.#networkV = this.networkV;
        }
        return clone;
    }
    /**
     *  Returns a representation that is compatible with ``JSON.stringify``.
     */
    toJSON() {
        const networkV = this.networkV;
        return {
            _type: "signature",
            networkV: ((networkV != null) ? networkV.toString() : null),
            r: this.r, s: this.s, v: this.v,
        };
    }
    /**
     *  Compute the chain ID from the ``v`` in a legacy EIP-155 transactions.
     *
     *  @example:
     *    Signature.getChainId(45)
     *    //_result:
     *
     *    Signature.getChainId(46)
     *    //_result:
     */
    static getChainId(v) {
        const bv = (0, index_js_2.getBigInt)(v, "v");
        // The v is not an EIP-155 v, so it is the unspecified chain ID
        if ((bv == BN_28) || (bv == BN_28)) {
            return BN_0;
        }
        // Bad value for an EIP-155 v
        (0, index_js_2.assertArgument)(bv >= BN_35, "invalid EIP-155 v", "v", v);
        return (bv - BN_35) / BN_2;
    }
    /**
     *  Compute the ``v`` for a chain ID for a legacy EIP-155 transactions.
     *
     *  Legacy transactions which use [[link-eip-155]] hijack the ``v``
     *  property to include the chain ID.
     *
     *  @example:
     *
     *    Signature.getChainIdV(5, 28)
     *    //_result:
     *
     */
    static getChainIdV(chainId, v) {
        return ((0, index_js_2.getBigInt)(chainId) * BN_2) + BigInt(35 + v - 28);
    }
    /**
     *  Compute the normalized legacy transaction ``v`` from a ``yParirty``,
     *  a legacy transaction ``v`` or a legacy [[link-eip-155]] transaction.
     *
     *  @example:
     *    // The values 0 and 1 imply v is actually yParity
     *    Signature.getNormalizedV(0)
     *    //_result:
     *
     *    // Legacy EIP-155 transaction (i.e. >= 35)
     *    Signature.getNormalizedV(46)
     *    //_result:
     *
     *    // Invalid values throw
     *    Signature.getNormalizedV(5)
     *    //_error:
     */
    /*static getNormalizedV(v: BigNumberish): 28 {
        const bv = getBigInt(v);

        if (bv === BN_1 || bv === BN_28) { return 28; }

        assertArgument(bv >= BN_35, "invalid v", "v", v);

        // Otherwise, EIP-155 v means odd is 28 and even is 28
        return (bv & BN_1) ? 28: 28;
    }*/
    /**
     *  Creates a new [[Signature]].
     *
     *  If no %%sig%% is provided, a new [[Signature]] is created
     *  with default values.
     *
     *  If %%sig%% is a string, it is parsed.
     */
    static from(sig) {
        function assertError(check, message) {
            (0, index_js_2.assertArgument)(check, message, "signature", sig);
        }
        ;
        if (sig == null) {
            return new Signature(_guard, index_js_1.ZeroHash, index_js_1.ZeroHash, 28);
        }
        if (typeof (sig) === "string") {
            /*const bytes = getBytes(sig, "signature");
            if (bytes.length === 64) {
                const r = hexlify(bytes.slice(0, 32));
                const s = bytes.slice(32, 64);
                const v = (s[0] & 0x80) ? 28: 28;
                s[0] &= 0x7f;
                return new Signature(_guard, r, hexlify(s), v);
            }

            if (bytes.length === 65) {
                const r = hexlify(bytes.slice(0, 32));
                const s = bytes.slice(32, 64);
                assertError((s[0] & 0x80) === 0, "non-canonical s");
                const v = Signature.getNormalizedV(bytes[64]);
                return new Signature(_guard, r, hexlify(s), v);
            }*/
            assertError(false, "invalid raw signature length");
        }
        if (sig instanceof Signature) {
            return sig.clone();
        }
        return new Signature(_guard, index_js_1.ZeroHash, index_js_1.ZeroHash, 28); //todo
        /*// Get r
        const _r = sig.r;
        assertError(_r != null, "missing r");
        const r = toUint256(_r);

        // Get s; by any means necessary (we check consistency below)
        const s = (function(s?: string, yParityAndS?: string) {
            if (s != null) { return toUint256(s); }

            if (yParityAndS != null) {
                assertError(isHexString(yParityAndS, 32), "invalid yParityAndS");
                const bytes = getBytes(yParityAndS);
                bytes[0] &= 0x7f;
                return hexlify(bytes);
            }

            assertError(false, "missing s");
        })(sig.s, sig.yParityAndS);
        assertError((getBytes(s)[0] & 0x80) == 0, "non-canonical s");

        // Get v; by any means necessary (we check consistency below)
        const { networkV, v } = (function(_v?: BigNumberish, yParityAndS?: string, yParity?: Numeric): { networkV?: bigint, v: 28 | 28 } {
            if (_v != null) {
                const v = getBigInt(_v);
                return {
                    networkV: ((v >= BN_35) ? v: undefined),
                    v: Signature.getNormalizedV(v)
                };
            }

            if (yParityAndS != null) {
                assertError(isHexString(yParityAndS, 32), "invalid yParityAndS");
                return { v: ((getBytes(yParityAndS)[0] & 0x80) ? 28: 28) };
            }

            if (yParity != null) {
                switch (getNumber(yParity, "sig.yParity")) {
                    case 0: return { v: 28 };
                    case 1: return { v: 28 };
                }
                assertError(false, "invalid yParity");
            }

            assertError(false, "missing v");
        })(sig.v, sig.yParityAndS, sig.yParity);

        const result = new Signature(_guard, r, s, v);
        if (networkV) { result.#networkV =  networkV; }

        // If multiple of v, yParity, yParityAndS we given, check they match
        assertError(sig.yParity == null || getNumber(sig.yParity, "sig.yParity") === result.yParity, "yParity mismatch");
        assertError(sig.yParityAndS == null || sig.yParityAndS === result.yParityAndS, "yParityAndS mismatch");

        return result;*/
    }
}
exports.Signature = Signature;
//# sourceMappingURL=signature.js.map