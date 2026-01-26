<!--
This is an experimental SDK. Please do not use for production. Use at own risk
-->

# QuantumCoin.js - Ethers.js v6 Compatible API Specification

## Overview

This specification defines the requirements for implementing a QuantumCoin SDK that provides an ethers.js v6-compatible API. The implementation should follow the same object model pattern as ethers.js v6, while using quantum-coin-js-sdk for underlying functionality (ABI encoding/decoding, signing, address validation, etc.).

## Key Differences from Ethereum

1. **Address Format**: QuantumCoin addresses are 32 bytes (66 hex characters including 0x), not 20 bytes like Ethereum
2. **No HDWallet Support**: HDWallet functionality is not applicable for QuantumCoin
3. **RPC Endpoint**: Uses custom RPC endpoint format (stored in Config.rpcEndpoint)
4. **Chain ID**: Default chain ID is 123123 (mainnet)

## Core Principles

- Use only built-in JavaScript/Node.js libraries (no external dependencies except quantum-coin-js-sdk)
- Follow ethers.js v6 object model and API patterns
- All cryptographic operations, signing, and address validation must use quantum-coin-js-sdk
- Maintain compatibility with ethers.js v6 patterns for ease of migration

---

## Constants

### `version: string`
The current version of the QuantumCoin.js library.
- Type: `string`
- Example: `"1.0.0"`

### `ZeroAddress: string`
The zero address (all zeros).
- Type: `string`
- Value: `"0x0000000000000000000000000000000000000000000000000000000000000000"` (32 bytes, 66 hex characters)
- **Note**: The API matches ethers.js v6 ZeroAddress. For QuantumCoin, this is a 32-byte address.

### `ZeroHash: string`
The zero hash (all zeros).
- Type: `string`
- Value: `"0x0000000000000000000000000000000000000000000000000000000000000000"` (32 bytes, 66 hex characters)
- **Note**: The API matches ethers.js v6 ZeroHash.

### `MaxUint256: bigint`
The maximum value for a uint256.
- Type: `bigint`
- Value: `2n ** 256n - 1n`
- **Note**: The API matches ethers.js v6 MaxUint256.

### `MaxUint160: bigint`
The maximum value for a uint160.
- Type: `bigint`
- Value: `2n ** 160n - 1n`
- **Note**: The API matches ethers.js v6 MaxUint160.

### `MinInt256: bigint`
The minimum value for an int256.
- Type: `bigint`
- Value: `-(2n ** 255n)`
- **Note**: The API matches ethers.js v6 MinInt256.

### `MaxInt256: bigint`
The maximum value for an int256.
- Type: `bigint`
- Value: `2n ** 255n - 1n`
- **Note**: The API matches ethers.js v6 MaxInt256.

### `NumericFault: string`
Error code for numeric faults.
- Type: `string`
- Value: `"NUMERIC_FAULT"`
- **Note**: The API matches ethers.js v6 NumericFault.

### `NumericFaultCode: string`
Error code for numeric faults (alias).
- Type: `string`
- Value: `"NUMERIC_FAULT"`
- **Note**: The API matches ethers.js v6 NumericFaultCode.

### `WeiPerEther: bigint`
Wei per ether constant.
- Type: `bigint`
- Value: `1000000000000000000n` (1e18)
- **Note**: The API matches ethers.js v6 WeiPerEther.

### `EtherSymbol: string`
Symbol for Ether currency.
- Type: `string`
- Value: `"Ξ"`
- **Note**: The API matches ethers.js v6 EtherSymbol.

### `N: bigint`
BigNumber constant (exported as `N`).
- Type: `bigint`
- **Note**: The API matches ethers.js v6 N constant.

---

## Table of Contents

