/**
 * BaseContract placeholder (ethers-like).
 */
export class BaseContract {
}
export class Contract extends BaseContract {
    static from(target: any, abi: any, runner: any): Contract;
    /**
     * @param {string} address
     * @param {any[]|Interface} abi
     * @param {any=} providerOrSigner
     * @param {string=} bytecode
     */
    constructor(address: string, abi: any[] | Interface, providerOrSigner?: any | undefined, bytecode?: string | undefined);
    address: string;
    target: string;
    bytecode: string;
    interface: Interface;
    provider: any;
    signer: any;
    runner: any;
    _listeners: any;
    getAddress(): string;
    /**
     * Invoke a contract function, dispatching to call() or send().
     * @param {string} methodName
     * @param {any[]} args
     * @returns {Promise<any>}
     */
    _invoke(methodName: string, args: any[]): Promise<any>;
    /**
     * Perform a read-only call.
     * @param {string} methodName
     * @param {any[]} args
     * @param {import("../providers/provider").TransactionRequest=} overrides
     * @returns {Promise<any>}
     */
    call(methodName: string, args: any[], overrides?: import("../providers/provider").TransactionRequest | undefined): Promise<any>;
    /**
     * Send a state-changing transaction.
     * @param {string} methodName
     * @param {any[]} args
     * @param {import("../providers/provider").TransactionRequest=} overrides
     * @returns {Promise<ContractTransactionResponse>}
     */
    send(methodName: string, args: any[], overrides?: import("../providers/provider").TransactionRequest | undefined): Promise<ContractTransactionResponse>;
    /**
     * Query logs for an event.
     * @param {any} event
     * @param {number|string=} fromBlock
     * @param {number|string=} toBlock
     * @returns {Promise<EventLog[]>}
     */
    queryFilter(event: any, fromBlock?: (number | string) | undefined, toBlock?: (number | string) | undefined): Promise<EventLog[]>;
    on(event: any, callback: any): this;
    once(event: any, callback: any): this;
    removeListener(event: any, callback: any): this;
    removeAllListeners(event: any): this;
    connect(signerOrProvider: any): Contract;
    attach(address: any): Contract;
    deployTransaction(): any;
    getTransactionReceipt(hash: any): Promise<ContractTransactionReceipt>;
    waitForDeployment(): Promise<this>;
    getDeployedCode(): Promise<any>;
}
/**
 * ContractTransactionResponse (aliasing provider TransactionResponse).
 */
export class ContractTransactionResponse {
    /**
     * @param {any} tx
     */
    constructor(tx: any);
    _tx: any;
    /**
     * Wait for confirmations (delegated to underlying TransactionResponse).
     * @param {number=} confirmations
     * @param {number=} timeoutMs
     * @returns {Promise<any>}
     */
    wait(confirmations?: number | undefined, timeoutMs?: number | undefined): Promise<any>;
    /**
     * Return the underlying transaction response object.
     * @returns {any}
     */
    getTransaction(): any;
}
/**
 * ContractTransactionReceipt (aliasing provider TransactionReceipt).
 */
export class ContractTransactionReceipt {
    /**
     * @param {any} receipt
     */
    constructor(receipt: any);
    getEvent(eventName: any): any;
    getEvents(eventName: any): any;
}
/**
 * EventLog placeholder.
 */
export class EventLog {
    constructor(log: any);
}
import { Interface } from "../abi/interface";
