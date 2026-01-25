<!--
This is an experimental SDK. Use at your own risk.
-->

**Comprehensive SDK documentation:** see [`README-SDK.md`](./README-SDK.md).

## QuantumCoin.js

QuantumCoin.js is an **ethers.js v6-compatible** SDK surface for the QuantumCoin blockchain.

Key differences vs Ethereum/ethers:

- **Addresses are 32 bytes** (66 hex chars including `0x`)
- **No HDWallet support** (not applicable to QuantumCoin)
- **All signing, address derivation, and ABI packing/unpacking** are delegated to `quantum-coin-js-sdk` (as required by `SPEC.md`)

## Install

```bash
npm install quantumcoin
```

## Initialize (required)

You **must** initialize once before using wallet/address/ABI helpers:

```js
const { Initialize, Config } = require("quantumcoin/config");

// defaults: chainId=123123, rpcEndpoint=https://public.rpc.quantumcoinapi.com
await Initialize(null);

// or custom
await Initialize(new Config(123123, "https://public.rpc.quantumcoinapi.com"));
```

## Provider (read-only)

```js
const { JsonRpcProvider } = require("quantumcoin");

const provider = new JsonRpcProvider("https://public.rpc.quantumcoinapi.com", 123123);
console.log(await provider.getBlockNumber());
```

## Wallet (offline + online)

```js
const { Wallet, verifyMessage } = require("quantumcoin");
const { Initialize } = require("quantumcoin/config");

await Initialize(null);

const wallet = Wallet.createRandom();
const sig = wallet.signMessageSync("Hello, QuantumCoin!");
console.log(verifyMessage("Hello, QuantumCoin!", sig));

const encrypted = wallet.encryptSync("mySecurePassword123");
const restored = Wallet.fromEncryptedJsonSync(encrypted, "mySecurePassword123");
console.log(restored.address);
```

## Contracts (read-only)

```js
const { Initialize } = require("quantumcoin/config");
const { JsonRpcProvider, Contract } = require("quantumcoin");

await Initialize(null);

const provider = new JsonRpcProvider("https://public.rpc.quantumcoinapi.com", 123123);
const abi = require("./test/fixtures/StakingContract.abi.json");
const address = "0x0000000000000000000000000000000000000000000000000000000000001000";

const staking = new Contract(address, abi, provider);
console.log(await staking.getDepositorCount());
```

## Typed contract generator

This repo includes a generator described in `SPEC.md` section 15.

```bash
# Non-interactive
node generate-sdk.js --abi path/to/abi.json --bin path/to/bytecode.bin --out ./generated --name MyContract --non-interactive

# JavaScript output (with TypeScript `.d.ts` types)
node generate-sdk.js --lang js --abi path/to/abi.json --bin path/to/bytecode.bin --out ./generated --name MyContract --non-interactive

# Interactive
node generate-sdk.js --abi path/to/abi.json --bin path/to/bytecode.bin
```

If installed as a package, you can also run:

`npx quantumcoin-sdk-generator --abi ... --bin ...`

## Solidity types (TypeScript)

QuantumCoin.js exports core Solidity-related typings from:

- `quantumcoin/types`

Common types:

- `AddressLike` (currently `string`, 32-byte address)
- `BytesLike` (`string | Uint8Array`)
- `BigNumberish` (`string | number | bigint`)
- `SolidityTypeName`, `SolidityInputValue<T>`, `SolidityOutputValue<T>`

## Examples

```bash
npm run example
npm run example:wallet
npm run example:contract:read
npm run example:events
```

## Tests

```bash
npm test
npm run test:unit
npm run test:non-transactional
npm run test:e2e
```

## Troubleshooting

- **“SDK not initialized”**: call `Initialize(null)` once at startup.
- **JSON-RPC errors/timeouts**: verify `Config.rpcEndpoint` or pass an explicit URL to `JsonRpcProvider`.
- **Node version**: `quantum-coin-js-sdk` tooling is developed primarily against Node 20+. If you see runtime issues, try Node 20 LTS.

### Transactional (write) tests

The E2E tests broadcast real transactions and require a funded test wallet.

- Set RPC URL via env var: `QC_RPC_URL`
- (Optional) chain id via env var: `QC_CHAIN_ID` (default: 123123)
- (Optional) solc path via env var: `QC_SOLC_PATH` (default: `c:\solc\solc.exe`)


