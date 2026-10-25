import crypto from "node:crypto";

export async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const derivedKey = await new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, key) => {
      if (err) reject(err);
      else resolve(key);
    });
  });
  return `${salt.toString("hex")}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password, storedHash) {
  const [saltHex, hashHex] = storedHash.split(":");
  const salt = Buffer.from(saltHex, "hex");
  const storedKey = Buffer.from(hashHex, "hex");
  const derivedKey = await new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, key) => {
      if (err) reject(err);
      else resolve(key);
    });
  });
  return crypto.timingSafeEqual(storedKey, derivedKey);
}
