export class ContractFactory {
    /**
     * @param {any[]|Interface} abi
     * @param {string} bytecode
     * @param {any} signer
     */
    constructor(abi: any[] | Interface, bytecode: string, signer: any);
    abi: any;
    interface: Interface;
    bytecode: string;
    signer: any;
    /**
     * Compute deploy transaction request.
     * @param  {...any} args
     * @returns {import("../providers/provider").TransactionRequest}
     */
    getDeployTransaction(...args: any[]): import("../providers/provider").TransactionRequest;
    /**
     * Deploy contract.
     * @param  {...any} args
     * @returns {Promise<Contract>}
     */
    deploy(...args: any[]): Promise<Contract>;
    attach(address: any): Contract;
    connect(signer: any): ContractFactory;
}
import { Interface } from "../abi/interface";
import { Contract } from "./contract";
