import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Package,
  Bell,
  Star,
  TrendingUp,
  User,
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  status: 'pending' | 'completed' | 'cancelled';
  date: string;
}

const BuyerDashboard: React.FC = () => {
  // Scroll to top when mount
  React.useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, []);
  const buyerProfile = JSON.parse(localStorage.getItem('buyerProfile') || '{}');
  
  // Get cart and orders from localStorage
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const [orders] = useState<OrderItem[]>(() => {
    const savedOrders = localStorage.getItem('buyerOrders');
    return savedOrders ? JSON.parse(savedOrders) : [];
  });
  
  const [notifications] = useState(() => {
    const saved = localStorage.getItem('buyerNotifications');
    return saved ? JSON.parse(saved) : [];
  });

  const cartItemCount = cart.reduce((sum: number, item: any) => sum + item.quantity, 0);
  const unreadNotifications = notifications.filter((n: any) => !n.read).length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const completedOrders = orders.filter(o => o.status === 'completed').length;

  const stats = [
    { title: 'Sản phẩm trong giỏ', value: cartItemCount.toString(), change: 'Chưa thanh toán', icon: ShoppingCart, color: 'bg-gradient-to-r from-blue-500 to-blue-400', link: '/cart' },
    { title: 'Đơn hàng đang xử lý', value: pendingOrders.toString(), change: 'Đang giao', icon: Package, color: 'bg-gradient-to-r from-orange-500 to-orange-400', link: '/buyer/order-detail' },
    { title: 'Đơn hàng hoàn thành', value: completedOrders.toString(), change: 'Đã giao', icon: CheckCircle, color: 'bg-gradient-to-r from-green-500 to-green-400', link: '/buyer/order-detail' },
    { title: 'Thông báo', value: unreadNotifications.toString(), change: 'Chưa đọc', icon: Bell, color: 'bg-gradient-to-r from-red-500 to-pink-400' }
  ];

  const recentOrders = orders.slice(0, 3);

  const recentActivity = [
    { id: 1, action: 'Đặt hàng thành công', from: 'Đơn hàng mới', time: '2 giờ trước', type: 'order' },
    { id: 2, action: 'Xem sản phẩm', from: 'Bia Tiger', time: '4 giờ trước', type: 'view' },
    { id: 3, action: 'Cập nhật thông tin', from: 'Hồ sơ cá nhân', time: '1 ngày trước', type: 'profile' },
    { id: 4, action: 'Thêm vào giỏ hàng', from: 'Bánh Choco-Pie', time: '2 ngày trước', type: 'cart' }
  ];

  const popularProducts = [
    { id: 1, name: 'Bia Tiger', category: 'Bia, nước giải khát', image: 'https://bizweb.dktcdn.net/100/446/647/products/bia-tiger-sleek-5-abv-lon-330ml-281124-112850-1732768166826.jpg?v=1732768294907', price: 12000 },
    { id: 2, name: 'Bánh Choco-Pie', category: 'Bánh kẹo', image: 'https://static.vinshop.vn/cdn-cgi/image/cdnCode=PRIMARY,fit=scale-down,w=820,h=820,quality=80,f=auto/media/sys_b2bpcm/images/h2e/h00/1523/a6fc501f-bd61-42d1-9e63-464dae5e0d54.png', price: 60000 },
    { id: 3, name: 'Cà phê G7 3in1', category: 'Trà, cà phê', image: 'https://res.cloudinary.com/dcworyvtj/image/upload/v1764063288/c%C3%A0_ph%C3%AA_g7_t3k7j6.avif', price: 120000 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Hoàn thành';
      case 'pending': return 'Đang xử lý';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order': return <Package className="w-4 h-4 text-green-500" />;
      case 'view': return <Eye className="w-4 h-4 text-blue-500" />;
      case 'profile': return <User className="w-4 h-4 text-purple-500" />;
      case 'cart': return <ShoppingCart className="w-4 h-4 text-orange-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
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
            Chào mừng bạn đến với Fsourcing. Dưới đây là tổng quan hoạt động mua sắm của bạn.
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
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Đơn hàng gần đây</h3>
            <Link to="/buyer/order-detail" className="text-blue-600 hover:text-blue-700 text-sm font-semibold">
              Xem tất cả →
            </Link>
          </div>
          <div className="space-y-4">
            {recentOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Chưa có đơn hàng nào</p>
                <Link to="/products" className="text-blue-600 hover:text-blue-700 text-sm font-semibold mt-2 inline-block">
                  Mua sắm ngay →
                </Link>
              </div>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-5 border border-gray-200 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-base mb-1">{order.name}</h4>
                    <p className="text-sm text-gray-500">Số lượng: {order.quantity} | {formatCurrency(order.price * order.quantity)}</p>
                    <p className="text-xs text-gray-400">{order.date}</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>
              ))
            )}
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

      {/* Quick Actions and Popular Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Thao tác nhanh</h3>
          <div className="grid grid-cols-2 gap-6">
            <Link
              to="/products"
              className="p-6 border-2 border-dashed border-blue-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 text-center transition-colors shadow-sm"
            >
              <ShoppingBag className="w-10 h-10 mx-auto text-blue-500 mb-2" />
              <span className="text-base font-semibold text-gray-700">Mua sắm</span>
            </Link>
            <Link
              to="/cart"
              className="p-6 border-2 border-dashed border-green-300 rounded-xl hover:border-green-500 hover:bg-green-50 text-center transition-colors shadow-sm"
            >
              <ShoppingCart className="w-10 h-10 mx-auto text-green-500 mb-2" />
              <span className="text-base font-semibold text-gray-700">Giỏ hàng</span>
            </Link>
            <Link
              to="/buyer/order-detail"
              className="p-6 border-2 border-dashed border-orange-300 rounded-xl hover:border-orange-500 hover:bg-orange-50 text-center transition-colors shadow-sm"
            >
              <Package className="w-10 h-10 mx-auto text-orange-500 mb-2" />
              <span className="text-base font-semibold text-gray-700">Đơn hàng</span>
            </Link>
            <Link
              to="/buyer/profile"
              className="p-6 border-2 border-dashed border-purple-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 text-center transition-colors shadow-sm"
            >
              <User className="w-10 h-10 mx-auto text-purple-500 mb-2" />
              <span className="text-base font-semibold text-gray-700">Hồ sơ</span>
            </Link>
          </div>
        </div>

        {/* Popular Products */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Sản phẩm nổi bật</h3>
            <Link to="/products" className="text-blue-600 hover:text-blue-700 text-sm font-semibold">
              Xem tất cả →
            </Link>
          </div>
          <div className="space-y-4">
            {popularProducts.map((product) => (
              <div key={product.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-xl bg-gray-50 hover:bg-green-50 transition-colors">
                <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-lg" />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-base">{product.name}</h4>
                  <p className="text-xs text-gray-500">{product.category}</p>
                  <p className="text-sm text-blue-600 font-bold mt-1">{formatCurrency(product.price)}</p>
                </div>
                <Link
                  to="/products"
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
      {/* <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-xl shadow-lg p-8 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Thống kê hệ thống</h3>
          <TrendingUp className="w-7 h-7 text-green-500" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-blue-100 rounded-xl shadow-sm">
            <p className="text-3xl font-extrabold text-blue-600 mb-1">500+</p>
            <p className="text-base text-gray-700">Sản phẩm có sẵn</p>
          </div>
          <div className="text-center p-6 bg-green-100 rounded-xl shadow-sm">
            <p className="text-3xl font-extrabold text-green-600 mb-1">1,000+</p>
            <p className="text-base text-gray-700">Đơn hàng đã giao</p>
          </div>
          <div className="text-center p-6 bg-yellow-100 rounded-xl shadow-sm">
            <p className="text-3xl font-extrabold text-yellow-600 mb-1">4.8</p>
            <p className="text-base text-gray-700">Đánh giá trung bình</p>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default BuyerDashboard;