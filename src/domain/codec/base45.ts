/**
 * Base45 (RFC 9285): bytes as text from the 45 characters a QR code stores most
 * compactly in its alphanumeric mode.
 */
const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';

const VALUE = new Map(Array.from({ length: ALPHABET.length }, (_, i) => [ALPHABET.charAt(i), i]));

export function encodeBase45(bytes: Uint8Array): string {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const digits = (n: number, count: number) => {
    let out = '';
    for (let k = 0; k < count; k += 1) {
      out += ALPHABET.charAt(n % 45);
      n = Math.floor(n / 45);
    }
    return out;
  };
  let out = '';
  for (let i = 0; i + 1 < bytes.length; i += 2) out += digits(view.getUint16(i), 3);
  if (bytes.length % 2) out += digits(view.getUint8(bytes.length - 1), 2);
  return out;
}

/** The bytes, or null if the text isn't valid Base45. */
export function decodeBase45(text: string): Uint8Array | null {
  if (text.length % 3 === 1) return null;
  const values: number[] = [];
  for (const ch of text) {
    const v = VALUE.get(ch);
    if (v === undefined) return null;
    values.push(v);
  }
  const out: number[] = [];
  for (let i = 0; i < values.length; i += 3) {
    const [c = 0, d = 0, e] = values.slice(i, i + 3);
    if (e === undefined) {
      const n = c + d * 45;
      if (n > 0xff) return null;
      out.push(n);
    } else {
      const n = c + d * 45 + e * 45 * 45;
      if (n > 0xffff) return null;
      out.push(n >> 8, n & 0xff);
    }
  }
  return Uint8Array.from(out);
}
