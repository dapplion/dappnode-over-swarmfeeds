"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_bzz_node_1 = require("@erebos/api-bzz-node"); // node
const request_1 = __importDefault(require("request"));
const fs_1 = __importDefault(require("fs"));
const path_1 = require("path");
const _cliProgress = require("cli-progress");
const params_1 = require("./params");
const bzz = new api_bzz_node_1.Bzz({ url: params_1.gatewayUrl });
function downloadRelease(releaseDirHash) {
    return __awaiter(this, void 0, void 0, function* () {
        const { entries } = yield bzz.list(releaseDirHash);
        console.table(entries.reduce((acc, _a) => {
            var { path } = _a, x = __rest(_a, ["path"]);
            acc[path] = x;
            return acc;
        }, {}), ["size", "hash"]);
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
        yield bzz.downloadFileTo(avatarEntry.hash, path_1.join(params_1.downloadDir, "avatar.png"), {
            mode: "raw"
        });
        console.log("Downloaded avatar");
        // Download image to disk
        const imageEntry = entries.find(({ path }) => path.endsWith(".tar.xz"));
        console.log("Downloading image...");
        const bar = new _cliProgress.SingleBar();
        bar.start(100, 0);
        yield downloadFileWithProgress(imageEntry.hash, path_1.join(params_1.downloadDir, "image.tar.xz"), imageEntry.size, (progress) => bar.update(progress), 2);
        bar.stop();
        console.log("Downloaded image");
    });
}
exports.default = downloadRelease;
function downloadFileWithProgress(hash, path, fileSize, progress, resolution) {
    let totalData = 0;
    let previousProgress = -1;
    if (fileSize && progress && !resolution)
        resolution = 1;
    const round = (n) => resolution * Math.round((100 * n) / resolution);
    return new Promise((resolve, reject) => {
        request_1.default
            .get(`${params_1.gatewayUrl}/bzz-raw:/${hash}/`)
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
//# sourceMappingURL=downloadRelease.js.map