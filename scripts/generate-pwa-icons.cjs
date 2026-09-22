const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

function createPng(width, height, getPixel) {
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[n] = c;
  }
  function crc32(buf) {
    let crc = -1;
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
    }
    return (crc ^ -1) >>> 0;
  }
  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(typeAndData), 0);
    return Buffer.concat([len, typeAndData, crc]);
  }

  const sig = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6;
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdr = chunk('IHDR', ihdrData);

  const scanlines = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;
  for (let y = 0; y < height; y++) {
    scanlines[offset++] = 0;
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y, width, height);
      scanlines[offset++] = r;
      scanlines[offset++] = g;
      scanlines[offset++] = b;
      scanlines[offset++] = a;
    }
  }

  const idat = chunk('IDAT', zlib.deflateSync(scanlines, { level: 9 }));
  const iend = chunk('IEND', Buffer.alloc(0));
  return Buffer.concat([sig, ihdr, idat, iend]);
}

// Color interpolator
function lerp(a, b, t) {
  return a + (b - a) * t;
}

function renderVaultIcon(x, y, w, h, isMaskable) {
  const nx = x / w;
  const ny = y / h;
  const cx = 0.5;
  const cy = 0.5;
  const dx = nx - cx;
  const dy = ny - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Background Gradient: Indigo-500 (#6366F1) to Indigo-900 (#312E81)
  const gradT = (nx + ny) / 2;
  let bgR = Math.round(lerp(99, 49, gradT));
  let bgG = Math.round(lerp(102, 46, gradT));
  let bgB = Math.round(lerp(241, 129, gradT));
  let bgA = 255;

  if (!isMaskable) {
    // Rounded squircle corner for standard app icon
    const cornerRadius = 0.20;
    const qx = Math.max(0, Math.abs(nx - 0.5) - (0.5 - cornerRadius));
    const qy = Math.max(0, Math.abs(ny - 0.5) - (0.5 - cornerRadius));
    const cornerDist = Math.sqrt(qx * qx + qy * qy);
    if (cornerDist > cornerRadius) {
      return [0, 0, 0, 0]; // Transparent outside icon corner
    }
  }

  // Scaling factor: maskable icons need smaller vault within 75% safe area
  const scale = isMaskable ? 0.72 : 0.86;
  const mx = (nx - 0.5) / scale + 0.5;
  const my = (ny - 0.5) / scale + 0.5;
  const mdx = mx - 0.5;
  const mdy = my - 0.5;
  const mDist = Math.sqrt(mdx * mdx + mdy * mdy);

  // Vault Plate: centered square with rounded corners
  const halfPlate = 0.36;
  const plateRadius = 0.08;
  const px = Math.max(0, Math.abs(mdx) - (halfPlate - plateRadius));
  const py = Math.max(0, Math.abs(mdy) - (halfPlate - plateRadius));
  const plateDist = Math.sqrt(px * px + py * py);
  const inPlate = plateDist <= plateRadius && Math.abs(mdx) <= halfPlate && Math.abs(mdy) <= halfPlate;

  if (inPlate) {
    // Plate border
    const isBorder = plateDist > (plateRadius - 0.015) || 
                     (Math.abs(mdx) > (halfPlate - 0.015) && plateDist <= plateRadius) || 
                     (Math.abs(mdy) > (halfPlate - 0.015) && plateDist <= plateRadius);
    if (isBorder) {
      return [165, 180, 252, 240]; // Light Indigo border
    }

    // Four corner rivets
    const rivetOffsets = [-0.28, 0.28];
    for (const rx of rivetOffsets) {
      for (const ry of rivetOffsets) {
        const rdx = mdx - rx;
        const rdy = mdy - ry;
        if (Math.sqrt(rdx * rdx + rdy * rdy) < 0.024) {
          return [199, 210, 254, 255]; // Shiny rivet bolt
        }
      }
    }

    // Vault Door Outer Dial Ring
    if (mDist <= 0.20 && mDist >= 0.16) {
      return [255, 255, 255, 255]; // Chrome ring
    }
    // Dial body
    if (mDist < 0.16 && mDist >= 0.07) {
      // 4 tick lines
      const isTick = (Math.abs(mdx) < 0.012 && Math.abs(mdy) > 0.09 && Math.abs(mdy) < 0.15) ||
                     (Math.abs(mdy) < 0.012 && Math.abs(mdx) > 0.09 && Math.abs(mdx) < 0.15);
      if (isTick) {
        return [224, 231, 255, 255];
      }
      return [79, 70, 229, 255]; // Indigo dial face
    }
    // Dial center knob
    if (mDist < 0.07 && mDist >= 0.025) {
      return [255, 255, 255, 255]; // White knob ring
    }
    if (mDist < 0.025) {
      return [55, 48, 163, 255]; // Dark inner bolt
    }

    // Plate background color (Dark Slate Indigo)
    return [40, 36, 92, 255];
  }

  return [bgR, bgG, bgB, bgA];
}

const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

console.log('Generating PWA icons for APK compatibility...');

// 1. icon-192.png
const pwa192 = createPng(192, 192, (x, y, w, h) => renderVaultIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'icon-192.png'), pwa192);
console.log('Generated icon-192.png');

// 2. icon-512.png
const pwa512 = createPng(512, 512, (x, y, w, h) => renderVaultIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), pwa512);
console.log('Generated icon-512.png');

// 3. icon-maskable-512.png
const pwaMaskable = createPng(512, 512, (x, y, w, h) => renderVaultIcon(x, y, w, h, true));
fs.writeFileSync(path.join(publicDir, 'icon-maskable-512.png'), pwaMaskable);
console.log('Generated icon-maskable-512.png');

// 4. apple-touch-icon.png (180x180)
const appleTouch = createPng(180, 180, (x, y, w, h) => renderVaultIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleTouch);
console.log('Generated apple-touch-icon.png');

// 5. favicon.png (32x32)
const favicon = createPng(32, 32, (x, y, w, h) => renderVaultIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'favicon.png'), favicon);
console.log('Generated favicon.png');

console.log('All PWA icon assets successfully generated!');
