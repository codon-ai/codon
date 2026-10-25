# Scrypt Password Hasher
Create a password hashing and verification utility using node:crypto scrypt in a single file.

Requirements:
- Import `crypto` from `"node:crypto"`.
- Export async function `hashPassword(password: string): Promise<string>`.
- Generates 16 random salt bytes using `crypto.randomBytes(16)`.
- Hashes password using `crypto.scrypt(password, salt, 64)`.
- Returns formatted string ``${salt.toString("hex")}:${derivedKey.toString("hex")}`.
- Export async function `verifyPassword(password: string, storedHash: string): Promise<boolean>`.
- Splits `storedHash` into salt and hash buffers. Computes scrypt key with same salt. Compares buffers using `crypto.timingSafeEqual`. Returns `true` if equal, `false` otherwise.
