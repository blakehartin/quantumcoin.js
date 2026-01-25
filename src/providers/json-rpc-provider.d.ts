export class JsonRpcProvider extends AbstractProvider {
    /**
     * @param {string=} url RPC endpoint (defaults to Config.rpcEndpoint or https://public.rpc.quantumcoinapi.com)
     * @param {number=} chainId Chain ID (defaults to 123123)
     */
    constructor(url?: string | undefined, chainId?: number | undefined);
    url: string;
    chainId: number;
}
export class JsonRpcApiProvider extends JsonRpcProvider {
}
import { AbstractProvider } from "./provider";
