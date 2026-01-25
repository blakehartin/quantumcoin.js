/**
 * @fileoverview Result utility (ethers.js v6 compatible).
 *
 * ethers.js Result is an Array-like with optional named keys.
 * This simplified implementation covers the common patterns used in this SDK.
 */
export class Result extends Array<any> {
    /**
     * @param {Array<any>} items
     * @param {Array<null|string>=} keys
     * @returns {Result}
     */
    static fromItems(items: Array<any>, keys?: Array<null | string> | undefined): Result;
    /**
     * @param {any[]=} items
     * @param {(null|string)[]=} keys
     */
    constructor(items?: any[] | undefined, keys?: (null | string)[] | undefined);
    /** @type {(null|string)[]|null} */
    _keys: (null | string)[] | null;
    /**
     * Get a value by key.
     * @param {string} name
     * @returns {any}
     */
    getValue(name: string): any;
    /**
     * Convert to array (optionally deep).
     * @param {boolean=} deep
     * @returns {any[]}
     */
    toArray(deep?: boolean | undefined): any[];
    /**
     * Convert to object (optionally deep).
     * @param {boolean=} deep
     * @returns {Record<string, any>}
     */
    toObject(deep?: boolean | undefined): Record<string, any>;
}
/**
 * Scan a decoded Result (or nested structure) for embedded Error objects.
 *
 * ethers.js uses this to surface nested decode errors (especially for tuples
 * and structs). This lightweight implementation walks:
 * - Result instances (by index; prefers named keys in the path when available)
 * - Arrays
 * - Plain objects (for struct-like outputs)
 *
 * It is cycle-safe.
 *
 * @param {any} result
 * @returns {Array<{ error: Error, path: Array<string|number> }>}
 */
export function checkResultErrors(result: any): Array<{
    error: Error;
    path: Array<string | number>;
}>;
