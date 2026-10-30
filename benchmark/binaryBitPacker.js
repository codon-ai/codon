export class BitPacker {
  constructor(byteLength = 16) {
    this.buffer = new ArrayBuffer(byteLength);
    this.view = new DataView(this.buffer);
    this.bytes = new Uint8Array(this.buffer);
  }
  setUint8(offset, value) { this.view.setUint8(offset, value); }
  getUint8(offset) { return this.view.getUint8(offset); }
  setBit(byteOffset, bitIndex, val) {
    const b = this.bytes[byteOffset];
    this.bytes[byteOffset] = val ? (b | (1 << bitIndex)) : (b & ~(1 << bitIndex));
  }
  getBit(byteOffset, bitIndex) { return Boolean((this.bytes[byteOffset] >> bitIndex) & 1); }
  getBuffer() { return this.buffer; }
}
