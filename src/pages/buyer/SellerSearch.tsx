import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  Shield, 
  Grid, 
  List,
  Eye,
  Heart,
  Award
} from 'lucide-react';

interface Seller {
  id: number;
  companyName: string;
  country: string;
  city: string;
  industry: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  certifications: string[];
  description: string;
  logo?: string;
  memberSince: string;
  responseRate: number;
}

const SellerSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCertification, setSelectedCertification] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Mock data
  const sellers: Seller[] = [
    {
      id: 1,
      companyName: 'Global Electronics Manufacturing',
      country: 'China',
      city: 'Shenzhen',
      industry: 'Electronics',
      rating: 4.8,
      reviewCount: 247,
      verified: true,
      certifications: ['ISO 9001', 'CE Certified', 'RoHS Compliant'],
      description: 'Leading manufacturer of electronic components and PCB assemblies with 15+ years of experience.',
      memberSince: '2018-03-15',
      responseRate: 95
    },
    {
      id: 2,
      companyName: 'Premium Industrial Solutions',
      country: 'Germany',
      city: 'Munich',
      industry: 'Machinery',
      rating: 4.9,
      reviewCount: 189,
      verified: true,
      certifications: ['ISO 14001', 'CE Certified'],
      description: 'High-quality industrial machinery and automation solutions for manufacturing sector.',
      memberSince: '2017-08-22',
      responseRate: 98
    },
    {
      id: 3,
      companyName: 'Eco Materials Corp',
      country: 'Vietnam',
      city: 'Ho Chi Minh City',
      industry: 'Raw Materials',
      rating: 4.6,
      reviewCount: 134,
      verified: false,
      certifications: ['ISO 9001'],
      description: 'Sustainable raw materials supplier focusing on eco-friendly production methods.',
      memberSince: '2019-11-10',
      responseRate: 89
    },
    {
      id: 4,
      companyName: 'Tech Innovation Labs',
      country: 'South Korea',
      city: 'Seoul',
      industry: 'Technology',
      rating: 4.7,
      reviewCount: 298,
      verified: true,
      certifications: ['ISO 27001', 'FCC Certified'],
      description: 'Cutting-edge technology solutions and R&D services for global enterprises.',
      memberSince: '2016-05-30',
      responseRate: 92
    },
    {
      id: 5,
      companyName: 'Quality Textiles Ltd',
      country: 'India',
      city: 'Mumbai',
      industry: 'Textiles',
      rating: 4.5,
      reviewCount: 167,
      verified: true,
      certifications: ['OEKO-TEX', 'GOTS Certified'],
      description: 'Premium textile manufacturer with sustainable production practices.',
      memberSince: '2020-01-18',
      responseRate: 87
    }
  ];

  const industries = ['Electronics', 'Machinery', 'Raw Materials', 'Technology', 'Textiles', 'Automotive', 'Food & Beverage'];
  const countries = ['China', 'Germany', 'Vietnam', 'South Korea', 'India', 'United States', 'Japan', 'Thailand'];
  const certifications = ['ISO 9001', 'CE Certified', 'RoHS Compliant', 'ISO 14001', 'ISO 27001', 'FCC Certified', 'OEKO-TEX', 'GOTS Certified'];

  const filteredSellers = sellers.filter(seller => {
    const matchesSearch = seller.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         seller.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         seller.industry.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = !selectedIndustry || seller.industry === selectedIndustry;
    const matchesCountry = !selectedCountry || seller.country === selectedCountry;
    const matchesCertification = !selectedCertification || seller.certifications.includes(selectedCertification);
    
    return matchesSearch && matchesIndustry && matchesCountry && matchesCertification;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedIndustry('');
    setSelectedCountry('');
    setSelectedCertification('');
  };

  const renderSellerCard = (seller: Seller) => (
    <div key={seller.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-lg font-bold text-gray-600">
              {seller.companyName.charAt(0)}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              {seller.companyName}
              {seller.verified && (
                <Shield className="w-4 h-4 text-green-500 ml-2" />
              )}
            </h3>
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="w-4 h-4 mr-1" />
              {seller.city}, {seller.country}
            </div>
          </div>
        </div>
        <button className="text-gray-400 hover:text-red-500 transition-colors">
          <Heart className="w-5 h-5" />
        </button>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{seller.description}</p>

      <div className="mb-4">
        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
          {seller.industry}
        </span>
      </div>

      <div className="flex flex-wrap gap-1 mb-4">
        {seller.certifications.slice(0, 2).map((cert) => (
          <span key={cert} className="inline-flex items-center bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
            <Award className="w-3 h-3 mr-1" />
            {cert}
          </span>
        ))}
        {seller.certifications.length > 2 && (
          <span className="text-xs text-gray-500">+{seller.certifications.length - 2} more</span>
        )}
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <span className="text-sm font-medium text-gray-700 ml-1">
            {seller.rating} ({seller.reviewCount} reviews)
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {seller.responseRate}% response rate
        </span>
      </div>

      <div className="flex space-x-2">
        <Link 
          to={`/buyer/sellers/${seller.id}`}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-center text-sm flex items-center justify-center"
        >
          <Eye className="w-4 h-4 mr-2" />
          View Profile
        </Link>
        <Link 
          to={`/buyer/rfq/new?sellerId=${seller.id}`}
          className="flex-1 border border-blue-600 text-blue-600 py-2 px-4 rounded-md hover:bg-blue-50 transition-colors text-center text-sm"
        >
          Send RFQ
        </Link>
      </div>
    </div>
  );

  const renderSellerList = (seller: Seller) => (
    <div key={seller.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start space-x-4">
        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-xl font-bold text-gray-600">
            {seller.companyName.charAt(0)}
          </span>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                {seller.companyName}
                {seller.verified && (
                  <Shield className="w-5 h-5 text-green-500 ml-2" />
                )}
              </h3>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <MapPin className="w-4 h-4 mr-1" />
                {seller.city}, {seller.country}
                <span className="mx-2">•</span>
                <span>{seller.industry}</span>
              </div>
            </div>
            <button className="text-gray-400 hover:text-red-500 transition-colors">
              <Heart className="w-5 h-5" />
            </button>
          </div>

          <p className="text-gray-600 mt-3 mb-4">{seller.description}</p>

          <div className="flex flex-wrap gap-2 mb-4">
            {seller.certifications.map((cert) => (
              <span key={cert} className="inline-flex items-center bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                <Award className="w-3 h-3 mr-1" />
                {cert}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                <span className="font-medium">{seller.rating}</span>
                <span className="ml-1">({seller.reviewCount} reviews)</span>
              </div>
              <span>{seller.responseRate}% response rate</span>
              <span>Member since {new Date(seller.memberSince).getFullYear()}</span>
            </div>

            <div className="flex space-x-2">
              <Link 
                to={`/buyer/sellers/${seller.id}`}
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm flex items-center"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Profile
              </Link>
              <Link 
                to={`/buyer/rfq/new?sellerId=${seller.id}`}
                className="border border-blue-600 text-blue-600 py-2 px-4 rounded-md hover:bg-blue-50 transition-colors text-sm"
              >
                Send RFQ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Find Suppliers</h1>
        <p className="text-gray-600 mt-2">Discover verified suppliers for your business needs</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search suppliers, products, or industries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {(selectedIndustry || selectedCountry || selectedCertification) && (
              <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                Active
              </span>
            )}
          </button>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">{filteredSellers.length} suppliers found</span>
            <div className="flex border border-gray-300 rounded-md">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Industries</option>
              {industries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>

            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Countries</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>

            <select
              value={selectedCertification}
              onChange={(e) => setSelectedCertification(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Certifications</option>
              {certifications.map(cert => (
                <option key={cert} value={cert}>{cert}</option>
              ))}
            </select>

            <button
              onClick={clearFilters}
              className="border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition-colors text-gray-700"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      <div className={`${
        viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
          : 'space-y-4'
      }`}>
        {filteredSellers.map(seller => 
          viewMode === 'grid' ? renderSellerCard(seller) : renderSellerList(seller)
        )}
      </div>

      {/* No Results */}
      {filteredSellers.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No suppliers found</h3>
          <p className="text-gray-500">Try adjusting your search criteria or filters</p>
        </div>
      )}
    </div>
  );
};

export default SellerSearch;