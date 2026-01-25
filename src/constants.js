/**
 * @fileoverview Public constants matching ethers.js v6 naming.
 */

const pkg = require("../package.json");

/**
 * The current version of the QuantumCoin.js library.
 * @type {string}
 */
const version = pkg.version || "0.0.0";

/**
 * The zero address (32 bytes).
 * @type {string}
 */
const ZeroAddress = "0x" + "00".repeat(32);

/**
 * The zero hash (32 bytes).
 * @type {string}
 */
const ZeroHash = "0x" + "00".repeat(32);

/**
 * The maximum value for a uint256.
 * @type {bigint}
 */
const MaxUint256 = (2n ** 256n) - 1n;

/**
 * The maximum value for a uint160.
 * @type {bigint}
 */
const MaxUint160 = (2n ** 160n) - 1n;

/**
 * The minimum value for an int256.
 * @type {bigint}
 */
const MinInt256 = -(2n ** 255n);

/**
 * The maximum value for an int256.
 * @type {bigint}
 */
const MaxInt256 = (2n ** 255n) - 1n;

/**
 * Error code for numeric faults.
 * @type {string}
 */
const NumericFault = "NUMERIC_FAULT";

/**
 * Error code for numeric faults (alias).
 * @type {string}
 */
const NumericFaultCode = "NUMERIC_FAULT";

/**
 * Wei per coin (1e18).
 * @type {bigint}
 */
const WeiPerEther = 1000000000000000000n;

/**
 * Currency symbol (compat with ethers.js v6).
 * @type {string}
 */
const EtherSymbol = "Ξ";

/**
 * BigNumber constant (exported as `N` in ethers.js v6).
 * In QuantumCoin.js, this is a bigint constant.
 * @type {bigint}
 */
const N = 0n;

module.exports = {
  version,
  ZeroAddress,
  ZeroHash,
  MaxUint256,
  MaxUint160,
  MinInt256,
  MaxInt256,
  NumericFault,
  NumericFaultCode,
  WeiPerEther,
  EtherSymbol,
  N,
};

