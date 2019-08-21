import { Bzz } from "@erebos/api-bzz-node"; // node
import request from "request";
import fs from "fs";
import { join } from "path";
const _cliProgress = require("cli-progress");
import { downloadDir, gatewayUrl } from "./params";

const bzz = new Bzz({ url: gatewayUrl });

export default async function downloadRelease(releaseDirHash: string) {
  const { entries } = await bzz.list(releaseDirHash);
  console.table(
    entries.reduce((acc: any, { path, ...x }) => {
      acc[path] = x;
      return acc;
    }, {}),
    ["size", "hash"]
  );

  // Download manifest to memory
  console.log("Downloading avatar...");
  const manifestEntry = entries.find(({ path }) => path.endsWith(".json"));
  const manifest = await bzz
    .download(manifestEntry.hash, { mode: "raw" })
    .then(res => res.json());
  console.log("Downloaded manifest");
  console.log(manifest);

  // Download avatar to disk
  console.log("Downloading avatar...");
  const avatarEntry = entries.find(({ path }) => path.endsWith(".png"));
  await bzz.downloadFileTo(avatarEntry.hash, join(downloadDir, "avatar.png"), {
    mode: "raw"
  });
  console.log("Downloaded avatar");

  // Download image to disk
  const imageEntry = entries.find(({ path }) => path.endsWith(".tar.xz"));
  console.log("Downloading image...");
  const bar = new _cliProgress.SingleBar();
  bar.start(100, 0);
  await downloadFileWithProgress(
    imageEntry.hash,
    join(downloadDir, "image.tar.xz"),
    imageEntry.size,
    (progress: number) => bar.update(progress),
    2
  );
  bar.stop();
  console.log("Downloaded image");
}

function downloadFileWithProgress(
  hash: string,
  path: string,
  fileSize?: number,
  progress?: (n: number) => void,
  resolution?: number
) {
  let totalData = 0;
  let previousProgress = -1;
  if (fileSize && progress && !resolution) resolution = 1;
  const round = (n: number) => resolution * Math.round((100 * n) / resolution);

  return new Promise((resolve, reject) => {
    request
      .get(`${gatewayUrl}/bzz-raw:/${hash}/`)
      .on("error", reject)
      .on("response", function(res) {
        if (res.statusCode !== 200) reject(`Status code ${res.statusCode}`);
      })
      .on("data", function(chunk) {
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
      .pipe(fs.createWriteStream(path));
  });
}
