// --------- Hamming (8,4) simplifié ---------

// Encode un nibble (4 bits) en octet protégé (7 bits utiles)
function hammingEncodeNibble(n: number): number {
  const d0 = (n >> 0) & 1;
  const d1 = (n >> 1) & 1;
  const d2 = (n >> 2) & 1;
  const d3 = (n >> 3) & 1;

  const p0 = d3 ^ d2 ^ d0;
  const p1 = d3 ^ d1 ^ d0;
  const p2 = d2 ^ d1 ^ d0;

  return (p0 << 7) | (p1 << 6) | (d3 << 5) | (p2 << 4) | (d2 << 3) | (d1 << 2) | (d0 << 1);
}

function hammingDecodeNibble(n: number): [number, boolean] {
  const p0 = (n >> 7) & 1;
  const p1 = (n >> 6) & 1;
  const d3 = (n >> 5) & 1;
  const p2 = (n >> 4) & 1;
  const d2 = (n >> 3) & 1;
  const d1 = (n >> 2) & 1;
  const d0 = (n >> 1) & 1;

  const s0 = p0 ^ (d3 ^ d2 ^ d0);
  const s1 = p1 ^ (d3 ^ d1 ^ d0);
  const s2 = p2 ^ (d2 ^ d1 ^ d0);
  const syndrome = (s0 << 2) | (s1 << 1) | s2;

  let corrected = n;
  let correctedBit = false;

  if (syndrome !== 0) {
    const bitToFlip = 7 - syndrome;
    corrected ^= 1 << bitToFlip;
    correctedBit = true;
  }

  const decodedNibble =
    ((corrected >> 5) & 1) << 3 |
    ((corrected >> 3) & 1) << 2 |
    ((corrected >> 2) & 1) << 1 |
    ((corrected >> 1) & 1);

  return [decodedNibble, correctedBit];
}

// Encode un tableau complet
export function hammingEncode(data: Uint8Array): Uint8Array {
  const out = new Uint8Array(data.length * 2);
  let j = 0;
  for (const byte of data) {
    const hi = (byte >> 4) & 0xf;
    const lo = byte & 0xf;
    out[j++] = hammingEncodeNibble(hi);
    out[j++] = hammingEncodeNibble(lo);
  }
  return out;
}

// Decode un tableau complet
export function hammingDecode(data: Uint8Array): Uint8Array {
  const out = new Uint8Array(data.length / 2);
  for (let i = 0, j = 0; i < data.length; i += 2) {
    const [hi] = hammingDecodeNibble(data[i]!);
    const [lo] = hammingDecodeNibble(data[i + 1]!);
    out[j++] = (hi << 4) | lo;
  }
  return out;
}
