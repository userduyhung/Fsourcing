import React, { useState } from 'react';

const categories = [
  'Tất cả',
  'Bia, nước giải khát',
  'Bánh kẹo, trà, cà phê',
  'Thực phẩm khô, gia vị',
  'Chăm sóc cá nhân',
  'Sữa và Sản phẩm từ sữa',
  // 'Hóa phẩm và giấy' removed per request
];

const ProductCategoryTabs: React.FC<{ onSelect?: (category: string) => void, selected?: string }> = ({ onSelect, selected: selectedProp }) => {
  const [selected, setSelected] = useState(selectedProp ?? categories[0]);

  // Sync when parent-controlled selected prop changes
  React.useEffect(() => {
    if (selectedProp) setSelected(selectedProp);
  }, [selectedProp]);
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
