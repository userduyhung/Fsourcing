import React, { useState } from 'react';

const categories = [
  'All',
  'Mobile Electronics',
  'Auto Vehicle & Accessories',
  'Beauty & Personal Care',
  'Consumer Electronics',
  'Electronic Components',
  'Fashion Accessories and Footwear',
];

const ProductCategoryTabs: React.FC<{ onSelect?: (category: string) => void }> = ({ onSelect }) => {
  const [selected, setSelected] = useState(categories[0]);

  return (
    <div className="flex overflow-x-auto bg-white rounded-xl mb-6 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => {
            setSelected(cat);
            onSelect && onSelect(cat);
          }}
          className={`px-6 py-3 whitespace-nowrap font-medium text-base focus:outline-none transition-all ${
            selected === cat
              ? 'bg-red-500 text-white rounded-xl shadow-sm relative'
              : 'bg-transparent text-gray-800'
          }`}
          style={{ position: 'relative' }}
        >
          {cat}
          {selected === cat && (
            <span className="absolute left-1/2 -bottom-2 transform -translate-x-1/2 w-4 h-2 bg-red-500 rounded-b-xl" />
          )}
        </button>
      ))}
    </div>
  );
};

export default ProductCategoryTabs;
