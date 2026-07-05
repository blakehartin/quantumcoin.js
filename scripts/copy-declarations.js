/**
 * Copy generated .d.ts from dist/ into src/ so that package types stay in sync
 * with the declarations emitted by `tsc` from JSDoc in the .js sources.
 * Run after `npm run build`.
 */
const fs = require("fs");
const path = require("path");

const distDir = path.join(__dirname, "..", "dist");
const srcDir = path.join(__dirname, "..", "src");

// Hand-authored declarations that must never be overwritten by tsc output.
// `src/types/index.js` is an empty runtime placeholder, so tsc would emit an
// empty `export {}` and clobber the maintained numeric-type declarations.
//
// `wallet.d.ts` and `fixednumber.d.ts` are hand-maintained because tsc cannot
// reproduce their intended public surface from the sources:
//  - wallet: `signingKey`, `_qcWallet`, `publicKey`, `seed`, and
//    `SigningKey.privateKeyBytes` are defined via non-enumerable
//    `Object.defineProperty` (to keep key material out of JSON/inspect), which
//    tsc's JS declaration emitter does not see, so they would be dropped.
//  - fixednumber: the curated typed signatures plus the exported `BigNumberish`
//    and `FixedFormat` aliases are lost when emitted from the loosely-typed JS.
// Trade-off: future JSDoc changes in these sources will NOT auto-propagate to
// their declarations and must be updated by hand.
const preserve = new Set([
  path.join(srcDir, "types", "index.d.ts"),
  path.join(srcDir, "wallet", "wallet.d.ts"),
  path.join(srcDir, "utils", "fixednumber.d.ts"),
]);

if (!fs.existsSync(distDir)) {
  console.warn("scripts/copy-declarations.js: dist/ not found, run build first.");
  process.exit(0);
}

function copyRecursive(from, to) {
  for (const name of fs.readdirSync(from)) {
    const fromPath = path.join(from, name);
    const toPath = path.join(to, name);
    if (fs.statSync(fromPath).isDirectory()) {
      if (!fs.existsSync(toPath)) fs.mkdirSync(toPath, { recursive: true });
      copyRecursive(fromPath, toPath);
    } else if (!preserve.has(toPath)) {
      fs.copyFileSync(fromPath, toPath);
    }
  }
}

copyRecursive(distDir, srcDir);
console.log("Declarations copied from dist/ to src/.");
