/**
 * TypeScript-only example: core Solidity types.
 *
 * This file is intended for developers using QuantumCoin.js from TypeScript.
 * It is not executed by `npm run example`.
 */

import type {
  AddressLike,
  BigNumberish,
  BytesLike,
  SolidityInputValue,
  SolidityOutputValue,
  SolidityTypeName,
} from "quantumcoin/types";

// AddressLike is currently a string (32-byte QuantumCoin address).
const addr: AddressLike = "0x0000000000000000000000000000000000000000000000000000000000001000";

// BigNumberish is accepted for uint/int inputs (string | number | bigint).
const amount: BigNumberish = "123";

// BytesLike is a hex string or Uint8Array.
const data: BytesLike = "0x1234";

// Generic mappings for ABI input/output values:
type T1 = SolidityInputValue<"uint256">; // BigNumberish
type T2 = SolidityOutputValue<"uint256">; // bigint
type T3 = SolidityInputValue<"address">; // AddressLike
type T4 = SolidityOutputValue<"address">; // string

// Example: using SolidityTypeName
const t: SolidityTypeName = "bytes32";

void addr;
void amount;
void data;
void t;
void (null as any as T1);
void (null as any as T2);
void (null as any as T3);
void (null as any as T4);

