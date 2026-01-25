/**
 * Checks if string is a valid address (32 bytes, 66 hex characters).
 * @param {string} address
 * @returns {boolean}
 */
export function isAddress(address: string): boolean;
/**
 * Returns normalized address.
 * Note: QuantumCoin checksumming uses QuantumCoin conventions; currently this normalizes to lowercase.
 * @param {string} address
 * @returns {string}
 */
export function getAddress(address: string): string;
/**
 * Returns true if value is an object implementing Addressable (has getAddress()).
 * @param {any} value
 * @returns {boolean}
 */
export function isAddressable(value: any): boolean;
/**
 * Resolve an AddressLike into a string address.
 * For QuantumCoin, ENS is not supported.
 * @param {any} target
 * @returns {string|Promise<string>}
 */
export function resolveAddress(target: any): string | Promise<string>;
/**
 * Calculates contract address from deployer and nonce.
 * @param {{ from: string, nonce: number }} tx
 * @returns {string}
 */
export function getContractAddress(tx: {
    from: string;
    nonce: number;
}): string;
/**
 * Alias for getContractAddress.
 * @param {{ from: string, nonce: number }} tx
 * @returns {string}
 */
export function getCreateAddress(tx: {
    from: string;
    nonce: number;
}): string;
/**
 * Calculates CREATE2 contract address.
 * @param {string} from
 * @param {string} salt
 * @param {string} initCodeHash
 * @returns {string}
 */
export function getCreate2Address(from: string, salt: string, initCodeHash: string): string;
/**
 * Computes address from a public key.
 * @param {string|Uint8Array} key
 * @returns {string}
 */
export function computeAddress(key: string | Uint8Array): string;
/**
 * Verifies a message signature and recovers the address.
 * @param {string|Uint8Array} message
 * @param {string} signature Hex string signature
 * @returns {string}
 */
export function verifyMessage(message: string | Uint8Array, signature: string): string;
/**
 * Recovers the address from a message signature.
 * @param {string|Uint8Array} message
 * @param {string} signature Hex string signature
 * @returns {string}
 */
export function recoverAddress(message: string | Uint8Array, signature: string): string;
