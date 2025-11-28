import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import showAppToast from '../utils/toast';
import { productsApi } from '../services/apiClient';
import { addCartItem } from '../services/cartService';
import { validateProduct, validateAuthentication } from '../utils/purchaseValidation';

// Define CartItem type locally since it's not exported from App
interface CartItem {
  id: string;
  name: string;
  price: number;
  image?: string;
}

interface ProductDetailProps {
  addToCart: (product: Omit<CartItem, 'quantity'>) => void;
}

const formatPrice = (val: any) => {
  if (val == null) return '';
  if (typeof val === 'number') return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  try {
    const n = parseFloat(String(val).replace(/[^\d.\-]/g, ''));
    if (isNaN(n)) return String(val);
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
  } catch {
    return String(val);
  }
};

const ProductDetail: React.FC<ProductDetailProps> = ({ addToCart }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [fetchedProduct, setFetchedProduct] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const product = location.state?.product ?? fetchedProduct;
  const [showAdded, setShowAdded] = useState(false);
  const [mainImage, setMainImage] = useState<string | undefined>();
  const [quantity, setQuantity] = useState(1);
  const PLACEHOLDER = 'https://via.placeholder.com/800x600?text=No+Image';

  // Fetch product by ID if not passed via location.state
  useEffect(() => {
    if (!location.state?.product && id) {
      setLoading(true);
      setError(null);
      productsApi.get(id)
        .then((response: any) => {
          // Handle both response.data and direct response
          const productData = response?.data || response;
          setFetchedProduct(productData);
          setLoading(false);
        })
        .catch((err: any) => {
          console.error('Failed to fetch product:', err);
          setError('Không thể tải thông tin sản phẩm');
          setLoading(false);
          showAppToast('Không thể tải thông tin sản phẩm', 'error');
        });
    }
  }, [id, location.state?.product]);

  useEffect(() => {
    if (product) {
      const images = product.images ?? (product.image ? [product.image] : []);
      setMainImage(images[0]);
    }
  }, [product]);

  if (loading) {
    return <div className="text-center py-20 font-sans">Đang tải sản phẩm...</div>;
  }

  if (error || !product) {
    return <div className="text-center py-20 font-sans text-red-600">{error || 'Không tìm thấy sản phẩm.'}</div>;
  }

  const handleAddToCart = async () => {
    // Validate authentication
    const authValidation = validateAuthentication();
    if (!authValidation.isValid) {
      showAppToast(authValidation.errors[0] || 'Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng', 'info', 1400);
      const from = { pathname: location.pathname, state: (location as any).state };
      setTimeout(() => navigate('/login', { state: { from } }), 600);
      return;
    }

    // Validate product before adding to cart
    const validation = validateProduct(product, quantity);
    
    // Show warnings if any
    if (validation.warnings.length > 0) {
      console.warn('Product warnings:', validation.warnings);
    }
    
    // Show errors and stop if validation fails
    if (!validation.isValid) {
      showAppToast(validation.errors[0] || 'Sản phẩm không hợp lệ', 'error', 2500);
      console.error('Product validation failed:', validation.errors);
      return;
    }

    try {

      // Call backend API to add item to cart
      const productId = String(product.id);
      const priceNumber = typeof product.price === 'number' ? product.price : parseFloat(String(product.price).replace(/[^\d.\-]/g, '')) || 0;
      
      await addCartItem(productId, quantity, {
        name: product.name ?? 'Sản phẩm',
        price: priceNumber,
        image: mainImage ?? product.image
      });

      // Also update local state for backward compatibility
      // addToCart({
      //   id: productId,
      //   name: product.name ?? 'Sản phẩm',
      //   price: priceNumber,
      //   image: mainImage ?? product.image
      // });

      setShowAdded(true);
      showAppToast(`Đã thêm ${quantity} sản phẩm vào giỏ hàng`, 'success', 1200);
      
      // Reset quantity to 1 after adding to cart
      setQuantity(1);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      showAppToast('Không thể thêm vào giỏ hàng. Vui lòng thử lại.', 'error', 2000);
    }
  };

  useEffect(() => {
    if (showAdded) {
      const timer = setTimeout(() => setShowAdded(false), 1600);
      return () => clearTimeout(timer);
    }
  }, [showAdded]);

  const images: string[] = (product.images && Array.isArray(product.images) && product.images.length > 0)
    ? product.images
    : (product.image ? [product.image] : []);

  // Preview / lightbox state (declared after `images` so it can reference its length)
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const openPreview = (index: number) => {
    const idx = Math.max(0, Math.min(index, images.length - 1));
    setPreviewIndex(idx);
    setPreviewOpen(true);
  };

  const closePreview = () => setPreviewOpen(false);

  const nextPreview = () => setPreviewIndex((i) => (i + 1) % Math.max(1, images.length));
  const prevPreview = () => setPreviewIndex((i) => (i - 1 + Math.max(1, images.length)) % Math.max(1, images.length));

  useEffect(() => {
    if (!previewOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePreview();
      if (e.key === 'ArrowRight') nextPreview();
      if (e.key === 'ArrowLeft') prevPreview();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [previewOpen, images.length]);

  return (
    // reduce excessive vertical whitespace: remove full-screen min height and lower vertical padding
    <div className="bg-app py-6 font-sans">
      {showAdded && (
        <div className="fixed left-1/2 top-6 z-50 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg font-sans">
          Đã thêm sản phẩm vào giỏ hàng!
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="md:flex">
            {/* Left: Gallery */}
            <div className="md:w-1/2 p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="bg-app rounded-lg p-6 flex items-center justify-center">
                    {mainImage ? (
                      <img
                        src={mainImage}
                        alt={product.name ?? 'Ảnh sản phẩm'}
                        className="max-h-96 w-full object-contain cursor-zoom-in"
                        loading="lazy"
                        onError={(e: any) => { e.currentTarget.src = PLACEHOLDER; }}
                        onClick={() => openPreview(images.indexOf(mainImage ?? images[0] ?? PLACEHOLDER))}
                        role="button"
                        aria-label="Mở xem ảnh"
                      />
                    ) : (
                      <img src={PLACEHOLDER} alt="No image" className="max-h-96 w-full object-contain" />
                    )}
                  </div>
                </div>
                <div className="w-full md:w-36 flex md:flex-col gap-2 mt-2 md:mt-0 overflow-x-auto md:overflow-x-visible">
                  {images.length ? images.map((src, idx) => (
                    <button
                      key={idx}
                      onClick={() => setMainImage(src)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setMainImage(src); } }}
                      aria-pressed={mainImage === src}
                      tabIndex={0}
                      className={`border rounded-md p-1 bg-white hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-blue-400 ${mainImage === src ? 'ring-2 ring-blue-300' : ''}`}
                      aria-label={`Chọn ảnh ${idx + 1}`}
                    >
                      <img
                        src={src}
                        alt={product.name ? `${product.name} - ảnh ${idx + 1}` : `thumb-${idx}`}
                        className="w-20 h-20 object-cover rounded"
                        loading="lazy"
                        onError={(e: any) => { e.currentTarget.src = 'https://via.placeholder.com/64?text=No+Image'; }}
                      />
                    </button>
                  )) : (
                    <div className="text-sm text-gray-500">Không có ảnh phụ</div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Info */}
            <div className="md:w-1/2 p-6 flex flex-col justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2 font-sans">{product.name ?? 'Sản phẩm chưa có tên'}</h1>
                <div className="flex items-baseline gap-4 mb-3">
                  <div className="text-2xl md:text-3xl text-red-600 font-bold">{formatPrice(product.price)}</div>
                  {product.referencePrice && (
                    <div className="text-sm text-gray-500 line-through">{formatPrice(product.referencePrice)}</div>
                  )}
                </div>
                <div className="text-sm text-gray-600 mb-4">Số lượng sẵn có: <span className="font-medium text-gray-800">{product.quantity ?? '—'}</span></div>

                <div className="mb-4">
                  <h3 className="font-semibold text-gray-800 mb-1">Mô tả</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-line">{product.description ?? 'Chưa có mô tả cho sản phẩm này.'}</p>
                </div>

                {/* <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-2">Thông số</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                    <div className="flex justify-between"><span className="text-gray-600">Đặc điểm</span><span>{product.feature ?? '—'}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Chất liệu</span><span>{product.material ?? '—'}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Xuất xứ</span><span>{product.origin ?? '—'}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Thời gian giao</span><span>{product.leadTime ?? '10~35 ngày'}</span></div>
                  </div>
                </div> */}
                </div>

              {/* Quantity selector */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-800 mb-2">Số lượng</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100 font-semibold text-lg"
                    aria-label="Giảm số lượng"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val) && val >= 1) {
                        setQuantity(val);
                      }
                    }}
                    onBlur={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (isNaN(val) || val < 1) {
                        setQuantity(1);
                      }
                    }}
                    className="w-20 h-10 text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100 font-semibold text-lg"
                    aria-label="Tăng số lượng"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAddToCart}
                  className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold font-sans"
                >Thêm vào giỏ hàng</button>
                <button
                  onClick={async () => {
                    const buyerToken = localStorage.getItem('buyerToken');
                    const sellerToken = localStorage.getItem('sellerToken');
                    const adminToken = localStorage.getItem('adminToken');
                    const supplierToken = localStorage.getItem('supplierToken');
                    const genericToken = localStorage.getItem('token');
                    const isAuthenticated = !!(buyerToken || sellerToken || adminToken || supplierToken || genericToken);
                    if (!isAuthenticated) {
                      // preserve location pathname + state like other handlers
                      const from = { pathname: location.pathname, state: (location as any).state };
                      navigate('/login', { state: { from } });
                      return;
                    }

                    try {
                      // Validate product has a valid id (GUID required by backend)
                      if (!product.id) {
                        console.error('Product missing id:', product);
                        showAppToast('Sản phẩm thiếu ID hợp lệ. Không thể thêm vào giỏ hàng.', 'error', 2000);
                        return;
                      }

                      // Add to cart via API
                      const productId = String(product.id);
                      const priceNumber = typeof product.price === 'number' ? product.price : parseFloat(String(product.price).replace(/[^\d.\-]/g, '')) || 0;
                      
                      await addCartItem(productId, quantity, {
                        name: product.name ?? 'Sản phẩm',
                        price: priceNumber,
                        image: mainImage ?? product.image
                      });

                      // Also update local state
                      // addToCart({ 
                      //   id: productId, 
                      //   name: product.name ?? 'Sản phẩm', 
                      //   price: priceNumber, 
                      //   image: mainImage ?? product.image 
                      // });

                      navigate('/buyer/checkout');
                    } catch (error) {
                      console.error('Failed to add to cart:', error);
                      showAppToast('Không thể thêm vào giỏ hàng. Vui lòng thử lại.', 'error', 2000);
                    }
                  }}
                  className="w-full sm:flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold font-sans"
                >Mua ngay</button>
              </div>
            </div>
          </div>
        </div>

        {/* Lightbox / Preview modal */}
        {previewOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="relative max-w-5xl w-full">
              <button onClick={closePreview} aria-label="Đóng" className="absolute right-2 top-2 text-white bg-black/40 rounded-full p-2 hover:bg-black/60">✕</button>
              <button onClick={prevPreview} aria-label="Trước" className="absolute left-2 top-1/2 -translate-y-1/2 text-white bg-black/40 rounded-full p-2 hover:bg-black/60">◀</button>
              <button onClick={nextPreview} aria-label="Sau" className="absolute right-12 top-1/2 -translate-y-1/2 text-white bg-black/40 rounded-full p-2 hover:bg-black/60">▶</button>
              <div className="bg-white p-4 rounded">
                <img src={images[previewIndex] ?? PLACEHOLDER} alt={`Ảnh xem trước ${previewIndex + 1}`} className="w-full h-[70vh] object-contain" onError={(e: any) => { e.currentTarget.src = PLACEHOLDER; }} />
                {images.length > 1 && (
                  <div className="mt-2 flex items-center justify-center gap-2">
                    {images.map((s, i) => (
                      <button key={i} onClick={() => setPreviewIndex(i)} className={`w-12 h-12 border rounded overflow-hidden ${i === previewIndex ? 'ring-2 ring-blue-400' : ''}`}>
                        <img src={s} alt={`thumb-preview-${i}`} className="w-full h-full object-cover" onError={(e: any) => { e.currentTarget.src = 'https://via.placeholder.com/64?text=No+Image'; }} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Seller info card below - only show industry (removed location and certifications) */}
        {/* <div className="mt-6 bg-white rounded-xl shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Ngành: <span className="font-medium text-gray-800">{product.industry ?? product.sellerIndustry ?? '—'}</span></div>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 border rounded">Chat</button>
              <button className="px-3 py-1 border rounded">Theo dõi</button>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default ProductDetail;
