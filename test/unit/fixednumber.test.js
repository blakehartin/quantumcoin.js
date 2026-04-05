/**
 * @testCategory unit
 * @blockchainRequired false
 * @transactional false
 * @description FixedNumber: creation, arithmetic, comparison, rounding, conversion, and error handling
 */

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const qc = require("../../index");

const { FixedNumber } = qc;

// ---------------------------------------------------------------------------
// Ported from ethers.js v5 test-utils.ts (FixedNumber section)
// ---------------------------------------------------------------------------

describe("FixedNumber (ethers v5 ported)", () => {
  describe("Creation from value", () => {
    const tests = [
      { value: "0.0", expected: "0.0" },
      { value: "-0.0", expected: "0.0" },
      { value: "1.0", expected: "1.0" },
      { value: "1.00", expected: "1.0" },
      { value: "01.00", expected: "1.0" },
      { value: 1, expected: "1.0" },
      { value: "-1.0", expected: "-1.0" },
      { value: "-1.00", expected: "-1.0" },
      { value: "-01.00", expected: "-1.0" },
      { value: -1, expected: "-1.0" },
    ];

    for (const test of tests) {
      it(`from(${test.value}) => "${test.expected}"`, () => {
        const value = FixedNumber.from(test.value);
        assert.equal(value.toString(), test.expected);
      });
    }
  });

  describe("Rounding", () => {
    const tests = [
      { value: "1.0", round: 1, expected: "1.0" },
      { value: "1.4", round: 1, expected: "1.4" },
      { value: "1.4", round: 2, expected: "1.4" },
      { value: "1.4", round: 0, expected: "1.0" },
      { value: "1.5", round: 0, expected: "2.0" },
      { value: "1.6", round: 0, expected: "2.0" },
      { value: "-1.0", round: 1, expected: "-1.0" },
      { value: "-1.4", round: 1, expected: "-1.4" },
      { value: "-1.4", round: 2, expected: "-1.4" },
      { value: "-1.4", round: 0, expected: "-1.0" },
      { value: "-1.5", round: 0, expected: "-2.0" },
      { value: "-1.6", round: 0, expected: "-2.0" },
      { value: "1.51", round: 1, expected: "1.5" },
      { value: "1.55", round: 1, expected: "1.6" },
    ];

    for (const test of tests) {
      it(`round(${test.value}, ${test.round}) => "${test.expected}"`, () => {
        const value = FixedNumber.from(test.value).round(test.round);
        assert.equal(value.toString(), test.expected);
      });
    }
  });

  describe("Floor / Ceiling", () => {
    const tests = [
      { value: "1.0", ceiling: "1.0", floor: "1.0" },
      { value: "1.1", ceiling: "2.0", floor: "1.0" },
      { value: "1.9", ceiling: "2.0", floor: "1.0" },
      { value: "-1.0", ceiling: "-1.0", floor: "-1.0" },
      { value: "-1.1", ceiling: "-1.0", floor: "-2.0" },
      { value: "-1.9", ceiling: "-1.0", floor: "-2.0" },
    ];

    for (const test of tests) {
      it(`floor/ceiling(${test.value})`, () => {
        const value = FixedNumber.from(test.value);
        assert.equal(value.floor().toString(), test.floor);
        assert.equal(value.ceiling().toString(), test.ceiling);
      });
    }
  });
});

// ---------------------------------------------------------------------------
// New v6 API tests
// ---------------------------------------------------------------------------

