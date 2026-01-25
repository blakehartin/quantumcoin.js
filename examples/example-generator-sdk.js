/**
 * SDK Generator example (artifacts JSON input with inline ABI+BIN)
 *
 * What this does:
 * - Compiles `SimpleIERC20.sol` with solc at `c:\solc\solc.exe`
 * - Writes `sdk-generator-erc20.inline.json` that contains hardcoded inline ABI+BIN
 * - Runs the repo's `generate-sdk.js` using `--artifacts-json`
 * - Generates a full typed package scaffold into `examples/example-generated-sdk`
 *
 * Usage (from repo root):
 *   node examples/example-generator-sdk.js
 *
 * Notes:
 * - The generator runs `npm install` inside the generated package (requires internet access).
 */

const fs = require("node:fs");
const path = require("node:path");
const { execFileSync, spawnSync } = require("node:child_process");

function compileSimpleErc20({ solcPath, solPath }) {
  const out = execFileSync(solcPath, ["--optimize", "--combined-json", "abi,bin", solPath], { encoding: "utf8" });
  const parsed = JSON.parse(out);

  const key = Object.keys(parsed.contracts || {}).find((k) => k.endsWith(":SimpleERC20"));
  if (!key) {
    throw new Error(`SimpleERC20 not found in solc output. Contracts: ${Object.keys(parsed.contracts || {}).join(", ")}`);
  }
  const c = parsed.contracts[key];
  const abi = JSON.parse(c.abi);
  const bin = String(c.bin || "");
  if (!bin) throw new Error("solc produced empty bytecode for SimpleERC20");
  const bytecode = bin.startsWith("0x") ? bin : `0x${bin}`;

  return { name: "SimpleERC20", abi, bin: bytecode };
}

function main() {
  const repoRoot = path.resolve(__dirname, "..");
  const solcPath = "c:\\solc\\solc.exe";

  if (!fs.existsSync(solcPath)) {
    throw new Error(`solc not found at ${solcPath}. Install solc there or update examples/example-generator-sdk.js.`);
  }

  const solPath = path.join(__dirname, "SimpleIERC20.sol");
  const artifactsJsonPath = path.join(__dirname, "sdk-generator-erc20.inline.json");

  // 1) Compile and write inline artifacts JSON (ABI array + BIN string).
  const artifact = compileSimpleErc20({ solcPath, solPath });
  fs.writeFileSync(artifactsJsonPath, JSON.stringify([artifact], null, 2) + "\n", "utf8");

  // 2) Generate a new package into examples/example-generated-sdk (delete old one first).
  const pkgDir = __dirname;
  const pkgName = "example-generated-sdk";
  const pkgRoot = path.join(pkgDir, pkgName);
  if (fs.existsSync(pkgRoot)) {
    fs.rmSync(pkgRoot, { recursive: true, force: true });
  }

  const generatorCli = path.join(repoRoot, "generate-sdk.js");
  const res = spawnSync(
    process.execPath,
    [
      generatorCli,
      "--artifacts-json",
      artifactsJsonPath,
      "--create-package",
      "--package-dir",
      pkgDir,
      "--package-name",
      pkgName,
      "--package-description",
      "Example generated package (inline ABI+BIN via artifacts JSON) for quantumcoin-sdk-generator",
      "--package-author",
      "QuantumCoin Community",
      "--package-license",
      "MIT",
      "--package-version",
      "0.0.1",
      "--non-interactive",
    ],
    { cwd: repoRoot, stdio: "inherit", shell: false, windowsHide: true },
  );

  if (res.error) throw res.error;
  if (res.status !== 0) {
    throw new Error(`Generator failed with exit code ${res.status}`);
  }

  // eslint-disable-next-line no-console
  console.log(`\nGenerated package at: ${pkgRoot}\n`);
}

main();

