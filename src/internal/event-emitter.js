/**
 * @fileoverview Minimal, dependency-free EventEmitter.
 *
 * This mirrors the subset of the Node.js `events.EventEmitter` API used by the
 * SDK's providers and contracts, so the main import path does not depend on the
 * Node built-in `events` module and can run in the browser.
 */

class EventEmitter {
  constructor() {
    /** @type {Map<string|symbol, Function[]>} */
    this._events = new Map();
  }

  /**
   * @param {string|symbol} event
   * @param {Function} listener
   * @returns {this}
   */
  addListener(event, listener) {
    return this.on(event, listener);
  }

  /**
   * @param {string|symbol} event
   * @param {Function} listener
   * @returns {this}
   */
  on(event, listener) {
    if (typeof listener !== "function") throw new TypeError("listener must be a function");
    const list = this._events.get(event);
    if (list) list.push(listener);
    else this._events.set(event, [listener]);
    return this;
  }

  /**
   * @param {string|symbol} event
   * @param {Function} listener
   * @returns {this}
   */
  prependListener(event, listener) {
    if (typeof listener !== "function") throw new TypeError("listener must be a function");
    const list = this._events.get(event);
    if (list) list.unshift(listener);
    else this._events.set(event, [listener]);
    return this;
  }

  /**
   * @param {string|symbol} event
   * @param {Function} listener
   * @returns {this}
   */
  once(event, listener) {
    if (typeof listener !== "function") throw new TypeError("listener must be a function");
    const wrapper = (...args) => {
      this.removeListener(event, wrapper);
      listener.apply(this, args);
    };
    // Preserve a reference so removeListener(original) also works.
    wrapper.listener = listener;
    return this.on(event, wrapper);
  }

  /**
   * @param {string|symbol} event
   * @param {Function} listener
   * @returns {this}
   */
  removeListener(event, listener) {
    const list = this._events.get(event);
    if (!list) return this;
    for (let i = list.length - 1; i >= 0; i--) {
      if (list[i] === listener || list[i].listener === listener) {
        list.splice(i, 1);
      }
    }
    if (list.length === 0) this._events.delete(event);
    return this;
  }

  /**
   * @param {string|symbol} event
   * @param {Function} listener
   * @returns {this}
   */
  off(event, listener) {
    return this.removeListener(event, listener);
  }

  /**
   * @param {(string|symbol)=} event
   * @returns {this}
   */
  removeAllListeners(event) {
    if (event === undefined) this._events.clear();
    else this._events.delete(event);
    return this;
  }

  /**
   * @param {string|symbol} event
   * @param {...any} args
   * @returns {boolean}
   */
  emit(event, ...args) {
    const list = this._events.get(event);
    if (!list || list.length === 0) return false;
    // Copy to tolerate mutation (e.g. once listeners) during iteration.
    for (const listener of list.slice()) {
      listener.apply(this, args);
    }
    return true;
  }

  /**
   * @param {string|symbol} event
   * @returns {Function[]}
   */
  listeners(event) {
    const list = this._events.get(event);
    return list ? list.slice() : [];
  }

  /**
   * @param {string|symbol} event
   * @returns {number}
   */
  listenerCount(event) {
    const list = this._events.get(event);
    return list ? list.length : 0;
  }

  /**
   * @returns {(string|symbol)[]}
   */
  eventNames() {
    return Array.from(this._events.keys());
  }
}

module.exports = EventEmitter;
module.exports.EventEmitter = EventEmitter;
