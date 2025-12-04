import React, { useState, useEffect } from 'react';
import { Users, UserCheck, ShoppingBag, DollarSign, AlertCircle, TrendingUp, Loader2, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import adminOrderService from '../../services/adminOrderService';
import { logger } from '../../utils/logger';

interface OrderStatistics {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState<OrderStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setIsLoading(true);
      setError('');
      logger.info('AdminDashboard', 'fetching statistics');
      
      const stats = await adminOrderService.getOrderStatistics();
      setStatistics(stats as OrderStatistics);
      
      logger.info('AdminDashboard', 'statistics loaded', stats);
    } catch (err: any) {
      logger.error('AdminDashboard', 'failed to load statistics', err);
      
      // Fallback: Use mock data if API not available
      logger.warn('AdminDashboard', 'using fallback mock data');
      setStatistics({
        totalOrders: 0,
        pendingOrders: 0,
        confirmedOrders: 0,
        shippedOrders: 0,
        deliveredOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        totalRevenue: 0
      });
      
      setError('Backend chưa sẵn sàng. Hiển thị dữ liệu mặc định.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const stats = [
    {
      title: 'Tổng số đơn hàng',
      value: statistics?.totalOrders.toString() || '0',
      change: `${statistics?.pendingOrders || 0} chờ xử lý`,
      icon: Package,
      color: 'bg-blue-500',
      onClick: () => navigate('/admin/orders')
    },
    {
      title: 'Đơn hàng đang xử lý',
      value: ((statistics?.confirmedOrders || 0) + (statistics?.shippedOrders || 0)).toString(),
      change: `${statistics?.confirmedOrders || 0} đã xác nhận`,
      icon: ShoppingBag,
      color: 'bg-orange-500',
      onClick: () => navigate('/admin/orders')
    },
    {
      title: 'Đơn hàng hoàn thành',
      value: ((statistics?.completedOrders || 0) + (statistics?.deliveredOrders || 0)).toString(),
      change: `${statistics?.cancelledOrders || 0} đã hủy`,
      icon: UserCheck,
      color: 'bg-green-500',
      onClick: () => navigate('/admin/orders')
    },
    {
      title: 'Tổng doanh thu',
      value: statistics ? formatCurrency(statistics.totalRevenue) : '0 ₫',
      change: 'Từ tất cả đơn hàng',
      icon: DollarSign,
      color: 'bg-purple-500',
      onClick: () => navigate('/admin/analytics')
    }
  ];

  const recentActivities = [
    { id: 1, action: 'Đơn hàng mới được tạo', user: `${statistics?.pendingOrders || 0} đơn chờ xác nhận`, time: 'Hiện tại', type: 'order' },
    { id: 2, action: 'Đơn hàng đang xử lý', user: `${(statistics?.confirmedOrders || 0) + (statistics?.shippedOrders || 0)} đơn`, time: 'Hiện tại', type: 'processing' },
    { id: 3, action: 'Đơn hàng hoàn thành', user: `${(statistics?.completedOrders || 0) + (statistics?.deliveredOrders || 0)} đơn`, time: 'Hiện tại', type: 'completed' },
    { id: 4, action: 'Đơn hàng đã hủy', user: `${statistics?.cancelledOrders || 0} đơn`, time: 'Hiện tại', type: 'cancelled' }
  ];

  const pendingActions = [
    { 
      id: 1, 
      type: 'Đơn hàng chờ xác nhận', 
      count: statistics?.pendingOrders || 0,
      description: 'Cần xác nhận và xử lý',
      action: () => navigate('/admin/orders')
    },
    { 
      id: 2, 
      type: 'Đơn hàng đang giao', 
      count: statistics?.shippedOrders || 0,
      description: 'Đang trên đường giao hàng',
      action: () => navigate('/admin/orders')
    },
    { 
      id: 3, 
      type: 'Xem tất cả đơn hàng', 
      count: statistics?.totalOrders || 0,
      description: 'Quản lý toàn bộ đơn hàng',
      action: () => navigate('/admin/orders')
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tổng quan quản trị</h1>
          <p className="text-gray-600 mt-2">Theo dõi hoạt động đơn hàng và doanh thu hệ thống</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/admin/orders')}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 font-medium"
          >
            <Package className="w-5 h-5" />
            Xem tất cả đơn hàng
          </button>
          <button
            onClick={fetchStatistics}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Làm mới'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <div className="flex-1">
            <p className="text-yellow-800 font-medium">{error}</p>
            <p className="text-yellow-700 text-sm mt-1">
              Vui lòng đảm bảo backend đang chạy và đã build lại sau khi thêm AdminOrderController.cs
            </p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Đang tải thống kê...</span>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={index} 
                  className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-all hover:scale-105"
                  onClick={stat.onClick}
                  title={`Click để ${stat.title.toLowerCase()}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                      <p className="text-sm text-gray-500 mt-1">{stat.change}</p>
                    </div>
                    <div className={`${stat.color} rounded-lg p-3`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  {index === 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <span className="text-xs text-blue-600 font-medium">→ Click để xem chi tiết</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Status Overview */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tổng quan trạng thái đơn hàng</h3>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'order' ? 'bg-yellow-500' :
                      activity.type === 'processing' ? 'bg-blue-500' :
                      activity.type === 'completed' ? 'bg-green-500' :
                      'bg-red-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.user} • {activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Hành động nhanh</h3>
                <Package className="w-5 h-5 text-blue-500" />
              </div>
              <div className="space-y-4">
                {pendingActions.map((item) => (
                  <div 
                    key={item.id} 
                    className="border-l-4 border-blue-500 pl-4 cursor-pointer hover:bg-blue-50 p-2 rounded transition-colors"
                    onClick={item.action}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{item.type}</p>
                      <span className="text-lg font-bold text-blue-600">{item.count}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => navigate('/admin/orders')}
                className="w-full mt-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Package className="w-4 h-4" />
                Xem tất cả đơn hàng
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button 
                onClick={() => navigate('/admin/users')}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center transition-colors"
              >
                <Users className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">Quản lý người dùng</span>
              </button>
              <button 
                onClick={() => navigate('/admin/seller-approval')}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center transition-colors"
              >
                <UserCheck className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                <span className="text-sm font-medium text-gray-700">Duyệt nhà bán</span>
              </button>
              <button 
                onClick={() => navigate('/admin/orders')}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center transition-colors"
              >
                <Package className="w-6 h-6 mx-auto mb-2 text-green-500" />
                <span className="text-sm font-medium text-gray-700">Quản lý đơn hàng</span>
              </button>
              <button 
                onClick={() => navigate('/admin/analytics')}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center transition-colors"
              >
                <TrendingUp className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                <span className="text-sm font-medium text-gray-700">Xem thống kê</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;