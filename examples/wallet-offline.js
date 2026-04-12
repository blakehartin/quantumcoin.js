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

  // Encrypt a raw seed (pre-expansion format) and restore it
  const seed = [51,214,149,165,206,96,227,5,173,247,83,219,210,2,221,2,4,48,117,55,88,109,241,204,31,62,23,128,47,21,168,247,28,118,30,185,229,255,17,27,34,107,225,138,254,156,55,9,253,255,142,148,234,189,232,43,173,84,159,108,8,35,58,77];
  const seedJson = Wallet.encryptSeedSync(seed, "mySecurePassword123");
  console.log("Seed-encrypted wallet JSON length:", seedJson.length);
  const restored = Wallet.fromEncryptedJsonSync(seedJson, "mySecurePassword123");
  console.log("Restored from seed address:", restored.address);
  logExample("wallet-offline.js", "encryptSeedSync", { jsonLength: seedJson.length });
  logAddress("restored", restored.address);
}

walletOffline().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

