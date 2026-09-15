/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PrivacyScanResult, PrivacyScanItem } from '../types';

export async function calculateFileHash(file: File, algorithm: 'SHA-256' | 'SHA-512' | 'SHA-1' | 'MD5'): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();

  if (algorithm === 'MD5') {
    return computeMd5Hex(new Uint8Array(arrayBuffer));
  }

  const hashBuffer = await crypto.subtle.digest(algorithm, arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Pure client-side MD5 implementation for quick hashing
function computeMd5Hex(bytes: Uint8Array): string {
  function safeAdd(x: number, y: number): number {
    const lsw = (x & 0xffff) + (y & 0xffff);
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xffff);
  }
  function bitRol(num: number, cnt: number): number {
    return (num << cnt) | (num >>> (32 - cnt));
  }
  function md5cmn(q: number, a: number, b: number, x: number, s: number, t: number): number {
    return safeAdd(bitRol(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
  }
  function md5ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return md5cmn((b & c) | (~b & d), a, b, x, s, t);
  }
  function md5gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return md5cmn((b & d) | (c & ~d), a, b, x, s, t);
  }
  function md5hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return md5cmn(b ^ c ^ d, a, b, x, s, t);
  }
  function md5ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return md5cmn(c ^ (b | ~d), a, b, x, s, t);
  }

  const nwords = ((bytes.length + 8) >> 6) + 1;
  const x = new Int32Array(nwords * 16);
  for (let i = 0; i < bytes.length; i++) {
    x[i >> 2] |= bytes[i] << ((i % 4) * 8);
  }
  x[bytes.length >> 2] |= 0x80 << ((bytes.length % 4) * 8);
  x[nwords * 16 - 2] = bytes.length * 8;

  let a = 1732584193;
  let b = -271733879;
  let c = -1732584194;
  let d = 271733878;

  for (let i = 0; i < x.length; i += 16) {
    const olda = a;
    const oldb = b;
    const oldc = c;
    const oldd = d;

    a = md5ff(a, b, c, d, x[i + 0], 7, -680876936);
    d = md5ff(d, a, b, c, x[i + 1], 12, -389564586);
    c = md5ff(c, d, a, b, x[i + 2], 17, 606105819);
    b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330);
    a = md5ff(a, b, c, d, x[i + 4], 7, -176418897);
    d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426);
    c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341);
    b = md5ff(b, c, d, a, x[i + 7], 22, -45705983);
    a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416);
    d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417);
    c = md5ff(c, d, a, b, x[i + 10], 17, -42063);
    b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162);
    a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682);
    d = md5ff(d, a, b, c, x[i + 13], 12, -40341101);
    c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290);
    b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329);

    a = md5gg(a, b, c, d, x[i + 1], 5, -165796510);
    d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632);
    c = md5gg(c, d, a, b, x[i + 11], 14, 643717713);
    b = md5gg(b, c, d, a, x[i + 0], 20, -373897302);
    a = md5gg(a, b, c, d, x[i + 5], 5, -701558691);
    d = md5gg(d, a, b, c, x[i + 10], 9, 38016083);
    c = md5gg(c, d, a, b, x[i + 15], 14, -660478335);
    b = md5gg(b, c, d, a, x[i + 4], 20, -405537848);
    a = md5gg(a, b, c, d, x[i + 9], 5, 568446438);
    d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690);
    c = md5gg(c, d, a, b, x[i + 3], 14, -187363961);
    b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501);
    a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467);
    d = md5gg(d, a, b, c, x[i + 2], 9, -51403784);
    c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473);
    b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734);

    a = md5hh(a, b, c, d, x[i + 5], 4, -378558);
    d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463);
    c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562);
    b = md5hh(b, c, d, a, x[i + 14], 23, -35309556);
    a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060);
    d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353);
    c = md5hh(c, d, a, b, x[i + 7], 16, -155497632);
    b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640);
    a = md5hh(a, b, c, d, x[i + 13], 4, 681279174);
    d = md5hh(d, a, b, c, x[i + 0], 11, -358537222);
    c = md5hh(c, d, a, b, x[i + 3], 16, -722521979);
    b = md5hh(b, c, d, a, x[i + 6], 23, 76029189);
    a = md5hh(a, b, c, d, x[i + 9], 4, -640364487);
    d = md5hh(d, a, b, c, x[i + 12], 11, -421815835);
    c = md5hh(c, d, a, b, x[i + 15], 16, 530742520);
    b = md5hh(b, c, d, a, x[i + 2], 23, -995338651);

    a = md5ii(a, b, c, d, x[i + 0], 6, -198630844);
    d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415);
    c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905);
    b = md5ii(b, c, d, a, x[i + 5], 21, -57434055);
    a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571);
    d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606);
    c = md5ii(c, d, a, b, x[i + 10], 15, -1051523);
    b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799);
    a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359);
    d = md5ii(d, a, b, c, x[i + 15], 10, -30611744);
    c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380);
    b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649);
    a = md5ii(a, b, c, d, x[i + 4], 6, -145523070);
    d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379);
    c = md5ii(c, d, a, b, x[i + 2], 15, 718787259);
    b = md5ii(b, c, d, a, x[i + 9], 21, -343485551);

    a = safeAdd(a, olda);
    b = safeAdd(b, oldb);
    c = safeAdd(c, oldc);
    d = safeAdd(d, oldd);
  }

  const hexChars = '0123456789abcdef';
  let str = '';
  for (const num of [a, b, c, d]) {
    for (let j = 0; j < 4; j++) {
      str += hexChars.charAt((num >> (j * 8 + 4)) & 0x0f) + hexChars.charAt((num >> (j * 8)) & 0x0f);
    }
  }
  return str;
}

