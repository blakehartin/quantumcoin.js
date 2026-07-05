/**
 * Browser test entry point.
 *
 * This module is bundled by esbuild (see build.js) into a single browser
 * script and executed inside a headless browser by Playwright
 * (platform-agnostic.spec.js). It exercises the platform-agnostic surface of
 * the SDK: crypto helpers (backed by quantum-coin-js-sdk WASM), encoding, RLP,
 * units, addresses, and offline wallet signing.
 *
 * Node-only functionality (IPC provider, filesystem generator, live RPC) is
 * intentionally excluded.
 */

const qc = require("../../index");
const { Initialize } = require("../../config");

function assert(cond, msg) {
  if (!cond) throw new Error(msg || "assertion failed");
}

function bytesToHexLocal(bytes) {
  let out = "0x";
  for (const b of bytes) out += b.toString(16).padStart(2, "0");
  return out;
}

/**
 * @returns {Promise<Array<{name: string, ok: boolean, error?: string}>>}
 */
async function run() {
  /** @type {Array<{name: string, ok: boolean, error?: string}>} */
  const results = [];

  async function test(name, fn) {
    try {
      await fn();
      results.push({ name, ok: true });
    } catch (e) {
      results.push({ name, ok: false, error: (e && (e.stack || e.message)) || String(e) });
    }
  }

  // quantum-coin-js-sdk crypto requires initialization (WASM + Web Crypto).
  const initialized = await Initialize(null);
  await test("Initialize() resolves true in the browser", () => {
    assert(initialized === true, "Initialize did not return true");
  });

  await test("keccak256 of empty bytes matches known digest", () => {
    assert(
      qc.keccak256(new Uint8Array(0)) ===
        "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
      "unexpected keccak256 digest",
    );
  });

  await test("sha256 of 'abc' matches known digest", () => {
    assert(
      qc.sha256(qc.toUtf8Bytes("abc")) ===
        "0xba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
      "unexpected sha256 digest",
    );
  });

  await test("id(Transfer signature) matches ERC20 topic0", () => {
    assert(
      qc.id("Transfer(address,address,uint256)") ===
        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
      "unexpected event topic",
    );
  });

  await test("randomBytes returns the requested length via Web Crypto", () => {
    const b = qc.randomBytes(16);
    assert(b instanceof Uint8Array, "not a Uint8Array");
    assert(b.length === 16, "wrong length");
  });

  await test("computeHmac / pbkdf2 / scryptSync produce hex strings", () => {
    const hmac = qc.computeHmac("sha256", "key", "data");
    assert(typeof hmac === "string" && hmac.startsWith("0x"), "hmac not hex");
    const pk = qc.pbkdf2("password", "salt", 1000, 16, "sha256");
    assert(typeof pk === "string" && pk.startsWith("0x"), "pbkdf2 not hex");
    const sk = qc.scryptSync("password", new Uint8Array([1, 2, 3, 4]), 1024, 8, 1, 16);
    assert(typeof sk === "string" && sk.startsWith("0x"), "scrypt not hex");
  });

  await test("base64 encode/decode roundtrip (no Buffer)", () => {
    const data = qc.toUtf8Bytes("hello quantum world");
    const b64 = qc.encodeBase64(data);
    const back = qc.decodeBase64(b64);
    assert(qc.toUtf8String(back) === "hello quantum world", "base64 roundtrip failed");
  });

  await test("base58 encode/decode roundtrip", () => {
    const data = new Uint8Array([0, 1, 2, 3, 4, 250, 255]);
    const b58 = qc.encodeBase58(data);
    const back = qc.decodeBase58(b58);
    assert(bytesToHexLocal(back) === bytesToHexLocal(data), "base58 roundtrip failed");
  });

  await test("RLP encode/decode roundtrip", () => {
    const encoded = qc.encodeRlp("0x1234");
    const decoded = qc.decodeRlp(encoded);
    assert(decoded === "0x1234", "rlp roundtrip failed");
  });

  await test("parseEther / formatEther", () => {
    assert(qc.parseEther("1") === 10n ** 18n, "parseEther wrong");
    assert(qc.parseEther(qc.formatEther(10n ** 18n)) === 10n ** 18n, "formatEther roundtrip wrong");
  });

  await test("address validation and checksum", () => {
    const addr = "0x" + "ab".repeat(32);
    assert(qc.isAddress(addr) === true, "valid address rejected");
    assert(qc.isAddress("0x1234") === false, "short address accepted");
    assert(typeof qc.getAddress(addr) === "string", "getAddress failed");
  });

  await test("offline wallet: createRandom + signTransaction", async () => {
    const wallet = qc.Wallet.createRandom();
    assert(qc.isAddress(wallet.address) === true, "created wallet address invalid");
    const rawTx = await wallet.signTransaction({
      to: "0x" + "11".repeat(32),
      value: 0n,
      nonce: 0,
      gasLimit: 21000,
      chainId: 123123,
    });
    assert(typeof rawTx === "string" && rawTx.startsWith("0x"), "signed tx not hex");
  });

  return results;
}

const globalScope = typeof window !== "undefined" ? window : globalThis;

run()
  .then((results) => {
    globalScope.__TEST_RESULTS__ = results;
    globalScope.__TEST_DONE__ = true;
  })
  .catch((e) => {
    globalScope.__TEST_RESULTS__ = [
      { name: "harness", ok: false, error: (e && (e.stack || e.message)) || String(e) },
    ];
    globalScope.__TEST_DONE__ = true;
  });
