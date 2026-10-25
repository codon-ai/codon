# BSON-Style ObjectId Generator
Create a 24-character hex BSON ObjectId generator and validator in a single file using node:crypto.

Requirements:
- Import `crypto` from `"node:crypto"`.
- Export class `ObjectId`: maintains 12-byte `Buffer`.
- Constructor accepts optional `id?: string | Buffer`. If string, validates 24-char hex format and loads bytes. If omitted, generates: 4 bytes big-endian timestamp (`Math.floor(Date.now() / 1000)`), 5 random bytes, and 3-byte incrementing counter.
- Method `toString(): string`: returns 24-character hexadecimal representation.
- Method `getTimestamp(): Date`: extracts first 4 bytes as unix timestamp and returns `Date` object.
- Static method `isValid(id: string): boolean`: returns `true` if string is valid 24-character hex, `false` otherwise.
