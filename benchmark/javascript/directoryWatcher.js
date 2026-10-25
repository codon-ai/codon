import fs from "node:fs";

export class DirectoryWatcher {
  constructor() {
    this.watcher = null;
    this.timers = new Map();
  }

  watch(dirPath, debounceMs, callback) {
    this.watcher = fs.watch(dirPath, (eventType, filename) => {
      if (!filename) return;
      if (this.timers.has(filename)) {
        clearTimeout(this.timers.get(filename));
      }
      const timer = setTimeout(() => {
        this.timers.delete(filename);
        callback(eventType, filename);
      }, debounceMs);
      this.timers.set(filename, timer);
    });
  }

  close() {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
  }
}
