/**
 * Example: Read-only operations (JsonRpcProvider + Contract) - TypeScript.
 * Run: npx tsx examples/read-operations.ts
 */

import { Initialize } from "../config";
import { getProvider, Contract } from "..";
import { logExample, logAddress } from "../test/verbose-logger";

const RPC = "https://public.rpc.quantumcoinapi.com";
const CHAIN_ID = 123123;
const STAKING_CONTRACT = "0x" + "00".repeat(30) + "10" + "00";

async function readOperations(): Promise<void> {
  logExample("read-operations.ts", "starting", { rpc: RPC, chainId: CHAIN_ID });
  await Initialize(null);

  const provider = getProvider(RPC, CHAIN_ID);
  logAddress("staking_contract", STAKING_CONTRACT);
  const abi = require("../test/fixtures/StakingContract.abi.json");
  const contract = new Contract(STAKING_CONTRACT, abi, provider);

  const total = await contract.getTotalDepositedBalance();
  console.log("Total deposited balance:", total.toString());
  logExample("read-operations.ts", "getTotalDepositedBalance", { total: total.toString() });
}

readOperations().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
