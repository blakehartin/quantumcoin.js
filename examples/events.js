/**
 * Example: Querying logs/events (read-only).
 *
 * Note: This is a simple log query example; it does not keep a live subscription
 * running. For long-running subscriptions, build on Provider polling or a future
 * WebSocketProvider implementation.
 */

const { Initialize } = require("../config");
const { JsonRpcProvider, Contract } = require("..");

const RPC = "https://public.rpc.quantumcoinapi.com";
const CHAIN_ID = 123123;
const STAKING_CONTRACT = "0x" + "00".repeat(30) + "10" + "00"; // 0x...1000

async function eventsExample() {
  await Initialize(null);

  const provider = new JsonRpcProvider(RPC, CHAIN_ID);
  const abi = require("../test/fixtures/StakingContract.abi.json");
  const contract = new Contract(STAKING_CONTRACT, abi, provider);

  // Query recent logs from the last 1000 blocks
  const latest = await provider.getBlockNumber();
  const fromBlock = Math.max(latest - 1000, 0);

  const logs = await contract.queryFilter("OnNewDeposit", fromBlock, "latest");
  console.log(`Found ${logs.length} OnNewDeposit logs in last 1000 blocks`);
}

eventsExample().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

