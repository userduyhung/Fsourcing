import React from 'react';

interface ProductCardProps {
  image: string;
  price: string;
  quantity: string;
  name: string;
  description: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ image, price, quantity, name, description }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-2 flex flex-col items-center">
      <img src={image} alt={name} className="w-full h-32 object-contain rounded-md mb-2" />
      <div className="w-full">
        <div className="font-bold text-base text-gray-900 mb-0.5">{price}</div>
        <div className="text-gray-400 text-xs mb-0.5">{quantity}</div>
        <div className="text-gray-700 text-sm font-medium">{name}</div>
        <div className="text-gray-500 text-xs mt-0.5">{description}</div>
      </div>
    </div>
  );
};

export default ProductCard;
