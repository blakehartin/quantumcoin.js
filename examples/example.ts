/**
 * QuantumCoin.js Examples (non-transactional) - TypeScript.
 *
 * Run: npx tsx examples/example.ts
 * VERBOSE=1 npx tsx examples/example.ts for verbose logging.
 */

import { Initialize } from "../config";
import qc from "..";
import { logExample, logAddress } from "../test/verbose-logger";

const RPC = "https://public.rpc.quantumcoinapi.com";
const CHAIN_ID = 123123;
const STAKING_CONTRACT = "0x" + "00".repeat(30) + "10" + "00";

async function main(): Promise<void> {
  logExample("example.ts", "starting", { rpc: RPC, chainId: CHAIN_ID });

  const ok = await Initialize(null);
  if (!ok) throw new Error("Initialize failed");

  console.log("SDK initialized:", qc.isInitialized());

  const provider = qc.getProvider(RPC, CHAIN_ID);
  const blockNumber = await provider.getBlockNumber();
  console.log("Latest block:", blockNumber);
  logExample("example.ts", "getBlockNumber", { blockNumber });

  const block = await provider.getBlock("latest");
  console.log("Latest block hash:", block.hash);
  logExample("example.ts", "getBlock(latest)", { blockNumber: block.number, blockHash: block.hash });

  const balance = await provider.getBalance(STAKING_CONTRACT);
  console.log("Staking contract balance (wei):", balance.toString());
  logAddress("staking_contract", STAKING_CONTRACT);
  logExample("example.ts", "getBalance", { balance: balance.toString() });

  const wallet = qc.Wallet.createRandom();
  console.log("Random wallet address:", wallet.address);
  logAddress("random_wallet", wallet.address);

  const encrypted = wallet.encryptSync("mySecurePassword123");
  console.log("Encrypted wallet JSON length:", encrypted.length);

  const abi = require("../test/fixtures/StakingContract.abi.json");
  const staking = new qc.Contract(STAKING_CONTRACT, abi, provider);
  const depositorCount = await staking.getDepositorCount();
  console.log("typeof depositorCount:", typeof depositorCount);
  console.log("Depositor count:", depositorCount.toString());
  logExample("example.ts", "getDepositorCount", { depositorCount: depositorCount.toString() });
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
