import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { showAppToast } from '../utils/toast';
import { addCartItem } from '../services/cartService';

interface ProductCardProps {
  image: string;
  price: string | number;
  quantity: string;
  name: string;
  description: string;
  id?: string;
  sellerName?: string;
  sellerProfileId?: string;
}

const ProductCard: React.FC<ProductCardProps & { onAddToCart?: (product: any) => void }> = ({ image, price, quantity, name, description, id, sellerName, sellerProfileId, onAddToCart }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const handleClick = () => {
    // Ensure we pass a numeric price to the detail page (strip all non-digit characters)
    const numericPrice = parseInt(String(price).replace(/[^\d]/g, ''), 10) || 0;
    navigate(`/product/${encodeURIComponent(id || name)}`, { state: { product: { id, image, price: numericPrice, quantity, name, description } } });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    // Check authentication: prefer role-specific tokens used across the app
    const buyerToken = localStorage.getItem('buyerToken');
    const sellerToken = localStorage.getItem('sellerToken');
    const adminToken = localStorage.getItem('adminToken');
    const supplierToken = localStorage.getItem('supplierToken');
    const genericToken = localStorage.getItem('token');
    const isAuthenticated = !!(buyerToken || sellerToken || adminToken || supplierToken || genericToken);
    if (!isAuthenticated) {
      // Show a toast first, then redirect to login preserving full location (path + state)
      showAppToast('Bạn cần đăng nhập để thêm vào giỏ hàng', 'info', 1400);
      const from = { pathname: location.pathname, state: (location as any).state };
      setTimeout(() => navigate('/login', { state: { from } }), 600);
      return;
    }

    try {
      // parse an integer amount in VND from display string like "12.000 ₫" -> 12000
      const numeric = parseInt(String(price).replace(/[^\d]/g, ''), 10) || 0;

      // Validate product has valid id (GUID required by backend)
      if (!id) {
        console.error('Product missing id:', { name, price, quantity });
        showAppToast('Sản phẩm thiếu ID. Không thể thêm vào giỏ hàng.', 'error', 2000);
        return;
      }

      // Call backend API to add to cart with full product info
      await addCartItem(id, 1, {
        name,
        price: numeric,
        image
      });

      // Also call the local callback for backward compatibility
      // if (onAddToCart) {
      //   onAddToCart({ id: id!, name, price: numeric, image });
      // }

      showAppToast('Đã thêm vào giỏ hàng', 'success', 1200);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      showAppToast('Không thể thêm vào giỏ hàng', 'error', 2000);
    }
  };
  return (
    <div className="bg-white rounded-lg shadow-sm p-3 flex flex-col cursor-pointer hover:shadow-lg relative font-sans h-full min-h-[320px]" onClick={handleClick}>
      <button
        className="absolute top-2 right-2 bg-blue-100 hover:bg-blue-200 p-2 rounded-full z-10 transition-colors"
        onClick={handleAddToCart}
        title="Thêm vào giỏ hàng"
      >
        <ShoppingCart className="h-5 w-5 text-blue-600" />
      </button>

      {/* Image container with fixed height */}
      <div className="w-full h-32 flex items-center justify-center mb-3">
        <img src={image} alt={name} className="max-w-full max-h-full object-contain rounded-md" />
      </div>

      {/* Content container with flex-grow */}
      <div className="w-full flex-grow flex flex-col">
        <div className="font-bold text-base text-gray-900 mb-1 font-sans">
          {typeof price === 'number'
            ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
            : price}
        </div>
        <div className="text-gray-400 text-xs mb-2 font-sans">Số lượng: {quantity}</div>
        <div className="text-gray-700 text-sm font-medium font-sans mb-1 line-clamp-2">{name}</div>
        {sellerName && (
          <div className="text-xs text-blue-600 hover:underline mb-2">
            <a
              href={sellerProfileId ? `/buyer/seller-detail/${encodeURIComponent(sellerProfileId)}` : '#'}
              onClick={(e) => {
                e.stopPropagation();
                if (sellerProfileId) {
                  navigate(`/buyer/seller-detail/${encodeURIComponent(sellerProfileId)}`);
                }
              }}
            >
              Nhà bán: {sellerName}
            </a>
          </div>
        )}
        <div className="text-gray-500 text-xs mt-auto font-sans line-clamp-3">{description}</div>
      </div>
    </div>
  );
}

export default ProductCard;
