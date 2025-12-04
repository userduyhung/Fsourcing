import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, Clock, MapPin, CheckCircle, XCircle, Truck, RefreshCw, AlertCircle, ArrowLeft, Edit3, User } from 'lucide-react';
import { orderService, OrderDto, OrderStatus } from '../../services/orderService';
import { logger } from '../../utils/logger';
import { showAppToast } from '../../utils/toast';

const SellerOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string>('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [statusNotes, setStatusNotes] = useState<string>('');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (id) {
      loadOrderDetail(id);
    } else {
      setError('Order ID is missing');
      setLoading(false);
    }
  }, [id]);

  const loadOrderDetail = async (orderId: string) => {
    try {
      setLoading(true);
      setError('');
      logger.debug('SellerOrderDetail', 'fetching order', { orderId });
      
      // Use seller-specific API to get order detail
      const response = await orderService.getReceivedOrderById(orderId);
      
      let orderData: OrderDto | null = null;
      
      if ((response as any)?.success && (response as any)?.data) {
        orderData = (response as any).data;
      } else if ((response as any)?.id) {
        orderData = response as OrderDto;
      }
      
      if (orderData && orderData.id) {
        setOrder(orderData);
        setSelectedStatus(orderData.status);
        logger.info('SellerOrderDetail', 'order loaded', { 
          orderId: orderData.id,
          itemsCount: ((orderData as any).orderItems || []).length
        });
      } else {
        setError('Order not found');
      }
    } catch (error: any) {
      logger.error('SellerOrderDetail', 'failed to load order', error);
      setError(error.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!order || !selectedStatus) return;
    
    try {
      setUpdating(true);
      logger.info('SellerOrderDetail', 'updating order status', { 
        orderId: order.id, 
        newStatus: selectedStatus,
        notes: statusNotes 
      });

      await orderService.updateOrderStatus(order.id, selectedStatus, statusNotes);
      
      showAppToast(`Đã cập nhật trạng thái đơn hàng thành ${getStatusText(selectedStatus)}`, 'success', 3000);
      
      // Reload order to get updated data
      await loadOrderDetail(order.id);
      setShowStatusModal(false);
      setStatusNotes('');
    } catch (error: any) {
      logger.error('SellerOrderDetail', 'failed to update status', error);
      showAppToast(error.message || 'Không thể cập nhật trạng thái', 'error', 3000);
    } finally {
      setUpdating(false);
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

  const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'delivered': return <CheckCircle className="w-5 h-5" />;
      case 'cancelled': return <XCircle className="w-5 h-5" />;
      case 'shipped': return <Truck className="w-5 h-5" />;
      case 'confirmed': return <CheckCircle className="w-5 h-5" />;
      case 'refunded': return <RefreshCw className="w-5 h-5" />;
      case 'pending':
      default: return <Clock className="w-5 h-5" />;
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

  const getAvailableStatusTransitions = (currentStatus: string): string[] => {
    const statusLower = currentStatus.toLowerCase();
    switch (statusLower) {
      case 'pending':
        return [OrderStatus.Confirmed, OrderStatus.Cancelled];
      case 'confirmed':
        return [OrderStatus.Shipped, OrderStatus.Cancelled];
      case 'shipped':
        return [OrderStatus.Delivered, OrderStatus.Cancelled];
      case 'delivered':
        return [OrderStatus.Refunded];
      default:
        return [];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy đơn hàng</h3>
            <p className="text-gray-600 mb-6">{error || 'Đơn hàng không tồn tại hoặc đã bị xóa'}</p>
            <button
              onClick={() => navigate('/seller/orders')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại danh sách đơn hàng
            </button>
          </div>
        </div>
      </div>
    );
  }

  const availableTransitions = getAvailableStatusTransitions(order.status);

  return (
    <div className="bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 min-h-screen font-sans py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate('/seller/orders')}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Quay lại danh sách đơn hàng</span>
        </button>

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Chi tiết đơn hàng (Seller)</h2>
          <p className="text-gray-600">Mã đơn: #{order.id.substring(0, 8).toUpperCase()}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-600 px-6 py-4 text-white">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <Package className="w-6 h-6" />
                <div>
                  <span className="font-semibold text-lg">Mã đơn: #{order.id.substring(0, 8).toUpperCase()}</span>
                  <p className="text-sm text-orange-100">
                    Ngày đặt: {new Date(order.createdAt).toLocaleDateString('vi-VN')} lúc {new Date(order.createdAt).toLocaleTimeString('vi-VN')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  <span className="font-semibold">{getStatusText(order.status)}</span>
                </div>
                {availableTransitions.length > 0 && (
                  <button
                    onClick={() => setShowStatusModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-orange-600 rounded-lg hover:bg-orange-50 transition border border-white"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span className="font-semibold">Cập nhật</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Buyer & Delivery Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Buyer Info */}
              {((order as any).user?.email || order.userId) && (
                <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-xl">
                  <User className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600 font-medium mb-1">Người mua</p>
                    <p className="text-gray-900 font-semibold">
                      {(order as any).user?.fullName || (order as any).user?.email || `User ID: ${order.userId}`}
                    </p>
                    {(order as any).user?.fullName && (order as any).user?.email && (
                      <p className="text-sm text-gray-500 mt-1">
                        {(order as any).user.email}
                      </p>
                    )}
                  </div>
                </div>
              )}
              {/* Delivery Address */}
              {((order as any).deliveryAddressText || (order as any).deliveryAddress || order.deliveryAddressId) && (
                <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl">
                  <MapPin className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600 font-medium mb-1">Địa chỉ giao hàng</p>
                    <div className="text-gray-900">
                      {(order as any).deliveryAddressText ? (
                        <p className="font-semibold leading-relaxed">{(order as any).deliveryAddressText}</p>
                      ) : (order as any).deliveryAddress ? (
                        <p className="font-semibold leading-relaxed">
                          {(order as any).deliveryAddress.recipientName && `${(order as any).deliveryAddress.recipientName} - `}
                          {`${(order as any).deliveryAddress.street}, ${(order as any).deliveryAddress.city}, ${(order as any).deliveryAddress.state}${(order as any).deliveryAddress.zipCode ? ', ' + (order as any).deliveryAddress.zipCode : ''}${(order as any).deliveryAddress.country ? ', ' + (order as any).deliveryAddress.country : ''}`}
                        </p>
                      ) : (
                        <p className="font-mono text-sm text-gray-600">{order.deliveryAddressId}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {order.shippedWith && (
                <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl">
                  <Truck className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600 font-medium mb-1">Đơn vị vận chuyển</p>
                    <p className="text-gray-900 font-semibold">{order.shippedWith}</p>
                    {order.trackingNumber && (
                      <p className="text-sm text-gray-600 mt-1">Mã vận đơn: {order.trackingNumber}</p>
                    )}
                  </div>
                </div>
              )}
              {order.shippedAt && (
                <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl">
                  <Clock className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600 font-medium mb-1">Ngày gửi hàng</p>
                    <p className="text-gray-900 font-semibold">
                      {new Date(order.shippedAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
              )}
              {order.deliveredAt && (
                <div className="flex items-start gap-3 bg-green-50 p-4 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600 font-medium mb-1">Ngày giao hàng</p>
                    <p className="text-gray-900 font-semibold">
                      {new Date(order.deliveredAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Products List */}
            {(() => {
              // Backend returns orderItems (camelCase) as confirmed from console
              const items = (order as any).orderItems || [];
              
              return (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-600 mb-3">Sản phẩm đã đặt</h3>
                  {items.length === 0 ? (
                    <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-xl text-center">
                      <Package className="w-12 h-12 text-yellow-400 mx-auto mb-2" />
                      <p className="text-gray-700 font-medium">Đơn hàng này chưa có sản phẩm</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Đây có thể là đơn hàng test hoặc dữ liệu chưa được đồng bộ từ giỏ hàng
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {items.map((item: any, idx: number) => (
                        <div key={item.id || idx} className="flex items-start gap-4 p-4 bg-gradient-to-r from-gray-50 to-orange-50 rounded-xl hover:shadow-md transition-all border border-gray-200">
                          <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-white border-2 border-gray-200">
                            {item.productImage && item.productImage.trim() !== '' ? (
                              <img 
                                src={item.productImage} 
                                alt={item.productName || 'Sản phẩm'}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const imgElement = e.target as HTMLImageElement;
                                  imgElement.style.display = 'none';
                                  const parent = imgElement.parentElement;
                                  if (parent && !parent.querySelector('.fallback-icon')) {
                                    const fallback = document.createElement('div');
                                    fallback.className = 'fallback-icon w-full h-full bg-orange-100 flex items-center justify-center';
                                    fallback.innerHTML = '<svg class="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>';
                                    parent.appendChild(fallback);
                                  }
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-orange-100 flex items-center justify-center">
                                <Package className="w-8 h-8 text-orange-600" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-gray-900 mb-1 text-lg">{item.productName || 'Sản phẩm'}</h5>
                            <div className="space-y-1">
                              <div className="flex gap-4 text-sm">
                                <span className="text-gray-600">
                                  <span className="font-medium">Số lượng:</span> <span className="font-bold text-orange-600">x{item.quantity || 0}</span>
                                </span>
                                <span className="text-gray-600">
                                  <span className="font-medium">Đơn giá:</span> <span className="font-semibold">{currency(item.unitPrice || 0)}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm text-gray-500 mb-1">Thành tiền</p>
                            <p className="text-xl font-bold text-orange-600">
                              {currency((item.unitPrice || 0) * (item.quantity || 0))}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Special Instructions */}
            {order.specialInstructions && (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <p className="text-sm font-medium text-gray-700 mb-1">Ghi chú từ khách hàng:</p>
                <p className="text-gray-900 whitespace-pre-wrap">{order.specialInstructions}</p>
              </div>
            )}

            {/* Notes from seller */}
            {order.notes && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm font-medium text-gray-700 mb-1">Ghi chú của bạn:</p>
                <p className="text-gray-900">{order.notes}</p>
              </div>
            )}

            {/* Total */}
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Tổng thanh toán:</span>
                <span className="text-2xl font-bold text-orange-600">
                  {currency(order.totalAmount || order.totalCost || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Cập nhật trạng thái đơn hàng</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái hiện tại: <span className="text-blue-600">{getStatusText(order.status)}</span>
              </label>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chọn trạng thái mới:</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value={order.status}>{getStatusText(order.status)} (hiện tại)</option>
                {availableTransitions.map((status) => (
                  <option key={status} value={status}>
                    {getStatusText(status)}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú (tùy chọn):</label>
              <textarea
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder="Thêm ghi chú về thay đổi trạng thái..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedStatus(order.status);
                  setStatusNotes('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                disabled={updating}
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={updating || selectedStatus === order.status}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {updating ? 'Đang cập nhật...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerOrderDetail;
