/**
 * @fileoverview Wallet and signer implementations.
 *
 * The QuantumCoin.js wallet model mirrors ethers.js v6:
 * - AbstractSigner -> BaseWallet -> Wallet
 * - NonceManager wrapper
 *
 * Cryptographic operations are delegated to `quantum-coin-js-sdk` and its
 * PQC signing library.
 */

const qcsdk = require("quantum-coin-js-sdk");
const path = require("node:path");
const { JsonRpcProvider } = require("../providers/json-rpc-provider");
const { assertArgument, makeError } = require("../errors");
const { arrayify, bytesToHex, hexToBytes, isHexString, normalizeHex, utf8ToBytes } = require("../internal/hex");
const { sha256 } = require("../utils/hashing");
const { getAddress } = require("../utils/address");
const { WeiPerEther } = require("../constants");

function _requireInitialized() {
  // eslint-disable-next-line global-require
  const { isInitialized } = require("../../config");
  if (!isInitialized()) {
    throw makeError("QuantumCoin SDK not initialized. Call Initialize() first.", "UNKNOWN_ERROR", { operation: "wallet" });
  }
}

function _getPqc() {
  // Prefer the PQC SDK installed as a direct dependency.
  // (Some environments may also bundle it under quantum-coin-js-sdk.)
  try {
    // eslint-disable-next-line global-require
    return require("quantum-coin-pqc-js-sdk");
  } catch (e1) {
    try {
      // Prefer the PQC SDK version bundled with quantum-coin-js-sdk, since that
      // combination is known to work together.
      const sdkEntry = require.resolve("quantum-coin-js-sdk");
      const sdkDir = path.dirname(sdkEntry);
      // eslint-disable-next-line global-require, import/no-dynamic-require
      return require(path.join(sdkDir, "node_modules", "quantum-coin-pqc-js-sdk"));
    } catch (e2) {
      throw makeError("PQC SDK not found. Ensure quantum-coin-pqc-js-sdk is installed.", "MODULE_NOT_FOUND", {
        operation: "wallet._getPqc",
        errors: [String(e1 && e1.message ? e1.message : e1), String(e2 && e2.message ? e2.message : e2)],
      });
    }
  }
}

function _bytesToNumberArray(bytes) {
  return Array.from(bytes);
}

function _hexToNumberArray(hex) {
  return _bytesToNumberArray(hexToBytes(hex));
}

/**
 * SigningKey wrapper (PQC private/public key bytes).
 */
class SigningKey {
  /**
   * @param {Uint8Array} privateKeyBytes
   * @param {Uint8Array} publicKeyBytes
   */
  constructor(privateKeyBytes, publicKeyBytes) {
    this.privateKeyBytes = new Uint8Array(privateKeyBytes);
    this.publicKeyBytes = new Uint8Array(publicKeyBytes);
  }
}

/**
 * AbstractSigner base (minimal).
 */
class AbstractSigner {
  /**
   * @param {import("../providers/provider").AbstractProvider|null} provider
   */
  constructor(provider) {
    this.provider = provider || null;
  }

  async getAddress() {
    throw makeError("getAddress not implemented", "NOT_IMPLEMENTED", {});
  }
}

/**
 * BaseWallet - core signing implementation.
 */
class BaseWallet extends AbstractSigner {
  /**
   * @param {SigningKey} signingKey
   * @param {import("../providers/provider").AbstractProvider|null=} provider
   * @param {{ address: string }=} precomputed
   * @param {any=} qcWallet Internal quantum-coin-js-sdk Wallet (optional)
   */
  constructor(signingKey, provider, precomputed, qcWallet) {
    super(provider || null);
    _requireInitialized();
    this.signingKey = signingKey;
    this._qcWallet = qcWallet || null;

    /** @type {string} */
    this.address = precomputed?.address || "";

    Object.defineProperty(this, "privateKey", {
      enumerable: true,
      get: () => bytesToHex(this.signingKey.privateKeyBytes),
    });
  }

  async getAddress() {
    return this.address;
  }

