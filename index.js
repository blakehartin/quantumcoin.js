/**
 * @fileoverview Package entrypoint for `require("quantumcoin")`.
 *
 * This exports the ethers.js v6 compatible API surface implemented in `src/`,
 * plus the initialization utilities from `config.js`.
 */

module.exports = {
  ...require("./src"),
  ...require("./config"),
};

