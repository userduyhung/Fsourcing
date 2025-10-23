import React, { useState } from 'react';

const categories = [
  'Tất cả',
  'Điện tử di động',
  'Phụ kiện & Xe',
  'Làm đẹp & Chăm sóc cá nhân',
  'Điện tử tiêu dùng',
  'Linh kiện điện tử',
  'Phụ kiện thời trang & Giày dép',
];

const ProductCategoryTabs: React.FC<{ onSelect?: (category: string) => void }> = ({ onSelect }) => {
  const [selected, setSelected] = useState(categories[0]);
  return (
    <div className="flex overflow-x-auto bg-white rounded-xl mb-6 scrollbar-hide font-sans" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      {categories.map(cat => (
        <button
          key={cat}
          className={`px-4 py-2 text-sm font-medium rounded-lg mx-1 transition-colors font-sans ${selected === cat ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-50'}`}
          onClick={() => {
            setSelected(cat);
            if (onSelect) onSelect(cat);
          }}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};

export default ProductCategoryTabs;
