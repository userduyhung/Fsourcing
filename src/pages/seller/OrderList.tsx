import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Clock, TrendingUp, CheckCircle, AlertCircle, Eye, ArrowLeft } from 'lucide-react';
import { orderService, OrderDto } from '../../services/orderService';
import { logger } from '../../utils/logger';

const SellerOrderList: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    shipped: 0,
    delivered: 0
  });

  useEffect(() => {
    // Debug: Check localStorage on mount
    const sellerToken = localStorage.getItem('sellerToken');
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const userRole = localStorage.getItem('userRole');
    
    logger.info('SellerOrderList', '🔍 Component mounted - checking auth', {
      hasSellerToken: !!sellerToken,
      hasToken: !!token,
      role,
      userRole,
      sellerTokenPreview: sellerToken ? sellerToken.substring(0, 30) + '...' : 'NONE',
      tokenPreview: token ? token.substring(0, 30) + '...' : 'NONE'
    });
    
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Check if user has token - prioritize sellerToken
      const sellerToken = localStorage.getItem('sellerToken');
      const token = localStorage.getItem('token');
      const authToken = localStorage.getItem('authToken');
      const userRole = localStorage.getItem('userRole') || localStorage.getItem('role');
      const finalToken = sellerToken || token || authToken;
      
      logger.info('SellerOrderList', '🔐 Auth check', { 
        hasSellerToken: !!sellerToken,
        hasToken: !!token,
        hasAuthToken: !!authToken,
        hasFinalToken: !!finalToken,
        role: userRole,
        tokenPreview: finalToken ? finalToken.substring(0, 40) + '...' : 'NONE'
      });

      if (!finalToken) {
        setError('Bạn chưa đăng nhập. Vui lòng đăng nhập lại.');
        setLoading(false);
        return;
      }

      // Case-insensitive role check (backend returns "Seller", FE may store "seller")
      if (userRole?.toLowerCase() !== 'seller') {
        setError('Bạn không có quyền truy cập trang này. Vui lòng đăng nhập với tài khoản Seller.');
        setLoading(false);
        return;
      }

      logger.info('SellerOrderList', '📡 Calling API: GET /orders/received');

      const response = await orderService.getReceivedOrders(1, 100);
      
      logger.info('SellerOrderList', '📦 Raw API response received', {
        responseType: typeof response,
        isArray: Array.isArray(response),
        hasSuccess: !!(response as any)?.success,
        hasData: !!(response as any)?.data,
        statusValue: (response as any)?.success,
        apiResponseStatus: (response as any)?.status,
        fullResponse: JSON.stringify(response).substring(0, 500)
      });

      let ordersList: OrderDto[] = [];
      
      // Parse response with proper fallback chain
      const resp = response as any;
      
      // Try different response paths
      if (resp?.success === true && resp?.data?.items) {
        // Standard API format: { success: true, data: { items: [...] } }
        ordersList = resp.data.items;
        logger.info('SellerOrderList', '✅ Extracted from: response.data.items (success flag)');
      } else if (resp?.data?.items) {
        // Has items in data.items
        ordersList = resp.data.items;
        logger.info('SellerOrderList', '✅ Extracted from: response.data.items');
      } else if (Array.isArray(resp?.items)) {
        // Has items directly
        ordersList = resp.items;
        logger.info('SellerOrderList', '✅ Extracted from: response.items');
      } else if (resp?.data && Array.isArray(resp.data)) {
        // data itself is an array
        ordersList = resp.data;
        logger.info('SellerOrderList', '✅ Extracted from: response.data (direct array)');
      } else if (Array.isArray(resp)) {
        // Response is direct array
        ordersList = resp;
        logger.info('SellerOrderList', '✅ Response is direct array');
      } else {
        logger.warn('SellerOrderList', '⚠️ Unknown response format, trying fallback', { 
          responseKeys: Object.keys(resp || {}),
          response 
        });
        // Try to find items anywhere in response
        if (resp?.result?.items) {
          ordersList = resp.result.items;
          logger.info('SellerOrderList', '✅ Extracted from: response.result.items');
        }
      }

      logger.info('SellerOrderList', `📊 Loaded ${ordersList.length} orders`, {
        ordersCount: ordersList.length,
        samples: ordersList.slice(0, 2).map(o => ({
          id: o.id?.substring(0, 8),
          status: o.status,
          totalAmount: o.totalAmount,
          createdAt: o.createdAt
        }))
      });

      setOrders(ordersList);
      
      // Calculate stats
      const newStats = {
        total: ordersList.length,
        pending: ordersList.filter(o => o.status?.toLowerCase?.() === 'pending').length,
        confirmed: ordersList.filter(o => o.status?.toLowerCase?.() === 'confirmed').length,
        shipped: ordersList.filter(o => o.status?.toLowerCase?.() === 'shipped').length,
        delivered: ordersList.filter(o => o.status?.toLowerCase?.() === 'delivered').length
      };
      setStats(newStats);

      logger.info('SellerOrderList', 'stats calculated', newStats);
    } catch (error: any) {
      logger.error('SellerOrderList', 'failed to load orders', {
        errorMessage: error?.message,
        errorStatus: error?.response?.status,
        errorData: error?.response?.data,
        fullError: error
      });
      
      // Check for authorization errors
      if (error.response?.status === 401) {
        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else if (error.response?.status === 403) {
        setError('Bạn không có quyền truy cập. Vui lòng kiểm tra tài khoản Seller của bạn.');
      } else if (error.response?.status === 404) {
        setError('API endpoint không tìm thấy. Backend chưa cập nhật /orders/received endpoint.');
        logger.error('SellerOrderList', 'API endpoint not found - backend may not have /orders/received', {
          suggestedFix: 'Check if backend has OrderController with [HttpGet("received")] endpoint'
        });
      } else {
        setError(error.message || 'Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  };

  const currency = (v: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'delivered': return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
      case 'refunded': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'pending':
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  const getStatusText = (status: string) => {
    const statusLower = status.toLowerCase();
    const statusMap: Record<string, string> = {
      'pending': 'Chờ xác nhận',
      'confirmed': 'Đã xác nhận',
      'shipped': 'Đang giao hàng',
      'delivered': 'Đã giao hàng',
      'cancelled': 'Đã hủy',
      'refunded': 'Đã hoàn tiền'
    };
    return statusMap[statusLower] || status;
  };

  // Filter orders based on selected status
  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(o => o.status.toLowerCase() === statusFilter.toLowerCase());

  const statusTabs = [
    { value: 'all', label: 'Tất cả', count: orders.length, color: 'orange', icon: Package },
    { value: 'pending', label: 'Chờ xác nhận', count: orders.filter(o => o.status.toLowerCase() === 'pending').length, color: 'yellow', icon: Clock },
    { value: 'confirmed', label: 'Đã xác nhận', count: orders.filter(o => o.status.toLowerCase() === 'confirmed').length, color: 'blue', icon: CheckCircle },
    { value: 'shipped', label: 'Đang giao', count: orders.filter(o => o.status.toLowerCase() === 'shipped').length, color: 'purple', icon: TrendingUp },
    { value: 'delivered', label: 'Đã giao', count: orders.filter(o => o.status.toLowerCase() === 'delivered').length, color: 'green', icon: CheckCircle },
    { value: 'cancelled', label: 'Đã hủy', count: orders.filter(o => o.status.toLowerCase() === 'cancelled').length, color: 'red', icon: AlertCircle },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 min-h-screen font-sans py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/seller/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại Dashboard</span>
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Đơn hàng đã nhận</h2>
              <p className="text-gray-600 mt-1">Quản lý và theo dõi các đơn hàng của bạn</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Tổng đơn hàng</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <Package className="w-12 h-12 text-orange-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Chờ xác nhận</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pending}</p>
              </div>
              <Clock className="w-12 h-12 text-yellow-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Đã xác nhận</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.confirmed}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Đã giao hàng</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.delivered}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-red-600 px-6 py-4">
            <h3 className="text-xl font-bold text-white">Danh sách đơn hàng</h3>
          </div>

          <div className="p-6">
            {/* Status Filter */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Lọc theo trạng thái
              </h4>
              <div className="flex flex-wrap gap-2">
                {statusTabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.value}
                      onClick={() => setStatusFilter(tab.value)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all border-2 ${
                        statusFilter === tab.value
                          ? `bg-${tab.color}-500 text-white border-${tab.color}-600 shadow-md`
                          : `bg-white text-gray-700 border-gray-200 hover:border-${tab.color}-300 hover:bg-${tab.color}-50`
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span>{tab.label}</span>
                      {tab.count > 0 && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          statusFilter === tab.value
                            ? 'bg-white/30 text-white'
                            : `bg-${tab.color}-100 text-${tab.color}-700`
                        }`}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">Không thể tải danh sách đơn hàng</p>
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                  {error.includes('đăng nhập') && (
                    <button
                      onClick={() => navigate('/seller/login')}
                      className="mt-2 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition"
                    >
                      Đăng nhập lại
                    </button>
                  )}
                </div>
              </div>
            )}

            {filteredOrders.length === 0 && orders.length > 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Không tìm thấy đơn hàng</h3>
                <p className="text-gray-600 mb-4">
                  Không có đơn hàng nào với trạng thái "{statusTabs.find(t => t.value === statusFilter)?.label}"
                </p>
                <button
                  onClick={() => setStatusFilter('all')}
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                >
                  Xem tất cả đơn hàng
                </button>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có đơn hàng nào</h3>
                <p className="text-gray-600">Các đơn hàng từ khách hàng sẽ xuất hiện tại đây</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/seller/order-detail/${order.id}`)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-lg text-gray-900">
                          Mã đơn: #{order.id.substring(0, 8).toUpperCase()}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString('vi-VN')} • {new Date(order.createdAt).toLocaleTimeString('vi-VN')}
                        </p>
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border text-sm font-semibold ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </div>
                    </div>

                    {order.items && order.items.length > 0 && (
                      <div className="mb-3 text-sm text-gray-600">
                        <span className="font-medium">{order.items.length}</span> sản phẩm
                        {order.items.length > 0 && (
                          <span className="ml-2">
                            • {order.items[0].productName || 'Sản phẩm'}
                            {order.items.length > 1 && ` và ${order.items.length - 1} sản phẩm khác`}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="text-sm text-gray-600">
                        {/* Extract address from specialInstructions if available */}
                        {(() => {
                          if (order.specialInstructions) {
                            // specialInstructions format: "Địa chỉ: 123a, Xã Xuân Cẩm...\n📦 ..."
                            const addressMatch = order.specialInstructions.match(/Địa chỉ:\s*([^\n]+)/);
                            if (addressMatch) {
                              const address = addressMatch[1].trim();
                              return <span>📍 {address.length > 50 ? address.substring(0, 50) + '...' : address}</span>;
                            }
                          }
                          // Fallback to deliveryAddressId (GUID)
                          if (order.deliveryAddressId) {
                            return <span>Địa chỉ: {order.deliveryAddressId.substring(0, 30)}...</span>;
                          }
                          return null;
                        })()}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xl font-bold text-orange-600">
                          {currency(order.totalAmount || order.totalCost || 0)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/seller/order-detail/${order.id}`);
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Chi tiết</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerOrderList;
