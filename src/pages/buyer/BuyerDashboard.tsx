import React from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  FileText,
  Bell,
  Star,
  TrendingUp,
  Users,
  Package,
  Clock,
  MessageCircle
} from 'lucide-react';


const BuyerDashboard: React.FC = () => {
  // Scroll to top when mount
  React.useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, []);
  const buyerProfile = JSON.parse(localStorage.getItem('buyerProfile') || '{}');

  const stats = [
    { title: 'RFQ đang hoạt động', value: '8', change: '+2 tuần này', icon: FileText, color: 'bg-gradient-to-r from-blue-500 to-blue-400' },
    { title: 'Nhà cung cấp đã lưu', value: '12', change: '+3 mới', icon: Users, color: 'bg-gradient-to-r from-green-500 to-green-400' },
    // { title: 'Tin nhắn', value: '3', change: 'Chưa đọc', icon: MessageCircle, color: 'bg-gradient-to-r from-purple-500 to-purple-400', link: '/buyer/chat' },
    { title: 'Thông báo', value: '3', change: 'Chưa đọc', icon: Bell, color: 'bg-gradient-to-r from-red-500 to-pink-400' }
  ];

  const recentRFQs = [
    { id: 1, title: 'Linh kiện máy móc công nghiệp', seller: 'Tech Manufacturing Co', status: 'responded', date: '2 ngày trước' },
    { id: 2, title: 'Linh kiện điện tử', seller: 'Global Electronics Ltd', status: 'pending', date: '3 ngày trước' },
    { id: 3, title: 'Nguyên liệu sản xuất', seller: 'Material Suppliers Inc', status: 'closed', date: '1 tuần trước' }
  ];

  const recentActivity = [
    { id: 1, action: 'Nhận phản hồi mới cho RFQ', from: 'ABC Manufacturing', time: '2 giờ trước', type: 'response' },
    { id: 2, action: 'Xem hồ sơ nhà cung cấp', from: 'Tech Solutions Co', time: '4 giờ trước', type: 'view' },
    { id: 3, action: 'Đã gửi đánh giá', from: 'Quality Parts Ltd', time: '1 ngày trước', type: 'review' },
    { id: 4, action: 'Tạo RFQ mới', from: 'Hệ thống', time: '2 ngày trước', type: 'rfq' }
  ];

  const suggestedSellers = [
    { id: 1, name: 'Công ty Điện tử Cao cấp', rating: 4.9, speciality: 'Điện tử', verified: true },
    { id: 2, name: 'Công ty Sản xuất Toàn cầu', rating: 4.7, speciality: 'Máy móc', verified: true },
    { id: 3, name: 'Công ty Nguyên liệu Chất lượng', rating: 4.8, speciality: 'Nguyên liệu', verified: false }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'responded': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'response': return <FileText className="w-4 h-4 text-green-500" />;
      case 'view': return <Search className="w-4 h-4 text-blue-500" />;
      case 'review': return <Star className="w-4 h-4 text-yellow-500" />;
      case 'rfq': return <Package className="w-4 h-4 text-purple-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Section */}
      <div className="relative rounded-xl overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 py-10 px-8 text-white shadow-lg">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 drop-shadow-lg">
            Xin chào, {buyerProfile.fullName?.split(' ')[0] || 'Buyer'}!
          </h1>
          <p className="text-lg md:text-xl font-medium opacity-90">
            Cảm ơn bạn đã sử dụng Fsourcing. Dưới đây là tổng quan hoạt động mua hàng của bạn.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none select-none">
          <TrendingUp className="w-40 h-40" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const StatCard = (
            <div key={index} className="rounded-xl shadow-lg p-6 bg-white hover:scale-[1.03] transition-transform border border-gray-100 cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-1">{stat.title}</p>
                  <p className="text-3xl font-extrabold text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-xs text-gray-400">{stat.change}</p>
                </div>
                <div className={`${stat.color} rounded-xl p-3 shadow-lg flex items-center justify-center`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>
          );
          
          return stat.link ? <Link to={stat.link} key={index}>{StatCard}</Link> : StatCard;
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent RFQs */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">RFQ gần đây</h3>
            <Link to="/buyer/rfq" className="text-blue-600 hover:text-blue-700 text-sm font-semibold">
              Xem tất cả →
            </Link>
          </div>
          <div className="space-y-4">
            {recentRFQs.map((rfq) => (
              <div key={rfq.id} className="flex items-center justify-between p-5 border border-gray-200 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-base mb-1">{rfq.title}</h4>
                  <p className="text-sm text-gray-500">Nhà cung cấp: {rfq.seller}</p>
                  <p className="text-xs text-gray-400">{rfq.date}</p>
                </div>
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(rfq.status)}`}>{rfq.status === 'responded' ? 'Đã phản hồi' : rfq.status === 'pending' ? 'Đang chờ' : 'Đã đóng'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Hoạt động gần đây</h3>
          <div className="space-y-5">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4">
                <div className="mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 font-medium">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.from} • {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions and Suggested Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Thao tác nhanh</h3>
          <div className="grid grid-cols-2 gap-6">
            <Link
              to="/buyer/rfq/new"
              className="p-6 border-2 border-dashed border-blue-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 text-center transition-colors shadow-sm"
            >
              <FileText className="w-10 h-10 mx-auto text-blue-500 mb-2" />
              <span className="text-base font-semibold text-gray-700">Tạo RFQ mới</span>
            </Link>
            <Link
              to="/buyer/sellers"
              className="p-6 border-2 border-dashed border-green-300 rounded-xl hover:border-green-500 hover:bg-green-50 text-center transition-colors shadow-sm"
            >
              <Search className="w-10 h-10 mx-auto text-green-500 mb-2" />
              <span className="text-base font-semibold text-gray-700">Tìm nhà cung cấp</span>
            </Link>
            {/* <Link
              to="/buyer/chat"
              className="p-6 border-2 border-dashed border-purple-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 text-center transition-colors shadow-sm"
            >
              <MessageCircle className="w-10 h-10 mx-auto text-purple-500 mb-2" />
              <span className="text-base font-semibold text-gray-700">Tin nhắn</span>
            </Link> */}
            <Link
              to="/buyer/order-detail"
              className="p-6 border-2 border-dashed border-yellow-300 rounded-xl hover:border-yellow-500 hover:bg-yellow-50 text-center transition-colors shadow-sm"
            >
              <FileText className="w-10 h-10 mx-auto text-yellow-500 mb-2" />
              <span className="text-base font-semibold text-gray-700">Xem đơn hàng đã mua</span>
            </Link>
          </div>
        </div>

        {/* Suggested Sellers */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Nhà cung cấp đề xuất</h3>
            <Link to="/buyer/sellers" className="text-blue-600 hover:text-blue-700 text-sm font-semibold">
              Xem tất cả →
            </Link>
          </div>
          <div className="space-y-4">
            {suggestedSellers.map((seller) => (
              <div key={seller.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-gray-50 hover:bg-green-50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center">
                    <h4 className="font-semibold text-gray-900 text-base">{seller.name}</h4>
                    {seller.verified && (
                      <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-bold">
                        Đã xác thực
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{seller.speciality}</p>
                  <div className="flex items-center mt-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-xs text-gray-600 ml-2 font-semibold">{seller.rating}</span>
                  </div>
                </div>
                <Link
                  to={`/buyer/sellers/${seller.id}`}
                  className="text-blue-600 hover:text-blue-700 text-xs font-semibold"
                >
                  Xem →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Market Insights */}
      <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-xl shadow-lg p-8 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Thị trường & Thống kê</h3>
          <TrendingUp className="w-7 h-7 text-green-500" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-blue-100 rounded-xl shadow-sm">
            <p className="text-3xl font-extrabold text-blue-600 mb-1">156</p>
            <p className="text-base text-gray-700">Nhà cung cấp mới trong tháng</p>
          </div>
          <div className="text-center p-6 bg-green-100 rounded-xl shadow-sm">
            <p className="text-3xl font-extrabold text-green-600 mb-1">89%</p>
            <p className="text-base text-gray-700">Tỉ lệ phản hồi RFQ</p>
          </div>
          <div className="text-center p-6 bg-yellow-100 rounded-xl shadow-sm">
            <p className="text-3xl font-extrabold text-yellow-600 mb-1">4.7</p>
            <p className="text-base text-gray-700">Đánh giá trung bình nhà cung cấp</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;