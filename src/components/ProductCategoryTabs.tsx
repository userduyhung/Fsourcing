import React, { useState } from 'react';

const categories = [
  { name: 'Tất cả', icon: '🏪', color: 'from-purple-500 to-pink-500' },
  { name: 'Bia, nước giải khát', icon: '🍺', color: 'from-amber-500 to-orange-500' },
  { name: 'Bánh kẹo, trà, cà phê', icon: '🍪', color: 'from-yellow-500 to-amber-500' },
  { name: 'Thực phẩm khô, gia vị', icon: '🍜', color: 'from-red-500 to-orange-500' },
  { name: 'Chăm sóc cá nhân', icon: '🧴', color: 'from-blue-500 to-cyan-500' },
  { name: 'Sữa và Sản phẩm từ sữa', icon: '🥛', color: 'from-sky-500 to-indigo-500' },
];

const ProductCategoryTabs: React.FC<{ onSelect?: (category: string) => void, selected?: string }> = ({ onSelect, selected: selectedProp }) => {
  const [selected, setSelected] = useState(selectedProp ?? categories[0].name);

  // Sync when parent-controlled selected prop changes
  React.useEffect(() => {
    if (selectedProp) setSelected(selectedProp);
  }, [selectedProp]);

  return (
    <div className="relative">
      {/* All Devices - Horizontal Scroll */}
      <div className="relative">
        <div className="flex overflow-x-auto gap-3 pb-3 scrollbar-hide snap-x snap-mandatory" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <style>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          {categories.map(cat => (
            <button
              key={cat.name}
              className={`snap-start flex-shrink-0 px-6 py-3.5 rounded-2xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 ${
                selected === cat.name
                  ? `bg-gradient-to-r ${cat.color} text-white shadow-lg`
                  : 'bg-white text-gray-700 border-2 border-gray-100 hover:shadow-md'
              }`}
              onClick={() => {
                setSelected(cat.name);
                if (onSelect) onSelect(cat.name);
              }}
            >
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="text-xl">{cat.icon}</span>
                <span>{cat.name}</span>
              </div>
              {selected === cat.name && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full animate-bounce"></div>
              )}
            </button>
          ))}
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute right-0 top-0 bottom-3 w-16 bg-gradient-to-l from-gray-50 via-gray-50/80 to-transparent pointer-events-none"></div>
      </div>
    </div>
  );
};

export default ProductCategoryTabs;
