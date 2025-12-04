import React, { useState, useEffect, useRef } from 'react';
import adminOrderService, { AdminOrderDto } from '../../services/adminOrderService';
import { logger } from '../../utils/logger';
import { Loader2, AlertCircle, Package, Clock, CheckCircle, Truck, XCircle, RefreshCw, Eye, Filter, TrendingUp, DollarSign } from 'lucide-react';

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<AdminOrderDto[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderDto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError('');
      logger.info('OrderManagement', 'fetching admin orders', { page: currentPage });
      
      const response = await adminOrderService.getAllOrders(currentPage, 20);
      
      logger.debug('OrderManagement', 'raw response', { 
        response,
        hasData: !!response?.data,
        hasItems: !!response?.data?.items,
        itemsLength: response?.data?.items?.length,
        itemsIsArray: Array.isArray(response?.data?.items),
        firstOrderSample: response?.data?.items?.[0]
      });
      
      // Log to check if orders have items field
      if (response?.data?.items?.length > 0) {
        logger.debug('OrderManagement', 'Sample order structure:', {
          hasItems: !!response.data.items[0].items,
          itemsCount: response.data.items[0].items?.length,
          itemsField: response.data.items[0].items
        });
      }
      
      // Handle different response formats
      const items = response?.data?.items || [];
      const totalPages = response?.data?.totalPages || 1;
      const total = response?.data?.total || 0;
      
      setOrders(items);
      setTotalPages(totalPages);
      
      logger.info('OrderManagement', 'orders loaded', { 
        count: items.length,
        total: total,
        totalPages: totalPages
      });
      
      // Show info if no orders found
      if (items.length === 0) {
        logger.warn('OrderManagement', 'No orders found in database');
      }
    } catch (err: any) {
      logger.error('OrderManagement', 'failed to load orders', err);
      setError(err.message || 'Không thể tải danh sách đơn hàng');
    } finally {
      setIsLoading(false);
    }
  };

  // Keyboard accessibility: close modal on Escape
  useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
        setSelectedOrder(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  // Focus trap for modal
  useEffect(() => {
    if (isModalOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isModalOpen]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'delivered') return 'text-green-600';
    if (statusLower === 'completed') return 'text-green-700';
    if (statusLower === 'confirmed') return 'text-blue-600';
    if (statusLower === 'shipped') return 'text-cyan-600';
    if (statusLower === 'pending') return 'text-yellow-600';
    if (statusLower === 'cancelled') return 'text-red-600';
    if (statusLower === 'refunded') return 'text-orange-600';
    return 'text-gray-600';
  };

  const getStatusBgColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'delivered') return 'bg-green-100 border-green-300';
    if (statusLower === 'completed') return 'bg-green-100 border-green-300';
    if (statusLower === 'confirmed') return 'bg-blue-100 border-blue-300';
    if (statusLower === 'shipped') return 'bg-cyan-100 border-cyan-300';
    if (statusLower === 'pending') return 'bg-yellow-100 border-yellow-300';
    if (statusLower === 'cancelled') return 'bg-red-100 border-red-300';
    if (statusLower === 'refunded') return 'bg-orange-100 border-orange-300';
    return 'bg-gray-100 border-gray-300';
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending': 'Chờ xác nhận',
      'confirmed': 'Đã xác nhận',
      'shipped': 'Đang giao',
      'delivered': 'Đã giao',
      'completed': 'Hoàn thành',
      'cancelled': 'Đã hủy'
    };
    return statusMap[status.toLowerCase()] || status;
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return;
    
    try {
      setIsUpdatingStatus(true);
      logger.info('OrderManagement', 'updating order status', { orderId: selectedOrder.id, newStatus });
      
      const updated = await adminOrderService.updateOrderStatus(
        selectedOrder.id, 
        newStatus, 
        statusNotes || undefined
      );
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === selectedOrder.id ? { ...order, status: updated.status } : order
        )
      );
      
      setSelectedOrder({ ...selectedOrder, status: updated.status });
      setNewStatus('');
      setStatusNotes('');
      
      logger.info('OrderManagement', 'order status updated successfully');
      alert('Cập nhật trạng thái đơn hàng thành công!');
      
      // Auto-close modal after successful update
      setIsModalOpen(false);
      setSelectedOrder(null);
    } catch (err: any) {
      logger.error('OrderManagement', 'failed to update status', err);
      alert(err.message || 'Không thể cập nhật trạng thái');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getAvailableStatusTransitions = (currentStatus: string): string[] => {
    const statusLower = currentStatus.toLowerCase();
    switch (statusLower) {
      case 'pending':
        return ['Confirmed', 'Cancelled'];
      case 'confirmed':
        return ['Shipped', 'Cancelled'];
      case 'shipped':
        return ['Delivered', 'Cancelled'];
      case 'delivered':
        return ['Refunded'];
      case 'cancelled':
      case 'refunded':
      case 'completed':
        return []; // Terminal states - no transitions allowed
      default:
        return [];
    }
  };

  const allStatuses = [
    { value: 'Pending', label: 'Chờ xác nhận' },
    { value: 'Confirmed', label: 'Đã xác nhận' },
    { value: 'Shipped', label: 'Đang giao' },
    { value: 'Delivered', label: 'Đã giao' },
    { value: 'Refunded', label: 'Đã hoàn tiền' },
    { value: 'Cancelled', label: 'Đã hủy' }
  ];

  // Filter orders based on selected status
  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(o => o.status.toLowerCase() === statusFilter.toLowerCase());

  const statusTabs = [
    { value: 'all', label: 'Tất cả', count: orders.length, color: 'blue', icon: Package },
    { value: 'pending', label: 'Chờ xác nhận', count: orders.filter(o => o.status.toLowerCase() === 'pending').length, color: 'yellow', icon: Clock },
    { value: 'confirmed', label: 'Đã xác nhận', count: orders.filter(o => o.status.toLowerCase() === 'confirmed').length, color: 'blue', icon: CheckCircle },
    { value: 'shipped', label: 'Đang giao', count: orders.filter(o => o.status.toLowerCase() === 'shipped').length, color: 'purple', icon: Truck },
    { value: 'delivered', label: 'Đã giao', count: orders.filter(o => o.status.toLowerCase() === 'delivered').length, color: 'green', icon: CheckCircle },
    { value: 'cancelled', label: 'Đã hủy', count: orders.filter(o => o.status.toLowerCase() === 'cancelled').length, color: 'red', icon: XCircle },
    { value: 'refunded', label: 'Đã hoàn tiền', count: orders.filter(o => o.status.toLowerCase() === 'refunded').length, color: 'orange', icon: RefreshCw },
  ];

  // Calculate statistics
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status.toLowerCase() === 'pending').length,
    completed: orders.filter(o => ['delivered', 'completed'].includes(o.status.toLowerCase())).length,
    revenue: orders.filter(o => ['delivered', 'completed'].includes(o.status.toLowerCase())).reduce((sum, o) => sum + o.totalAmount, 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 font-sans">;
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Quản lý đơn hàng</h2>
              <p className="text-gray-600">Theo dõi và quản lý tất cả đơn hàng trong hệ thống</p>
            </div>
            <button 
              onClick={fetchOrders}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Đang tải...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  <span>Làm mới</span>
                </>
              )}
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Tổng đơn hàng</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Package className="w-12 h-12 text-blue-500 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Chờ xử lý</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
                </div>
                <Clock className="w-12 h-12 text-yellow-500 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Hoàn thành</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-green-500 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Doanh thu</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.revenue)}</p>
                </div>
                <DollarSign className="w-12 h-12 text-purple-500 opacity-20" />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-800">Lỗi tải dữ liệu</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Package className="w-6 h-6" />
              Danh sách đơn hàng
            </h3>
          </div>

          <div className="p-6">
            {/* Status Filter */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Filter className="w-5 h-5 text-gray-700" />
                <h4 className="text-lg font-semibold text-gray-900">Lọc theo trạng thái</h4>
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

            {isLoading ? (
          <div className="flex flex-col justify-center items-center py-16">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
            <span className="text-gray-600 font-medium">Đang tải đơn hàng...</span>
          </div>
        ) : filteredOrders.length === 0 && orders.length > 0 ? (
          <div className="text-center py-16">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Không tìm thấy đơn hàng</h3>
            <p className="text-gray-600 mb-4">
              Không có đơn hàng nào với trạng thái "{statusTabs.find(t => t.value === statusFilter)?.label}"
            </p>
            <button
              onClick={() => setStatusFilter('all')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Xem tất cả đơn hàng
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Không có đơn hàng nào trong hệ thống</h3>
            <p className="text-gray-600 mb-4">Database chưa có dữ liệu order hoặc tất cả đã bị xóa.</p>
            <button 
              onClick={fetchOrders}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              Thử lại
            </button>
          </div>
        ) : (
          <>
            {/* Orders Grid */}
            <div className="space-y-4">
              {filteredOrders.map(order => (
                <div 
                  key={order.id} 
                  className="border-2 border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all cursor-pointer hover:border-blue-300"
                  onClick={() => {
                    setSelectedOrder(order);
                    setIsModalOpen(true);
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-bold text-lg text-gray-900">
                          Mã đơn: #{order.id.substring(0, 8).toUpperCase()}
                        </h4>
                        <span className={`px-3 py-1 rounded-full border-2 text-sm font-bold ${getStatusColor(order.status)} ${getStatusBgColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(order.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          <span>
                            {order.items && Array.isArray(order.items) ? (
                              <span className="font-semibold text-blue-600">{order.items.length} sản phẩm</span>
                            ) : (
                              <span className="text-gray-400 italic">Chưa có dữ liệu</span>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          <span className="font-bold text-blue-600">{formatCurrency(order.totalAmount)}</span>
                        </div>
                      </div>

                      {order.buyerName && (
                        <div className="mt-2 text-sm text-gray-600">
                          <span className="font-medium">Người mua:</span> {order.buyerName}
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOrder(order);
                        setIsModalOpen(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition ml-4"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Chi tiết</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-8 pt-6 border-t">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
                >
                  ← Trước
                </button>
                <div className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold">
                  Trang {currentPage} / {totalPages}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
                >
                  Sau →
                </button>
              </div>
            )}
          </>
        )}
          </div>
        </div>
      </div>
      
      {/* Modal for order details */}
      {isModalOpen && selectedOrder && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          tabIndex={-1}
        >
          <div
            ref={modalRef}
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto outline-none"
            tabIndex={0}
            aria-modal="true"
            role="dialog"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 sticky top-0 z-10">
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                <Package className="w-7 h-7" />
                Chi tiết đơn hàng #{selectedOrder.id.substring(0, 8).toUpperCase()}
              </h3>
            </div>

            <div className="p-8">
              {/* Order Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm font-semibold text-blue-800 mb-2">👤 Người mua</p>
                  <p className="text-gray-900 font-medium">{selectedOrder.buyerName || selectedOrder.buyerEmail || 'N/A'}</p>
                  {selectedOrder.buyerEmail && (
                    <p className="text-sm text-gray-600 mt-1">{selectedOrder.buyerEmail}</p>
                  )}
                </div>
                
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <p className="text-sm font-semibold text-orange-800 mb-2">🏪 Người bán</p>
                  <p className="text-gray-900 font-medium">{selectedOrder.sellerName || 'N/A'}</p>
                  {selectedOrder.sellerEmail && selectedOrder.sellerEmail !== 'N/A' && (
                    <p className="text-sm text-gray-600 mt-1">{selectedOrder.sellerEmail}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Clock className="w-4 h-4" />
                    Ngày đặt
                  </div>
                  <p className="text-gray-900 font-medium">{formatDate(selectedOrder.createdAt)}</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm font-semibold text-gray-700 mb-2">📋 Trạng thái</p>
                  <span className={`font-bold px-4 py-2 rounded-full border-2 inline-flex ${getStatusColor(selectedOrder.status)} ${getStatusBgColor(selectedOrder.status)}`}>
                    {getStatusText(selectedOrder.status)}
                  </span>
                </div>
              </div>

              {selectedOrder.specialInstructions && (
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200 mb-6">
                  <p className="text-sm font-semibold text-yellow-800 mb-2">📝 Ghi chú đặc biệt</p>
                  <p className="text-gray-700">{selectedOrder.specialInstructions}</p>
                </div>
              )}

              {/* Products */}
              <div className="mb-6">
                <h4 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Sản phẩm trong đơn hàng
                </h4>
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={item.id || idx} className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200 hover:shadow-md transition">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 text-lg">{item.productName}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Package className="w-4 h-4" />
                                Số lượng: <strong>x{item.quantity}</strong>
                              </span>
                              <span className="flex items-center gap-1">
                                💰 Đơn giá: <strong>{formatCurrency(item.unitPrice)}</strong>
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-blue-600 font-bold text-xl">{formatCurrency(item.totalPrice)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">Không có thông tin sản phẩm</p>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 mb-6 text-white">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold flex items-center gap-2">
                    <TrendingUp className="w-6 h-6" />
                    Tổng thanh toán
                  </span>
                  <span className="text-3xl font-bold">
                    {formatCurrency(selectedOrder.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Update Status Section */}
            <div className="border-t-2 border-gray-200 pt-6 mb-6">
              <h4 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Cập nhật trạng thái đơn hàng
              </h4>
              {getAvailableStatusTransitions(selectedOrder.status).length === 0 ? (
                <div className="p-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg text-center border border-gray-300">
                  <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-700 font-medium">
                    Đơn hàng ở trạng thái <span className="font-bold text-gray-900">{getStatusText(selectedOrder.status)}</span> không thể thay đổi
                  </p>
                </div>
              ) : (
                <div className="space-y-4 bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Trạng thái hiện tại
                    </label>
                    <span className={`font-bold px-4 py-2 rounded-full border-2 inline-flex ${getStatusColor(selectedOrder.status)} ${getStatusBgColor(selectedOrder.status)}`}>
                      {getStatusText(selectedOrder.status)}
                    </span>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Chọn trạng thái mới <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      disabled={isUpdatingStatus}
                    >
                      <option value="">-- Chọn trạng thái --</option>
                      {getAvailableStatusTransitions(selectedOrder.status).map(status => {
                        const statusObj = allStatuses.find(s => s.value === status);
                        return (
                          <option key={status} value={status}>
                            {statusObj?.label || status}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Ghi chú (tùy chọn)
                    </label>
                    <textarea
                      value={statusNotes}
                      onChange={(e) => setStatusNotes(e.target.value)}
                      placeholder="Nhập ghi chú về việc thay đổi trạng thái..."
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition"
                      rows={3}
                      disabled={isUpdatingStatus}
                    />
                  </div>

                  <button
                    onClick={handleUpdateStatus}
                    disabled={!newStatus || isUpdatingStatus}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 rounded-lg font-bold text-lg hover:from-green-700 hover:to-green-800 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                  >
                    {isUpdatingStatus ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Đang cập nhật...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-6 h-6" />
                        Cập nhật trạng thái
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            <button
              className="w-full bg-gradient-to-r from-gray-700 to-gray-800 text-white px-6 py-4 rounded-lg font-bold text-lg hover:from-gray-800 hover:to-gray-900 focus:outline-none transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              onClick={() => {
                setIsModalOpen(false);
                setSelectedOrder(null);
                setNewStatus('');
                setStatusNotes('');
              }}
            >
              <XCircle className="w-5 h-5" />
              Đóng
            </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
