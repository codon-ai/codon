import crypto from "node:crypto";

let objectIdCounter = Math.floor(Math.random() * 16777216);

export class ObjectId {
  constructor(id) {
    if (typeof id === "string") {
      if (!ObjectId.isValid(id)) {
        throw new Error("Invalid ObjectId hex string");
      }
      this.bytes = Buffer.from(id, "hex");
    } else if (Buffer.isBuffer(id)) {
      this.bytes = id;
    } else {
      const timeBuf = Buffer.alloc(4);
      timeBuf.writeUInt32BE(Math.floor(Date.now() / 1000), 0);
      const randomBuf = crypto.randomBytes(5);
      const countBuf = Buffer.alloc(3);
      objectIdCounter = (objectIdCounter + 1) % 16777216;
      countBuf.writeUIntBE(objectIdCounter, 0, 3);
      this.bytes = Buffer.concat([timeBuf, randomBuf, countBuf]);
    }
  }

  toString() {
    return this.bytes.toString("hex");
  }

  getTimestamp() {
    return new Date(this.bytes.readUInt32BE(0) * 1000);
  }

  static isValid(id) {
    if (typeof id !== "string" || id.length !== 24) {
      return false;
    }
    for (let i = 0; i < id.length; i++) {
      const ch = id.charCodeAt(i);
      const isNum = ch >= 48 && ch <= 57;
      const isLower = ch >= 97 && ch <= 102;
      const isUpper = ch >= 65 && ch <= 70;
      if (!isNum && !isLower && !isUpper) return false;
    }
    return true;
  }
}
