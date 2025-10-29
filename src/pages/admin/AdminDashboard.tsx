import React from 'react';
import { Users, UserCheck, ShoppingBag, DollarSign, AlertCircle, TrendingUp } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  // Mock data
  const stats = [
    {
      title: 'Tổng số người dùng',
      value: '2,847',
      change: '+12%',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Nhà bán chờ duyệt',
      value: '23',
      change: '+5',
      icon: UserCheck,
      color: 'bg-orange-500'
    },
    {
      title: 'Sản phẩm đang hoạt động',
      value: '1,256',
      change: '+8%',
      icon: ShoppingBag,
      color: 'bg-green-500'
    },
    {
      title: 'Doanh thu',
      value: '1,100,000,000 VNĐ',
      change: '+23%',
      icon: DollarSign,
      color: 'bg-purple-500'
    }
  ];

  const recentActivities = [
    { id: 1, action: 'Nhà bán mới đăng ký', user: 'ABC Manufacturing', time: '2 phút trước', type: 'seller' },
    { id: 2, action: 'Báo cáo sản phẩm mới', user: 'Nguyễn Văn A', time: '15 phút trước', type: 'report' },
    { id: 3, action: 'Gói dịch vụ cao cấp đã mua', user: 'XYZ Corp', time: '1 giờ trước', type: 'payment' },
    { id: 4, action: 'Tài khoản bị khóa', user: 'Hệ thống Admin', time: '2 giờ trước', type: 'admin' },
    { id: 5, action: 'Sản phẩm mới được đăng', user: 'Tech Solutions', time: '3 giờ trước', type: 'product' }
  ];

  const pendingReviews = [
    { id: 1, type: 'Xác thực nhà bán', company: 'Green Energy Ltd', submitted: '2 ngày trước' },
    { id: 2, type: 'Báo cáo sản phẩm', product: 'Máy bơm XL-200', submitted: '1 ngày trước' },
    { id: 3, type: 'Duyệt nội dung', content: 'Cập nhật hồ sơ công ty', submitted: '5 giờ trước' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tổng quan quản trị</h1>
        <p className="text-gray-600 mt-2">Theo dõi hoạt động hệ thống và quản lý các chỉ số chính</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className="text-sm text-green-600 mt-1">{stat.change} so với tháng trước</p>
                </div>
                <div className={`${stat.color} rounded-lg p-3`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hoạt động gần đây</h3>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'seller' ? 'bg-blue-500' :
                  activity.type === 'report' ? 'bg-red-500' :
                  activity.type === 'payment' ? 'bg-green-500' :
                  activity.type === 'admin' ? 'bg-orange-500' : 'bg-purple-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.user} • {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Reviews */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Danh sách chờ duyệt</h3>
            <AlertCircle className="w-5 h-5 text-orange-500" />
          </div>
          <div className="space-y-4">
            {pendingReviews.map((review) => (
              <div key={review.id} className="border-l-4 border-orange-500 pl-4">
                <p className="text-sm font-medium text-gray-900">{review.type}</p>
                <p className="text-xs text-gray-600">{review.company || review.product || review.content}</p>
                <p className="text-xs text-gray-500 mt-1">Gửi lên {review.submitted}</p>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 text-sm text-red-600 hover:text-red-700 font-medium">
            Xem tất cả mục chờ duyệt →
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
            <Users className="w-6 h-6 mx-auto mb-2 text-blue-500" />
            <span className="text-sm font-medium text-gray-700">Quản lý người dùng</span>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
            <UserCheck className="w-6 h-6 mx-auto mb-2 text-orange-500" />
            <span className="text-sm font-medium text-gray-700">Duyệt nhà bán</span>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
            <ShoppingBag className="w-6 h-6 mx-auto mb-2 text-green-500" />
            <span className="text-sm font-medium text-gray-700">Duyệt sản phẩm</span>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-purple-500" />
            <span className="text-sm font-medium text-gray-700">Xem thống kê</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;