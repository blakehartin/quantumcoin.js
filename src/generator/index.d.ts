export type GenerateOptions = {
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
export function generate(opts: GenerateOptions): {
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
export function generateFromArtifacts(opts: {
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
 * When `bytecode` is omitted, empty, or `"0x"` the contract is treated as an interface
 * and the post-deploy `provider.getCode(...)` bytecode assertion is omitted from the
 * generated test (interfaces deploy with no runtime code by design).
 *
 * @param opts
 */
export function generateTransactionalTestJs(opts: {
    contractName: string;
    abi: any[];
    bytecode?: string;
}): string;
/**
 * Generate a single transactional e2e test that deploys and invokes methods on ALL contracts.
 * Used when the package has multiple contracts so one test exercises every contract.
 *
 * Accepts `bytecode` per artifact for forward-compatibility; the multi-contract template
 * currently emits no `getCode` assertion (so the value is not yet consumed).
 *
 * @param opts
 */
export function generateAllContractsTransactionalTestJs(opts: {
    artifacts: Array<{
        contractName: string;
        abi: any[];
        bytecode?: string;
    }>;
}): string;