  /**
   * Sign a message synchronously.
   * Signature format: combined publicKey+signature as a hex string.
   * @param {string|Uint8Array} message
   * @returns {string}
   */
  signMessageSync(message) {
    _requireInitialized();
    const pqc = _getPqc();
    const msgBytes = typeof message === "string" ? utf8ToBytes(message) : arrayify(message);
    const digestHex = sha256(msgBytes);
    const digest = _hexToNumberArray(digestHex);
    const sig = pqc.cryptoSign(digest, _bytesToNumberArray(this.signingKey.privateKeyBytes));
    const combined = qcsdk.combinePublicKeySignature(
      _bytesToNumberArray(this.signingKey.publicKeyBytes),
      sig,
    );
    if (typeof combined !== "string") throw makeError("combinePublicKeySignature failed", "UNKNOWN_ERROR", {});
    return normalizeHex(combined);
  }

  /**
   * Sign a transaction using quantum-coin-js-sdk signRawTransaction().
   * @param {import("../providers/provider").TransactionRequest} tx
   * @returns {Promise<string>}
   */
  async signTransaction(tx) {
    _requireInitialized();
    assertArgument(tx && typeof tx === "object", "invalid tx", "tx", tx);

    const toAddress = tx.to == null ? null : getAddress(tx.to);
    const valueInWei =
      tx.value == null
        ? 0n
        : typeof tx.value === "bigint"
          ? tx.value
          : typeof tx.value === "number"
            ? BigInt(tx.value)
            : typeof tx.value === "string"
              ? BigInt(tx.value.startsWith("0x") ? tx.value : tx.value)
              : 0n;

    const gasLimit =
      tx.gasLimit == null
        ? 21000
        : typeof tx.gasLimit === "bigint"
          ? Number(tx.gasLimit)
          : typeof tx.gasLimit === "number"
            ? tx.gasLimit
            : typeof tx.gasLimit === "string"
              ? Number(BigInt(tx.gasLimit))
              : 21000;

    const data = tx.data == null ? null : normalizeHex(tx.data);
    const remarks = tx.remarks == null ? null : normalizeHex(tx.remarks);

    if (remarks != null) {
      assertArgument(isHexString(remarks), "remarks must be hex string", "remarks", remarks);
      const remarkBytes = hexToBytes(remarks);
      assertArgument(remarkBytes.length <= 32, "remarks too long (max 32 bytes)", "remarks", remarks);
    }

    // Nonce must be provided or resolved from provider.
    let nonce = tx.nonce;
    if (nonce == null) {
      if (!this.provider) throw makeError("missing provider to resolve nonce", "UNKNOWN_ERROR", { operation: "signTransaction" });
      // Prefer pending to avoid nonce collisions with in-flight transactions.
      try {
        nonce = await this.provider.getTransactionCount(this.address, "pending");
      } catch {
        nonce = await this.provider.getTransactionCount(this.address, "latest");
      }
    }
    assertArgument(Number.isInteger(nonce) && nonce >= 0, "invalid nonce", "nonce", nonce);

    const chainId = tx.chainId != null ? tx.chainId : (this.provider && this.provider.chainId != null ? this.provider.chainId : null);

    /** @type {any} */
    const qcWallet =
      this._qcWallet ||
      new qcsdk.Wallet(
        this.address,
        _bytesToNumberArray(this.signingKey.privateKeyBytes),
        _bytesToNumberArray(this.signingKey.publicKeyBytes),
      );

    const req = new qcsdk.TransactionSigningRequest(
      qcWallet,
      toAddress,
      valueInWei,
      nonce,
      data,
      gasLimit,
      remarks,
      chainId,
    );
    const signResult = qcsdk.signRawTransaction(req);
    // quantum-coin-js-sdk returns a SignResult object: { resultCode, txnHash, txnData }
    if (!signResult || typeof signResult !== "object") {
      throw makeError("signRawTransaction failed", "UNKNOWN_ERROR", {});
    }
    if (typeof signResult.resultCode === "number" && signResult.resultCode !== 0) {
      throw makeError("signRawTransaction failed", "UNKNOWN_ERROR", {
        resultCode: signResult.resultCode,
        hash: signResult.txnHash || null,
      });
    }
    const raw = signResult.txnData;
    if (typeof raw !== "string") throw makeError("signRawTransaction did not return txnData", "UNKNOWN_ERROR", {});
    return normalizeHex(raw);
  }

