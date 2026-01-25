export type ErrorCode = "INVALID_ARGUMENT" | "NUMERIC_FAULT" | "BUFFER_OVERRUN" | "CALL_EXCEPTION" | "UNKNOWN_ERROR" | "NOT_IMPLEMENTED";
/**
 * @fileoverview Error helpers and error classes.
 *
 * The QuantumCoin.js SDK follows ethers.js v6 error patterns:
 * - errors include a machine-readable `code`
 * - errors include `shortMessage`
 * - errors may include extra fields depending on the failure
 */
/**
 * @typedef {"INVALID_ARGUMENT"|"NUMERIC_FAULT"|"BUFFER_OVERRUN"|"CALL_EXCEPTION"|"UNKNOWN_ERROR"|"NOT_IMPLEMENTED"} ErrorCode
 */
/**
 * Returns true if the error matches the given code.
 * @param {any} error
 * @param {string} code
 * @returns {boolean}
 */
export function isError(error: any, code: string): boolean;
/**
 * Returns true if the error is a CALL_EXCEPTION.
 * @param {any} error
 * @returns {boolean}
 */
export function isCallException(error: any): boolean;
/**
 * Create an Error configured like ethers emits errors.
 *
 * @param {string} message
 * @param {ErrorCode} code
 * @param {Record<string, any>=} info
 * @returns {Error & { code: ErrorCode, shortMessage: string }}
 */
export function makeError(message: string, code: ErrorCode, info?: Record<string, any> | undefined): Error & {
    code: ErrorCode;
    shortMessage: string;
};
/**
 * Assert a condition, throwing an ethers-style error otherwise.
 * @param {any} check
 * @param {string} message
 * @param {ErrorCode} code
 * @param {Record<string, any>=} info
 */
export function assert(check: any, message: string, code: ErrorCode, info?: Record<string, any> | undefined): void;
/**
 * Assert an argument constraint.
 * @param {any} check
 * @param {string} message
 * @param {string} name
 * @param {any} value
 */
export function assertArgument(check: any, message: string, name: string, value: any): void;
/**
 * Provider error.
 */
export class ProviderError extends Error {
    /**
     * @param {string} message
     * @param {Record<string, any>=} info
     */
    constructor(message: string, info?: Record<string, any> | undefined);
    /** @type {ErrorCode} */
    code: ErrorCode;
    shortMessage: string;
}
/**
 * Transaction error.
 */
export class TransactionError extends Error {
    /**
     * @param {string} message
     * @param {Record<string, any>=} info
     */
    constructor(message: string, info?: Record<string, any> | undefined);
    /** @type {ErrorCode} */
    code: ErrorCode;
    shortMessage: string;
}
/**
 * Contract error.
 */
export class ContractError extends Error {
    /**
     * @param {string} message
     * @param {Record<string, any>=} info
     */
    constructor(message: string, info?: Record<string, any> | undefined);
    /** @type {ErrorCode} */
    code: ErrorCode;
    shortMessage: string;
}
