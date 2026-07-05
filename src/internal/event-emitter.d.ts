export = EventEmitter;
/**
 * @fileoverview Minimal, dependency-free EventEmitter.
 *
 * This mirrors the subset of the Node.js `events.EventEmitter` API used by the
 * SDK's providers and contracts, so the main import path does not depend on the
 * Node built-in `events` module and can run in the browser.
 */
declare class EventEmitter {
    /** @type {Map<string|symbol, Function[]>} */
    _events: Map<string | symbol, Function[]>;
    /**
     * @param {string|symbol} event
     * @param {Function} listener
     * @returns {this}
     */
    addListener(event: string | symbol, listener: Function): this;
    /**
     * @param {string|symbol} event
     * @param {Function} listener
     * @returns {this}
     */
    on(event: string | symbol, listener: Function): this;
    /**
     * @param {string|symbol} event
     * @param {Function} listener
     * @returns {this}
     */
    prependListener(event: string | symbol, listener: Function): this;
    /**
     * @param {string|symbol} event
     * @param {Function} listener
     * @returns {this}
     */
    once(event: string | symbol, listener: Function): this;
    /**
     * @param {string|symbol} event
     * @param {Function} listener
     * @returns {this}
     */
    removeListener(event: string | symbol, listener: Function): this;
    /**
     * @param {string|symbol} event
     * @param {Function} listener
     * @returns {this}
     */
    off(event: string | symbol, listener: Function): this;
    /**
     * @param {(string|symbol)=} event
     * @returns {this}
     */
    removeAllListeners(event?: (string | symbol) | undefined): this;
    /**
     * @param {string|symbol} event
     * @param {...any} args
     * @returns {boolean}
     */
    emit(event: string | symbol, ...args: any[]): boolean;
    /**
     * @param {string|symbol} event
     * @returns {Function[]}
     */
    listeners(event: string | symbol): Function[];
    /**
     * @param {string|symbol} event
     * @returns {number}
     */
    listenerCount(event: string | symbol): number;
    /**
     * @returns {(string|symbol)[]}
     */
    eventNames(): (string | symbol)[];
}
declare namespace EventEmitter {
    export { EventEmitter };
}
