/**
 * keccak256 hash of BytesLike.
 * @param {string|Uint8Array} data
 * @returns {string}
 */
export function keccak256(data: string | Uint8Array): string;
/**
 * sha256 hash of BytesLike.
 * @param {string|Uint8Array} data
 * @returns {string}
 */
export function sha256(data: string | Uint8Array): string;
/**
 * sha512 hash of BytesLike.
 * @param {string|Uint8Array} data
 * @returns {string}
 */
export function sha512(data: string | Uint8Array): string;
/**
 * ripemd160 hash of BytesLike.
 * @param {string|Uint8Array} data
 * @returns {string}
 */
export function ripemd160(data: string | Uint8Array): string;
/**
 * ethers-style id(text) => keccak256(utf8Bytes(text))
 * @param {string} text
 * @returns {string}
 */
export function id(text: string): string;
/**
 * Generate cryptographically strong random bytes.
 * @param {number} length
 * @returns {Uint8Array}
 */
export function randomBytes(length: number): Uint8Array;
/**
 * Compute HMAC over data.
 * @param {string} algorithm
 * @param {string|Uint8Array} key
 * @param {string|Uint8Array} data
 * @returns {string}
 */
export function computeHmac(algorithm: string, key: string | Uint8Array, data: string | Uint8Array): string;
/**
 * PBKDF2 (sync) helper returning hex string.
 * @param {string|Uint8Array} password
 * @param {string|Uint8Array} salt
 * @param {number} iterations
 * @param {number} keylen
 * @param {string=} algorithm
 * @returns {string}
 */
export function pbkdf2(password: string | Uint8Array, salt: string | Uint8Array, iterations: number, keylen: number, algorithm?: string | undefined): string;
/**
 * scrypt (async) helper returning hex string.
 * @param {string|Uint8Array} password
 * @param {string|Uint8Array} salt
 * @param {number} N
 * @param {number} r
 * @param {number} p
 * @param {number} dkLen
 * @returns {Promise<string>}
 */
export function scrypt(password: string | Uint8Array, salt: string | Uint8Array, N: number, r: number, p: number, dkLen: number): Promise<string>;
/**
 * scrypt (sync) helper returning hex string.
 * @param {string|Uint8Array} password
 * @param {string|Uint8Array} salt
 * @param {number} N
 * @param {number} r
 * @param {number} p
 * @param {number} dkLen
 * @returns {string}
 */
export function scryptSync(password: string | Uint8Array, salt: string | Uint8Array, N: number, r: number, p: number, dkLen: number): string;
