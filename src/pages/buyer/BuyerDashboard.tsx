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
import { orderService, OrderDto } from '../../services/orderService';
import { logger } from '../../utils/logger';

const BuyerDashboard: React.FC = () => {
  // Scroll to top when mount
  React.useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, []);
  const buyerProfile = JSON.parse(localStorage.getItem('buyerProfile') || '{}');
  
  // Get cart from localStorage
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  
  // Load orders from API
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  
  const [notifications] = useState(() => {
    const saved = localStorage.getItem('buyerNotifications');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoadingOrders(true);
      logger.debug('BuyerDashboard', 'loading orders from API');
      
      const response = await orderService.getOrders(1, 10);
      
      if (response.success && response.data) {
        setOrders(response.data.items || []);
        logger.info('BuyerDashboard', 'orders loaded', { count: response.data.items?.length });
      }
    } catch (error: any) {
      logger.error('BuyerDashboard', 'failed to load orders', error);
      // Không hiển thị error, chỉ để orders rỗng
    } finally {
      setLoadingOrders(false);
    }
  };

  const cartItemCount = cart.reduce((sum: number, item: any) => sum + item.quantity, 0);
  const unreadNotifications = notifications.filter((n: any) => !n.read).length;
  const pendingOrders = orders.filter(o => o.status.toLowerCase() === 'pending').length;
  const completedOrders = orders.filter(o => o.status.toLowerCase() === 'delivered' || o.status.toLowerCase() === 'completed').length;

  // Filter orders based on selected status
  const filteredOrders = orderStatusFilter === 'all' 
    ? orders 
    : orders.filter(o => o.status.toLowerCase() === orderStatusFilter.toLowerCase());
  
  const recentOrders = filteredOrders.slice(0, 5);

  const orderStatusTabs = [
    { value: 'all', label: 'Tất cả', count: orders.length, color: 'blue' },
    { value: 'pending', label: 'Chờ xác nhận', count: orders.filter(o => o.status.toLowerCase() === 'pending').length, color: 'yellow' },
    { value: 'confirmed', label: 'Đã xác nhận', count: orders.filter(o => o.status.toLowerCase() === 'confirmed').length, color: 'blue' },
    { value: 'shipped', label: 'Đang giao', count: orders.filter(o => o.status.toLowerCase() === 'shipped').length, color: 'purple' },
    { value: 'delivered', label: 'Đã giao', count: orders.filter(o => o.status.toLowerCase() === 'delivered').length, color: 'green' },
    { value: 'completed', label: 'Hoàn thành', count: orders.filter(o => o.status.toLowerCase() === 'completed').length, color: 'green' },
    { value: 'cancelled', label: 'Đã hủy', count: orders.filter(o => o.status.toLowerCase() === 'cancelled').length, color: 'red' },
  ];

  const stats = [
    { title: 'Sản phẩm trong giỏ', value: cartItemCount.toString(), change: 'Chưa thanh toán', icon: ShoppingCart, color: 'bg-gradient-to-r from-blue-500 to-blue-400', link: '/cart' },
    { title: 'Đơn hàng đang xử lý', value: pendingOrders.toString(), change: 'Đang giao', icon: Package, color: 'bg-gradient-to-r from-orange-500 to-orange-400', link: '/buyer/orders' },
    { title: 'Đơn hàng hoàn thành', value: completedOrders.toString(), change: 'Đá giao', icon: CheckCircle, color: 'bg-gradient-to-r from-green-500 to-green-400', link: '/buyer/orders' },
    { title: 'Thông báo', value: unreadNotifications.toString(), change: 'Chưa đọc', icon: Bell, color: 'bg-gradient-to-r from-red-500 to-pink-400' }
  ];

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
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'delivered':
      case 'completed': 
        return 'bg-green-100 text-green-800';
      case 'pending': 
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled': 
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-orange-100 text-orange-800';
      default: 
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'delivered':
        return 'Đã giao hàng';
      case 'completed': 
        return 'Hoàn thành';
      case 'pending': 
        return 'Chờ xác nhận';
      case 'confirmed':
        return 'Đã xác nhận';
      case 'shipped':
        return 'Đang giao hàng';
      case 'cancelled': 
        return 'Đã hủy';
      case 'refunded':
        return 'Đã hoàn tiền';
      default: 
        return status;
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
      {/* Hero Section with User Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Welcome Card */}
        <div className="lg:col-span-2 relative rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 py-10 px-8 text-white shadow-lg h-full">
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

        {/* User Profile Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <User className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {buyerProfile.fullName || 'Buyer'}
            </h3>
            <p className="text-sm text-gray-500 mb-3">{buyerProfile.company || 'Company'}</p>
            
            <div className="w-full space-y-2 mb-4">
              <div className="flex items-center justify-center text-xs text-gray-600 bg-gray-50 rounded-lg py-2 px-3">
                <User className="w-3 h-3 mr-2 text-gray-400" />
                {buyerProfile.jobTitle || 'Job Title'}
              </div>
              <div className="flex items-center justify-center text-xs text-gray-600 bg-gray-50 rounded-lg py-2 px-3">
                <TrendingUp className="w-3 h-3 mr-2 text-gray-400" />
                {buyerProfile.country || 'Country'}
              </div>
            </div>
            
            <Link
              to="/buyer/profile"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all text-sm font-semibold shadow-md hover:shadow-lg"
            >
              Xem hồ sơ đầy đủ
            </Link>
          </div>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Đơn hàng gần đây</h3>
            <Link to="/buyer/orders" className="text-blue-600 hover:text-blue-700 text-sm font-semibold">
              Xem tất cả →
            </Link>
          </div>
          
          {/* Status Filter Tabs */}
          <div className="mb-6 overflow-x-auto">
            <div className="flex space-x-2 min-w-max pb-2">
              {orderStatusTabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setOrderStatusFilter(tab.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                    orderStatusFilter === tab.value
                      ? `bg-${tab.color}-500 text-white shadow-md`
                      : `bg-gray-100 text-gray-600 hover:bg-${tab.color}-50 hover:text-${tab.color}-600`
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                      orderStatusFilter === tab.value
                        ? 'bg-white bg-opacity-30'
                        : `bg-${tab.color}-100 text-${tab.color}-700`
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {loadingOrders ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-3 text-gray-300 animate-pulse" />
                <p>Đang tải đơn hàng...</p>
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Chưa có đơn hàng nào</p>
                <Link to="/products" className="text-blue-600 hover:text-blue-700 text-sm font-semibold mt-2 inline-block">
                  Mua sắm ngay →
                </Link>
              </div>
            ) : (
              recentOrders.map((order) => (
                <Link 
                  key={order.id} 
                  to={`/buyer/orders/${order.id}`}
                  className="flex items-center justify-between p-5 border border-gray-200 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-base mb-1">
                      Đơn hàng #{order.id.substring(0, 8).toUpperCase()}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {order.items && order.items.length > 0 
                        ? `${order.items.length} sản phẩm` 
                        : 'Không có sản phẩm'
                      } | {formatCurrency(order.totalAmount || 0)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity: hidden */}
      </div>

      {/* Quick Actions and Popular Products */}
      <div className="grid grid-cols-1 gap-8">
        {/* Quick Actions (horizontal row) */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Thao tác nhanh</h3>
          <div className="flex items-center gap-4 overflow-x-auto py-2">
            <Link
              to="/products"
              className="flex-shrink-0 flex flex-col items-center justify-center min-w-[120px] px-4 py-3 bg-white border border-gray-100 rounded-lg hover:shadow-md transition-all"
            >
              <ShoppingBag className="w-7 h-7 text-blue-500 mb-2" />
              <span className="text-sm font-medium text-gray-700">Mua sắm</span>
            </Link>

            <Link
              to="/cart"
              className="flex-shrink-0 flex flex-col items-center justify-center min-w-[120px] px-4 py-3 bg-white border border-gray-100 rounded-lg hover:shadow-md transition-all"
            >
              <ShoppingCart className="w-7 h-7 text-green-500 mb-2" />
              <span className="text-sm font-medium text-gray-700">Giỏ hàng</span>
            </Link>

            <Link
              to="/buyer/orders"
              className="flex-shrink-0 flex flex-col items-center justify-center min-w-[120px] px-4 py-3 bg-white border border-gray-100 rounded-lg hover:shadow-md transition-all"
            >
              <Package className="w-7 h-7 text-orange-500 mb-2" />
              <span className="text-sm font-medium text-gray-700">Đơn hàng</span>
            </Link>

            <Link
              to="/buyer/profile"
              className="flex-shrink-0 flex flex-col items-center justify-center min-w-[120px] px-4 py-3 bg-white border border-gray-100 rounded-lg hover:shadow-md transition-all"
            >
              <User className="w-7 h-7 text-purple-500 mb-2" />
              <span className="text-sm font-medium text-gray-700">Hồ sơ</span>
            </Link>
          </div>
        </div>

        {/* Popular Products: intentionally hidden */}
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