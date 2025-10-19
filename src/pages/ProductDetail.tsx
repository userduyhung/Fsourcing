import React from 'react';
import { useLocation } from 'react-router-dom';
import { CartItem } from '../App';

interface ProductDetailProps {
  addToCart: (product: Omit<CartItem, 'quantity'>) => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ addToCart }) => {
  const location = useLocation();
  const product = location.state?.product;

  if (!product) {
    return <div className="text-center py-20">Product not found.</div>;
  }

  return (
    <div className="bg-[#f8ecd7] min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row gap-8">
        {/* Left: Images & Video */}
        <div className="flex-1">
          <div className="mb-4 flex gap-2">
            {/* Thumbnails */}
            <img src={product.image} alt={product.name} className="w-20 h-20 object-cover rounded-lg border" />
            {/* ...other thumbnails if available... */}
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 flex items-center justify-center">
            {/* Main Image or Video */}
            <img src={product.image} alt={product.name} className="w-80 h-80 object-contain" />
            {/* If product.video, show video player here */}
          </div>
        </div>
        {/* Right: Info */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-red-600 text-xl font-bold">{product.price}</span>
            <span className="text-gray-600">{product.quantity}</span>
          </div>
          <div className="mb-4">
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-semibold mr-2">Analyst's Choice</span>
            <span className="text-gray-500 text-xs">Lead Time: 10~35 days</span>
          </div>
          <div className="mb-6">
            <h2 className="font-semibold text-gray-800 mb-2">Product Information</h2>
            <table className="w-full text-sm">
              <tbody>
                <tr>
                  <td className="font-medium text-gray-700 py-1">Feature</td>
                  <td className="py-1">LED backpack</td>
                </tr>
                <tr>
                  <td className="font-medium text-gray-700 py-1">Gender</td>
                  <td className="py-1">Unisex</td>
                </tr>
                <tr>
                  <td className="font-medium text-gray-700 py-1">Material</td>
                  <td className="py-1">Canvas, Denim, EVA, Genuine leather, Mesh, Nylon, Oxford, Polyester, PU, PVC, Synthetic leather</td>
                </tr>
              </tbody>
            </table>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 font-bold rounded-lg mb-4"
            onClick={() => {
              addToCart({
                id: product.id || product.name,
                name: product.name,
                price: parseFloat(product.price.replace(/[^\d.]/g, '')),
                image: product.image
              });
              alert('Đã thêm vào giỏ hàng!');
            }}
          >Thêm vào giỏ hàng</button>
          {/* Seller Info */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-gray-800 mb-2">Polywell Group Co. Ltd</h3>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded mr-2">Verified</span>
            <span className="text-xs text-gray-500">China</span>
            <div className="mt-2 text-sm text-gray-600">This supplier has a Global Sources Website for 17 years.<br/>Response Rate: High<br/>Avg Response Time: &lt;24h</div>
            <div className="mt-2 flex gap-2">
              <button className="bg-gray-100 px-3 py-1 rounded">Chat</button>
              <button className="bg-gray-100 px-3 py-1 rounded">Follow</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
