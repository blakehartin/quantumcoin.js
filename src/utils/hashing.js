/**
 * @fileoverview Hash utilities (ethers.js v6 compatible names).
 *
 * Where possible, we use Node's built-in crypto module. For keccak256,
 * we prefer a native OpenSSL implementation if available, otherwise we
 * fall back to a small pure-JS Keccak-256 implementation.
 */

const crypto = require("crypto");
const { arrayify, bytesToHex, utf8ToBytes } = require("../internal/hex");

const _MASK64 = (1n << 64n) - 1n;

function _rotl64(x, n) {
  const nn = BigInt(n);
  return ((x << nn) | (x >> (64n - nn))) & _MASK64;
}

function _readU64LE(bytes, off) {
  let x = 0n;
  for (let i = 0; i < 8; i++) {
    x |= BigInt(bytes[off + i]) << (8n * BigInt(i));
  }
  return x;
}

function _writeU64LE(out, off, x) {
  let v = x & _MASK64;
  for (let i = 0; i < 8; i++) {
    out[off + i] = Number((v >> (8n * BigInt(i))) & 0xffn);
  }
}

// Keccak-f[1600] round constants
const _RC = [
  0x0000000000000001n, 0x0000000000008082n, 0x800000000000808an, 0x8000000080008000n,
  0x000000000000808bn, 0x0000000080000001n, 0x8000000080008081n, 0x8000000000008009n,
  0x000000000000008an, 0x0000000000000088n, 0x0000000080008009n, 0x000000008000000an,
  0x000000008000808bn, 0x800000000000008bn, 0x8000000000008089n, 0x8000000000008003n,
  0x8000000000008002n, 0x8000000000000080n, 0x000000000000800an, 0x800000008000000an,
  0x8000000080008081n, 0x8000000000008080n, 0x0000000080000001n, 0x8000000080008008n,
];

// Rotation offsets (rho step)
const _R = [
  // Indexed by lane index (x + 5*y) where x,y in [0..4]
  // (This is the standard Keccak rho offsets table, flattened in y-major order.)
  0, 1, 62, 28, 27,
  36, 44, 6, 55, 20,
  3, 10, 43, 25, 39,
  41, 45, 15, 21, 8,
  18, 2, 61, 56, 14,
];

// Pi step mapping: index -> newIndex
const _PI = [
  0, 10, 20, 5, 15,
  16, 1, 11, 21, 6,
  7, 17, 2, 12, 22,
  23, 8, 18, 3, 13,
  14, 24, 9, 19, 4,
];

function _keccakF1600(state) {
  const b = new Array(25);
  const c = new Array(5);
  const d = new Array(5);

  for (let round = 0; round < 24; round++) {
    // Theta
    for (let x = 0; x < 5; x++) {
      c[x] = state[x] ^ state[x + 5] ^ state[x + 10] ^ state[x + 15] ^ state[x + 20];
    }
    for (let x = 0; x < 5; x++) {
      d[x] = c[(x + 4) % 5] ^ _rotl64(c[(x + 1) % 5], 1);
    }
    for (let i = 0; i < 25; i++) {
      state[i] = (state[i] ^ d[i % 5]) & _MASK64;
    }

    // Rho + Pi
    for (let i = 0; i < 25; i++) {
      b[_PI[i]] = _rotl64(state[i], _R[i]);
    }

    // Chi
    for (let y = 0; y < 5; y++) {
      const row = y * 5;
      for (let x = 0; x < 5; x++) {
        state[row + x] = (b[row + x] ^ ((~b[row + ((x + 1) % 5)]) & b[row + ((x + 2) % 5)])) & _MASK64;
      }
    }

    // Iota
    state[0] = (state[0] ^ _RC[round]) & _MASK64;
  }
}

function _keccak256Bytes(bytes) {
  // Keccak-256: rate=1088 bits => 136 bytes
  const rate = 136;
  const outLen = 32;
  const state = new Array(25).fill(0n);

  let offset = 0;
  while (offset + rate <= bytes.length) {
    for (let i = 0; i < rate / 8; i++) {
      state[i] = (state[i] ^ _readU64LE(bytes, offset + i * 8)) & _MASK64;
    }
    _keccakF1600(state);
    offset += rate;
  }

  // Final block + padding (keccak pad10*1 with domain 0x01)
  const block = new Uint8Array(rate);
  const remaining = bytes.length - offset;
  block.set(bytes.slice(offset), 0);
  block[remaining] = 0x01;
  block[rate - 1] |= 0x80;

  for (let i = 0; i < rate / 8; i++) {
    state[i] = (state[i] ^ _readU64LE(block, i * 8)) & _MASK64;
  }
  _keccakF1600(state);

  const out = new Uint8Array(outLen);
  let outOff = 0;
  let lane = 0;
  while (outOff < outLen) {
    const tmp = new Uint8Array(8);
    _writeU64LE(tmp, 0, state[lane]);
    const take = Math.min(8, outLen - outOff);
    out.set(tmp.slice(0, take), outOff);
    outOff += take;
    lane++;
  }
  return out;
}

