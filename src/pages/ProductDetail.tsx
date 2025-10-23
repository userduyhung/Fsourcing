import React from 'react';
import { useLocation } from 'react-router-dom';
// Define CartItem type locally since it's not exported from App
interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
}
import { useState } from 'react';

interface ProductDetailProps {
  addToCart: (product: Omit<CartItem, 'quantity'>) => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ addToCart }) => {
  const location = useLocation();
  const product = location.state?.product;
  const [showAdded, setShowAdded] = useState(false);

  if (!product) {
    return <div className="text-center py-20">Không tìm thấy sản phẩm.</div>;
  }

  const handleAddToCart = () => {
    addToCart({
      id: product.id || product.name,
      name: product.name,
      price: parseFloat(product.price.replace(/[^\d.]/g, '')),
      image: product.image
    });
    setShowAdded(true);
  };

  React.useEffect(() => {
    if (showAdded) {
      const timer = setTimeout(() => setShowAdded(false), 1800);
      return () => clearTimeout(timer);
    }
  }, [showAdded]);

  return (
    <div className="bg-[#f8ecd7] min-h-screen py-8 relative">
      {showAdded && (
        <div className="fixed left-1/2 top-8 z-50 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fadeout transition-opacity duration-1000 font-sans">
          <span>Đã thêm sản phẩm vào giỏ hàng!</span>
        </div>
      )}
      <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row gap-8">
  {/* Hình ảnh & Video */}
        <div className="flex-1">
          <div className="mb-4 flex gap-2">
            {/* Ảnh nhỏ */}
            <img src={product.image} alt={product.name} className="w-20 h-20 object-cover rounded-lg border" />
            {/* ...các ảnh khác nếu có... */}
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 flex items-center justify-center">
            {/* Ảnh chính hoặc video */}
            <img src={product.image} alt={product.name} className="w-80 h-80 object-contain" />
            {/* Nếu có video, hiển thị ở đây */}
          </div>
        </div>
  {/* Thông tin sản phẩm */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-red-600 text-xl font-bold">{product.price}</span>
            <span className="text-gray-600">{product.quantity}</span>
          </div>
          <div className="mb-4">
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-semibold mr-2">Lựa chọn của chuyên gia</span>
            <span className="text-gray-500 text-xs">Thời gian giao hàng: 10~35 ngày</span>
          </div>
          <div className="mb-6">
            <h2 className="font-semibold text-gray-800 mb-2">Thông tin sản phẩm</h2>
            <table className="w-full text-sm">
              <tbody>
                <tr>
                  <td className="font-medium text-gray-700 py-1">Đặc điểm</td>
                  <td className="py-1">Balo LED</td>
                </tr>
                <tr>
                  <td className="font-medium text-gray-700 py-1">Giới tính</td>
                  <td className="py-1">Nam & Nữ</td>
                </tr>
                <tr>
                  <td className="font-medium text-gray-700 py-1">Chất liệu</td>
                  <td className="py-1">Vải canvas, denim, EVA, da thật, lưới, nylon, oxford, polyester, PU, PVC, da tổng hợp</td>
                </tr>
              </tbody>
            </table>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 font-bold rounded-lg mb-4"
            onClick={handleAddToCart}
          >Thêm vào giỏ hàng</button>
          {/* Thông tin nhà bán */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-gray-800 mb-2">Polywell Group Co. Ltd</h3>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded mr-2">Đã xác thực</span>
            <span className="text-xs text-gray-500">Trung Quốc</span>
            <div className="mt-2 text-sm text-gray-600">Nhà cung cấp này có website Global Sources 17 năm.<br/>Tỷ lệ phản hồi: Cao<br/>Thời gian phản hồi trung bình: &lt;24h</div>
            <div className="mt-2 flex gap-2">
              <button className="bg-gray-100 px-3 py-1 rounded">Chat ngay</button>
              <button className="bg-gray-100 px-3 py-1 rounded">Theo dõi</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
