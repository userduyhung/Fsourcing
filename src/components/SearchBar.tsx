import React, { useState } from 'react';
import { ChevronDown, Search, Package, Users } from 'lucide-react';

interface SearchBarProps {
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ className = "" }) => {
  const [selectedCategory, setSelectedCategory] = useState('Products');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const categories = [
    { name: 'Products', icon: Package },
    { name: 'Suppliers', icon: Users }
  ];

  const getCurrentCategoryIcon = () => {
    const category = categories.find(cat => cat.name === selectedCategory);
    return category ? category.icon : Package;
  };

  const handleSearch = () => {
    console.log('Searching for:', searchQuery, 'in category:', selectedCategory);
    // Implement search logic here
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex flex-col sm:flex-row bg-white rounded-lg shadow-lg border border-gray-200 max-w-4xl mx-auto">
        {/* Category Dropdown */}
        <div className="relative sm:min-w-[120px] overflow-visible">
          <button
            onClick={() => {
              console.log('Dropdown clicked, current state:', isDropdownOpen);
              setIsDropdownOpen(!isDropdownOpen);
            }}
            className="flex items-center justify-between w-full px-4 py-3 bg-gray-50 border-b sm:border-b-0 sm:border-r border-gray-200 hover:bg-gray-100 transition-colors rounded-tl-lg sm:rounded-bl-lg sm:rounded-tl-lg sm:rounded-tr-none rounded-tr-lg"
          >
            <div className="flex items-center">
              {(() => {
                const CurrentIcon = getCurrentCategoryIcon();
                return <CurrentIcon className="h-4 w-4 mr-2 text-gray-600" />;
              })()}
              <span className="text-gray-700 font-medium">{selectedCategory}</span>
            </div>
            <ChevronDown className="ml-2 h-4 w-4 text-gray-500" />
          </button>
          
          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-b-lg shadow-xl z-50 min-w-[200px]">
              {categories.map((category) => {
                const IconComponent = category.icon;
                const isSuppliers = category.name === 'Suppliers';
                return (
                  <button
                    key={category.name}
                    onClick={() => {
                      setSelectedCategory(category.name);
                      setIsDropdownOpen(false);
                    }}
                    className={`flex items-center w-full px-4 py-3 text-left transition-colors ${
                      isSuppliers 
                        ? 'text-blue-600 bg-blue-50 hover:bg-blue-100 font-medium' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <IconComponent className="h-4 w-4 mr-3" />
                    {category.name}
                    {isSuppliers && (
                      <span className="ml-auto text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                        Popular
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Search Input */}
        <div className="flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="I'm looking for..."
            className="w-full px-4 py-3 text-gray-700 placeholder-gray-400 focus:outline-none"
          />
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 font-medium transition-colors flex items-center justify-center sm:justify-start"
        >
          <Search className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Search</span>
        </button>
      </div>

      {/* Click outside to close dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
};

export default SearchBar;