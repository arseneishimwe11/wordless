/** Packs small numbers into bytes, most significant bit first. */
export class BitWriter {
  private readonly bits: number[] = [];

  write(value: number, width: number): void {
    for (let i = width - 1; i >= 0; i -= 1) this.bits.push((value >> i) & 1);
  }

  writeBytes(bytes: Uint8Array): void {
    for (const byte of bytes) this.write(byte, 8);
  }

  /** The bytes so far, with the last one padded with zeros. */
  bytes(): Uint8Array {
    return Uint8Array.from({ length: Math.ceil(this.bits.length / 8) }, (_, b) =>
      this.bits.slice(b * 8, b * 8 + 8).reduce((byte, bit, k) => byte | (bit << (7 - k)), 0),
    );
  }
}

/** Thrown when a read runs past the end; the decoder turns it into an "invalid" result. */
export class OutOfData extends Error {}

export class BitReader {
  private position = 0;

  constructor(private readonly data: Uint8Array) {}

  read(width: number): number {
    let value = 0;
    for (let i = 0; i < width; i += 1) {
      const byte = this.data[this.position >> 3];
      if (byte === undefined) throw new OutOfData();
      value = (value << 1) | ((byte >> (7 - (this.position & 7))) & 1);
      this.position += 1;
    }
    return value;
  }

  readBytes(count: number): Uint8Array {
    return Uint8Array.from({ length: count }, () => this.read(8));
  }

  /** True when only zero padding is left (fewer than eight bits, all zero). */
  atPaddedEnd(): boolean {
    const left = this.data.length * 8 - this.position;
    return left < 8 && this.read(left) === 0;
  }
}
