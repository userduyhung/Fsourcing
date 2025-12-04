import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, Clock, MapPin, CheckCircle, XCircle, ChevronDown, ChevronUp, Truck, RefreshCw, AlertCircle, ArrowLeft } from 'lucide-react';
import { orderService, OrderDto, OrderItemDto } from '../../services/orderService';
import { logger } from '../../utils/logger';

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [expandedItems, setExpandedItems] = useState(true);

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
      logger.debug('OrderDetail', 'fetching order', { orderId });
      
      const response = await orderService.getOrderById(orderId);
      
      // Debug response structure
      console.log('📦 getOrderById response:', response);
      console.log('📦 response keys:', response ? Object.keys(response) : 'NULL');
      
      // Handle different response formats
      let orderData: OrderDto | null = null;
      
      console.log('=== RESPONSE STRUCTURE DEBUG ===');
      console.log('Raw response:', response);
      console.log('response.success:', (response as any)?.success);
      console.log('response.data:', (response as any)?.data);
      console.log('response.id:', (response as any)?.id);
      console.log('response.items:', (response as any)?.items);
      
      if ((response as any)?.data) {
        console.log('response.data keys:', Object.keys((response as any).data));
        console.log('response.data.items:', (response as any).data.items);
        console.log('response.data.orderItems:', (response as any).data.orderItems);
        console.log('response.data.OrderItems:', (response as any).data.OrderItems);
      }
      console.log('================================');
      
      if ((response as any)?.success && (response as any)?.data) {
        // Format: { success: true, data: OrderDto }
        console.log('✅ Format: { success, data }');
        orderData = (response as any).data;
      } else if ((response as any)?.id) {
        // Format: OrderDto directly
        console.log('✅ Format: OrderDto directly');
        orderData = response as OrderDto;
      } else {
        console.warn('⚠️ Unknown response format:', response);
      }
      
      if (orderData && orderData.id) {
        console.log('=== ORDER DATA DEBUG ===');
        console.log('Full orderData:', orderData);
        console.log('orderData.items:', orderData.items);
        console.log('Items count:', orderData.items?.length);
        console.log('=======================');
        
        setOrder(orderData);
        logger.info('OrderDetail', 'order loaded', { orderId: orderData.id, itemsCount: orderData.items?.length });
      } else {
        console.error('❌ No valid order data found');
        setError('Order not found');
      }
    } catch (error: any) {
      logger.error('OrderDetail', 'failed to load order', error);
      console.error('❌ Error:', error);
      setError(error.message || 'Failed to load order details');
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
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'pending':
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  const decodeAddress = (s: string) => {
    if (!s) return '';
    // Try URL decoding first (handles %20 etc.)
    try {
      const decoded = decodeURIComponent(s);
      if (decoded && decoded !== s) return decoded;
    } catch (e) {
      // ignore
    }
    // Fallback: decode HTML entities
    try {
      const txt = document.createElement('textarea');
      txt.innerHTML = s;
      return txt.value || s;
    } catch (e) {
      return s;
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
              onClick={() => navigate('/buyer/orders')}
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

  return (
    <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 min-h-screen font-sans py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate('/buyer/orders')}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Quay lại danh sách đơn hàng</span>
        </button>

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Chi tiết đơn hàng</h2>
          <p className="text-gray-600">Mã đơn: #{order.id.substring(0, 8).toUpperCase()}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 text-white">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <Package className="w-6 h-6" />
                <div>
                  <span className="font-semibold text-lg">Mã đơn: #{order.id.substring(0, 8).toUpperCase()}</span>
                  <p className="text-sm text-blue-100">
                    Ngày đặt: {new Date(order.createdAt).toLocaleDateString('vi-VN')} lúc {new Date(order.createdAt).toLocaleTimeString('vi-VN')}
                  </p>
                </div>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${getStatusColor(order.status)}`}>
                {getStatusIcon(order.status)}
                <span className="font-semibold">{getStatusText(order.status)}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Delivery & Tracking Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {(order.deliveryAddressText || order.deliveryAddressId) && (
                <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl">
                  <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600 font-medium mb-1">Địa chỉ giao hàng</p>
                    <div className="text-gray-900">
                      {order.deliveryAddressText ? (
                        <p className="font-semibold leading-relaxed">{order.deliveryAddressText}</p>
                      ) : order.deliveryAddress ? (
                        <p className="font-semibold leading-relaxed">
                          {order.deliveryAddress.recipientName && `${order.deliveryAddress.recipientName} - `}
                          {`${order.deliveryAddress.street}, ${order.deliveryAddress.city}, ${order.deliveryAddress.state}${order.deliveryAddress.zipCode ? ', ' + order.deliveryAddress.zipCode : ''}${order.deliveryAddress.country ? ', ' + order.deliveryAddress.country : ''}`}
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
            <div className="mb-4">
              <button
                onClick={() => setExpandedItems(!expandedItems)}
                className="w-full flex items-center justify-between text-sm font-semibold text-gray-600 mb-3 hover:text-gray-900 transition-colors"
              >
                <span>Sản phẩm đã đặt {order.items && order.items.length > 0 ? `(${order.items.length} sản phẩm)` : ''}</span>
                {expandedItems ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
              
              {expandedItems && (
                <>
                  {order.items && order.items.length > 0 ? (
                    <div className="space-y-3">
                      {order.items.map((item: OrderItemDto, idx: number) => (
                        <div key={item.id || idx} className="flex items-start gap-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl hover:shadow-md transition-all border border-gray-200">
                          <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-white border-2 border-gray-200">
                            {item.productImage && item.productImage.trim() !== '' ? (
                              <img 
                                src={item.productImage} 
                                alt={item.productName || 'Sản phẩm'}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // Fallback to icon if image fails to load
                                  const imgElement = e.target as HTMLImageElement;
                                  imgElement.style.display = 'none';
                                  const parent = imgElement.parentElement;
                                  if (parent && !parent.querySelector('.fallback-icon')) {
                                    const fallback = document.createElement('div');
                                    fallback.className = 'fallback-icon w-full h-full bg-blue-100 flex items-center justify-center';
                                    fallback.innerHTML = '<svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>';
                                    parent.appendChild(fallback);
                                  }
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                                <Package className="w-8 h-8 text-blue-600" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-gray-900 mb-1 text-lg">{item.productName || 'Sản phẩm'}</h5>
                            <div className="space-y-1">
                              <div className="flex gap-4 text-sm">
                                <span className="text-gray-600">
                                  <span className="font-medium">Số lượng:</span> <span className="font-bold text-blue-600">x{item.quantity}</span>
                                </span>
                                <span className="text-gray-600">
                                  <span className="font-medium">Đơn giá:</span> <span className="font-semibold">{currency(item.unitPrice || item.price || 0)}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm text-gray-500 mb-1">Thành tiền</p>
                            <p className="text-xl font-bold text-blue-600">
                              {currency((item.unitPrice || item.price || 0) * item.quantity)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 bg-red-50 border-2 border-red-300 rounded-xl">
                      <div className="flex items-start gap-3 mb-3">
                        <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-red-800 font-bold text-lg mb-2">⚠️ Lỗi: Thiếu thông tin sản phẩm</p>
                          <p className="text-red-700 mb-3">
                            Đơn hàng này không có danh sách sản phẩm chi tiết, mặc dù tổng thanh toán là <strong>{currency(order.totalAmount)}</strong>.
                          </p>
                          <div className="bg-white rounded p-3 text-sm text-gray-700 mb-3">
                            <p className="font-semibold mb-1">🔍 Nguyên nhân có thể:</p>
                            <ul className="list-disc list-inside space-y-1 text-xs">
                              <li>Giỏ hàng không được đồng bộ với server khi đặt hàng</li>
                              <li>Lỗi kỹ thuật khi chuyển dữ liệu từ giỏ hàng sang đơn hàng</li>
                              <li>Sản phẩm đã bị xóa khỏi hệ thống sau khi đặt hàng</li>
                            </ul>
                          </div>
                          <div className="bg-yellow-50 rounded p-3 text-sm">
                            <p className="font-semibold text-yellow-800 mb-1">💡 Khuyến nghị:</p>
                            <p className="text-yellow-700 text-xs">
                              Vui lòng liên hệ bộ phận hỗ trợ với mã đơn hàng <strong>#{order.id.substring(0, 8).toUpperCase()}</strong> để được hỗ trợ.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Special Instructions */}
            {order.specialInstructions && (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <p className="text-sm font-medium text-gray-700 mb-1">Ghi chú đơn hàng:</p>
                <p className="text-gray-900 whitespace-pre-wrap">{order.specialInstructions}</p>
              </div>
            )}

            {/* Notes from seller */}
            {order.notes && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm font-medium text-gray-700 mb-1">Ghi chú từ người bán:</p>
                <p className="text-gray-900">{order.notes}</p>
              </div>
            )}

            {/* Total Breakdown */}
            <div className="border-t pt-4 mt-4">
              <div className="space-y-3">
                {/* Subtotal from items */}
                {order.items && order.items.length > 0 && (
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Tổng tiền hàng:</span>
                    <span className="font-medium">
                      {currency(
                        order.items.reduce((sum: number, item: any) => 
                          sum + (item.unitPrice || item.price || 0) * item.quantity, 0
                        )
                      )}
                    </span>
                  </div>
                )}
                
                {/* Shipping cost */}
                {(order.shippingCost ?? 0) > 0 && (
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Phí vận chuyển:</span>
                    <span className="font-medium">{currency(order.shippingCost ?? 0)}</span>
                  </div>
                )}
                
                {/* Discount if mentioned in special instructions */}
                {order.specialInstructions && order.specialInstructions.includes('Giảm giá') && (
                  <div className="flex justify-between items-center text-green-600">
                    <span>Giảm giá:</span>
                    <span className="font-medium">
                      {(() => {
                        const match = order.specialInstructions.match(/Giảm giá[:\s]+(\d+(?:,\d+)*)\s*[₫đ]/i);
                        return match ? `- ${match[1]} ₫` : '0 ₫';
                      })()}
                    </span>
                  </div>
                )}
                
                {/* Divider */}
                <div className="border-t pt-3"></div>
                
                {/* Final Total */}
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Tổng thanh toán:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {currency(order.totalAmount || order.totalCost || 0)}
                  </span>
                </div>
                
                {/* Info note about totalAmount */}
                <div className="text-xs text-gray-500 italic mt-2 bg-gray-50 p-2 rounded">
                  💡 Tổng thanh toán là số tiền cuối cùng đã được hệ thống tính toán, bao gồm tất cả các khoản phí và giảm giá.
                </div>
              </div>
            </div>

            {/* Actions */}
            {order.trackingNumber && (
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => navigate(`/buyer/orders/${order.id}/tracking`)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Truck className="w-4 h-4" />
                  <span>Theo dõi đơn hàng</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
