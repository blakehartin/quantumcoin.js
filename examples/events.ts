/**
 * Example: Querying logs/events (read-only) - TypeScript.
 * Run: npx tsx examples/events.ts
 */

import { Initialize } from "../config";
import { getProvider, Contract } from "..";
import { logExample, logAddress } from "../test/verbose-logger";

const RPC = "https://public.rpc.quantumcoinapi.com";
const CHAIN_ID = 123123;
const STAKING_CONTRACT = "0x" + "00".repeat(30) + "10" + "00";

async function eventsExample(): Promise<void> {
  logExample("events.ts", "starting", { rpc: RPC, chainId: CHAIN_ID });
  await Initialize(null);

  const provider = getProvider(RPC, CHAIN_ID);
  logAddress("staking_contract", STAKING_CONTRACT);
  const abi = require("../test/fixtures/StakingContract.abi.json");
  const contract = new Contract(STAKING_CONTRACT, abi, provider);

  const latest = await provider.getBlockNumber();
  const fromBlock = Math.max(Number(latest) - 1000, 0);
  logExample("events.ts", "block range", { latest: Number(latest), fromBlock, toBlock: "latest" });

  const logs = await contract.queryFilter("OnNewDeposit", fromBlock, "latest");
  console.log(`Found ${logs.length} OnNewDeposit logs in last 1000 blocks`);
  logExample("events.ts", "queryFilter OnNewDeposit", { logCount: logs.length });
}

eventsExample().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