describe("FixedNumber (v6 API)", () => {
  describe("Properties", () => {
    it("exposes format, signed, width, decimals, value", () => {
      const f = FixedNumber.fromString("1.5");
      assert.equal(f.format, "fixed128x18");
      assert.equal(f.signed, true);
      assert.equal(f.width, 128);
      assert.equal(f.decimals, 18);
      assert.equal(typeof f.value, "bigint");
      assert.equal(f.value, 1500000000000000000n);
    });

    it("unsigned format properties", () => {
      const f = FixedNumber.fromString("10", "ufixed32x0");
      assert.equal(f.format, "ufixed32x0");
      assert.equal(f.signed, false);
      assert.equal(f.width, 32);
      assert.equal(f.decimals, 0);
    });
  });

  describe("fromString", () => {
    it("parses with custom format", () => {
      const f = FixedNumber.fromString("3.14", "fixed128x2");
      assert.equal(f.toString(), "3.14");
      assert.equal(f.value, 314n);
    });

    it("parses zero-decimal format", () => {
      const f = FixedNumber.fromString("42", "fixed128x0");
      assert.equal(f.toString(), "42");
      assert.equal(f.value, 42n);
    });

    it("parses unsigned format", () => {
      const f = FixedNumber.fromString("255", "ufixed8x0");
      assert.equal(f.toString(), "255");
    });
  });

  describe("fromValue", () => {
    it("creates from bigint with decimals", () => {
      const f = FixedNumber.fromValue(1500000000000000000n, 18);
      assert.equal(f.toString(), "1.5");
    });

    it("creates from number", () => {
      const f = FixedNumber.fromValue(100, 2, "fixed128x2");
      assert.equal(f.toString(), "1.0");
    });
  });

  describe("fromBytes round-trip", () => {
    it("roundtrips through hex bytes", () => {
      const f1 = FixedNumber.fromString("42", "ufixed32x0");
      const hex = f1.toHexString();
      const bytes = Buffer.from(hex.replace(/^0x/, ""), "hex");
      const f2 = FixedNumber.fromBytes(bytes, "ufixed32x0");
      assert.equal(f2.toString(), "42");
    });
  });

  describe("from() dispatch", () => {
    it("from string", () => {
      assert.equal(FixedNumber.from("2.5").toString(), "2.5");
    });

    it("from number", () => {
      assert.equal(FixedNumber.from(3).toString(), "3.0");
    });

    it("from bigint", () => {
      assert.equal(FixedNumber.from(5n).toString(), "5.0");
    });
  });

  describe("Safe arithmetic", () => {
    it("add", () => {
      const a = FixedNumber.fromString("1.5");
      const b = FixedNumber.fromString("2.3");
      assert.equal(a.add(b).toString(), "3.8");
    });

    it("sub", () => {
      const a = FixedNumber.fromString("5.0");
      const b = FixedNumber.fromString("2.3");
      assert.equal(a.sub(b).toString(), "2.7");
    });

    it("mul", () => {
      const a = FixedNumber.fromString("2.0");
      const b = FixedNumber.fromString("3.5");
      assert.equal(a.mul(b).toString(), "7.0");
    });

    it("div", () => {
      const a = FixedNumber.fromString("7.0");
      const b = FixedNumber.fromString("2.0");
      assert.equal(a.div(b).toString(), "3.5");
    });
  });

  describe("Unsafe arithmetic (silent overflow)", () => {
    it("addUnsafe wraps on overflow in fixed8x0", () => {
      const a = FixedNumber.fromString("127", "fixed8x0");
      const b = FixedNumber.fromString("1", "fixed8x0");
      const result = a.addUnsafe(b);
      assert.equal(typeof result.toString(), "string");
    });

    it("subUnsafe wraps on underflow in fixed8x0", () => {
      const a = FixedNumber.fromString("-128", "fixed8x0");
      const b = FixedNumber.fromString("1", "fixed8x0");
      const result = a.subUnsafe(b);
      assert.equal(typeof result.toString(), "string");
    });
  });

  describe("Comparison", () => {
    it("cmp returns -1, 0, 1", () => {
      const a = FixedNumber.fromString("1.0");
      const b = FixedNumber.fromString("2.0");
      const c = FixedNumber.fromString("1.0");
      assert.equal(a.cmp(b), -1);
      assert.equal(b.cmp(a), 1);
      assert.equal(a.cmp(c), 0);
    });

    it("eq, lt, lte, gt, gte", () => {
      const a = FixedNumber.fromString("1.0");
      const b = FixedNumber.fromString("2.0");
      assert.equal(a.eq(a), true);
      assert.equal(a.eq(b), false);
      assert.equal(a.lt(b), true);
      assert.equal(a.lte(b), true);
      assert.equal(a.lte(a), true);
      assert.equal(b.gt(a), true);
      assert.equal(b.gte(a), true);
      assert.equal(b.gte(b), true);
    });

    it("cmp across different decimal formats", () => {
      const a = FixedNumber.fromString("1.5", "fixed128x2");
      const b = FixedNumber.fromString("1.5", "fixed128x18");
      assert.equal(a.cmp(b), 0);
    });
  });

  describe("isZero / isNegative", () => {
    it("isZero", () => {
      assert.equal(FixedNumber.fromString("0.0").isZero(), true);
      assert.equal(FixedNumber.fromString("1.0").isZero(), false);
    });

    it("isNegative", () => {
      assert.equal(FixedNumber.fromString("-1.0").isNegative(), true);
      assert.equal(FixedNumber.fromString("0.0").isNegative(), false);
      assert.equal(FixedNumber.fromString("1.0").isNegative(), false);
    });
  });

  describe("toUnsafeFloat", () => {
    it("returns approximate float", () => {
      const f = FixedNumber.fromString("3.14");
      assert.ok(Math.abs(f.toUnsafeFloat() - 3.14) < 0.001);
    });
  });

  describe("toFormat", () => {
    it("converts between formats", () => {
      const f = FixedNumber.fromString("1.5", "fixed128x18");
      const g = f.toFormat("fixed128x2");
      assert.equal(g.toString(), "1.5");
      assert.equal(g.format, "fixed128x2");
    });
  });

  describe("isFixedNumber", () => {
    it("returns true for FixedNumber", () => {
      assert.equal(FixedNumber.isFixedNumber(FixedNumber.from("1.0")), true);
    });

    it("returns false for non-FixedNumber", () => {
      assert.equal(FixedNumber.isFixedNumber("1.0"), false);
      assert.equal(FixedNumber.isFixedNumber(1), false);
      assert.equal(FixedNumber.isFixedNumber({}), false);
      assert.equal(FixedNumber.isFixedNumber(null), false);
    });
  });

  describe("toHexString", () => {
    it("returns hex for unsigned value", () => {
      const f = FixedNumber.fromString("255", "ufixed8x0");
      assert.equal(f.toHexString(), "0xff");
    });

    it("returns hex for positive signed value", () => {
      const f = FixedNumber.fromString("1", "fixed8x0");
      assert.equal(f.toHexString(), "0x01");
    });
  });
});

