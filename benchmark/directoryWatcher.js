import fs from "node:fs";
export class DirectoryWatcher {
  constructor() {
    this.watcher = null;
    this.timers = new Map();
  }
  watch(dirPath, debounceMs, callback) {
    this.watcher = fs.watch(dirPath, (eventType, filename) => {
      if (!filename) return;
      if (this.timers.has(filename)) clearTimeout(this.timers.get(filename));
      this.timers.set(filename, setTimeout(() => {
        this.timers.delete(filename);
        callback(eventType, filename);
      }, debounceMs));
    });
  }
  close() {
    for (const timer of this.timers.values()) clearTimeout(timer);
    this.timers.clear();
    this.watcher?.close();
  }
}
