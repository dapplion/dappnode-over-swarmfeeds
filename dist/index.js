"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_bzz_node_1 = require("@erebos/api-bzz-node"); // node
const keccak256_1 = require("@erebos/keccak256");
const secp256k1_1 = require("@erebos/secp256k1");
const downloadRelease_1 = __importDefault(require("./downloadRelease"));
const uploadRelease_1 = __importDefault(require("./uploadRelease"));
const rimraf_1 = __importDefault(require("rimraf"));
const _cliProgress = require("cli-progress");
const params_1 = require("./params");
// This setup is meant for demonstration purpose only - keys and signatures security must be handled by the application
const keyPair = secp256k1_1.createKeyPair();
const user = keccak256_1.pubKeyToAddress(keyPair.getPublic("array"));
const signBytes = (bytes) => __awaiter(this, void 0, void 0, function* () { return secp256k1_1.sign(bytes, keyPair); });
const bzz = new api_bzz_node_1.Bzz({ url: params_1.gatewayUrl, signBytes });
start();
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        /**
         * Clean previously downloaded release
         */
        rimraf_1.default.sync(params_1.downloadDir);
        /**
         * Upload a directory to swarm
         */
        console.log("Uploading release...");
        const bar = new _cliProgress.SingleBar();
        bar.start(100, 0);
        const uploadedDirHash = yield uploadRelease_1.default("build_0.1.0", (progress) => bar.update(progress), 2);
        bar.stop();
        console.log(`Uploaded release: ${params_1.gatewayUrl}/bzz-raw:/${uploadedDirHash}`);
        /**
         * Create a feed, if it doesn't exist, and post an update to it
         */
        console.log(`Creating feed and posting new release...`);
        const feedHash = yield bzz.createFeedManifest({
            user,
            name: params_1.testFeedName
        });
        yield bzz.setFeedContent(feedHash, uploadedDirHash);
        console.log(`Feed hash: ${params_1.gatewayUrl}/bzz-raw:/${feedHash}`);
        /**
         * Query the feed for the hash
         */
        console.log(`Querying latest release from feed...`);
        const queriedDirHash = yield bzz
            .getFeedContent({
            user,
            name: params_1.testFeedName
        }, { mode: "raw" })
            .then(res => res.text());
        console.log(`Latest release from feed: ${params_1.gatewayUrl}/bzz-raw:/${queriedDirHash}`);
        /**
         * Download directory
         */
        yield downloadRelease_1.default(queriedDirHash);
    });
}
//# sourceMappingURL=index.js.map