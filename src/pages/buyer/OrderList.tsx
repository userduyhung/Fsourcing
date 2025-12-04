import React, { useEffect, useState } from 'react';
import { Package, Clock, CheckCircle, XCircle, Truck, RefreshCw, Eye, Filter, User, Calendar, CreditCard, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { orderService, OrderDto } from '../../services/orderService';
import { logger } from '../../utils/logger';

const OrderList: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showGrouped, setShowGrouped] = useState<boolean>(false); // false = split (per-order), true = grouped by cart
  const [userName, setUserName] = useState<string>('Người dùng');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Lấy tên user từ localStorage (không cần BE)
    try {
      const profileStr = localStorage.getItem('buyerProfile');
      if (profileStr) {
        const profile = JSON.parse(profileStr);
        setUserName(profile.fullName || profile.email || 'Người dùng');
      }
    } catch (e) {
      console.warn('Cannot parse buyer profile');
    }
    
    // Check token
    const token = localStorage.getItem('buyerToken');
    console.log('🔑 Token exists:', !!token);
    
    if (!token) {
      setError('Bạn chưa đăng nhập. Vui lòng đăng nhập để xem lịch sử giao dịch.');
      setLoading(false);
      return;
    }
    
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError('');
      logger.debug('OrderList', 'loading orders from API');
      
      const response = await orderService.getOrders(1, 50);
      
      // Debug để xem cấu trúc response
      console.log('📦 Raw response:', response);
      console.log('📦 response.success:', response.success);
      console.log('📦 response.data:', response.data);
      
      // Sau khi fix: response = { success: true, data: { items: [...], total, page, pageSize } }
      let items: OrderDto[] = [];
      
      if (response.success && response.data && Array.isArray(response.data.items)) {
        // Format chuẩn từ BE: { success: true, data: { items: [...] } }
        items = response.data.items;
        console.log('✅ Format: { success, data: { items } }');
      } else if (Array.isArray(response.data)) {
        // Fallback: { data: [...] }
        items = response.data;
        console.log('✅ Format: { data: [...] }');
      } else if (Array.isArray(response)) {
        // Fallback: [...]
        items = response;
        console.log('✅ Format: [...]');
      } else {
        console.warn('⚠️ Unknown response format:', response);
      }
      
      console.log('✅ Extracted items:', items);
      console.log('✅ Items count:', items.length);
      
      setOrders(items);
      
      logger.info('OrderList', 'orders loaded successfully', {
        count: items.length,
        rawResponse: response
      });
    } catch (error: any) {
      logger.error('OrderList', 'failed to load orders', error);
      console.error('❌ Error loading orders:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error response:', error.response);
      setError(error.message || 'Không thể tải lịch sử giao dịch');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'refunded':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'shipped':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'refunded':
        return <RefreshCw className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Filter orders based on selected status
  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(o => o.status.toLowerCase() === statusFilter.toLowerCase());

  // Group split orders (one logical transaction can be split into multiple orders by seller)
  // Grouping key: cartId when available, otherwise order.id
  const groupedMap = orders.reduce((acc: Record<string, OrderDto[]>, o) => {
    const key = o.cartId && o.cartId.trim() !== '' ? o.cartId : o.id;
    if (!acc[key]) acc[key] = [];
    acc[key].push(o);
    return acc;
  }, {});

  type GroupedOrder = {
    key: string;
    orders: OrderDto[];
    id: string; // primary id to navigate to
    status: string; // aggregated status
    totalAmount: number;
    createdAt: string;
    itemsCount: number;
    firstProductName?: string;
  };

  const groupedOrders: GroupedOrder[] = Object.keys(groupedMap).map((key) => {
    const group = groupedMap[key];
    const statuses = Array.from(new Set(group.map(g => g.status || '').filter(Boolean)));
    let aggStatus = group[0].status || '';
    if (statuses.length === 1) {
      aggStatus = statuses[0];
    } else {
      // Mixed statuses — mark as 'partial' to indicate different states across split orders
      aggStatus = 'partial';
    }

    return {
      key,
      orders: group,
      id: group[0].id,
      status: aggStatus,
      totalAmount: group.reduce((s, it) => s + (it.totalAmount || it.total || 0), 0),
      // take earliest createdAt
      createdAt: group.map(g => g.createdAt).sort()[0],
      itemsCount: group.reduce((c, it) => c + (it.items?.length || 0), 0),
      firstProductName: group[0].items && group[0].items.length > 0 ? group[0].items[0].productName : undefined
    };
  });

  // For filtering and display use groupedOrders or raw orders depending on view
  const filteredGrouped = statusFilter === 'all' ? groupedOrders : groupedOrders.filter(g => (g.status || '').toLowerCase() === statusFilter.toLowerCase());
  const filteredSplit = statusFilter === 'all' ? orders : orders.filter(o => (o.status || '').toLowerCase() === statusFilter.toLowerCase());

  // Active lists depending on toggle
  const activeList = showGrouped ? groupedOrders : orders;
  const activeFiltered = showGrouped ? filteredGrouped : filteredSplit;

  const statusCount = (val: string) => {
    if (!val || val === 'all') return activeList.length;
    return activeList.filter(i => ((i.status || '').toLowerCase() === val)).length;
  };

  const statusTabs = [
    { value: 'all', label: 'Tất cả', count: statusCount('all'), color: 'blue', icon: Package },
    { value: 'pending', label: 'Chờ xác nhận', count: statusCount('pending'), color: 'yellow', icon: Clock },
    { value: 'confirmed', label: 'Đã xác nhận', count: statusCount('confirmed'), color: 'blue', icon: CheckCircle },
    { value: 'shipped', label: 'Đang giao', count: statusCount('shipped'), color: 'purple', icon: Truck },
    { value: 'delivered', label: 'Đã giao', count: statusCount('delivered'), color: 'green', icon: CheckCircle },
    { value: 'cancelled', label: 'Đã hủy', count: statusCount('cancelled'), color: 'red', icon: XCircle },
    { value: 'refunded', label: 'Đã hoàn tiền', count: statusCount('refunded'), color: 'orange', icon: RefreshCw },
  ];

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4">
        <h2 className="text-2xl font-bold mb-6">Đơn hàng của tôi</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-lg p-4 bg-white shadow-sm animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
        <p className="text-center text-gray-500 mt-4">Đang tải đơn hàng...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4">
        <h2 className="text-2xl font-bold mb-6">Đơn hàng của tôi</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <XCircle className="w-12 h-12 mx-auto text-red-500 mb-3" />
          <p className="text-red-700 font-medium mb-2">{error}</p>
          <button
            onClick={() => navigate('/buyer/login')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      {/* Header với user info */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 mb-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <User className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Lịch sử giao dịch</h2>
            </div>
            <p className="text-blue-100">Tài khoản: {userName}</p>
          </div>
          <button
            onClick={loadOrders}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition text-sm backdrop-blur-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Tải lại
          </button>
        </div>
      </div>
      
      {/* Bộ lọc trạng thái */}
      <div className="bg-white rounded-lg p-6 mb-6 shadow-sm border">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-5 h-5 text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-900">Lọc theo trạng thái</h3>
          <div className="ml-auto flex items-center gap-2">
            <label className="text-sm text-gray-600">Hiển thị gộp</label>
            <input type="checkbox" checked={showGrouped} onChange={(e) => setShowGrouped(e.target.checked)} className="transform scale-95" />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {statusTabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all border-2 ${
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

      {/* Thống kê nhanh */}
      {(showGrouped ? filteredGrouped.length : filteredSplit.length) > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Tổng giao dịch</p>
                <p className="text-2xl font-bold text-gray-900">{activeList.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Thành công</p>
                <p className="text-2xl font-bold text-gray-900">
                  {activeList.filter(o => ['confirmed', 'shipped', 'delivered'].includes((o.status || '').toLowerCase())).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Chờ xử lý</p>
                <p className="text-2xl font-bold text-gray-900">
                  {activeList.filter(o => ((o.status || '').toLowerCase() === 'pending')).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <CreditCard className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Tổng chi tiêu</p>
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(activeFiltered.reduce((sum, o) => sum + ((o as any).totalAmount || (o as any).total || 0), 0))}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeFiltered.length === 0 && activeList.length > 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border shadow-sm">
          <AlertCircle className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
          <p className="text-gray-700 text-lg font-medium mb-2">Không tìm thấy đơn hàng</p>
          <p className="text-gray-500 text-sm mb-4">
            Không có đơn hàng nào với trạng thái "{statusTabs.find(t => t.value === statusFilter)?.label}"
          </p>
          <button
            onClick={() => setStatusFilter('all')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Xem tất cả đơn hàng
          </button>
        </div>
      ) : activeFiltered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border shadow-sm">
          <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg mb-2">Chưa có giao dịch nào</p>
          <p className="text-gray-400 text-sm mb-4">Hãy bắt đầu mua sắm để tạo giao dịch đầu tiên!</p>
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Khám phá sản phẩm
          </button>
        </div>
      ) : (
        <>
          {/* Danh sách giao dịch */}
          <div className="space-y-3">
            {showGrouped ? (
              filteredGrouped.map((group) => (
                <div 
                  key={group.key} 
                  className="border rounded-lg bg-white shadow-sm hover:shadow-md transition cursor-pointer overflow-hidden"
                  onClick={() => navigate(`/buyer/orders/${group.id}`)}
                >
                  <div className="flex">
                    <div className={`w-2 ${
                      group.status.toLowerCase() === 'delivered' ? 'bg-green-500' :
                      group.status.toLowerCase() === 'shipped' ? 'bg-blue-500' :
                      group.status.toLowerCase() === 'confirmed' ? 'bg-purple-500' :
                      group.status.toLowerCase() === 'pending' ? 'bg-yellow-500' :
                      'bg-gray-500'
                    }`}></div>
                    <div className="flex-1 p-5">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="font-bold text-gray-900 text-base">#{group.id.substring(0, 8).toUpperCase()}</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(group.status)}`}>
                              <span className="flex items-center gap-1.5">{getStatusIcon(group.status)}{group.status === 'partial' ? 'Nhiều trạng thái' : getStatusText(group.status)}</span>
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm mb-3">
                            <div className="flex items-center gap-2 text-gray-600"><Calendar className="w-4 h-4" /><span>{new Date(group.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span></div>
                            <div className="flex items-center gap-2 text-gray-600"><User className="w-4 h-4" /><span>{userName}</span></div>
                            <div className="flex items-center gap-2 text-gray-600"><CreditCard className="w-4 h-4" /><span className="font-semibold text-blue-600">{formatCurrency(group.totalAmount)}</span></div>
                          </div>
                          {group.itemsCount > 0 && (
                            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded px-3 py-2"><Package className="w-4 h-4" /><span>{group.itemsCount} sản phẩm</span>{group.firstProductName && (<><span>•</span><span className="truncate max-w-xs">{group.firstProductName}</span>{group.itemsCount > 1 && <span className="text-gray-400">và {group.itemsCount - 1} sản phẩm khác</span>}</>)}</div>
                          )}
                        </div>
                        <button className="ml-4 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" onClick={(e) => { e.stopPropagation(); navigate(`/buyer/orders/${group.id}`); }}><Eye className="w-5 h-5" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              filteredSplit.map((order) => (
                <div 
                  key={order.id} 
                  className="border rounded-lg bg-white shadow-sm hover:shadow-md transition cursor-pointer overflow-hidden"
                  onClick={() => navigate(`/buyer/orders/${order.id}`)}
                >
                  <div className="flex">
                    <div className={`w-2 ${
                      (order.status || '').toLowerCase() === 'delivered' ? 'bg-green-500' :
                      (order.status || '').toLowerCase() === 'shipped' ? 'bg-blue-500' :
                      (order.status || '').toLowerCase() === 'confirmed' ? 'bg-purple-500' :
                      (order.status || '').toLowerCase() === 'pending' ? 'bg-yellow-500' :
                      'bg-gray-500'
                    }`}></div>
                    <div className="flex-1 p-5">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="font-bold text-gray-900 text-base">#{order.id.substring(0, 8).toUpperCase()}</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status || '')}`}><span className="flex items-center gap-1.5">{getStatusIcon(order.status || '')}{getStatusText(order.status || '')}</span></span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm mb-3">
                            <div className="flex items-center gap-2 text-gray-600"><Calendar className="w-4 h-4" /><span>{new Date(order.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span></div>
                            <div className="flex items-center gap-2 text-gray-600"><User className="w-4 h-4" /><span>{userName}</span></div>
                            <div className="flex items-center gap-2 text-gray-600"><CreditCard className="w-4 h-4" /><span className="font-semibold text-blue-600">{formatCurrency(order.totalAmount)}</span></div>
                          </div>
                          {order.items && order.items.length > 0 && (
                            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded px-3 py-2"><Package className="w-4 h-4" /><span>{order.items.length} sản phẩm</span>{order.items[0]?.productName && (<><span>•</span><span className="truncate max-w-xs">{order.items[0].productName}</span>{order.items.length > 1 && <span className="text-gray-400">và {order.items.length - 1} sản phẩm khác</span>}</>)}</div>
                          )}
                        </div>
                        <button className="ml-4 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" onClick={(e) => { e.stopPropagation(); navigate(`/buyer/orders/${order.id}`); }}><Eye className="w-5 h-5" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
        </>
      )}
    </div>
  );
};

export default OrderList;
