import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  FileText, 
  Image as ImageIcon, 
  Upload, 
  Tag, 
  AlertCircle, 
  CheckCircle,
  ArrowLeft,
  Eye
} from 'lucide-react';
import { useApiToast } from '../../hooks/useApiToast';
import apiClient from '../../services/apiClient';
import { logger } from '../../utils/logger';

const AddProduct: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useApiToast();

  // Required fields (theo Backend CreateProductDto)
  const [name, setName] = useState('');
  const [referencePrice, setReferencePrice] = useState('');
  const [displayPrice, setDisplayPrice] = useState(''); // For formatted display
  const [stockQuantity, setStockQuantity] = useState(''); // Stock quantity

  // Optional fields
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // UI states
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);


  // Danh mục cố định - phải khớp với ProductCategoryTabs
  const categories = [
    'Bia, nước giải khát',
    'Bánh kẹo, trà, cà phê',
    'Thực phẩm khô, gia vị',
    'Chăm sóc cá nhân',
    'Sữa và Sản phẩm từ sữa'
  ];

  // Format number with thousand separators
  const formatNumber = (value: string): string => {
    const num = value.replace(/\D/g, ''); // Remove non-digits
    if (!num) return '';
    return parseInt(num).toLocaleString('vi-VN');
  };

  // Handle price input change
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (rawValue === '') {
      setReferencePrice('');
      setDisplayPrice('');
      return;
    }
    const numValue = parseInt(rawValue);
    setReferencePrice(rawValue);
    setDisplayPrice(numValue.toLocaleString('vi-VN'));
  };

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
      setImageUrl(''); // Clear URL field when file is selected

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
      setUploadProgress(100);
      showSuccess('✅ Upload ảnh lên Cloudinary thành công!');
      
      logger.info('AddProduct', 'Image uploaded to Cloudinary', { 
        imageUrl,
        publicId: data.public_id,
        format: data.format,
        width: data.width,
        height: data.height
      });

    } catch (error: any) {
      logger.error('AddProduct', 'Failed to upload image to Cloudinary', error);
      
      // Hiển thị thông báo lỗi cụ thể
      showError(`❌ ${error.message || 'Upload ảnh thất bại. Vui lòng thử lại.'}`);
      setUploadedImageUrl('');
    } finally {
      setIsUploadingImage(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validations
    const errors: string[] = [];
    
    // Required fields validation (theo BE CreateProductDto)
    if (!name.trim()) {
      errors.push('Tên sản phẩm là bắt buộc');
    } else if (name.length > 255) {
      errors.push('Tên sản phẩm không được vượt quá 255 ký tự');
    }

    const price = parseInt(referencePrice || '0');
    if (!referencePrice || isNaN(price)) {
      errors.push('Giá tham chiếu là bắt buộc và phải là số');
    } else if (price < 1000) {
      errors.push('Giá tham chiếu phải lớn hơn hoặc bằng 1,000₫');
    }

    const quantity = parseInt(stockQuantity || '0');
    if (!stockQuantity || isNaN(quantity)) {
      errors.push('Số lượng kho là bắt buộc và phải là số');
    } else if (quantity < 0) {
      errors.push('Số lượng kho phải lớn hơn hoặc bằng 0');
    }

    // Category validation - required
    if (!category || !category.trim()) {
      errors.push('Danh mục là bắt buộc');
    }

    // Optional fields validation
    if (description && description.length > 2000) {
      errors.push('Mô tả không được vượt quá 2000 ký tự');
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      errors.forEach(err => showError(err));
      return;
    }

    setValidationErrors([]);
    setIsSubmitting(true);

    // Declare productData outside try block so it's accessible in catch
    let productData: any = null;

    try {
      // Build product payload according to CreateProductDto
      // IMPORTANT: Backend uses camelCase (PropertyNamingPolicy = CamelCase)
      // NOTE: CreateProductDto does NOT support stockQuantity - must use separate inventory endpoint
      productData = {
        name: name.trim(),
        referencePrice: price
      };
      
      // Only add optional fields if they have values
      if (description.trim()) {
        productData.description = description.trim();
      }
      if (category.trim()) {
        productData.category = category.trim();
      }
      
      // Add image path if available (from Imgur upload or manual URL input)
      const finalImageUrl = uploadedImageUrl || imageUrl.trim();
      if (finalImageUrl) {
        productData.imagePath = finalImageUrl;
      }

      // Debug: Check authentication
      const sellerToken = localStorage.getItem('sellerToken');
      const token = localStorage.getItem('token');
      
      // Decode JWT to check claims (without verifying signature)
      let decodedToken: any = null;
      try {
        const tokenToDecode = sellerToken || token;
        if (tokenToDecode) {
          const base64Url = tokenToDecode.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          decodedToken = JSON.parse(window.atob(base64));
        }
      } catch (e) {
        logger.warn('AddProduct', 'Failed to decode token', e);
      }
      
      logger.debug('AddProduct', 'Creating product with payload', { 
        productData,
        hasImagePath: !!productData.imagePath,
        imageSource: uploadedImageUrl ? 'cloudinary' : (imageUrl ? 'manual' : 'none'),
        hasSellerToken: !!sellerToken,
        hasToken: !!token,
        tokenPreview: (sellerToken || token)?.substring(0, 20) + '...',
        tokenClaims: decodedToken
      });

      let createdProduct: any = null;

      // Send product data with imagePath to backend
      const resp = await apiClient.client.post('/Products', productData);
      createdProduct = resp?.data?.data ?? resp?.data;
      logger.info('AddProduct', 'product created (API)', { 
        productId: createdProduct.id,
        hasImage: !!productData.imagePath,
        imageUrl: productData.imagePath
      });

      // ✅ Update stock quantity via separate inventory endpoint
      // Backend uses PUT /Products/{id}/inventory endpoint for stock quantity
      if (createdProduct?.id && quantity > 0) {
        try {
          await apiClient.client.put(`/Products/${createdProduct.id}/inventory`, {
            quantity: quantity
          });
          logger.info('AddProduct', 'inventory updated', { 
            productId: createdProduct.id,
            quantity: quantity
          });
        } catch (inventoryError: any) {
          logger.error('AddProduct', 'failed to update inventory', inventoryError);
          // Don't fail the entire operation if inventory update fails
          // Product is created, just show a warning
          console.warn('⚠️ Failed to update stock quantity:', inventoryError);
        }
      }

      // ✅ Save sellerProfileId from created product to localStorage
      // This ensures SellerProducts.tsx can filter by sellerProfileId correctly
      if (createdProduct?.sellerProfileId) {
        try {
          const existingProfile = localStorage.getItem('sellerProfile');
          const profile = existingProfile ? JSON.parse(existingProfile) : {};
          profile.id = createdProduct.sellerProfileId;
          localStorage.setItem('sellerProfile', JSON.stringify(profile));
          console.log('✅ Saved sellerProfileId to localStorage:', createdProduct.sellerProfileId);
        } catch (e) {
          console.error('Failed to update sellerProfile in localStorage:', e);
        }
      }

      // Dispatch event to notify other components
      try {
        window.dispatchEvent(new CustomEvent('sellerProductsUpdated', { 
          detail: { product: createdProduct } 
        }));
      } catch (e) {
        window.dispatchEvent(new Event('sellerProductsUpdated'));
      }

      showSuccess('Thêm sản phẩm thành công!');
      
      // Cleanup
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      // Navigate back to products list
      setTimeout(() => navigate('/seller/products'), 1000);

    } catch (err: any) {
      // Log detailed error information for debugging
      logger.error('AddProduct', 'Failed to create product', { 
        error: err.message || err,
        status: err?.response?.status,
        statusText: err?.response?.statusText,
        responseData: err?.response?.data,
        requestPayload: productData,
        requestHeaders: err?.config?.headers
      });
      
      // Log full response for debugging
      console.error('Full error response:', {
        status: err?.response?.status,
        data: err?.response?.data,
        headers: err?.response?.headers
      });
      
      // Show detailed error message if available
      const errorMsg = err?.response?.data?.error 
        || err?.response?.data?.message 
        || err?.response?.data?.title
        || err?.message 
        || 'Không thể tạo sản phẩm. Vui lòng thử lại.';
      
      // Check if error is about missing seller profile
      const errorData = err?.response?.data;
      if (errorData?.error?.toLowerCase().includes('seller profile not found') || 
          errorData?.message?.toLowerCase().includes('seller profile not found')) {
        
        // Show error message with redirect info
        showError('❌ Bạn cần tạo hồ sơ người bán trước khi thêm sản phẩm. Đang chuyển hướng...');
        
        // Redirect to seller profile page after 2 seconds
        setTimeout(() => {
          navigate('/seller/profile');
        }, 2000);
        
        return;
      }
      
      showError(errorMsg);
      
      // Log validation errors if present
      if (err?.response?.data?.errors) {
        console.error('Validation errors:', err.response.data.errors);
        Object.entries(err.response.data.errors).forEach(([field, messages]: [string, any]) => {
          console.error(`  ${field}:`, messages);
        });
      }
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4 font-body">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl shadow-xl p-8 text-white mb-6">
          <button
            onClick={() => navigate('/seller/products')}
            className="flex items-center text-white hover:text-blue-100 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Quay lại danh sách
          </button>
          <h1 className="text-3xl font-extrabold mb-2">Thêm Sản Phẩm Mới</h1>
          <p className="text-blue-100">Tạo sản phẩm để bán trên nền tảng B2B</p>
        </div>

        {/* Image Upload Success Info */}
        {uploadedImageUrl && (
          <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 mb-6 shadow-md animate-fade-in">
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-green-800 font-bold mb-1">✅ Ảnh đã được upload lên Cloudinary</h3>
                <p className="text-sm text-green-700">
                  URL ảnh sẽ được lưu vào database cùng với thông tin sản phẩm.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 mb-6 shadow-md animate-fade-in">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-red-800 font-bold mb-2">Vui lòng kiểm tra các lỗi sau:</h3>
                <ul className="text-sm text-red-700 space-y-1">
                  {validationErrors.map((err, idx) => <li key={idx}>• {err}</li>)}
                </ul>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Required Information */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center mr-4">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Thông tin bắt buộc</h2>
                    <p className="text-sm text-gray-500">Các trường có dấu <span className="text-red-500">*</span> là bắt buộc</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Tên sản phẩm <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center border-2 border-gray-200 rounded-xl px-4 py-3 focus-within:border-blue-500 transition-all hover:border-gray-300">
                      <Package className="w-5 h-5 text-gray-400 mr-3" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full outline-none"
                        placeholder="Nhập tên sản phẩm"
                        maxLength={255}
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{name.length}/255 ký tự</p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Giá tham chiếu <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center border-2 border-gray-200 rounded-xl px-4 py-3 focus-within:border-blue-500 transition-all hover:border-gray-300">
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
                    <div className="flex items-center border-2 border-gray-200 rounded-xl px-4 py-3 focus-within:border-blue-500 transition-all hover:border-gray-300">
                      <Package className="w-5 h-5 text-gray-400 mr-3" />
                      <input
                        type="number"
                        value={stockQuantity}
                        onChange={(e) => setStockQuantity(e.target.value)}
                        className="w-full outline-none"
                        placeholder="0"
                        min="0"
                        step="1"
                        required
                      />
                      <span className="text-gray-600 font-semibold ml-3">cái</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Số lượng sản phẩm có sẵn trong kho</p>
                  </div>
                </div>
              </div>

              {/* Optional Information */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-4">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Thông tin bổ sung</h2>
                    <p className="text-sm text-gray-500">Các trường tùy chọn</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Danh mục <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center border-2 border-gray-200 rounded-xl px-4 py-3 focus-within:border-purple-500 transition-all hover:border-gray-300">
                      <Tag className="w-5 h-5 text-gray-400 mr-3" />
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full outline-none bg-transparent"
                        required
                      >
                        <option value="">-- Chọn danh mục --</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Chọn 1 trong 5 danh mục cố định</p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Mô tả sản phẩm
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={6}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-purple-500 transition-all hover:border-gray-300 resize-none"
                      placeholder="Mô tả chi tiết về sản phẩm, tính năng, ứng dụng..."
                      maxLength={2000}
                    />
                    <p className="text-xs text-gray-500 mt-1">{description.length}/2000 ký tự</p>
                  </div>
                </div>
              </div>

              {/* Image Upload - NOW ENABLED */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 relative">
                {uploadedImageUrl && (
                  <div className="absolute top-4 right-4 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold flex items-center">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Đã upload
                  </div>
                )}
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center mr-4">
                    <ImageIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Hình ảnh sản phẩm</h2>
                    <p className="text-sm text-gray-500">Tải lên ảnh hoặc nhập URL</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Upload ảnh lên Cloudinary
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-all">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-600 mb-2">
                        {isUploadingImage ? 'Đang upload...' : 'Kéo thả ảnh vào đây hoặc'}
                      </p>
                      <label className={`inline-block px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 ${isUploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        Chọn file
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          disabled={isUploadingImage}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF tối đa 5MB</p>
                      {uploadedImageUrl && (
                        <p className="text-xs text-green-600 mt-2 font-semibold">✓ Đã upload thành công</p>
                      )}
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">HOẶC</span>
                    </div>
                  </div>

                  

                  {(previewUrl || uploadedImageUrl) && (
                    <div className="mt-4">
                      <p className="text-sm font-bold text-gray-700 mb-2">Xem trước:</p>
                      <img
                        src={uploadedImageUrl || previewUrl || ''}
                        alt="Preview"
                        className="w-full max-h-64 object-contain rounded-xl border-2 border-gray-200"
                      />
                      {uploadedImageUrl && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-600">Ảnh đã được upload và sẽ được lưu cùng sản phẩm.</p>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setUploadedImageUrl('');
                          if (previewUrl) URL.revokeObjectURL(previewUrl);
                          setPreviewUrl(null);
                        }}
                        className="mt-2 text-sm text-red-600 hover:text-red-700 font-semibold"
                      >
                        Xóa ảnh
                      </button>
                    </div>
                  )}

                  {uploadProgress > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 animate-fade-in">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-blue-700">
                          {uploadProgress < 100 ? 'Đang upload ảnh...' : 'Upload hoàn tất!'}
                        </span>
                        <span className="text-sm font-bold text-blue-700">{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => navigate('/seller/products')}
                  className="flex items-center px-6 py-3 border-2 border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all"
                >
                  Hủy bỏ
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || isUploadingImage}
                  className="flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl hover:shadow-xl transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  {isUploadingImage ? 'Đang upload ảnh...' : (isSubmitting ? 'Đang tạo...' : 'Tạo sản phẩm')}
                </button>
              </div>
            </div>

            {/* Preview Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 sticky top-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Xem trước</h3>
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center text-sm text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    {showPreview ? 'Ẩn' : 'Hiện'}
                  </button>
                </div>

                {showPreview ? (
                  <div className="space-y-4">
                    {(previewUrl || imageUrl) && (
                      <img
                        src={previewUrl || imageUrl}
                        alt="Product preview"
                        className="w-full h-48 object-cover rounded-xl"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/300?text=No+Image';
                        }}
                      />
                    )}

                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="text-lg font-bold text-gray-900 mb-2">
                        {name || 'Tên sản phẩm'}
                      </h4>
                      
                      {category && (
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <Tag className="w-4 h-4 mr-1" />
                          {category}
                        </div>
                      )}

                      <div className="flex items-center text-xl font-bold text-blue-600 mb-3 gap-1">
                        {displayPrice || '0'}
                        <span className="text-lg">₫</span>
                      </div>

                      <div className="flex items-center text-sm text-gray-600 mb-3">
                        <Package className="w-4 h-4 mr-1" />
                        Kho: <span className="font-semibold ml-1">{stockQuantity || '0'} cái</span>
                      </div>

                      {description && (
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {description}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Bấm "Hiện" để xem trước sản phẩm</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