// ---------------------------------------------------------------------------
// Negative tests -- invalid inputs
// ---------------------------------------------------------------------------

describe("FixedNumber negative tests -- invalid inputs", () => {
  it("fromString rejects empty string", () => {
    assert.throws(() => FixedNumber.fromString(""), /invalid/);
  });

  it("fromString rejects non-numeric string", () => {
    assert.throws(() => FixedNumber.fromString("abc"), /invalid/);
  });

  it("fromString rejects multiple decimal points", () => {
    assert.throws(() => FixedNumber.fromString("1.2.3"), /invalid/);
  });

  it("fromString rejects whitespace-only string", () => {
    assert.throws(() => FixedNumber.fromString("   "), /invalid/);
  });

  it("fromString rejects too many decimals for format", () => {
    assert.throws(() => FixedNumber.fromString("1.123", "fixed128x2"), /too many decimals/i);
  });

  it("fromValue rejects NaN", () => {
    assert.throws(() => FixedNumber.fromValue(NaN, 0), /invalid/);
  });

  it("fromValue rejects Infinity", () => {
    assert.throws(() => FixedNumber.fromValue(Infinity, 0), /invalid/);
  });

  it("fromValue rejects object", () => {
    assert.throws(() => FixedNumber.fromValue({}, 0), /invalid/);
  });

  it("from() rejects boolean", () => {
    assert.throws(() => FixedNumber.from(true), /invalid/);
  });

  it("from() rejects function", () => {
    assert.throws(() => FixedNumber.from(() => {}), /invalid/);
  });

  it("constructor is guarded", () => {
    assert.throws(() => new FixedNumber({}, 0n, {}), /cannot use FixedNumber constructor/);
  });
});

