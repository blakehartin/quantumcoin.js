/**
 * Copy generated .d.ts from dist/ into src/ so that package types stay in sync
 * with the declarations emitted by `tsc` from JSDoc in the .js sources.
 * Run after `npm run build`.
 */
const fs = require("fs");
const path = require("path");

const distDir = path.join(__dirname, "..", "dist");
const srcDir = path.join(__dirname, "..", "src");

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
    } else {
      fs.copyFileSync(fromPath, toPath);
    }
  }
}

copyRecursive(distDir, srcDir);
console.log("Declarations copied from dist/ to src/.");
