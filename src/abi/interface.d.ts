export class Interface {
    /**
     * @param {any[]|Interface} abi
     */
    constructor(abi: any[] | Interface);
    abi: any;
    _abiJson: string;
    /**
     * Returns JSON format of ABI.
     * @returns {string}
     */
    formatJson(): string;
    /**
     * Basic formatter (ethers supports multiple formats).
     * @param {string=} format
     * @returns {string}
     */
    format(format?: string | undefined): string;
    /**
     * Get a function fragment by name (first match).
     * @param {string} nameOrSignature
     * @returns {FunctionFragment}
     */
    getFunction(nameOrSignature: string): FunctionFragment;
    /**
     * Get an event fragment by name (first match).
     * @param {string} nameOrSignature
     * @returns {EventFragment}
     */
    getEvent(nameOrSignature: string): EventFragment;
    /**
     * Get an error fragment by name (first match).
     * @param {string} nameOrSignature
     * @returns {ErrorFragment}
     */
    getError(nameOrSignature: string): ErrorFragment;
    /**
     * Returns the constructor fragment if present.
     * @returns {ConstructorFragment|null}
     */
    getConstructor(): ConstructorFragment | null;
    /**
     * Encode function data using quantum-coin-js-sdk.
     * @param {FunctionFragment|string} functionFragment
     * @param {any[]} values
     * @returns {string}
     */
    encodeFunctionData(functionFragment: FunctionFragment | string, values: any[]): string;
    /**
     * Decode function result using quantum-coin-js-sdk.
     * @param {FunctionFragment|string} functionFragment
     * @param {string} data
     * @returns {any}
     */
    decodeFunctionResult(functionFragment: FunctionFragment | string, data: string): any;
    /**
     * Encode an event log from values.
     * @param {EventFragment|any} eventFragment
     * @param {any[]} values
     * @returns {{ topics: string[], data: string }}
     */
    encodeEventLog(eventFragment: EventFragment | any, values: any[]): {
        topics: string[];
        data: string;
    };
    /**
     * Decode an event log.
     * @param {EventFragment|any} eventFragment
     * @param {string[]} topics
     * @param {string} data
     * @returns {any}
     */
    decodeEventLog(eventFragment: EventFragment | any, topics: string[], data: string): any;
    parseTransaction(): void;
    parseLog(...args: any[]): {
        fragment: EventFragment;
        name: any;
        signature: any;
        topic: string;
        args: Result;
    };
    parseError(): void;
    getSighash(): void;
    getEventTopic(): void;
    getFallback(): any;
    getReceive(): any;
}
export class AbiCoder {
    /**
     * Encode values by types into ABI data.
     * @param {(string|any)[]} types
     * @param {any[]} values
     * @returns {string}
     */
    encode(types: (string | any)[], values: any[]): string;
  /**
   * Typed ABI encode (Solidity ABI type strings).
   * @param {TTypes} types
   * @param {TValues} values
   */
  encode<TTypes extends readonly import("../types").SolidityTypeName[]>(
    types: TTypes,
    values: { [K in keyof TTypes]: import("../types").SolidityInputValue<TTypes[K]> },
  ): string;
    /**
     * Decode ABI data by output types.
     * @param {(string|any)[]} types
     * @param {string} data
     * @returns {any}
     */
    decode(types: (string | any)[], data: string): any;
  /**
   * Typed ABI decode (Solidity ABI type strings).
   * @param {TTypes} types
   * @param {string} data
   */
  decode<TTypes extends readonly import("../types").SolidityTypeName[]>(
    types: TTypes,
    data: string,
  ): { [K in keyof TTypes]: import("../types").SolidityOutputValue<TTypes[K]> };
    /**
     * Return a default value for types.
     * @param {(string|any)[]} types
     * @returns {any}
     */
    getDefaultValue(types: (string | any)[]): any;
}
import { FunctionFragment } from "./fragments";
import { EventFragment } from "./fragments";
import { ErrorFragment } from "./fragments";
import { ConstructorFragment } from "./fragments";
import { Result } from "../utils/result";
