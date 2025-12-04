/**
 * Cloudinary Upload Utility
 * Tái sử dụng cho nhiều component cần upload ảnh
 */

export interface CloudinaryUploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}

export interface CloudinaryUploadOptions {
  folder?: string;
  onProgress?: (progress: number) => void;
}

/**
 * Upload file lên Cloudinary
 * @param file File ảnh cần upload
 * @param options Tùy chọn upload
 * @returns Promise với kết quả upload
 */
export async function uploadToCloudinary(
  file: File,
  options: CloudinaryUploadOptions = {}
): Promise<CloudinaryUploadResult> {
  try {
    // Validate file
    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        error: 'Chỉ chấp nhận file ảnh'
      };
    }

    if (file.size > 5 * 1024 * 1024) {
      return {
        success: false,
        error: 'Kích thước file không được vượt quá 5MB'
      };
    }

    // Get config from environment
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      return {
        success: false,
        error: 'Cloudinary chưa được cấu hình. Vui lòng thêm VITE_CLOUDINARY_CLOUD_NAME và VITE_CLOUDINARY_UPLOAD_PRESET vào file .env'
      };
    }

    // Create FormData
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    
    if (options.folder) {
      formData.append('folder', options.folder);
    }

    // Report progress
    options.onProgress?.(30);

    // Upload to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    options.onProgress?.(70);

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error?.message || 'Upload thất bại'
      };
    }

    const data = await response.json();
    
    options.onProgress?.(100);

    return {
      success: true,
      url: data.secure_url,
      publicId: data.public_id
    };

  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Có lỗi xảy ra khi upload ảnh'
    };
  }
}

/**
 * Delete image from Cloudinary
 * Note: Cần backend API để delete vì cần API Secret
 * @param publicId Public ID của ảnh
 */
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  // TODO: Implement delete through backend API
  // Frontend không thể delete trực tiếp vì cần API Secret
  console.warn('Delete from Cloudinary requires backend API');
  return false;
}

/**
 * Get optimized image URL with transformations
 * @param url Original Cloudinary URL
 * @param options Transformation options
 */
export function getOptimizedImageUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: 'auto' | number;
    format?: 'auto' | 'jpg' | 'png' | 'webp';
  } = {}
): string {
  if (!url.includes('cloudinary.com')) {
    return url;
  }

  const { width, height, quality = 'auto', format = 'auto' } = options;

  // Build transformation string
  const transformations: string[] = [];
  
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (quality) transformations.push(`q_${quality}`);
  if (format) transformations.push(`f_${format}`);

  if (transformations.length === 0) {
    return url;
  }

  // Insert transformations into URL
  const uploadIndex = url.indexOf('/upload/');
  if (uploadIndex === -1) return url;

  const transformStr = transformations.join(',');
  return url.slice(0, uploadIndex + 8) + transformStr + '/' + url.slice(uploadIndex + 8);
}

/**
 * Get thumbnail URL
 */
export function getThumbnailUrl(url: string, size: number = 200): string {
  return getOptimizedImageUrl(url, {
    width: size,
    height: size,
    quality: 'auto',
    format: 'auto'
  });
}

/**
 * Validate Cloudinary configuration
 */
export function isCloudinaryConfigured(): boolean {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  
  return !!(cloudName && uploadPreset);
}
