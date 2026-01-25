declare const _exports: {
    WebSocketProvider: typeof import("./extra-providers").WebSocketProvider;
    IpcSocketProvider: typeof import("./extra-providers").IpcSocketProvider;
    BrowserProvider: typeof import("./extra-providers").BrowserProvider;
    FallbackProvider: typeof import("./extra-providers").FallbackProvider;
    FilterByBlockHash: typeof import("./extra-providers").FilterByBlockHash;
    JsonRpcProvider: typeof import("./json-rpc-provider").JsonRpcProvider;
    JsonRpcApiProvider: typeof import("./json-rpc-provider").JsonRpcApiProvider;
    Provider: typeof import("./provider").Provider;
    AbstractProvider: typeof import("./provider").AbstractProvider;
    Block: typeof import("./provider").Block;
    TransactionResponse: typeof import("./provider").TransactionResponse;
    TransactionReceipt: typeof import("./provider").TransactionReceipt;
    Log: typeof import("./provider").Log;
};
export = _exports;