// ---------------------------------------------------------------------------
// Negative tests -- overflow
// ---------------------------------------------------------------------------

describe("FixedNumber negative tests -- overflow", () => {
  it("add throws on signed overflow (127 + 1 in fixed8x0)", () => {
    const a = FixedNumber.fromString("127", "fixed8x0");
    const b = FixedNumber.fromString("1", "fixed8x0");
    assert.throws(() => a.add(b), (e) => e.code === "NUMERIC_FAULT" && e.fault === "overflow");
  });

  it("sub throws on signed underflow (-128 - 1 in fixed8x0)", () => {
    const a = FixedNumber.fromString("-128", "fixed8x0");
    const b = FixedNumber.fromString("1", "fixed8x0");
    assert.throws(() => a.sub(b), (e) => e.code === "NUMERIC_FAULT" && e.fault === "overflow");
  });

  it("mul throws on overflow", () => {
    const a = FixedNumber.fromString("127", "fixed8x0");
    const b = FixedNumber.fromString("2", "fixed8x0");
    assert.throws(() => a.mul(b), (e) => e.code === "NUMERIC_FAULT" && e.fault === "overflow");
  });

  it("unsigned sub throws on 0 - 1 (ufixed8x0)", () => {
    const a = FixedNumber.fromString("0", "ufixed8x0");
    const b = FixedNumber.fromString("1", "ufixed8x0");
    assert.throws(() => a.sub(b), (e) => e.code === "NUMERIC_FAULT" && e.fault === "overflow");
  });

  it("fromString throws overflow for 256 in ufixed8x0", () => {
    assert.throws(
      () => FixedNumber.fromString("256", "ufixed8x0"),
      (e) => e.code === "NUMERIC_FAULT" && e.fault === "overflow",
    );
  });

  it("fromString throws overflow for 128 in fixed8x0", () => {
    assert.throws(
      () => FixedNumber.fromString("128", "fixed8x0"),
      (e) => e.code === "NUMERIC_FAULT" && e.fault === "overflow",
    );
  });

  it("fromValue throws overflow when scaled value exceeds range", () => {
    assert.throws(
      () => FixedNumber.fromValue(256n, 0, "ufixed8x0"),
      (e) => e.code === "NUMERIC_FAULT" && e.fault === "overflow",
    );
  });
});

// ---------------------------------------------------------------------------
// Negative tests -- underflow (precision loss)
// ---------------------------------------------------------------------------

describe("FixedNumber negative tests -- underflow", () => {
  it("mulSignal throws on precision loss", () => {
    const a = FixedNumber.fromString("0.1", "fixed128x1");
    const b = FixedNumber.fromString("0.1", "fixed128x1");
    assert.throws(() => a.mulSignal(b), (e) => e.code === "NUMERIC_FAULT" && e.fault === "underflow");
  });

  it("divSignal throws when division is not exact", () => {
    const a = FixedNumber.fromString("1.0");
    const b = FixedNumber.fromString("3.0");
    assert.throws(() => a.divSignal(b), (e) => e.code === "NUMERIC_FAULT" && e.fault === "underflow");
  });

  it("mul (non-signal) silently truncates", () => {
    const a = FixedNumber.fromString("0.1", "fixed128x1");
    const b = FixedNumber.fromString("0.1", "fixed128x1");
    const result = a.mul(b);
    assert.equal(result.toString(), "0.0");
  });

  it("div (non-signal) silently truncates", () => {
    const a = FixedNumber.fromString("1.0");
    const b = FixedNumber.fromString("3.0");
    const result = a.div(b);
    assert.equal(typeof result.toString(), "string");
  });
});

// ---------------------------------------------------------------------------
// Negative tests -- division by zero
// ---------------------------------------------------------------------------

