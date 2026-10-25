export class BitPacker {
  constructor(byteLength) {
    const len = byteLength === undefined ? 16 : byteLength;
    this.buffer = new ArrayBuffer(len);
    this.view = new DataView(this.buffer);
    this.bytes = new Uint8Array(this.buffer);
  }

  setUint8(offset, value) {
    this.view.setUint8(offset, value);
  }

  getUint8(offset) {
    return this.view.getUint8(offset);
  }

  setBit(byteOffset, bitIndex, val) {
    const mask = Math.pow(2, bitIndex);
    const current = this.bytes[byteOffset];
    const isSet = Math.floor(current / mask) % 2 === 1;
    if (val) {
      if (!isSet) {
        this.bytes[byteOffset] = current + mask;
      }
    } else {
      if (isSet) {
        this.bytes[byteOffset] = current - mask;
      }
    }
  }

  getBit(byteOffset, bitIndex) {
    const mask = Math.pow(2, bitIndex);
    return Math.floor(this.bytes[byteOffset] / mask) % 2 === 1;
  }

  getBuffer() {
    return this.buffer;
  }
}
