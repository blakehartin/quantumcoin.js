/**
 * Example: Offline wallet operations (no blockchain) - TypeScript.
 * Run: npx tsx examples/wallet-offline.ts
 */

import { Initialize } from "../config";
import { Wallet } from "..";
import { logExample, logAddress } from "../test/verbose-logger";

async function walletOffline(): Promise<void> {
  logExample("wallet-offline.ts", "starting");
  await Initialize(null);

  const wallet = Wallet.createRandom();
  console.log("Wallet address:", wallet.address);
  logAddress("wallet", wallet.address);

  const json = wallet.encryptSync("mySecurePassword123");
  console.log("Encrypted wallet JSON length:", json.length);
  logExample("wallet-offline.ts", "encryptSync", { jsonLength: json.length });
}

walletOffline().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
