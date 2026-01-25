/**
 * Return true if `value` is a Uint8Array.
 * @param {any} value
 * @returns {value is Uint8Array}
 */
export function isUint8Array(value: any): value is Uint8Array;
/**
 * Normalize a hex string.
 * @param {string} hex
 * @returns {string}
 */
export function normalizeHex(hex: string): string;
/**
 * Returns true if value is a hex string.
 * @param {any} value
 * @param {number=} lengthBytes Optional exact byte length.
 * @returns {boolean}
 */
export function isHexString(value: any, lengthBytes?: number | undefined): boolean;
/**
 * Strip 0x prefix.
 * @param {string} hex
 * @returns {string}
 */
export function strip0x(hex: string): string;
/**
 * Ensure a 0x prefix.
 * @param {string} hex
 * @returns {string}
 */
export function add0x(hex: string): string;
/**
 * Convert a hex string to bytes.
 * @param {string} hex
 * @returns {Uint8Array}
 */
export function hexToBytes(hex: string): Uint8Array;
/**
 * Convert bytes to hex string.
 * @param {Uint8Array} bytes
 * @returns {string}
 */
export function bytesToHex(bytes: Uint8Array): string;
/**
 * UTF-8 encode a string to bytes.
 * @param {string} str
 * @returns {Uint8Array}
 */
export function utf8ToBytes(str: string): Uint8Array;
/**
 * UTF-8 decode bytes to a string.
 * @param {Uint8Array} bytes
 * @returns {string}
 */
export function bytesToUtf8(bytes: Uint8Array): string;
/**
 * Convert BytesLike to Uint8Array.
 * @param {string | Uint8Array} data
 * @returns {Uint8Array}
 */
export function arrayify(data: string | Uint8Array): Uint8Array;
