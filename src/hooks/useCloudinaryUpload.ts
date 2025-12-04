import { useState } from 'react';
import { uploadToCloudinary, CloudinaryUploadResult } from '../utils/cloudinary';
import { useApiToast } from './useApiToast';
import { logger } from '../utils/logger';

interface UseCloudinaryUploadResult {
  uploadedUrl: string | null;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
  uploadImage: (file: File, folder?: string) => Promise<boolean>;
  resetUpload: () => void;
}

/**
 * React Hook để upload ảnh lên Cloudinary
 * 
 * @example
 * ```tsx
 * const { uploadedUrl, isUploading, uploadProgress, uploadImage } = useCloudinaryUpload();
 * 
 * const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
 *   const file = e.target.files?.[0];
 *   if (file) {
 *     const success = await uploadImage(file, 'products');
 *     if (success) {
 *       console.log('Uploaded URL:', uploadedUrl);
 *     }
 *   }
 * };
 * ```
 */
export function useCloudinaryUpload(): UseCloudinaryUploadResult {
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, showError } = useApiToast();

  const uploadImage = async (file: File, folder: string = 'products'): Promise<boolean> => {
    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        const errorMsg = 'Chỉ chấp nhận file ảnh';
        setError(errorMsg);
        showError(errorMsg);
        return false;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        const errorMsg = 'Kích thước file không được vượt quá 5MB';
        setError(errorMsg);
        showError(errorMsg);
        return false;
      }

      // Upload to Cloudinary
      const result: CloudinaryUploadResult = await uploadToCloudinary(file, {
        folder,
        onProgress: (progress) => setUploadProgress(progress)
      });

      if (!result.success) {
        setError(result.error || 'Upload thất bại');
        showError(result.error || 'Upload thất bại');
        return false;
      }

      // Success
      setUploadedUrl(result.url || null);
      setUploadProgress(100);
      showSuccess('✅ Upload ảnh lên Cloudinary thành công!');
      
      logger.info('useCloudinaryUpload', 'Upload success', {
        url: result.url,
        publicId: result.publicId,
        folder
      });

      return true;

    } catch (err: any) {
      const errorMsg = err.message || 'Có lỗi xảy ra khi upload ảnh';
      setError(errorMsg);
      showError(errorMsg);
      
      logger.error('useCloudinaryUpload', 'Upload failed', err);
      
      return false;

    } finally {
      setIsUploading(false);
      // Reset progress after 2 seconds
      setTimeout(() => setUploadProgress(0), 2000);
    }
  };

  const resetUpload = () => {
    setUploadedUrl(null);
    setIsUploading(false);
    setUploadProgress(0);
    setError(null);
  };

  return {
    uploadedUrl,
    isUploading,
    uploadProgress,
    error,
    uploadImage,
    resetUpload
  };
}
