/**
 * @fileoverview Core Solidity typing helpers for QuantumCoin.js.
 *
 * These types model common Solidity ABI value shapes (inputs and outputs).
 *
 * Notes:
 * - QuantumCoin addresses are 32 bytes (0x + 64 hex chars), but are represented as strings.
 * - For uint/int inputs, use BigNumberish (string | number | bigint) for compatibility.
 * - For uint/int outputs, QuantumCoin.js typically returns bigint (ethers v6 style).
 */

export type BytesLike = import("../utils/encoding").BytesLike;
export type BigNumberish = import("../utils/units").BigNumberish;

/**
 * A value that can be resolved to an address string.
 *
 * This mirrors the common "AddressLike" concept from ethers.js:
 * - raw string
 * - Addressable objects with getAddress()
 */
export type AddressLike =
  | string;

/**
 * Generic "hex string" alias (e.g. "0x..." or raw hex depending on context).
 */
export type HexString = string;

/**
 * Represents a 32-byte value input (bytes32).
 */
export type Bytes32Like = BytesLike;

/**
 * ---------------------------------------------------------------------------
 * Top-level Solidity value types (language-level)
 * ---------------------------------------------------------------------------
 * These are convenience aliases to describe Solidity types in TypeScript.
 * They are primarily useful for:
 * - ABI inputs/outputs
 * - generated typed contract wrappers
 * - dynamic ABI coding helpers
 *
 * Notes:
 * - Fixed point types and function types are intentionally omitted.
 * - Solidity mappings are not part of the ABI; they are modeled as nominal types.
 */

export type SolBool = boolean;
export type SolString = string;
export type SolBytes = BytesLike;

// Solidity address types (ABI uses "address" for both address and address payable)
export type SolAddress = AddressLike;
export type SolAddressPayable = AddressLike;

// Contract types are represented as addresses in the ABI.
export type SolContract = AddressLike;

// Enums are ABI-exposed as an integer type (usually uint8/uint16/uint256).
export type SolEnum<T extends number = number> = T;

// Arrays
export type SolArray<T> = readonly T[] | T[];
export type SolFixedArray<T, N extends number> = readonly T[] | T[]; // length is not enforced at runtime

// Tuples / structs (ABI tuples)
export type SolTuple<T extends readonly unknown[] = readonly unknown[]> = T;
export type SolStruct<TFields extends Record<string, unknown> = Record<string, unknown>> = TFields;

// Mappings are not part of the ABI; this is a nominal placeholder.
export type SolMapping<TKey, TValue> = {
  readonly __solMappingKey: TKey;
  readonly __solMappingValue: TValue;
};

/**
 * ---------------------------------------------------------------------------
 * Fixed-size bytes (explicit, static definitions)
 * ---------------------------------------------------------------------------
 */

export type Bytes1Like = BytesLike;
export type Bytes2Like = BytesLike;
export type Bytes3Like = BytesLike;
export type Bytes4Like = BytesLike;
export type Bytes5Like = BytesLike;
export type Bytes6Like = BytesLike;
export type Bytes7Like = BytesLike;
export type Bytes8Like = BytesLike;
export type Bytes9Like = BytesLike;
export type Bytes10Like = BytesLike;
export type Bytes11Like = BytesLike;
export type Bytes12Like = BytesLike;
export type Bytes13Like = BytesLike;
export type Bytes14Like = BytesLike;
export type Bytes15Like = BytesLike;
export type Bytes16Like = BytesLike;
export type Bytes17Like = BytesLike;
export type Bytes18Like = BytesLike;
export type Bytes19Like = BytesLike;
export type Bytes20Like = BytesLike;
export type Bytes21Like = BytesLike;
export type Bytes22Like = BytesLike;
export type Bytes23Like = BytesLike;
export type Bytes24Like = BytesLike;
export type Bytes25Like = BytesLike;
export type Bytes26Like = BytesLike;
export type Bytes27Like = BytesLike;
export type Bytes28Like = BytesLike;
export type Bytes29Like = BytesLike;
export type Bytes30Like = BytesLike;
export type Bytes31Like = BytesLike;
export type Bytes32FixedLike = Bytes32Like;

export type Bytes1 = string;
export type Bytes2 = string;
export type Bytes3 = string;
export type Bytes4 = string;
export type Bytes5 = string;
export type Bytes6 = string;
export type Bytes7 = string;
export type Bytes8 = string;
export type Bytes9 = string;
export type Bytes10 = string;
export type Bytes11 = string;
export type Bytes12 = string;
export type Bytes13 = string;
export type Bytes14 = string;
export type Bytes15 = string;
export type Bytes16 = string;
export type Bytes17 = string;
export type Bytes18 = string;
export type Bytes19 = string;
export type Bytes20 = string;
export type Bytes21 = string;
export type Bytes22 = string;
export type Bytes23 = string;
export type Bytes24 = string;
export type Bytes25 = string;
export type Bytes26 = string;
export type Bytes27 = string;
export type Bytes28 = string;
export type Bytes29 = string;
export type Bytes30 = string;
export type Bytes31 = string;
export type Bytes32 = string;

