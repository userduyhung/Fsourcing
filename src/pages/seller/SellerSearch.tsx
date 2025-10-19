import React, { useState } from 'react';
import { Search } from 'lucide-react';

const mockSellers = [
  { id: 1, name: 'Tech Manufacturing Co', industry: 'Electronics', location: 'Vietnam', certification: 'ISO 9001', verified: true },
  { id: 2, name: 'Global Textiles Ltd', industry: 'Textiles', location: 'China', certification: 'OEKO-TEX', verified: false },
  { id: 3, name: 'Auto Parts Inc', industry: 'Automotive', location: 'USA', certification: 'IATF 16949', verified: true },
  { id: 4, name: 'Eco Plastics', industry: 'Plastics', location: 'Germany', certification: 'ISO 14001', verified: false },
  { id: 5, name: 'Smart Electronics', industry: 'Electronics', location: 'Vietnam', certification: 'ISO 9001', verified: true },
];

const industries = ['Electronics', 'Textiles', 'Automotive', 'Plastics'];
const locations = ['Vietnam', 'China', 'USA', 'Germany'];
const certifications = ['ISO 9001', 'OEKO-TEX', 'IATF 16949', 'ISO 14001'];

const SellerSearch: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [certification, setCertification] = useState('');

  const filteredSellers = mockSellers.filter(seller => {
    const matchesKeyword = seller.name.toLowerCase().includes(keyword.toLowerCase());
    const matchesIndustry = !industry || seller.industry === industry;
    const matchesLocation = !location || seller.location === location;
    const matchesCertification = !certification || seller.certification === certification;
    return matchesKeyword && matchesIndustry && matchesLocation && matchesCertification;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-6">Tìm kiếm & lọc Seller</h2>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              placeholder="Từ khoá (tên Seller)"
              className="w-full border rounded px-4 py-2"
            />
          </div>
          <div>
            <select value={industry} onChange={e => setIndustry(e.target.value)} className="border rounded px-3 py-2">
              <option value="">Ngành</option>
              {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
            </select>
          </div>
          <div>
            <select value={location} onChange={e => setLocation(e.target.value)} className="border rounded px-3 py-2">
              <option value="">Quốc gia</option>
              {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>
          </div>
          <div>
            <select value={certification} onChange={e => setCertification(e.target.value)} className="border rounded px-3 py-2">
              <option value="">Chứng chỉ</option>
              {certifications.map(cert => <option key={cert} value={cert}>{cert}</option>)}
            </select>
          </div>
        </div>
        <div>
          {filteredSellers.length === 0 ? (
            <div className="text-gray-500 text-center py-8">Không tìm thấy Seller phù hợp.</div>
          ) : (
            <ul className="divide-y">
              {filteredSellers.map(seller => (
                <li key={seller.id} className="py-4 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-lg">{seller.name}</span>
                    <span className="ml-2 px-2 py-1 text-xs rounded bg-blue-100 text-blue-700">{seller.industry}</span>
                    <span className="ml-2 px-2 py-1 text-xs rounded bg-green-100 text-green-700">{seller.location}</span>
                    <span className="ml-2 px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700">{seller.certification}</span>
                    {seller.verified && <span className="ml-2 px-2 py-1 text-xs rounded bg-teal-100 text-teal-700 font-bold">Verified</span>}
                  </div>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Xem chi tiết</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerSearch;
