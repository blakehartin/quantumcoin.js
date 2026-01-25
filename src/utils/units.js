/**
 * @fileoverview Unit conversion helpers (ethers.js v6 compatible names).
 */

const { WeiPerEther } = require("../constants");
const { assertArgument, makeError } = require("../errors");

/**
 * @typedef {string | number | bigint} BigNumberish
 */

function _toBigInt(value) {
  if (typeof value === "bigint") return value;
  if (typeof value === "number") {
    assertArgument(Number.isFinite(value) && Math.floor(value) === value, "invalid number", "value", value);
    return BigInt(value);
  }
  if (typeof value === "string") {
    if (value.trim() === "") throw makeError("invalid BigNumberish string", "INVALID_ARGUMENT", { value });
    if (value.startsWith("0x") || value.startsWith("0X")) return BigInt(value);
    return BigInt(value);
  }
  throw makeError("invalid BigNumberish", "INVALID_ARGUMENT", { value });
}

/**
 * Format a BigNumberish into a decimal string with `decimals` places.
 * @param {BigNumberish} value
 * @param {number=} decimals
 * @returns {string}
 */
function formatUnits(value, decimals) {
  const dec = decimals == null ? 18 : decimals;
  assertArgument(Number.isInteger(dec) && dec >= 0 && dec <= 256, "invalid decimals", "decimals", decimals);
  const v = _toBigInt(value);
  const neg = v < 0n;
  const abs = neg ? -v : v;

  const base = 10n ** BigInt(dec);
  const whole = abs / base;
  const frac = abs % base;

  let fracStr = frac.toString().padStart(dec, "0");
  // trim trailing zeros
  fracStr = fracStr.replace(/0+$/, "");
  const out = fracStr.length ? `${whole.toString()}.${fracStr}` : whole.toString();
  return neg ? "-" + out : out;
}

/**
 * Parse a decimal string into bigint with `decimals` places.
 * @param {string} value
 * @param {number=} decimals
 * @returns {bigint}
 */
function parseUnits(value, decimals) {
  const dec = decimals == null ? 18 : decimals;
  assertArgument(Number.isInteger(dec) && dec >= 0 && dec <= 256, "invalid decimals", "decimals", decimals);
  assertArgument(typeof value === "string", "value must be a string", "value", value);

  const v = value.trim();
  assertArgument(v.length > 0, "invalid value", "value", value);

  const neg = v.startsWith("-");
  const s = neg ? v.slice(1) : v;
  const parts = s.split(".");
  assertArgument(parts.length <= 2, "invalid decimal string", "value", value);

  const whole = parts[0] || "0";
  const frac = parts[1] || "";
  assertArgument(/^\d+$/.test(whole), "invalid whole component", "value", value);
  assertArgument(/^\d*$/.test(frac), "invalid fractional component", "value", value);
  assertArgument(frac.length <= dec, "fractional component exceeds decimals", "value", value);

  const base = 10n ** BigInt(dec);
  const wholeBI = BigInt(whole) * base;
  const fracBI = frac.length ? BigInt(frac.padEnd(dec, "0")) : 0n;
  const out = wholeBI + fracBI;
  return neg ? -out : out;
}

/**
 * Format wei as coin string.
 * @param {BigNumberish} value
 * @returns {string}
 */
function formatEther(value) {
  return formatUnits(value, 18);
}

/**
 * Parse coin string to wei.
 * @param {string} value
 * @returns {bigint}
 */
function parseEther(value) {
  return parseUnits(value, 18);
}

module.exports = {
  formatUnits,
  parseUnits,
  formatEther,
  parseEther,
  WeiPerEther,
};

