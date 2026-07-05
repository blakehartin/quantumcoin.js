export type BytesLike = import("../utils/encoding").BytesLike;
export type TransactionRequest = {
    to?: string | undefined;
    from?: string | undefined;
    value?: (bigint | string | number) | undefined;
    data?: string | undefined;
    gasLimit?: (bigint | string | number) | undefined;
    nonce?: number | undefined;
    chainId?: number | undefined;
    /**
     * Optional remark field (hex, max 32 bytes)
     */
    remarks?: string | undefined;
    /**
     * Optional signing context (0, 1, 2, or null). Passed to SDK TransactionSigningRequest; default null.
     */
    signingContext?: (number | null) | undefined;
};
export type Filter = {
    address?: (string | string[]) | undefined;
    topics?: (string | string[] | null)[] | undefined;
    fromBlock?: (number | string) | undefined;
    toBlock?: (number | string) | undefined;
    blockHash?: string | undefined;
};
/**
 * Base Provider class.
 */
export class Provider extends EventEmitter {
}
/**
 * AbstractProvider base class (ethers-like).
 */
export class AbstractProvider extends Provider {
    /**
     * Implemented by subclasses to perform JSON-RPC.
     * @param {string} method
     * @param {any[]=} params
     * @returns {Promise<any>}
     */
    _perform(method: string, params?: any[] | undefined): Promise<any>;
    getBlockNumber(): Promise<number>;
    /**
     * @param {number|"latest"} blockNumber
     * @returns {Promise<Block>}
     */
    getBlock(blockNumber: number | "latest"): Promise<Block>;
    /**
     * @param {string} txHash
     * @returns {Promise<TransactionResponse>}
     */
    getTransaction(txHash: string): Promise<TransactionResponse>;
    /**
     * @param {string} txHash
     * @returns {Promise<TransactionReceipt>}
     */
    getTransactionReceipt(txHash: string): Promise<TransactionReceipt>;
    /**
     * @param {string} address
     * @returns {Promise<bigint>}
     */
    getBalance(address: string): Promise<bigint>;
    /**
     * @param {string} address
     * @param {string=} blockTag
     * @returns {Promise<number>}
     */
    getTransactionCount(address: string, blockTag?: string | undefined): Promise<number>;
    /**
     * Broadcasts a signed transaction.
     * @param {TransactionRequest|string} tx
     * @param {{ expectedHash?: string }=} opts Optional. When `expectedHash` is set,
     *   the hash returned by the node (and the fetched-back transaction's hash) must
     *   match it, otherwise an error is thrown (do not trust the RPC node to
     *   broadcast the exact transaction that was signed).
     * @returns {Promise<TransactionResponse>}
     */
    sendTransaction(tx: TransactionRequest | string, opts?: {
        expectedHash?: string;
    } | undefined): Promise<TransactionResponse>;
    /**
     * Broadcast a signed raw transaction.
     * Alias of sendTransaction(rawTx) for clarity when doing offline signing flows.
     *
     * @param {string} rawTx
     * @returns {Promise<TransactionResponse>}
     */
    sendRawTransaction(rawTx: string): Promise<TransactionResponse>;
    /**
     * Perform a call (read-only) and return hex data.
     * @param {TransactionRequest} tx
     * @param {string=} blockTag
     * @returns {Promise<string>}
     */
    call(tx: TransactionRequest, blockTag?: string | undefined): Promise<string>;
    /**
     * Estimate gas for a call/transaction.
     * @param {TransactionRequest} tx
     * @returns {Promise<bigint>}
     */
    estimateGas(tx: TransactionRequest): Promise<bigint>;
    /**
     * Returns fee data (currently the gas price per unit of gas, in wei).
     * Supports only DynamicFeeTx (dynamic-fee transactions); other fee tx types are not supported.
     * @param {import("../wallet/wallet").Wallet|number} walletOrKeyType A Wallet, or a key type number (3 or 5).
     * @param {boolean|null=} fullSign  Full signing (keyType 3 only; ignored for keyType 5).
     * @returns {Promise<FeeData>}
     */
    getFeeData(walletOrKeyType: import("../wallet/wallet").Wallet | number, fullSign?: (boolean | null) | undefined): Promise<FeeData>;
    /**
     * @param {string} address
     * @param {string=} blockTag
     * @returns {Promise<string>}
     */
    getCode(address: string, blockTag?: string | undefined): Promise<string>;
    /**
     * @param {string} address
     * @param {bigint} position
     * @param {string=} blockTag
     * @returns {Promise<string>}
     */
    getStorageAt(address: string, position: bigint, blockTag?: string | undefined): Promise<string>;
    /**
     * @param {Filter} filter
     * @returns {Promise<Log[]>}
     */
    getLogs(filter: Filter): Promise<Log[]>;
}
/**
 * Minimal Block wrapper (ethers-like).
 */
