export class WebSocketProvider extends AbstractProvider {
    /**
     * Create a WebSocket JSON-RPC provider.
     *
     * This uses the built-in global `WebSocket` available in recent Node.js
     * versions (via undici). No additional npm dependencies are required.
     *
     * @param {string} url WebSocket endpoint (e.g. ws://127.0.0.1:8546)
     * @param {number=} chainId Optional chain id (compat)
     */
    constructor(url: string, chainId?: number | undefined);
    url: string;
    chainId: number;
    /** @type {any|null} */
    _ws: any | null;
    /** @type {Promise<void>|null} */
    _wsReady: Promise<void> | null;
    /** @type {Map<number, { resolve: Function, reject: Function, timer: any }>} */
    _pending: Map<number, {
        resolve: Function;
        reject: Function;
        timer: any;
    }>;
    /**
     * Close the underlying WebSocket connection and reject any pending requests.
     * This is important for tests so the Node.js event loop can exit cleanly.
     */
    destroy(): void;
    _rejectAllPending(err: any): void;
    _connect(): Promise<void>;
}
export class IpcSocketProvider extends AbstractProvider {
    /**
     * Create an IPC provider.
     *
     * On Windows, use a named pipe path like: `\\\\.\\pipe\\geth.ipc`
     * On Unix, use a domain socket path like: `/path/to/geth.ipc`
     *
     * @param {string} path IPC socket path
     */
    constructor(path: string);
    path: string;
}
export class BrowserProvider extends AbstractProvider {
    /**
     * Create a BrowserProvider from an EIP-1193 provider (e.g. MetaMask).
     *
     * This is a lightweight implementation that focuses on the core behaviors:
     * - `send(method, params)` dispatches EIP-1193 requests
     * - `getSigner()` resolves the connected account
     * - emits ethers-like `debug` events for request/response tracking
     *
     * @param {{ request: Function }} eip1193Provider
     * @param {any=} network Unused (compat)
     * @param {{ providerInfo?: any }=} options
     */
    constructor(eip1193Provider: {
        request: Function;
    }, network?: any | undefined, options?: {
        providerInfo?: any;
    } | undefined);
    provider: {
        request: Function;
    };
    providerInfo: any;
    /**
     * Send an EIP-1193 JSON-RPC request.
     * @param {string} method
     * @param {any[]|Record<string, any>=} params
     * @returns {Promise<any>}
     */
    send(method: string, params?: (any[] | Record<string, any>) | undefined): Promise<any>;
    /**
     * Map an EIP-1193 error into a normalized Error.
     * @param {{ method: string, params?: any }} payload
     * @param {any} error
     * @returns {Error}
     */
    getRpcError(payload: {
        method: string;
        params?: any;
    }, error: any): Error;
    /**
     * Ethers compatibility: internal send for single or batched payloads.
     * @param {any|any[]} payload
     * @returns {Promise<any>}
     */
    _send(payload: any | any[]): Promise<any>;
    /**
     * Returns a signer for the specified account index or address.
     * @param {number|string=} address
     * @returns {Promise<JsonRpcSigner>}
     */
    getSigner(address?: (number | string) | undefined): Promise<JsonRpcSigner>;
    /**
     * Resolve whether this provider manages the address/index.
     * @param {number|string} address
     * @returns {Promise<boolean>}
     */
    hasSigner(address: number | string): Promise<boolean>;
}
/**
 * FallbackProvider - uses the first provider in the list.
 */
export class FallbackProvider extends AbstractProvider {
    /**
     * @param {AbstractProvider[]|AbstractProvider} providers
     */
    constructor(providers: AbstractProvider[] | AbstractProvider);
    providers: AbstractProvider[];
    _perform(method: any, params: any): Promise<any>;
}
/**
 * FilterByBlockHash placeholder.
 */
export class FilterByBlockHash {
    constructor(blockHash: any, address: any, topics: any);
    blockHash: string;
    address: any;
    topics: any;
    toJSON(): {
        blockHash: string;
        address: any;
        topics: any;
    };
}
import { AbstractProvider } from "./provider";
import { JsonRpcSigner } from "../wallet/wallet";
