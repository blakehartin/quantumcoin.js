/**
 * @fileoverview ContractFactory implementation.
 */

const qcsdk = require("quantum-coin-js-sdk");
const { Interface } = require("../abi/interface");
const jsAbi = require("../abi/js-abi-coder");
const { Contract } = require("./contract");
const { makeError, assertArgument } = require("../errors");
const { normalizeHex, strip0x, bytesToHex } = require("../internal/hex");
const { getCreateAddress } = require("../utils/address");

function _requireInitialized() {
  // eslint-disable-next-line global-require
  const { isInitialized } = require("../../config");
  if (!isInitialized()) {
    throw makeError("QuantumCoin SDK not initialized. Call Initialize() first.", "UNKNOWN_ERROR", { operation: "contract-factory" });
  }
}

class ContractFactory {
  /**
   * @param {any[]|Interface} abi
   * @param {string} bytecode
   * @param {any} signer
   */
  constructor(abi, bytecode, signer) {
    _requireInitialized();
    this.abi = abi instanceof Interface ? JSON.parse(abi.formatJson()) : abi;
    this.interface = abi instanceof Interface ? abi : new Interface(abi);
    this.bytecode = normalizeHex(bytecode);
    this.signer = signer;
  }

  /**
   * Compute deploy transaction request.
   * @param  {...any} args
   * @returns {import("../providers/provider").TransactionRequest}
   */
  getDeployTransaction(...args) {
    _requireInitialized();
    const ctor = this.interface.getConstructor();
    const ctorInputs = ctor ? ctor.inputs : [];

    // If the constructor includes tuples/structs, use the JS ABI encoder fallback.
    if (jsAbi.hasTuple(ctorInputs)) {
      const enc = jsAbi.encodeTupleLike(ctorInputs, args);
      const data = normalizeHex(this.bytecode + strip0x(bytesToHex(enc)));
      return { to: null, data, value: 0n };
    }

    const normArgs = this.interface._qcsdkNormalizeValues(ctorInputs, args);
    const res = qcsdk.packCreateContractData(this.interface._qcsdkFormatJson(), this.bytecode, ...normArgs);
    if (!res || typeof res.error !== "string") throw makeError("packCreateContractData failed", "UNKNOWN_ERROR", {});
    if (res.error) throw makeError(res.error, "UNKNOWN_ERROR", { operation: "packCreateContractData" });
    return { to: null, data: normalizeHex(res.result), value: 0n };
  }

  /**
   * Deploy contract.
   * @param  {...any} args
   * @returns {Promise<Contract>}
   */
  async deploy(...args) {
    if (!this.signer) throw makeError("missing signer", "UNKNOWN_ERROR", { operation: "deploy" });
    const tx = this.getDeployTransaction(...args);

    // Compute deterministic address from (from, nonce)
    const from =
      typeof this.signer.getAddress === "function"
        ? await this.signer.getAddress()
        : this.signer.address;
    if (typeof from !== "string") throw makeError("unable to resolve deployer address", "UNKNOWN_ERROR", {});

    const provider = this.signer.provider || null;
    if (!provider || typeof provider.getTransactionCount !== "function") {
      throw makeError("missing provider for deploy", "UNKNOWN_ERROR", { operation: "deploy" });
    }

    // Prefer pending nonce to avoid collisions with in-flight transactions.
    let nonce;
    try {
      nonce = await provider.getTransactionCount(from, "pending");
    } catch {
      nonce = await provider.getTransactionCount(from, "latest");
    }
    const address = getCreateAddress({ from, nonce });

    const resp = await this.signer.sendTransaction({ ...tx, nonce });
    const contract = new Contract(address, this.interface, this.signer, this.bytecode);
    contract._deployTx = resp;
    return contract;
  }

  attach(address) {
    return new Contract(address, this.interface, this.signer, this.bytecode);
  }

  connect(signer) {
    return new ContractFactory(this.interface, this.bytecode, signer);
  }
}

module.exports = { ContractFactory };

