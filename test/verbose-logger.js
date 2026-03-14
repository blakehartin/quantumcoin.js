/**
 * Verbose logging for tests and examples.
 * Enable with: VERBOSE=1 or QC_VERBOSE=1 (e.g. VERBOSE=1 npm test, VERBOSE=1 node examples/example.js)
 */

function isVerbose() {
  const v = process.env.QC_VERBOSE || process.env.VERBOSE;
  return v === "1" || v === "true" || v === "yes";
}

function ts() {
  return new Date().toISOString();
}

function log(section, message, data) {
  if (!isVerbose()) return;
  const prefix = `[${ts()}] [${section}]`;
  if (data !== undefined && data !== null && typeof data === "object" && Object.keys(data).length > 0) {
    try {
      console.log(prefix, message, JSON.stringify(data));
    } catch {
      console.log(prefix, message, String(data));
    }
  } else {
    console.log(prefix, message);
  }
}

function logSuite(suiteName) {
  if (!isVerbose()) return;
  console.log(`[${ts()}] [suite] ${suiteName}`);
}

function logTest(testName, data) {
  if (!isVerbose()) return;
  const payload = { test: testName, ...data };
  console.log(`[${ts()}] [test] ${testName}`, JSON.stringify(payload));
}

function logTxn(txHash, data) {
  if (!isVerbose()) return;
  const hash = typeof txHash === "string" ? txHash : (txHash && txHash.hash) || String(txHash);
  console.log(`[${ts()}] [txn] hash=${hash}`, data ? JSON.stringify(data) : "");
}

function logAddress(label, address) {
  if (!isVerbose()) return;
  const addr = typeof address === "string" ? address : (address && address.address) || String(address);
  console.log(`[${ts()}] [address] ${label}=${addr}`);
}

function logExample(exampleName, message, data) {
  if (!isVerbose()) return;
  const prefix = `[${ts()}] [example:${exampleName}]`;
  if (data !== undefined && data !== null && typeof data === "object" && Object.keys(data).length > 0) {
    try {
      console.log(prefix, message, JSON.stringify(data));
    } catch {
      console.log(prefix, message, String(data));
    }
  } else {
    console.log(prefix, message);
  }
}

module.exports = {
  isVerbose,
  log,
  logSuite,
  logTest,
  logTxn,
  logAddress,
  logExample,
};
