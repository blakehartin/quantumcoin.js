/**
 * SDK Generator example (JavaScript output) - TypeScript.
 * Run: npx tsx examples/example-generator-sdk-js.ts
 * Compiles SimpleIERC20.sol, writes sdk-generator-erc20.inline.json, runs generate-sdk.js --lang js.
 */

import fs from "node:fs";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { logExample } from "../test/verbose-logger";

function compileSimpleErc20({ solcPath, solPath }: { solcPath: string; solPath: string }) {
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

function main(): void {
  const solcPath = process.env.QC_SOLC_PATH || process.env.SOLC_PATH || "c:\\solc\\solc.exe";
  logExample("example-generator-sdk-js.ts", "starting", { solcPath });
  const repoRoot = path.resolve(__dirname, "..");

  if (!fs.existsSync(solcPath)) {
    throw new Error(`solc not found at ${solcPath}. Set QC_SOLC_PATH or SOLC_PATH.`);
  }

  const solPath = path.join(__dirname, "SimpleIERC20.sol");
  const artifactsJsonPath = path.join(__dirname, "sdk-generator-erc20.inline.json");

  const artifact = compileSimpleErc20({ solcPath, solPath });
  logExample("example-generator-sdk-js.ts", "compile SimpleERC20", { contractName: artifact.name });
  fs.writeFileSync(artifactsJsonPath, JSON.stringify([artifact], null, 2) + "\n", "utf8");

  const pkgDir = __dirname;
  const pkgName = "example-generated-sdk-js";
  const pkgRoot = path.join(pkgDir, pkgName);
  if (fs.existsSync(pkgRoot)) {
    fs.rmSync(pkgRoot, { recursive: true, force: true });
  }
  logExample("example-generator-sdk-js.ts", "generate package", { pkgName, pkgRoot });

  const generatorCli = path.join(repoRoot, "generate-sdk.js");
  const res = spawnSync(
    process.execPath,
    [
      generatorCli,
      "--lang", "js",
      "--artifacts-json", artifactsJsonPath,
      "--create-package",
      "--package-dir", pkgDir,
      "--package-name", pkgName,
      "--package-description", "Example generated package (JS output) for sdkgen",
      "--package-author", "QuantumCoin Community",
      "--package-license", "MIT",
      "--package-version", "0.0.1",
      "--non-interactive",
    ],
    { cwd: repoRoot, stdio: "inherit", shell: false, windowsHide: true },
  );

  if (res.error) throw res.error;
  if (res.status !== 0) {
    throw new Error(`Generator failed with exit code ${res.status}`);
  }
  console.log(`\nGenerated JS package at: ${pkgRoot}\n`);
}

main();
