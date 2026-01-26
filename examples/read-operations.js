/**
 * Example: Read-only operations using JsonRpcProvider + Contract.
 */

const { Initialize } = require("../config");
const { JsonRpcProvider, Contract } = require("..");

const RPC = "https://public.rpc.quantumcoinapi.com";
const CHAIN_ID = 123123;
const STAKING_CONTRACT = "0x" + "00".repeat(30) + "10" + "00"; // 0x...1000

async function readOperations() {
  await Initialize(null);

  const provider = new JsonRpcProvider(RPC, CHAIN_ID);
  const abi = require("../test/fixtures/StakingContract.abi.json");
  const contract = new Contract(STAKING_CONTRACT, abi, provider);

  const total = await contract.getTotalDepositedBalance();
  console.log("Total deposited balance:", total.toString());
}

readOperations().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

