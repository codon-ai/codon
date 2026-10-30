import fs from "node:fs/promises";
import path from "node:path";
export async function scanDir(dir, extension) {
  let results = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(await scanDir(full, extension));
    } else if (entry.name.endsWith(extension)) {
      const stat = await fs.stat(full);
      results.push({ path: full, size: stat.size });
    }
  }
  return results;
}
async function main() {
  const dir = process.argv[2] || ".";
  const ext = process.argv[3] || ".ts";
  const files = await scanDir(dir, ext);
  const total = files.reduce((s, f) => s + f.size, 0);
  console.log(`Found ${files.length} files (${total} bytes):`);
  files.forEach(f => console.log(` - ${f.path} (${f.size} bytes)`));
}
if (process.argv[1] && process.argv[1].endsWith("cliFileScanner.js")) {
  main();
}
