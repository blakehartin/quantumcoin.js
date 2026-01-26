// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;
pragma experimental ABIEncoderV2;

/// @title AllSolidityTypes
/// @notice A Solidity 0.7.6 contract that exercises a wide surface of ABI-encodable types.
/// @dev
/// - Includes: bool, all int/uint widths, address/address payable, string, bytes, bytes1..bytes32
/// - Includes: enums, nested structs, fixed/dynamic arrays, arrays of structs, structs of structs
/// - Excludes: fixed-point types and function types (by request)
/// - Note: mappings are not ABI-encodable, so they are shown only as a storage type.
contract AllSolidityTypes {
  enum Choice { None, One, Two }

  // Mapping example (not ABI-encodable as param/return)
  mapping(address => uint256) private _balances;

  // --------------------------------------------------------------------------
  // All integer widths
  // --------------------------------------------------------------------------
  struct AllUints {
    uint8 u8; uint16 u16; uint24 u24; uint32 u32; uint40 u40; uint48 u48; uint56 u56; uint64 u64;
    uint72 u72; uint80 u80; uint88 u88; uint96 u96; uint104 u104; uint112 u112; uint120 u120; uint128 u128;
    uint136 u136; uint144 u144; uint152 u152; uint160 u160; uint168 u168; uint176 u176; uint184 u184; uint192 u192;
    uint200 u200; uint208 u208; uint216 u216; uint224 u224; uint232 u232; uint240 u240; uint248 u248; uint256 u256;
  }

  struct AllInts {
    int8 i8; int16 i16; int24 i24; int32 i32; int40 i40; int48 i48; int56 i56; int64 i64;
    int72 i72; int80 i80; int88 i88; int96 i96; int104 i104; int112 i112; int120 i120; int128 i128;
    int136 i136; int144 i144; int152 i152; int160 i160; int168 i168; int176 i176; int184 i184; int192 i192;
    int200 i200; int208 i208; int216 i216; int224 i224; int232 i232; int240 i240; int248 i248; int256 i256;
  }

  // --------------------------------------------------------------------------
  // All fixed-size bytes
  // --------------------------------------------------------------------------
  struct AllFixedBytes {
    bytes1 b1; bytes2 b2; bytes3 b3; bytes4 b4; bytes5 b5; bytes6 b6; bytes7 b7; bytes8 b8;
    bytes9 b9; bytes10 b10; bytes11 b11; bytes12 b12; bytes13 b13; bytes14 b14; bytes15 b15; bytes16 b16;
    bytes17 b17; bytes18 b18; bytes19 b19; bytes20 b20; bytes21 b21; bytes22 b22; bytes23 b23; bytes24 b24;
    bytes25 b25; bytes26 b26; bytes27 b27; bytes28 b28; bytes29 b29; bytes30 b30; bytes31 b31; bytes32 b32;
  }

  // --------------------------------------------------------------------------
  // Misc ABI value types (plus arrays)
  // --------------------------------------------------------------------------
  struct AllMisc {
    bool bo;
    address addr;
    address payable payableAddr;
    string str;
    bytes dynBytes;
    Choice choice;
    // Arrays of elementary types
    uint256[] u256s;
    int256[] i256s;
    bytes32[] b32s;
    address[] addrs;
    bool[] bools;
    string[] strings;
    bytes[] bytesArr;
    // Fixed arrays
    uint16[3] fixedU16;
    bytes32[2] fixedB32;
  }

  // Nested struct that contains structs and arrays of structs
  struct Inner {
    AllUints u;
    AllInts i;
    AllFixedBytes fb;
    AllMisc misc;
    // Array of structs
    AllUints[] uStructs;
    // Struct of structs
    AllFixedBytes[2] fixedFb;
    // Nested arrays
    uint256[][] matrix;
  }

  struct Outer {
    Inner inner;
    Inner[] inners;        // dynamic array of structs
    Inner[2] fixedInners;  // fixed array of structs
    bytes32[][] b32Matrix;
  }

  AllUints private _storedU;
  AllInts private _storedI;
  AllFixedBytes private _storedFb;
  AllMisc private _storedMisc;

  /// @notice Constructor with multiple parameters (including structs and arrays).
  constructor(
    bool bo,
    address payable payableAddr,
    string memory str,
    bytes memory dynBytes,
    Choice choice,
    AllUints memory u,
    AllInts memory i,
    AllFixedBytes memory fb,
    AllMisc memory misc,
    uint256[] memory seedU256s,
    bytes32[2] memory seedB32
  ) {
    _storedU = u;
    _storedI = i;
    _storedFb = fb;

    // Store some misc fields (keep it simple; not all array fields are persisted).
    _storedMisc.bo = bo;
    _storedMisc.addr = msg.sender;
    _storedMisc.payableAddr = payableAddr;
    _storedMisc.str = str;
    _storedMisc.dynBytes = dynBytes;
    _storedMisc.choice = choice;
    _storedMisc.u256s = seedU256s;
    _storedMisc.fixedB32 = seedB32;

    // Touch mapping to demonstrate mapping existence.
    _balances[msg.sender] = seedU256s.length;

    // Use "misc" parameter to avoid unused warnings and ensure ABIEncoderV2 path is exercised.
    if (misc.fixedU16.length > 0) {
      _balances[misc.addr] = uint256(misc.fixedU16[0]);
    }
  }

  // --------------------------------------------------------------------------
  // Echo / roundtrip helpers (ABI-encodable inputs and outputs)
  // --------------------------------------------------------------------------

  function echoAllUints(AllUints memory x) external pure returns (AllUints memory) { return x; }
  function echoAllInts(AllInts memory x) external pure returns (AllInts memory) { return x; }
  function echoAllFixedBytes(AllFixedBytes memory x) external pure returns (AllFixedBytes memory) { return x; }
  function echoAllMisc(AllMisc memory x) external pure returns (AllMisc memory) { return x; }

  function echoInner(Inner memory x) external pure returns (Inner memory) { return x; }
  function echoOuter(Outer memory x) external pure returns (Outer memory) { return x; }

  // Arrays of structs and nested arrays
  function echoAllUintsArray(AllUints[] memory xs) external pure returns (AllUints[] memory) { return xs; }
  function echoInnerArray(Inner[] memory xs) external pure returns (Inner[] memory) { return xs; }
  function echoMatrix(uint256[][] memory m) external pure returns (uint256[][] memory) { return m; }

  // Multiple input params + multiple return params
  function multiReturn(
    bool bo,
    address addr,
    bytes32 b32,
    string memory s,
    uint256 x,
    AllUints memory u
  )
    external
    pure
    returns (
      bool outBo,
      address outAddr,
      address payable outPayableAddr,
      bytes32 outB32,
      string memory outS,
      uint256 outX,
      AllUints memory outU
    )
  {
    outBo = bo;
    outAddr = addr;
    outPayableAddr = payable(addr);
    outB32 = b32;
    outS = s;
    outX = x;
    outU = u;
  }

  // Read-only getters to provide outputs without inputs
  function getStoredUints() external view returns (AllUints memory) { return _storedU; }
  function getStoredInts() external view returns (AllInts memory) { return _storedI; }
  function getStoredFixedBytes() external view returns (AllFixedBytes memory) { return _storedFb; }
  function getStoredMisc() external view returns (AllMisc memory) { return _storedMisc; }
}

