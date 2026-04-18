> **CAUTION:** This is an experimental SDK. Use at your own risk.

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
const { Wallet } = require("quantumcoin");
const { Initialize } = require("quantumcoin/config");

await Initialize(null);

const wallet = Wallet.createRandom();

const encrypted = wallet.encryptSync("mySecurePassword123");
const restored = Wallet.fromEncryptedJsonSync(encrypted, "mySecurePassword123");
console.log(restored.address);
```

### Seed phrase (`getPhrase()`)

Any wallet that was constructed from a seed exposes its seed words via `getPhrase()`:

```js
const wallet = Wallet.createRandom();
const phrase = wallet.getPhrase();      // string[] of seed words, or null
const restored = Wallet.fromPhrase(phrase);
console.log(restored.address === wallet.address); // true
```

`getPhrase()` returns the seed words whenever `wallet.seed` is non-null — i.e. wallets produced by `createRandom`, `fromPhrase`, `fromSeed`, or `fromEncryptedJsonSync` on a version-5 keystore (produced by `encryptSync` on a seed-bearing wallet or by `encryptSeedSync`). It returns `null` for wallets constructed via `fromKeys` or from v3/v4 keystores.

### Encrypt a raw seed

You can encrypt raw seed bytes (pre-expansion) into a portable wallet JSON (version 5 format) without first opening the wallet:

```js
const { Wallet } = require("quantumcoin");
const { Initialize } = require("quantumcoin/config");

await Initialize(null);

// 64-byte seed (keyType 3), 72-byte (keyType 5), or 96-byte (legacy)
const seed = [51,214,149,165, /* ...remaining bytes... */];
const json = Wallet.encryptSeedSync(seed, "mySecurePassword123");
const restored = Wallet.fromEncryptedJsonSync(json, "mySecurePassword123");
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

```bash
npx sdkgen --abi path/to/abi.json --bin path/to/bytecode.bin --out ./generated --name MyContract --non-interactive
```

For more options (Solidity sources, artifacts JSON, package scaffolding), see [README-SDK.md](./README-SDK.md#typed-sdk-generator-generate-sdkjs).

### Generator typing model

- **Hard types**: generated wrappers use concrete types from `quantumcoin/types` (e.g. `Uint256Like` for inputs, `Uint256` for outputs).
- **Single return values are unwrapped**: a Solidity function returning one value returns that value directly (not `[value]`).
- **Multiple returns**: returned as a tuple type (e.g. `Promise<[Uint256, Bool]>`).
- **No returns**: `Promise<void>`.
- **Structs / tuples**: generated as `export type <Name>Input` / `export type <Name>Output` and used directly in method signatures.

## Solidity types (TypeScript)

QuantumCoin.js exports core Solidity-related typings from:

- `quantumcoin/types`

Common types:

- `AddressLike` (currently `string`, 32-byte address)
- `BytesLike` (`string | Uint8Array`)
- `BigNumberish` (`string | number | bigint`)
- **Hard Solidity aliases** (preferred for typed wrappers): `Uint256Like` / `Uint256`, `Int256Like` / `Int256`, `Bytes32Like` / `Bytes32`, and all widths `Uint8Like`…`Uint256Like`, `Int8Like`…`Int256Like`, plus `Bytes1Like`…`Bytes32Like`
- `SolidityTypeName`, `SolidityInputValue<T>`, `SolidityOutputValue<T>` (advanced type-level mapping helpers; the generator no longer uses these for wrapper signatures)

## Examples

```bash
npm run example
npm run example:wallet
npm run example:contract:read
npm run example:events
# Run all examples (including SDK generator JS/TS)
npm run examples
```

To try the typed SDK generator (generates a full package from Solidity or ABI+BIN):

```bash
node examples/example-generator-sdk-js.js   # JavaScript output
node examples/example-generator-sdk-ts.js   # TypeScript output
```

Requires `solc` on `QC_SOLC_PATH` or `SOLC_PATH`, or at default `c:\solc\solc.exe`. See [README-SDK.md](./README-SDK.md) for all generator options (`--artifacts-json`, `--sol`, `--create-package`, etc.).

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


