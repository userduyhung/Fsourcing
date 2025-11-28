import React from 'react';
import ProductCard from './ProductCard';
import { CATEGORIES } from '../pages/ProductList';

const columns = 5;
const MAX_SHOW = 5;

const ProductShowcase: React.FC<{ addToCart?: (product: any) => void }> = ({ addToCart }) => {
  const navigateToProducts = () => {
    window.location.href = '/products';
  };

  // Flatten products from categories
  const allProducts = CATEGORIES.flatMap(c => c.products || []);
  
  // Shuffle array using Fisher-Yates algorithm and pick MAX_SHOW products
  const shuffled = [...allProducts].sort(() => Math.random() - 0.5);
  const displayProducts = shuffled.slice(0, Math.min(MAX_SHOW, shuffled.length));

  return (
    <section className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 mt-8 flex justify-center font-sans shadow-xl">
      <div className="w-full max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-4 py-2 rounded-full font-bold text-lg animate-pulse shadow-lg">
              🔥 HOT
            </div>
            <span className="font-bold text-2xl text-gray-900">Sản phẩm nổi bật</span>
            <span className="ml-3 text-gray-600 font-medium">Khám phá ngay hôm nay</span>
          </div>
          <button 
            onClick={navigateToProducts} 
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full font-bold hover:shadow-lg transform hover:scale-105 transition-all"
          >
            Xem tất cả →
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {displayProducts.map((product, idx) => (
            <div key={idx} className="transform hover:scale-105 transition-all duration-300">
              <ProductCard
                id={product.id}
                image={product.image}
                name={product.name}
                description={product.description}
                price={typeof product.price === 'number' ? Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price) : product.price}
                quantity={product.quantity || ''}
                onAddToCart={addToCart}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductShowcase;
