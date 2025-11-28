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
    <section className="bg-gray-50 rounded-xl p-4 mt-8 flex justify-center font-sans">
      <div className="w-full max-w-6xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-red-600 font-bold text-xl">Mới</span>
            <span className="font-bold text-xl text-gray-900">Sản phẩm</span>
            <span className="ml-3 text-gray-500 font-medium text-sm">Khám phá các sản phẩm nổi bật</span>
          </div>
          <button onClick={navigateToProducts} className="text-gray-500 hover:text-blue-600 font-medium text-sm bg-transparent border-none cursor-pointer font-sans">Xem tất cả</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {displayProducts.map((product, idx) => (
            <ProductCard
              key={idx}
              id={product.id}
              image={product.image}
              name={product.name}
              description={product.description}
              price={typeof product.price === 'number' ? Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price) : product.price}
              quantity={product.quantity || ''}
              onAddToCart={addToCart}
            />
          ))}
        </div>
      </div>

    </section>
  );
};

export default ProductShowcase;
