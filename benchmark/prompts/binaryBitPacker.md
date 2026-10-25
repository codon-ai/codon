# Binary Bit and Integer Packer
Create a binary bit and integer packer using ArrayBuffer and DataView in a single file.

Requirements:
- Export class `BitPacker`: constructor accepts `byteLength: number = 16`.
- Maintains `buffer: ArrayBuffer`, `view: DataView`, `bytes: Uint8Array`.
- Method `setUint8(offset: number, value: number): void`: writes byte using `view.setUint8`.
- Method `getUint8(offset: number): number`: reads byte using `view.getUint8`.
- Method `setBit(byteOffset: number, bitIndex: number, val: boolean): void`: sets or clears specific bit (0-7) at byte offset using bitwise AND/OR masks.
- Method `getBit(byteOffset: number, bitIndex: number): boolean`: reads specific bit at byte offset using bitwise AND.
- Method `getBuffer(): ArrayBuffer`: returns underlying buffer.
