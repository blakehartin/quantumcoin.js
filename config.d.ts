/**
 * Configuration class for QuantumCoin SDK
 * @class
 */
export class Config {
    /**
     * Creates a Config instance
     * @param {number} chainId - The chain ID (default: 123123 for mainnet)
     * @param {string} rpcEndpoint - The RPC endpoint URL (default: https://public.rpc.quantumcoinapi.com)
     */
    constructor(chainId?: number, rpcEndpoint?: string);
    chainId: number;
    rpcEndpoint: string;
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
export function Initialize(config: Config | null): Promise<boolean>;
/**
 * Checks if the SDK has been initialized
 * @return {boolean} True if initialized, false otherwise
 */
export function isInitialized(): boolean;
/**
 * Returns the currently active SDK config (or null if not initialized).
 * @return {Config|null}
 */
export function getConfig(): Config | null;
