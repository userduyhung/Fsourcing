import React from 'react';
import { BadgeCheck, Mail, Phone, MapPin, Star, FileText, Send, Flag } from 'lucide-react';
import { useParams } from 'react-router-dom';
import RFQForm from '../../components/RFQForm';
import SellerReview from '../../components/SellerReview';
import SellerReport from '../../components/SellerReport';

// Mock seller data
const sellerDemo = {
  id: 1,
  companyName: 'Tech Manufacturing Co',
  verified: true,
  logo: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg',
  industry: 'Industrial Machinery',
  location: 'Vietnam',
  certifications: ['ISO 9001', 'CE', 'RoHS'],
  email: 'contact@techmanufacturing.com',
  phone: '+84-123-456-789',
  products: [
    { id: 1, name: 'Industrial Machinery Parts', image: '', description: 'High quality machinery parts for factories.' },
    { id: 2, name: 'Automation Controller', image: '', description: 'Smart controller for industrial automation.' }
  ],
  reviews: [
    { id: 1, user: 'John Buyer', rating: 5, comment: 'Great supplier, fast response!' },
    { id: 2, user: 'Anna Buyer', rating: 4, comment: 'Good quality products.' }
  ]
};

const SellerDetail: React.FC = () => {
  // Scroll to top when mount
  React.useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, []);
  const { id } = useParams();
  const seller = sellerDemo; // Replace with fetch by id in real app
  const [showRFQ, setShowRFQ] = React.useState(false);

  const handleSendRFQ = (rfq: { subject: string; message: string }) => {
    const buyerName = localStorage.getItem('userName') || 'Buyer';
    const rfqList = JSON.parse(localStorage.getItem('buyerRFQs') || '[]');
    const newRFQ = {
      id: Date.now(),
      sellerId: seller.id,
      sellerName: seller.companyName,
      buyer: buyerName,
      subject: rfq.subject,
      message: rfq.message,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    localStorage.setItem('buyerRFQs', JSON.stringify([newRFQ, ...rfqList]));
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      {/* Seller Profile */}
      <div className="flex items-center mb-8">
        <img src={seller.logo} alt="Logo" className="w-20 h-20 rounded-lg object-cover mr-6" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            {seller.companyName}
            {seller.verified && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                <BadgeCheck className="w-4 h-4 mr-1 text-blue-500" /> Verified
              </span>
            )}
          </h2>
          <div className="flex space-x-4 mt-2 text-gray-600">
            <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" />{seller.location}</span>
            <span className="flex items-center"><Mail className="w-4 h-4 mr-1" />{seller.email}</span>
            <span className="flex items-center"><Phone className="w-4 h-4 mr-1" />{seller.phone}</span>
          </div>
          <div className="mt-2 text-sm text-gray-500">Industry: {seller.industry}</div>
        </div>
      </div>

      {/* Certifications */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-800 mb-2">Certifications</h3>
        <div className="flex flex-wrap gap-2">
          {seller.certifications.map(cert => (
            <span key={cert} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium border border-green-200">{cert}</span>
          ))}
        </div>
      </div>

      {/* Products */}
      <div className="mb-8">
        <h3 className="font-semibold text-gray-800 mb-2">Products</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {seller.products.map(product => (
            <div key={product.id} className="border rounded-lg p-4 bg-white shadow-sm">
              <div className="font-bold text-gray-900 mb-1">{product.name}</div>
              <div className="text-gray-600 text-sm mb-2">{product.description}</div>
              {/* Product image can be added here */}
            </div>
          ))}
        </div>
      </div>

      {/* RFQ Button */}
      <div className="mb-8">
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center hover:bg-blue-700" onClick={() => setShowRFQ(true)}>
          <Send className="w-4 h-4 mr-2" />
          Tạo RFQ cho Seller này
        </button>
        <RFQForm
          isOpen={showRFQ}
          onClose={() => setShowRFQ(false)}
          sellerName={seller.companyName}
          onSubmit={handleSendRFQ}
        />
      </div>

      {/* Reviews */}
      <SellerReview sellerId={seller.id} />

      {/* Report Seller */}
      <SellerReport sellerId={seller.id} />
    </div>
  );
};

export default SellerDetail;
