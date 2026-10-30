# Array Chunking Utility
Create an array chunking utility in a single file.

Requirements:
- Export function `chunkArray<T>(arr: T[], size: number): T[][]`.
- If `size <= 0`, throw `new Error("Chunk size must be greater than 0")`.
- Maintain `chunks: T[][] = []`.
- Loop `i` from `0` to `arr.length` incrementing by `size`.
- Slice subarray `arr.slice(i, i + size)` and push to `chunks`.
- Return `chunks`.