  /**
   * Signs and sends a transaction.
   * @param {import("../providers/provider").TransactionRequest} tx
   * @returns {Promise<import("../providers/provider").TransactionResponse>}
   */
  async sendTransaction(tx) {
    if (!this.provider) throw makeError("missing provider", "UNKNOWN_ERROR", { operation: "sendTransaction" });
    const raw = await this.signTransaction({ ...tx, from: this.address });
    return this.provider.sendTransaction(raw);
  }
}

/**
 * Wallet - convenience methods around BaseWallet.
 */
class Wallet extends BaseWallet {
  /**
   * @param {string|Uint8Array|SigningKey} key
   * @param {import("../providers/provider").AbstractProvider=} provider
   */
  constructor(key, provider) {
    _requireInitialized();

    let signingKey;
    let qcAddress;

    if (key instanceof SigningKey) {
      signingKey = key;
      // Compute address from public key
      const addr = qcsdk.addressFromPublicKey(_bytesToNumberArray(signingKey.publicKeyBytes));
      if (typeof addr !== "string") throw makeError("addressFromPublicKey failed", "UNKNOWN_ERROR", {});
      qcAddress = normalizeHex(addr);
    } else {
      const privBytes = typeof key === "string" ? hexToBytes(key) : arrayify(key);
      const pubHex = qcsdk.publicKeyFromPrivateKey(_bytesToNumberArray(privBytes));
      if (typeof pubHex !== "string") throw makeError("publicKeyFromPrivateKey failed", "UNKNOWN_ERROR", {});
      const pubBytes = hexToBytes(pubHex);
      const addr = qcsdk.addressFromPublicKey(_bytesToNumberArray(pubBytes));
      if (typeof addr !== "string") throw makeError("addressFromPublicKey failed", "UNKNOWN_ERROR", {});
      qcAddress = normalizeHex(addr);
      signingKey = new SigningKey(privBytes, pubBytes);
    }

    /** @type {any} */
    const qcWallet = new qcsdk.Wallet(
      qcAddress,
      _bytesToNumberArray(signingKey.privateKeyBytes),
      _bytesToNumberArray(signingKey.publicKeyBytes),
    );

    super(signingKey, provider || null, { address: qcAddress }, qcWallet);
  }

  /**
   * Returns wallet address (sync).
   * @returns {string}
   */
  getAddress() {
    return this.address;
  }

  /**
   * Returns wallet balance.
   * @param {string=} blockTag
   * @returns {Promise<bigint>}
   */
  async getBalance(blockTag) {
    if (!this.provider) throw makeError("missing provider", "UNKNOWN_ERROR", { operation: "getBalance" });
    void blockTag;
    return this.provider.getBalance(this.address);
  }

  /**
   * Returns wallet nonce.
   * @param {string=} blockTag
   * @returns {Promise<number>}
   */
  async getTransactionCount(blockTag) {
    if (!this.provider) throw makeError("missing provider", "UNKNOWN_ERROR", { operation: "getTransactionCount" });
    return this.provider.getTransactionCount(this.address, blockTag);
  }

  /**
   * Encrypts and serializes this wallet to JSON.
   * @param {string|Uint8Array} password
   * @returns {string}
   */
  encryptSync(password) {
    _requireInitialized();
    const pw = typeof password === "string" ? password : Buffer.from(arrayify(password)).toString("utf8");
    const json = qcsdk.serializeEncryptedWallet(this._qcWallet, pw);
    if (typeof json !== "string") throw makeError("serializeEncryptedWallet failed", "UNKNOWN_ERROR", {});
    return json;
  }

  /**
   * Returns a new wallet connected to a provider.
   * @param {import("../providers/provider").AbstractProvider} provider
   * @returns {Wallet}
   */
  connect(provider) {
    return new Wallet(this.signingKey, provider);
  }

  /**
   * Creates a new random wallet.
   * @param {import("../providers/provider").AbstractProvider=} provider
   * @returns {Wallet}
   */
  static createRandom(provider) {
    _requireInitialized();
    const qcWallet = qcsdk.newWallet();
    if (!qcWallet) throw makeError("newWallet failed", "UNKNOWN_ERROR", {});
    return Wallet._fromQcWallet(qcWallet, provider || null);
  }

