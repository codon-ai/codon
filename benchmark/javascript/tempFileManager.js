import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

export class TempFileManager {
  constructor() {
    this.trackedPaths = [];
  }

  async createTempFile(prefix, content) {
    const filename = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}.tmp`;
    const filePath = path.join(os.tmpdir(), filename);
    await fs.writeFile(filePath, content, "utf8");
    this.trackedPaths.push(filePath);
    return filePath;
  }

  async createTempDir(prefix) {
    const dirPath = await fs.mkdtemp(path.join(os.tmpdir(), `${prefix}-`));
    this.trackedPaths.push(dirPath);
    return dirPath;
  }

  async cleanup() {
    let count = 0;
    for (const p of this.trackedPaths) {
      await fs.rm(p, { recursive: true, force: true });
      count++;
    }
    this.trackedPaths = [];
    return count;
  }
}
