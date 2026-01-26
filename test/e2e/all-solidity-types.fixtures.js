/**
 * Shared fixtures for AllSolidityTypes contract tests.
 *
 * We use small integers (as strings or numbers) to avoid BigInt interop issues
 * in the underlying WASM ABI encoder.
 */

const { normalizeHex } = require("../../src/internal/hex");

function _hexOf(byteHex, lenBytes) {
  const b = byteHex.replace(/^0x/i, "");
  return normalizeHex("0x" + b.repeat(lenBytes));
}

function _num(n) {
  // Use number literals for ABI packing (WASM distinguishes numbers vs strings).
  return Number(n);
}

function buildAllUints(seed) {
  const s = seed || 1;
  return {
    u8: _num(8 + s),
    u16: _num(16 + s),
    u24: _num(24 + s),
    u32: _num(32 + s),
    u40: _num(40 + s),
    u48: _num(48 + s),
    u56: _num(56 + s),
    u64: _num(64 + s),
    u72: _num(72 + s),
    u80: _num(80 + s),
    u88: _num(88 + s),
    u96: _num(96 + s),
    u104: _num(104 + s),
    u112: _num(112 + s),
    u120: _num(120 + s),
    u128: _num(128 + s),
    u136: _num(136 + s),
    u144: _num(144 + s),
    u152: _num(152 + s),
    u160: _num(160 + s),
    u168: _num(168 + s),
    u176: _num(176 + s),
    u184: _num(184 + s),
    u192: _num(192 + s),
    u200: _num(200 + s),
    u208: _num(208 + s),
    u216: _num(216 + s),
    u224: _num(224 + s),
    u232: _num(232 + s),
    u240: _num(240 + s),
    u248: _num(248 + s),
    u256: _num(256 + s),
  };
}

function buildAllInts(seed) {
  const s = seed || 1;
  return {
    i8: _num(-8 - s),
    i16: _num(-16 - s),
    i24: _num(-24 - s),
    i32: _num(-32 - s),
    i40: _num(-40 - s),
    i48: _num(-48 - s),
    i56: _num(-56 - s),
    i64: _num(-64 - s),
    i72: _num(-72 - s),
    i80: _num(-80 - s),
    i88: _num(-88 - s),
    i96: _num(-96 - s),
    i104: _num(-104 - s),
    i112: _num(-112 - s),
    i120: _num(-120 - s),
    i128: _num(-128 - s),
    i136: _num(-136 - s),
    i144: _num(-144 - s),
    i152: _num(-152 - s),
    i160: _num(-160 - s),
    i168: _num(-168 - s),
    i176: _num(-176 - s),
    i184: _num(-184 - s),
    i192: _num(-192 - s),
    i200: _num(-200 - s),
    i208: _num(-208 - s),
    i216: _num(-216 - s),
    i224: _num(-224 - s),
    i232: _num(-232 - s),
    i240: _num(-240 - s),
    i248: _num(-248 - s),
    i256: _num(-256 - s),
  };
}

function buildAllFixedBytes(seedByte) {
  const b = seedByte || "11";
  return {
    b1: _hexOf(b, 1),
    b2: _hexOf(b, 2),
    b3: _hexOf(b, 3),
    b4: _hexOf(b, 4),
    b5: _hexOf(b, 5),
    b6: _hexOf(b, 6),
    b7: _hexOf(b, 7),
    b8: _hexOf(b, 8),
    b9: _hexOf(b, 9),
    b10: _hexOf(b, 10),
    b11: _hexOf(b, 11),
    b12: _hexOf(b, 12),
    b13: _hexOf(b, 13),
    b14: _hexOf(b, 14),
    b15: _hexOf(b, 15),
    b16: _hexOf(b, 16),
    b17: _hexOf(b, 17),
    b18: _hexOf(b, 18),
    b19: _hexOf(b, 19),
    b20: _hexOf(b, 20),
    b21: _hexOf(b, 21),
    b22: _hexOf(b, 22),
    b23: _hexOf(b, 23),
    b24: _hexOf(b, 24),
    b25: _hexOf(b, 25),
    b26: _hexOf(b, 26),
    b27: _hexOf(b, 27),
    b28: _hexOf(b, 28),
    b29: _hexOf(b, 29),
    b30: _hexOf(b, 30),
    b31: _hexOf(b, 31),
    b32: _hexOf(b, 32),
  };
}

function buildAllMisc(walletAddress) {
  const addr = walletAddress;
  return {
    bo: true,
    addr,
    payableAddr: addr,
    str: "hello",
    dynBytes: normalizeHex("0x1234"),
    choice: 1,
    u256s: [1, 2, 3],
    i256s: [-1, -2],
    b32s: [_hexOf("aa", 32), _hexOf("bb", 32)],
    addrs: [addr],
    bools: [true, false, true],
    strings: ["a", "b"],
    // NOTE: this SDK's hex parser rejects "0x" (empty). Use "0x00" for non-empty BytesLike.
    bytesArr: [normalizeHex("0x00"), normalizeHex("0x12")],
    fixedU16: [1, 2, 3],
    fixedB32: [_hexOf("cc", 32), _hexOf("dd", 32)],
  };
}

function buildInner(walletAddress, seed) {
  const u = buildAllUints(seed);
  const i = buildAllInts(seed);
  const fb = buildAllFixedBytes(seed % 2 ? "11" : "22");
  const misc = buildAllMisc(walletAddress);
  const u2 = buildAllUints((seed || 1) + 10);
  const fb2 = buildAllFixedBytes(seed % 2 ? "33" : "44");

  return {
    u,
    i,
    fb,
    misc,
    uStructs: [u2],
    fixedFb: [fb, fb2],
    matrix: [[1, 2], [3]],
  };
}

function buildOuter(walletAddress) {
  const inner1 = buildInner(walletAddress, 1);
  const inner2 = buildInner(walletAddress, 2);
  return {
    inner: inner1,
    inners: [inner2],
    fixedInners: [inner1, inner2],
    b32Matrix: [[_hexOf("01", 32)], [_hexOf("02", 32), _hexOf("03", 32)]],
  };
}

function canonicalize(value) {
  if (value == null) return value;

  if (typeof value === "bigint") return value.toString();

  if (typeof value === "number") {
    if (!Number.isFinite(value)) return String(value);
    // Always stringify numbers to be stable across decode implementations.
    return String(value);
  }

  if (typeof value === "string") {
    // Normalize hex strings (addresses/bytes) consistently.
    if (/^0x[0-9a-fA-F]*$/.test(value)) {
      return normalizeHex(value);
    }
    // Normalize numeric strings by leaving as-is (but trim).
    if (/^-?\d+$/.test(value.trim())) return value.trim();
    return value;
  }

  if (Array.isArray(value)) return value.map(canonicalize);

  if (value && typeof value === "object") {
    const keys = Object.keys(value);
    const hasNonNumeric = keys.some((k) => !/^\d+$/.test(k));
    const picked = hasNonNumeric ? keys.filter((k) => !/^\d+$/.test(k)) : keys;
    picked.sort();
    const out = {};
    for (const k of picked) out[k] = canonicalize(value[k]);
    return out;
  }

  return value;
}

module.exports = {
  buildAllUints,
  buildAllInts,
  buildAllFixedBytes,
  buildAllMisc,
  buildInner,
  buildOuter,
  canonicalize,
};

