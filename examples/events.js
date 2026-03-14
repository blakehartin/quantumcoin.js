/**
 * Example: Querying logs/events (read-only).
 * Run with VERBOSE=1 for addresses, block range, and log counts.
 *
 * Note: This is a simple log query example; it does not keep a live subscription
 * running. For long-running subscriptions, build on Provider polling or a future
 * WebSocketProvider implementation.
 */

const { Initialize } = require("../config");
const { getProvider, Contract } = require("..");
const { logExample, logAddress } = require("../test/verbose-logger");

const RPC = "https://public.rpc.quantumcoinapi.com";
const CHAIN_ID = 123123;
const STAKING_CONTRACT = "0x" + "00".repeat(30) + "10" + "00"; // 0x...1000

async function eventsExample() {
  logExample("events.js", "starting", { rpc: RPC, chainId: CHAIN_ID });
  await Initialize(null);

  const provider = getProvider(RPC, CHAIN_ID);
  logAddress("staking_contract", STAKING_CONTRACT);
  const abi = require("../test/fixtures/StakingContract.abi.json");
  const contract = new Contract(STAKING_CONTRACT, abi, provider);

  // Query recent logs from the last 1000 blocks
  const latest = await provider.getBlockNumber();
  const fromBlock = Math.max(latest - 1000, 0);
  logExample("events.js", "block range", { latest, fromBlock, toBlock: "latest" });

  const logs = await contract.queryFilter("OnNewDeposit", fromBlock, "latest");
  console.log(`Found ${logs.length} OnNewDeposit logs in last 1000 blocks`);
  logExample("events.js", "queryFilter OnNewDeposit", { logCount: logs.length });
}

eventsExample().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