/**
 * Scans a file's binary stream for privacy leaks (EXIF, GPS markers,
 * Camera models, Software versions, author info, sensitive filename tokens).
 */
export async function scanFileForPrivacy(file: File): Promise<PrivacyScanResult> {
  const buffer = await file.slice(0, 128 * 1024).arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const textDecoder = new TextDecoder('latin1');
  const asciiHeader = textDecoder.decode(bytes);

  const items: PrivacyScanItem[] = [];
  let scoreDeduction = 0;
  let hasGps = false;
  let hasExif = false;
  let hasAuthor = false;

  // 1. Filename privacy check
  const name = file.name;
  if (/(\d{4}[-_]?\d{2}[-_]?\d{2})|IMG_\d+|Screenshot|WhatsApp|PXL_\d+/i.test(name)) {
    items.push({
      id: 'fn-leak',
      category: 'timestamp',
      label: 'Creation Date in Filename',
      value: name,
      severity: 'warning',
      description: 'The filename contains automated timestamp or device markers that reveal when or how it was captured.',
    });
    scoreDeduction += 15;
  }

  // Check for personal name or device in filename
  if (/[a-z]+[-_][a-z]+/i.test(name) && !/^(file|image|document|untitled)/i.test(name)) {
    items.push({
      id: 'fn-user',
      category: 'author',
      label: 'Possible User Name in Filename',
      value: name,
      severity: 'info',
      description: 'Filename contains words that might reveal identity or project classification.',
    });
    scoreDeduction += 5;
  }

  // 2. Image EXIF & GPS detection (JPEG / PNG / WebP)
  if (file.type.startsWith('image/') || /\.(jpe?g|png|webp)$/i.test(file.name)) {
    // Check for Exif marker in JPEG (0xFFE1)
    let exifOffset = -1;
    for (let i = 0; i < bytes.length - 4; i++) {
      if (bytes[i] === 0xff && bytes[i + 1] === 0xe1) {
        if (bytes[i + 4] === 0x45 && bytes[i + 5] === 0x78 && bytes[i + 6] === 0x69 && bytes[i + 7] === 0x66) { // "Exif"
          exifOffset = i;
          hasExif = true;
          break;
        }
      }
    }

    // Check GPS strings
    const gpsMatch = asciiHeader.match(/GPS(VersionID|Latitude|Longitude|Altitude)/i) ||
                     asciiHeader.includes('GPSInfo') ||
                     asciiHeader.includes('GPS ');

    if (gpsMatch) {
      hasGps = true;
      scoreDeduction += 35;
      items.push({
        id: 'gps-coords',
        category: 'gps',
        label: 'GPS Coordinates Detected',
        value: 'Geographic location embedded',
        severity: 'danger',
        description: 'Contains precise latitude/longitude coordinates that reveal where this photo was taken.',
      });
    } else {
      items.push({
        id: 'gps-safe',
        category: 'gps',
        label: 'No GPS Coordinates',
        value: 'Clean',
        severity: 'safe',
        description: 'No satellite positioning data was detected in this file.',
      });
    }

    // Camera Model & Maker detection
    const cameraMatch = asciiHeader.match(/(Apple|Samsung|Google|Sony|Canon|Nikon|Xiaomi|OnePlus|Huawei|Fujifilm)[^\x00-\x1F\x7F-\xFF]{2,30}/i);
    if (cameraMatch) {
      hasExif = true;
      scoreDeduction += 15;
      items.push({
        id: 'camera-info',
        category: 'camera',
        label: 'Camera Hardware Fingerprint',
        value: cameraMatch[0].trim(),
        severity: 'warning',
        description: 'Reveals the exact brand and model of the device used to take this photo.',
      });
    }

    // Software signatures
    const softwareMatch = asciiHeader.match(/(Adobe Photoshop|Lightroom|GIMP|Canva|Procreate|iOS|Android)[^\x00-\x1F\x7F-\xFF]{0,25}/i);
    if (softwareMatch) {
      scoreDeduction += 10;
      items.push({
        id: 'sw-signature',
        category: 'software',
        label: 'Editing Software Signature',
        value: softwareMatch[0].trim(),
        severity: 'info',
        description: 'Identifies software suite or operating system used for editing.',
      });
    }

    // Capture Timestamp
    const dateMatch = asciiHeader.match(/\d{4}:\d{2}:\d{2} \d{2}:\d{2}:\d{2}/);
    if (dateMatch) {
      scoreDeduction += 10;
      items.push({
        id: 'capture-time',
        category: 'timestamp',
        label: 'Original Capture Timestamp',
        value: dateMatch[0],
        severity: 'warning',
        description: 'Timestamp reveals the exact second this photo was captured.',
      });
    }

    if (exifOffset !== -1 && !cameraMatch && !gpsMatch) {
      scoreDeduction += 10;
      items.push({
        id: 'exif-general',
        category: 'camera',
        label: 'EXIF Metadata Block Present',
        value: 'Standard APP1 header',
        severity: 'info',
        description: 'Contains standard EXIF camera settings and tags.',
      });
    }
  }

  // 3. PDF Analysis
  if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
    const authorMatch = asciiHeader.match(/\/Author\s*\(([^)]+)\)/i);
    if (authorMatch && authorMatch[1].trim()) {
      hasAuthor = true;
      scoreDeduction += 20;
      items.push({
        id: 'pdf-author',
        category: 'author',
        label: 'Document Author Identified',
        value: authorMatch[1],
        severity: 'danger',
        description: 'Contains personal author name stamped into PDF properties.',
      });
    }

    const creatorMatch = asciiHeader.match(/\/Creator\s*\(([^)]+)\)/i) || asciiHeader.match(/\/Producer\s*\(([^)]+)\)/i);
    if (creatorMatch && creatorMatch[1].trim()) {
      scoreDeduction += 10;
      items.push({
        id: 'pdf-producer',
        category: 'software',
        label: 'PDF Generator / Application',
        value: creatorMatch[1],
        severity: 'info',
        description: 'Application or print driver that created this document.',
      });
    }

    const modDateMatch = asciiHeader.match(/\/ModDate\s*\(D:(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/);
    if (modDateMatch) {
      scoreDeduction += 10;
      items.push({
        id: 'pdf-mod-date',
        category: 'timestamp',
        label: 'PDF Modification Date',
        value: `${modDateMatch[1]}-${modDateMatch[2]}-${modDateMatch[3]} ${modDateMatch[4]}:${modDateMatch[5]}`,
        severity: 'warning',
        description: 'Exact date and time this PDF was edited.',
      });
    }

    // Check for Javascript in PDF
    if (asciiHeader.includes('/JavaScript') || asciiHeader.includes('/JS')) {
      scoreDeduction += 30;
      items.push({
        id: 'pdf-js',
        category: 'embedded',
        label: 'Embedded JavaScript Detected',
        value: 'Active script stream',
        severity: 'danger',
        description: 'Active executable code found inside PDF, possible security hazard.',
      });
    } else {
      items.push({
        id: 'pdf-no-js',
        category: 'embedded',
        label: 'No Suspicious Embedded Scripts',
        value: 'Clean',
        severity: 'safe',
        description: 'No executable code or automated macros found in document structure.',
      });
    }
  }

  // Compute final privacy score (100 is best, 0 is worst)
  const privacyScore = Math.max(10, Math.min(100, 100 - scoreDeduction));

  const recommendations: string[] = [];
  if (hasGps) {
    recommendations.push('Strip GPS location before sharing publicly or on social media.');
  }
  if (hasExif) {
    recommendations.push('Remove camera hardware serials and EXIF headers to prevent device fingerprinting.');
  }
  if (hasAuthor) {
    recommendations.push('Sanitize author and organizational names from document properties.');
  }
  if (scoreDeduction > 0) {
    recommendations.push('Anonymize filename with clean generic identifier.');
  } else {
    recommendations.push('This file has exceptional privacy posture with no sensitive leaks detected.');
  }

  return {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type || 'application/octet-stream',
    privacyScore,
    hasGps,
    hasExif,
    hasAuthor,
    items,
    recommendations,
  };
}

export function sanitizeFilename(originalName: string, prefix: string = 'clean'): string {
  const ext = originalName.substring(originalName.lastIndexOf('.')) || '';
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  return `${prefix}_${Date.now().toString().slice(-4)}_${randomSuffix}${ext}`;
}
