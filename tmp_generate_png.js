import fs from 'node:fs';
import zlib from 'node:zlib';

function createPNGBuffer(width, height, _r, _g, _b) {
  // 1. PNG Signature
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // 2. IHDR Chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth: 8
  ihdrData[9] = 2; // Color type: 2 (Truecolor RGB)
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace

  const ihdrChunk = createChunk('IHDR', ihdrData);

  // 3. Raw image scanlines (each scanline starts with filter type 0)
  const rawScanlines = Buffer.alloc(height * (1 + width * 3));
  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawScanlines[offset++] = 0; // Filter 0
    for (let x = 0; x < width; x++) {
      // Draw a sleek brand icon: Red background (#C0000C) with white square border in center
      const _isMargin =
        x < width * 0.05 || x > width * 0.95 || y < height * 0.05 || y > height * 0.95;
      const isInnerWhite =
        x > width * 0.25 && x < width * 0.75 && y > height * 0.25 && y < height * 0.75;
      const isCenterRed =
        x > width * 0.4 && x < width * 0.6 && y > height * 0.4 && y < height * 0.6;

      if (isInnerWhite && !isCenterRed) {
        rawScanlines[offset++] = 255;
        rawScanlines[offset++] = 255;
        rawScanlines[offset++] = 255;
      } else {
        rawScanlines[offset++] = 0xc0; // R: 192
        rawScanlines[offset++] = 0x00; // G: 0
        rawScanlines[offset++] = 0x0c; // B: 12
      }
    }
  }

  // Deflate compressed IDAT
  const compressedData = zlib.deflateSync(rawScanlines);
  const idatChunk = createChunk('IDAT', compressedData);

  // 4. IEND Chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(8 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);

  const crc = crc32(buf.subarray(4, 8 + len));
  buf.writeUInt32BE(crc >>> 0, 8 + len);
  return buf;
}

// Simple CRC32 table & function for PNG chunk integrity
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return crc ^ -1;
}

// Generate 192x192 and 512x512 icons
const png192 = createPNGBuffer(192, 192);
const png512 = createPNGBuffer(512, 512);

fs.writeFileSync(
  'c:/Users/Administrator/Documents/ROWLAND/raffle-project/raffle-app/public/images/icon-192.png',
  png192,
);
fs.writeFileSync(
  'c:/Users/Administrator/Documents/ROWLAND/raffle-project/raffle-app/public/images/icon-512.png',
  png512,
);

console.log('Successfully generated valid PNG icons: icon-192.png and icon-512.png');
