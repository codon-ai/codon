# Line-by-Line File Stream Reader
Create an async generator reading a file line-by-line using Node streams in a single file.

Requirements:
- Import `fs` from `"node:fs"`.
- Export async function* `readLines(filePath: string): AsyncGenerator<string, void, unknown>`.
- Create readable stream: `const stream = fs.createReadStream(filePath, { encoding: "utf8" })`.
- Maintain an internal buffer string `remainder = ""`.
- For await chunk of stream: append chunk to `remainder`. Split by `\n`.
- Yield each line except the last incomplete fragment. Update `remainder` with the last fragment.
- After stream finishes, if `remainder.length > 0`, yield trimmed `remainder`.
