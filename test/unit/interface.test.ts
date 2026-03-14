/**
 * @testCategory unit
 * @blockchainRequired false
 * @description Interface.parseLog (event decoding) using quantum-coin-js-sdk decodeEventLog
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { Initialize } from "../../config";
import qc from "../../index";
import { logSuite, logTest } from "../verbose-logger";

describe("Interface.parseLog", () => {
  logSuite("Interface.parseLog");
  it("parses an encoded event log and returns LogDescription-like result", async () => {
    logTest("parses an encoded event log and returns LogDescription-like result", {});
    await Initialize(null);

    const abi = [
      {
        name: "Transfer",
        type: "event",
        anonymous: false,
        inputs: [
          { name: "from", type: "address", indexed: true },
          { name: "to", type: "address", indexed: true },
          { name: "value", type: "uint256", indexed: false },
        ],
      },
    ];

    const iface = new qc.Interface(abi);
    const from = qc.Wallet.createRandom().address;
    const to = qc.Wallet.createRandom().address;
    const value = 123n;

    const encoded = iface.encodeEventLog("Transfer", [from, to, value]);
    assert.ok(Array.isArray(encoded.topics) && encoded.topics.length >= 1);
    assert.ok(typeof encoded.data === "string");

    const parsed = iface.parseLog({ topics: encoded.topics, data: encoded.data });
    assert.equal(parsed.name, "Transfer");
    assert.ok(parsed.topic && parsed.topic.startsWith("0x"));
    assert.ok(parsed.signature.includes("Transfer("));

    assert.equal(parsed.args.from.toLowerCase(), from.toLowerCase());
    assert.equal(parsed.args.to.toLowerCase(), to.toLowerCase());
    assert.equal(BigInt(parsed.args.value), value);
    assert.equal(parsed.args[0].toLowerCase(), from.toLowerCase());
    assert.equal(parsed.args[1].toLowerCase(), to.toLowerCase());
    assert.equal(BigInt(parsed.args[2]), value);
  });
});
