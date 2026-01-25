export type BigNumberish = string | number | bigint;
/**
 * Format a BigNumberish into a decimal string with `decimals` places.
 * @param {BigNumberish} value
 * @param {number=} decimals
 * @returns {string}
 */
export function formatUnits(value: BigNumberish, decimals?: number | undefined): string;
/**
 * Parse a decimal string into bigint with `decimals` places.
 * @param {string} value
 * @param {number=} decimals
 * @returns {bigint}
 */
export function parseUnits(value: string, decimals?: number | undefined): bigint;
/**
 * Format wei as coin string.
 * @param {BigNumberish} value
 * @returns {string}
 */
export function formatEther(value: BigNumberish): string;
/**
 * Parse coin string to wei.
 * @param {string} value
 * @returns {bigint}
 */
export function parseEther(value: string): bigint;
import { WeiPerEther } from "../constants";
export { WeiPerEther };
