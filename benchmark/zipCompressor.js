import fs from "node:fs";
import zlib from "node:zlib";
import { pipeline } from "node:stream/promises";
export async function gzipFile(sourcePath, destPath) {
  const readStream = fs.createReadStream(sourcePath);
  const gzipStream = zlib.createGzip();
  const writeStream = fs.createWriteStream(destPath);
  await pipeline(readStream, gzipStream, writeStream);
  const stats = await fs.promises.stat(destPath);
  return stats.size;
}
