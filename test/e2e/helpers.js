/**
 * E2E test helpers.
 */

const fs = require("node:fs");

function getArg(name) {
  const prefix = name + "=";
  for (const a of process.argv) {
    if (a === name) return true;
    if (a.startsWith(prefix)) return a.slice(prefix.length);
  }
  return null;
}

function getRpcUrl() {
  return (
    process.env.QC_RPC_URL ||
    getArg("--rpc") ||
    getArg("--rpcUrl") ||
    getArg("--rpc-url") ||
    null
  );
}

function getChainId() {
  const v = process.env.QC_CHAIN_ID || getArg("--chainId") || getArg("--chain-id");
  return v ? Number(v) : 123123;
}

function getSolcPath() {
  return process.env.QC_SOLC_PATH || "c:\\solc\\solc.exe";
}

function assertSolcExists(solcPath) {
  if (!fs.existsSync(solcPath)) {
    throw new Error(`solc not found at ${solcPath}`);
  }
}

module.exports = {
  getRpcUrl,
  getChainId,
  getSolcPath,
  assertSolcExists,
};

