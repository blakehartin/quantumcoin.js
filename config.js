/**
 * Configuration class for QuantumCoin SDK
 * 
 * This module provides the Config class and Initialize function
 * for setting up the QuantumCoin SDK.
 * 
 * @module config
 */

const qcsdk = require('quantum-coin-js-sdk');

let _isInitialized = false;
let _initializationPromise = null;
let _config = null;

// Default configuration values
const DEFAULT_CHAIN_ID = 123123;
const DEFAULT_RPC_ENDPOINT = "https://public.rpc.quantumcoinapi.com";
const DEFAULT_READ_URL = "https://sdk.readrelay.quantumcoinapi.com";
const DEFAULT_WRITE_URL = "https://sdk.writerelay.quantumcoinapi.com";

/**
 * Configuration class for QuantumCoin SDK
 * @class
 */
class Config {
    /**
     * Creates a Config instance
     * @param {number} chainId - The chain ID (default: 123123 for mainnet)
     * @param {string} rpcEndpoint - The RPC endpoint URL (default: https://public.rpc.quantumcoinapi.com)
     */
    constructor(chainId = DEFAULT_CHAIN_ID, rpcEndpoint = DEFAULT_RPC_ENDPOINT) {
        this.chainId = chainId;
        this.rpcEndpoint = rpcEndpoint;
    }
}

/**
 * Initializes the QuantumCoin SDK with the provided configuration.
 * 
 * WARNING: This function MUST be called before using any SDK functionality.
 * If Initialize() is not called, the SDK behavior can be unpredictable and
 * may result in errors or incorrect validation results.
 * 
 * If config is null or undefined, the SDK will be initialized with default values:
 * - chainId: 123123 (mainnet)
 * - rpcEndpoint: https://public.rpc.quantumcoinapi.com
 * 
 * @param {Config|null} config - The configuration object containing chainId and rpcEndpoint.
 *                                If null or undefined, default values will be used.
 * @return {Promise<boolean>} Promise that resolves to true if initialization succeeded, false otherwise
 * @example
 * // Initialize with custom config
 * const { Config, Initialize } = require('quantumcoin/config');
 * const config = new Config(123123, 'https://rpc.example.com');
 * await Initialize(config);
 * 
 * @example
 * // Initialize with default config (chainId: 123123, rpcEndpoint: https://public.rpc.quantumcoinapi.com)
 * const { Initialize } = require('quantumcoin/config');
 * await Initialize(null);
 */
function Initialize(config) {
    // If config is null or undefined, use default values
    if (config === null || config === undefined) {
        config = new Config(DEFAULT_CHAIN_ID, DEFAULT_RPC_ENDPOINT);
    } else if (!(config instanceof Config)) {
        throw new Error('Initialize() requires a Config instance as parameter, or null/undefined for default config');
    }
    
    if (_initializationPromise === null) {
        _config = config;

        // Initialize quantum-coin-js-sdk (WASM + crypto helpers).
        // Note: quantum-coin-js-sdk expects relay URLs for some network operations.
        // We provide community defaults here; the ethers-compatible Provider uses `config.rpcEndpoint`.
        const clientConfigVal = new qcsdk.Config(DEFAULT_READ_URL, DEFAULT_WRITE_URL, config.chainId, "", "");

        _initializationPromise = qcsdk.initialize(clientConfigVal).then((initResult) => {
            if (initResult === true) {
                _isInitialized = true;
            }
            return initResult === true;
        }).catch((error) => {
            console.error('SDK initialization failed:', error);
            return false;
        });
    }
    
    return _initializationPromise;
}

/**
 * Checks if the SDK has been initialized
 * @return {boolean} True if initialized, false otherwise
 */
function isInitialized() {
    return _isInitialized;
}

/**
 * Returns the currently active SDK config (or null if not initialized).
 * @return {Config|null}
 */
function getConfig() {
    return _config;
}

// Export Config class and Initialize function
module.exports = {
    Config,
    Initialize,
    isInitialized,
    getConfig
};
