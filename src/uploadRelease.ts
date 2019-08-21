import { Bzz } from "@erebos/api-bzz-node"; // node
import { gatewayUrl } from "./params";
import tarFS from "tar-fs";
import request from "request";
import fs from "fs";
import path from "path";

const bzz = new Bzz({ url: gatewayUrl });

export default async function uploadRelease(
  path: string,
  progress?: (n: number) => void,
  resolution?: number
): Promise<string> {
  const url = `${gatewayUrl}/bzz:/`;
  // const url = `${gatewayUrl}/bzz-raw:/`;
  // const url = `${gatewayUrl}/bzz:/?defaultpath=${options.defaultPath}`;

  const fileSize = getDirSize(path);
  let totalData = 0;
  let previousProgress = -1;
  if (progress && !resolution) resolution = 1;
  const round = (n: number) =>
    n > 1 ? 100 : resolution * Math.round((100 * n) / resolution);

  return new Promise((resolve, reject) => {
    request.post(
      url,
      {
        headers: { "content-type": "application/x-tar" },
        body: tarFS.pack(path).on("data", chunk => {
          totalData += chunk.length;
          if (progress && fileSize) {
            let currentProgress = round(totalData / fileSize);
            if (currentProgress !== previousProgress) {
              progress(currentProgress);
              previousProgress = currentProgress;
            }
          }
        })
      },
      (err, res, body) => {
        if (err) reject(err);
        else if (res.statusCode !== 200)
          reject(`Status code ${res.statusCode}`);
        else resolve(body);
      }
    );
  });
}

function getDirSize(dirPath: string) {
  let totalBytes = 0;
  for (const file of fs.readdirSync(dirPath)) {
    totalBytes += fs.statSync(path.join(dirPath, file)).size;
  }
  return totalBytes;
}