export class Block {
    /**
     * @param {any} block
     * @param {AbstractProvider=} provider
     */
    constructor(block: any, provider?: AbstractProvider | undefined);
    provider: AbstractProvider | null;
    hash: any;
    parentHash: any;
    number: number | null;
    timestamp: number | null;
    transactions: any;
    getTransaction(indexOrHash: any): Promise<TransactionResponse | null>;
    getTransactionReceipt(indexOrHash: any): Promise<TransactionReceipt | null>;
    getPrefetchedTransactions(): never[];
}
/**
 * Minimal TransactionResponse wrapper (ethers-like).
 */
export class TransactionResponse {
    /**
     * @param {any} tx
     * @param {AbstractProvider=} provider
     */
    constructor(tx: any, provider?: AbstractProvider | undefined);
    provider: AbstractProvider | null;
    hash: any;
    to: any;
    from: any;
    nonce: number | null;
    data: any;
    value: any;
    gasLimit: any;
    chainId: number | null;
    blockNumber: number | null;
    txType: number | null;
    remarks: string | null;
    /**
     * Wait for confirmations.
     * @param {number=} confirmations
     * @param {number=} timeoutMs
     * @returns {Promise<TransactionReceipt>}
     */
    wait(confirmations?: number | undefined, timeoutMs?: number | undefined): Promise<TransactionReceipt>;
}
/**
 * Minimal TransactionReceipt wrapper (ethers-like).
 */
export class TransactionReceipt {
    /**
     * @param {any} receipt
     * @param {AbstractProvider=} provider
     */
    constructor(receipt: any, provider?: AbstractProvider | undefined);
    provider: AbstractProvider | null;
    to: any;
    from: any;
    contractAddress: any;
    transactionHash: any;
    blockHash: any;
    blockNumber: number | null;
    transactionIndex: number | null;
    gasUsed: any;
    status: number | null;
    logs: any;
}
/**
 * Minimal Log wrapper (ethers-like).
 */
export class Log {
    /**
     * @param {any} log
     * @param {AbstractProvider=} provider
     */
    constructor(log: any, provider?: AbstractProvider | undefined);
    provider: AbstractProvider | null;
    address: any;
    topics: any;
    data: any;
    blockHash: any;
    blockNumber: number | null;
    transactionHash: any;
    transactionIndex: number | null;
    logIndex: number | null;
    removed: boolean;
    getBlock(): Promise<Block | null>;
    getTransaction(): Promise<TransactionResponse | null>;
    getTransactionReceipt(): Promise<TransactionReceipt | null>;
}
/**
 * Fee data for a transaction. Currently only `gasPrice` (per unit of gas, in wei)
 * is populated. `maxFeePerGas` / `maxPriorityFeePerGas` are not supported yet:
 * QuantumCoin uses a fixed per-scheme fee model with no EIP-1559 base fee / priority tip.
 */
export class FeeData {
    /**
     * @param {bigint} gasPrice
     */
    constructor(gasPrice: bigint);
    gasPrice: bigint;
}
import EventEmitter = require("../internal/event-emitter");
