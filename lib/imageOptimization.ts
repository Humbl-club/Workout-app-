/**
 * Image Optimization Utilities
 *
 * Compresses and optimizes images before upload to reduce:
 * - API costs (Gemini Vision charges by image size)
 * - Network usage (important on cellular)
 * - Storage costs
 * - Battery drain
 */

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1
  outputFormat?: 'jpeg' | 'webp' | 'png';
}

const DEFAULT_OPTIONS: Required<ImageOptimizationOptions> = {
  maxWidth: 800,
  maxHeight: 800,
  quality: 0.85,
  outputFormat: 'jpeg',
};

/**
 * Compress and resize image to optimize for upload
 */
export async function optimizeImage(
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<{ base64: string; sizeReduction: number; originalSize: number; optimizedSize: number }> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;
        const aspectRatio = width / height;

        if (width > opts.maxWidth) {
          width = opts.maxWidth;
          height = width / aspectRatio;
        }

        if (height > opts.maxHeight) {
          height = opts.maxHeight;
          width = height * aspectRatio;
        }

        // Create canvas and draw resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Enable image smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to base64
        const mimeType = opts.outputFormat === 'jpeg' ? 'image/jpeg' :
                         opts.outputFormat === 'webp' ? 'image/webp' : 'image/png';

        const base64 = canvas.toDataURL(mimeType, opts.quality);

        // Remove data URL prefix to get pure base64
        const pureBase64 = base64.split(',')[1];

        // Calculate sizes
        const originalSize = file.size;
        const optimizedSize = Math.ceil((pureBase64.length * 3) / 4); // Base64 to bytes
        const sizeReduction = ((originalSize - optimizedSize) / originalSize) * 100;

        resolve({
          base64: pureBase64,
          sizeReduction: Math.round(sizeReduction),
          originalSize,
          optimizedSize,
        });
      };

      img.onerror = () => reject(new Error('Failed to load image'));

      if (e.target?.result) {
        img.src = e.target.result as string;
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Validate image file before processing
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a JPEG, PNG, or WebP image.'
    };
  }

  // Check file size (max 10MB original)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Image is too large. Please upload an image smaller than 10MB.'
    };
  }

  return { valid: true };
}

/**
 * Get optimal image dimensions based on device
 */
export function getOptimalDimensions(): { maxWidth: number; maxHeight: number } {
  // For iPhone, use lower res to save bandwidth and battery
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  if (isMobile) {
    return { maxWidth: 800, maxHeight: 800 };
  }

  // Desktop can handle higher res
  return { maxWidth: 1200, maxHeight: 1200 };
}

/**
 * Compress image for body photo analysis
 * Optimized for Gemini Vision API
 */
export async function compressBodyPhoto(file: File): Promise<string> {
  // Validate first
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Get optimal dimensions for device
  const dimensions = getOptimalDimensions();

  // Optimize image
  const result = await optimizeImage(file, {
    maxWidth: dimensions.maxWidth,
    maxHeight: dimensions.maxHeight,
    quality: 0.85,
    outputFormat: 'jpeg', // JPEG is best for photos
  });

  console.log(`Image optimized: ${result.originalSize} → ${result.optimizedSize} bytes (${result.sizeReduction}% reduction)`);

  return result.base64;
}

/**
 * Create thumbnail for preview
 */
export async function createThumbnail(file: File): Promise<string> {
  const result = await optimizeImage(file, {
    maxWidth: 200,
    maxHeight: 200,
    quality: 0.7,
    outputFormat: 'jpeg',
  });

  return `data:image/jpeg;base64,${result.base64}`;
}

/**
 * Estimate API cost savings from optimization
 */
export function estimateCostSavings(originalSize: number, optimizedSize: number): {
  bytesSaved: number;
  percentSaved: number;
  estimatedCostSavings: string;
} {
  const bytesSaved = originalSize - optimizedSize;
  const percentSaved = (bytesSaved / originalSize) * 100;

  // Gemini Vision API charges ~$0.00025 per image (rough estimate)
  // Smaller images = faster processing = potential cost savings
  const baseCost = 0.00025;
  const savingsMultiplier = percentSaved / 100;
  const estimatedCostSavings = (baseCost * savingsMultiplier).toFixed(6);

  return {
    bytesSaved,
    percentSaved: Math.round(percentSaved),
    estimatedCostSavings: `$${estimatedCostSavings}`,
  };
}

/**
 * Check if browser supports WebP
 */
export function supportsWebP(): boolean {
  const canvas = document.createElement('canvas');
  if (canvas.getContext && canvas.getContext('2d')) {
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }
  return false;
}

/**
 * Get best output format for current browser
 */
export function getBestOutputFormat(): 'jpeg' | 'webp' {
  return supportsWebP() ? 'webp' : 'jpeg';
}
