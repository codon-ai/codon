import fs from "node:fs";
export async function* readLines(filePath) {
  const stream = fs.createReadStream(filePath, { encoding: "utf8" });
  let remainder = "";
  for await (const chunk of stream) {
    remainder += chunk;
    const lines = remainder.split("\n");
    remainder = lines.pop();
    for (const line of lines) yield line;
  }
  if (remainder.length > 0) yield remainder.trim();
}
