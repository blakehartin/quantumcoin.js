/**
 * QuantumCoin.js Examples (non-transactional).
 *
 * Run:
 * - `node examples/example.js`
 * - `VERBOSE=1 node examples/example.js` for verbose logging (addresses, block hashes, etc.)
 *
 * These examples only perform:
 * - SDK initialization
 * - Read-only JSON-RPC queries
 * - Offline wallet operations (sign/encrypt)
 * - Read-only contract call against the system staking contract
 */

const { Initialize } = require("../config");
const qc = require("..");
const { logExample, logAddress } = require("../test/verbose-logger");

const RPC = "https://public.rpc.quantumcoinapi.com";
const CHAIN_ID = 123123;
const STAKING_CONTRACT = "0x" + "00".repeat(30) + "10" + "00"; // 0x...1000

async function main() {
  logExample("example.js", "starting", { rpc: RPC, chainId: CHAIN_ID });

  const ok = await Initialize(null);
  if (!ok) throw new Error("Initialize failed");

  console.log("SDK initialized:", qc.isInitialized());

  // Provider: basic read-only calls (getProvider detects http/ws/ipc from endpoint)
  const provider = qc.getProvider(RPC, CHAIN_ID);
  const blockNumber = await provider.getBlockNumber();
  console.log("Latest block:", blockNumber);
  logExample("example.js", "getBlockNumber", { blockNumber });

  const block = await provider.getBlock("latest");
  console.log("Latest block hash:", block.hash);
  logExample("example.js", "getBlock(latest)", { blockNumber: block.number, blockHash: block.hash });

  const balance = await provider.getBalance(STAKING_CONTRACT);
  console.log("Staking contract balance (wei):", balance.toString());
  logAddress("staking_contract", STAKING_CONTRACT);
  logExample("example.js", "getBalance", { balance: balance.toString() });

  // Wallet: offline operations
  const wallet = qc.Wallet.createRandom();
  console.log("Random wallet address:", wallet.address);
  logAddress("random_wallet", wallet.address);

  const encrypted = wallet.encryptSync("mySecurePassword123");
  console.log("Encrypted wallet JSON length:", encrypted.length);

  // Contract: read-only call
  const abi = require("../test/fixtures/StakingContract.abi.json");
  const staking = new qc.Contract(STAKING_CONTRACT, abi, provider);
  const depositorCount = await staking.getDepositorCount();
  console.log("typeof depositorCount:", typeof depositorCount);
  console.log("Depositor count:", depositorCount.toString());
  logExample("example.js", "getDepositorCount", { depositorCount: depositorCount.toString() });
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

