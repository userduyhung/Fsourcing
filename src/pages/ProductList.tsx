import React from 'react';
import ProductCard from '../components/ProductCard';
import ProductCategoryTabs from '../components/ProductCategoryTabs';

const products = [
  {
    image: 'https://images.pexels.com/photos/1027130/pexels-photo-1027130.jpeg',
    price: 'US$ 5.00',
    quantity: '500 Pieces',
    name: 'Bathrobes',
    description: '',
  },
  {
    image: 'https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg',
    price: 'US$ 10.00',
    quantity: '48 Pieces',
    name: "Men's cologne & perfume",
    description: '',
  },
  {
    image: 'https://images.pexels.com/photos/715688/pexels-photo-715688.jpeg',
    price: 'US$ 39.99',
    quantity: '200 Cartons',
    name: 'Hair dryers',
    description: '',
  },
  {
    image: 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg',
    price: 'US$ 0.50',
    quantity: '417 Pieces',
    name: 'Mobile phone bags',
    description: '',
  },
  {
    image: 'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg',
    price: 'US$ 10.00',
    quantity: '500 Pieces',
    name: 'Multifunction chargers',
    description: '',
  },
];

const ProductList: React.FC = () => {
  return (
    <div className="bg-[#f8ecd7] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <ProductCategoryTabs />
        <h1 className="text-2xl font-bold text-gray-900 mb-6">All Products</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {products.map((product, idx) => (
            <ProductCard key={idx} {...product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductList;
