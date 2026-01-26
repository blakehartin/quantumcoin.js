/**
 * @testCategory e2e
 * @blockchainRequired write
 * @transactional true
 *
 * Generates typed SDK packages (TS and JS) for examples/SimpleIERC20.sol (SimpleERC20),
 * stores them under test/e2e/generated-sdks, and runs the generated package tests.
 */

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const { getRpcUrl, getChainId } = require("./helpers");

function getNpmCmd() {
  return process.platform === "win32" ? "npm.cmd" : "npm";
}

function run(cmd, args, cwd, env) {
  const res = spawnSync(cmd, args, {
    cwd,
    env,
    encoding: "utf8",
    stdio: "pipe",
    shell: false,
    windowsHide: true,
  });
  if (res.error) throw res.error;
  return res;
}

function _quoteIfNeeded(s) {
  if (typeof s !== "string") return s;
  return /[ \t"]/g.test(s) ? `"${s.replace(/"/g, '\\"')}"` : s;
}

function runNpm(args, cwd, env) {
  if (process.platform === "win32") {
    const cmd = `${getNpmCmd()} ${args.map(_quoteIfNeeded).join(" ")}`;
    return run("cmd.exe", ["/d", "/s", "/c", cmd], cwd, env);
  }
  return run(getNpmCmd(), args, cwd, env);
}

function assertNoLegacyGenericTypes(pkgRoot, contractName, lang) {
  const srcDir = path.join(pkgRoot, "src");
  const files =
    lang === "ts"
      ? [path.join(srcDir, `${contractName}.ts`)]
      : [path.join(srcDir, `${contractName}.js`), path.join(srcDir, `${contractName}.d.ts`)];
  for (const file of files) {
    const text = fs.readFileSync(file, "utf8");
    assert.equal(/SolidityInputValue\s*</.test(text), false, `${path.basename(file)} still contains SolidityInputValue<>`);
    assert.equal(/SolidityOutputValue\s*</.test(text), false, `${path.basename(file)} still contains SolidityOutputValue<>`);
    assert.equal(/Promise<any>/.test(text), false, `${path.basename(file)} still contains Promise<any>`);
  }
}

describe("SimpleERC20 generated SDKs", () => {
  it("generates TS and JS packages and runs their tests", async (t) => {
    const rpcUrl = getRpcUrl();
    if (!rpcUrl) {
      t.skip("QC_RPC_URL not provided");
      return;
    }

    const chainId = getChainId();
    const repoRoot = path.resolve(__dirname, "..", "..");
    const solPath = path.join(repoRoot, "examples", "SimpleIERC20.sol");
    assert.ok(fs.existsSync(solPath), "missing examples/SimpleIERC20.sol");

    const outBase = path.join(repoRoot, "test", "e2e", "generated-sdks", "simple-erc20");
    fs.mkdirSync(outBase, { recursive: true });

    const mkPkg = (lang) => {
      const pkgName = `simple-erc20-${lang}`;
      const pkgRoot = path.join(outBase, pkgName);
      fs.rmSync(pkgRoot, { recursive: true, force: true });

      const genCli = path.join(repoRoot, "generate-sdk.js");
      const res = run(
        process.execPath,
        [
          genCli,
          "--lang",
          lang,
          "--sol",
          solPath,
          "--name",
          "SimpleERC20",
          "--create-package",
          "--package-dir",
          outBase,
          "--package-name",
          pkgName,
          "--package-description",
          `${lang.toUpperCase()} typed package generated from SimpleIERC20.sol (e2e)`,
          "--package-author",
          "quantumcoin.js test",
          "--package-license",
          "MIT",
          "--package-version",
          "0.0.1",
          "--non-interactive",
        ],
        repoRoot,
        process.env,
      );
      assert.equal(res.status, 0, `generator failed:\n${res.stdout}\n${res.stderr}`);
      return pkgRoot;
    };

    let succeeded = false;
    try {
      const tsPkg = mkPkg("ts");
      const jsPkg = mkPkg("js");

      assertNoLegacyGenericTypes(tsPkg, "SimpleERC20", "ts");
      assertNoLegacyGenericTypes(jsPkg, "SimpleERC20", "js");

      const env = { ...process.env, QC_RPC_URL: rpcUrl, QC_CHAIN_ID: String(chainId) };

      const tsRun = runNpm(["test"], tsPkg, env);
      assert.equal(tsRun.status, 0, `TS package tests failed:\n${tsRun.stdout}\n${tsRun.stderr}`);

      const jsRun = runNpm(["test"], jsPkg, env);
      assert.equal(jsRun.status, 0, `JS package tests failed:\n${jsRun.stdout}\n${jsRun.stderr}`);

      succeeded = true;
    } finally {
      if (succeeded) {
        for (const lang of ["ts", "js"]) {
          const pkgRoot = path.join(outBase, `simple-erc20-${lang}`);
          fs.rmSync(path.join(pkgRoot, "node_modules"), { recursive: true, force: true });
          fs.rmSync(path.join(pkgRoot, "dist"), { recursive: true, force: true });
        }
      }
    }
  }, { timeout: 3_600_000 });
});

