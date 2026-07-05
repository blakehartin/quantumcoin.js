declare namespace _exports {
    export { GenerateOptions };
}
declare namespace _exports {
    export { generate };
    export { generateFromArtifacts };
    export { generateTransactionalTestJs };
    export { generateAllContractsTransactionalTestJs };
    export { _assertSafeIdentifier as assertSafeIdentifier };
}
export = _exports;
type GenerateOptions = {
    abiPath: string;
    binPath: string;
    outDir: string;
    contractName: string;
    packageName?: string | undefined;
    createPackage?: boolean | undefined;
    dependencies?: Record<string, string> | undefined;
};
/**
 * Generate typed contract files.
 * @param {GenerateOptions} opts
 * @returns {{ contractFile: string, factoryFile: string, typesFile: string, indexFile: string }}
 */
declare function generate(opts: GenerateOptions): {
    contractFile: string;
    factoryFile: string;
    typesFile: string;
    indexFile: string;
};
/**
 * @typedef {Object} GenerateOptions
 * @property {string} abiPath
 * @property {string} binPath
 * @property {string} outDir
 * @property {string} contractName
 * @property {string=} packageName
 * @property {boolean=} createPackage
 * @property {Record<string,string>=} dependencies
 */
/**
 * Generate multiple typed contract files.
 * @param {{ outDir: string, artifacts: Array<{ contractName: string, abi: any[], bytecode: string }> }} opts
 * @returns {{ contracts: Array<{ contractFile: string, factoryFile: string }>, typesFile: string, indexFile: string }}
 */
declare function generateFromArtifacts(opts: {
    outDir: string;
    artifacts: Array<{
        contractName: string;
        abi: any[];
        bytecode: string;
    }>;
}): {
    contracts: Array<{
        contractFile: string;
        factoryFile: string;
    }>;
    typesFile: string;
    indexFile: string;
};
/**
 * Generate a transactional e2e test file (JavaScript) for the typed contract package.
 * The test deploys the contract with constructor args (if any) and invokes one write method.
 *
 * When `bytecode` is omitted, empty, or `"0x"` the contract is treated as an interface:
 * the generated test still attempts the deploy (the receipt-status assertion still validates
 * SDK wrapper wiring) but the post-deploy `provider.getCode(...)` bytecode assertion is
 * skipped, since interfaces deploy with no runtime code by design.
 *
 * @param {{ contractName: string, abi: any[], bytecode?: string }} opts
 * @returns {string}
 */
declare function generateTransactionalTestJs(opts: {
    contractName: string;
    abi: any[];
    bytecode?: string;
}): string;
/**
 * Generate a single transactional e2e test that deploys and invokes methods on ALL contracts.
 * Used when the package has multiple contracts so one test exercises every contract.
 *
 * Accepts `bytecode` per artifact for forward-compatibility, although the multi-contract
 * template currently emits no `getCode` assertion (so the value is not yet consumed).
 *
 * @param {{ artifacts: Array<{ contractName: string, abi: any[], bytecode?: string }> }} opts
 * @returns {string}
 */
declare function generateAllContractsTransactionalTestJs(opts: {
    artifacts: Array<{
        contractName: string;
        abi: any[];
        bytecode?: string;
    }>;
}): string;
/**
 * Assert that `name` is safe to interpolate verbatim into generated source code
 * (class names, function names, type names, require/import specifiers, file names).
 *
 * This is the primary defense against code-injection and path-traversal
 * via attacker-controlled ABI / artifact `name` fields: only strict JS/TS
 * identifiers are allowed, which by construction cannot contain quotes, newlines,
 * path separators, `..`, or other breakout characters.
 *
 * @param {any} name
 * @param {string=} kind  Human-readable description for error messages.
 * @returns {string} the validated name
 */
declare function _assertSafeIdentifier(name: any, kind?: string | undefined): string;
