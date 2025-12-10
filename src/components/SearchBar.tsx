import React, { useState, useEffect } from 'react';
import { ChevronDown, Package } from 'lucide-react';

interface SearchBarProps {
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ className = "" }) => {
  const [selectedCategory, setSelectedCategory] = useState('Sản phẩm');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    industry: ''
  });

  const categories = [
    { name: 'Sản phẩm', icon: Package }
    // 'Nhà cung cấp' option removed temporarily
  ];

  // Sample data for suggestions
  const allSuggestions = [
    'Điện tử', 'Đèn LED', 'Phụ kiện điện thoại', 'Dệt may', 'Vải cotton',
    'Máy móc', 'Máy CNC', 'Phụ tùng ô tô', 'Ắc quy xe hơi', 'Tấm pin năng lượng mặt trời',
    'Thiết bị y tế', 'Nội thất', 'Đồ gia dụng', 'Đồ chơi', 'Thiết bị thể thao'
  ];

  // Load search history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('searchHistory');
    if (saved) {
      setSearchHistory(JSON.parse(saved));
    }
  }, []);

  // Save search history to localStorage
  const saveToHistory = (query: string) => {
    if (!query.trim()) return;
    const newHistory = [query, ...searchHistory.filter(item => item !== query)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  // Auto-complete logic
  const updateSuggestions = (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const filtered = allSuggestions.filter(item =>
      item.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);

    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  };

  const getCurrentCategoryIcon = () => {
    const category = categories.find(cat => cat.name === selectedCategory);
    return category ? category.icon : Package;
  };

  const handleSearch = () => {
    // Save to history only if there's a query
    if (searchQuery.trim()) {
      saveToHistory(searchQuery);
    }
    setShowSuggestions(false);

    // Simulate API call - replace with real search logic
    const query = searchQuery.trim() || 'Tất cả';
    alert(`Tìm kiếm "${query}" trong ${selectedCategory}\nNgành: ${filters.industry || 'Tất cả'}`);
  };

  const handleInputChange = (value: string) => {
    setSearchQuery(value);
    updateSuggestions(value);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (selectedCategory === 'Sản phẩm') {
        handleProductSearch();
      } else {
        handleSearch();
      }
    }
  };

  const selectSuggestion = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
  };

  // --- Product Search Integration ---
  const handleProductSearch = () => {
    console.log('🔍 Search triggered:', { searchQuery, industry: filters.industry });

    // Save to history only if there's a query
    if (searchQuery.trim()) {
      saveToHistory(searchQuery);
    }
    setShowSuggestions(false);

    // Navigate to /products with search query and optional industry filter
    const query = searchQuery.trim();
    const industry = filters.industry;
    const params = new URLSearchParams();
    if (query) params.set('search', query);
    if (industry) params.set('industry', industry);
    const url = `/products${params.toString() ? '?' + params.toString() : ''}`;

    console.log('📍 Navigating to:', url);
    window.location.href = url;
  };

  return (
    <div className={`relative ${className} font-sans`}>
      <div className="flex flex-col sm:flex-row bg-white rounded-lg shadow-lg border border-gray-200 max-w-4xl mx-auto">
        <div className="relative sm:min-w-[120px] overflow-visible">
          <button
            type="button"
            className="flex items-center justify-between w-full px-4 py-3 bg-gray-50 border-b sm:border-b-0 sm:border-r border-gray-200 hover:bg-gray-100 transition-colors rounded-tl-lg sm:rounded-bl-lg sm:rounded-tl-lg sm:rounded-tr-none rounded-tr-lg font-sans"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="flex items-center">
              {(() => {
                const CurrentIcon = getCurrentCategoryIcon();
                return <CurrentIcon className="h-4 w-4 mr-2 text-gray-600" />;
              })()}
              <span className="text-gray-700 font-medium font-sans">{selectedCategory}</span>
            </div>
            <ChevronDown className="ml-2 h-4 w-4 text-gray-500" />
          </button>
          {isDropdownOpen && (
            <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-b-lg shadow-xl z-50 min-w-[200px] font-sans">
              {categories.map(cat => (
                <button
                  key={cat.name}
                  className={`flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-sans ${selectedCategory === cat.name ? 'bg-blue-50' : ''}`}
                  onClick={() => {
                    setSelectedCategory(cat.name);
                    setIsDropdownOpen(false);
                  }}
                >
                  <cat.icon className="h-4 w-4 mr-2 text-gray-600" />
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex-1 flex items-center relative">
          <input
            type="text"
            className="w-full px-4 py-3 rounded-none rounded-br-lg rounded-bl-lg sm:rounded-bl-none sm:rounded-br-lg border-0 focus:ring-0 font-sans"
            placeholder={selectedCategory === 'Sản phẩm' ? 'Tìm kiếm sản phẩm...' : 'Tìm kiếm nhà cung cấp...'}
            value={searchQuery}
            onChange={e => handleInputChange(e.target.value)}
            onKeyDown={handleKeyPress}
            onFocus={() => updateSuggestions(searchQuery)}
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full bg-white border border-gray-200 rounded-b-lg shadow-xl z-50 font-sans">
              {suggestions.map(s => (
                <button
                  key={s}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-sans"
                  onClick={() => selectSuggestion(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          className="bg-blue-600 text-white px-6 py-3 rounded-br-lg rounded-bl-lg sm:rounded-bl-none sm:rounded-br-lg font-semibold hover:bg-blue-700 transition-colors font-sans"
          onClick={selectedCategory === 'Sản phẩm' ? handleProductSearch : handleSearch}
        >
          Tìm kiếm
        </button>
      </div>

      {/* Always-visible Filters */}
      <div className="mt-3 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Package className="h-4 w-4 inline mr-1" />
              Ngành
            </label>
            <select
              value={filters.industry}
              onChange={e => setFilters({ ...filters, industry: e.target.value })}
              className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option value="">Tất cả ngành</option>
              <option value="Bia, nước giải khát">Bia, nước giải khát</option>
              <option value="Bánh kẹo, trà, cà phê">Bánh kẹo, trà, cà phê</option>
              <option value="Thực phẩm khô, gia vị">Thực phẩm khô, gia vị</option>
              <option value="Chăm sóc cá nhân">Chăm sóc cá nhân</option>
              <option value="Sữa và Sản phẩm từ sữa">Sữa và Sản phẩm từ sữa</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchBar;
