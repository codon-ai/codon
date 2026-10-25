# Temporary File and Directory Manager
Create a temporary file and directory manager with automated cleanup in a single file.

Requirements:
- Import `fs` from `"node:fs/promises"`.
- Import `os` from `"node:os"`.
- Import `path` from `"node:path"`.
- Export class `TempFileManager`: maintain array `trackedPaths: string[] = []`.
- Method `async createTempFile(prefix: string, content: string): Promise<string>`: creates unique file in `os.tmpdir()` with random suffix, writes `content`, tracks path, and returns absolute path.
- Method `async createTempDir(prefix: string): Promise<string>`: creates unique directory in `os.tmpdir()` using `fs.mkdtemp`, tracks path, and returns absolute path.
- Method `async cleanup(): Promise<number>`: deletes all tracked files and directories using `fs.rm(p, { recursive: true, force: true })`, resets tracked list, and returns count of deleted items.
