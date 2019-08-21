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
const request_1 = __importDefault(require("request"));
const fs_1 = __importDefault(require("fs"));
const dirHash = "2d9d98447d513771dbd93a796203e8d1ecfa81197a8c466584f2e659922cf5f7";
const gatewayUrl = "http://swarm.dappnode";
const bzz = new api_bzz_node_1.Bzz({ url: gatewayUrl });
downloadRelease(dirHash);
function downloadRelease(releaseDirHash) {
    return __awaiter(this, void 0, void 0, function* () {
        const { entries } = yield bzz.list(releaseDirHash);
        console.log(entries);
        // Download manifest to memory
        console.log("Downloading avatar...");
        const manifestEntry = entries.find(({ path }) => path.endsWith(".json"));
        const manifest = yield bzz
            .download(manifestEntry.hash, { mode: "raw" })
            .then(res => res.json());
        console.log("Downloaded manifest");
        console.log(manifest);
        // Download avatar to disk
        console.log("Downloading avatar...");
        const avatarEntry = entries.find(({ path }) => path.endsWith(".png"));
        yield bzz.downloadFileTo(avatarEntry.hash, "./avatar.png", { mode: "raw" });
        console.log("Downloaded avatar");
        // Download image to disk
        const imageEntry = entries.find(({ path }) => path.endsWith(".tar.xz"));
        console.log("Downloading image...");
        yield downloadFileWithProgress(imageEntry.hash, "./image.tar.xz", imageEntry.size, (progress) => console.log(`Downloading ${Math.round(progress)}%...`));
        console.log("Downloaded image");
    });
}
function downloadFileWithProgress(hash, path, fileSize, progress, round = (n) => Math.round(100 * n)) {
    let totalData = 0;
    let previousProgress = -1;
    return new Promise((resolve, reject) => {
        request_1.default
            .get(`${gatewayUrl}/bzz-raw:/${hash}/`)
            .on("error", reject)
            .on("response", function (res) {
            if (res.statusCode !== 200)
                reject(`Status code ${res.statusCode}`);
        })
            .on("data", function (chunk) {
            totalData += chunk.length;
            if (progress && fileSize) {
                const currentProgress = round(totalData / fileSize);
                if (currentProgress !== previousProgress) {
                    progress(currentProgress);
                    previousProgress = currentProgress;
                }
            }
        })
            .on("end", resolve)
            .pipe(fs_1.default.createWriteStream(path));
    });
}
//# sourceMappingURL=downloadDir.js.map