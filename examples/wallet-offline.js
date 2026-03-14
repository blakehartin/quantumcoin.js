/**
 * Example: Offline wallet operations (no blockchain connectivity required).
 * Run with VERBOSE=1 for wallet addresses and recovered address.
 */

const { Initialize } = require("../config");
const { Wallet, verifyMessage } = require("..");
const { logExample, logAddress } = require("../test/verbose-logger");

async function walletOffline() {
  logExample("wallet-offline.js", "starting");
  await Initialize(null);

  const wallet = Wallet.createRandom();
  console.log("Wallet address:", wallet.address);
  logAddress("wallet", wallet.address);

  const msg = "Hello, QuantumCoin!";
  const sig = wallet.signMessageSync(msg);
  console.log("Signature:", sig.slice(0, 18) + "...");

  const recovered = verifyMessage(msg, sig);
  console.log("Recovered address:", recovered);
  logAddress("recovered", recovered);

  const json = wallet.encryptSync("mySecurePassword123");
  console.log("Encrypted wallet JSON length:", json.length);
  logExample("wallet-offline.js", "encryptSync", { jsonLength: json.length });
}

walletOffline().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

