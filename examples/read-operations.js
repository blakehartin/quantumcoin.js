/**
 * Example: Read-only operations using JsonRpcProvider + Contract.
 * Run with VERBOSE=1 for addresses and operation details.
 */

const { Initialize } = require("../config");
const { getProvider, Contract } = require("..");
const { logExample, logAddress } = require("../test/verbose-logger");

const RPC = "https://public.rpc.quantumcoinapi.com";
const CHAIN_ID = 123123;
const STAKING_CONTRACT = "0x" + "00".repeat(30) + "10" + "00"; // 0x...1000

async function readOperations() {
  logExample("read-operations.js", "starting", { rpc: RPC, chainId: CHAIN_ID });
  await Initialize(null);

  const provider = getProvider(RPC, CHAIN_ID);
  logAddress("staking_contract", STAKING_CONTRACT);
  const abi = require("../test/fixtures/StakingContract.abi.json");
  const contract = new Contract(STAKING_CONTRACT, abi, provider);

  const total = await contract.getTotalDepositedBalance();
  console.log("Total deposited balance:", total.toString());
  logExample("read-operations.js", "getTotalDepositedBalance", { total: total.toString() });
}

readOperations().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

