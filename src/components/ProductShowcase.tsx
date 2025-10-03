import React from 'react';
import ProductCard from './ProductCard';

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
    image: 'https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg',
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

const ProductShowcase: React.FC = () => {
  return (
    <section className="bg-gray-50 rounded-xl p-4 mt-8 flex justify-center">
      <div className="w-full max-w-6xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-red-600 font-bold text-xl">New</span>
            <span className="font-bold text-xl text-gray-900">Products</span>
            <span className="ml-3 text-gray-500 font-medium text-sm">Explore the hottest releases in the past two weeks</span>
          </div>
          <a href="#" className="text-gray-500 hover:text-blue-600 font-medium text-sm">See All</a>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {products.map((product, idx) => (
            <ProductCard key={idx} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductShowcase;
