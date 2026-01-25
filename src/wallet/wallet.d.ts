/**
 * SigningKey wrapper (PQC private/public key bytes).
 */
export class SigningKey {
    /**
     * @param {Uint8Array} privateKeyBytes
     * @param {Uint8Array} publicKeyBytes
     */
    constructor(privateKeyBytes: Uint8Array, publicKeyBytes: Uint8Array);
    privateKeyBytes: Uint8Array<ArrayBuffer>;
    publicKeyBytes: Uint8Array<ArrayBuffer>;
}
/**
 * AbstractSigner base (minimal).
 */
export class AbstractSigner {
    /**
     * @param {import("../providers/provider").AbstractProvider|null} provider
     */
    constructor(provider: import("../providers/provider").AbstractProvider | null);
    provider: import("../providers/provider").AbstractProvider;
    getAddress(): Promise<void>;
}
/**
 * BaseWallet - core signing implementation.
 */
export class BaseWallet extends AbstractSigner {
    /**
     * @param {SigningKey} signingKey
     * @param {import("../providers/provider").AbstractProvider|null=} provider
     * @param {{ address: string }=} precomputed
     * @param {any=} qcWallet Internal quantum-coin-js-sdk Wallet (optional)
     */
    constructor(signingKey: SigningKey, provider?: (import("../providers/provider").AbstractProvider | null) | undefined, precomputed?: {
        address: string;
    } | undefined, qcWallet?: any | undefined);
    signingKey: SigningKey;
    _qcWallet: any;
    /** @type {string} */
    address: string;
    getAddress(): Promise<string>;
    /**
     * Sign a message synchronously.
     * Signature format: combined publicKey+signature as a hex string.
     * @param {string|Uint8Array} message
     * @returns {string}
     */
    signMessageSync(message: string | Uint8Array): string;
    /**
     * Sign a transaction using quantum-coin-js-sdk signRawTransaction().
     * @param {import("../providers/provider").TransactionRequest} tx
     * @returns {Promise<string>}
     */
    signTransaction(tx: import("../providers/provider").TransactionRequest): Promise<string>;
    /**
     * Signs and sends a transaction.
     * @param {import("../providers/provider").TransactionRequest} tx
     * @returns {Promise<import("../providers/provider").TransactionResponse>}
     */
    sendTransaction(tx: import("../providers/provider").TransactionRequest): Promise<import("../providers/provider").TransactionResponse>;
}
/**
 * Wallet - convenience methods around BaseWallet.
 */
export class Wallet extends BaseWallet {
    /**
     * Creates a new random wallet.
     * @param {import("../providers/provider").AbstractProvider=} provider
     * @returns {Wallet}
     */
    static createRandom(provider?: import("../providers/provider").AbstractProvider | undefined): Wallet;
    /**
     * Creates a wallet from an encrypted JSON string.
     * @param {string} json
     * @param {string} password
     * @param {import("../providers/provider").AbstractProvider=} provider
     * @returns {Wallet}
     */
    static fromEncryptedJsonSync(json: string, password: string, provider?: import("../providers/provider").AbstractProvider | undefined): Wallet;
    /**
     * Creates a wallet from a seed phrase (48 words).
     * @param {string|string[]} phrase
     * @param {import("../providers/provider").AbstractProvider=} provider
     * @returns {Wallet}
     */
    static fromPhrase(phrase: string | string[], provider?: import("../providers/provider").AbstractProvider | undefined): Wallet;
    /**
     * Internal helper: build a Wallet from a quantum-coin-js-sdk Wallet object.
     * @param {any} qcWallet
     * @param {import("../providers/provider").AbstractProvider|null} provider
     * @returns {Wallet}
     */
    static _fromQcWallet(qcWallet: any, provider: import("../providers/provider").AbstractProvider | null): Wallet;
    /**
     * @param {string|Uint8Array|SigningKey} key
     * @param {import("../providers/provider").AbstractProvider=} provider
     */
    constructor(key: string | Uint8Array | SigningKey, provider?: import("../providers/provider").AbstractProvider | undefined);
    /**
     * Returns wallet address (sync).
     * @returns {string}
     */
    getAddress(): string;
    /**
     * Returns wallet balance.
     * @param {string=} blockTag
     * @returns {Promise<bigint>}
     */
    getBalance(blockTag?: string | undefined): Promise<bigint>;
    /**
     * Returns wallet nonce.
     * @param {string=} blockTag
     * @returns {Promise<number>}
     */
    getTransactionCount(blockTag?: string | undefined): Promise<number>;
    /**
     * Encrypts and serializes this wallet to JSON.
     * @param {string|Uint8Array} password
     * @returns {string}
     */
    encryptSync(password: string | Uint8Array): string;
    /**
     * Returns a new wallet connected to a provider.
     * @param {import("../providers/provider").AbstractProvider} provider
     * @returns {Wallet}
     */
    connect(provider: import("../providers/provider").AbstractProvider): Wallet;
}
/**
 * NonceManager wrapper.
 */
export class NonceManager extends AbstractSigner {
    /**
     * @param {AbstractSigner} signer
     */
    constructor(signer: AbstractSigner);
    signer: AbstractSigner;
    _nonce: any;
    getTransactionCount(blockTag: any): any;
    sendTransaction(tx: any): Promise<any>;
    reset(): void;
    increment(): void;
}
/**
 * JsonRpcSigner placeholder (ethers-like).
 * This SDK encourages using Wallet directly for signing.
 */
export class JsonRpcSigner extends AbstractSigner {
    constructor(provider: any, address: any);
    _address: any;
    getAddress(): Promise<any>;
}
/**
 * VoidSigner (cannot sign, only provides address).
 */
export class VoidSigner extends AbstractSigner {
    constructor(address: any, provider: any);
    _address: string;
    getAddress(): Promise<string>;
}
