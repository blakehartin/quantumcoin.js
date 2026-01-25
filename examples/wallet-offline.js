/**
 * Example: Offline wallet operations (no blockchain connectivity required).
 */

const { Initialize } = require("../config");
const { Wallet, verifyMessage } = require("..");

async function walletOffline() {
  await Initialize(null);

  const wallet = Wallet.createRandom();
  console.log("Wallet address:", wallet.address);

  const msg = "Hello, QuantumCoin!";
  const sig = wallet.signMessageSync(msg);
  console.log("Signature:", sig.slice(0, 18) + "...");

  const recovered = verifyMessage(msg, sig);
  console.log("Recovered address:", recovered);

  const json = wallet.encryptSync("mySecurePassword123");
  console.log("Encrypted wallet JSON length:", json.length);
}

walletOffline().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

