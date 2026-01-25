/**
 * @fileoverview Minimal ABI fragment classes (ethers.js v6 compatible surface).
 *
 * This SDK keeps fragment handling lightweight and delegates ABI encoding/decoding
 * to `quantum-coin-js-sdk` (WASM).
 */
export class Fragment {
    /**
     * @param {any} fragment
     */
    constructor(fragment: any);
    type: any;
    name: any;
    inputs: any;
    outputs: any;
    stateMutability: any;
    anonymous: any;
    /**
     * Formats the fragment.
     * @param {string=} format
     * @returns {string}
     */
    format(format?: string | undefined): string;
    /**
     * @returns {any}
     */
    toJSON(): any;
}
export class NamedFragment extends Fragment {
}
export class FunctionFragment extends NamedFragment {
}
export class EventFragment extends NamedFragment {
}
export class ErrorFragment extends NamedFragment {
}
export class ConstructorFragment extends Fragment {
}
export class StructFragment extends Fragment {
}
export class FallbackFragment extends Fragment {
}
