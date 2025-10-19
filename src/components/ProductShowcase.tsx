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
  {
    image: 'https://images.pexels.com/photos/325876/pexels-photo-325876.jpeg',
    price: 'US$ 2.00',
    quantity: '1000 Pieces',
    name: 'Water Bottles',
    description: '',
  },
  {
    image: 'https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg',
    price: 'US$ 15.00',
    quantity: '300 Pieces',
    name: 'Bluetooth Speakers',
    description: '',
  },
  {
    image: 'https://images.pexels.com/photos/276528/pexels-photo-276528.jpeg',
    price: 'US$ 8.00',
    quantity: '600 Pieces',
    name: 'LED Desk Lamps',
    description: '',
  },
  {
    image: 'https://images.pexels.com/photos/325876/pexels-photo-325876.jpeg',
    price: 'US$ 3.50',
    quantity: '800 Pieces',
    name: 'Travel Mugs',
    description: '',
  },
  {
    image: 'https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg',
    price: 'US$ 12.00',
    quantity: '400 Pieces',
    name: 'Wireless Mouse',
    description: '',
  },
  {
    image: 'https://images.pexels.com/photos/276528/pexels-photo-276528.jpeg',
    price: 'US$ 6.00',
    quantity: '700 Pieces',
    name: 'USB Flash Drives',
    description: '',
  },
  {
    image: 'https://images.pexels.com/photos/325876/pexels-photo-325876.jpeg',
    price: 'US$ 4.00',
    quantity: '900 Pieces',
    name: 'Notebook',
    description: '',
  },
  {
    image: 'https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg',
    price: 'US$ 18.00',
    quantity: '250 Pieces',
    name: 'Power Banks',
    description: '',
  },
  {
    image: 'https://images.pexels.com/photos/276528/pexels-photo-276528.jpeg',
    price: 'US$ 7.00',
    quantity: '550 Pieces',
    name: 'Desk Organizers',
    description: '',
  },
  {
    image: 'https://images.pexels.com/photos/325876/pexels-photo-325876.jpeg',
    price: 'US$ 2.50',
    quantity: '1200 Pieces',
    name: 'Sticky Notes',
    description: '',
  },
  {
    image: 'https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg',
    price: 'US$ 9.00',
    quantity: '350 Pieces',
    name: 'Earphones',
    description: '',
  },
  {
    image: 'https://images.pexels.com/photos/276528/pexels-photo-276528.jpeg',
    price: 'US$ 5.00',
    quantity: '650 Pieces',
    name: 'Phone Cases',
    description: '',
  },
  {
    image: 'https://images.pexels.com/photos/325876/pexels-photo-325876.jpeg',
    price: 'US$ 3.00',
    quantity: '1100 Pieces',
    name: 'Pens',
    description: '',
  },
  {
    image: 'https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg',
    price: 'US$ 11.00',
    quantity: '500 Pieces',
    name: 'Backpacks',
    description: '',
  },
  {
    image: 'https://images.pexels.com/photos/276528/pexels-photo-276528.jpeg',
    price: 'US$ 14.00',
    quantity: '200 Pieces',
    name: 'Smart Watches',
    description: '',
  },
  {
    image: 'https://images.pexels.com/photos/325876/pexels-photo-325876.jpeg',
    price: 'US$ 6.00',
    quantity: '750 Pieces',
    name: 'Lunch Boxes',
    description: '',
  },
  {
    image: 'https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg',
    price: 'US$ 13.00',
    quantity: '300 Pieces',
    name: 'Fitness Bands',
    description: '',
  },
  {
    image: 'https://images.pexels.com/photos/276528/pexels-photo-276528.jpeg',
    price: 'US$ 16.00',
    quantity: '150 Pieces',
    name: 'Bluetooth Headphones',
    description: '',
  },
];

const columns = 5;
const displayProducts = products.slice(0, products.length - (products.length % columns));

const ProductShowcase: React.FC<{ addToCart?: (product: any) => void }> = ({ addToCart }) => {
  const navigateToProducts = () => {
    window.location.href = '/products';
  };

  return (
    <section className="bg-gray-50 rounded-xl p-4 mt-8 flex justify-center">
      <div className="w-full max-w-6xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-red-600 font-bold text-xl">New</span>
            <span className="font-bold text-xl text-gray-900">Products</span>
            <span className="ml-3 text-gray-500 font-medium text-sm">Explore the hottest releases in the past two weeks</span>
          </div>
          <button onClick={navigateToProducts} className="text-gray-500 hover:text-blue-600 font-medium text-sm bg-transparent border-none cursor-pointer">See All</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {displayProducts.map((product, idx) => (
            <ProductCard key={idx} {...product} onAddToCart={addToCart} />
          ))}
        </div>
      </div>

      </section>
    );
};

export default ProductShowcase;
