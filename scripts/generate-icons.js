import fs from 'node:fs';
import zlib from 'node:zlib';

// Simple CRC32 implementation for PNG chunks
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const len = data.length;
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(len, 0);

  const crcPayload = Buffer.concat([typeBuf, data]);
  const crcVal = crc32(crcPayload);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);

  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function createPng(size, isMaskable = false) {
  const width = size;
  const height = size;
  const rawBytes = Buffer.alloc((width * 4 + 1) * height);

  const center = size / 2;
  const radius = size * (isMaskable ? 0.45 : 0.42);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (width * 4 + 1);
    rawBytes[rowOffset] = 0; // Filter byte: None

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const dx = x - center;
      const dy = y - center;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background
      let r = 15;
      let g = 23;
      let b = 42; // #0f172a slate-900
      let a = 255;

      if (!isMaskable) {
        // Rounded squircle / circular app icon
        const cornerDist = Math.max(Math.abs(dx), Math.abs(dy));
        if (cornerDist > size * 0.46) {
          a = 0; // transparent corners for normal icon
        }
      }

      // Emerald shield / lock emblem in center
      // Shield outline math
      const shieldY = dy + size * 0.05;
      const shieldW = size * 0.28;
      const shieldH = size * 0.32;

      if (a > 0 && Math.abs(dx) <= shieldW && shieldY >= -shieldH * 0.8 && shieldY <= shieldH) {
        const factor = 1 - (shieldY / shieldH) * 0.5;
        if (Math.abs(dx) <= shieldW * (shieldY > 0 ? Math.cos((shieldY / shieldH) * (Math.PI / 2)) : 1)) {
          // Inside shield: Emerald gradient
          const gradient = (y / size);
          r = Math.round(16 * (1 - gradient) + 5 * gradient);
          g = Math.round(185 * (1 - gradient) + 150 * gradient);
          b = Math.round(129 * (1 - gradient) + 105 * gradient);

          // Inner white lock / checkmark / doc icon
          if (Math.abs(dx) < size * 0.1 && Math.abs(shieldY) < size * 0.12) {
            // White center emblem
            r = 255;
            g = 255;
            b = 255;
          }
        }
      }

      rawBytes[pixelOffset] = r;
      rawBytes[pixelOffset + 1] = g;
      rawBytes[pixelOffset + 2] = b;
      rawBytes[pixelOffset + 3] = a;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 6; // Color type: RGBA (6)
  ihdr[10] = 0; // Compression method
  ihdr[11] = 0; // Filter method
  ihdr[12] = 0; // Interlace method

  const compressedData = zlib.deflateSync(rawBytes, { level: 9 });

  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

if (!fs.existsSync('./public')) {
  fs.mkdirSync('./public', { recursive: true });
}

fs.writeFileSync('./public/pwa-192x192.png', createPng(192, false));
fs.writeFileSync('./public/pwa-512x512.png', createPng(512, false));
fs.writeFileSync('./public/pwa-maskable-512x512.png', createPng(512, true));
fs.writeFileSync('./public/apple-touch-icon.png', createPng(180, false));

// SVG icon for browser tab
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" rx="128" fill="#0F172A"/>
  <path d="M256 96L144 144V260C144 336 192 404 256 424C320 404 368 336 368 260V144L256 96Z" fill="url(#emeraldGrad)"/>
  <path d="M224 240V216C224 198.327 238.327 184 256 184C273.673 184 288 198.327 288 216V240M208 240H304C312.837 240 320 247.163 320 256V320C320 328.837 312.837 336 304 336H208C199.163 336 192 328.837 192 320V256C192 247.163 199.163 240 208 240Z" stroke="#FFFFFF" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/>
  <defs>
    <linearGradient id="emeraldGrad" x1="144" y1="96" x2="368" y2="424" gradientUnits="userSpaceOnUse">
      <stop stop-color="#10B981"/>
      <stop offset="1" stop-color="#059669"/>
    </linearGradient>
  </defs>
</svg>`;

fs.writeFileSync('./public/icon.svg', svgIcon);
console.log('Icons generated successfully in /public');
