export type BytesLike = import("../types").BytesLike;
export type AddressLike = import("../types").AddressLike;
export type BigNumberish = import("../types").BigNumberish;
export type TransactionRequest = {
    to?: AddressLike | undefined;
    from?: AddressLike | undefined;
    value?: BigNumberish | undefined;
    data?: BytesLike | undefined;
    gasLimit?: BigNumberish | undefined;
    gasPrice?: BigNumberish | undefined;
    nonce?: number | undefined;
    chainId?: number | undefined;
    /**
     * Optional remark field (hex, max 32 bytes)
     */
    remarks?: string | undefined;
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
export class Provider {
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
    getBalance(address: AddressLike): Promise<bigint>;
    /**
     * @param {string} address
     * @param {string=} blockTag
     * @returns {Promise<number>}
     */
    getTransactionCount(address: AddressLike, blockTag?: string | undefined): Promise<number>;
    /**
     * Broadcasts a signed transaction.
     * @param {TransactionRequest|string} tx
     * @returns {Promise<TransactionResponse>}
     */
    sendTransaction(tx: TransactionRequest | string): Promise<TransactionResponse>;
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
     * @param {string} address
     * @param {string=} blockTag
     * @returns {Promise<string>}
     */
    getCode(address: AddressLike, blockTag?: string | undefined): Promise<string>;
    /**
     * @param {string} address
     * @param {bigint} position
     * @param {string=} blockTag
     * @returns {Promise<string>}
     */
    getStorageAt(address: AddressLike, position: bigint, blockTag?: string | undefined): Promise<string>;
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
    provider: AbstractProvider;
    hash: any;
    parentHash: any;
    number: number;
    timestamp: number;
    transactions: any;
    getTransaction(indexOrHash: any): Promise<TransactionResponse>;
    getTransactionReceipt(indexOrHash: any): Promise<TransactionReceipt>;
    getPrefetchedTransactions(): any[];
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
    provider: AbstractProvider;
    hash: any;
    to: any;
    from: any;
    nonce: number;
    data: any;
    value: any;
    gasLimit: any;
    gasPrice: any;
    chainId: number;
    blockNumber: number;
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
    provider: AbstractProvider;
    to: any;
    from: any;
    contractAddress: any;
    transactionHash: any;
    blockHash: any;
    blockNumber: number;
    transactionIndex: number;
    gasUsed: any;
    status: number;
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
    provider: AbstractProvider;
    address: any;
    topics: any;
    data: any;
    blockHash: any;
    blockNumber: number;
    transactionHash: any;
    transactionIndex: number;
    logIndex: number;
    removed: boolean;
    getBlock(): Promise<Block>;
    getTransaction(): Promise<TransactionResponse>;
    getTransactionReceipt(): Promise<TransactionReceipt>;
}
