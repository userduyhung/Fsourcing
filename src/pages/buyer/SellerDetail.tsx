import React from 'react';
import { BadgeCheck, Mail, Phone, MapPin, Send, MessageCircle, Star, Flag, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import OrderForm from '../../components/OrderForm';

// Mock seller database
const sellersData = [
  {
    id: 1,
    companyName: 'TechManufacturing Co.',
    verified: true,
    logo: 'https://images.pexels.com/photos/3862132/pexels-photo-3862132.jpeg',
    industry: 'Electronics & Components',
    location: 'China',
    certifications: ['ISO 9001', 'CE', 'RoHS'],
    email: 'contact@techmanufacturing.com',
    phone: '+86-123-456-789',
    products: [
      { id: 1, name: 'LED Components', image: '', description: 'High-quality LED components for various applications.' },
      { id: 2, name: 'Electronic Controllers', image: '', description: 'Smart controllers for electronic devices.' }
    ],
    reviews: [
      { id: 1, user: 'John Buyer', rating: 5, comment: 'Excellent quality and fast delivery!' },
      { id: 2, user: 'Anna Buyer', rating: 4, comment: 'Good communication and products.' }
    ]
  },
  {
    id: 2,
    companyName: 'Global Textiles Ltd.',
    verified: true,
    logo: 'https://images.pexels.com/photos/7876665/pexels-photo-7876665.jpeg',
    industry: 'Clothing & Accessories',
    location: 'India',
    certifications: ['ISO 9001', 'GOTS'],
    email: 'info@globaltextiles.com',
    phone: '+91-234-567-890',
    products: [
      { id: 1, name: 'Cotton Fabrics', image: '', description: 'Premium quality cotton fabrics for clothing.' },
      { id: 2, name: 'Designer Garments', image: '', description: 'Fashion-forward garments for global market.' }
    ],
    reviews: [
      { id: 1, user: 'Sarah M.', rating: 5, comment: 'Amazing fabric quality!' }
    ]
  },
  {
    id: 3,
    companyName: 'Industrial Solutions Inc.',
    verified: true,
    logo: 'https://images.pexels.com/photos/3862373/pexels-photo-3862373.jpeg',
    industry: 'Machinery & Equipment',
    location: 'Germany',
    certifications: ['ISO 9001', 'CE', 'TÜV'],
    email: 'sales@industrialsolutions.de',
    phone: '+49-345-678-901',
    products: [
      { id: 1, name: 'CNC Machines', image: '', description: 'Precision CNC machines for manufacturing.' },
      { id: 2, name: 'Industrial Robots', image: '', description: 'Advanced automation solutions.' }
    ],
    reviews: []
  },
  {
    id: 4,
    companyName: 'Green Energy Systems',
    verified: true,
    logo: 'https://images.pexels.com/photos/2800832/pexels-photo-2800832.jpeg',
    industry: 'Renewable Energy',
    location: 'USA',
    certifications: ['ISO 14001', 'UL', 'ENERGY STAR'],
    email: 'contact@greenenergy.com',
    phone: '+1-456-789-012',
    products: [
      { id: 1, name: 'Solar Panels', image: '', description: 'High-efficiency solar panel systems.' },
      { id: 2, name: 'Wind Turbines', image: '', description: 'Renewable wind energy solutions.' }
    ],
    reviews: []
  },
  {
    id: 5,
    companyName: 'Precision Parts Co.',
    verified: true,
    logo: 'https://www.shutterstock.com/image-illustration/car-parts-auto-spare-isolated-600nw-2283939101.jpg',
    industry: 'Auto Parts & Accessories',
    location: 'Japan',
    certifications: ['ISO/TS 16949', 'ISO 9001'],
    email: 'info@precisionparts.jp',
    phone: '+81-567-890-123',
    products: [
      { id: 1, name: 'Engine Components', image: '', description: 'Precision-engineered auto parts.' },
      { id: 2, name: 'Brake Systems', image: '', description: 'High-performance brake components.' }
    ],
    reviews: []
  },
  {
    id: 6,
    companyName: 'Beauty & Care International',
    verified: true,
    logo: 'https://images.pexels.com/photos/3018841/pexels-photo-3018841.jpeg',
    industry: 'Cosmetics & Personal Care',
    location: 'South Korea',
    certifications: ['GMP', 'ISO 22716', 'FDA'],
    email: 'sales@beautycare.kr',
    phone: '+82-678-901-234',
    products: [
      { id: 1, name: 'Skincare Products', image: '', description: 'K-beauty skincare line with natural ingredients.' },
      { id: 2, name: 'Makeup Collection', image: '', description: 'Premium cosmetics for all skin types.' }
    ],
    reviews: []
  }
];

const SellerDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [showRFQ, setShowRFQ] = React.useState(false);
  const [showReviewModal, setShowReviewModal] = React.useState(false);
  const [showReportModal, setShowReportModal] = React.useState(false);

  // Review state
  const [rating, setRating] = React.useState(0);
  const [reviewComment, setReviewComment] = React.useState('');
  const [reviewSuccess, setReviewSuccess] = React.useState(false);

  // Report state
  const [reportReason, setReportReason] = React.useState('');
  const [reportDetail, setReportDetail] = React.useState('');
  const [reportSuccess, setReportSuccess] = React.useState(false);

  // Get seller by ID
  const seller = sellersData.find(s => s.id === Number(id));

  // If seller not found, show error
  if (!seller) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Nhà cung cấp không tồn tại</h2>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Quay lại trang chủ
        </button>
      </div>
    );
  }

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

  // Handle review submission
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || !reviewComment.trim()) return;

    const buyer = localStorage.getItem('userName') || 'Người mua';
    const reviews = JSON.parse(localStorage.getItem(`sellerReviews_${seller.id}`) || '[]');
    const newReview = { id: Date.now(), user: buyer, rating, comment: reviewComment };
    localStorage.setItem(`sellerReviews_${seller.id}`, JSON.stringify([newReview, ...reviews]));

    setReviewSuccess(true);
    setTimeout(() => {
      setReviewSuccess(false);
      setShowReviewModal(false);
      setRating(0);
      setReviewComment('');
    }, 1500);
  };

  // Handle report submission
  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason.trim() || !reportDetail.trim()) return;

    const buyer = localStorage.getItem('userName') || 'Người mua';
    const reports = JSON.parse(localStorage.getItem(`sellerReports_${seller.id}`) || '[]');
    const newReport = { id: Date.now(), user: buyer, reason: reportReason, detail: reportDetail };
    localStorage.setItem(`sellerReports_${seller.id}`, JSON.stringify([newReport, ...reports]));

    setReportSuccess(true);
    setTimeout(() => {
      setReportSuccess(false);
      setShowReportModal(false);
      setReportReason('');
      setReportDetail('');
    }, 1500);
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

      {/* Action Buttons */}
      <div className="mb-8 flex flex-wrap gap-4">
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center hover:bg-blue-700"
          onClick={() => setShowRFQ(true)}
        >
          <Send className="w-4 h-4 mr-2" />
          Tạo RFQ cho Seller này
        </button>
        {/* <button
          className="bg-purple-600 text-white px-6 py-2 rounded-lg flex items-center hover:bg-purple-700"
          onClick={() => navigate('/buyer/chat')}
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Chat với Seller
        </button> */}
        <button
          className="bg-green-600 text-white px-6 py-2 rounded-lg flex items-center hover:bg-green-700"
          onClick={() => setShowReviewModal(true)}
        >
          <Star className="w-4 h-4 mr-2" />
          Đánh giá Seller
        </button>
        <button
          className="bg-red-600 text-white px-6 py-2 rounded-lg flex items-center hover:bg-red-700"
          onClick={() => setShowReportModal(true)}
        >
          <Flag className="w-4 h-4 mr-2" />
          Báo cáo Seller
        </button>
      </div>

      {/* RFQ Modal */}
      <OrderForm
        isOpen={showRFQ}
        onClose={() => setShowRFQ(false)}
        sellerName={seller.companyName}
        onSubmit={handleSendRFQ}
      />

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Đánh giá Seller</h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đánh giá sao
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none transition-colors"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nhận xét
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={4}
                  placeholder="Chia sẻ trải nghiệm của bạn với seller này..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  required
                />
              </div>
              {reviewSuccess && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                  Đã gửi đánh giá thành công!
                </div>
              )}
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700"
                >
                  Gửi đánh giá
                </button>
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-400"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Báo cáo Seller</h3>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lý do báo cáo
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="VD: Sản phẩm giả, lừa đảo..."
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chi tiết
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={4}
                  placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
                  value={reportDetail}
                  onChange={(e) => setReportDetail(e.target.value)}
                  required
                />
              </div>
              {reportSuccess && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                  Đã gửi báo cáo thành công!
                </div>
              )}
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 flex items-center justify-center"
                >
                  <Flag className="w-4 h-4 mr-2" />
                  Gửi báo cáo
                </button>
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-400"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDetail;
