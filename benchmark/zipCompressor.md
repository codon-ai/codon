# Gzip File Stream Compressor
Create a streaming file compression utility using node:zlib in a single file.

Requirements:
- Import `fs` from `"node:fs"`.
- Import `zlib` from `"node:zlib"`.
- Import `{ pipeline }` from `"node:stream/promises"`.
- Export async function `gzipFile(sourcePath: string, destPath: string): Promise<number>`.
- Create readable stream from `sourcePath`, create gzip transform stream `zlib.createGzip()`, and create writable stream to `destPath`.
- Execute `await pipeline(readStream, gzipStream, writeStream)`.
- Obtain output file stats using `fs.promises.stat(destPath)`.
- Return output file size in bytes `stats.size`.
