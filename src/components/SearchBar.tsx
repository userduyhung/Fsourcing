import React, { useState, useEffect } from 'react';
import { ChevronDown, Search, Package, Users, Filter, MapPin, Award, Clock } from 'lucide-react';

interface SearchBarProps {
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ className = "" }) => {
  const [selectedCategory, setSelectedCategory] = useState('Products');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    industry: '',
    location: '',
    certification: ''
  });

  const categories = [
    { name: 'Products', icon: Package },
    { name: 'Suppliers', icon: Users }
  ];

  // Sample data for suggestions
  const allSuggestions = [
    'Electronics', 'LED Lights', 'Mobile Accessories', 'Textiles', 'Cotton Fabric',
    'Machinery', 'CNC Machine', 'Automotive Parts', 'Car Battery', 'Solar Panel',
    'Medical Equipment', 'Furniture', 'Kitchen Appliances', 'Toys', 'Sports Equipment'
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
    if (!searchQuery.trim()) return;
    
    console.log('Searching for:', searchQuery, 'in category:', selectedCategory, 'with filters:', filters);
    saveToHistory(searchQuery);
    setShowSuggestions(false);
    
    // Simulate API call - replace with real search logic
    alert(`Searching for "${searchQuery}" in ${selectedCategory}\nLocation: ${filters.location || 'All'}\nIndustry: ${filters.industry || 'All'}\nCertification: ${filters.certification || 'All'}`);
  };

  const handleInputChange = (value: string) => {
    setSearchQuery(value);
    updateSuggestions(value);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (selectedCategory === 'Products') {
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
    if (!searchQuery.trim()) return;
    // Save to history
    saveToHistory(searchQuery);
    setShowSuggestions(false);
    // Navigate to /products with search query
    window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
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
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyPress={selectedCategory === 'Products' ? (e => { if (e.key === 'Enter') handleProductSearch(); }) : handleKeyPress}
            onFocus={() => updateSuggestions(searchQuery)}
            placeholder="I'm looking for..."
            className="w-full px-4 py-3 text-gray-700 placeholder-gray-400 focus:outline-none"
          />

          {/* Auto-complete Suggestions */}
          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-lg shadow-lg z-50">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => selectSuggestion(suggestion)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center"
                >
                  <Search className="h-4 w-4 mr-2 text-gray-400" />
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filter Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="border-l border-gray-200 px-4 py-3 hover:bg-gray-50 transition-colors flex items-center"
        >
          <Filter className="h-4 w-4 text-gray-600" />
        </button>

        {/* Search Button */}
        <button
          onClick={selectedCategory === 'Products' ? handleProductSearch : handleSearch}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 font-medium transition-colors flex items-center justify-center sm:justify-start"
        >
          <Search className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Search</span>
        </button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="mt-3 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="h-4 w-4 inline mr-1" />
                Location
              </label>
              <select
                value={filters.location}
                onChange={(e) => setFilters({...filters, location: e.target.value})}
                className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value="">All Locations</option>
                <option value="china">China</option>
                <option value="india">India</option>
                <option value="vietnam">Vietnam</option>
                <option value="usa">USA</option>
                <option value="germany">Germany</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Package className="h-4 w-4 inline mr-1" />
                Industry
              </label>
              <select
                value={filters.industry}
                onChange={(e) => setFilters({...filters, industry: e.target.value})}
                className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value="">All Industries</option>
                <option value="electronics">Electronics</option>
                <option value="textiles">Textiles</option>
                <option value="machinery">Machinery</option>
                <option value="automotive">Automotive</option>
                <option value="chemicals">Chemicals</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Award className="h-4 w-4 inline mr-1" />
                Certification
              </label>
              <select
                value={filters.certification}
                onChange={(e) => setFilters({...filters, certification: e.target.value})}
                className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value="">All Certifications</option>
                <option value="iso9001">ISO 9001</option>
                <option value="iso14001">ISO 14001</option>
                <option value="ce">CE Certified</option>
                <option value="fda">FDA Approved</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Keyword Suggestions & Search History */}
      {searchQuery === '' && (
        <div className="mt-3 bg-white rounded-lg shadow-sm border border-gray-200 p-4 max-w-4xl mx-auto">
          {/* Search History */}
          {searchHistory.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Recent Searches:
              </h3>
              <div className="flex flex-wrap gap-2">
                {searchHistory.slice(0, 5).map((item, index) => (
                  <button
                    key={index}
                    onClick={() => setSearchQuery(item)}
                    className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-sm hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center"
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Popular Searches */}
          <h3 className="text-sm font-medium text-gray-700 mb-2">Popular Searches:</h3>
          <div className="flex flex-wrap gap-2">
            {['Electronics', 'Textiles', 'Machinery', 'Automotive Parts', 'LED Lights', 'Mobile Accessories'].map((keyword) => (
              <button
                key={keyword}
                onClick={() => setSearchQuery(keyword)}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-blue-100 hover:text-blue-600 transition-colors"
              >
                {keyword}
              </button>
            ))}
          </div>
        </div>
      )}

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