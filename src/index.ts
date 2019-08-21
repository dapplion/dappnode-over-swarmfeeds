import { Bzz } from "@erebos/api-bzz-node"; // node
import { pubKeyToAddress } from "@erebos/keccak256";
import { createKeyPair, sign } from "@erebos/secp256k1";
import downloadRelease from "./downloadRelease";
import uploadRelease from "./uploadRelease";
import rimraf from "rimraf";
const _cliProgress = require("cli-progress");
import { gatewayUrl, dirPath, testFeedName, downloadDir } from "./params";

// This setup is meant for demonstration purpose only - keys and signatures security must be handled by the application
const keyPair = createKeyPair();
const user = pubKeyToAddress(keyPair.getPublic("array"));
const signBytes = async (bytes: any) => sign(bytes, keyPair);
const bzz = new Bzz({ url: gatewayUrl, signBytes });

start();

async function start() {
  /**
   * Clean previously downloaded release
   */
  rimraf.sync(downloadDir);

  /**
   * Upload a directory to swarm
   */
  console.log("Uploading release...");
  const bar = new _cliProgress.SingleBar();
  bar.start(100, 0);
  const uploadedDirHash = await uploadRelease(
    "build_0.1.0",
    (progress: number) => bar.update(progress),
    2
  );
  bar.stop();
  console.log(`Uploaded release: ${gatewayUrl}/bzz-raw:/${uploadedDirHash}`);

  /**
   * Create a feed, if it doesn't exist, and post an update to it
   */
  console.log(`Creating feed and posting new release...`);
  const feedHash = await bzz.createFeedManifest({
    user,
    name: testFeedName
  });
  await bzz.setFeedContent(feedHash, uploadedDirHash);
  console.log(`Feed hash: ${gatewayUrl}/bzz-raw:/${feedHash}`);

  /**
   * Query the feed for the hash
   */
  console.log(`Querying latest release from feed...`);
  const queriedDirHash = await bzz
    .getFeedContent(
      {
        user,
        name: testFeedName
      },
      { mode: "raw" }
    )
    .then(res => res.text());

  console.log(
    `Latest release from feed: ${gatewayUrl}/bzz-raw:/${queriedDirHash}`
  );

  /**
   * Download directory
   */
  await downloadRelease(queriedDirHash);
}
