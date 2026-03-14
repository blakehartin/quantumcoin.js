/**
 * One-off: encrypt 48/32/36 word phrase wallets with same test password and log JSON.
 * Run: node test/unit/_log-encrypted-jsons.js
 * Then paste the three outputs into address-wallet.test.js as TEST_ENCRYPTED_JSON_48, _32, _36.
 */
const { Initialize } = require("../../config");
const qc = require("../../index");

const PASSWORD = "mySecurePassword123";
const TEST_SEED_WORDS = [
  "cylamidal", "suculate", "sealmate", "radiploid", "equifaxis", "and", "antipoise", "stitchesy", "perelade", "lite",
  "gourtarel", "thursat", "overdrome", "cogulate", "nonviva", "stewnut", "floribund", "enduivist", "decatary", "elvenwort",
  "indoucate", "ravelent", "vocalus", "wetshirt", "rutatory", "percect", "breaktout", "corpation", "myricorus", "veofreat",
  "junkard", "supercarp", "sukerus", "tautang", "facetype", "shishkin", "insulal", "hobstone", "stumbed", "tecutonic",
  "jumplike", "hegwirth", "idea", "bhagatpur", "pavastava", "kukuluan", "mageiline", "extranite",
];

const fs = require("fs");
const path = require("path");

async function main() {
  await Initialize(null);
  const w48 = qc.Wallet.fromPhrase(TEST_SEED_WORDS);
  const w32 = qc.Wallet.fromPhrase(TEST_SEED_WORDS.slice(0, 32));
  const w36 = qc.Wallet.fromPhrase(TEST_SEED_WORDS.slice(0, 36));
  const json48 = w48.encryptSync(PASSWORD);
  const json32 = w32.encryptSync(PASSWORD);
  const json36 = w36.encryptSync(PASSWORD);
  const out = [
    "// 48-word encrypted JSON:",
    JSON.stringify(json48),
    "// 32-word encrypted JSON:",
    JSON.stringify(json32),
    "// 36-word encrypted JSON:",
    JSON.stringify(json36),
  ].join("\n");
  const outPath = path.join(__dirname, "_encrypted-output.txt");
  fs.writeFileSync(outPath, out, "utf8");
  console.log("Wrote", outPath);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
