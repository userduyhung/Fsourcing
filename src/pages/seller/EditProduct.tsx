import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import { useNavigate } from 'react-router-dom';
import { logger } from '../../utils/logger';
import { useApiToast } from '../../hooks/useApiToast';
import { Upload, CheckCircle } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  referencePrice: number;
  stockQuantity?: number;
  description?: string;
  imagePath?: string;
  category?: string;
  isActive?: boolean;
}

const EditProduct: React.FC<{ productId: string }> = ({ productId }) => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useApiToast();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [displayPrice, setDisplayPrice] = useState(''); // For formatted display
  const [stockQuantity, setStockQuantity] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Image upload states (Cloudinary)
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');

  // Handle price input change
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (rawValue === '') {
      setPrice('');
      setDisplayPrice('');
      return;
    }
    const numValue = parseInt(rawValue);
    setPrice(rawValue);
    setDisplayPrice(numValue.toLocaleString('vi-VN'));
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    
    const fetchProduct = async () => {
      try {
        const resp = await apiClient.client.get(`/Products/${productId}`);
        const data = resp?.data?.data ?? resp?.data;
        
        if (isMounted && data) {
          const productData: Product = {
            id: data.id,
            name: data.name,
            referencePrice: data.referencePrice || data.price || 0,
            stockQuantity: data.stockQuantity || 0,
            description: data.description,
            imagePath: data.imagePath || data.image,
            category: data.category,
            isActive: data.isActive
          };
          
          setProduct(productData);
          setName(productData.name);
          setPrice(productData.referencePrice.toString());
          setDisplayPrice(productData.referencePrice.toLocaleString('vi-VN'));
          setStockQuantity((productData.stockQuantity || 0).toString());
          setDescription(productData.description || '');
          setCategory(productData.category || '');
          setImage(productData.imagePath || '');
          
          logger.info('EditProduct', 'product loaded from API', { productId, name: productData.name });
        } else if (isMounted) {
          setProduct(null);
          showError('Không tìm thấy sản phẩm');
          logger.warn('EditProduct', 'product not found', { productId });
        }
      } catch (err: any) {
        logger.error('EditProduct', 'failed to fetch product', { productId, error: err.message || err });
        if (isMounted) {
          showError('❌ Không thể tải sản phẩm. Kiểm tra kết nối và thử lại.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    fetchProduct();
    return () => { isMounted = false; };
  }, [productId]); // Remove showError from dependencies to prevent infinite loop

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showError('Kích thước file không được vượt quá 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        showError('Chỉ chấp nhận file ảnh');
        return;
      }

      setImageFile(file);
      
      // Create preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // Upload to Cloudinary immediately
      await uploadToCloudinary(file);
    }
  };

  const uploadToCloudinary = async (file: File) => {
    setIsUploadingImage(true);
    setUploadProgress(0);

    try {
      // Cloudinary configuration from environment variables
      const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
      
      // Validate configuration
      if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
        throw new Error('Cloudinary chưa được cấu hình. Vui lòng thêm VITE_CLOUDINARY_CLOUD_NAME và VITE_CLOUDINARY_UPLOAD_PRESET vào file .env');
      }
      
      // Tạo FormData để upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('folder', 'products'); // Tạo folder riêng cho sản phẩm

      setUploadProgress(30);

      // Upload to Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      setUploadProgress(70);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Upload failed');
      }

      const data = await response.json();
      
      // Cloudinary trả về secure_url (HTTPS URL)
      const imageUrl = data.secure_url;

      setUploadProgress(90);

      setUploadedImageUrl(imageUrl);
      setImage(imageUrl); // Update image state with Cloudinary URL
      setUploadProgress(100);
      showSuccess('✅ Upload ảnh lên Cloudinary thành công!');
      
      logger.info('EditProduct', 'Image uploaded to Cloudinary', { 
        imageUrl,
        publicId: data.public_id,
        format: data.format,
        width: data.width,
        height: data.height
      });

    } catch (error: any) {
      logger.error('EditProduct', 'Failed to upload image to Cloudinary', error);
      showError(`❌ ${error.message || 'Upload ảnh thất bại. Vui lòng thử lại.'}`);
      setUploadedImageUrl('');
    } finally {
      setIsUploadingImage(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    
    setIsSubmitting(true);

    try {
      // Validate price
      const priceNum = parseInt(price || '0');
      if (isNaN(priceNum) || priceNum < 1000) {
        showError('Giá tham chiếu phải lớn hơn hoặc bằng 1,000₫');
        setIsSubmitting(false);
        return;
      }

      // Validate stock quantity
      const quantity = parseInt(stockQuantity || '0');
      if (isNaN(quantity) || quantity < 0) {
        showError('Số lượng kho phải là số và lớn hơn hoặc bằng 0');
        setIsSubmitting(false);
        return;
      }

      // Validate category - required
      if (!category || !category.trim()) {
        showError('Danh mục là bắt buộc');
        setIsSubmitting(false);
        return;
      }

      // Build update payload according to UpdateProductDto (backend uses camelCase)
      // NOTE: UpdateProductDto does NOT support stockQuantity - must use separate inventory endpoint
      const payload: any = {
        name: name.trim(),
        referencePrice: priceNum,
        description: description.trim() || undefined,
        category: category.trim(),
        imagePath: uploadedImageUrl || image.trim() || undefined // Prioritize Cloudinary uploaded image
      };

      logger.debug('EditProduct', 'updating product', { productId, payload });

      await apiClient.client.put(`/Products/${productId}`, payload);
      
      // ✅ Update stock quantity via separate inventory endpoint
      // Backend uses PUT /Products/{id}/inventory endpoint for stock quantity
      if (quantity !== (product?.stockQuantity || 0)) {
        try {
          await apiClient.client.put(`/Products/${productId}/inventory`, {
            quantity: quantity
          });
          logger.info('EditProduct', 'inventory updated', { 
            productId: productId,
            oldQuantity: product?.stockQuantity || 0,
            newQuantity: quantity
          });
        } catch (inventoryError: any) {
          logger.error('EditProduct', 'failed to update inventory', inventoryError);
          // Don't fail the entire operation if inventory update fails
          console.warn('⚠️ Failed to update stock quantity:', inventoryError);
        }
      }
      
      showSuccess('✅ Cập nhật sản phẩm thành công!');
      logger.info('EditProduct', 'product updated successfully', { productId, name });

      // Dispatch event to refresh product list
      try {
        window.dispatchEvent(new CustomEvent('sellerProductsUpdated', { 
          detail: { productId } 
        }));
      } catch (e) {
        window.dispatchEvent(new Event('sellerProductsUpdated'));
      }

      // Navigate back after short delay
      setTimeout(() => navigate('/seller/products'), 1000);
      
    } catch (err: any) {
      logger.error('EditProduct', 'failed to update product', { 
        productId, 
        error: err.message || err,
        response: err?.response?.data 
      });
      
      const errorMsg = err?.response?.data?.error 
        || err?.response?.data?.message 
        || err?.message 
        || 'Cập nhật thất bại. Vui lòng thử lại.';
      
      showError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md">
          <p className="text-xl text-gray-700 mb-4">Không tìm thấy sản phẩm</p>
          <button
            onClick={() => navigate('/seller/products')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4 font-body">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold mb-8 text-gray-900">Chỉnh sửa sản phẩm</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Tên sản phẩm <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all"
                placeholder="Nhập tên sản phẩm"
                maxLength={255}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Giá tham chiếu <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center border-2 border-gray-200 rounded-xl px-4 py-3 focus-within:border-blue-500 transition-all">
                <input
                  type="text"
                  inputMode="numeric"
                  value={displayPrice}
                  onChange={handlePriceChange}
                  className="w-full outline-none"
                  placeholder="0"
                  required
                />
                <span className="text-gray-600 font-semibold ml-3">₫</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Giá tham khảo cho sản phẩm (tối thiểu 1,000₫)</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Số lượng kho <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={stockQuantity}
                onChange={e => setStockQuantity(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all"
                placeholder="0"
                min="0"
                step="1"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Số lượng sản phẩm có sẵn trong kho</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Danh mục <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all"
                required
              >
                <option value="">-- Chọn danh mục --</option>
                <option value="Bia, nước giải khát">Bia, nước giải khát</option>
                <option value="Bánh kẹo, trà, cà phê">Bánh kẹo, trà, cà phê</option>
                <option value="Gói mì, gói phở">Gói mì, gói phở</option>
                <option value="Thực phẩm khô, gia vị">Thực phẩm khô, gia vị</option>
                <option value="Chăm sóc cá nhân">Chăm sóc cá nhân</option>
                <option value="Sữa và Sản phẩm từ sữa">Sữa và Sản phẩm từ sữa</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Chọn 1 trong danh mục cố định</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Mô tả sản phẩm
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all resize-none"
                placeholder="Mô tả chi tiết về sản phẩm..."
                rows={5}
                maxLength={2000}
              />
              <p className="text-xs text-gray-500 mt-1">{description.length}/2000 ký tự</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Hình ảnh sản phẩm
              </label>
              
              {/* File Upload Button */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-all">
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                  disabled={isUploadingImage}
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="w-12 h-12 text-gray-400 mb-3" />
                  <p className="text-gray-600 font-semibold mb-1">
                    {isUploadingImage ? 'Đang upload...' : 'Chọn ảnh từ máy tính'}
                  </p>
                  <p className="text-sm text-gray-500">
                    PNG, JPG, GIF tối đa 5MB
                  </p>
                </label>
              </div>

              {/* Upload Progress */}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Đang upload...</span>
                    <span className="text-sm font-bold text-blue-600">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Image Preview */}
              {(previewUrl || uploadedImageUrl || image) && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Xem trước:</p>
                  <img
                    src={previewUrl || uploadedImageUrl || image}
                    alt="Preview"
                    className="w-full max-h-64 object-contain rounded-xl border-2 border-gray-200"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Invalid+Image';
                    }}
                  />
                  {uploadedImageUrl && (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-700 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Ảnh đã được upload lên Cloudinary
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/seller/products')}
                className="px-6 py-3 border-2 border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all"
              >
                Hủy bỏ
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:shadow-xl transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed font-bold"
              >
                {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật sản phẩm'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;
