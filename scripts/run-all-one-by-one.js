/**
 * Run all tests and examples one by one with process.env (set QC_RPC_URL, QC_SOLC_PATH).
 * Prints a status table at the end.
 * Usage: node scripts/run-all-one-by-one.js
 */
const { spawnSync } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");

const repoRoot = path.resolve(__dirname, "..");
const isWin = process.platform === "win32";

function run(cmd, args, opts = {}) {
  const cwd = opts.cwd || repoRoot;
  const env = { ...process.env, ...opts.env };
  const res = spawnSync(cmd, args, {
    cwd,
    env,
    encoding: "utf8",
    stdio: "pipe",
    shell: false,
    windowsHide: true,
    timeout: opts.timeout ?? 120000,
  });
  return { ...res, status: res.status ?? (res.signal ? 1 : 0) };
}

function runShell(cmdLine, opts = {}) {
  const cwd = opts.cwd || repoRoot;
  const env = { ...process.env, ...opts.env };
  if (isWin) {
    return spawnSync("cmd.exe", ["/d", "/s", "/c", cmdLine], {
      cwd,
      env,
      encoding: "utf8",
      stdio: "pipe",
      windowsHide: true,
      timeout: opts.timeout ?? 120000,
    });
  }
  return spawnSync("sh", ["-c", cmdLine], {
    cwd,
    env,
    encoding: "utf8",
    stdio: "pipe",
    timeout: opts.timeout ?? 120000,
  });
}

const results = [];

function add(name, ok, errMsg = "") {
  results.push({ name, status: ok ? "PASS" : "FAIL", err: errMsg });
  process.stdout.write(ok ? "." : "F");
}

// Unit tests (node --test single file)
const unitDir = path.join(repoRoot, "test", "unit");
const unitFiles = fs.readdirSync(unitDir)
  .filter((f) => f.endsWith(".test.js"))
  .sort();
for (const f of unitFiles) {
  const name = `unit / ${f}`;
  const r = run(process.execPath, ["--test", path.join(unitDir, f)], { timeout: 60000 });
  add(name, r.status === 0, r.stderr || r.stdout);
}

// Integration
const intDir = path.join(repoRoot, "test", "integration");
const intFiles = fs.readdirSync(intDir)
  .filter((f) => f.endsWith(".test.js"))
  .sort();
for (const f of intFiles) {
  const name = `integration / ${f}`;
  const r = run(process.execPath, ["--test", path.join(intDir, f)], { timeout: 60000 });
  add(name, r.status === 0, r.stderr || r.stdout);
}

// Security
const secDir = path.join(repoRoot, "test", "security");
const secFiles = fs.readdirSync(secDir)
  .filter((f) => f.endsWith(".test.js"))
  .sort();
for (const f of secFiles) {
  const name = `security / ${f}`;
  const r = run(process.execPath, ["--test", path.join(secDir, f)], { timeout: 60000 });
  add(name, r.status === 0, r.stderr || r.stdout);
}

// E2E (one by one, longer timeout)
const e2eDir = path.join(repoRoot, "test", "e2e");
const e2eFiles = fs.readdirSync(e2eDir)
  .filter((f) => f.endsWith(".test.js"))
  .sort();
for (const f of e2eFiles) {
  const name = `e2e / ${f}`;
  const r = run(process.execPath, ["--test", "--test-concurrency=1", path.join(e2eDir, f)], { timeout: 180000 });
  add(name, r.status === 0, r.stderr || r.stdout);
}

// Examples (JS)
const examples = [
  ["example.js", [process.execPath, "examples/example.js"]],
  ["wallet-offline.js", [process.execPath, "examples/wallet-offline.js"]],
  ["read-operations.js", [process.execPath, "examples/read-operations.js"]],
  ["events.js", [process.execPath, "examples/events.js"]],
  ["offline-signing.js", [process.execPath, "examples/offline-signing.js"]],
  ["example-generator-sdk-js.js", [process.execPath, "examples/example-generator-sdk-js.js"]],
  ["example-generator-sdk-ts.js", [process.execPath, "examples/example-generator-sdk-ts.js"]],
];
for (const [label, [cmd, ...args]] of examples) {
  const r = run(cmd, args, { timeout: 90000 });
  add(`example / ${label}`, r.status === 0, r.stderr || r.stdout);
}

// Examples (TS via npx tsx)
const examplesTs = [
  "example.ts",
  "wallet-offline.ts",
  "read-operations.ts",
  "events.ts",
  "offline-signing.ts",
  "example-generator-sdk-js.ts",
  "example-generator-sdk-ts.ts",
];
for (const f of examplesTs) {
  const name = `example / ${f}`;
  const r = runShell(`npx tsx examples/${f}`, { timeout: 90000 });
  const status = r.status ?? (r.signal ? 1 : 0);
  add(name, status === 0, r.stderr || r.stdout);
}

// Print table
console.log("\n\n| Category   | Item | Status |");
console.log("|------------|------|--------|");
let lastCat = "";
for (const { name, status } of results) {
  const [cat, item] = name.split(" / ");
  const catDisplay = cat !== lastCat ? cat : "";
  lastCat = cat;
  console.log(`| ${catDisplay.padEnd(10)} | ${item} | ${status} |`);
}
const passed = results.filter((r) => r.status === "PASS").length;
const failed = results.filter((r) => r.status === "FAIL").length;
console.log("\nTotal:", passed, "passed,", failed, "failed.");
if (failed > 0) {
  console.log("\nFailed:");
  results.filter((r) => r.status === "FAIL").forEach((r) => console.log(" -", r.name, "\n", r.err.slice(0, 500)));
  process.exit(1);
}
process.exit(0);