  /**
   * Creates a wallet from an encrypted JSON string.
   * @param {string} json
   * @param {string} password
   * @param {import("../providers/provider").AbstractProvider=} provider
   * @returns {Wallet}
   */
  static fromEncryptedJsonSync(json, password, provider) {
    _requireInitialized();
    const qcWallet = qcsdk.deserializeEncryptedWallet(json, password);
    if (!qcWallet) throw makeError("deserializeEncryptedWallet failed", "UNKNOWN_ERROR", {});
    return Wallet._fromQcWallet(qcWallet, provider || null);
  }

  /**
   * Creates a wallet from a seed phrase (48 words).
   * @param {string|string[]} phrase
   * @param {import("../providers/provider").AbstractProvider=} provider
   * @returns {Wallet}
   */
  static fromPhrase(phrase, provider) {
    _requireInitialized();
    let words = phrase;
    if (typeof phrase === "string") {
      words = phrase
        .split(/[,\s]+/g)
        .map((w) => w.trim())
        .filter(Boolean);
    }
    assertArgument(Array.isArray(words), "phrase must be a string or string[]", "phrase", phrase);
    assertArgument(words.length === 48, "seed phrase must contain exactly 48 words", "phrase", words.length);
    const qcWallet = qcsdk.openWalletFromSeedWords(words);
    if (!qcWallet) throw makeError("openWalletFromSeedWords failed", "UNKNOWN_ERROR", {});
    return Wallet._fromQcWallet(qcWallet, provider || null);
  }

  /**
   * Internal helper: build a Wallet from a quantum-coin-js-sdk Wallet object.
   * @param {any} qcWallet
   * @param {import("../providers/provider").AbstractProvider|null} provider
   * @returns {Wallet}
   */
  static _fromQcWallet(qcWallet, provider) {
    // Preserve key material from quantum-coin-js-sdk Wallet.
    // newWallet() returns Uint8Array keys; other constructors may return number[].
    const privSrc = qcWallet.privateKey;
    const pubSrc = qcWallet.publicKey;

    const privBytes =
      privSrc instanceof Uint8Array ? new Uint8Array(privSrc) : Uint8Array.from(Array.from(privSrc || []).map((n) => (Number(n) & 0xff)));
    const pubBytes =
      pubSrc instanceof Uint8Array ? new Uint8Array(pubSrc) : Uint8Array.from(Array.from(pubSrc || []).map((n) => (Number(n) & 0xff)));
    const key = new SigningKey(privBytes, pubBytes);

    const w = new Wallet(key, provider || null);
    // Ensure we keep the exact underlying qcWallet for operations like encrypt/signRawTransaction.
    w._qcWallet = qcWallet;
    if (typeof qcWallet.address === "string") {
      w.address = normalizeHex(qcWallet.address);
    }
    return w;
  }
}

/**
 * NonceManager wrapper.
 */
class NonceManager extends AbstractSigner {
  /**
   * @param {AbstractSigner} signer
   */
  constructor(signer) {
    super(signer.provider || null);
    this.signer = signer;
    this._nonce = null;
  }

  async getAddress() {
    return this.signer.getAddress();
  }

  async getTransactionCount(blockTag) {
    if (this._nonce != null) return this._nonce;
    if (!this.provider) throw makeError("missing provider", "UNKNOWN_ERROR", { operation: "getTransactionCount" });
    const address = await this.getAddress();
    this._nonce = await this.provider.getTransactionCount(address, blockTag);
    return this._nonce;
  }

  async sendTransaction(tx) {
    const nonce = await this.getTransactionCount("latest");
    const result = await this.signer.sendTransaction({ ...tx, nonce });
    this._nonce = nonce + 1;
    return result;
  }

  reset() {
    this._nonce = null;
  }

  increment() {
    if (this._nonce == null) this._nonce = 0;
    this._nonce++;
  }
}

/**
 * JsonRpcSigner placeholder (ethers-like).
 * This SDK encourages using Wallet directly for signing.
 */
class JsonRpcSigner extends AbstractSigner {
  constructor(provider, address) {
    super(provider);
    this._address = address;
  }
  async getAddress() {
    return this._address;
  }
}

/**
 * VoidSigner (cannot sign, only provides address).
 */
class VoidSigner extends AbstractSigner {
  constructor(address, provider) {
    super(provider || null);
    this._address = getAddress(address);
  }
  async getAddress() {
    return this._address;
  }
}

module.exports = {
  SigningKey,
  AbstractSigner,
  BaseWallet,
  Wallet,
  NonceManager,
  JsonRpcSigner,
  VoidSigner,
};

