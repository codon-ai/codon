# File Hash Checksum Calculator
Create a streaming file checksum utility using node:crypto in a single file.

Requirements:
- Import `fs` from `"node:fs"`.
- Import `crypto` from `"node:crypto"`.
- Export async function `computeFileChecksum(filePath: string, algorithm: "md5" | "sha256"): Promise<string>`.
- Create hash stream: `const hash = crypto.createHash(algorithm)`.
- Create read stream: `const stream = fs.createReadStream(filePath)`.
- Pipe or stream file chunks into hash: `for await (const chunk of stream) hash.update(chunk)`.
- Return `hash.digest("hex")`.
