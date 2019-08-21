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
const params_1 = require("./params");
const tar_fs_1 = __importDefault(require("tar-fs"));
const request_1 = __importDefault(require("request"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const bzz = new api_bzz_node_1.Bzz({ url: params_1.gatewayUrl });
function uploadRelease(path, progress, resolution) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `${params_1.gatewayUrl}/bzz:/`;
        // const url = `${gatewayUrl}/bzz-raw:/`;
        // const url = `${gatewayUrl}/bzz:/?defaultpath=${options.defaultPath}`;
        const fileSize = getDirSize(path);
        let totalData = 0;
        let previousProgress = -1;
        if (progress && !resolution)
            resolution = 1;
        const round = (n) => n > 1 ? 100 : resolution * Math.round((100 * n) / resolution);
        return new Promise((resolve, reject) => {
            request_1.default.post(url, {
                headers: { "content-type": "application/x-tar" },
                body: tar_fs_1.default.pack(path).on("data", chunk => {
                    totalData += chunk.length;
                    if (progress && fileSize) {
                        let currentProgress = round(totalData / fileSize);
                        if (currentProgress !== previousProgress) {
                            progress(currentProgress);
                            previousProgress = currentProgress;
                        }
                    }
                })
            }, (err, res, body) => {
                if (err)
                    reject(err);
                else if (res.statusCode !== 200)
                    reject(`Status code ${res.statusCode}`);
                else
                    resolve(body);
            });
        });
    });
}
exports.default = uploadRelease;
function getDirSize(dirPath) {
    let totalBytes = 0;
    for (const file of fs_1.default.readdirSync(dirPath)) {
        totalBytes += fs_1.default.statSync(path_1.default.join(dirPath, file)).size;
    }
    return totalBytes;
}
//# sourceMappingURL=uploadRelease.js.map