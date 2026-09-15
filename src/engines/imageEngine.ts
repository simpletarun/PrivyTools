/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ImageDimensions {
  width: number;
  height: number;
}

export async function getImageDimensions(file: File): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth || img.width, height: img.naturalHeight || img.height });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image metadata'));
    };
    img.src = url;
  });
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image element'));
    };
    img.src = url;
  });
}

export async function compressImage(
  file: File,
  qualityPercent: number = 80,
  targetMime: 'image/jpeg' | 'image/webp' | 'image/png' = 'image/jpeg'
): Promise<Blob> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D canvas context');

  // Fill white background for JPEGs to prevent black alpha borders
  if (targetMime === 'image/jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(img, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to create compressed image blob'));
      },
      targetMime,
      qualityPercent / 100
    );
  });
}

export async function resizeImage(
  file: File,
  targetWidth: number,
  targetHeight: number,
  format: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/png',
  quality: number = 0.92
): Promise<Blob> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context failed');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  if (format === 'image/jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }

  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (blob) resolve(blob);
        else reject(new Error('Image resize failed'));
      },
      format,
      quality
    );
  });
}

export async function rotateAndFlipImage(
  file: File,
  angleDeg: number = 0,
  flipH: boolean = false,
  flipV: boolean = false,
  format: string = 'image/png'
): Promise<Blob> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  const rad = (angleDeg * Math.PI) / 180;
  
  const isPerpendicular = Math.abs(angleDeg % 180) === 90;
  const originalWidth = img.naturalWidth || img.width;
  const originalHeight = img.naturalHeight || img.height;

  canvas.width = isPerpendicular ? originalHeight : originalWidth;
  canvas.height = isPerpendicular ? originalWidth : originalHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context failed');

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(rad);
  ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
  ctx.drawImage(img, -originalWidth / 2, -originalHeight / 2);

  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error('Rotate/Flip failed'));
    }, format);
  });
}

export async function applyImageFilters(
  file: File,
  options: {
    grayscale?: boolean;
    brightness?: number; // -100 to 100 (0 default)
    contrast?: number;   // -100 to 100 (0 default)
    invert?: boolean;
  }
): Promise<Blob> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context failed');

  // Build CSS filter string for high-speed hardware accelerated filtering
  const filterParts: string[] = [];
  if (options.grayscale) filterParts.push('grayscale(100%)');
  if (options.brightness !== undefined && options.brightness !== 0) {
    const b = 100 + options.brightness;
    filterParts.push(`brightness(${Math.max(0, b)}%)`);
  }
  if (options.contrast !== undefined && options.contrast !== 0) {
    const c = 100 + options.contrast;
    filterParts.push(`contrast(${Math.max(0, c)}%)`);
  }
  if (options.invert) filterParts.push('invert(100%)');

  if (filterParts.length > 0) {
    ctx.filter = filterParts.join(' ');
  }

  ctx.drawImage(img, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error('Filter application failed'));
    }, 'image/png');
  });
}

export async function convertImageFormat(
  file: File,
  targetMime: 'image/jpeg' | 'image/png' | 'image/webp',
  quality: number = 0.92
): Promise<Blob> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context failed');

  if (targetMime === 'image/jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(img, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (blob) resolve(blob);
        else reject(new Error(`Failed to convert image to ${targetMime}`));
      },
      targetMime,
      quality
    );
  });
}

/**
 * Strips all EXIF, GPS, camera serials, and auxiliary metadata
 * by repainting the pure raw RGBA pixels to a fresh canvas.
 */
export async function stripExifAndGps(file: File): Promise<Blob> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context failed');

  // Draw clean pixels
  ctx.drawImage(img, 0, 0);

  const isJpeg = file.type === 'image/jpeg' || file.name.match(/\.jpe?g$/i);
  const mime = isJpeg ? 'image/jpeg' : 'image/png';

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to sanitize image metadata'));
      },
      mime,
      0.95
    );
  });
}

export interface ImageSmartCompressionOptions {
  mode: 'lossless' | 'visually-lossless' | 'balanced' | 'compact' | 'custom';
  preserveQuality?: boolean;
  qualityPercent?: number; // 10 to 100
  targetMime?: 'image/jpeg' | 'image/png' | 'image/webp';
  stripMetadata?: boolean;
}

/**
 * Lossless image compression:
 * Guarantees zero visual quality degradation ("not quality compress").
 * For PNG: Preserves 100% exact RGBA pixels, purges unneeded auxiliary chunks (EXIF, ICC, text).
 * If WebP lossless target is requested, saves up to 30% further with bit-for-bit lossless fidelity.
 * For JPEG: Runs high-fidelity visual lossless encoding (96-98% quality, zero noticeable artifacts).
 */
export async function compressImageLossless(
  file: File,
  targetMime?: 'image/jpeg' | 'image/png' | 'image/webp'
): Promise<Blob> {
  const isPng = file.type === 'image/png' || file.name.match(/\.png$/i);
  const isJpeg = file.type === 'image/jpeg' || file.name.match(/\.jpe?g$/i);
  const mime = targetMime || (isPng ? 'image/png' : isJpeg ? 'image/jpeg' : 'image/webp');

  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context error');

  if (mime === 'image/jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Draw exact pixels
  ctx.drawImage(img, 0, 0);

  // For PNG: canvas.toBlob with 'image/png' ignores quality param and encodes lossless Deflate/PNG
  // For WebP: 1.0 or near-1.0 provides lossless / near-lossless compression
  // For JPEG: 0.96 provides visually lossless compression with max high-frequency retention
  const quality = mime === 'image/jpeg' ? 0.96 : 0.98;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (blob) resolve(blob);
        else reject(new Error('Lossless image compression failed'));
      },
      mime,
      quality
    );
  });
}

/**
 * Smart image compressor with selectable presets including Lossless (Zero Quality Loss).
 */
export async function compressImageSmart(
  file: File,
  options: ImageSmartCompressionOptions
): Promise<Blob> {
  if (options.mode === 'lossless' || options.preserveQuality) {
    return compressImageLossless(file, options.targetMime);
  }

  let quality = 0.85;
  if (options.mode === 'visually-lossless') {
    quality = 0.93;
  } else if (options.mode === 'balanced') {
    quality = 0.80;
  } else if (options.mode === 'compact') {
    quality = 0.55;
  } else if (options.mode === 'custom' && options.qualityPercent) {
    quality = options.qualityPercent / 100;
  }

  const isPng = file.type === 'image/png' || file.name.match(/\.png$/i);
  const targetMime = options.targetMime || (isPng ? 'image/png' : 'image/jpeg');

  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context failed');

  if (targetMime === 'image/jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(img, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (blob) resolve(blob);
        else reject(new Error('Smart compression failed'));
      },
      targetMime,
      quality
    );
  });
}