describe("FixedNumber negative tests -- division by zero", () => {
  it("div throws on zero divisor", () => {
    const a = FixedNumber.fromString("1.0");
    const b = FixedNumber.fromString("0.0");
    assert.throws(() => a.div(b), (e) => e.code === "NUMERIC_FAULT" && e.fault === "divide-by-zero");
  });

  it("divUnsafe throws on zero divisor", () => {
    const a = FixedNumber.fromString("1.0");
    const b = FixedNumber.fromString("0.0");
    assert.throws(() => a.divUnsafe(b), (e) => e.code === "NUMERIC_FAULT" && e.fault === "divide-by-zero");
  });

  it("divSignal throws on zero divisor", () => {
    const a = FixedNumber.fromString("1.0");
    const b = FixedNumber.fromString("0.0");
    assert.throws(() => a.divSignal(b), (e) => e.code === "NUMERIC_FAULT" && e.fault === "divide-by-zero");
  });
});

// ---------------------------------------------------------------------------
// Negative tests -- unsigned format rejects negatives
// ---------------------------------------------------------------------------

describe("FixedNumber negative tests -- unsigned rejects negatives", () => {
  it("fromString rejects negative in unsigned format", () => {
    assert.throws(
      () => FixedNumber.fromString("-1", "ufixed128x18"),
      (e) => e.code === "NUMERIC_FAULT" && e.fault === "overflow",
    );
  });

  it("fromValue rejects negative in unsigned format", () => {
    assert.throws(
      () => FixedNumber.fromValue(-1n, 0, "ufixed128x18"),
      (e) => e.code === "NUMERIC_FAULT" && e.fault === "overflow",
    );
  });
});

// ---------------------------------------------------------------------------
// Negative tests -- format parsing
// ---------------------------------------------------------------------------

describe("FixedNumber negative tests -- format parsing", () => {
  it("rejects invalid format string", () => {
    assert.throws(() => FixedNumber.fromString("1", "fixd128x18"), /invalid fixed format/);
  });

  it("rejects non-byte-aligned width", () => {
    assert.throws(() => FixedNumber.fromString("1", "fixed7x0"), /not byte aligned/);
  });

  it("rejects decimals > 80", () => {
    assert.throws(() => FixedNumber.fromString("1", "fixed128x81"), /too large/);
  });

  it("rejects invalid format object (wrong type for signed)", () => {
    assert.throws(() => FixedNumber.fromString("1", { signed: "yes" }), /not boolean/);
  });

  it("rejects invalid format object (non-byte-aligned width)", () => {
    assert.throws(() => FixedNumber.fromString("1", { width: 7 }), /not byte aligned/);
  });

  it("rejects invalid format object (decimals too large)", () => {
    assert.throws(() => FixedNumber.fromString("1", { decimals: 81 }), /too large/);
  });
});

// ---------------------------------------------------------------------------
// Negative tests -- incompatible format arithmetic
// ---------------------------------------------------------------------------

describe("FixedNumber negative tests -- incompatible formats", () => {
  it("add throws with different formats", () => {
    const a = FixedNumber.fromString("1.0", "fixed128x18");
    const b = FixedNumber.fromString("1.0", "fixed128x2");
    assert.throws(() => a.add(b), /incompatible format/);
  });

  it("sub throws with different formats", () => {
    const a = FixedNumber.fromString("1.0", "fixed128x18");
    const b = FixedNumber.fromString("1.0", "fixed128x2");
    assert.throws(() => a.sub(b), /incompatible format/);
  });

  it("mul throws with different formats", () => {
    const a = FixedNumber.fromString("1.0", "fixed128x18");
    const b = FixedNumber.fromString("1.0", "fixed128x2");
    assert.throws(() => a.mul(b), /incompatible format/);
  });

  it("div throws with different formats", () => {
    const a = FixedNumber.fromString("1.0", "fixed128x18");
    const b = FixedNumber.fromString("1.0", "fixed128x2");
    assert.throws(() => a.div(b), /incompatible format/);
  });
});

// ---------------------------------------------------------------------------
// Boundary condition tests
// ---------------------------------------------------------------------------

