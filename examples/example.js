/**
 * QuantumCoin.js Examples (non-transactional).
 *
 * Run:
 * - `node examples/example.js`
 *
 * These examples only perform:
 * - SDK initialization
 * - Read-only JSON-RPC queries
 * - Offline wallet operations (sign/encrypt)
 * - Read-only contract call against the system staking contract
 */

const { Initialize } = require("../config");
const qc = require("..");

const RPC = "https://public.rpc.quantumcoinapi.com";
const CHAIN_ID = 123123;
const STAKING_CONTRACT = "0x" + "00".repeat(30) + "10" + "00"; // 0x...1000

async function main() {
  const ok = await Initialize(null);
  if (!ok) throw new Error("Initialize failed");

  console.log("SDK initialized:", qc.isInitialized());

  // Provider: basic read-only calls
  const provider = new qc.JsonRpcProvider(RPC, CHAIN_ID);
  const blockNumber = await provider.getBlockNumber();
  console.log("Latest block:", blockNumber);

  const block = await provider.getBlock("latest");
  console.log("Latest block hash:", block.hash);

  const balance = await provider.getBalance(STAKING_CONTRACT);
  console.log("Staking contract balance (wei):", balance.toString());

  // Wallet: offline operations
  const wallet = qc.Wallet.createRandom();
  console.log("Random wallet address:", wallet.address);
  const sig = wallet.signMessageSync("Hello, QuantumCoin!");
  console.log("Signed message signature:", sig.slice(0, 18) + "...");
  const recovered = qc.verifyMessage("Hello, QuantumCoin!", sig);
  console.log("Recovered address:", recovered);

  const encrypted = wallet.encryptSync("mySecurePassword123");
  console.log("Encrypted wallet JSON length:", encrypted.length);

  // Contract: read-only call
  const abi = require("../test/fixtures/StakingContract.abi.json");
  const staking = new qc.Contract(STAKING_CONTRACT, abi, provider);
  const depositorCount = await staking.getDepositorCount();
  const count = Array.isArray(depositorCount) ? depositorCount[0] : depositorCount;
  console.log("Depositor count:", String(count));
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

