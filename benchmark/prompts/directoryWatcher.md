# Debounced Directory Watcher
Create a debounced file system directory watcher class in a single file.

Requirements:
- Import `fs` from `"node:fs"`.
- Export class `DirectoryWatcher`.
- Maintain `watcher: fs.FSWatcher | null = null`.
- Maintain `timers = new Map<string, NodeJS.Timeout>()`.
- Method `watch(dirPath: string, debounceMs: number, callback: (eventType: string, filename: string) => void): void`:
- Attach `fs.watch(dirPath, (eventType, filename) => { ... })`.
- Debounce events per filename: if timer exists for `filename`, clear it; start new `setTimeout` for `debounceMs` that deletes timer and calls `callback(eventType, filename)`.
- Method `close(): void`: clears all pending timers and calls `watcher.close()`.
