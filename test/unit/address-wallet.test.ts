/**
 * @testCategory unit
 * @blockchainRequired false
 * @transactional false
 * @description Wallet functionality: constructors, static factories, encryption, signing, nonce management (offline)
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { Initialize } from "../../config";
import qc from "../../index";
import { logSuite, logTest, logAddress } from "../verbose-logger";
import {
  TEST_ENCRYPTED_JSON_48,
  TEST_ENCRYPTED_JSON_32,
  TEST_ENCRYPTED_JSON_36,
} from "./fixtures/encrypted-keystores-48-32-36";

describe("Address + Wallet (offline)", () => {
  logSuite("Address + Wallet (offline)");
  const TEST_WALLET_ENCRYPTED_JSON =
    "{\"address\":\"1a846abe71c8b989e8337c55d608be81c28ab3b2e40c83eaa2a68d516049aec6\",\"crypto\":{\"cipher\":\"aes-256-ctr\",\"ciphertext\":\"ab7e620dd66cb55ac201b9c6796de92bbb06f3681b5932eabe099871f1f7d79acabe30921a39ad13bfe74f42c515734882b6723760142aa3e26e011df514a534ae47bd15d86badd9c6f17c48d4c892711d54d441ee3a0ee0e5b060f816e79c7badd13ff4c235934b1986774223ecf6e8761388969bb239c759b54c8c70e6a2e27c93a4b70129c8159f461d271ae8f3573414c78b88e4d0abfa6365ed45456636d4ed971c7a0c6b84e6f0c2621e819268b135e2bcc169a54d1847b39e6ba2ae8ec969b69f330b7db9e785ed02204d5a1185915ae5338b0f40ef2a7f4d5aaf7563d502135e57f4eb89d5ec1efa5c77e374969d6cd85be625a2ed1225d68ecdd84067bfc69adb83ecd5c6050472eca28a5a646fcdd28077165c629975bec8a79fe1457cb53389b788b25e1f8eff8b2ca326d7dfcaba3f8839225a08057c018a458891fd2caa0d2b27632cffd80f592147ccec9a10dc8a08a48fb55047bff5cf85cda39eb089096bef63842fc3686412f298a54a9e4b0bf4ad36907ba373cbd6d32e7ac494af371da5aa9d38a3463220865114c4adc5e4ac258ba9c6af9fa2ddfd1aec2e16887e4b3977c69561df8599ac9d411c9dd2a4d57f92ea4e5c02aae3f49fb3bc83e16673e6c2dbe96bb181c8dfd0f9757ade2e4ff27215a836058c5ffeab042f6f97c7c02339f76a6284680e01b4bb733690eb3347fbfcc26614b8bf755f9dfce3fea9d4e4d15b164983201732c2e87593a86bca6da6972e128490338f76ae68135888070f4e59e90db54d23834769bdbda9769213faf5357f9167a224523975a946367b68f0cec98658575609f58bfd329e420a921c06713326e4cb20a0df1d77f37e78a320a637a96c604ca3fa89e24beb42313751b8f09b14f9c14c77e4fd13fc6382505d27c771bca0d821ec7c3765acffa99d83c50140a56b0b28101c762bd682fe55cb6f23cbeb3f421d7b36021010e45ac27160dd7ead99c864a1b550c7edb1246950fe32dcc049799f9085287f0a747a6ef7a023df46a23a22f3e833bbf8d404f84344870492658256ee1dfc40fda33bb8d48fc72d4520ba9fc820c9123104a045206809037709f2a5f6723fa77d6bac5a573823d4ec3a7f1cb786a52ee2697e622e5d75962fa554d1024a6c355e21f33a63b2b72e6c4742a8b1c373aa532b40518c38c90b5373c2eb8c9d7be2a9e16047a3ee09dc9a6849deac5183ace6cfe91a9bef2ffc0a7df6ccebfd4c858c84b0e0355650d7466971e66f1e3883013e5ad1be33199b1d110b79070ac1b745ccb14cf63a08f8cca3a21c9525e626ff5f0c34746e10750fb742ad51f11f2acae3676c2111853d7250d01b77821a6ba9e04400ba2c543ca9f2d701ae6f47bfad14ffe3039ee9e71f7b2401359ade9938750ddb9c5a8b018a7929ed8d0e717ff1861446ce17535e9b17c187711190aae3388bd9490837a636c25ed4d42d7079ad1a51e13292c683d5d012abcf46965c534b83ab53f2c1f0cf5830ef7582e06863a33c19a70511df632885d63245965047ea96b56f1af5b3b94a54999f784fb9574fdfcd7c1230e07a2aaa04acd3097b2b9f8ddba05ae9734491deb5c1a513c76ed276cb78bbf4839dae3156d76af444a5805129d5df791167a9c8576a1d7f760b2d2797c4658669608706fbd0ace1be2346f74862dfc9ef518e55632e43c043186e5d070deb34d12fb9e5aba84e5cb50213dc88efd39cc35bf42455aa82d5e3b707b3140be3b8623b34fdd81d08615c188ae8438a13881fdf6bf32f2cb9ff5fa625561040c6b71d4b8eccc90bc3b99650d28dd1ee63773e49664e3d48c484996b290943635a6f2eb1ce9796d3fa144a3f00ef82faaa32d6a413668f7b521517cb68b2b017fcf56c79326fa5e4060e643631ca3f0a0dc0ed718798b6f46b130d437c33f64039e887324b6f5e604b1669d613923794edbf04b1b3caea54793b52b44b170173a4f25c7ecef3b71e2aad76e556b1cb9f1d637ec52ececfa950dd31dbb6a60828a3ad34c1beffe09eb4785786d63bad10a0b0f66ea88c57380f38ea85f018dbd7f538cf1ee7624095b9a01ec5edd528f281168af020609e651ff316aa1320a710134ddfca600cc72174dcdb846d2aa29916488aa1b537b66da92e61af526debef4eb38c984569eaf549ff2129449269b492d030cd74d885f6f5785881cc4804b4a8a09ba4ff7aefe9074ac7d0c4f05d51fe4cc0ff7388a772092b9d02d70e5433a5cf3e02f46a6bd6b818d59a07ce3b9fbbf8b5faba74563bcc5240930c2d406c9aaee3e3ce0429bf68ac2b0a57adb09414cff50817d2a48fb9fa624ab863cb0c31a8b8dc5eaf6fa68cc1d7c6c685c5a33edd5c8933b9e8ab628ee428d0743699b2ff17f25586c7ce959280bb0b8c5342251f0a30b53dbc7bf1ee426ac9619c3560f811f2268ee37f189794e2e4b3db3a2fb2e34b649e504fb467438abfd1082619cc4a0b30d66beb831077812e418d2e2148db10cf4d4a29101ca52ec445b8d83519dd7de85a98e0beae9ee537096d3f1a55a7a80cdfa93d25f07c9f98e8af18cde19ec1f99c5dd4588b717a5039ddb7f177717caf0d0fd45420a70dbd6d3146890d9e450d5224146db4c33b779e3c3a04b976c052bad042ac57dd38be45407808c0fb0d7e2a8819e6cd53c6739e6612996ddaa6f066552590aa0343bc1e62b298ff2514a0cef8be21956c2e942816f7a3a3a0935eaf9b37251409ce444c986c3817e82835555fe18239f3ae33469d7965c2bde9991fde556bd07af01df52bbde0c35bb4ef48e3b5d0db53f8ca4ed35b83f760f0a1bc4ed9f86e85d6039a17df373c85402ef956f01db00eb39c4b74bd0660d29ee746714d9780d738e05c6cca414ce3d7b40dda8036a9eea9ab1388805f913eb19bdd3f09d9e161eaa50231bd9caba61971f194332dd28c696a60458c1c6c2cc5da8b1192611c7c553e9e12fe48ce46bbb891be8bb118721c86222e671ddd1da8f0ccb2b68e02f2014b4925e904e88369aaf7466bd7033a60c265d45955944916ecbdb84bf1b522b01b0149c632e04c568a7eb627c5bb90ece052ebcf79166c28b30d23fe52da0a5ab5dea83ca479a3e3b7a9cfbbfea04dbe6137c19d067317c2ec427a8c75a6b06bec6dcd5d5c0edc9aa80b9003b8e17c088b2f3db327d3e42630d82d20120240c3ba56232280787da4aabbf5bc95a864029f00710e195f2a76460a0317d10b552fe1bea097e41d49756c680a41d6ac186e62169b6b6cd7776ea84618b5b752328a5bacaa10aa122ff9b2698b43efe73d852a899db644863c8c9bc8068ea86ea843fd6fe36272b91cdc5d5317083ef3fd1e5462a0b0d0604dc57b3bbfceb0fca4cd349625dd7b25166af30efe5ee6a0af953a74d65f4736c59918ee55a3b0d9d9d42e04c7f8a77e479109f740e20c464d5d7e3d16805f47b61f403ff7f408c9e850d9baacd8067e544536a4953480b0f9ee9cd45f41ebd67b51f78788a6470cb1e5ca72ca346ce8a50d0ca0c921d5576a4455a1afb6d0bc688004712ee122cacdb29c51e84893324c27fa4a3f1917edf5352272b4c97579a6152e4b77663d0ab532915f2eeb6a862de8b696452321b660c3f2449673d086e95a7af28845a5259b763e0fcd09f72acf7b6c811066263060e5aa5b24658e880a01fd56bda4dad5ab604e129290f7d5489728f2a40968c6168b21cebbbcd11727cc9e9160c4e92e04387d3b0d62aab06a61f26daedd9fed11816ef2180172a47f47184ac4032b88758c98a2e0fb200f70e93ba695f5ebb7a1029610ad360d3b7fa1b4640b9dc674d3625eef786da93dff19bc7991b5d6193a3896664763fde479b5dfc04812111a80782854f2cf68ca7d82765cc9eb40fba4b44640710ed6e653abf9f07b466333f4fd22784d53cf40e17120f42caa841eaa24056b237827b0f47f7257c103c35027e9f503e5acfd023e7357b600d3084d361d5ee65ba319b45c153212a54e6fed85af7e43e0a926ebcbc2edf8de7e2ec9528f00bec262ad04d5c9dafccaea06a24748d28bf1799bae0e895543084539c50b5aaa4fb50d7431d6f0c8cee2a54aaf7ee7919b55bf40adb688632e5dbe273cea09e97b19c3d8e1f4de000deb66fa1942ad03a62d3252f51992244366c156000b49c297167a6cbdedea7ebae139d295f0ad298e0864249b905b7eb812886ec70ecdb286702274b5b8574149bf3866f9e46b997ff5ed622b169a0eb071347f18d530db1663906a28f4544ee4e004ab87b65476af30ede118052ff052b8dc986ca2c93dd5d4943266a579c7698ea014f688b3e8063a107feb162d392e2177b01bff77fb5abe5feebd0607158049a5a093325b7c9ee6b4dfa7a9f65c7c2fb628920d3603a1c2dad979eaa047cd661a268af1078c9788d720e64e4ce9d12e68de1e417ef2f293323681e1071f9220e1ee43d2e29d111b870ce3439f5100ecd4551ab65ee74aa1667e564957e9bc0ae1ea193980da2a0ec2698073388c85bec25ef447f0d5e93a5203fa44dff268e5cb799ed3b66e63d5e07b487e7534f24934c73a62a243e0151843a0fd3807711a101eaa7fc71f0ba68aebb9534d57cba41b094eebfb4c31cca8eddfa426f676aa347be8a7023a4e91ddb154b35cd4d5f7dbc2e5db491de99f33fc2cff2d57029ac950e1ccd681980af6a4e8969dfe39b3c7bfcbcf8fac92f1e6ec9fe572bfa6a7d65860eab2ed10ac01a71290b52e3148e84b7376a8605cd2bb0e8681ffc54691ce087685e33921bd44d36c78291713dce17569570f62137e6904f0d68cf53aa2ec395c389a75141f08114fb293ea63950e4ffee55ec6fc83cf44876b8e7f25cdd393ff87b9eda6eb746085b61a6900de191f0ce2cb388d61ece52e78bc47368194e8e00277e0d1631e6b9d4626ef76f8522582ccd5a40be3febc699bb510acc6271d55ff0f4cf3bb7669855a72efd9ca3e1056a2fe592a5bc877cce2b1f63b58383971da87873d2d1349cf5881242cdce4e7e2c5c514755746a0e0a7c2a6d9701cde005ae3420beb17c379a3516662253554f51f0423bb1844b0b90c54ed8177ceb0e1036a6609d836e748ca06c40ca64befadc6443ec286a0ce464678e8d11eb455f7bb305acebf6cb1f50e394a9bfeb752df1687831bac9cdd811f4f112ef6658d0f8799a866374ff96c5e2b79f30e7a74f8a2bc9ed1f88f01f30e30cb78ffb2bff10108f35e910ee3be4463e9e6f0ed910e8d598326e71dfa2277ffe5579d7fe9b6018bfe295b25219eae07b3b0270665c3fa00c3e0d180812b5cd62925585de84a7c48a9a86dba96544a251654d1966e082432dc85b6149cf21e91a46020ec32b66d28ba3b6a90c0617bc6fdd55aea819af2bcf84864ad60c28fe3c9f8339d0aee68b39d97f63b6e082835d86119cf9b9fdc8b827c847ce40aa10e1577a710132316845e825345e95bdf94d0c66ec65a6c4319fce4792313663b5f7a651a6710783e6ab71608ac6cbbf3af6911adf596ccf7c172b9bd5bceb6db379967b32b143bdd11d2ee12ddf64ecef6391e0f8570e6cddd3db95204919362b89b739fa94e7c1bfde799fd5e22aa25ca6ca42e30c08e23aae2385d99ebab441072a880dcefdab74a4c9bd39d363f6d1933d59400fca161d432aa00f23b1b1c19a154be8989699d549b66d44e39896f5523443bc6ddf4a65e91f1f3fb7b52318869a05856a4fc92f3694c81ed833c972fb918f7e5\",\"cipherparams\":{\"iv\":\"8c46d6162cd4c765759aedcbce2a5874\"},\"kdf\":\"scrypt\",\"kdfparams\":{\"dklen\":32,\"n\":262144,\"p\":1,\"r\":8,\"salt\":\"82fb6cdc6917609135277badacf15baa31899d08b71a5a0fa33167167c161537\"},\"mac\":\"9187b17f7eca48e6b8c586b0cd790dbe0feb876ac8385f93faa7d5e22a3c8fc7\"},\"id\":\"92caf6ee-2d43-48c0-859e-ffa1e0e23312\",\"version\":3}";
  const TEST_WALLET_PASSPHRASE = "QuantumCoinExample123!";
  const TEST_WALLET_ADDRESS = "0x1a846abe71c8b989e8337c55d608be81c28ab3b2e40c83eaa2a68d516049aec6";

  const TEST_SEED_WORDS = [
    "cylamidal","suculate","sealmate","radiploid","equifaxis","and","antipoise","stitchesy","perelade","lite","gourtarel","thursat",
    "overdrome","cogulate","nonviva","stewnut","floribund","enduivist","decatary","elvenwort","indoucate","ravelent","vocalus","wetshirt",
    "rutatory","percect","breaktout","corpation","myricorus","veofreat","junkard","supercarp","sukerus","tautang","facetype","shishkin",
    "insulal","hobstone","stumbed","tecutonic","jumplike","hegwirth","idea","bhagatpur","pavastava","kukuluan","mageiline","extranite"
  ];
  const TEST_SEED_ADDRESS = "0x3Ce22c0e2714196734E42B0D4D5AD11284260502A560e46c2Cd857391564142F".toLowerCase();

  const TEST_SEED_WORDS_32 = TEST_SEED_WORDS.slice(0, 32);
  const TEST_SEED_WORDS_36 = TEST_SEED_WORDS.slice(0, 36);
  const TEST_SEED_ADDRESS_32 = "0x38b12df2d4762a04a183f936c47747a1f13d0b0ba72066b43b4b6d7f776e9e25";
  const TEST_SEED_ADDRESS_36 = "0x030e264c853bd859c53fae3ad6ef0e011dc799685e2b05d5efa7ac50f10ca075";
  const PASSPHRASE_PHRASE = "mySecurePassword123";

  it("validates and normalizes 32-byte addresses", async () => {
    logTest("validates and normalizes 32-byte addresses", {});
    await Initialize(null);
    const wallet = qc.Wallet.createRandom();
    logAddress("wallet", wallet.address);
    assert.equal(qc.isAddress(wallet.address), true);
    assert.equal(qc.getAddress(wallet.address), wallet.address.toLowerCase());
  });

  it("fromEncryptedJsonSync opens a known wallet (hardcoded)", async () => {
    logTest("fromEncryptedJsonSync opens a known wallet (hardcoded)", {});
    await Initialize(null);
    const wallet = qc.Wallet.fromEncryptedJsonSync(TEST_WALLET_ENCRYPTED_JSON, TEST_WALLET_PASSPHRASE);
    logAddress("wallet", wallet.address);
    assert.equal(wallet.address, TEST_WALLET_ADDRESS);
    assert.equal(qc.isAddress(wallet.address), true);
  });

  it("fromEncryptedJsonSync opens 48-word phrase wallet (hardcoded encrypted JSON)", async () => {
    await Initialize(null);
    const wallet = qc.Wallet.fromEncryptedJsonSync(TEST_ENCRYPTED_JSON_48, PASSPHRASE_PHRASE);
    assert.equal(wallet.address, TEST_SEED_ADDRESS);
    assert.equal(qc.isAddress(wallet.address), true);
  });

  it("fromEncryptedJsonSync opens 32-word phrase wallet (hardcoded encrypted JSON)", async () => {
    await Initialize(null);
    const wallet = qc.Wallet.fromEncryptedJsonSync(TEST_ENCRYPTED_JSON_32, PASSPHRASE_PHRASE);
    assert.equal(wallet.address, TEST_SEED_ADDRESS_32);
    assert.equal(qc.isAddress(wallet.address), true);
  });

  it("fromEncryptedJsonSync opens 36-word phrase wallet (hardcoded encrypted JSON)", async () => {
    await Initialize(null);
    const wallet = qc.Wallet.fromEncryptedJsonSync(TEST_ENCRYPTED_JSON_36, PASSPHRASE_PHRASE);
    assert.equal(wallet.address, TEST_SEED_ADDRESS_36);
    assert.equal(qc.isAddress(wallet.address), true);
  });

  it("encryptSync + fromEncryptedJsonSync roundtrip (deterministic address)", async () => {
    await Initialize(null);
    const wallet = qc.Wallet.fromEncryptedJsonSync(TEST_WALLET_ENCRYPTED_JSON, TEST_WALLET_PASSPHRASE);
    const json = wallet.encryptSync("mySecurePassword123");
    assert.equal(typeof json, "string");
    assert.ok(json.includes("address"));
    const wallet2 = qc.Wallet.fromEncryptedJsonSync(json, "mySecurePassword123");
    assert.equal(wallet2.address, wallet.address);
  });

  it("encryptSync accepts Uint8Array password", async () => {
    await Initialize(null);
    const wallet = qc.Wallet.fromEncryptedJsonSync(TEST_WALLET_ENCRYPTED_JSON, TEST_WALLET_PASSPHRASE);
    const pw = qc.toUtf8Bytes("mySecurePassword123");
    const json = wallet.encryptSync(pw);
    assert.equal(typeof json, "string");
    assert.ok(json.includes("address"));
  });

  it("Wallet constructor accepts privateKey hex string (roundtrip address)", async () => {
    await Initialize(null);
    const wallet = qc.Wallet.fromEncryptedJsonSync(TEST_WALLET_ENCRYPTED_JSON, TEST_WALLET_PASSPHRASE);
    const wallet2 = new qc.Wallet(wallet.privateKey);
    assert.equal(wallet2.address, wallet.address);
  });

  it("fromPhrase supports string[] and string inputs (48 words)", async () => {
    await Initialize(null);
    assert.equal(TEST_SEED_WORDS.length, 48);

    const w1 = qc.Wallet.fromPhrase(TEST_SEED_WORDS);
    const w2 = qc.Wallet.fromPhrase(TEST_SEED_WORDS.join(" "));
    const w3 = qc.Wallet.fromPhrase(TEST_SEED_WORDS.join(","));

    assert.equal(w1.address, TEST_SEED_ADDRESS);
    assert.equal(w2.address, TEST_SEED_ADDRESS);
    assert.equal(w3.address, TEST_SEED_ADDRESS);
  });

  it("fromPhrase supports 32-word seed phrase", async () => {
    await Initialize(null);
    assert.equal(TEST_SEED_WORDS_32.length, 32);

    const w1 = qc.Wallet.fromPhrase(TEST_SEED_WORDS_32);
    const w2 = qc.Wallet.fromPhrase(TEST_SEED_WORDS_32.join(" "));

    assert.equal(w1.address, TEST_SEED_ADDRESS_32);
    assert.equal(w2.address, TEST_SEED_ADDRESS_32);
  });

  it("fromPhrase supports 36-word seed phrase", async () => {
    await Initialize(null);
    assert.equal(TEST_SEED_WORDS_36.length, 36);

    const w1 = qc.Wallet.fromPhrase(TEST_SEED_WORDS_36);
    const w2 = qc.Wallet.fromPhrase(TEST_SEED_WORDS_36.join(" "));

    assert.equal(w1.address, TEST_SEED_ADDRESS_36);
    assert.equal(w2.address, TEST_SEED_ADDRESS_36);
  });

  it("fromPhrase rejects invalid phrase lengths (must be 32, 36, or 48 words)", async () => {
    await Initialize(null);
    assert.throws(() => qc.Wallet.fromPhrase("one two three"), /32, 36, or 48 words/i);
    assert.throws(() => qc.Wallet.fromPhrase(new Array(47).fill("word")), /32, 36, or 48 words/i);
    assert.throws(() => qc.Wallet.fromPhrase(new Array(12).fill("word")), /32, 36, or 48 words/i);
  });

  it("fromKeys creates wallet from privateKey + publicKey bytes (roundtrip address)", async () => {
    await Initialize(null);
    const original = qc.Wallet.fromEncryptedJsonSync(TEST_WALLET_ENCRYPTED_JSON, TEST_WALLET_PASSPHRASE);
    const privBytes = original.signingKey.privateKeyBytes;
    const pubBytes = original.signingKey.publicKeyBytes;

    const fromBytes = qc.Wallet.fromKeys(privBytes, pubBytes);
    assert.equal(fromBytes.address, original.address);
    assert.equal(qc.isAddress(fromBytes.address), true);

    const fromHex = qc.Wallet.fromKeys(original.privateKey, qc.hexlify(pubBytes));
    assert.equal(fromHex.address, original.address);
  });

  it("fromKeys rejects empty keys", async () => {
    await Initialize(null);
    assert.throws(() => qc.Wallet.fromKeys(new Uint8Array(0), new Uint8Array(1)), /privateKey must not be empty/);
    assert.throws(() => qc.Wallet.fromKeys(new Uint8Array(1), new Uint8Array(0)), /publicKey must not be empty/);
  });

  it("fromKeys wallet can sign messages", async () => {
    await Initialize(null);
    const original = qc.Wallet.fromPhrase(TEST_SEED_WORDS);
    const restored = qc.Wallet.fromKeys(
      original.signingKey.privateKeyBytes,
      original.signingKey.publicKeyBytes,
    );
    assert.equal(restored.address, original.address);

    const msg = "fromKeys signing test";
    const sig = restored.signMessageSync(msg);
    assert.equal(typeof sig, "string");
    assert.ok(sig.startsWith("0x"));
    const recovered = qc.verifyMessage(msg, sig);
    assert.equal(recovered, original.address.toLowerCase());
  });

  it("signMessageSync + verifyMessage roundtrip (known wallet)", async () => {
    await Initialize(null);
    const wallet = qc.Wallet.fromEncryptedJsonSync(TEST_WALLET_ENCRYPTED_JSON, TEST_WALLET_PASSPHRASE);
    const sig = wallet.signMessageSync("Hello, QuantumCoin!");
    assert.equal(typeof sig, "string");
    assert.ok(sig.startsWith("0x"));
    const recovered = qc.verifyMessage("Hello, QuantumCoin!", sig);
    assert.equal(recovered, wallet.address.toLowerCase());
  });

  it("signMessageSync returns combined signature hex and verifyMessage roundtrip (fromPhrase wallet)", async () => {
    await Initialize(null);
    const wallet = qc.Wallet.fromPhrase(TEST_SEED_WORDS);
    const msg = "test message";
    const sig = wallet.signMessageSync(msg);
    assert.equal(typeof sig, "string");
    assert.ok(sig.startsWith("0x"));
    assert.ok(sig.length > 4);
    const recovered = qc.verifyMessage(msg, sig);
    assert.equal(recovered, wallet.address.toLowerCase());
  });

  it("signMessageSync + verifyMessage roundtrip (32-word phrase wallet)", async () => {
    await Initialize(null);
    const wallet = qc.Wallet.fromPhrase(TEST_SEED_WORDS_32);
    const msg = "hello 32";
    const sig = wallet.signMessageSync(msg);
    assert.equal(typeof sig, "string");
    assert.ok(sig.startsWith("0x"));
    const recovered = qc.verifyMessage(msg, sig);
    assert.equal(recovered, wallet.address.toLowerCase());
    assert.equal(recovered, TEST_SEED_ADDRESS_32.toLowerCase());
  });

  it("signMessageSync + verifyMessage roundtrip (36-word phrase wallet)", async () => {
    await Initialize(null);
    const wallet = qc.Wallet.fromPhrase(TEST_SEED_WORDS_36);
    const msg = "hello 36";
    const sig = wallet.signMessageSync(msg);
    assert.equal(typeof sig, "string");
    assert.ok(sig.startsWith("0x"));
    const recovered = qc.verifyMessage(msg, sig);
    assert.equal(recovered, wallet.address.toLowerCase());
    assert.equal(recovered, TEST_SEED_ADDRESS_36.toLowerCase());
  });

  it("signTransaction works offline and returns raw tx hex", async () => {
    await Initialize(null);
    const wallet = qc.Wallet.fromEncryptedJsonSync(TEST_WALLET_ENCRYPTED_JSON, TEST_WALLET_PASSPHRASE);
    const to = qc.Wallet.createRandom().address;
    const raw = await wallet.signTransaction({
      to,
      value: 0n,
      gasLimit: 21000,
      nonce: 0,
      chainId: 123123,
      remarks: null,
    });
    assert.equal(typeof raw, "string");
    assert.ok(raw.startsWith("0x"));
  });

  it("signTransaction resolves nonce when omitted (and treats remarks omitted vs null the same)", async () => {
    await Initialize(null);
    const calls = { count: 0, tags: [] as string[] };
    const fakeProvider = {
      chainId: 123123,
      getTransactionCount: async (_addr: string, tag?: string) => {
        calls.count++;
        calls.tags.push(tag ?? "pending");
        return 5;
      },
    };

    const wallet = qc.Wallet.fromEncryptedJsonSync(TEST_WALLET_ENCRYPTED_JSON, TEST_WALLET_PASSPHRASE, fakeProvider as unknown as qc.Provider);
    const to = qc.Wallet.createRandom().address;

    const raw1 = await wallet.signTransaction({ to });
    const raw2 = await wallet.signTransaction({ to, remarks: null });

    assert.ok(typeof raw1 === "string" && raw1.startsWith("0x"));
    assert.ok(typeof raw2 === "string" && raw2.startsWith("0x"));
    assert.equal(calls.count >= 1, true);
    assert.equal(calls.tags[0], "pending");
  });

  it("signTransaction supports contract creation (to: null) with explicit nonce", async () => {
    await Initialize(null);
    const wallet = qc.Wallet.fromEncryptedJsonSync(TEST_WALLET_ENCRYPTED_JSON, TEST_WALLET_PASSPHRASE);
    const raw = await wallet.signTransaction({
      to: null,
      data: "0x",
      nonce: 0,
      gasLimit: 500000,
      chainId: 123123,
    });
    assert.ok(typeof raw === "string" && raw.startsWith("0x"));
  });

  it("signTransaction rejects remarks > 32 bytes", async () => {
    await Initialize(null);
    const wallet = qc.Wallet.fromEncryptedJsonSync(TEST_WALLET_ENCRYPTED_JSON, TEST_WALLET_PASSPHRASE);
    const to = qc.Wallet.createRandom().address;
    const tooLong = "0x" + "11".repeat(33);
    await assert.rejects(
      () =>
        wallet.signTransaction({
          to,
          value: 0n,
          gasLimit: 21000,
          nonce: 0,
          chainId: 123123,
          remarks: tooLong,
        }),
    );
  });

  it("connect(provider) returns a new wallet with provider attached", async () => {
    await Initialize(null);
    const wallet = qc.Wallet.fromEncryptedJsonSync(TEST_WALLET_ENCRYPTED_JSON, TEST_WALLET_PASSPHRASE);
    const fakeProvider = {
      chainId: 123123,
      getBalance: async () => 123n,
      getTransactionCount: async () => 7,
      sendTransaction: async () => ({ hash: "0x" + "11".repeat(32), wait: async () => ({ blockNumber: 1 }) }),
    };
    const connected = wallet.connect(fakeProvider as unknown as qc.Provider);
    assert.equal(connected.address, wallet.address);
    assert.equal(connected.provider, fakeProvider);
  });

  it("sendTransaction uses provider.sendTransaction with signed raw tx (no broadcast in test)", async () => {
    await Initialize(null);
    const calls = { send: 0, raw: null as string | null };
    const fakeProvider = {
      chainId: 123123,
      getTransactionCount: async () => 0,
      sendTransaction: async (raw: string) => {
        calls.send++;
        calls.raw = raw;
        return { hash: "0x" + "22".repeat(32), wait: async () => ({ blockNumber: 1 }) };
      },
    };
    const wallet = qc.Wallet.fromEncryptedJsonSync(TEST_WALLET_ENCRYPTED_JSON, TEST_WALLET_PASSPHRASE, fakeProvider as unknown as qc.Provider);
    const to = qc.Wallet.createRandom().address;
    const resp = await wallet.sendTransaction({ to, value: 0n, gasLimit: 21000, nonce: 0 });
    assert.equal(calls.send, 1);
    assert.equal(typeof calls.raw, "string");
    assert.ok(calls.raw!.startsWith("0x"));
    assert.ok(resp && resp.hash);
  });

  it("NonceManager caches nonce and increments between sends (offline)", async () => {
    await Initialize(null);
    const calls = { getNonce: 0, nonces: [] as number[] };
    const fakeProvider = {
      chainId: 123123,
      getTransactionCount: async () => {
        calls.getNonce++;
        return 10;
      },
      sendTransaction: async () => ({ hash: "0x" + "33".repeat(32), wait: async () => ({ blockNumber: 1 }) }),
    };
    const wallet = qc.Wallet.fromEncryptedJsonSync(TEST_WALLET_ENCRYPTED_JSON, TEST_WALLET_PASSPHRASE, fakeProvider as unknown as qc.Provider);
    const nm = new qc.NonceManager(wallet);

    const originalSend = wallet.sendTransaction.bind(wallet);
    wallet.sendTransaction = async (tx: Parameters<typeof wallet.sendTransaction>[0]) => {
      calls.nonces.push(tx.nonce as number);
      return originalSend(tx);
    };

    const to = qc.Wallet.createRandom().address;
    await nm.sendTransaction({ to, value: 0n, gasLimit: 21000 });
    await nm.sendTransaction({ to, value: 0n, gasLimit: 21000 });

    assert.equal(calls.getNonce, 1);
    assert.deepEqual(calls.nonces, [10, 11]);
  });

  it("VoidSigner exposes getAddress()", async () => {
    await Initialize(null);
    const addr = qc.Wallet.createRandom().address;
    const vs = new qc.VoidSigner(addr, null);
    assert.equal(await vs.getAddress(), addr.toLowerCase());
  });

  it("resolveAddress supports string, Addressable, and Promise inputs", async () => {
    await Initialize(null);
    const wallet = qc.Wallet.createRandom();
    assert.equal(qc.resolveAddress(wallet.address), wallet.address.toLowerCase());
    assert.equal(await qc.resolveAddress(wallet), wallet.address.toLowerCase());
    assert.equal(await qc.resolveAddress(Promise.resolve(wallet.address)), wallet.address.toLowerCase());
  });

  // ---------------------------------------------------------------------------
  // createRandom with keyType
  // ---------------------------------------------------------------------------

  it("createRandom(null, null) creates wallet with explicit null keyType", async () => {
    await Initialize(null);
    const w = qc.Wallet.createRandom(undefined, null);
    assert.equal(qc.isAddress(w.address), true);
  });

  it("createRandom(null, 3) creates wallet with keyType 3 and sign/verify roundtrip", async () => {
    await Initialize(null);
    const w = qc.Wallet.createRandom(undefined, 3);
    assert.equal(qc.isAddress(w.address), true);
    const sig = w.signMessageSync("kt3 test");
    assert.ok(sig.startsWith("0x"));
    assert.equal(qc.verifyMessage("kt3 test", sig), w.address.toLowerCase());
  });

  it("createRandom(null, 5) creates wallet with keyType 5 and sign/verify roundtrip", async () => {
    await Initialize(null);
    const w = qc.Wallet.createRandom(undefined, 5);
    assert.equal(qc.isAddress(w.address), true);
    const sig = w.signMessageSync("kt5 test");
    assert.ok(sig.startsWith("0x"));
    assert.equal(qc.verifyMessage("kt5 test", sig), w.address.toLowerCase());
  });

  it("createRandom(null, 3) signTransaction works offline", async () => {
    await Initialize(null);
    const w = qc.Wallet.createRandom(undefined, 3);
    const to = qc.Wallet.createRandom().address;
    const raw = await w.signTransaction({ to, value: 0n, gasLimit: 21000, nonce: 0, chainId: 123123 });
    assert.ok(typeof raw === "string" && raw.startsWith("0x"));
  });

  it("createRandom(null, 5) signTransaction works offline", async () => {
    await Initialize(null);
    const w = qc.Wallet.createRandom(undefined, 5);
    const to = qc.Wallet.createRandom().address;
    const raw = await w.signTransaction({ to, value: 0n, gasLimit: 21000, nonce: 0, chainId: 123123 });
    assert.ok(typeof raw === "string" && raw.startsWith("0x"));
  });

  it("createRandom(null, 3) encryptSync + fromEncryptedJsonSync roundtrip", async () => {
    await Initialize(null);
    const w = qc.Wallet.createRandom(undefined, 3);
    const json = w.encryptSync("testPassword123!");
    const w2 = qc.Wallet.fromEncryptedJsonSync(json, "testPassword123!");
    assert.equal(w2.address, w.address);
  });

  it("createRandom(null, 5) encryptSync + fromEncryptedJsonSync roundtrip", async () => {
    await Initialize(null);
    const w = qc.Wallet.createRandom(undefined, 5);
    const json = w.encryptSync("testPassword123!");
    const w2 = qc.Wallet.fromEncryptedJsonSync(json, "testPassword123!");
    assert.equal(w2.address, w.address);
  });

  it("createRandom rejects invalid keyType values", async () => {
    await Initialize(null);
    assert.throws(() => qc.Wallet.createRandom(undefined, 1), /keyType must be null, 3, or 5/);
    assert.throws(() => qc.Wallet.createRandom(undefined, 2), /keyType must be null, 3, or 5/);
    assert.throws(() => qc.Wallet.createRandom(undefined, 4), /keyType must be null, 3, or 5/);
  });

  // ---------------------------------------------------------------------------
  // createRandomSeed
  // ---------------------------------------------------------------------------

  it("createRandomSeed() returns 32-word array (default keyType)", async () => {
    await Initialize(null);
    const words = qc.Wallet.createRandomSeed();
    assert.equal(Array.isArray(words), true);
    assert.equal(words.length, 32);
    assert.ok(words.every((w: string) => typeof w === "string" && w.length > 0));
  });

  it("createRandomSeed(3) returns 32-word array", async () => {
    await Initialize(null);
    const words = qc.Wallet.createRandomSeed(3);
    assert.equal(words.length, 32);
  });

  it("createRandomSeed(5) returns 36-word array", async () => {
    await Initialize(null);
    const words = qc.Wallet.createRandomSeed(5);
    assert.equal(words.length, 36);
  });

  it("createRandomSeed roundtrip via fromPhrase produces valid signing wallet", async () => {
    await Initialize(null);
    const words = qc.Wallet.createRandomSeed(3);
    const w = qc.Wallet.fromPhrase(words);
    assert.equal(qc.isAddress(w.address), true);
    const sig = w.signMessageSync("seed roundtrip");
    assert.equal(qc.verifyMessage("seed roundtrip", sig), w.address.toLowerCase());
  });

  it("createRandomSeed rejects invalid keyType", async () => {
    await Initialize(null);
    assert.throws(() => qc.Wallet.createRandomSeed(1), /keyType must be null, 3, or 5/);
    assert.throws(() => qc.Wallet.createRandomSeed(2), /keyType must be null, 3, or 5/);
    assert.throws(() => qc.Wallet.createRandomSeed(4), /keyType must be null, 3, or 5/);
  });

  // ---------------------------------------------------------------------------
  // fromSeed
  // ---------------------------------------------------------------------------

  it("fromSeed roundtrip: createRandomSeed(3) -> fromPhrase -> fromSeed produces same address", async () => {
    await Initialize(null);
    const seedwords = require("seed-words");
    const words = qc.Wallet.createRandomSeed(3);
    const seedArr = seedwords.getSeedArrayFromWordList(words);
    assert.equal(seedArr.length, 64);
    const wFromWords = qc.Wallet.fromPhrase(words);
    const wFromSeed = qc.Wallet.fromSeed(Array.from(seedArr));
    assert.equal(wFromSeed.address, wFromWords.address);
  });

  it("fromSeed roundtrip: createRandomSeed(5) -> fromPhrase -> fromSeed produces same address", async () => {
    await Initialize(null);
    const seedwords = require("seed-words");
    const words = qc.Wallet.createRandomSeed(5);
    const seedArr = seedwords.getSeedArrayFromWordList(words);
    assert.equal(seedArr.length, 72);
    const wFromWords = qc.Wallet.fromPhrase(words);
    const wFromSeed = qc.Wallet.fromSeed(Array.from(seedArr));
    assert.equal(wFromSeed.address, wFromWords.address);
  });

  it("fromSeed rejects non-array input", async () => {
    await Initialize(null);
    assert.throws(() => qc.Wallet.fromSeed("not an array" as any), /seed must be an array/);
    assert.throws(() => qc.Wallet.fromSeed(12345 as any), /seed must be an array/);
    assert.throws(() => qc.Wallet.fromSeed(null as any), /seed must be an array/);
  });

  it("fromSeed rejects wrong-length arrays", async () => {
    await Initialize(null);
    assert.throws(() => qc.Wallet.fromSeed(new Array(32).fill(0)), /seed must be 64, 72, or 96 bytes/);
    assert.throws(() => qc.Wallet.fromSeed(new Array(48).fill(0)), /seed must be 64, 72, or 96 bytes/);
    assert.throws(() => qc.Wallet.fromSeed(new Array(100).fill(0)), /seed must be 64, 72, or 96 bytes/);
    assert.throws(() => qc.Wallet.fromSeed([]), /seed must be 64, 72, or 96 bytes/);
  });

  // ---------------------------------------------------------------------------
  // Hardcoded fromSeed test vectors
  // ---------------------------------------------------------------------------

  it("fromSeed with hardcoded 64-byte seed (keyType 3) produces expected address", async () => {
    await Initialize(null);
    const seed3 = [51,214,149,165,206,96,227,5,173,247,83,219,210,2,221,2,4,48,117,55,88,109,241,204,31,62,23,128,47,21,168,247,28,118,30,185,229,255,17,27,34,107,225,138,254,156,55,9,253,255,142,148,234,189,232,43,173,84,159,108,8,35,58,77];
    const addr3 = "0x2ceeaE376719215f1597d144Ee1549AB64f1Eb8D49f1f84D9F3a526400d1a4F6".toLowerCase();
    const w = qc.Wallet.fromSeed(seed3);
    assert.equal(w.address, addr3);
    assert.equal(qc.isAddress(w.address), true);
  });

  it("fromSeed with hardcoded 72-byte seed (keyType 5) produces expected address", async () => {
    await Initialize(null);
    const seed5 = [58,255,242,97,43,252,180,220,51,164,15,238,50,215,248,10,29,19,152,124,211,29,41,81,233,103,152,244,59,239,145,216,189,77,244,198,230,165,109,191,18,12,199,252,232,42,197,9,237,237,237,93,254,89,177,192,7,178,95,70,174,88,126,130,89,205,140,175,7,142,191,84];
    const addr5 = "0xeB12DF9517F867749056fE02EbCba67c9D84a97A6f4eDc6DA6555Ff4A30b9538".toLowerCase();
    const w = qc.Wallet.fromSeed(seed5);
    assert.equal(w.address, addr5);
    assert.equal(qc.isAddress(w.address), true);
  });

  // ---------------------------------------------------------------------------
  // encryptSeedSync
  // ---------------------------------------------------------------------------

  it("encryptSeedSync: 32-word seed (64 bytes) roundtrip preserves address, privateKey, publicKey", async () => {
    await Initialize(null);
    const seedwords = require("seed-words");
    const seedArr = seedwords.getSeedArrayFromWordList(TEST_SEED_WORDS_32);
    assert.equal(seedArr.length, 64);
    const ref = qc.Wallet.fromPhrase(TEST_SEED_WORDS_32);

    const json = qc.Wallet.encryptSeedSync(Array.from(seedArr), PASSPHRASE_PHRASE);
    assert.equal(typeof json, "string");
    assert.ok(json.includes("address"));

    const restored = qc.Wallet.fromEncryptedJsonSync(json, PASSPHRASE_PHRASE);
    assert.equal(restored.address, ref.address);
    assert.equal(restored.address, TEST_SEED_ADDRESS_32);
    assert.equal(restored.privateKey, ref.privateKey);
    assert.deepEqual(restored.signingKey.publicKeyBytes, ref.signingKey.publicKeyBytes);
  });

  it("encryptSeedSync: 36-word seed (72 bytes) roundtrip preserves address, privateKey, publicKey", async () => {
    await Initialize(null);
    const seedwords = require("seed-words");
    const seedArr = seedwords.getSeedArrayFromWordList(TEST_SEED_WORDS_36);
    assert.equal(seedArr.length, 72);
    const ref = qc.Wallet.fromPhrase(TEST_SEED_WORDS_36);

    const json = qc.Wallet.encryptSeedSync(Array.from(seedArr), PASSPHRASE_PHRASE);
    assert.equal(typeof json, "string");
    assert.ok(json.includes("address"));

    const restored = qc.Wallet.fromEncryptedJsonSync(json, PASSPHRASE_PHRASE);
    assert.equal(restored.address, ref.address);
    assert.equal(restored.address, TEST_SEED_ADDRESS_36);
    assert.equal(restored.privateKey, ref.privateKey);
    assert.deepEqual(restored.signingKey.publicKeyBytes, ref.signingKey.publicKeyBytes);
  });

  it("encryptSeedSync: 48-word seed (96 bytes) roundtrip preserves address, privateKey, publicKey", async () => {
    await Initialize(null);
    const seedwords = require("seed-words");
    const seedArr = seedwords.getSeedArrayFromWordList(TEST_SEED_WORDS);
    assert.equal(seedArr.length, 96);
    const ref = qc.Wallet.fromPhrase(TEST_SEED_WORDS);

    const json = qc.Wallet.encryptSeedSync(Array.from(seedArr), PASSPHRASE_PHRASE);
    assert.equal(typeof json, "string");
    assert.ok(json.includes("address"));

    const restored = qc.Wallet.fromEncryptedJsonSync(json, PASSPHRASE_PHRASE);
    assert.equal(restored.address, ref.address);
    assert.equal(restored.address, TEST_SEED_ADDRESS);
    assert.equal(restored.privateKey, ref.privateKey);
    assert.deepEqual(restored.signingKey.publicKeyBytes, ref.signingKey.publicKeyBytes);
  });

  it("encryptSeedSync accepts Uint8Array seed", async () => {
    await Initialize(null);
    const seedwords = require("seed-words");
    const seedArr = seedwords.getSeedArrayFromWordList(TEST_SEED_WORDS_32);
    const ref = qc.Wallet.fromPhrase(TEST_SEED_WORDS_32);

    const json = qc.Wallet.encryptSeedSync(new Uint8Array(seedArr), PASSPHRASE_PHRASE);
    const restored = qc.Wallet.fromEncryptedJsonSync(json, PASSPHRASE_PHRASE);
    assert.equal(restored.address, ref.address);
  });

  it("encryptSeedSync rejects non-array seed input", async () => {
    await Initialize(null);
    assert.throws(() => qc.Wallet.encryptSeedSync("not an array" as any, PASSPHRASE_PHRASE), /seed must be an array/);
    assert.throws(() => qc.Wallet.encryptSeedSync(12345 as any, PASSPHRASE_PHRASE), /seed must be an array/);
    assert.throws(() => qc.Wallet.encryptSeedSync(null as any, PASSPHRASE_PHRASE), /seed must be an array/);
  });

  it("encryptSeedSync rejects wrong-length seed arrays", async () => {
    await Initialize(null);
    assert.throws(() => qc.Wallet.encryptSeedSync(new Array(32).fill(0), PASSPHRASE_PHRASE), /seed must be 64, 72, or 96 bytes/);
    assert.throws(() => qc.Wallet.encryptSeedSync(new Array(48).fill(0), PASSPHRASE_PHRASE), /seed must be 64, 72, or 96 bytes/);
    assert.throws(() => qc.Wallet.encryptSeedSync(new Array(100).fill(0), PASSPHRASE_PHRASE), /seed must be 64, 72, or 96 bytes/);
    assert.throws(() => qc.Wallet.encryptSeedSync([], PASSPHRASE_PHRASE), /seed must be 64, 72, or 96 bytes/);
  });

  it("encryptSeedSync rejects password shorter than 12 characters", async () => {
    await Initialize(null);
    const seed = new Array(64).fill(1);
    assert.throws(() => qc.Wallet.encryptSeedSync(seed, "short"), /serializeSeedAsEncryptedWallet failed/);
  });

  // ---------------------------------------------------------------------------
  // getSigningContext
  // ---------------------------------------------------------------------------

  it("getSigningContext: 32-word wallet (pubKey 1408) returns 0 by default, 2 with fullSign", async () => {
    await Initialize(null);
    const w = qc.Wallet.fromPhrase(TEST_SEED_WORDS_32);
    assert.strictEqual(w.getSigningContext(), 0);
    assert.strictEqual(w.getSigningContext(null), 0);
    assert.strictEqual(w.getSigningContext(false), 0);
    assert.strictEqual(w.getSigningContext(true), 2);
  });

  it("getSigningContext: 48-word wallet (pubKey 1408) returns 0 by default, 2 with fullSign", async () => {
    await Initialize(null);
    const w = qc.Wallet.fromPhrase(TEST_SEED_WORDS);
    assert.strictEqual(w.getSigningContext(), 0);
    assert.strictEqual(w.getSigningContext(null), 0);
    assert.strictEqual(w.getSigningContext(false), 0);
    assert.strictEqual(w.getSigningContext(true), 2);
  });

  it("getSigningContext: 36-word wallet (pubKey 2688) returns 1 for all fullSign values", async () => {
    await Initialize(null);
    const w = qc.Wallet.fromPhrase(TEST_SEED_WORDS_36);
    assert.strictEqual(w.getSigningContext(), 1);
    assert.strictEqual(w.getSigningContext(null), 1);
    assert.strictEqual(w.getSigningContext(false), 1);
    assert.strictEqual(w.getSigningContext(true), 1);
  });

  it("getSigningContext: throws for unsupported public key size", async () => {
    await Initialize(null);
    const w = qc.Wallet.fromPhrase(TEST_SEED_WORDS_32);
    (w.signingKey as any).publicKeyBytes = new Uint8Array(100);
    assert.throws(() => w.getSigningContext(), /unsupported public key size/);
  });
});
