"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_bzz_node_1 = require("@erebos/api-bzz-node");
const keccak256_1 = require("@erebos/keccak256");
const secp256k1_1 = require("@erebos/secp256k1");
const BZZ_URL = "http://swarm.dappnode";
const eduFeedUser = "306b14e943655c765ee025efd19a770b70bc611a";
const eduFeedName = "graficar";
// This setup is meant for demonstration purpose only - keys and signatures security must be handled by the application
const keyPair = secp256k1_1.createKeyPair();
const user = keccak256_1.pubKeyToAddress(keyPair.getPublic("array"));
const signBytes = (bytes) => __awaiter(this, void 0, void 0, function* () { return secp256k1_1.sign(bytes, keyPair); });
const bzz = new api_bzz_node_1.Bzz({ url: BZZ_URL, signBytes });
demo();
function demo() {
    return __awaiter(this, void 0, void 0, function* () {
        const manifestData = JSON.stringify({ name: "admin.dnp.dappnode.eth" });
        /**
         * Upload a directory to swarm
         */
        const hash = yield bzz.uploadDirectory({
            "manifest.json": {
                data: manifestData,
                contentType: "text/plain"
            }
        }
        // {
        //   defaultPath: "manifest.json"
        // }
        );
        console.log({ hash });
        const { entries } = yield bzz.list(hash);
        console.log(entries);
        for (const entry of entries) {
            console.log(`Downloading entry ${entry.path}`);
            const entryContent = yield bzz
                .download(entry.hash, { mode: "raw" })
                .then(res => res.text());
            console.log("Content: \n==========================");
            console.log(entryContent);
            console.log("==========================");
        }
        /**
         * Create a feed, if it doesn't exist, and post an update to it
         */
        /**
         * Query the feed for the hash
         */
        /**
         * Check the directory
         */
        // website will be accessible with the URL `${BZZ_URL}/bzz:/${feedHash}`
        // const feedHash = await bzz.createFeedManifest({
        //   user,
        //   name: "my-awesome-website"
        // });
        // console.log({ feedHash });
        // // This function can be called any time the website contents change
        // const publishContents = async (contents: any) => {
        //   // setFeedContent() uploads the given contents and updates the feed to point to the contents hash
        //   await bzz.setFeedContent(feedHash, contents, { defaultPath: "index.html" });
        // };
        // // Example use of publishContents()
        // const setupContents = async () => {
        //   await publishContents({
        //     "index.html": { contentType: "text/html", data: "<h1>Hello world</h1>" }
        //   });
        // };
    });
}
function get() {
    return __awaiter(this, void 0, void 0, function* () {
        // user=306b14e943655c765ee025efd19a770b70bc611a&name=graficar
        const contentHash = yield bzz.getFeedContentHash({
            user: eduFeedUser,
            name: eduFeedName
        });
        const file = yield bzz.download(contentHash).then(res => res.json());
        console.log({ file, contentHash });
    });
}
//# sourceMappingURL=feeds.js.map