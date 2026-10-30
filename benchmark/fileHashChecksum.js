import fs from "node:fs";
import crypto from "node:crypto";
export async function computeFileChecksum(filePath, algorithm) {
  const hash = crypto.createHash(algorithm);
  const stream = fs.createReadStream(filePath);
  for await (const chunk of stream) hash.update(chunk);
  return hash.digest("hex");
}
