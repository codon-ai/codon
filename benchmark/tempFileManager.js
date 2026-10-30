import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
export class TempFileManager {
  constructor() {
    this.trackedPaths = [];
  }
  async createTempFile(prefix, content) {
    const filename = `${prefix}-${crypto.randomBytes(6).toString("hex")}`;
    const fullPath = path.join(os.tmpdir(), filename);
    await fs.writeFile(fullPath, content);
    this.trackedPaths.push(fullPath);
    return fullPath;
  }
  async createTempDir(prefix) {
    const fullPath = await fs.mkdtemp(path.join(os.tmpdir(), `${prefix}-`));
    this.trackedPaths.push(fullPath);
    return fullPath;
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