/**
 * ---------------------------------------------------------------------------
 * Integers (explicit width aliases)
 * ---------------------------------------------------------------------------
 */

export type Int8Like = BigNumberish;
export type Int16Like = BigNumberish;
export type Int24Like = BigNumberish;
export type Int32Like = BigNumberish;
export type Int40Like = BigNumberish;
export type Int48Like = BigNumberish;
export type Int56Like = BigNumberish;
export type Int64Like = BigNumberish;
export type Int72Like = BigNumberish;
export type Int80Like = BigNumberish;
export type Int88Like = BigNumberish;
export type Int96Like = BigNumberish;
export type Int104Like = BigNumberish;
export type Int112Like = BigNumberish;
export type Int120Like = BigNumberish;
export type Int128Like = BigNumberish;
export type Int136Like = BigNumberish;
export type Int144Like = BigNumberish;
export type Int152Like = BigNumberish;
export type Int160Like = BigNumberish;
export type Int168Like = BigNumberish;
export type Int176Like = BigNumberish;
export type Int184Like = BigNumberish;
export type Int192Like = BigNumberish;
export type Int200Like = BigNumberish;
export type Int208Like = BigNumberish;
export type Int216Like = BigNumberish;
export type Int224Like = BigNumberish;
export type Int232Like = BigNumberish;
export type Int240Like = BigNumberish;
export type Int248Like = BigNumberish;
export type Int256Like = BigNumberish;

export type Uint8Like = BigNumberish;
export type Uint16Like = BigNumberish;
export type Uint24Like = BigNumberish;
export type Uint32Like = BigNumberish;
export type Uint40Like = BigNumberish;
export type Uint48Like = BigNumberish;
export type Uint56Like = BigNumberish;
export type Uint64Like = BigNumberish;
export type Uint72Like = BigNumberish;
export type Uint80Like = BigNumberish;
export type Uint88Like = BigNumberish;
export type Uint96Like = BigNumberish;
export type Uint104Like = BigNumberish;
export type Uint112Like = BigNumberish;
export type Uint120Like = BigNumberish;
export type Uint128Like = BigNumberish;
export type Uint136Like = BigNumberish;
export type Uint144Like = BigNumberish;
export type Uint152Like = BigNumberish;
export type Uint160Like = BigNumberish;
export type Uint168Like = BigNumberish;
export type Uint176Like = BigNumberish;
export type Uint184Like = BigNumberish;
export type Uint192Like = BigNumberish;
export type Uint200Like = BigNumberish;
export type Uint208Like = BigNumberish;
export type Uint216Like = BigNumberish;
export type Uint224Like = BigNumberish;
export type Uint232Like = BigNumberish;
export type Uint240Like = BigNumberish;
export type Uint248Like = BigNumberish;
export type Uint256Like = BigNumberish;

export type Int8 = bigint;
export type Int16 = bigint;
export type Int24 = bigint;
export type Int32 = bigint;
export type Int40 = bigint;
export type Int48 = bigint;
export type Int56 = bigint;
export type Int64 = bigint;
export type Int72 = bigint;
export type Int80 = bigint;
export type Int88 = bigint;
export type Int96 = bigint;
export type Int104 = bigint;
export type Int112 = bigint;
export type Int120 = bigint;
export type Int128 = bigint;
export type Int136 = bigint;
export type Int144 = bigint;
export type Int152 = bigint;
export type Int160 = bigint;
export type Int168 = bigint;
export type Int176 = bigint;
export type Int184 = bigint;
export type Int192 = bigint;
export type Int200 = bigint;
export type Int208 = bigint;
export type Int216 = bigint;
export type Int224 = bigint;
export type Int232 = bigint;
export type Int240 = bigint;
export type Int248 = bigint;
export type Int256 = bigint;

export type Uint8 = bigint;
export type Uint16 = bigint;
export type Uint24 = bigint;
export type Uint32 = bigint;
export type Uint40 = bigint;
export type Uint48 = bigint;
export type Uint56 = bigint;
export type Uint64 = bigint;
export type Uint72 = bigint;
export type Uint80 = bigint;
export type Uint88 = bigint;
export type Uint96 = bigint;
export type Uint104 = bigint;
export type Uint112 = bigint;
export type Uint120 = bigint;
export type Uint128 = bigint;
export type Uint136 = bigint;
export type Uint144 = bigint;
export type Uint152 = bigint;
export type Uint160 = bigint;
export type Uint168 = bigint;
export type Uint176 = bigint;
export type Uint184 = bigint;
export type Uint192 = bigint;
export type Uint200 = bigint;
export type Uint208 = bigint;
export type Uint216 = bigint;
export type Uint224 = bigint;
export type Uint232 = bigint;
export type Uint240 = bigint;
export type Uint248 = bigint;
export type Uint256 = bigint;

