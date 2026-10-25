import fs from "node:fs/promises";
import path from "node:path";

export async function scanDir(dir, extension) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const results = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await scanDir(fullPath, extension)));
    } else if (entry.isFile() && entry.name.endsWith(extension)) {
      const stats = await fs.stat(fullPath);
      results.push({ path: fullPath, size: stats.size });
    }
  }

  return results;
}

async function main() {
  const targetDir = process.argv[2] || ".";
  const ext = process.argv[3] || ".ts";
  const files = await scanDir(targetDir, ext);
  const totalSize = files.reduce((acc, f) => acc + f.size, 0);

  console.log(`Found ${files.length} files (${totalSize} bytes):`);
  for (const file of files) {
    console.log(` - ${file.path} (${file.size} bytes)`);
  }
}

if (process.argv[1]?.endsWith("cliFileScanner.js")) {
  main().catch(console.error);
}
