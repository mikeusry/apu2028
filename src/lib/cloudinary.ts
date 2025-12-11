/**
 * Cloudinary URL utilities for AynParkerUsry.com
 *
 * Cloud Name: southland-organics
 * Folder: AynParkerUsry
 */

// Get cloud name from environment or use default
const CLOUD_NAME = import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME || 'southland-organics';
const BASE_FOLDER = 'AynParkerUsry';

export interface CloudinaryTransformOptions {
  width?: number;
  height?: number;
  crop?: 'fill' | 'scale' | 'fit' | 'limit' | 'thumb' | 'crop';
  gravity?: 'auto' | 'face' | 'center' | 'north' | 'south' | 'east' | 'west';
  quality?: 'auto' | 'auto:best' | 'auto:good' | 'auto:eco' | 'auto:low' | number;
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  dpr?: 'auto' | number;
}

/**
 * Build a Cloudinary URL with transformations
 * @param publicId - The public ID of the image (without folder prefix)
 * @param options - Transformation options
 * @returns Full Cloudinary URL
 */
export function buildCloudinaryUrl(
  publicId: string,
  options: CloudinaryTransformOptions = {}
): string {
  const {
    width,
    height,
    crop = 'fill',
    gravity = 'auto',
    quality = 'auto',
    format = 'auto',
    dpr,
  } = options;

  const transformations: string[] = [];

  // Add transformations in Cloudinary's preferred order
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (crop) transformations.push(`c_${crop}`);
  if (gravity && (crop === 'fill' || crop === 'thumb' || crop === 'crop')) {
    transformations.push(`g_${gravity}`);
  }
  if (quality) transformations.push(`q_${quality}`);
  if (format) transformations.push(`f_${format}`);
  if (dpr) transformations.push(`dpr_${dpr}`);

  const transformString = transformations.length > 0
    ? transformations.join(',') + '/'
    : '';

  // Handle public IDs that might already include the folder
  const fullPublicId = publicId.startsWith(BASE_FOLDER)
    ? publicId
    : `${BASE_FOLDER}/${publicId}`;

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformString}${fullPublicId}`;
}

/**
 * Generate responsive image srcset for multiple widths
 * @param publicId - The public ID of the image
 * @param widths - Array of widths to generate
 * @param options - Base transformation options (width will be overridden)
 * @returns srcset string
 */
export function getCloudinaryResponsiveSet(
  publicId: string,
  widths: number[] = [400, 800, 1200, 1600],
  options: Omit<CloudinaryTransformOptions, 'width'> = {}
): string {
  return widths
    .map(width => {
      const url = buildCloudinaryUrl(publicId, { ...options, width });
      return `${url} ${width}w`;
    })
    .join(', ');
}

/**
 * Get a placeholder/blur URL for lazy loading
 * @param publicId - The public ID of the image
 * @returns Low-quality placeholder URL
 */
export function getCloudinaryPlaceholder(publicId: string): string {
  return buildCloudinaryUrl(publicId, {
    width: 50,
    quality: 'auto:low',
    format: 'auto',
    crop: 'scale',
  });
}

/**
 * Common image presets for the site
 */
export const imagePresets = {
  hero: {
    widths: [400, 800, 1200, 1600],
    sizes: '(max-width: 768px) 100vw, 50vw',
    defaultOptions: {
      crop: 'fill' as const,
      gravity: 'face' as const,
      quality: 'auto' as const,
    },
  },
  thumbnail: {
    widths: [200, 400, 600],
    sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw',
    defaultOptions: {
      crop: 'fill' as const,
      gravity: 'auto' as const,
      quality: 'auto:good' as const,
    },
  },
  skillCard: {
    widths: [300, 600, 900],
    sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw',
    defaultOptions: {
      crop: 'fill' as const,
      gravity: 'auto' as const,
      quality: 'auto' as const,
    },
  },
  ogImage: {
    width: 1200,
    height: 630,
    options: {
      crop: 'fill' as const,
      gravity: 'auto' as const,
      quality: 'auto:best' as const,
      format: 'jpg' as const,
    },
  },
};
