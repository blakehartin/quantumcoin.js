/**
 * @fileoverview QuantumCoin.js main entrypoint (ethers.js v6 compatible API surface).
 *
 * IMPORTANT: Call `Initialize()` (from `quantumcoin/config`) before using
 * any functionality that relies on `quantum-coin-js-sdk` (address validation,
 * ABI packing/unpacking, signing, etc.).
 */

// Core constants
const constants = require("./constants");

// Modules
const providers = require("./providers");
const wallet = require("./wallet");
const contract = require("./contract");
const abi = require("./abi");
const utils = require("./utils");
const errors = require("./errors");

module.exports = {
  ...constants,

  // Providers
  ...providers,

  // Wallet / signers
  ...wallet,

  // Contracts
  ...contract,

  // ABI
  ...abi,

  // Utils
  ...utils,

  // Errors
  ...errors,
};

