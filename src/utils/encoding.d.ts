export type BytesLike = string | Uint8Array;
/**
 * @typedef {string | Uint8Array} BytesLike
 */
/**
 * Converts bytes to UTF-8 string.
 * @param {BytesLike} data
 * @returns {string}
 */
export function toUtf8String(data: BytesLike): string;
/**
 * Converts string to UTF-8 bytes.
 * @param {string} str
 * @returns {Uint8Array}
 */
export function toUtf8Bytes(str: string): Uint8Array;
/**
 * Converts data to hex string.
 * @param {BytesLike} data
 * @returns {string}
 */
export function toHex(data: BytesLike): string;
/**
 * Alias for toHex.
 * @param {BytesLike} data
 * @returns {string}
 */
export function hexlify(data: BytesLike): string;
/**
 * Converts data to byte array.
 * @param {BytesLike} data
 * @returns {Uint8Array}
 */
export function arrayify(data: BytesLike): Uint8Array;
/**
 * Concatenates byte arrays and returns a hex string.
 * @param {BytesLike[]} items
 * @returns {string}
 */
export function concat(items: BytesLike[]): string;
/**
 * Strips leading zeros from a hex string.
 * @param {BytesLike} data
 * @returns {string}
 */
export function stripZerosLeft(data: BytesLike): string;
/**
 * Encodes a short UTF-8 string into a bytes32 hex string.
 * @param {string} text
 * @returns {string}
 */
export function encodeBytes32String(text: string): string;
/**
 * Decodes a bytes32 hex string into a UTF-8 string (trailing zeros stripped).
 * @param {BytesLike} bytes
 * @returns {string}
 */
export function decodeBytes32String(bytes: BytesLike): string;
/**
 * Decode Base58 string to bytes.
 * @param {string} data
 * @returns {Uint8Array}
 */
export function decodeBase58(data: string): Uint8Array;
/**
 * Base64 decode to bytes.
 * @param {string} data
 * @returns {Uint8Array}
 */
export function decodeBase64(data: string): Uint8Array;
/**
 * Encode BytesLike as Base58.
 * @param {BytesLike} data
 * @returns {string}
 */
export function encodeBase58(data: BytesLike): string;
/**
 * Base64 encode BytesLike.
 * @param {BytesLike} data
 * @returns {string}
 */
export function encodeBase64(data: BytesLike): string;
/**
 * Returns UTF-8 code points for a string.
 * @param {string} str
 * @returns {number[]}
 */
export function toUtf8CodePoints(str: string): number[];
import { isHexString } from "../internal/hex";
/**
 * Returns true if value is BytesLike.
 * @param {any} value
 * @returns {boolean}
 */
export function isBytesLike(value: any): boolean;
/**
 * Pads a BytesLike value to the left with zeros (byte length).
 * @param {BytesLike} value
 * @param {number} length
 * @returns {string}
 */
export function zeroPad(value: BytesLike, length: number): string;
/**
 * Pads a hex value (interpreted as bytes) to the left with zeros (byte length).
 * @param {BytesLike} value
 * @param {number} length
 * @returns {string}
 */
export function zeroPadValue(value: BytesLike, length: number): string;
/**
 * Solidity packed encoding.
 * This is a complex helper in ethers.js; in QuantumCoin.js it is currently not implemented.
 * @throws
 */
export function solidityPacked(): void;
export function solidityPackedKeccak256(): void;
export function solidityPackedSha256(): void;
import { bytesToHex } from "../internal/hex";
import { hexToBytes } from "../internal/hex";
export { isHexString, bytesToHex, hexToBytes };
