> **CAUTION:** This is an experimental SDK. Use at your own risk.

# QuantumCoin.js — Comprehensive SDK Documentation

This document is the **complete, detailed SDK reference** for QuantumCoin.js (ethers.js v6-compatible surface), including **every exported class/function**, their **parameters**, and links to **examples** and **tests** in this repository.

> Reminder: QuantumCoin.js requires calling `Initialize()` before using features that depend on `quantum-coin-js-sdk` (address validation, ABI encoding/decoding, signing, etc.).

## Table of Contents

- [Getting started](#getting-started)
  - [Install](#install)
  - [Initialization (required)](#initialization-required)
  - [Key differences vs ethers/Ethereum](#key-differences-vs-ethersethereum)
- [Configuration (`quantumcoin/config`)](#configuration-quantumcoinconfig)
  - [`Config`](#config)
  - [`Initialize(config)`](#initializeconfig)
  - [`isInitialized()`](#isinitialized)
  - [`getConfig()`](#getconfig)
- [Constants](#constants)
- [Errors](#errors)
  - [`makeError`, `assert`, `assertArgument`, `isError`, `isCallException`](#makeerror-assert-assertargument-iserror-iscallexception)
  - [`ProviderError`, `TransactionError`, `ContractError`](#providererror-transactionerror-contracterror)
- [Providers](#providers)
  - [`Provider`](#provider)
  - [`AbstractProvider`](#abstractprovider)
  - [`JsonRpcProvider` / `JsonRpcApiProvider`](#jsonrpcprovider--jsonrpcapiprovider)
  - [`WebSocketProvider`](#websocketprovider)
  - [`IpcSocketProvider`](#ipcsocketprovider)
  - [`BrowserProvider`](#browserprovider)
  - [`FallbackProvider`](#fallbackprovider)
  - [`FilterByBlockHash`](#filterbyblockhash)
  - [`Block`](#block)
  - [`TransactionResponse`](#transactionresponse)
  - [`TransactionReceipt`](#transactionreceipt)
  - [`Log`](#log)
- [Wallets & Signers](#wallets--signers)
  - [`SigningKey`](#signingkey)
  - [`AbstractSigner`](#abstractsigner)
  - [`BaseWallet`](#basewallet)
  - [`Wallet`](#wallet)
  - [`NonceManager`](#noncemanager)
  - [`JsonRpcSigner`](#jsonrpcsigner)
  - [`VoidSigner`](#voidsigner)
- [Contracts](#contracts)
  - [`Contract`](#contract)
  - [`ContractFactory`](#contractfactory)
  - [`ContractTransactionResponse`](#contracttransactionresponse)
  - [`ContractTransactionReceipt`](#contracttransactionreceipt)
  - [`EventLog`](#eventlog)
- [ABI](#abi)
  - [Fragments (`Fragment`, `FunctionFragment`, ...)](#fragments-fragment-functionfragment-)
  - [`Interface`](#interface)
  - [`AbiCoder`](#abicoder)
- [Utilities](#utilities)
  - [Address utilities](#address-utilities)
  - [Encoding utilities](#encoding-utilities)
  - [Hashing utilities](#hashing-utilities)
  - [Units](#units)
  - [RLP](#rlp)
  - [`Result` and `checkResultErrors`](#result-and-checkresulterrors)
- [Typed SDK Generator (`generate-sdk.js`)](#typed-sdk-generator-generate-sdkjs)
  - [Overview](#overview)
  - [Input modes](#input-modes)
  - [Package scaffolding mode](#package-scaffolding-mode)
  - [Generated package layout](#generated-package-layout)
  - [Running generated transactional tests](#running-generated-transactional-tests)
  - [Generator tests](#generator-tests)

## Getting started

### Install

```bash
npm install quantumcoin
```

### Initialization (required)

```js
const { Initialize } = require("quantumcoin/config");

// Initialize with defaults (chainId=123123 and default RPC endpoint)
await Initialize(null);
```

If you need to override the RPC endpoint used by `JsonRpcProvider` defaults:

```js
const { Config, Initialize } = require("quantumcoin/config");
await Initialize(new Config(123123, "https://public.rpc.quantumcoinapi.com"));
```

**Example(s):**
- `examples/example.js`

### Key differences vs ethers/Ethereum

- **Addresses are 32 bytes** (66 hex chars including `0x`)
- **Signing and ABI encoding/decoding** are delegated to `quantum-coin-js-sdk` (WASM)
- **Initialize must be called** once at startup for wallet/address/ABI helpers

## Configuration (`quantumcoin/config`)

### `Config`

**Constructor**

- `new Config(chainId?: number, rpcEndpoint?: string)`
  - **chainId**: defaults to `123123`
  - **rpcEndpoint**: defaults to `https://public.rpc.quantumcoinapi.com`

### `Initialize(config)`

- `Initialize(config: Config | null | undefined): Promise<boolean>`
  - If `config` is `null` / `undefined`, defaults are used
  - Initializes `quantum-coin-js-sdk` internally (WASM + crypto)

### `isInitialized()`

- `isInitialized(): boolean`
  - Returns true after `Initialize(...)` succeeds

### `getConfig()`

- `getConfig(): Config | null`
  - Returns the active config (or `null` if not initialized)

## Constants

Exported from `quantumcoin`:

- `version: string`
- `ZeroAddress: string` (32-byte zero address)
- `ZeroHash: string` (32-byte zero hash)
- `MaxUint256: bigint`
- `MaxUint160: bigint`
- `MinInt256: bigint`
- `MaxInt256: bigint`
- `NumericFault: string` (=`"NUMERIC_FAULT"`)
- `NumericFaultCode: string` (=`"NUMERIC_FAULT"`)
- `WeiPerEther: bigint` (=`1000000000000000000n`)
- `EtherSymbol: string` (=`"Ξ"`)
- `N: bigint` (compat placeholder)

## Errors

### `makeError`, `assert`, `assertArgument`, `isError`, `isCallException`

- `makeError(message: string, code: ErrorCode, info?: object): Error & { code, shortMessage }`
- `assert(check: any, message: string, code: ErrorCode, info?: object): void`
- `assertArgument(check: any, message: string, name: string, value: any): void`
- `isError(error: any, code: string): boolean`
- `isCallException(error: any): boolean`

**Notes**
- Most SDK errors are `Error`/`TypeError` with `.code` and `.shortMessage` (ethers-like).

### `ProviderError`, `TransactionError`, `ContractError`

- `new ProviderError(message: string, info?: object)`
- `new TransactionError(message: string, info?: object)`
- `new ContractError(message: string, info?: object)`

## Providers

### `Provider`

Base class extending Node’s `EventEmitter`. Used primarily for API surface parity.

### `AbstractProvider`

Base provider implementation. Subclasses implement `_perform`.

**Core method**
- `_perform(method: string, params?: any[]): Promise<any>` (**subclass responsibility**)

**Read operations**
- `getBlockNumber(): Promise<number>`
- `getBlock(blockNumber: number | "latest"): Promise<Block>`
- `getTransaction(txHash: string): Promise<TransactionResponse | null>`
- `getTransactionReceipt(txHash: string): Promise<TransactionReceipt | null>`
- `getBalance(address: string): Promise<bigint>`
- `getTransactionCount(address: string, blockTag?: string | null): Promise<number>`
- `call(tx: TransactionRequest, blockTag?: string | null): Promise<string>`
- `estimateGas(tx: TransactionRequest): Promise<bigint>`
- `getCode(address: string, blockTag?: string | null): Promise<string>`
- `getStorageAt(address: string, position: bigint, blockTag?: string | null): Promise<string>`
- `getLogs(filter: Filter | FilterByBlockHash): Promise<Log[]>`

**Write operation**
- `sendTransaction(tx: string | { raw: string }): Promise<TransactionResponse>`
  - QuantumCoin.js expects a **signed raw transaction hex string**.

**Example(s):**
- `examples/example.js`
- `examples/read-operations.js`
- `examples/events.js`

### `JsonRpcProvider` / `JsonRpcApiProvider`

HTTP JSON-RPC provider.

- `new JsonRpcProvider(url?: string, chainId?: number)`
  - If `url` is omitted, uses config default `rpcEndpoint`
  - If `chainId` is omitted, defaults to `123123`

**Example(s):**
- `examples/example.js`

### `WebSocketProvider`

WebSocket JSON-RPC provider (no extra dependencies; uses Node’s global `WebSocket`).

- `new WebSocketProvider(url: string, chainId?: number)`
- `destroy(): void` (closes socket, rejects pending requests)

**Test(s):**
- `test/integration/ws-provider.test.js`

### `IpcSocketProvider`

IPC JSON-RPC provider using Node’s `net`.

- `new IpcSocketProvider(path: string)`
  - Windows example: `\\\\.\\pipe\\geth.ipc`

**Test(s):**
- `test/integration/ipc-provider.test.js`

### `BrowserProvider`

EIP-1193 wrapper provider (for injected browser wallets).

- `new BrowserProvider(eip1193Provider: { request: Function }, network?: any, options?: BrowserProviderOptions)`
  - `providerInfo` is supported as an option (compat)

**Core methods**
- `send(method: string, params?: any[] | object): Promise<any>`
- `_send(payloadOrArray): Promise<any>` (compat)
- `_perform(method: string, params?: any[]): Promise<any>` (delegates to `send`)
- `getRpcError(payload, error): Error`
- `getSigner(addressOrIndex?: string | number): Promise<JsonRpcSigner>`
- `hasSigner(addressOrIndex: string | number): Promise<boolean>`

**Debug event sink**
- Emits `"debug"` events:
  - `{ action: "sendEip1193Payload", payload: { method, params } }`
  - `{ action: "receiveEip1193Result", result }`
  - `{ action: "receiveEip1193Error", error }`

**Test(s):**
- `test/unit/browser-provider.test.js`

Reference: ethers BrowserProvider docs: [`https://docs.ethers.org/v6/api/providers/#BrowserProvider`](https://docs.ethers.org/v6/api/providers/#BrowserProvider)

### `FallbackProvider`

Simple provider wrapper that tries multiple providers in order.

- `new FallbackProvider(providers: AbstractProvider | AbstractProvider[])`
- `_perform(method, params)` tries each provider until one succeeds

### `FilterByBlockHash`

Helper for filters pinned to a specific block hash (ethers style).

- `new FilterByBlockHash(blockHash: string, address?: string | string[], topics?: (string|string[]|null)[])`
  - `blockHash` must be **32-byte hex**
  - `toJSON()` returns `{ blockHash, address, topics }`

**Test(s):**
- `test/unit/filter-by-blockhash.test.js`

Reference: ethers FilterByBlockHash docs: [`https://docs.ethers.org/v6/api/providers/#FilterByBlockHash`](https://docs.ethers.org/v6/api/providers/#FilterByBlockHash)

### `Block`

Wrapper returned by `provider.getBlock(...)`.

**Properties**
- `hash: string | null`
- `parentHash: string | null`
- `number: number | null`
- `timestamp: number | null`
- `transactions: any[]`
- `provider: AbstractProvider | null`

**Methods**
- `getTransaction(indexOrHash: number | string): Promise<TransactionResponse | null>`
- `getTransactionReceipt(indexOrHash: number | string): Promise<TransactionReceipt | null>`
- `getPrefetchedTransactions(): any[]` (currently returns `[]`)

### `TransactionResponse`

Wrapper returned by `provider.sendTransaction(...)` and `provider.getTransaction(...)`.

**Properties (common)**
- `hash: string`
- `to: string | null`
- `from: string | null`
- `nonce: number | null`
- `data: string`
- `value: bigint`
- `gasLimit: bigint | null`
- `gasPrice: bigint | null`
- `chainId: number | null`
- `blockNumber: number | null`
- `provider: AbstractProvider | null`

**Methods**
- `wait(confirmations?: number | null, timeoutMs?: number | null): Promise<TransactionReceipt>`

### `TransactionReceipt`

Wrapper returned by `provider.getTransactionReceipt(...)` and `tx.wait()`.

**Properties (common)**
- `to: string | null`
- `from: string | null`
- `contractAddress: string | null`
- `transactionHash: string`
- `blockHash: string`
- `blockNumber: number | null`
- `transactionIndex: number | null`
- `gasUsed: bigint | null`
- `status: number | null`
- `logs: Log[]`
- `provider: AbstractProvider | null`

### `Log`

Wrapper returned by `provider.getLogs(...)`.

**Properties (common)**
- `address: string`
- `topics: string[]`
- `data: string`
- `blockHash: string | null`
- `blockNumber: number | null`
- `transactionHash: string | null`
- `transactionIndex: number | null`
- `logIndex: number | null`
- `removed: boolean`
- `provider: AbstractProvider | null`

**Methods**
- `getBlock(): Promise<Block | null>`
- `getTransaction(): Promise<TransactionResponse | null>`
- `getTransactionReceipt(): Promise<TransactionReceipt | null>`

## Wallets & Signers

### `SigningKey`

- `new SigningKey(privateKeyBytes: Uint8Array, publicKeyBytes: Uint8Array)`

### `AbstractSigner`

- `new AbstractSigner(provider?: AbstractProvider | null)`
- `provider: AbstractProvider | null`
- `getAddress(): Promise<string>` (base throws; implemented by subclasses)

### `BaseWallet`

Core signing implementation.

- `new BaseWallet(signingKey: SigningKey, provider?: AbstractProvider | null, precomputed?: { address: string }, qcWallet?: any)`

**Properties**
- `address: string`
- `privateKey: string` (getter; hex string)
- `provider: AbstractProvider | null`

**Methods**
- `getAddress(): Promise<string>`
- `signMessageSync(message: string | Uint8Array): string`
- `signTransaction(tx: TransactionRequest): Promise<string>`
- `sendTransaction(tx: TransactionRequest): Promise<TransactionResponse>`

### `Wallet`

User-facing wallet class.

- `new Wallet(privateKeyOrBytesOrSigningKey, provider?: AbstractProvider)`

**Static methods**
- `Wallet.createRandom(provider?: AbstractProvider): Wallet`
- `Wallet.fromEncryptedJsonSync(json: string, password: string, provider?: AbstractProvider): Wallet`
- `Wallet.fromPhrase(phrase: string | string[], provider?: AbstractProvider): Wallet`

**Instance methods**
- `getAddress(): string`
- `getBalance(blockTag?: string): Promise<bigint>`
- `getTransactionCount(blockTag?: string): Promise<number>`
- `encryptSync(password: string | Uint8Array): string`
- `connect(provider: AbstractProvider): Wallet`

**Example(s):**
- `examples/wallet-offline.js`

### `NonceManager`

Signer wrapper to manage nonces.

- `new NonceManager(signer: AbstractSigner)`

**Methods**
- `getAddress(): Promise<string>`
- `getTransactionCount(blockTag?: string): Promise<number>`
- `sendTransaction(tx: TransactionRequest): Promise<any>`
- `reset(): void`
- `increment(): void`

### `JsonRpcSigner`

Lightweight signer placeholder used by `BrowserProvider.getSigner(...)`.

- `new JsonRpcSigner(provider, address)`
- `getAddress(): Promise<string>`

### `VoidSigner`

Address-only signer.

- `new VoidSigner(address: string, provider?: AbstractProvider)`
- `getAddress(): Promise<string>`

## Contracts

### `Contract`

Dynamic contract wrapper (ethers-like).

- `new Contract(address: string, abi: any[] | Interface, runner?: AbstractProvider | Wallet, bytecode?: string)`

**Properties**
- `address: string`
- `target: string` (alias of address)
- `interface: Interface`
- `provider: AbstractProvider | null`
- `signer: any | null`

**Call / send**
- `call(methodName: string, args: any[], overrides?: TransactionRequest): Promise<any>`
- `send(methodName: string, args: any[], overrides?: TransactionRequest): Promise<ContractTransactionResponse>`

**Logs / events**
- `queryFilter(eventName: string, fromBlock?: number|string, toBlock?: number|string): Promise<EventLog[]>`
- `on(eventName: string, callback: Function): this`
- `once(eventName: string, callback: Function): this`
- `removeListener(eventName: string, callback: Function): this`
- `removeAllListeners(eventName?: string): this`

**Deployment helpers**
- `deployTransaction(): any | null`
- `waitForDeployment(): Promise<this>`
- `getDeployedCode(): Promise<string | null>`

**Example(s):**
- `examples/read-operations.js`
- `examples/events.js`

### `ContractFactory`

Deployment helper.

- `new ContractFactory(abi: any[] | Interface, bytecode: string, signer: any)`

**Methods**
- `getDeployTransaction(...args: any[]): TransactionRequest`
- `deploy(...args: any[]): Promise<Contract>`
- `attach(address: string): Contract`
- `connect(signer: any): ContractFactory`

### `ContractTransactionResponse`

Wrapper around an underlying `TransactionResponse`.

- `wait(confirmations?: number, timeoutMs?: number): Promise<any>`
- `getTransaction(): any`

### `ContractTransactionReceipt`

Wrapper around a receipt with convenience filters.

- `getEvent(eventName: string): any | null`
- `getEvents(eventName: string): any[]`

### `EventLog`

Lightweight log wrapper returned by `Contract.queryFilter(...)`.

## ABI

### Fragments (`Fragment`, `FunctionFragment`, ...)

Exported fragment types:
- `Fragment`
- `NamedFragment`
- `FunctionFragment`
- `EventFragment`
- `ErrorFragment`
- `ConstructorFragment`
- `StructFragment`
- `FallbackFragment`

All fragments support:
- `format(format?: string | null): string`
- `toJSON(): any`

### `Interface`

ABI encoding/decoding compatibility layer.

- `new Interface(abi: any[] | Interface | null)`

**Methods**
- `formatJson(): string`
- `format(format?: string | null): string`
- `getFunction(name: string): FunctionFragment`
- `getEvent(name: string): EventFragment`
- `getError(name: string): ErrorFragment`
- `getConstructor(): ConstructorFragment | null`

**Encoding**
- `encodeFunctionData(functionFragmentOrName, values?: any[] | null): string`
- `decodeFunctionResult(functionFragmentOrName, data: string): any`
- `encodeEventLog(eventFragmentOrName, values?: any[] | null): { topics: string[], data: string }`
- `decodeEventLog(eventFragmentOrName, topics: string[], data: string): any`

**Parsing**
- `parseLog(log: { topics: string[], data: string }): { fragment, name, signature, topic, args }`
  - Uses signature topic matching and `decodeEventLog(...)`

### `AbiCoder`

Minimal ABI coder for encoding/decoding tuples of values.

- `encode(types: (string|any)[], values: any[]): string`
- `decode(types: (string|any)[], data: string): any`
- `getDefaultValue(types: (string|any)[]): any`

## Utilities

### Address utilities

From `quantumcoin`:

- `isAddress(address: string): boolean`
- `getAddress(address: string): string`
- `isAddressable(value: any): boolean`
- `resolveAddress(target: any): string | Promise<string>`
- `getContractAddress({ from, nonce }): string`
- `getCreateAddress({ from, nonce }): string`
- `getCreate2Address(from: string, salt: string, initCodeHash: string): string`
- `computeAddress(publicKey: string|Uint8Array): string`
- `verifyMessage(message: string|Uint8Array, signature: string): string`
- `recoverAddress(message: string|Uint8Array, signature: string): string`

**Example(s):**
- `examples/wallet-offline.js`

## Solidity Types (TypeScript)

QuantumCoin.js exposes core Solidity-related types for TypeScript users.

- **Import path**: `quantumcoin/types`

**Key exports**

- `AddressLike` (currently `string`, 32-byte address)
- `BytesLike` (`string | Uint8Array`)
- `BigNumberish` (`string | number | bigint`)
- `SolidityTypeName` (ABI type string model)
- **Hard Solidity aliases** (preferred for typed wrappers):
  - Integers: `Uint256Like` / `Uint256`, `Int256Like` / `Int256` (and all widths `Uint8Like`…`Uint256Like`, `Int8Like`…`Int256Like`)
  - Fixed bytes: `Bytes32Like` / `Bytes32` (and `Bytes1Like`…`Bytes32Like`)
  - Arrays/tuples helpers: `SolArray<T>`, `SolFixedArray<T, N>`, `SolStruct<T>`
- `SolidityInputValue<T>` / `SolidityOutputValue<T>` (advanced type-level mapping from ABI type strings to JS values; the generator no longer uses these for wrapper signatures)

Example:

```ts
import type { AddressLike, BigNumberish, Uint256Like, Uint256 } from "quantumcoin/types";

const to: AddressLike = "0x0000000000000000000000000000000000000000000000000000000000001000";
const amount: BigNumberish = "123";
const asInput: Uint256Like = amount;
const asOutput: Uint256 = 123n;
```

### Encoding utilities

- `toUtf8String(data: BytesLike): string`
- `toUtf8Bytes(str: string): Uint8Array`
- `toHex(data: BytesLike): string`
- `hexlify(data: BytesLike): string`
- `arrayify(data: BytesLike): Uint8Array`
- `isBytesLike(value: any): boolean`
- `concat(items: BytesLike[]): string`
- `stripZerosLeft(data: BytesLike): string`
- `zeroPad(value: BytesLike, length: number): string`
- `zeroPadValue(value: BytesLike, length: number): string`
- `encodeBytes32String(text: string): string`
- `decodeBytes32String(bytes: BytesLike): string`
- `encodeBase64(data: BytesLike): string`
- `decodeBase64(data: string): Uint8Array`
- `encodeBase58(data: BytesLike): string`
- `decodeBase58(data: string): Uint8Array`
- `toUtf8CodePoints(str: string): number[]`
- `solidityPacked(...)` (**throws; not implemented**)
- `solidityPackedKeccak256(...)` (**throws; not implemented**)
- `solidityPackedSha256(...)` (**throws; not implemented**)

### Hashing utilities

- `keccak256(data: BytesLike): string`
- `sha256(data: BytesLike): string`
- `sha512(data: BytesLike): string`
- `ripemd160(data: BytesLike): string`
- `id(text: string): string` (=`keccak256(utf8Bytes(text))`)
- `randomBytes(length: number): Uint8Array`
- `computeHmac(algorithm: string, key: BytesLike, data: BytesLike): string`
- `pbkdf2(password: BytesLike, salt: BytesLike, iterations: number, keylen: number, algorithm?: string): string`
- `scrypt(password: BytesLike, salt: BytesLike, N: number, r: number, p: number, dkLen: number): Promise<string>`
- `scryptSync(password: BytesLike, salt: BytesLike, N: number, r: number, p: number, dkLen: number): string`

### Units

- `formatUnits(value: BigNumberish, decimals?: number): string`
- `parseUnits(value: string, decimals?: number): bigint`
- `formatEther(value: BigNumberish): string`
- `parseEther(value: string): bigint`

### RLP

- `encodeRlp(value: any): string`
- `decodeRlp(data: string): any`

### `Result` and `checkResultErrors`

- `class Result extends Array`
  - `new Result(items?: any[], keys?: (null|string)[])`
  - `Result.fromItems(items: any[], keys?: (null|string)[]): Result`
  - `getValue(name: string): any`
  - `toArray(deep?: boolean | null): any[]`
  - `toObject(deep?: boolean | null): Record<string, any>`
- `checkResultErrors(result: any): Array<{ error: Error, path: (string|number)[] }>`

## Typed SDK Generator (`generate-sdk.js`)

### Overview

`generate-sdk.js` creates **typed contract wrappers** for one or more contracts, and can optionally scaffold a complete npm package (with examples and transactional tests).

It supports generating:
- **TypeScript source** (`--lang ts`, default)
- **JavaScript source + TypeScript declarations** (`--lang js`)

**Typing behaviour (generated wrappers)**

- **Hard types**: wrapper signatures use concrete types from `quantumcoin/types` (e.g. `Uint256Like` for inputs, `Uint256` for outputs).
- **Single output unwrapping**: functions returning one value return the value directly (not `[value]`).
- **Multiple outputs**: returned as a tuple type (e.g. `Promise<[Uint256, Bool]>`).
- **No outputs**: `Promise<void>`.
- **Structs / tuples**: emitted as `export type <Name>Input` / `export type <Name>Output` and used in signatures.
- **JS typing**: JS output uses JSDoc types plus `.d.ts` files; TS users still get strong types.

**Entry point**
- `node generate-sdk.js ...`
- or `npx sdkgen ...` (when installed)

### Input modes

1) **ABI + BIN**

```bash
node generate-sdk.js --abi path/to/My.abi.json --bin path/to/My.bin --name MyContract --out ./out --non-interactive

# JS output
node generate-sdk.js --lang js --abi path/to/My.abi.json --bin path/to/My.bin --name MyContract --out ./out --non-interactive
```

2) **Solidity sources**

```bash
node generate-sdk.js --sol ".\\contracts\\A.sol,.\\contracts\\B.sol" --solc "c:\\solc\\solc.exe" --out ./out --non-interactive

# Pass additional solc args (example)
node generate-sdk.js --sol ".\\contracts\\A.sol" --solc "c:\\solc\\solc.exe" --solc-args "--via-ir --evm-version london" --out ./out --non-interactive
```

3) **Artifacts JSON (multi-contract ABI+BIN list)**

```bash
node generate-sdk.js --artifacts-json .\\artifacts.json --out .\\out --non-interactive
```

Example `artifacts.json`:

```json
[
  { "abi": "./Alpha.abi.json", "bin": "./Alpha.bin" },
  { "abi": "./Beta.abi.json", "bin": "./Beta.bin", "name": "Beta" },
  {
    "name": "Gamma",
    "abi": "[{\"type\":\"function\",\"name\":\"set\",\"stateMutability\":\"nonpayable\",\"inputs\":[{\"name\":\"value\",\"type\":\"uint256\"}],\"outputs\":[]}]",
    "bin": "0x6000600055..."
  }
]
```

### Package scaffolding mode

Use `--create-package` to create a full npm package (source, tests, examples, README).

```bash
node generate-sdk.js --artifacts-json .\\artifacts.json ^
  --lang ts ^
  --create-package --package-dir .\\tmp --package-name my-typed-package ^
  --package-description "My typed package" --package-author "me" ^
  --package-license MIT --package-version 0.0.1 ^
  --non-interactive
```

### Generated package layout

When `--create-package` is used, the generator produces:

- `src/` contract wrappers + factories
  - TS mode: `*.ts` (compiled output in `dist/` after `npm run build:ts`)
  - JS mode: `*.js` with `*.d.ts` types (no build step required)
- `test/e2e/*.e2e.test.js` per-contract transactional tests
- `examples/` deploy/read/write/events scripts
- `README.md` generated by the generator (includes ABI-derived API overview)
- `index.js` + `index.d.ts` (package entry shims)

### Running generated transactional tests

Generated package tests broadcast transactions and require:

- `QC_RPC_URL` (RPC endpoint)
- `QC_CHAIN_ID` (optional, default `123123`)

### Generator tests

- Unit tests:
  - `test/unit/generate-contract-cli.test.js`
  - `test/unit/generator.test.js`
  - `test/unit/generate-sdk-artifacts-json.test.js`
- E2E generator tests (transactional):
  - `test/e2e/typed-generator.e2e.test.js`