function _hash(alg, data) {
  const bytes = arrayify(data);
  return bytesToHex(crypto.createHash(alg).update(Buffer.from(bytes)).digest());
}

/**
 * keccak256 hash of BytesLike.
 * @param {string|Uint8Array} data
 * @returns {string}
 */
function keccak256(data) {
  const bytes = arrayify(data);
  const hashes = crypto.getHashes();

  // Prefer native keccak if available (varies by Node/OpenSSL build).
  if (hashes.includes("keccak256")) {
    return bytesToHex(crypto.createHash("keccak256").update(Buffer.from(bytes)).digest());
  }
  if (hashes.includes("keccak-256")) {
    return bytesToHex(crypto.createHash("keccak-256").update(Buffer.from(bytes)).digest());
  }

  // Fallback: pure JS Keccak-256
  return bytesToHex(_keccak256Bytes(bytes));
}

/**
 * sha256 hash of BytesLike.
 * @param {string|Uint8Array} data
 * @returns {string}
 */
function sha256(data) {
  return _hash("sha256", data);
}

/**
 * sha512 hash of BytesLike.
 * @param {string|Uint8Array} data
 * @returns {string}
 */
function sha512(data) {
  return _hash("sha512", data);
}

/**
 * ripemd160 hash of BytesLike.
 * @param {string|Uint8Array} data
 * @returns {string}
 */
function ripemd160(data) {
  return _hash("ripemd160", data);
}

/**
 * ethers-style id(text) => keccak256(utf8Bytes(text))
 * @param {string} text
 * @returns {string}
 */
function id(text) {
  return keccak256(utf8ToBytes(text));
}

/**
 * Generate cryptographically strong random bytes.
 * @param {number} length
 * @returns {Uint8Array}
 */
function randomBytes(length) {
  return new Uint8Array(crypto.randomBytes(length));
}

/**
 * Compute HMAC over data.
 * @param {string} algorithm
 * @param {string|Uint8Array} key
 * @param {string|Uint8Array} data
 * @returns {string}
 */
function computeHmac(algorithm, key, data) {
  const k = arrayify(key);
  const d = arrayify(data);
  const h = crypto.createHmac(algorithm, Buffer.from(k)).update(Buffer.from(d)).digest();
  return bytesToHex(new Uint8Array(h));
}

/**
 * PBKDF2 (sync) helper returning hex string.
 * @param {string|Uint8Array} password
 * @param {string|Uint8Array} salt
 * @param {number} iterations
 * @param {number} keylen
 * @param {string=} algorithm
 * @returns {string}
 */
function pbkdf2(password, salt, iterations, keylen, algorithm) {
  const p = arrayify(password);
  const s = arrayify(salt);
  const a = algorithm || "sha256";
  const out = crypto.pbkdf2Sync(Buffer.from(p), Buffer.from(s), iterations, keylen, a);
  return bytesToHex(new Uint8Array(out));
}

/**
 * scrypt (async) helper returning hex string.
 * @param {string|Uint8Array} password
 * @param {string|Uint8Array} salt
 * @param {number} N
 * @param {number} r
 * @param {number} p
 * @param {number} dkLen
 * @returns {Promise<string>}
 */
function scrypt(password, salt, N, r, p, dkLen) {
  const pw = arrayify(password);
  const sa = arrayify(salt);
  return new Promise((resolve, reject) => {
    crypto.scrypt(
      Buffer.from(pw),
      Buffer.from(sa),
      dkLen,
      { N, r, p, maxmem: 128 * 1024 * 1024 },
      (err, derived) => {
        if (err) return reject(err);
        resolve(bytesToHex(new Uint8Array(derived)));
      },
    );
  });
}

/**
 * scrypt (sync) helper returning hex string.
 * @param {string|Uint8Array} password
 * @param {string|Uint8Array} salt
 * @param {number} N
 * @param {number} r
 * @param {number} p
 * @param {number} dkLen
 * @returns {string}
 */
function scryptSync(password, salt, N, r, p, dkLen) {
  const pw = arrayify(password);
  const sa = arrayify(salt);
  const out = crypto.scryptSync(Buffer.from(pw), Buffer.from(sa), dkLen, { N, r, p, maxmem: 128 * 1024 * 1024 });
  return bytesToHex(new Uint8Array(out));
}

module.exports = {
  keccak256,
  sha256,
  sha512,
  ripemd160,
  id,
  randomBytes,
  computeHmac,
  pbkdf2,
  scrypt,
  scryptSync,
};

