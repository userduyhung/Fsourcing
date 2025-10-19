import React from 'react';
import ProductCard from '../components/ProductCard';
import ProductCategoryTabs from '../components/ProductCategoryTabs';
import SearchBar from '../components/SearchBar';

const categories = [
  {
    name: 'Mobile Electronics',
    products: [
      { image: 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg', price: 'US$ 199.00', quantity: '100 Pieces', name: 'Smartphone X1', description: '' },
      { image: 'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg', price: 'US$ 29.00', quantity: '200 Pieces', name: 'Bluetooth Earbuds', description: '' },
      { image: 'https://images.pexels.com/photos/276528/pexels-photo-276528.jpeg', price: 'US$ 49.00', quantity: '150 Pieces', name: 'Smart Watch', description: '' },
      { image: 'https://images.pexels.com/photos/325876/pexels-photo-325876.jpeg', price: 'US$ 15.00', quantity: '300 Pieces', name: 'Power Bank', description: '' },
      { image: 'https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg', price: 'US$ 8.00', quantity: '500 Pieces', name: 'Phone Case', description: '' },
    ]
  },
  {
    name: 'Auto Vehicle & Accessories',
    products: [
      { image: 'https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg', price: 'US$ 299.00', quantity: '50 Pieces', name: 'Car GPS', description: '' },
      { image: 'https://images.pexels.com/photos/164634/pexels-photo-164634.jpeg', price: 'US$ 120.00', quantity: '80 Pieces', name: 'Car Camera', description: '' },
      { image: 'https://m.media-amazon.com/images/I/71IVuzyEs6L.jpg', price: 'US$ 35.00', quantity: '200 Pieces', name: 'Seat Cover', description: '' },
      { image: 'https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg', price: 'US$ 60.00', quantity: '100 Pieces', name: 'Steering Wheel', description: '' },
      { image: 'https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg', price: 'US$ 25.00', quantity: '300 Pieces', name: 'Car Air Freshener', description: '' },
    ]
  },
  {
    name: 'Beauty & Personal Care',
    products: [
      { image: 'https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg', price: 'US$ 10.00', quantity: '48 Pieces', name: 'Perfume', description: '' },
      { image: 'https://i5.walmartimages.com/seo/Revlon-1875W-Compact-Hair-Dryer-Black_9b619d96-02a9-470c-8c84-8ec2fda3cf6c.5afe0804f72f7d268cdb573c763bdaaa.jpeg', price: 'US$ 39.99', quantity: '200 Cartons', name: 'Hair Dryer', description: '' },
      { image: 'https://images.pexels.com/photos/1027130/pexels-photo-1027130.jpeg', price: 'US$ 5.00', quantity: '500 Pieces', name: 'Bathrobe', description: '' },
      { image: 'https://images.pexels.com/photos/7876665/pexels-photo-7876665.jpeg', price: 'US$ 22.00', quantity: '120 Pieces', name: 'Face Mask', description: '' },
      { image: 'https://images.pexels.com/photos/3018841/pexels-photo-3018841.jpeg', price: 'US$ 18.00', quantity: '250 Pieces', name: 'Skin Care Set', description: '' },
    ]
  },
  {
    name: 'Consumer Electronics',
    products: [
      { image: 'https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg', price: 'US$ 99.00', quantity: '60 Pieces', name: 'Bluetooth Speaker', description: '' },
      { image: 'https://images.pexels.com/photos/276528/pexels-photo-276528.jpeg', price: 'US$ 49.00', quantity: '150 Pieces', name: 'LED TV', description: '' },
      { image: 'https://images.pexels.com/photos/325876/pexels-photo-325876.jpeg', price: 'US$ 15.00', quantity: '300 Pieces', name: 'Wireless Mouse', description: '' },
      { image: 'https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg', price: 'US$ 8.00', quantity: '500 Pieces', name: 'USB Flash Drive', description: '' },
      { image: 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg', price: 'US$ 199.00', quantity: '100 Pieces', name: 'Tablet', description: '' },
    ]
  },
  {
    name: 'Electronic Components',
    products: [
      { image: 'https://images.pexels.com/photos/3862132/pexels-photo-3862132.jpeg', price: 'US$ 2.00', quantity: '1000 Pieces', name: 'Resistor', description: '' },
      { image: 'https://res.cloudinary.com/rsc/image/upload/b_rgb:FFFFFF,c_pad,dpr_2.625,f_auto,h_214,q_auto,w_380/c_pad,h_214,w_380/F7111340-01?pgw=1', price: 'US$ 3.00', quantity: '800 Pieces', name: 'Capacitor', description: '' },
      { image: 'https://images.pexels.com/photos/3862373/pexels-photo-3862373.jpeg', price: 'US$ 1.50', quantity: '1200 Pieces', name: 'Diode', description: '' },
      { image: 'https://images.pexels.com/photos/2800832/pexels-photo-2800832.jpeg', price: 'US$ 4.00', quantity: '900 Pieces', name: 'Transistor', description: '' },
      { image: 'https://images.pexels.com/photos/7876665/pexels-photo-7876665.jpeg', price: 'US$ 2.50', quantity: '1100 Pieces', name: 'IC Chip', description: '' },
    ]
  },
  {
    name: 'Fashion Accessories and Footwear',
    products: [
      { image: 'https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg', price: 'US$ 25.00', quantity: '400 Pieces', name: 'Sneakers', description: '' },
      { image: 'https://images.pexels.com/photos/1204464/pexels-photo-1204464.jpeg?cs=srgb&dl=pexels-catscoming-1204464.jpg&fm=jpg', price: 'US$ 12.00', quantity: '600 Pieces', name: 'Handbag', description: '' },
      { image: 'https://images.pexels.com/photos/1027130/pexels-photo-1027130.jpeg', price: 'US$ 8.00', quantity: '700 Pieces', name: 'Sunglasses', description: '' },
      { image: 'https://images.pexels.com/photos/7876665/pexels-photo-7876665.jpeg', price: 'US$ 19.00', quantity: '350 Pieces', name: 'Watch', description: '' },
      { image: 'https://images.pexels.com/photos/3018841/pexels-photo-3018841.jpeg', price: 'US$ 15.00', quantity: '500 Pieces', name: 'Belt', description: '' },
    ]
  }
];

export const ProductList: React.FC<{ addToCart?: (product: any) => void }> = ({ addToCart }) => {

  const [selectedCategory, setSelectedCategory] = React.useState('All');

  // Lấy search query từ URL
  const searchParams = new URLSearchParams(window.location.search);
  const searchQuery = searchParams.get('search')?.toLowerCase() || '';

  // Hàm loại bỏ dấu tiếng Việt
  function removeAccents(str: string): string {
    return str.normalize('NFD').replace(/\p{Diacritic}/gu, '');
  }

  // Nếu có search query, chỉ hiển thị các danh mục có sản phẩm liên quan tới từ khoá
  let filteredCategories = categories;
  if (searchQuery) {
    const normalizedQuery = removeAccents(searchQuery).trim();
    filteredCategories = categories
      .map(cat => {
        const filteredProducts = cat.products.filter(product => {
          const name = removeAccents(product.name?.toLowerCase() || '');
          const desc = removeAccents(product.description?.toLowerCase() || '');
          // Tìm kiếm từ khoá trong tên hoặc mô tả
          return (
            name.includes(normalizedQuery) ||
            desc.includes(normalizedQuery)
          );
        });
        return filteredProducts.length > 0 ? { ...cat, products: filteredProducts } : null;
      })
      .filter(Boolean) as typeof categories;
  }

  // Lấy tất cả sản phẩm từ các danh mục đã lọc
  const allProducts = filteredCategories.flatMap(cat => 
    cat.products.map(p => ({ ...p, category: cat.name }))
  );

  return (
    <div className="bg-[#f8ecd7] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6">
          <SearchBar />
        </div>
        <ProductCategoryTabs onSelect={setSelectedCategory} />
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {selectedCategory === 'All' ? 'All Products' : selectedCategory}
        </h1>
        {selectedCategory === 'All' ? (
          filteredCategories.map(category => (
            <div key={category.name} className="mb-10">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">{category.name}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {category.products.map((product, idx) => (
                  <ProductCard key={idx} {...product} onAddToCart={addToCart} />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {allProducts.map((product, idx) => (
              <ProductCard key={idx} {...product} onAddToCart={addToCart} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