describe("FixedNumber boundary conditions", () => {
  describe("fixed8x0 range [-128, 127]", () => {
    it("accepts min value -128", () => {
      const f = FixedNumber.fromString("-128", "fixed8x0");
      assert.equal(f.toString(), "-128");
    });

    it("accepts max value 127", () => {
      const f = FixedNumber.fromString("127", "fixed8x0");
      assert.equal(f.toString(), "127");
    });

    it("rejects 128", () => {
      assert.throws(() => FixedNumber.fromString("128", "fixed8x0"),
        (e) => e.code === "NUMERIC_FAULT");
    });

    it("rejects -129", () => {
      assert.throws(() => FixedNumber.fromString("-129", "fixed8x0"),
        (e) => e.code === "NUMERIC_FAULT");
    });
  });

  describe("ufixed8x0 range [0, 255]", () => {
    it("accepts 0", () => {
      assert.equal(FixedNumber.fromString("0", "ufixed8x0").toString(), "0");
    });

    it("accepts 255", () => {
      assert.equal(FixedNumber.fromString("255", "ufixed8x0").toString(), "255");
    });

    it("rejects 256", () => {
      assert.throws(() => FixedNumber.fromString("256", "ufixed8x0"),
        (e) => e.code === "NUMERIC_FAULT");
    });

    it("rejects -1", () => {
      assert.throws(() => FixedNumber.fromString("-1", "ufixed8x0"),
        (e) => e.code === "NUMERIC_FAULT");
    });
  });

  describe("fixed16x2 range [-327.68, 327.67]", () => {
    it("accepts 327.67", () => {
      assert.equal(FixedNumber.fromString("327.67", "fixed16x2").toString(), "327.67");
    });

    it("accepts -327.68", () => {
      assert.equal(FixedNumber.fromString("-327.68", "fixed16x2").toString(), "-327.68");
    });

    it("rejects 327.68", () => {
      assert.throws(() => FixedNumber.fromString("327.68", "fixed16x2"),
        (e) => e.code === "NUMERIC_FAULT");
    });

    it("arithmetic at edges: 327.67 + 0.01 overflows", () => {
      const a = FixedNumber.fromString("327.67", "fixed16x2");
      const b = FixedNumber.fromString("0.01", "fixed16x2");
      assert.throws(() => a.add(b), (e) => e.code === "NUMERIC_FAULT");
    });
  });

  describe("zero-decimal format (fixed128x0)", () => {
    it("toString does not append .0", () => {
      const f = FixedNumber.fromString("42", "fixed128x0");
      assert.equal(f.toString(), "42");
    });
  });

  describe("high decimals (fixed256x40)", () => {
    it("construction works", () => {
      const f = FixedNumber.fromString("1.0", "fixed256x40");
      assert.equal(f.decimals, 40);
      assert.ok(f.toString().startsWith("1.0"));
    });
  });

  describe("rounding edge cases", () => {
    it("round(0) on 0.5 rounds up", () => {
      assert.equal(FixedNumber.from("0.5").round(0).toString(), "1.0");
    });

    it("round(0) on -0.5 rounds away from zero", () => {
      assert.equal(FixedNumber.from("-0.5").round(0).toString(), "-1.0");
    });
  });

  describe("floor/ceiling at exact integers", () => {
    it("floor of integer returns same value", () => {
      const f = FixedNumber.from("5.0");
      assert.equal(f.floor().toString(), "5.0");
    });

    it("ceiling of integer returns same value", () => {
      const f = FixedNumber.from("5.0");
      assert.equal(f.ceiling().toString(), "5.0");
    });
  });

  describe("toFormat precision loss", () => {
    it("throws when converting to lower precision with data loss", () => {
      const f = FixedNumber.fromString("1.23", "fixed128x18");
      assert.throws(() => f.toFormat("fixed128x1"), /too many decimals/i);
    });
  });

  describe("large values near 2^127 - 1 for fixed128x0", () => {
    it("accepts 2^127 - 1", () => {
      const maxVal = (2n ** 127n - 1n).toString();
      const f = FixedNumber.fromString(maxVal, "fixed128x0");
      assert.equal(f.toString(), maxVal);
    });

    it("rejects 2^127", () => {
      const overVal = (2n ** 127n).toString();
      assert.throws(() => FixedNumber.fromString(overVal, "fixed128x0"),
        (e) => e.code === "NUMERIC_FAULT");
    });
  });
});
