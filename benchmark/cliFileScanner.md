# CLI File Scanner
Create a command-line directory file scanner in a single file using Node's built-in "node:fs/promises" and "node:path".

Requirements:
- Export an async function `scanDir(dir: string, extension: string): Promise<FileEntry[]>` where `FileEntry` has `{ path: string, size: number }`.
  - Read directory entries using `fs.readdir(dir, { withFileTypes: true })`.
  - Recursively call `scanDir` for subdirectories and accumulate results.
  - For files matching `entry.name.endsWith(extension)`, call `fs.stat(fullPath)` and collect `{ path: fullPath, size: stats.size }`.
- An async `main()` function:
  - Target directory from `process.argv[2] || "."` and extension from `process.argv[3] || ".ts"`.
  - Calls `scanDir`, sums total size using `reduce`.
  - Logs `Found <count> files (<totalSize> bytes):` followed by each file line: ` - <path> (<size> bytes)`.
- Execute `main()` when run as the main script.