/**
 * ---------------------------------------------------------------------------
 * ABI type names + value mapping (ABI specification)
 * ---------------------------------------------------------------------------
 */

export type SolidityFixedBytesTypeName =
  | "bytes1"
  | "bytes2"
  | "bytes3"
  | "bytes4"
  | "bytes5"
  | "bytes6"
  | "bytes7"
  | "bytes8"
  | "bytes9"
  | "bytes10"
  | "bytes11"
  | "bytes12"
  | "bytes13"
  | "bytes14"
  | "bytes15"
  | "bytes16"
  | "bytes17"
  | "bytes18"
  | "bytes19"
  | "bytes20"
  | "bytes21"
  | "bytes22"
  | "bytes23"
  | "bytes24"
  | "bytes25"
  | "bytes26"
  | "bytes27"
  | "bytes28"
  | "bytes29"
  | "bytes30"
  | "bytes31"
  | "bytes32";

export type SolidityIntTypeName =
  | "int"
  | "int8"
  | "int16"
  | "int24"
  | "int32"
  | "int40"
  | "int48"
  | "int56"
  | "int64"
  | "int72"
  | "int80"
  | "int88"
  | "int96"
  | "int104"
  | "int112"
  | "int120"
  | "int128"
  | "int136"
  | "int144"
  | "int152"
  | "int160"
  | "int168"
  | "int176"
  | "int184"
  | "int192"
  | "int200"
  | "int208"
  | "int216"
  | "int224"
  | "int232"
  | "int240"
  | "int248"
  | "int256";

export type SolidityUintTypeName =
  | "uint"
  | "uint8"
  | "uint16"
  | "uint24"
  | "uint32"
  | "uint40"
  | "uint48"
  | "uint56"
  | "uint64"
  | "uint72"
  | "uint80"
  | "uint88"
  | "uint96"
  | "uint104"
  | "uint112"
  | "uint120"
  | "uint128"
  | "uint136"
  | "uint144"
  | "uint152"
  | "uint160"
  | "uint168"
  | "uint176"
  | "uint184"
  | "uint192"
  | "uint200"
  | "uint208"
  | "uint216"
  | "uint224"
  | "uint232"
  | "uint240"
  | "uint248"
  | "uint256";

export type SolidityElementaryTypeName =
  | "address"
  | "bool"
  | "string"
  | "bytes"
  | SolidityFixedBytesTypeName
  | SolidityIntTypeName
  | SolidityUintTypeName
  | "tuple";

/**
 * Solidity ABI type string (commonly used in ABI coder APIs).
 *
 * This is intentionally broad, but still provides useful narrowing for common types.
 */
export type SolidityTypeName =
  | SolidityElementaryTypeName
  | `${SolidityTypeName}[]`
  | `${SolidityTypeName}[${number}]`;

/**
 * Values accepted as ABI *inputs* for a given Solidity type.
 */
export type SolidityInputValue<T extends SolidityTypeName> = T extends `${infer Inner}[]`
  ? SolidityInputValue<Extract<Inner, SolidityTypeName>>[]
  : T extends `${infer Inner}[${number}]`
    ? SolidityInputValue<Extract<Inner, SolidityTypeName>>[]
    : T extends "address"
      ? AddressLike
      : T extends "bool"
        ? boolean
        : T extends "string"
          ? string
    : T extends "bytes" | SolidityFixedBytesTypeName
            ? BytesLike
    : T extends SolidityUintTypeName | SolidityIntTypeName
                ? BigNumberish
                : any;

/**
 * Values returned as ABI *outputs* for a given Solidity type.
 */
export type SolidityOutputValue<T extends SolidityTypeName> = T extends `${infer Inner}[]`
  ? SolidityOutputValue<Extract<Inner, SolidityTypeName>>[]
  : T extends `${infer Inner}[${number}]`
    ? SolidityOutputValue<Extract<Inner, SolidityTypeName>>[]
    : T extends "address"
      ? string
      : T extends "bool"
        ? boolean
        : T extends "string"
          ? string
    : T extends "bytes" | SolidityFixedBytesTypeName
            ? string
      : T extends SolidityUintTypeName | SolidityIntTypeName
              ? bigint
              : any;

/**
 * Generic tuple/struct placeholders (used when the ABI contains tuples).
 * Generated contract wrappers may refine these further.
 */
export type SolidityTuple = SolTuple;
export type SolidityStruct = SolStruct;