- [Overview](#overview)
- [Key Differences from Ethereum](#key-differences-from-ethereum)
- [Core Principles](#core-principles)
- [Constants](#constants)
- [1. Provider Classes](#1-provider-classes)
  - [1.1 AbstractProvider](#11-abstractprovider)
  - [1.2 JsonRpcProvider](#12-jsonrpcprovider)
  - [1.3 Block](#13-block)
  - [1.4 TransactionRequest](#14-transactionrequest)
  - [1.5 TransactionResponse](#15-transactionresponse)
  - [1.6 TransactionReceipt](#16-transactionreceipt)
  - [1.7 Log](#17-log)
  - [1.8 Filter](#18-filter)
  - [1.9 PollingBlockTagSubscriber](#19-pollingblocktagsubscriber)
  - [1.10 WebSocketProvider](#110-websocketprovider)
  - [1.11 IpcSocketProvider](#111-ipcsocketprovider)
  - [1.12 FallbackProvider](#112-fallbackprovider)
  - [1.13 BrowserProvider](#113-browserprovider)
  - [1.14 FilterByBlockHash](#114-filterbyblockhash)
- [2. Wallet Classes](#2-wallet-classes)
  - [2.1 AbstractSigner](#21-abstractsigner)
  - [2.2 BaseWallet](#22-basewallet)
  - [2.3 NonceManager](#23-noncemanager)
  - [2.4 Wallet](#24-wallet)
  - [2.5 JsonRpcSigner](#25-jsonrpcsigner)
  - [2.6 VoidSigner](#26-voidsigner)
- [3. Contract Classes](#3-contract-classes)
  - [3.1 BaseContract](#31-basecontract)
  - [3.2 Contract](#32-contract)
  - [3.3 ContractFactory](#33-contractfactory)
  - [3.4 ContractTransactionResponse](#34-contracttransactionresponse)
  - [3.5 ContractTransactionReceipt](#35-contracttransactionreceipt)
  - [3.6 EventLog](#36-eventlog)
- [4. Interface and ABI Classes](#4-interface-and-abi-classes)
  - [4.1 Interface](#41-interface)
  - [4.2 Fragment (Base Class)](#42-fragment-base-class)
  - [4.3 AbiFragment](#43-abifragment)
  - [4.4 FunctionFragment](#44-functionfragment)
  - [4.5 EventFragment](#45-eventfragment)
  - [4.6 AbiParameter](#46-abiparameter)
  - [4.7 TransactionDescription](#47-transactiondescription)
  - [4.8 LogDescription](#48-logdescription)
  - [4.9 ErrorFragment](#49-errorfragment)
  - [4.10 ErrorDescription](#410-errordescription)
  - [4.11 ConstructorFragment](#411-constructorfragment)
  - [4.12 ParamType](#412-paramtype)
  - [4.13 AbiCoder](#413-abicoder)
  - [4.14 StructFragment](#414-structfragment)
  - [4.15 FallbackFragment](#415-fallbackfragment)
- [5. Utility Classes and Functions](#5-utility-classes-and-functions)
  - [5.1 Result](#51-result)
  - [5.2 BytesLike](#52-byteslike)
  - [5.3 BigNumberish](#53-bignumberish)
  - [5.3.1 AddressLike](#531-addresslike)
  - [5.3.2 Typed Values](#532-typed-values)
  - [5.3.3 BlockTag](#533-blocktag)
  - [5.3.4 ProviderEventFilter](#534-providereventfilter)
  - [5.3.5 EventFilter](#535-eventfilter)
  - [5.3.6 SigningKey](#536-signingkey)
  - [5.3.7 Signature](#537-signature)
  - [5.3.8 Transaction](#538-transaction)
  - [5.3.9 Indexed](#539-indexed)
  - [5.3.10 KeystoreAccount](#5310-keystoreaccount)
  - [5.4 Address Utilities](#54-address-utilities)
  - [5.4.1 Addressable Interface](#541-addressable-interface)
  - [5.5 Encoding/Decoding Utilities](#55-encodingdecoding-utilities)
  - [5.6 BigNumber Utilities](#56-bignumber-utilities)
  - [5.7 Hash Utilities](#57-hash-utilities)
  - [5.8 Random Utilities](#58-random-utilities)
  - [5.9 RLP Encoding](#59-rlp-encoding)
  - [5.10 Provider Utility Functions](#510-provider-utility-functions)
  - [5.11 JSON Wallet Utilities](#511-json-wallet-utilities)
  - [5.12 Mnemonic](#512-mnemonic)
  - [5.13 Wordlist](#513-wordlist)
- [6. Network and Plugins](#6-network-and-plugins)
  - [6.1 Network](#61-network)
  - [6.2 Networkish](#62-networkish)
  - [6.3 NetworkPlugin (Base Interface)](#63-networkplugin-base-interface)
  - [6.4 GasCostPlugin](#64-gascostplugin)
- [7. Error Classes](#7-error-classes)
  - [7.1 Error](#71-error)
  - [7.2 ProviderError](#72-providererror)
  - [7.3 TransactionError](#73-transactionerror)
  - [7.4 ContractError](#74-contracterror)
- [8. Provider Types and Interfaces](#8-provider-types-and-interfaces)
  - [8.1 PreparedTransactionRequest](#81-preparedtransactionrequest)
  - [8.2 MinedBlock](#82-minedblock)
  - [8.3 MinedTransactionResponse](#83-minedtransactionresponse)
  - [8.4 FeeData](#84-feedata)
  - [8.5 WebSocketLike](#85-websocketlike)
  - [8.6 ProviderEvent](#86-providerevent)
  - [8.7 TopicFilter](#87-topicfilter)
- [9. Provider Interface](#9-provider-interface)
  - [9.1 Provider (Abstract Base Class)](#91-provider-abstract-base-class)
  - [9.2 ContractRunner (Abstract Base Class/Interface)](#92-contractrunner-abstract-base-classinterface)
  - [9.3 Signer (Abstract Base Class)](#93-signer-abstract-base-class)
- [10. Implementation Requirements](#10-implementation-requirements)
  - [10.1 Quantum-Coin-JS-SDK Integration](#101-quantum-coin-js-sdk-integration)
  - [10.2 Built-in Libraries Only](#102-built-in-libraries-only)
  - [10.3 Address Format Handling](#103-address-format-handling)
  - [10.4 Error Handling](#104-error-handling)
  - [10.5 Event Handling](#105-event-handling)
  - [10.6 Transaction Handling](#106-transaction-handling)
  - [10.7 ABI Handling](#107-abi-handling)
  - [10.8 Async/Await Pattern](#108-asyncawait-pattern)
  - [10.9 Type Safety](#109-type-safety)
- [11. File Structure](#11-file-structure)
- [12. Example Usage Patterns](#12-example-usage-patterns)
  - [12.1 Provider Usage](#121-provider-usage)
  - [12.2 Wallet Usage](#122-wallet-usage)
  - [12.3 Contract Usage](#123-contract-usage)
  - [12.4 Contract Deployment](#124-contract-deployment)
- [13. Testing Requirements](#13-testing-requirements)
- [14. Documentation Requirements](#14-documentation-requirements)
- [15. Typed Contract Generator](#15-typed-contract-generator)
- [Notes](#notes)

---

## 1. Provider Classes

### 1.1 AbstractProvider

**Purpose**: Abstract base class for all providers

**Extends**: Provider

**Note**: This is an internal base class. All concrete providers (JsonRpcProvider, WebSocketProvider, etc.) extend this class. The API matches ethers.js v6 AbstractProvider.

---

### 1.2 JsonRpcProvider

**Purpose**: Provides JSON-RPC interface to QuantumCoin blockchain

**Extends**: AbstractProvider

**Note**: The API matches ethers.js v6 JsonRpcProvider. All methods, properties, and behavior follow the same patterns as ethers.js v6.

**Constructor**:
```javascript
constructor(url?: string, chainId?: number)
```
- `url`: RPC endpoint URL (defaults to Config.rpcEndpoint or "https://public.rpc.quantumcoinapi.com")
- `chainId`: Chain ID (defaults to 123123)

**Properties**:
- `url`: string - RPC endpoint URL
- `chainId`: number - Chain ID

**Methods**:

#### `getBlockNumber(): Promise<number>`
Returns the latest block number.

#### `getBlock(blockNumber: number | "latest"): Promise<Block>`
Returns block information.
- `blockNumber`: Block number or "latest"

#### `getTransaction(txHash: string): Promise<TransactionResponse>`
Returns transaction details.
- `txHash`: Transaction hash (66 hex characters)

#### `getTransactionReceipt(txHash: string): Promise<TransactionReceipt>`
Returns transaction receipt.
- `txHash`: Transaction hash

#### `getBalance(address: string): Promise<bigint>`
Returns account balance in wei.
- `address`: 32-byte address (66 hex characters)

#### `getTransactionCount(address: string, blockTag?: string): Promise<number>`
Returns account nonce.
- `address`: 32-byte address
- `blockTag`: Optional block tag (default: "latest")

#### `sendTransaction(tx: TransactionRequest): Promise<TransactionResponse>`
Sends a signed transaction.
- `tx`: Transaction request object

#### `call(tx: TransactionRequest, blockTag?: string): Promise<string>`
Executes a call without creating a transaction.
- `tx`: Transaction request
- `blockTag`: Optional block tag

#### `estimateGas(tx: TransactionRequest): Promise<bigint>`
Estimates gas for a transaction.
- `tx`: Transaction request

#### `getCode(address: string, blockTag?: string): Promise<string>`
Returns contract bytecode.
- `address`: Contract address
- `blockTag`: Optional block tag

#### `getStorageAt(address: string, position: bigint, blockTag?: string): Promise<string>`
Returns storage value at position.
- `address`: Contract address
- `position`: Storage position
- `blockTag`: Optional block tag

#### `getLogs(filter: Filter): Promise<Log[]>`
Returns event logs matching filter.
- `filter`: Event filter object

#### `on(event: string, callback: Function): void`
Subscribes to events (block, pending, etc.).
- `event`: Event name
- `callback`: Callback function

#### `once(event: string, callback: Function): void`
Subscribes to event once.
- `event`: Event name
- `callback`: Callback function

#### `removeListener(event: string, callback: Function): void`
Removes event listener.
- `event`: Event name
- `callback`: Callback function

#### `removeAllListeners(event?: string): void`
Removes all listeners for event.
- `event`: Optional event name

---

### 1.2.1 JsonRpcApiProvider

**Purpose**: Base class for JSON-RPC API providers

**Extends**: AbstractProvider

**Note**: This is an internal base class that provides the core JSON-RPC API functionality. JsonRpcProvider extends this class. The API matches ethers.js v6 JsonRpcApiProvider.

---

### 1.3 Block

**Properties**:
- `number`: number - Block number
- `hash`: string | null - Block hash (66 hex characters, null for pending blocks)
- `timestamp`: number - Block timestamp
- `transactions`: string[] | TransactionResponse[] - Array of transaction hashes or full transaction objects
- `parentHash`: string - Parent block hash
- `gasLimit`: bigint - Gas limit
- `gasUsed`: bigint - Gas used
- `miner`: string - Miner coinbase address (32 bytes, 66 hex characters)
- `difficulty`: bigint - Difficulty target
- `nonce`: string - Block nonce
- `extraData`: string - Extra data included by validator
- `receiptsRoot`: string | null - Hash of the transaction receipts trie
- `date`: Date | null - Date object for block timestamp
- `length`: number - Number of transactions in block
- `provider: Provider | null` - Provider instance

**Methods**:

#### `getTransaction(indexOrHash: number | string): Promise<TransactionResponse | null>`
Gets a transaction from the block.
- `indexOrHash`: Transaction index or hash
- Returns: TransactionResponse or null if not found

#### `getTransactionReceipt(indexOrHash: number | string): Promise<TransactionReceipt | null>`
Gets a transaction receipt from the block.
- `indexOrHash`: Transaction index or hash
- Returns: TransactionReceipt or null if not found

#### `getPrefetchedTransactions(): TransactionResponse[]`
Returns prefetched transaction objects (if available).
- Returns: Array of TransactionResponse objects

**Note**: Some properties may be null for pending blocks. The `transactions` property can be either an array of hashes (when fetched with `getBlock(blockNumber)`) or full transaction objects (when fetched with `getBlock(blockNumber, true)`).

---

### 1.4 TransactionRequest

**Properties**:
- `to`: string | null - Recipient address (null for contract creation)
- `from`: string - Sender address
- `value`: bigint | string - Value in wei
- `data`: string - Transaction data (hex string)
- `gasLimit`: bigint | string - Gas limit
- `gasPrice`: bigint | string - Gas price
- `nonce`: number - Transaction nonce
- `chainId`: number - Chain ID
- `remarks`: string | null - Optional hex string (including 0x) that represents a remark/comment. Maximum 32 bytes length (in bytes). Warning: do not store any sensitive information in this field as it will be public on the blockchain.
- `type?: number` - Transaction type
- `accessList?: Array<{address: string, storageKeys: string[]}>` - Access list (EIP-2930)

---

### 1.5 TransactionResponse

**Properties**:
- `hash`: string - Transaction hash
- `to`: string | null - Recipient address
- `from`: string - Sender address
- `value`: bigint - Value in wei
- `data`: string - Transaction data
- `gasLimit`: bigint - Gas limit
- `gasPrice`: bigint | null - Gas price
- `nonce`: number - Nonce
- `chainId`: number - Chain ID
- `remarks`: string | null - Optional hex string (including 0x) that represents a remark/comment. Maximum 32 bytes length (in bytes). Warning: do not store any sensitive information in this field as it will be public on the blockchain.
- `blockNumber`: number | null - Block number
- `blockHash`: string | null - Block hash
- `provider: Provider | null` - Provider instance
- `index: number | null` - Transaction index in block
- `type: number | null` - Transaction type
- `accessList: Array<{address: string, storageKeys: string[]}> | null` - Access list

**Methods**:

#### `wait(confirmations?: number, timeout?: number): Promise<TransactionReceipt>`
Waits for transaction confirmation.
- `confirmations`: Optional number of confirmations to wait for
- `timeout`: Optional timeout in milliseconds

---

### 1.6 TransactionReceipt

**Properties**:
- `hash`: string - Transaction hash
- `blockNumber`: number - Block number
- `blockHash`: string - Block hash
- `transactionIndex`: number - Transaction index in block
- `from`: string - Sender address
- `to`: string | null - Recipient address
- `gasUsed`: bigint - Gas used
- `effectiveGasPrice`: bigint - Effective gas price
- `status`: number - Transaction status (1 = success, 0 = failure)
- `remarks`: string | null - Optional hex string (including 0x) that represents a remark/comment from the transaction. Maximum 32 bytes length (in bytes). Warning: do not store any sensitive information in this field as it will be public on the blockchain.
- `logs`: Log[] - Event logs
- `logsBloom`: string - Logs bloom filter
- `provider: Provider | null` - Provider instance
- `contractAddress: string | null` - Contract address if transaction created a contract
- `type: number | null` - Transaction type
- `root: string | null` - State root (pre-Byzantium)
- `cumulativeGasUsed: bigint` - Cumulative gas used in block

---

### 1.7 Log

**Properties**:
- `address`: string - Contract address
- `topics`: string[] - Event topics
- `data`: string - Log data
- `blockNumber`: number - Block number
- `blockHash`: string - Block hash
- `transactionHash`: string - Transaction hash
- `transactionIndex`: number - Transaction index
- `logIndex`: number - Log index
- `removed`: boolean - Whether log was removed
- `provider: Provider | null` - Provider instance

**Methods**:

#### `getBlock(): Promise<Block | null>`
Gets block containing log.
- Returns: Block or null

#### `getTransaction(): Promise<TransactionResponse | null>`
Gets transaction containing log.
- Returns: TransactionResponse or null

#### `getTransactionReceipt(): Promise<TransactionReceipt | null>`
Gets transaction receipt.
- Returns: TransactionReceipt or null

---

### 1.8 Filter

**Properties**:
- `address`: string | string[] - Contract address(es)
- `topics`: (string | string[] | null)[] - Event topics
- `fromBlock`: number | string - Start block
- `toBlock`: number | string - End block

---

### 1.9 PollingBlockTagSubscriber

**Purpose**: Subscribes to block updates by polling the provider at regular intervals

**Extends**: OnBlockSubscriber, Subscriber

**Constructor**:
```javascript
constructor(provider: Provider, tag: string)
```
- `provider`: Provider instance
- `tag`: Block tag to poll ("latest", "pending", etc.)

**Methods**:

#### `start(): void`
Starts polling for block updates.

#### `stop(): void`
Stops polling for block updates.

**Note**: This class provides a polling-based alternative to event subscriptions for environments where WebSocket subscriptions are not available.

---

### 1.9.1 SocketBlockSubscriber

**Purpose**: Subscribes to block updates via WebSocket

**Note**: This class is exported from ethers.js but not implemented in quantumcoin.js. It is listed here for API compatibility reference.

---

### 1.9.2 SocketEventSubscriber

**Purpose**: Subscribes to event logs via WebSocket

**Note**: This class is exported from ethers.js but not implemented in quantumcoin.js. It is listed here for API compatibility reference.

---

### 1.9.3 SocketPendingSubscriber

**Purpose**: Subscribes to pending transactions via WebSocket

**Note**: This class is exported from ethers.js but not implemented in quantumcoin.js. It is listed here for API compatibility reference.

---

### 1.9.4 SocketSubscriber

**Purpose**: Base class for WebSocket subscribers

**Note**: This class is exported from ethers.js but not implemented in quantumcoin.js. It is listed here for API compatibility reference.

---

### 1.9.5 UnmanagedSubscriber

**Purpose**: Represents an unmanaged subscriber

**Note**: This class is exported from ethers.js but not implemented in quantumcoin.js. It is listed here for API compatibility reference.

---

### 1.10 WebSocketProvider

**Purpose**: JSON-RPC provider backed by a WebSocket connection

**Extends**: SocketProvider, JsonRpcProvider

**Constructor**:
```javascript
constructor(url: string | WebSocketLike | WebSocketCreator, chainId?: number, options?: JsonRpcApiProviderOptions)
```
- `url`: WebSocket URL, WebSocketLike instance, or WebSocketCreator function
- `chainId`: Chain ID (defaults to 123123)
- `options`: Optional provider options

**Properties**:
- `websocket`: WebSocketLike - The WebSocket connection
- `url`: string - WebSocket URL
- `chainId`: number - Chain ID

**Methods**:
- Inherits all methods from JsonRpcProvider
- Provides real-time event subscriptions via WebSocket

**Note**: WebSockets provide instant access to events but require a persistent connection. Many third-party services charge additional fees for WebSocket endpoints.

---

### 1.11 IpcSocketProvider

**Purpose**: JSON-RPC provider backed by an IPC socket (for local nodes)

**Extends**: SocketProvider, JsonRpcProvider

**Constructor**:
```javascript
constructor(path: string, chainId?: number)
```
- `path`: Path to IPC socket
- `chainId`: Chain ID (defaults to 123123)

**Properties**:
- `path`: string - IPC socket path
- `chainId`: number - Chain ID

**Methods**:
- Inherits all methods from JsonRpcProvider
- Provides real-time event subscriptions via IPC

**Note**: Used for connecting to local QuantumCoin nodes running on the same machine.

---

### 1.12 FallbackProvider

**Purpose**: Provider that falls back to multiple providers for redundancy and reliability

**Extends**: Provider

**Constructor**:
```javascript
constructor(providers: Array<{ provider: Provider, priority?: number, weight?: number }>, quorum?: number)
```
- `providers`: Array of provider configurations with optional priority and weight
- `quorum`: Optional quorum number (default: 1) - number of providers that must agree

**Properties**:
- `providers`: Provider[] - Array of providers
- `quorum`: number - Quorum number

**Methods**:
- Inherits all methods from Provider
- Automatically falls back to next provider on failure
- For methods requiring quorum, waits for multiple providers to agree

**Note**: Useful for high-availability applications where multiple RPC endpoints are available.

---

### 1.13 BrowserProvider

**Purpose**: JSON-RPC provider backed by a browser-based EIP-1193 compatible provider (e.g., MetaMask, WalletConnect)

**Extends**: JsonRpcProvider

**Note**: The API matches ethers.js v6 BrowserProvider. This provider wraps EIP-1193 compatible providers that are injected into the browser (typically via `window.ethereum` or similar).

**Constructor**:
```javascript
constructor(ethereum: Eip1193Provider, chainId?: number)
```
- `ethereum`: EIP-1193 compatible provider object (must implement the EIP-1193 interface)
- `chainId`: Chain ID (defaults to 123123)

**Properties**:
- `provider`: Eip1193Provider - The wrapped EIP-1193 provider
- `chainId`: number - Chain ID

**Methods**:
- Inherits all methods from JsonRpcProvider
- Provides browser-based wallet integration
- Automatically handles account changes and chain changes via EIP-1193 events

**EIP-1193 Provider Interface**:
The `ethereum` parameter must implement the EIP-1193 interface with the following methods:
- `request({ method: string, params?: any[] }): Promise<any>` - Main RPC request method
- `on(event: string, callback: Function): void` - Event subscription
- `removeListener(event: string, callback: Function): void` - Event unsubscription

**Events**:
The BrowserProvider automatically listens to EIP-1193 events:
- `accountsChanged` - Emitted when accounts change
- `chainChanged` - Emitted when chain ID changes
- `disconnect` - Emitted when provider disconnects

**Note**: BrowserProvider is designed for browser environments. For Node.js environments, use JsonRpcProvider, WebSocketProvider, or IpcSocketProvider instead.

---

### 1.14 FilterByBlockHash

**Properties**:
- `blockHash`: string - Block hash to filter by (66 hex characters)
- `address`: string | string[] - Contract address(es)
- `topics`: (string | string[] | null)[] - Event topics

**Note**: Alternative to Filter for querying logs by block hash instead of block number range. Allows querying potentially orphaned blocks without ambiguity.

---

## 2. Wallet Classes

### 2.1 AbstractSigner

**Purpose**: Abstract base class for all signers

**Extends**: Signer

**Note**: This is an internal base class. All concrete signers (BaseWallet, Wallet, JsonRpcSigner, VoidSigner, etc.) extend this class. The API matches ethers.js v6 AbstractSigner.

---

### 2.2 BaseWallet

**Purpose**: Streamlined implementation of a Signer that operates with a private key

**Extends**: AbstractSigner

**Constructor**:
```javascript
constructor(privateKey: SigningKey, provider?: null | Provider)
```
- `privateKey`: SigningKey instance
- `provider`: Optional provider instance

**Properties**:
- `address`: string (read-only) - The wallet address
- `privateKey`: string (read-only) - The private key for this wallet
- `signingKey`: SigningKey (read-only) - The SigningKey used for signing payloads
- `provider`: Provider | null - Provider instance

**Methods**:

#### `getAddress(): Promise<string>`
Returns the wallet address.
- Returns: Address string

#### `signMessageSync(message: string | Uint8Array): string`
Returns the signature for message signed with this wallet (synchronous).
- `message`: Message to sign (string or bytes)
- Returns: Signature string
- **Implementation**: Uses quantum-coin-js-sdk for message signing

#### `signTransaction(tx: TransactionRequest): Promise<string>`
Signs a transaction and returns the signed transaction data.
- `tx`: Transaction request
- Returns: Signed transaction data
- **Implementation**: Uses `signRawTransaction()` from quantum-coin-js-sdk

#### `sendTransaction(tx: TransactionRequest): Promise<TransactionResponse>`
Signs and sends a transaction.
- `tx`: Transaction request
- Returns: TransactionResponse
- **Requires provider**: Throws error if `provider` is `null`.

**Note**: BaseWallet provides the core signing functionality. Wallet extends BaseWallet and adds additional convenience methods.

---

### 2.3 NonceManager

**Purpose**: Manages nonces for transactions to prevent conflicts and ensure proper ordering

**Extends**: Signer

**Constructor**:
```javascript
constructor(signer: Signer)
```
- `signer`: Signer instance to wrap

**Properties**:
- `signer`: Signer - The wrapped signer
- `provider`: Provider | null - Provider instance (from wrapped signer)

**Methods**:

#### `getAddress(): Promise<string>`
Returns the signer address.
- Returns: Address string

#### `getTransactionCount(blockTag?: string): Promise<number>`
Gets the current transaction count (nonce).
- `blockTag`: Optional block tag
- Returns: Current nonce

#### `sendTransaction(tx: TransactionRequest): Promise<TransactionResponse>`
Sends a transaction with managed nonce.
- `tx`: Transaction request (nonce will be auto-managed)
- Returns: TransactionResponse

#### `reset(): void`
Resets the nonce manager, clearing cached nonce.

#### `increment(): void`
Increments the internal nonce counter.

**Note**: NonceManager automatically manages nonces to prevent conflicts when sending multiple transactions. It tracks the nonce internally and increments it for each transaction.

---

### 2.4 Wallet

**Purpose**: Represents a QuantumCoin wallet with signing capabilities

**Extends**: BaseWallet

**Constructor**:
```javascript
constructor(key: string | Uint8Array | SigningKey, provider?: Provider)
```
- `key`: Private key as hex string, byte array, or SigningKey instance
- `provider`: Optional provider instance

**Implementation Notes**:
- The constructor should use quantum-coin-js-sdk functions to derive the wallet's public key and address:
  - Use `publicKeyFromPrivateKey()` from quantum-coin-js-sdk to get the public key from the private key
  - Use `addressFromPublicKey()` from quantum-coin-js-sdk to get the address from the public key
- If either function returns null, throw an error
- The private key should be converted to a byte array (number[]) if provided as a hex string for use with quantum-coin-js-sdk functions
- If a SigningKey is provided, use it directly

**Properties**:
- `address`: string (read-only) - Wallet address (32 bytes, 66 hex characters)
- `provider`: Provider | null - Provider instance (null if not provided in constructor)
- `privateKey`: string (read-only) - Private key as hex string
- `signingKey`: SigningKey (read-only) - The SigningKey used for signing payloads

**Static Methods**:

#### `createRandom(provider?: Provider): Wallet`
Creates a new random wallet.
- `provider`: Optional provider instance
- Returns: New Wallet instance
- **Implementation**: Uses `newWallet()` from quantum-coin-js-sdk internally. If `newWallet()` returns null, throw an error.

#### `fromEncryptedJsonSync(json: string, password: string, provider?: Provider): Wallet`
Creates a wallet from an encrypted JSON string (synchronous).
- `json`: Encrypted wallet JSON string
- `password`: Passphrase used to encrypt the wallet
- `provider`: Optional provider instance
- Returns: Wallet instance
- **Implementation**: Uses `deserializeEncryptedWallet()` from quantum-coin-js-sdk internally. If `deserializeEncryptedWallet()` returns null, throw an error.
- **Note**: This function can take up to a minute or so to execute. You should open wallets only from trusted sources.

#### `fromPhrase(phrase: string | string[], provider?: Provider): Wallet`
Creates a wallet from a seed phrase.
- `phrase`: Either:
  - An array of seed words (string[])
  - A space or comma delimited string containing seed words
- `provider`: Optional provider instance
- Returns: Wallet instance
- **Implementation**: 
  - If `phrase` is a string, split it by spaces or commas to create an array of words
  - The resulting array must contain exactly 48 words
  - Uses `openWalletFromSeedWords()` from quantum-coin-js-sdk internally with the array
  - If `openWalletFromSeedWords()` returns null, throw an error

**Provider Usage**:
- The provider is optional in the constructor. If not provided, `provider` will be `null`.
- Methods that require blockchain access (`getBalance()`, `getTransactionCount()`, `sendTransaction()`) will throw an error if `provider` is `null`.
- Methods that only require signing (`signTransaction()`, `signMessageSync()`, `signTypedData()`) can work without a provider.
- The provider can be set later using the `connect(provider)` method.

**Methods**:

#### `getAddress(): string`
Returns the wallet address.
- Does not require a provider.

#### `getBalance(blockTag?: string): Promise<bigint>`
Returns wallet balance.
- `blockTag`: Optional block tag
- **Requires provider**: Throws error if `provider` is `null`.

#### `getTransactionCount(blockTag?: string): Promise<number>`
Returns wallet nonce.
- `blockTag`: Optional block tag
- **Requires provider**: Throws error if `provider` is `null`.

#### `sendTransaction(tx: TransactionRequest): Promise<TransactionResponse>`
Signs and sends a transaction.
- `tx`: Transaction request (from, nonce, gasLimit will be auto-filled if not provided)
- **Requires provider**: Throws error if `provider` is `null`.
- Note: The `remarks` field in TransactionRequest is optional and can be used to include a comment (max 32 bytes). Do not store sensitive information in remarks.

#### `signTransaction(tx: TransactionRequest): Promise<string>`
Signs a transaction and returns the signed transaction data.
- `tx`: Transaction request
- **Does not require provider**: Can sign transactions offline.
- Note: The `remarks` field in TransactionRequest is optional and can be used to include a comment (max 32 bytes). Do not store sensitive information in remarks.

#### `signMessageSync(message: string | Uint8Array): string`
Signs a message and returns the signature (synchronous).
- `message`: Message to sign (string or bytes)
- Returns: Signature string
- **Does not require provider**: Can sign messages offline.
- **Implementation**: Uses quantum-coin-js-sdk for message signing

#### `encryptSync(password: string | Uint8Array): string`
Encrypts and serializes this wallet to a JSON string (synchronous).
- `password`: Passphrase used to encrypt the wallet (should be at least 12 characters long)
- Returns: Encrypted wallet JSON string
- **Implementation**: Uses `serializeEncryptedWallet()` from quantum-coin-js-sdk internally. If `serializeEncryptedWallet()` returns null, throw an error.
- **Note**: This method will block the event loop (freezing all UI) until it is complete, which may be a non-trivial duration. The encrypted JSON string is readable by Desktop/Mobile/Web/CLI wallet applications.

#### `connect(provider: Provider): Wallet`
Returns a new wallet instance connected to the provider.
- `provider`: Provider instance

---

## 3. Contract Classes

### 3.2 Contract

**Purpose**: Represents a smart contract instance

**Extends**: BaseContract

**Note**: The API matches ethers.js v6 Contract. All methods, properties, and behavior follow the same patterns as ethers.js v6.

**Constructor**:
```javascript
constructor(address: string, abi: Interface | AbiFragment[], providerOrSigner?: Provider | Signer, bytecode?: string)
```
- `address`: Contract address (32 bytes)
- `abi`: Contract ABI (Interface or array of fragments)
- `providerOrSigner`: Provider or signer instance
- `bytecode`: Optional contract bytecode

**Properties**:
- `address`: string - Contract address
- `interface`: Interface - Contract interface
- `provider`: Provider | null - Provider instance
- `signer`: Signer | null - Signer instance
- `target: string | Addressable` - Contract target (address or addressable)
- `runner: ContractRunner | null` - Contract runner (provider or signer)
- `deployTransaction: ContractTransactionResponse | null` - Deployment transaction

**Methods**:

#### `getAddress(): string`
Returns contract address.

#### `[methodName](...args): Promise<any>`
Dynamic methods for each contract function.
- For view functions: Returns decoded return values
- For state-changing functions: Returns ContractTransactionResponse

#### `queryFilter(event: EventFragment, fromBlock?: number | string, toBlock?: number | string): Promise<EventLog[]>`
Queries event logs.
- `event`: Event fragment
- `fromBlock`: Start block
- `toBlock`: End block

#### `on(event: EventFragment | string, callback: Function): Contract`
Subscribes to contract events.
- `event`: Event fragment or name
- `callback`: Callback function

#### `once(event: EventFragment | string, callback: Function): Contract`
Subscribes to event once.
- `event`: Event fragment or name
- `callback`: Callback function

#### `removeListener(event: EventFragment | string, callback: Function): Contract`
Removes event listener.
- `event`: Event fragment or name
- `callback`: Callback function

#### `removeAllListeners(event?: EventFragment | string): Contract`
Removes all listeners.
- `event`: Optional event name

#### `connect(signerOrProvider: Signer | Provider): Contract`
Returns new contract instance connected to signer/provider.
- `signerOrProvider`: Signer or provider

#### `attach(address: string): Contract`
Returns new contract instance at different address.
- `address`: New contract address

#### `deployTransaction(): TransactionResponse | null`
Returns deployment transaction (if contract was deployed).

#### `getTransactionReceipt(hash: string): Promise<ContractTransactionReceipt | null>`
Gets contract transaction receipt.
- `hash`: Transaction hash
- Returns: ContractTransactionReceipt or null

#### `waitForDeployment(): Promise<this>`
Waits for contract deployment.
- Returns: Contract instance (this)

#### `getDeployedCode(): Promise<string | null>`
Gets deployed contract code.
- Returns: Contract bytecode or null if not deployed

#### `static from(target: string | Addressable, abi: Interface | AbiFragment[], runner?: ContractRunner): Contract`
Creates contract from target.
- `target`: Contract address or addressable
- `abi`: Contract ABI
- `runner`: Optional contract runner
- Returns: Contract instance

---

### 3.3 ContractFactory

**Purpose**: Factory for deploying contracts

**Note**: The API matches ethers.js v6 ContractFactory. All methods, properties, and behavior follow the same patterns as ethers.js v6.

**Constructor**:
```javascript
constructor(abi: Interface | AbiFragment[], bytecode: string | BytesLike, signer?: Signer)
```
- `abi`: Contract ABI
- `bytecode`: Contract bytecode
- `signer`: Optional signer for deployment

**Methods**:

#### `getDeployTransaction(...args): TransactionRequest`
Returns deployment transaction request.
- `args`: Constructor arguments

#### `deploy(...args): Promise<Contract>`
Deploys the contract.
- `args`: Constructor arguments
- Returns: Contract instance

#### `attach(address: string): Contract`
Returns contract instance at address.
- `address`: Contract address

#### `connect(signer: Signer): ContractFactory`
Returns new factory connected to signer.
- `signer`: Signer instance

---

### 3.4 ContractTransactionResponse

**Extends**: TransactionResponse

**Additional Methods**:

#### `wait(confirmations?: number): Promise<ContractTransactionReceipt>`
Waits for transaction confirmation.
- `confirmations`: Optional confirmations to wait for

---

### 3.5 ContractTransactionReceipt

**Extends**: TransactionReceipt

**Additional Methods**:

#### `getEvent(eventName: string): EventLog | null`
Gets event log by name.
- `eventName`: Event name

#### `getEvents(eventName: string): EventLog[]`
Gets all event logs by name.
- `eventName`: Event name

---

### 3.6 EventLog

**Extends**: Log

**Additional Properties**:
- `eventName`: string - Event name
- `args`: Result - Decoded event arguments
- `fragment`: EventFragment - Event fragment

---

### 3.7 ContractEventPayload

**Purpose**: Represents a contract event payload

**Note**: This class is exported from ethers.js but not implemented in quantumcoin.js. It is listed here for API compatibility reference.

---

### 3.8 ContractUnknownEventPayload

**Purpose**: Represents an unknown contract event payload

**Note**: This class is exported from ethers.js but not implemented in quantumcoin.js. It is listed here for API compatibility reference.

---

### 3.9 EventPayload

**Purpose**: Base class for event payloads

**Note**: This class is exported from ethers.js but not implemented in quantumcoin.js. It is listed here for API compatibility reference.

---

### 3.10 UndecodedEventLog

**Purpose**: Represents an undecoded event log

**Extends**: Log

**Note**: This class is exported from ethers.js but not implemented in quantumcoin.js. It is listed here for API compatibility reference.

---

## 4. Interface and ABI Classes

### 4.0 Fragment

**Purpose**: Base class for ABI fragments

**Note**: This class is exported from ethers.js but not implemented in quantumcoin.js. It is listed here for API compatibility reference. In quantumcoin.js, `AbiFragment` serves as the base fragment class.

---

### 4.0.1 NamedFragment

**Purpose**: Base class for named ABI fragments

**Extends**: Fragment

**Note**: This class is exported from ethers.js but not implemented in quantumcoin.js. It is listed here for API compatibility reference.

---

### 4.1 Interface

**Purpose**: Represents contract ABI interface

**Note**: The API matches ethers.js v6 Interface. All methods, properties, and behavior follow the same patterns as ethers.js v6.

**Constructor**:
```javascript
constructor(fragments: AbiFragment[] | string)
```
- `fragments`: ABI fragments array or JSON string

**Properties**:
- `fragments`: readonly AbiFragment[] - ABI fragments

**Methods**:

#### `getFunction(nameOrSignature: string): FunctionFragment`
Gets function fragment by name or signature.
- `nameOrSignature`: Function name or signature

#### `getEvent(nameOrSignature: string): EventFragment`
Gets event fragment by name or signature.
- `nameOrSignature`: Event name or signature

#### `encodeFunctionData(functionFragment: FunctionFragment | string, values: any[]): string`
Encodes function call data.
- `functionFragment`: Function fragment or signature
- `values`: Function arguments

#### `decodeFunctionResult(functionFragment: FunctionFragment | string, data: string): Result`
Decodes function result.
- `functionFragment`: Function fragment or signature
- `data`: Encoded result data

#### `encodeEventLog(eventFragment: EventFragment, values: any[]): { topics: string[], data: string }`
Encodes event log.
- `eventFragment`: Event fragment
- `values`: Event values
- **Implementation**: Uses `encodeEventLog()` from quantum-coin-js-sdk internally
- Returns: Object with `topics` (string[]) and `data` (string)

#### `decodeEventLog(eventFragment: EventFragment, topics: string[], data: string): Result`
Decodes event log.
- `eventFragment`: Event fragment
- `topics`: Event topics
- `data`: Event data
- **Implementation**: Uses `decodeEventLog()` from quantum-coin-js-sdk internally
- Returns: Result object with decoded event arguments

#### `parseTransaction(data: string): TransactionDescription`
Parses transaction data.
- `data`: Transaction data

#### `parseLog(log: Log): LogDescription`
Parses log data.
- `log`: Log object
- Returns: LogDescription with decoded event information

#### `getError(nameOrSignature: string): ErrorFragment`
Gets error fragment by name or signature.
- `nameOrSignature`: Error name or signature
- Returns: ErrorFragment instance

#### `getConstructor(): ConstructorFragment | null`
Gets constructor fragment.
- Returns: ConstructorFragment instance or null if no constructor

#### `getFallback(): FunctionFragment | null`
Gets fallback function fragment.
- Returns: FunctionFragment instance or null if no fallback function

#### `getReceive(): FunctionFragment | null`
Gets receive function fragment.
- Returns: FunctionFragment instance or null if no receive function

#### `parseError(data: string): ErrorDescription`
Parses error data.
- `data`: Error data (hex string)
- Returns: ErrorDescription with decoded error information

#### `getSighash(fragment: FunctionFragment | ErrorFragment | string): string`
Gets function/error selector.
- `fragment`: Function or error fragment or signature string
- Returns: Function/error selector (4 bytes, 10 hex characters including 0x)

#### `getEventTopic(fragment: EventFragment | string): string`
Gets event topic hash.
- `fragment`: Event fragment or signature string
- Returns: Event topic hash (32 bytes, 66 hex characters including 0x)

#### `format(format?: string): string`
Formats interface as string.
- `format`: Optional format type
- Returns: Formatted interface string

#### `formatJson(): string`
Formats interface as JSON string.
- Returns: JSON string representation of interface

**Additional Properties**:
- `deploy: ConstructorFragment | null` - Constructor fragment
- `fallback: FallbackFragment | null` - Fallback function fragment
- `receive: boolean` - Whether contract has receive function

---

### 4.2 AbiFragment

**Base Properties**:
- `type`: string - Fragment type ("function", "event", "constructor", "fallback", "receive", "error")
- `name`: string - Fragment name
- `inputs`: AbiParameter[] - Input parameters
- `outputs`: AbiParameter[] - Output parameters (for functions, not applicable for errors)
- `signature`: string - Full signature of the fragment (e.g., "transfer(address,uint256)")

---

### 4.4 FunctionFragment

**Extends**: AbiFragment

**Note**: The API matches ethers.js v6 FunctionFragment.

**Additional Properties**:
- `stateMutability`: string - "pure", "view", "nonpayable", "payable"
- `constant`: boolean - Whether function is constant
- `payable`: boolean - Whether function is payable
- `selector`: string - Function selector (4 bytes, 10 hex characters including 0x)

**Methods**:

#### `format(format?: string): string`
Formats fragment as string.
- `format`: Optional format type

---

### 4.5 EventFragment

**Extends**: AbiFragment

**Note**: The API matches ethers.js v6 EventFragment.

**Additional Properties**:
- `anonymous`: boolean - Whether event is anonymous
- `topicHash`: string - Event topic hash (32 bytes, 66 hex characters including 0x)

**Methods**:

#### `format(format?: string): string`
Formats fragment as string.
- `format`: Optional format type

---

### 4.6 AbiParameter

**Note**: The API matches ethers.js v6 AbiParameter.

**Properties**:
- `name`: string - Parameter name
- `type`: string - Parameter type
- `indexed`: boolean - Whether parameter is indexed (for events)
- `components`: AbiParameter[] - Components (for structs/tuples)

---

### 4.7 TransactionDescription

**Note**: The API matches ethers.js v6 TransactionDescription.

**Properties**:
- `name`: string - Function name
- `signature`: string - Function signature
- `args`: Result - Decoded arguments
- `fragment`: FunctionFragment - Function fragment

---

### 4.8 LogDescription

**Note**: The API matches ethers.js v6 LogDescription.

**Properties**:
- `name`: string - Event name
- `signature`: string - Event signature
- `args`: Result - Decoded arguments
- `fragment`: EventFragment - Event fragment

---

### 4.9 ErrorFragment

**Extends**: AbiFragment

**Note**: The API matches ethers.js v6 ErrorFragment.

**Additional Properties**:
- `type`: "error" - Fragment type

**Methods**:

#### `format(format?: string): string`
Formats fragment as string.
- `format`: Optional format type

---

### 4.10 ErrorDescription

**Note**: The API matches ethers.js v6 ErrorDescription.

**Properties**:
- `name`: string - Error name
- `signature`: string - Error signature
- `args`: Result - Decoded error arguments
- `fragment`: ErrorFragment - Error fragment

---

### 4.11 ConstructorFragment

**Extends**: AbiFragment

**Note**: The API matches ethers.js v6 ConstructorFragment.

**Additional Properties**:
- `type`: "constructor" - Fragment type
- `payable`: boolean - Whether constructor is payable

**Methods**:

#### `format(format?: string): string`
Formats fragment as string.
- `format`: Optional format type

---

### 4.11 ParamType

**Purpose**: Represents a parameter type in an ABI

**Constructor**:
```javascript
constructor(fragment: string | ParamTypeLike)
```
- `fragment`: Type string or ParamType-like object

**Properties**:
- `type`: string - The base type (e.g., "uint256", "address", "tuple")
- `baseType`: string - The base type without array or tuple components
- `name`: string | null - Parameter name (if named)
- `indexed`: boolean - Whether parameter is indexed (for events)
- `components`: ParamType[] | null - Components for tuples/structs
- `arrayLength`: number | null - Array length (null for dynamic arrays)
- `arrayChildren`: ParamType | null - Type of array elements

**Methods**:

#### `format(format?: string): string`
Formats the type as a string.
- `format`: Optional format type ("full", "minimal", etc.)

#### `walk(fn: (type: ParamType) => void): void`
Recursively walks the type tree, calling fn for each ParamType.

---

### 4.13 AbiCoder

**Note**: The API matches ethers.js v6 AbiCoder.

**Purpose**: Low-level ABI encoding and decoding utility

**Constructor**:
```javascript
constructor()
```

**Methods**:

#### `encode(types: (string | ParamType)[], values: any[]): string`
Encodes an array of values according to their types.
- `types`: Array of type strings or ParamType instances
- `values`: Array of values to encode
- Returns: Encoded hex string
- **Implementation**: Uses `packMethodData()` from quantum-coin-js-sdk internally

#### `decode(types: (string | ParamType)[], data: string, loose?: boolean): Result`
Decodes encoded data according to types.
- `types`: Array of type strings or ParamType instances
- `data`: Encoded hex string
- `loose`: Optional flag for loose decoding (handles older Solidity padding issues)
- Returns: Result object with decoded values
- **Implementation**: Uses `unpackMethodData()` from quantum-coin-js-sdk internally

#### `getDefaultValue(types: (string | ParamType)[]): Result`
Returns the default values for the given types.
- `types`: Array of type strings or ParamType instances
- Returns: Result object with default values for each type

---

## 5. Utility Classes and Functions

### 5.1 Result

**Purpose**: Represents decoded ABI data (array-like object with named properties)

**Extends**: Array

**Properties**:
- Array indices for positional access
- Named properties for named parameters

**Static Methods**:

#### `Result.fromItems(items: Array<any>, keys?: Array<null | string>): Result`
Creates a new Result for items with each entry also accessible by its corresponding name in keys.
- `items`: Array of values
- `keys`: Optional array of keys (null for unnamed entries)
- Returns: Result instance

**Methods**:

#### `getValue(name: string): any`
Returns the value for name.
- `name`: Property name
- Returns: The value for the named property
- **Note**: This method ensures all named values are accessible even if they conflict with Result methods or JavaScript keywords

#### `toArray(deep?: boolean): any[]`
Converts to array.
- `deep`: Optional flag to recursively convert nested Result objects
- Returns: Normal array
- **Note**: Throws if there are any outstanding deferred errors

#### `toObject(deep?: boolean): Record<string, any>`
Converts to object.
- `deep`: Optional flag to recursively convert nested Result objects
- Returns: Object with name-value pairs
- **Note**: Throws if any value is unnamed or if there are outstanding deferred errors

#### `checkResultErrors(result: Result): Array<{ error: Error, path: Array<string | number> }>`
Returns all errors found in a Result.
- `result`: Result instance to check
- Returns: Array of error objects with error and path information
- **Note**: Certain errors encountered when creating a Result are deferred until accessed. This function allows checking for all errors upfront.

---

### 5.2 BytesLike

**Type**: `string | Uint8Array | ArrayLike<number>`

---

### 5.3 BigNumberish

**Type**: `string | number | bigint`

---

### 5.3.1 AddressLike

**Type**: `string | Promise<string> | Addressable`

**Purpose**: Anything that can be used to return or resolve an address.

**Note**: For QuantumCoin, ENS (Ethereum Naming Service) is not applicable, so address resolution is limited to direct addresses and Addressable objects.

---

### 5.3.2 Typed Values

**Purpose**: Typed values provide type-safe encoding and validation for ABI parameters.

#### Typed (Base Class/Interface)

**Purpose**: Base class for all typed values.

**Static Methods**:

#### `Typed.isTyped(value: any): boolean`
Returns true only if value is a Typed instance.
- `value`: Value to check
- Returns: `true` if value is a Typed instance

#### `Typed.dereference(value: Typed | T, type: string): T`
If the value is a Typed instance, validates the underlying value and returns it, otherwise returns value directly.
- `value`: Typed instance or value
- `type`: Expected type string
- Returns: The underlying value if Typed, otherwise the value itself
- **Note**: Useful for functions that accept either a Typed object or values

**Methods**:

#### `format(): string`
Format the type as a Human-Readable type.
- Returns: Formatted type string

#### `defaultValue(): string | number | bigint | Result`
The default value returned by this type.
- Returns: Default value for the type

#### `isBigInt(): boolean`
Returns true and provides a type guard if this is a TypedBigInt.
- Returns: `true` if this is a TypedBigInt

#### `isData(): boolean`
Returns true and provides a type guard if this is a TypedData.
- Returns: `true` if this is a TypedData

#### `isString(): boolean`
Returns true and provides a type guard if this is a TypedString.
- Returns: `true` if this is a TypedString

#### TypedBigInt Interface

**Extends**: Typed

**Purpose**: A Typed that represents a numeric value.

**Properties**:
- `value`: bigint - The numeric value

**Methods**:

#### `defaultValue(): bigint`
The default value for all numeric types is 0.

#### `maxValue(): bigint`
The maximum value for this type, accounting for bit-width.

#### `minValue(): bigint`
The minimum value for this type, accounting for bit-width and signed-ness.

**Static Methods**: Typed provides static methods for creating typed values:

**Numeric Types**:
- `Typed.uint8(v: BigNumberish): Typed`
- `Typed.uint256(v: BigNumberish): Typed`
- `Typed.int8(v: BigNumberish): Typed`
- `Typed.int256(v: BigNumberish): Typed`
- And all other uint/int variants (uint8 through uint256, int8 through int256)

**Other Types**:
- `Typed.address(v: string): Typed` - Creates a typed address
- `Typed.bool(v: boolean): Typed` - Creates a typed boolean
- `Typed.bytes(v: BytesLike, length?: number): Typed` - Creates typed bytes (length optional for dynamic bytes)
- `Typed.string(v: string): Typed` - Creates a typed string
- `Typed.array(v: any[], type: string): Typed` - Creates a typed array
- `Typed.tuple(v: any[], types: string[]): Typed` - Creates a typed tuple

#### TypedData Interface

**Extends**: Typed

**Purpose**: A Typed that represents a binary sequence of data as bytes.

**Properties**:
- `value`: string - The hex string value

**Methods**:

#### `defaultValue(): string`
The default value for this type (empty hex string "0x").

#### TypedString Interface

**Extends**: Typed

**Purpose**: A Typed that represents a UTF-8 sequence of bytes.

**Properties**:
- `value`: string - The string value

**Methods**:

#### `defaultValue(): string`
The default value for the string type is the empty string (i.e. "").

**Note**: Typed values are primarily used for type-safe ABI encoding. For QuantumCoin, these should work with quantum-coin-js-sdk's ABI encoding functions.

---

### 5.3.3 BlockTag

**Type**: `number | "latest" | "pending" | "earliest"`

**Purpose**: Represents a block identifier for queries.

**Values**:
- `number`: Specific block number
- `"latest"`: Latest block (default)
- `"pending"`: Pending block (mempool)
- `"earliest"`: Earliest block (genesis)

---

### 5.3.4 ProviderEventFilter

**Type**: `{ address?: string | string[], topics?: (string | string[] | null)[] }`

**Purpose**: Filter for provider events (blocks, transactions, logs).

**Properties**:
- `address`: Optional contract address(es) to filter
- `topics`: Optional event topics to filter

---

### 5.3.5 EventFilter

**Type**: `Filter`

**Purpose**: Alias for Filter type, used for event filtering.

**Note**: This is the same as the Filter type defined in Section 1.7.

---

### 5.3.6 SigningKey

**Purpose**: Represents a signing key used for cryptographic operations

**Constructor**:
```javascript
constructor(privateKey: string | Uint8Array)
```
- `privateKey`: Private key as hex string or byte array

**Properties**:
- `privateKey`: string - Private key as hex string
- `publicKey`: string - Public key

**Methods**:

#### `sign(digest: BytesLike): Signature`
Signs a message digest.
- `digest`: Message digest to sign
- Returns: Signature object

**Note**: SigningKey is used internally by BaseWallet and Wallet for signing operations. Can be created from a private key and used in Wallet constructor. The API matches ethers.js v6 SigningKey.

---

### 5.3.7 Signature

**Purpose**: Represents a cryptographic signature

**Properties**:
- `r`: string - R component of signature (hex string)
- `s`: string - S component of signature (hex string)
- `v`: number - Recovery ID (0 or 1)

**Methods**:

#### `serialize(): string`
Serializes signature to compact format.
- Returns: Serialized signature hex string

**Static Methods**:

#### `Signature.from(signature: string | SignatureLike): Signature`
Creates a Signature from various formats.
- `signature`: Signature string, object, or Signature instance
- Returns: Signature instance

**Note**: The API matches ethers.js v6 Signature, with QuantumCoin-specific simplifications (removed network-specific fields and legacy conversion methods).

---

### 5.3.8 Transaction

**Purpose**: Represents a transaction object

**Type**: Interface/Class

**Properties**:
- `to`: string | null - Recipient address (null for contract creation)
- `from`: string | null - Sender address (null if not specified)
- `nonce`: number | null - Transaction nonce
- `gasLimit`: bigint | null - Gas limit
- `gasPrice`: bigint | null - Gas price
- `value`: bigint | null - Transaction value in wei
- `data`: string | null - Transaction data (hex string)
- `chainId`: bigint | null - Chain ID
- `hash`: string | null - Transaction hash
- `type`: number | null - Transaction type
- `accessList`: Array<{ address: string, storageKeys: string[] }> | null - Access list (EIP-2930)

**Methods**:

#### `serialize(): string`
Serializes transaction to hex string.
- Returns: Serialized transaction hex string

#### `unsignedHash(): string`
Computes hash of unsigned transaction.
- Returns: Transaction hash (32 bytes, 66 hex characters including 0x)

**Static Methods**:

#### `Transaction.from(tx: string | TransactionLike): Transaction`
Creates a Transaction from various formats.
- `tx`: Transaction string, object, or Transaction instance
- Returns: Transaction instance

**Note**: The API matches ethers.js v6 Transaction. For QuantumCoin, transaction structure follows QuantumCoin conventions.

---

### 5.3.9 Indexed

**Purpose**: Type guard/interface for indexed event parameters

**Note**: This interface/type is exported from ethers.js but not implemented in quantumcoin.js. It is listed here for API compatibility reference.

---

### 5.3.9.1 TypedDataEncoder

**Purpose**: Encoder for EIP-712 typed data

**Note**: This class is exported from ethers.js but not implemented in quantumcoin.js. It is listed here for API compatibility reference.

**Type**: `{ indexed: true, hash?: string }`

**Purpose**: Used to mark event parameters as indexed. When an event parameter is indexed, it is hashed and stored in the topics array of the log.

**Note**: The API matches ethers.js v6 Indexed type. This is used in event filtering and decoding.

---

### 5.3.10 KeystoreAccount

**Type**: `{ address: string, mnemonic?: { entropy: string }, privateKey: string }`

**Purpose**: Contents of a JSON Keystore Wallet

**Properties**:
- `address`: string - Wallet address
- `privateKey`: string - Private key as hex string
- `mnemonic?`: Optional object containing:
  - `entropy`: string - Mnemonic entropy

**Note**: Used by `encryptKeystoreJsonSync()` and `decryptKeystoreJsonSync()` functions. For QuantumCoin, the mnemonic field is optional and may contain entropy for 48-word phrases.

---

### 5.4 Address Utilities

#### `isAddress(address: string): boolean`
Checks if string is a valid address (32 bytes, 66 hex characters).
- `address`: String to validate
- Returns: `true` if valid address, `false` otherwise

#### `getAddress(address: string): string`
Returns checksummed address (normalized for QuantumCoin).
- `address`: Address string to normalize
- Returns: Normalized and checksummed address (32 bytes, 66 hex characters)
- **Note**: For QuantumCoin, address checksumming follows QuantumCoin conventions (not Ethereum EIP-55)

#### `isAddressable(value: any): boolean`
Returns true if value is an object which implements the Addressable interface.
- `value`: Value to check
- Returns: `true` if value implements Addressable interface
- **Note**: Wallets, Signers, and Contracts implement Addressable

#### `resolveAddress(target: AddressLike): string | Promise<string>`
Resolves to an address for the target, which may be any supported address type, an Addressable or a Promise which resolves to an address.
- `target`: Address string, Addressable object, or Promise resolving to address
- Returns: Address string (synchronously) or Promise resolving to address string
- **Note**: For QuantumCoin, ENS resolution is not supported. Only direct addresses and Addressable objects are supported.

#### `getContractAddress(tx: { from: string, nonce: number }): string`
Calculates contract address from deployer and nonce.
- **Implementation**: Uses `createAddress()` from quantum-coin-js-sdk internally
- `tx.from`: Deployer address (32 bytes, 66 hex characters)
- `tx.nonce`: Deployer nonce (number)
- Returns: Contract address (32 bytes, 66 hex characters)

#### `getCreateAddress(tx: { from: string, nonce: number }): string`
Gets CREATE address (alias for getContractAddress).
- `tx.from`: Deployer address
- `tx.nonce`: Deployer nonce
- Returns: Contract address

#### `getCreate2Address(from: string, salt: string, initCodeHash: string): string`
Calculates CREATE2 contract address.
- **Implementation**: Uses `createAddress2()` from quantum-coin-js-sdk internally
- `from`: Deployer address (32 bytes, 66 hex characters)
- `salt`: Salt value (hex string)
- `initCodeHash`: Hash of initialization code (hex string)
- Returns: CREATE2 contract address (32 bytes, 66 hex characters)

#### `computeAddress(key: string | Uint8Array): string`
Computes address from public key.
- `key`: Public key as hex string or byte array
- Returns: Computed address (32 bytes, 66 hex characters including 0x)
- **Implementation**: Uses quantum-coin-js-sdk's `addressFromPublicKey()` internally

#### `verifyMessage(message: string | Uint8Array, signature: string): string`
Verifies a message signature and recovers the address.
- `message`: Message that was signed
- `signature`: Signature to verify (hex string)
- Returns: Address that signed the message
- **Implementation**: Uses quantum-coin-js-sdk for signature verification

#### `recoverAddress(message: string | Uint8Array, signature: string): string`
Recovers the address from a message signature.
- `message`: Message that was signed
- `signature`: Signature (hex string)
- Returns: Address that signed the message
- **Implementation**: Uses quantum-coin-js-sdk for signature recovery

### 5.4.1 Addressable Interface

**Purpose**: An interface for objects which have an address, and can resolve it asynchronously.

**Methods**:

#### `getAddress(): Promise<string>`
Get the object address.
- Returns: Promise resolving to the address string

**Note**: Wallets, Signers, and Contracts implement this interface, allowing them to be used anywhere an address is expected.

---

### 5.5 Encoding/Decoding Utilities

#### `toUtf8String(data: BytesLike): string`
Converts bytes to UTF-8 string.

#### `toUtf8Bytes(str: string): Uint8Array`
Converts string to UTF-8 bytes.

#### `toHex(data: BytesLike): string`
Converts data to hex string.

#### `hexlify(data: BytesLike): string`
Converts data to hex string (alias for toHex).

#### `arrayify(data: BytesLike): Uint8Array`
Converts data to byte array.

#### `concat(items: BytesLike[]): string`
Concatenates byte arrays.

#### `stripZerosLeft(data: BytesLike): string`
Strips leading zeros from hex string.

#### `encodeBytes32String(text: string): string`
Encodes text as a Bytes32 string.
- `text`: Text string to encode
- Returns: Hex string (32 bytes, 66 hex characters including 0x)
- **Note**: Text is padded or truncated to exactly 32 bytes

#### `decodeBytes32String(bytes: BytesLike): string`
Decodes the Bytes32-encoded bytes into a string.
- `bytes`: Bytes32-encoded data (hex string or bytes)
- Returns: Decoded text string
- **Note**: Removes null padding from the decoded string

#### `decodeBase58(data: string): Uint8Array`
Decodes Base58-encoded data.

**Note**: This function is exported from ethers.js but not implemented in quantumcoin.js. It is listed here for API compatibility reference.

---

#### `decodeBase64(data: string): Uint8Array`
Decodes Base64-encoded data.

**Note**: This function is exported from ethers.js but not implemented in quantumcoin.js. It is listed here for API compatibility reference.

---

#### `encodeBase58(data: BytesLike): string`
Encodes data to Base58 string.

**Note**: This function is exported from ethers.js but not implemented in quantumcoin.js. It is listed here for API compatibility reference.

---

#### `encodeBase64(data: BytesLike): string`
Encodes data to Base64 string.

**Note**: This function is exported from ethers.js but not implemented in quantumcoin.js. It is listed here for API compatibility reference.

---

#### `toUtf8CodePoints(str: string): number[]`
Converts string to UTF-8 code points array.

**Note**: This function is exported from ethers.js but not implemented in quantumcoin.js. It is listed here for API compatibility reference.

---

#### `isHexString(value: any, length?: number): boolean`
Checks if value is a valid hex string.
- `value`: Value to check
- `length`: Optional expected length in bytes
- Returns: `true` if value is a valid hex string, `false` otherwise

#### `isBytesLike(value: any): boolean`
Checks if value is bytes-like (string, Uint8Array, or ArrayLike<number>).
- `value`: Value to check
- Returns: `true` if value is bytes-like, `false` otherwise

#### `zeroPad(value: BytesLike, length: number): string`
Zero-pads a value to the specified length.
- `value`: Value to pad
- `length`: Target length in bytes
- Returns: Zero-padded hex string

#### `zeroPadValue(value: BytesLike, length: number): string`
Zero-pads a value to the specified length (left-pads).
- `value`: Value to pad
- `length`: Target length in bytes
- Returns: Zero-padded hex string

#### `solidityPacked(types: string[], values: any[]): string`
Encodes values using Solidity's packed encoding (no padding, tightly packed).
- `types`: Array of Solidity type strings
- `values`: Array of values to encode
- Returns: Packed encoded hex string
- **Note**: This is different from ABI encoding - values are tightly packed without padding

#### `solidityPackedKeccak256(types: string[], values: any[]): string`
Encodes values using Solidity's packed encoding and computes keccak256 hash.
- `types`: Array of Solidity type strings
- `values`: Array of values to encode
- Returns: Keccak256 hash of packed encoding (32 bytes, 66 hex characters including 0x)

#### `solidityPackedSha256(types: string[], values: any[]): string`
Encodes values using Solidity's packed encoding and computes SHA-256 hash.
- `types`: Array of Solidity type strings
- `values`: Array of values to encode
- Returns: SHA-256 hash of packed encoding (32 bytes, 66 hex characters including 0x)

---

### 5.6 BigNumber Utilities

#### `formatUnits(value: BigNumberish, decimals?: number): string`
Formats value with decimals.

#### `parseUnits(value: string, decimals?: number): bigint`
Parses value with decimals.

#### `formatEther(value: BigNumberish): string`
Formats wei to ether (18 decimals).

#### `parseEther(value: string): bigint`
Parses ether to wei (18 decimals).

---

### 5.7 Hash Utilities

#### `keccak256(data: BytesLike): string`
Computes Keccak-256 hash.
- `data`: Data to hash
- Returns: Hex string (32 bytes, 66 hex characters including 0x)

#### `sha256(data: BytesLike): string`
Computes SHA-256 hash.
- `data`: Data to hash
- Returns: Hex string (32 bytes, 66 hex characters including 0x)

#### `ripemd160(data: BytesLike): string`
Computes RIPEMD-160 hash.
- `data`: Data to hash
- Returns: Hex string (20 bytes, 42 hex characters including 0x)

#### `id(text: string): string`
Creates a keccak256 hash of a string (commonly used for function selectors).
- `text`: Text string to hash
- Returns: Hex string (32 bytes, 66 hex characters including 0x)
- **Note**: This is equivalent to `keccak256(toUtf8Bytes(text))`

#### `sha512(data: BytesLike): string`
Computes SHA-512 hash.
- `data`: Data to hash
- Returns: Hex string (64 bytes, 130 hex characters including 0x)

---

### 5.8 Random Utilities

#### `randomBytes(length: number): Uint8Array`
Generates random bytes.
- `length`: Number of random bytes to generate
- Returns: Uint8Array containing random bytes
- **Implementation**: Uses Node.js `crypto.randomBytes()` for Node.js environments. For browser environments, uses `crypto.getRandomValues()` from the Web Crypto API.

#### `computeHmac(algorithm: string, key: BytesLike, data: BytesLike): string`
Computes HMAC (Hash-based Message Authentication Code).
- `algorithm`: Hash algorithm to use (e.g., "sha256", "sha512")
- `key`: Secret key for HMAC computation
- `data`: Data to compute HMAC for
- Returns: HMAC as hex string
- **Implementation**: Uses Node.js `crypto.createHmac()` for Node.js environments. For browser environments, uses Web Crypto API's `crypto.subtle.sign()` with HMAC algorithm.
- **Supported algorithms**: "sha256", "sha512" (and other algorithms supported by the underlying crypto implementation)

#### `pbkdf2(password: BytesLike, salt: BytesLike, iterations: number, keylen: number, algorithm?: string): string`
Derives a key using PBKDF2 (Password-Based Key Derivation Function 2).
- `password`: Password to derive key from
- `salt`: Salt value (should be random bytes)
- `iterations`: Number of iterations (higher is more secure but slower)
- `keylen`: Desired key length in bytes
- `algorithm`: Hash algorithm to use (default: "sha256")
- Returns: Derived key as hex string
- **Implementation**: Uses Node.js `crypto.pbkdf2Sync()` for Node.js environments. For browser environments, uses Web Crypto API's `crypto.subtle.deriveBits()` with PBKDF2 algorithm.
- **Note**: This is a synchronous function that may block the event loop for a significant duration depending on the number of iterations.

#### `scrypt(password: BytesLike, salt: BytesLike, N: number, r: number, p: number, dkLen: number): string`
Derives a key using scrypt key derivation function.
- `password`: Password to derive key from
- `salt`: Salt value (should be random bytes)
- `N`: CPU/memory cost parameter (must be a power of 2, e.g., 16384, 32768)
- `r`: Block size parameter (typically 8)
- `p`: Parallelization parameter (typically 1)
- `dkLen`: Desired key length in bytes
- Returns: Derived key as hex string
- **Implementation**: Uses Node.js `crypto.scryptSync()` for Node.js environments. For browser environments, may require a polyfill or WebAssembly implementation as Web Crypto API does not support scrypt natively.
- **Note**: This is a synchronous function that may block the event loop for a significant duration depending on the parameters (especially N). scrypt is memory-hard and computationally expensive, making it resistant to hardware-accelerated attacks.

#### `scryptSync(password: BytesLike, salt: BytesLike, N: number, r: number, p: number, dkLen: number): string`
Synchronous version of scrypt key derivation.

**Note**: This function is exported from ethers.js but not implemented in quantumcoin.js. It is listed here for API compatibility reference. The `scrypt()` function in quantumcoin.js is already synchronous.

---

### 5.9 RLP Encoding

#### `encodeRlp(value: any): string`
Encodes value using RLP.

#### `decodeRlp(data: string): any`
Decodes RLP data.

---

### 5.10 Provider Utility Functions

#### `copyRequest(req: TransactionRequest): PreparedTransactionRequest`
Returns a copy of req with all properties coerced to their strict types.
- `req`: Transaction request to copy
- Returns: PreparedTransactionRequest with normalized properties

#### `getDefaultProvider(network?: Networkish, options?: any): FallbackProvider`
Gets default provider.
- `network`: Optional network identifier
- `options`: Optional provider options
- Returns: FallbackProvider instance

#### `showThrottleMessage(): void`
Shows throttle message.
- **Note**: Internal utility for rate limiting messages

#### `accessListify(accessList: any[]): Array<{address: string, storageKeys: string[]}>`
Normalizes access list.
- `accessList`: Access list to normalize
- Returns: Normalized access list

---

### 5.11 JSON Wallet Utilities

#### `isKeystoreJson(json: string): boolean`
Returns true if json is a valid JSON Keystore Wallet.
- `json`: JSON string to validate
- Returns: `true` if valid keystore JSON, `false` otherwise

#### `encryptKeystoreJsonSync(account: KeystoreAccount, password: string | Uint8Array): string`
Returns a JSON Keystore Wallet for account encrypted with password (synchronous).
- `account`: KeystoreAccount object with address, privateKey, and optional mnemonic
- `password`: Password for encryption
- Returns: Encrypted JSON Keystore Wallet string
- **Implementation**: Uses `serializeEncryptedWallet()` from quantum-coin-js-sdk internally
- **Note**: This method will block the event loop until encryption is complete. Uses default encryption parameters.

#### `decryptKeystoreJsonSync(json: string, password: string | Uint8Array): KeystoreAccount`
Returns account details for JSON Keystore Wallet using password (synchronous).
- `json`: JSON Keystore Wallet string
- `password`: Password for decryption
- Returns: KeystoreAccount object with address, privateKey, and optional mnemonic
- **Implementation**: Uses `deserializeEncryptedWallet()` from quantum-coin-js-sdk internally
- **Note**: This method will block the event loop until decryption is complete, which may take some time.

---

### 5.12 Mnemonic

**Purpose**: Wraps all properties required to compute seeds and convert between phrases and entropy

**Properties**:
- `entropy`: string (read-only) - The underlying entropy which the mnemonic encodes
- `password`: string (read-only) - The password used for this mnemonic (empty string if no password)
- `phrase`: string (read-only) - The mnemonic phrase (48 words for QuantumCoin)
- `wordlist`: Wordlist (read-only) - The wordlist for this mnemonic
- **Note**: Wordlist is a type representing a list of words used for mnemonic generation. For QuantumCoin, a 48-word wordlist is used. The API matches ethers.js v6 Mnemonic, with QuantumCoin-specific simplifications (removed locale and path fields).

---

### 5.13 Wordlist

**Purpose**: Represents a wordlist for mnemonic phrase generation

**Note**: This is an abstract base class/interface. For QuantumCoin, the `seed-words` library (a dependency of quantum-coin-js-sdk) is used internally for wordlist operations.

**Properties**:
- `locale`: string - Locale identifier for the wordlist

**Methods**:

#### `getWord(index: number): string`
Returns the word at the specified index.
- `index`: Word index (0-based)
- Returns: Word string

#### `getWordIndex(word: string): number`
Returns the index of the specified word.
- `word`: Word to find
- Returns: Word index, or -1 if not found

#### `split(mnemonic: string): Array<string>`
Splits a mnemonic phrase into individual words.
- `mnemonic`: Mnemonic phrase string
- Returns: Array of word strings

#### `join(words: Array<string>): string`
Joins words into a mnemonic phrase.
- `words`: Array of word strings
- Returns: Mnemonic phrase string

**Static Methods**:

#### `Wordlist.check(wordlist: Wordlist): Wordlist`
Validates a wordlist.
- `wordlist`: Wordlist instance to validate
- Returns: Validated wordlist

**Note**: The API matches ethers.js v6 Wordlist. For QuantumCoin, the `seed-words` library is used internally for all wordlist operations, including word lookup, validation, and phrase generation/parsing.

---

### 5.14 Number Utilities

#### `fromTwos(value: bigint, width: number): bigint`
Converts from two's complement.
- `value`: Value to convert
- `width`: Bit width
- Returns: Converted value

#### `toTwos(value: bigint, width: number): bigint`
Converts to two's complement.
- `value`: Value to convert
- `width`: Bit width
- Returns: Converted value

#### `mask(value: bigint, bits: number): bigint`
Masks bits.
- `value`: Value to mask
- `bits`: Number of bits
- Returns: Masked value

#### `getBigInt(value: any, name?: string): bigint`
Gets bigint value.
- `value`: Value to convert
- `name`: Optional parameter name for error messages
- Returns: Bigint value

#### `getUint(value: any, name?: string): number`
Gets uint value.
- `value`: Value to convert
- `name`: Optional parameter name for error messages
- Returns: Unsigned integer value

#### `getNumber(value: any, name?: string): number`
Gets number value.
- `value`: Value to convert
- `name`: Optional parameter name for error messages
- Returns: Number value

#### `toBigInt(value: any): bigint`
Converts to bigint.
- `value`: Value to convert
- Returns: Bigint value

#### `toNumber(value: any): number`
Converts to number.
- `value`: Value to convert
- Returns: Number value

#### `toBeHex(value: any, width?: number): string`
Converts to hex with width.
- `value`: Value to convert
- `width`: Optional byte width
- Returns: Hex string

#### `toBeArray(value: any, width?: number): Uint8Array`
Converts to array with width.
- `value`: Value to convert
- `width`: Optional byte width
- Returns: Byte array

#### `toQuantity(value: any): string`
Converts to quantity format.
- `value`: Value to convert
- Returns: Quantity string

---

### 5.15 Bytes Utilities

#### `getBytes(value: any, name?: string): Uint8Array`
Gets bytes.
- `value`: Value to convert
- `name`: Optional parameter name for error messages
- Returns: Byte array

#### `getBytesCopy(value: any, name?: string): Uint8Array`
Gets bytes copy.
- `value`: Value to convert
- `name`: Optional parameter name for error messages
- Returns: Copy of byte array

#### `dataLength(data: BytesLike): number`
Gets data length.
- `data`: Data to measure
- Returns: Length in bytes

#### `dataSlice(data: BytesLike, start: number, end?: number): string`
Slices data.
- `data`: Data to slice
- `start`: Start position
- `end`: Optional end position
- Returns: Sliced hex string

#### `zeroPadBytes(data: BytesLike, length: number): string`
Zero pads bytes.
- `data`: Data to pad
- `length`: Target length in bytes
- Returns: Zero-padded hex string

---

### 5.16 Error Utilities

#### `isError(error: any, code?: string): boolean`
Checks if error with code.
- `error`: Error to check
- `code`: Optional error code to match
- Returns: true if error matches

#### `isCallException(error: any): boolean`
Checks if call exception.
- `error`: Error to check
- Returns: true if call exception

#### `makeError(message: string, code: string, info?: any): Error`
Makes error.
- `message`: Error message
- `code`: Error code
- `info`: Optional error info
- Returns: Error instance

---

### 5.17 Assertion Utilities

#### `assert(check: boolean, message: string, code: string, info?: any): void`
Asserts condition.
- `check`: Condition to check
- `message`: Error message
- `code`: Error code
- `info`: Optional error info
- Throws: Error if check fails

#### `assertArgument(check: boolean, message: string, name: string, value: any): void`
Asserts argument.
- `check`: Condition to check
- `message`: Error message
- `name`: Argument name
- `value`: Argument value
- Throws: Error if check fails

#### `assertArgumentCount(count: number, expectedCount: number, message: string): void`
Asserts argument count.
- `count`: Actual count
- `expectedCount`: Expected count
- `message`: Error message
- Throws: Error if counts don't match

#### `assertNormalize(form: string): void`
Asserts normalize form.
- `form`: Form to check
- Throws: Error if form invalid

#### `assertPrivate(givenGuard: any, guard: symbol, className: string): void`
Asserts private access.
- `givenGuard`: Given guard value
- `guard`: Expected guard symbol
- `className`: Class name
- Throws: Error if guard doesn't match

---

### 5.18 Other Utilities

#### `resolveProperties(value: Record<string, any>): Promise<Record<string, any>>`
Resolves properties.
- `value`: Object with potentially async values
- Returns: Promise resolving to object with all values resolved

#### `defineProperties(target: any, values: Record<string, any>, types?: Record<string, string>): void`
Defines properties.
- `target`: Target object
- `values`: Property values
- `types`: Optional property types

#### `lock(value: any): any`
Locks value.
- `value`: Value to lock
- Returns: Locked value

#### `uuidV4(randomBytes: (length: number) => Uint8Array): string`
Generates UUID v4.
- `randomBytes`: Random bytes function
- Returns: UUID v4 string

---

### 5.19 Utility Classes (Not Implemented)

The following utility classes are exported from ethers.js but not implemented in quantumcoin.js. They are listed here for API compatibility reference:

#### `FixedNumber`

**Purpose**: Represents fixed-point decimal numbers

**Note**: This class is exported from ethers.js but not implemented in quantumcoin.js. Use `bigint` and `formatUnits`/`parseUnits` for decimal handling in quantumcoin.js.

---

#### `FetchRequest`

**Purpose**: Represents an HTTP fetch request

**Note**: This class is exported from ethers.js but not implemented in quantumcoin.js. It is listed here for API compatibility reference.

---

#### `FetchResponse`

**Purpose**: Represents an HTTP fetch response

**Note**: This class is exported from ethers.js but not implemented in quantumcoin.js. It is listed here for API compatibility reference.

---

#### `FetchCancelSignal`

**Purpose**: Represents a cancellation signal for fetch requests

**Note**: This class is exported from ethers.js but not implemented in quantumcoin.js. It is listed here for API compatibility reference.

---

**Static Methods**:

#### `Mnemonic.fromEntropy(entropy: BytesLike, password?: null | string, wordlist?: null | Wordlist): Mnemonic`
Create a new Mnemonic from the entropy.
- `entropy`: Entropy bytes
- `password`: Optional password (default: empty string)
- `wordlist`: Optional wordlist (default: QuantumCoin wordlist)
- Returns: Mnemonic instance
- **Note**: For QuantumCoin, the entropy should generate 48-word phrases

#### `Mnemonic.fromPhrase(phrase: string, password?: null | string, wordlist?: null | Wordlist): Mnemonic`
Creates a new Mnemonic for the phrase.
- `phrase`: Mnemonic phrase string (48 words for QuantumCoin)
- `password`: Optional password (default: empty string)
- `wordlist`: Optional wordlist (default: QuantumCoin wordlist)
- Returns: Mnemonic instance

#### `Mnemonic.entropyToPhrase(entropy: BytesLike, wordlist?: null | Wordlist): string`
Returns the phrase for the entropy.
- `entropy`: Entropy bytes
- `wordlist`: Optional wordlist (default: QuantumCoin wordlist)
- Returns: Mnemonic phrase string

#### `Mnemonic.isValidMnemonic(phrase: string, wordlist?: null | Wordlist): boolean`
Returns true if phrase is a valid mnemonic phrase.
- `phrase`: Phrase to validate
- `wordlist`: Optional wordlist (default: QuantumCoin wordlist)
- Returns: `true` if valid mnemonic, `false` otherwise
- **Note**: Checks that all words belong to the wordlist, length is valid, and checksum is correct. For QuantumCoin, validates 48-word phrases.

#### `Mnemonic.phraseToEntropy(phrase: string, wordlist?: null | Wordlist): string`
Returns the entropy for the phrase.
- `phrase`: Mnemonic phrase string
- `wordlist`: Optional wordlist (default: QuantumCoin wordlist)
- Returns: Entropy as hex string

**Methods**:

#### `computeSeed(): string`
Returns the seed for the mnemonic.
- Returns: Seed as hex string
- **Note**: Computes the seed from the mnemonic and password. For QuantumCoin, uses quantum-coin-js-sdk's seed computation.

---

## 6. Network and Plugins

### 6.1 Network

**Purpose**: Encapsulates chain properties and allows plugin extensions

**Note**: The API matches ethers.js v6 Network. All methods, properties, and behavior follow the same patterns as ethers.js v6.

**Constructor**:
```javascript
constructor(name: string, chainId: BigNumberish)
```
- `name`: Network name
- `chainId`: Chain ID

**Properties**:
- `name`: string - Network common name
- `chainId`: bigint - Network chain ID
- `plugins`: NetworkPlugin[] - Array of attached plugins (read-only)

**Static Methods**:

#### `Network.from(network?: Networkish): Network`
Returns a new Network for the network name or chainId.
- `network`: Network name, chainId, or Network object
- Returns: Network instance

#### `Network.register(nameOrChainId: string | number | bigint, networkFunc: () => Network): void`
Registers a network name or chainId with a function that returns a Network instance.
- `nameOrChainId`: Network name or chain ID to register
- `networkFunc`: Function that returns a Network instance

**Methods**:

#### `attachPlugin(plugin: NetworkPlugin): this`
Attach a new plugin to this Network.
- `plugin`: NetworkPlugin instance
- Returns: this

#### `clone(): Network`
Create a copy of this Network.
- Returns: New Network instance

#### `computeIntrinsicGas(tx: TransactionLike): number`
Compute the intrinsic gas required for a transaction.
- `tx`: Transaction-like object
- Returns: Intrinsic gas amount
- **Note**: A GasCostPlugin can be attached to override default values

#### `getPlugin<T extends NetworkPlugin>(name: string): null | T`
Return the plugin matching name exactly.
- `name`: Plugin name
- Returns: Plugin instance or null

#### `getPlugins<T extends NetworkPlugin>(basename: string): T[]`
Gets all plugins that match basename (with or without fragment).
- `basename`: Plugin base name
- Returns: Array of matching plugins

#### `matches(other: Networkish): boolean`
Returns true if other matches this network.
- `other`: Network name, chainId, or Network object
- Returns: true if chain IDs match (or names match if no chain ID)

#### `toJSON(): any`
Returns a JSON-compatible representation of the Network.

---

### 6.2 Networkish

**Type**: `Network | number | bigint | string | { chainId?: number, name?: string }`

**Purpose**: Anything that can be used to identify or create a Network.

---

### 6.3 NetworkPlugin (Base Interface)

**Purpose**: Base interface for network plugins

**Properties**:
- `name`: string - Plugin name (must be unique per network)

**Note**: All network plugins must implement this interface. Plugins can extend network functionality (gas costs, fee data, etc.).

---

### 6.4 GasCostPlugin

**Extends**: NetworkPlugin

**Purpose**: Plugin for computing gas costs

**Properties**:
- `name`: "org.ethers.plugins.network.GasCost" - Plugin name
- `txAccessListAddress`: number - Gas cost for access list address
- `txAccessListStorageKey`: number - Gas cost for access list storage key
- `txBase`: number - Base transaction gas cost
- `txCreate`: number - Gas cost for contract creation
- `txDataNonzero`: number - Gas cost per non-zero data byte
- `txDataZero`: number - Gas cost per zero data byte

**Methods**:

#### `computeIntrinsicGas(tx: TransactionLike): number`
Compute the intrinsic gas required for a transaction using plugin parameters.
- `tx`: Transaction-like object
- Returns: Intrinsic gas amount

---

## 7. Error Classes

### 7.1 Error

**Base error class**

**Properties**:
- `message`: string - Error message
- `code`: string - Error code
- `data`: any - Error data

---

### 7.2 ProviderError

**Extends**: Error

**Additional Properties**:
- `statusCode`: number - HTTP status code
- `request`: any - Request object
- `response`: any - Response object

---

### 7.3 TransactionError

**Extends**: Error

**Additional Properties**:
- `transaction`: TransactionRequest - Transaction that failed
- `receipt`: TransactionReceipt | null - Transaction receipt (if available)

---

### 7.4 ContractError

**Extends**: Error

**Additional Properties**:
- `contractAddress`: string - Contract address
- `method`: string - Method name
- `args`: any[] - Method arguments

---

## 8. Provider Types and Interfaces

### 8.1 PreparedTransactionRequest

**Purpose**: Transaction request with all properties coerced to strict types

**Properties**:
- `to`: string | null - Recipient address
- `from`: string - Sender address
- `value`: bigint - Value in wei
- `data`: string - Transaction data (hex string)
- `gasLimit`: bigint - Gas limit
- `gasPrice`: bigint | null - Gas price
- `nonce`: number - Transaction nonce
- `chainId`: number - Chain ID
- `remarks`: string | null - Optional remarks field

**Note**: Created by `copyRequest(req: TransactionRequest): PreparedTransactionRequest` to normalize a transaction request.

---

### 8.2 MinedBlock

**Purpose**: Block that has been mined (extends Block)

**Extends**: Block

**Additional Properties**:
- All Block properties are guaranteed to be non-null (hash, number, etc.)

**Note**: Type guard for blocks that have been mined. Pending blocks do not satisfy this type.

---

### 8.3 MinedTransactionResponse

**Purpose**: Transaction response that has been mined

**Extends**: TransactionResponse

**Additional Properties**:
- `blockNumber`: number - Block number (guaranteed non-null)
- `blockHash`: string - Block hash (guaranteed non-null)

**Methods**:

#### `isMined(): boolean`
Returns true if this transaction has been mined.
- Returns: true (always true for MinedTransactionResponse)

#### `getBlock(): Promise<Block>`
Resolves to the Block that this transaction was included in.
- Returns: Block instance

#### `confirmations(): Promise<number>`
Resolves to the number of confirmations this transaction has.
- Returns: Number of confirmations

**Note**: Type guard for transactions that have been included in a block.

---

### 8.4 FeeData

**Purpose**: Represents fee data for transactions

**Constructor**:
```javascript
constructor(gasPrice: bigint | null)
```
- `gasPrice`: Legacy gas price

**Properties**:
- `gasPrice`: bigint | null - Gas price

**Methods**:

#### `toJSON(): any`
Converts to JSON.
- Returns: JSON representation of FeeData

**Note**: For QuantumCoin, only `gasPrice` is used (EIP-1559 style transactions are not applicable).

---

### 8.5 WebSocketLike

**Purpose**: Interface for WebSocket-like objects

**Properties**:
- `readyState`: number - Connection state (0 = CONNECTING, 1 = OPEN, 2 = CLOSING, 3 = CLOSED)
- `onopen`: ((event: any) => void) | null - Open event handler
- `onmessage`: ((event: any) => void) | null - Message event handler
- `onerror`: ((event: any) => void) | null - Error event handler

**Methods**:

#### `send(payload: any): void`
Sends data through the WebSocket.
- `payload`: Data to send

#### `close(code?: number, reason?: string): void`
Closes the WebSocket connection.
- `code`: Optional close code
- `reason`: Optional close reason

**Note**: Generic interface for WebSocket compatibility, allowing different WebSocket implementations to be used.

---

### 8.6 ProviderEvent

**Type**: `string | Array<string | Array<string>> | EventFilter | FilterByBlockHash`

**Purpose**: Type for provider events that can be subscribed to

**Values**:
- `"block"` - Emitted on each new block with block number
- `"error"` - Emitted on async errors
- `"debug"` - Emitted on debug events
- Transaction hash (string) - Emitted when transaction is mined
- Array of topics - Emitted on matching logs
- EventFilter - Emitted on matching logs
- FilterByBlockHash - Emitted on matching logs in specific block

**Note**: Each provider may support additional event types.

---

### 8.7 TopicFilter

**Type**: `Array<null | string | Array<string>>`

**Purpose**: Structure for bloom-filter queries on event topics

**Description**:
- Each field can be:
  - `null` - Matches any value
  - `string` - Must match exactly that value
  - `Array<string>` - OR match (any one of those values must match)

**Example**:
```javascript
// Match any event from address 0x... with topic[0] = "0x123..." and any topic[1]
["0x123...", null]

// Match events with topic[0] = "0x123..." OR "0x456..."
[["0x123...", "0x456..."], null]
```

---

## 9. Provider Interface

### 9.1 Provider (Abstract Base Class)

**Properties**:
- `chainId`: Promise<number> - Chain ID

**Methods**:

#### `getBlockNumber(): Promise<number>`
Returns latest block number.

#### `getBlock(blockNumber: number | string): Promise<Block>`
Returns block information.

#### `getTransaction(txHash: string): Promise<TransactionResponse>`
Returns transaction.

#### `getTransactionReceipt(txHash: string): Promise<TransactionReceipt>`
Returns transaction receipt.

#### `getBalance(address: string, blockTag?: string): Promise<bigint>`
Returns balance.

#### `getTransactionCount(address: string, blockTag?: string): Promise<number>`
Returns nonce.

#### `sendTransaction(tx: string | TransactionRequest): Promise<TransactionResponse>`
Sends transaction.
- Note: If `tx` is a TransactionRequest, the `remarks` field is optional and can be used to include a comment (max 32 bytes). Do not store sensitive information in remarks.

#### `call(tx: TransactionRequest, blockTag?: string): Promise<string>`
Executes call.

#### `estimateGas(tx: TransactionRequest): Promise<bigint>`
Estimates gas.

#### `getCode(address: string, blockTag?: string): Promise<string>`
Returns contract code.

#### `getStorageAt(address: string, position: bigint, blockTag?: string): Promise<string>`
Returns storage value.

#### `getLogs(filter: Filter): Promise<Log[]>`
Returns logs.

#### `on(event: string, callback: Function): void`
Subscribes to events.

#### `once(event: string, callback: Function): void`
Subscribes to event once.

#### `removeListener(event: string, callback: Function): void`
Removes listener.

#### `removeAllListeners(event?: string): void`
Removes all listeners.

---

## 9. Provider Interface

### 9.1 Provider (Abstract Base Class)

**Purpose**: Abstract base class for blockchain providers

**Note**: The API matches ethers.js v6 Provider. All methods, properties, and behavior follow the same patterns as ethers.js v6.

**Properties**:
- `chainId`: Promise<number> - Chain ID
- `network: Network` - Network instance (read-only)
- `ready: Promise<Network>` - Promise that resolves when provider is ready

**Methods**:

#### `getBlockNumber(): Promise<number>`
Returns latest block number.

#### `getBlock(blockTag: string | number): Promise<Block | null>`
Returns block information.

#### `getTransaction(txHash: string): Promise<TransactionResponse | null>`
Returns transaction.

#### `getTransactionReceipt(txHash: string): Promise<TransactionReceipt | null>`
Returns transaction receipt.

#### `getBalance(address: string, blockTag?: string): Promise<bigint>`
Returns balance.

#### `getTransactionCount(address: string, blockTag?: string): Promise<number>`
Returns nonce.

#### `call(tx: TransactionRequest, blockTag?: string): Promise<string>`
Executes a call without creating a transaction.
- `tx`: Transaction request
- `blockTag`: Optional block tag
- Returns: Result data as hex string

#### `estimateGas(tx: TransactionRequest): Promise<bigint>`
Estimates gas for a transaction.
- `tx`: Transaction request
- Returns: Estimated gas amount

#### `getTransactionResult(txHash: string): Promise<null | string>`
Gets the result of a transaction execution.
- `txHash`: Transaction hash
- Returns: Result data or null if transaction failed

#### `getNetwork(): Promise<Network>`
Gets network information.
- Returns: Network instance

#### `getFeeData(): Promise<FeeData>`
Gets fee data (gas prices).
- Returns: FeeData instance

#### `broadcastTransaction(signedTx: string): Promise<TransactionResponse>`
Broadcasts a signed transaction.
- `signedTx`: Signed transaction hex string
- Returns: TransactionResponse

#### `waitForTransaction(txHash: string, confirms?: number, timeout?: number): Promise<TransactionReceipt>`
Waits for transaction confirmation.
- `txHash`: Transaction hash
- `confirms`: Optional number of confirmations to wait for
- `timeout`: Optional timeout in milliseconds
- Returns: TransactionReceipt

**Note**: Both Provider and Signer implement this interface, allowing them to be used interchangeably for contract calls and gas estimation.

---

### 9.2 ContractRunner (Abstract Base Class/Interface)

**Purpose**: Interface for contract execution (implemented by Provider and Signer)

**Note**: The API matches ethers.js v6 ContractRunner. All methods, properties, and behavior follow the same patterns as ethers.js v6.

**Properties**:
- `provider`: Provider | null - Provider instance

**Methods**:

#### `call(tx: TransactionRequest, blockTag?: string): Promise<string>`
Executes a call without creating a transaction.
- `tx`: Transaction request
- `blockTag`: Optional block tag
- Returns: Result data as hex string

#### `estimateGas(tx: TransactionRequest): Promise<bigint>`
Estimates gas for a transaction.
- `tx`: Transaction request
- Returns: Estimated gas amount

#### `getTransactionResult(txHash: string): Promise<null | string>`
Gets the result of a transaction execution.
- `txHash`: Transaction hash
- Returns: Result data or null if transaction failed

**Note**: Both Provider and Signer implement this interface, allowing them to be used interchangeably for contract calls and gas estimation.

---

### 9.3 Signer (Abstract Base Class)

**Note**: The API matches ethers.js v6 Signer. All methods, properties, and behavior follow the same patterns as ethers.js v6, except `signMessage()` is replaced with `signMessageSync()` for synchronous operation.

**Properties**:
- `provider`: Provider | null - Provider instance
- `address: string` - Signer address (read-only)

**Methods**:

#### `getAddress(): Promise<string>`
Returns signer address.

#### `getBalance(blockTag?: string): Promise<bigint>`
Returns balance.

#### `getTransactionCount(blockTag?: string): Promise<number>`
Returns nonce.

#### `sendTransaction(tx: TransactionRequest): Promise<TransactionResponse>`
Signs and sends transaction.
- Note: The `remarks` field in TransactionRequest is optional and can be used to include a comment (max 32 bytes). Do not store sensitive information in remarks.

#### `signTransaction(tx: TransactionRequest): Promise<string>`
Signs transaction.
- Note: The `remarks` field in TransactionRequest is optional and can be used to include a comment (max 32 bytes). Do not store sensitive information in remarks.

#### `signMessageSync(message: string | Uint8Array): string`
Signs message (synchronous).
- `message`: Message to sign (string or bytes)
- Returns: Signature string

#### `connect(provider: Provider): Signer`
Connects to provider.

#### `populateTransaction(tx: TransactionRequest): Promise<TransactionRequest>`
Populates transaction with defaults.
- `tx`: Transaction request
- Returns: Populated transaction request

#### `populateCall(tx: TransactionRequest): Promise<TransactionRequest>`
Populates call transaction.
- `tx`: Transaction request
- Returns: Populated call transaction request

#### `call(tx: TransactionRequest, blockTag?: BlockTag): Promise<string>`
Executes a call without creating a transaction.
- `tx`: Transaction request
- `blockTag`: Optional block tag
- Returns: Result data as hex string

#### `estimateGas(tx: TransactionRequest): Promise<bigint>`
Estimates gas for a transaction.
- `tx`: Transaction request
- Returns: Estimated gas amount

---

## 10. Implementation Requirements

### 10.1 Quantum-Coin-JS-SDK Integration

All implementations must use quantum-coin-js-sdk for:

1. **Address Validation**: Use `isAddressValid()` from quantum-coin-js-sdk
2. **ABI Encoding/Decoding**: Use `packMethodData()` and `unpackMethodData()` from quantum-coin-js-sdk
3. **Event Log Encoding/Decoding**: Use `encodeEventLog()` and `decodeEventLog()` from quantum-coin-js-sdk
4. **Transaction Signing**: Use `signRawTransaction()` from quantum-coin-js-sdk (supports `remarks` field via TransactionSigningRequest)
5. **Contract Address Calculation**: Use `createAddress()` and `createAddress2()` from quantum-coin-js-sdk
6. **Wallet Operations**: Use Wallet class from quantum-coin-js-sdk for private key management
7. **Wallet Address Derivation**: Use `publicKeyFromPrivateKey()` and `addressFromPublicKey()` from quantum-coin-js-sdk to derive the public key and address from the private key in the Wallet constructor
8. **Random Wallet Creation**: Use `newWallet()` from quantum-coin-js-sdk in `Wallet.createRandom()` static method
9. **Encrypted Wallet Deserialization**: Use `deserializeEncryptedWallet()` from quantum-coin-js-sdk in `Wallet.fromEncryptedJsonSync()` static method
10. **Encrypted Wallet Serialization**: Use `serializeEncryptedWallet()` from quantum-coin-js-sdk in `Wallet.encryptSync()` instance method
11. **Seed Words Wallet Creation**: Use `openWalletFromSeedWords()` from quantum-coin-js-sdk in `Wallet.fromPhrase()` static method (48 words required)
12. **RPC Calls**: Use quantum-coin-js-sdk RPC functions (getAccountDetails, getTransactionDetails, etc.)
13. **Transaction Remarks**: The `remarks` field is passed through to quantum-coin-js-sdk's TransactionSigningRequest.remarks field (optional, max 32 bytes, hex string with 0x prefix)

**SDK Source Reference (for implementers)**:
- The `quantum-coin-js-sdk` code can be found under `node_modules/quantum-coin-js-sdk/`.
- The SDK entrypoint and the `initialize(...)` function can be found in `node_modules/quantum-coin-js-sdk/index.js`.

### 10.2 Built-in Libraries Only

Use only built-in JavaScript/Node.js libraries:
- `crypto` - For hashing (SHA-256, RIPEMD-160), random bytes
- `Buffer` - For byte manipulation
- `http`/`https` - For RPC requests (if not using quantum-coin-js-sdk RPC)
- `util` - For utility functions
- `events` - For event emitters

### 10.3 Address Format Handling

- All addresses must be validated as 32 bytes (66 hex characters including 0x)
- Address normalization should use quantum-coin-js-sdk validation
- Address checksumming (if applicable) should follow QuantumCoin conventions

### 10.4 Error Handling

- All errors should extend appropriate error classes
- Error messages should be clear and descriptive
- Error codes should follow ethers.js patterns where applicable

### 10.5 Event Handling

- Use Node.js EventEmitter for event subscriptions
- Support block events, transaction events, and contract events
- Implement proper cleanup for event listeners

### 10.6 Transaction Handling

- Support both legacy and EIP-1559 style transactions (if applicable)
- Handle gas estimation and pricing
- Support transaction replacement (nonce management)
- Implement proper transaction confirmation waiting
- Support `remarks` field in transactions (optional, max 32 bytes, public on blockchain)
- Validate remarks field: must be hex string with 0x prefix, max 32 bytes when decoded
- Use quantum-coin-js-sdk's `signRawTransaction()` which accepts `remarks` in TransactionSigningRequest

### 10.7 ABI Handling

- Support all Solidity types (as defined in types.js)
- Handle complex types (arrays, structs, tuples)
- Support function overloading
- Support indexed and non-indexed event parameters

### 10.8 Async/Await Pattern

- All provider methods should return Promises
- Use async/await throughout
- Handle errors with try/catch

### 10.9 Type Safety

- Use JSDoc for type annotations
- Provide clear parameter and return type documentation
- Validate inputs at runtime

---

## 11. File Structure

```
quantumcoin.js/
├── src/
│   ├── providers/
│   │   ├── provider.js          # Base Provider class
│   │   ├── json-rpc-provider.js # JsonRpcProvider
│   │   └── index.js
│   ├── wallet/
│   │   ├── wallet.js            # Wallet class
│   │   └── index.js
│   ├── contract/
│   │   ├── contract.js          # Contract class
│   │   ├── contract-factory.js  # ContractFactory
│   │   └── index.js
│   ├── abi/
│   │   ├── interface.js         # Interface class
│   │   ├── fragments.js         # Fragment classes
│   │   └── index.js
│   ├── utils/
│   │   ├── address.js           # Address utilities
│   │   ├── encoding.js          # Encoding utilities
│   │   ├── hashing.js           # Hash utilities
│   │   ├── units.js             # Unit conversion
│   │   └── index.js
│   ├── errors/
│   │   ├── index.js             # Error classes
│   │   └── ...
│   └── index.js                 # Main entry point
├── test/
│   ├── unit/                    # Unit tests (no blockchain connectivity)
│   ├── integration/            # Integration tests (read-only blockchain)
│   ├── e2e/                    # End-to-end tests (write access)
│   ├── security/               # Security tests (malformed input, etc.)
│   └── fixtures/               # Test fixtures and data
├── config.js                    # Existing config
└── package.json
```

---

## 12. Example Usage Patterns

### 12.1 Provider Usage

```javascript
const { JsonRpcProvider } = require('quantumcoin');
const provider = new JsonRpcProvider('https://public.rpc.quantumcoinapi.com', 123123);

const balance = await provider.getBalance('0x...');
const blockNumber = await provider.getBlockNumber();
```

### 12.2 Wallet Usage

```javascript
const { Wallet } = require('quantumcoin');

// Create wallet from private key
const wallet = new Wallet('0x...privateKey...', provider);

// Create random wallet
const randomWallet = Wallet.createRandom(provider);

// Create wallet from encrypted JSON
const encryptedJson = '{"address":"...","crypto":{...}}';
const walletFromJson = Wallet.fromEncryptedJsonSync(encryptedJson, 'password123', provider);

// Create wallet from seed phrase (48 words) - can be array or string
const seedPhraseArray = ['word1', 'word2', ..., 'word48'];
const walletFromPhrase1 = Wallet.fromPhrase(seedPhraseArray, provider);

// Or as a space or comma delimited string
const seedPhraseString = 'word1 word2 ... word48'; // or 'word1,word2,...,word48'
const walletFromPhrase2 = Wallet.fromPhrase(seedPhraseString, provider);

// Encrypt wallet to JSON string (instance method)
const encryptedJson = wallet.encryptSync('mySecurePassword123');
// Can be saved to file and opened in Desktop/Mobile/Web/CLI wallet applications

// Sign message synchronously
const signature = wallet.signMessageSync('Hello, QuantumCoin!');

const tx = await wallet.sendTransaction({
    to: '0x...',
    value: parseEther('1.0')
});
```

### 12.3 Contract Usage

```javascript
const { Contract } = require('quantumcoin');
const abi = [...]; // ABI array
const contract = new Contract('0x...', abi, provider);

const result = await contract.balanceOf('0x...');
const tx = await contract.transfer('0x...', parseEther('1.0'));
```

### 12.4 Contract Deployment

```javascript
const { ContractFactory } = require('quantumcoin');
const factory = new ContractFactory(abi, bytecode, wallet);
const contract = await factory.deploy(...args);
```

---

## 13. Testing Requirements

### 13.1 Test Organization

Tests should be organized into the following folders:
- **`test/unit/`**: Unit tests that don't require blockchain connectivity
- **`test/integration/`**: Integration tests that require read-only blockchain connectivity
- **`test/e2e/`**: End-to-end tests that require write access (sending transactions)
- **`test/security/`**: Security tests with malformed input, edge cases, and attack vectors

### 13.2 Test Metadata

Each test file must include metadata to specify test categories:

```javascript
/**
 * @testCategory unit|integration|e2e|security
 * @blockchainRequired false|readonly|write
 * @description Brief description of what this test suite covers
 */
```

**Test Categories:**
- **`unit`**: Tests that don't need blockchain connectivity (pure functions, utilities, encoding/decoding, etc.)
- **`integration`**: Tests that need read-only blockchain connectivity (querying blocks, transactions, contract reads, etc.)
- **`e2e`**: Tests that need write access (sending transactions, deploying contracts, etc.)
- **`security`**: Tests for security vulnerabilities, malformed input, edge cases, etc.

**Blockchain Requirements:**
- **`false`**: No blockchain connectivity needed
- **`readonly`**: Read-only blockchain access (queries only)
- **`write`**: Write access required (sending transactions)

### 13.3 Test Configuration

**RPC Endpoint**: `https://public.rpc.quantumcoinapi.com`
**Chain ID**: `123123`

**Test Data Requirements:**
- For block-related tests: Use block numbers greater than `3000000`
- For transaction read-only tests: Use transactions between blocks `3385844` to `3387473` (inclusive)
- For smart contract read-only tests:
  - Contract Address: `0x0000000000000000000000000000000000000000000000000000000000001000`
  - ABI: Available at `https://raw.githubusercontent.com/quantumcoinproject/quantum-coin-go/refs/heads/dogep/systemcontracts/staking/stakingv2/StakingContract.abi`

### 13.4 Test Coverage Requirements

#### 13.4.1 Comprehensive Test Coverage

All tests must include:
- **Positive test cases**: Valid inputs and expected successful outcomes
- **Negative test cases**: Invalid inputs, error conditions, and edge cases
- **Optional parameter coverage**: Tests must cover all combinations of optional parameters to achieve 100% code coverage of the SDK
  - Test with all optional parameters provided
  - Test with no optional parameters (using defaults)
  - Test with partial optional parameters (various combinations)

#### 13.4.2 Unit Tests (No Blockchain Connectivity)

Test areas:
- Address validation and conversion (32-byte addresses)
- Encoding/decoding utilities
- Hash functions
- Unit conversions
- Error classes and error handling
- Wallet creation and management (without sending transactions)
- Message signing (offline)
- ABI parsing and fragment handling
- Data encoding/decoding

#### 13.4.3 Integration Tests (Read-Only Blockchain)

Test areas:
- Provider initialization and connection
- Block queries (`getBlock`, `getBlockNumber`, etc.)
- Transaction queries (`getTransaction`, `getTransactionReceipt`, etc.)
- Balance queries (`getBalance`)
- Contract read operations (using the staking contract at `0x0000000000000000000000000000000000000000000000000000000000001000`)
- Event filtering and querying (read-only)
- Log queries
- Gas estimation (read-only operation)
- Network information queries

**Test Data:**
- Blocks: Use block numbers > 3000000
- Transactions: Use transactions from blocks 3385844 to 3387473
- Contract: Use staking contract at `0x0000000000000000000000000000000000000000000000000000000000001000`

#### 13.4.4 End-to-End Tests (Write Access)

Test areas:
- Sending standard transactions
- Contract deployment
- Contract write operations
- Transaction confirmation and receipt handling
- Event listening and subscription
- Transaction replacement and cancellation

**Test Wallet:**
- A hardcoded test wallet must be included in test files for sending transactions
- The test wallet should have sufficient balance for testing
- Private key should be stored securely in test configuration (not committed to version control in production)

**IERC20 Contract Tests:**
- Deploy a standard IERC20 contract
- Test all IERC20 operations:
  - `transfer(to, amount)`
  - `transferFrom(from, to, amount)`
  - `approve(spender, amount)`
  - `balanceOf(account)`
  - `allowance(owner, spender)`
  - `totalSupply()`
- Test events: `Transfer`, `Approval`
- Test with various parameter combinations and optional parameters

#### 13.4.5 Security Tests

Test areas:
- **Malformed input handling**:
  - Invalid addresses (wrong length, invalid characters, etc.)
  - Invalid transaction data
  - Invalid ABI formats
  - Invalid block numbers and tags
  - Invalid hex strings
  - Invalid numeric values (negative, overflow, etc.)
- **Edge cases**:
  - Empty strings and null/undefined values
  - Very large numbers (overflow scenarios)
  - Zero values
  - Boundary conditions
- **Attack vectors**:
  - SQL injection attempts in string parameters
  - Buffer overflow attempts
  - Reentrancy scenarios (where applicable)
  - Invalid signature handling
  - Invalid transaction replay attempts

### 13.5 Code Coverage Goal

The test suite must achieve **100% code coverage** of the SDK. This includes:
- All public methods
- All private/internal methods
- All error paths
- All optional parameter combinations
- All conditional branches
- All edge cases

### 13.6 Test Examples

#### Example: Unit Test Structure

```javascript
/**
 * @testCategory unit
 * @blockchainRequired false
 * @description Tests for address utilities
 */
describe('Address Utilities', () => {
  describe('isAddress', () => {
    it('should return true for valid 32-byte address', () => {
      // Positive test case
    });
    
    it('should return false for invalid address', () => {
      // Negative test case
    });
    
    it('should handle optional checksum parameter', () => {
      // Optional parameter test
    });
  });
});
```

#### Example: Integration Test Structure

```javascript
/**
 * @testCategory integration
 * @blockchainRequired readonly
 * @description Tests for block queries
 */
describe('Block Queries', () => {
  const provider = new JsonRpcProvider('https://public.rpc.quantumcoinapi.com', 123123);
  
  describe('getBlock', () => {
    it('should get block by number > 3000000', async () => {
      // Test with block number
    });
    
    it('should get block with "latest" tag', async () => {
      // Test with optional block tag
    });
    
    it('should get block without optional parameters', async () => {
      // Test default behavior
    });
  });
});
```

#### Example: E2E Test Structure

```javascript
/**
 * @testCategory e2e
 * @blockchainRequired write
 * @description Tests for IERC20 contract deployment and interaction
 */
describe('IERC20 Contract', () => {
  const provider = new JsonRpcProvider('https://public.rpc.quantumcoinapi.com', 123123);
  const wallet = new Wallet(TEST_WALLET_PRIVATE_KEY, provider);
  
  describe('Contract Deployment', () => {
    it('should deploy IERC20 contract', async () => {
      // Deploy contract
    });
  });
  
  describe('Contract Interactions', () => {
    it('should transfer tokens', async () => {
      // Test transfer with all parameters
    });
    
    it('should transfer tokens with default gas settings', async () => {
      // Test with optional parameters omitted
    });
  });
});
```

#### Example: Security Test Structure

```javascript
/**
 * @testCategory security
 * @blockchainRequired false
 * @description Security tests for malformed input
 */
describe('Security: Malformed Input', () => {
  describe('Address Validation', () => {
    it('should reject addresses with invalid length', () => {
      // Security test
    });
    
    it('should reject addresses with SQL injection attempts', () => {
      // Security test
    });
  });
});
```

### 13.7 Test Execution

Tests should be organized to allow selective execution:
- Run only unit tests (fast, no network)
- Run only integration tests (read-only, requires network)
- Run only e2e tests (write access, requires network and test funds)
- Run only security tests
- Run all tests

### 13.8 Additional Requirements

- All tests must be deterministic and repeatable
- Tests should clean up after themselves (where applicable)
- Tests should not interfere with each other
- Use appropriate test timeouts for network operations
- Mock external dependencies where appropriate (for unit tests)
- Use real blockchain data for integration and e2e tests

### 13.9 Implementation Gate: Non-Transaction Tests Must Pass

After the rest of this specification is implemented (i.e., once the SDK APIs described in this document exist), the implementation MUST run **all tests that do not require sending transactions** and ensure they succeed.

- **Included**: all test suites marked `@blockchainRequired false` or `@blockchainRequired readonly`
- **Excluded**: any test suites marked `@blockchainRequired write` (i.e., tests that send transactions)

If any included test fails:
- **Diagnose** whether the failure is due to a **test bug** or a **SDK implementation bug**
- **Fix** the test (if the test is incorrect) or fix the SDK code (if the SDK is incorrect)
- **Re-run** the included test set and **repeat** until all included tests pass

---

## 14. Documentation Requirements

- **Code and Documentation Comments**: All code must include detailed comments and documentation. Code comments should explain the logic, purpose, and implementation details. Documentation comments (JSDoc) should be comprehensive and clear, enabling both readers of the code and users of the SDK to understand functionality, parameters, return values, and usage patterns. Doc-level comments must appear in the SDK code itself (as JSDoc comments), not just in separate documentation files, so that they are available to SDK users through IDE tooltips and documentation generation tools.
- JSDoc comments for all public methods
- Usage examples for each major class
- Migration guide from ethers.js
- API reference documentation
- Troubleshooting guide

---

## 15. Typed Contract Generator

### 15.1 Overview

A typed contract generator tool that creates fully-typed contract classes from ABI and bytecode. This generator produces TypeScript/JavaScript classes with proper types, methods, and deployment factories based on the provided contract ABI and binary code.

### 15.2 Generator Input

The generator accepts the following inputs:
- **Contract ABI**: JSON array containing the contract's Application Binary Interface
- **Contract Bytecode (bin)**: Hexadecimal string containing the compiled contract bytecode

### 15.3 Interactive Setup Process

#### 15.3.1 Package Creation Prompt

When invoked, the generator first asks:
```
Do you want to create a new package? (Y/N)
```

#### 15.3.2 New Package Creation (Y)

If the user selects **Yes**, the generator prompts for:

1. **Package Location**: 
   - Prompt: `Enter the folder path where the package should be created:`
   - User provides absolute or relative path

2. **Package Name**:
   - Prompt: `Enter package name:`
   - Must be valid npm package name

3. **Package Description**:
   - Prompt: `Enter package description:`
   - Brief description of the generated contract package

4. **Author**:
   - Prompt: `Enter author name:`
   - Author information for package.json

5. **License**:
   - Prompt: `Enter license (default: MIT):`
   - Default: `MIT` (if user presses Enter without input)
   - User can specify custom license

6. **Version**:
   - Prompt: `Enter version (default: 0.0.1):`
   - Default: `0.0.1` (if user presses Enter without input)
   - Must follow semantic versioning

**Dependencies**: The generator automatically adds all dependencies from `quantumcoin.js` package.json to the generated package's dependencies.

#### 15.3.3 Existing Package Integration (N)

If the user selects **No**, the generator prompts for:

1. **Target Location**:
   - Prompt: `Enter the location in your existing package (relative to package root):`
   - User provides path where contract files should be generated
   - Example: `src/contracts` or `contracts`

### 15.4 Generated Code Structure

#### 15.4.1 Contract Class

The generator creates a typed contract class with the following features:

**Class Name**: Based on contract name from ABI (if available) or derived from package name

**Constructor**:
```typescript
constructor(address: string, runner?: ContractRunner, _deployTx?: TransactionResponse)
```
- `address`: Contract address (32-byte QuantumCoin address)
- `runner`: Optional ContractRunner (Provider or Signer)
- `_deployTx`: Optional deployment transaction (for newly deployed contracts)

**Typed Methods**:
- **Read-only functions**: Return typed results using types from quantumcoin.js
- **State-changing functions**: Return `ContractTransactionResponse` from quantumcoin.js
- **View functions**: Return typed values based on ABI return types
- **Pure functions**: Return typed values based on ABI return types

**Method Signatures**:
- All method parameters are typed based on ABI input types
- All return types use quantumcoin.js types (e.g., `bigint`, `string`, `AddressLike`, etc.)
- Optional parameters are properly marked
- Overloads are generated for functions with optional parameters

**Event Handling**:
- Typed event filters and listeners
- Event types match quantumcoin.js `EventLog` structure
- Indexed and non-indexed parameters are properly typed

**Error Handling**:
- Custom error classes for contract-specific errors
- Error types match quantumcoin.js error patterns

#### 15.4.2 Contract Factory

The generator creates a `ContractFactory` class for deployment:

**Class Name**: `{ContractName}__factory`

**Static Methods**:
```typescript
static connect(address: string, runner?: ContractRunner): {ContractName}
```
- Creates a contract instance at the given address

**Instance Methods**:
```typescript
deploy(...constructorArgs: TypedArgs[]): Promise<{ContractName}>
```
- Deploys the contract with typed constructor arguments
- Returns a contract instance with the deployment transaction attached

**Properties**:
- `bytecode`: The contract bytecode
- `interface`: The contract ABI interface
- `abi`: The contract ABI array

#### 15.4.3 Type Definitions

The generator creates TypeScript type definitions for:
- Function parameters (input types)
- Function return values (output types)
- Event parameters
- Struct types (if present in ABI)
- Tuple types (if present in ABI)

All types use quantumcoin.js type system:
- `bigint` for uint/int types
- `string` for addresses (32-byte)
- `BytesLike` for bytes types
- Custom struct types for complex data structures

#### 15.4.4 Code Comments

All generated code includes comprehensive JSDoc comments:

**Class Comments**:
```typescript
/**
 * {ContractName} - A typed contract interface for {ContractName}
 * 
 * @description {Description from ABI or package description}
 * @example
 * ```typescript
 * const contract = new {ContractName}(address, provider);
 * const result = await contract.someMethod(...args);
 * ```
 */
```

**Method Comments**:
```typescript
/**
 * {methodName} - {Description from ABI}
 * 
 * @param {paramName} - {Type and description}
 * @returns {Return type description}
 * @throws {Error conditions}
 * 
 * @example
 * ```typescript
 * const result = await contract.{methodName}(...args);
 * ```
 */
```

**Transaction Methods**:
```typescript
/**
 * {methodName} - Sends a transaction to {methodName}
 * 
 * @param {paramName} - {Type and description}
 * @param overrides - Optional transaction overrides (gas, value, etc.)
 * @returns Promise<ContractTransactionResponse> - Transaction response object
 * 
 * @example
 * ```typescript
 * const tx = await contract.{methodName}(...args, {
 *   gasLimit: 100000n,
 *   value: parseEther("1.0")
 * });
 * await tx.wait();
 * ```
 */
```

### 15.5 Generated File Structure

#### 15.5.1 New Package Structure

```
{package-name}/
├── package.json              # Generated with dependencies
├── tsconfig.json             # TypeScript configuration
├── README.md                 # Generated README
├── src/
│   ├── {ContractName}.ts    # Main contract class
│   ├── {ContractName}__factory.ts  # Contract factory
│   ├── types.ts             # Type definitions
│   └── index.ts             # Main exports
└── examples/
    ├── deploy.ts            # Deployment example
    ├── read-operations.ts   # Read-only operations example
    ├── write-operations.ts  # Transaction examples
    └── events.ts            # Event listening examples
```

#### 15.5.2 Existing Package Structure

```
{existing-package}/
└── {target-location}/
    ├── {ContractName}.ts
    ├── {ContractName}__factory.ts
    ├── types.ts
    └── index.ts
```

### 15.6 Example Generation

#### 15.6.1 Example Files

The generator creates example files in the `examples/` folder:

**deploy.ts**:
```typescript
import { JsonRpcProvider, Wallet } from 'quantumcoin';
import { {ContractName}, {ContractName}__factory } from '../src';

async function deploy() {
  const provider = new JsonRpcProvider('https://public.rpc.quantumcoinapi.com', 123123);
  const wallet = new Wallet('0x...privateKey...', provider);
  
  const factory = new {ContractName}__factory(wallet);
  const contract = await factory.deploy(...constructorArgs);
  
  console.log('Contract deployed at:', contract.target);
  console.log('Deployment transaction:', contract.deploymentTransaction()?.hash);
  
  await contract.deploymentTransaction()?.wait();
  console.log('Contract deployed and confirmed!');
}

deploy().catch(console.error);
```

**read-operations.ts**:
```typescript
import { JsonRpcProvider } from 'quantumcoin';
import { {ContractName} } from '../src';

async function readOperations() {
  const provider = new JsonRpcProvider('https://public.rpc.quantumcoinapi.com', 123123);
  const contract = {ContractName}.connect('0x...contractAddress...', provider);
  
  // Example read operations based on ABI
  const result = await contract.someViewFunction(...args);
  console.log('Result:', result);
}

readOperations().catch(console.error);
```

**write-operations.ts**:
```typescript
import { JsonRpcProvider, Wallet, parseEther } from 'quantumcoin';
import { {ContractName} } from '../src';

async function writeOperations() {
  const provider = new JsonRpcProvider('https://public.rpc.quantumcoinapi.com', 123123);
  const wallet = new Wallet('0x...privateKey...', provider);
  const contract = {ContractName}.connect('0x...contractAddress...', wallet);
  
  // Example transaction operations based on ABI
  const tx = await contract.someStateChangingFunction(...args, {
    gasLimit: 100000n
  });
  console.log('Transaction hash:', tx.hash);
  
  const receipt = await tx.wait();
  console.log('Transaction confirmed in block:', receipt.blockNumber);
}

writeOperations().catch(console.error);
```

**events.ts**:
```typescript
import { JsonRpcProvider } from 'quantumcoin';
import { {ContractName} } from '../src';

async function listenToEvents() {
  const provider = new JsonRpcProvider('https://public.rpc.quantumcoinapi.com', 123123);
  const contract = {ContractName}.connect('0x...contractAddress...', provider);
  
  // Example event listening based on ABI
  contract.on('SomeEvent', (event) => {
    console.log('Event received:', event);
  });
  
  // Filter events
  const filter = contract.filters.SomeEvent(...args);
  const events = await contract.queryFilter(filter, fromBlock, toBlock);
  console.log('Filtered events:', events);
}

listenToEvents().catch(console.error);
```

### 15.7 Transaction Return Types

Methods that send transactions must return the appropriate transaction object from quantumcoin.js:

- **Return Type**: `Promise<ContractTransactionResponse>`
- **Properties**: All properties from `ContractTransactionResponse`:
  - `hash`: Transaction hash
  - `to`: Recipient address
  - `from`: Sender address
  - `value`: Transaction value
  - `data`: Transaction data
  - `gasLimit`: Gas limit
  - `gasPrice`: Gas price
  - `nonce`: Transaction nonce
  - `chainId`: Chain ID
  - `wait()`: Method to wait for confirmation
  - `getTransaction()`: Get full transaction details
  - `getReceipt()`: Get transaction receipt

### 15.8 Type Mapping

The generator maps Solidity types to quantumcoin.js types:

| Solidity Type | quantumcoin.js Type |
|--------------|---------------------|
| `address` | `string` (32-byte address) |
| `uint8` to `uint256` | `bigint` |
| `int8` to `int256` | `bigint` |
| `bool` | `boolean` |
| `bytes1` to `bytes32` | `BytesLike` |
| `bytes` | `BytesLike` |
| `string` | `string` |
| `tuple` | Custom type or object |
| Arrays | `Array<Type>` |
| Mappings | Not directly accessible (use getter functions) |

### 15.9 Generator Implementation Requirements

1. **ABI Parsing**: Parse ABI JSON to extract functions, events, errors, and constructor
2. **Type Inference**: Infer TypeScript types from ABI parameter types
3. **Method Generation**: Generate typed methods for all functions in ABI
4. **Event Generation**: Generate typed event filters and listeners
5. **Error Generation**: Generate custom error classes for contract errors
6. **Factory Generation**: Generate ContractFactory with deployment support
7. **Example Generation**: Generate comprehensive examples for all operations
8. **Documentation**: Generate JSDoc comments for all generated code
9. **Package Setup**: Create package.json with proper dependencies
10. **Type Safety**: Ensure all generated code is fully typed

### 15.10 Usage

The generator should be invoked as a command-line tool or script:

```bash
# As a CLI tool
npx quantumcoin-sdk-generator --abi path/to/abi.json --bin path/to/bytecode.bin

# Or as a Node.js script
node generate-sdk.js --abi path/to/abi.json --bin path/to/bytecode.bin
```

The generator should support:
- Interactive mode (prompts for all inputs)
- Non-interactive mode (all inputs via command-line arguments)
- Configuration file input (JSON/YAML config file)

---

## Notes

1. This specification is based on ethers.js v6 patterns but adapted for QuantumCoin
2. All address-related operations must account for 32-byte addresses
3. HDWallet functionality is explicitly excluded
4. All cryptographic operations must use quantum-coin-js-sdk
5. The implementation should be as compatible as possible with ethers.js v6 for ease of migration
