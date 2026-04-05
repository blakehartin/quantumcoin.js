import type { BytesLike } from "./encoding";

export type BigNumberish = string | number | bigint;

export type FixedFormat = number | string | {
    signed?: boolean;
    width?: number;
    decimals?: number;
};

export class FixedNumber {
    private constructor(guard: any, value: bigint, format: any);

    readonly format: string;
    readonly _value: string;

    get signed(): boolean;
    get width(): number;
    get decimals(): number;
    get value(): bigint;

    add(other: FixedNumber): FixedNumber;
    addUnsafe(other: FixedNumber): FixedNumber;
    sub(other: FixedNumber): FixedNumber;
    subUnsafe(other: FixedNumber): FixedNumber;
    mul(other: FixedNumber): FixedNumber;
    mulUnsafe(other: FixedNumber): FixedNumber;
    mulSignal(other: FixedNumber): FixedNumber;
    div(other: FixedNumber): FixedNumber;
    divUnsafe(other: FixedNumber): FixedNumber;
    divSignal(other: FixedNumber): FixedNumber;

    cmp(other: FixedNumber): number;
    eq(other: FixedNumber): boolean;
    lt(other: FixedNumber): boolean;
    lte(other: FixedNumber): boolean;
    gt(other: FixedNumber): boolean;
    gte(other: FixedNumber): boolean;

    floor(): FixedNumber;
    ceiling(): FixedNumber;
    round(decimals?: number): FixedNumber;

    isZero(): boolean;
    isNegative(): boolean;

    toString(): string;
    toUnsafeFloat(): number;
    toFormat(format: FixedFormat): FixedNumber;
    toHexString(width?: number): string;

    static fromValue(value: BigNumberish, decimals?: number, format?: FixedFormat): FixedNumber;
    static fromString(value: string, format?: FixedFormat): FixedNumber;
    static fromBytes(value: BytesLike, format?: FixedFormat): FixedNumber;
    static from(value: any, format?: FixedFormat): FixedNumber;
    static isFixedNumber(value: any): value is FixedNumber;
}
