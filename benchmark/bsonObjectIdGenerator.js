import crypto from "node:crypto";
let counter = Math.floor(Math.random() * 0xffffff);
export class ObjectId {
  constructor(id) {
    if (typeof id === "string") {
      if (!ObjectId.isValid(id)) throw new Error("Invalid ObjectId string");
      this.buffer = Buffer.from(id, "hex");
    } else if (Buffer.isBuffer(id)) {
      this.buffer = id;
    } else {
      const buf = Buffer.alloc(12);
      buf.writeUInt32BE(Math.floor(Date.now() / 1000), 0);
      crypto.randomBytes(5).copy(buf, 4);
      counter = (counter + 1) & 0xffffff;
      buf.writeUIntBE(counter, 9, 3);
      this.buffer = buf;
    }
  }
  toString() { return this.buffer.toString("hex"); }
  getTimestamp() { return new Date(this.buffer.readUInt32BE(0) * 1000); }
  static isValid(id) { return typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id); }
}
