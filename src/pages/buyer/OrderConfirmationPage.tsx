import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Package, MapPin, CreditCard, Clock, QrCode, ArrowLeft, Eye } from 'lucide-react';
import { orderService, OrderDto } from '../../services/orderService';
import { logger } from '../../utils/logger';

const OrderConfirmationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState<OrderDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);

  // Get order ID from URL params or localStorage
  const orderId = searchParams.get('orderId') || localStorage.getItem('currentOrderId');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    if (!orderId) {
      logger.warn('OrderConfirmation', 'No order ID found');
      navigate('/buyer/cart');
      return;
    }

    loadOrderDetails();
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      logger.debug('OrderConfirmation', 'fetching order details', { orderId });
      
      const orderData = await orderService.getOrderById(orderId!);
      setOrder(orderData);
      
      logger.info('OrderConfirmation', 'order loaded', orderData);
    } catch (error: any) {
      logger.error('OrderConfirmation', 'failed to load order', error);
      console.error('Failed to load order:', error);
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
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const generatePaymentQR = () => {
    if (!order) return '';
    
    const pendingPayment = localStorage.getItem('pendingPaymentOrder');
    let amount = order.totalAmount || order.total || 0;
    
    if (pendingPayment) {
      try {
        const paymentData = JSON.parse(pendingPayment);
        amount = paymentData.amount;
      } catch (e) {
        logger.warn('OrderConfirmation', 'failed to parse pendingPaymentOrder');
      }
    }

    const qrData = {
      accountNo: '0903900008',
      accountName: 'NGUYEN VAN A',
      acqId: '970422',
      amount: Math.round(amount),
      addInfo: `Thanh toan don hang ${order.id.substring(0, 8)}`,
      format: 'text',
      template: 'compact'
    };

    const queryString = new URLSearchParams(qrData as any).toString();
    return `https://api.vietqr.io/v2/generate?${queryString}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy đơn hàng</h2>
          <p className="text-gray-600 mb-6">Đơn hàng không tồn tại hoặc đã bị xóa.</p>
          <button
            onClick={() => navigate('/buyer/orders')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Xem đơn hàng của tôi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Đặt hàng thành công!
          </h1>
          <p className="text-gray-600 mb-4">
            Đơn hàng của bạn đã được tiếp nhận và đang chờ xử lý
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>{new Date(order.createdAt).toLocaleString('vi-VN')}</span>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Thông tin đơn hàng</h2>
            <span className={`px-4 py-2 rounded-lg text-sm font-medium border ${getStatusColor(order.status)}`}>
              {getStatusText(order.status)}
            </span>
          </div>

          {/* Order ID */}
          <div className="mb-6 pb-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">Mã đơn hàng</div>
                <div className="font-mono text-lg font-semibold text-gray-900">
                  #{order.id.substring(0, 8).toUpperCase()}
                </div>
              </div>
              <button
                onClick={() => navigate(`/buyer/orders/${order.id}`)}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
              >
                <Eye className="w-4 h-4" />
                <span>Xem chi tiết</span>
              </button>
            </div>
          </div>

          {/* Payment Info */}
          <div className="mb-6 pb-6 border-b">
            <div className="flex items-center gap-2 text-gray-700 mb-3">
              <CreditCard className="w-5 h-5" />
              <span className="font-semibold">Thanh toán</span>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Tổng tiền:</span>
                <span className="text-xl font-bold text-blue-600">
                  {formatCurrency(order.totalAmount || order.total || 0)}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                Phương thức: <span className="font-medium">Chuyển khoản ngân hàng</span>
              </div>
            </div>

            {/* QR Payment */}
            <div className="mt-4">
              <button
                onClick={() => setShowQR(!showQR)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition w-full justify-center"
              >
                <QrCode className="w-5 h-5" />
                <span>{showQR ? 'Ẩn mã QR thanh toán' : 'Hiển thị mã QR thanh toán'}</span>
              </button>

              {showQR && (
                <div className="mt-4 p-6 bg-white border-2 border-blue-200 rounded-lg text-center">
                  <img
                    src={generatePaymentQR()}
                    alt="Payment QR Code"
                    className="w-64 h-64 mx-auto mb-4"
                  />
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Ngân hàng: <span className="font-medium">MB Bank (970422)</span></div>
                    <div>Số TK: <span className="font-medium">0903900008</span></div>
                    <div>Chủ TK: <span className="font-medium">NGUYEN VAN A</span></div>
                    <div>Nội dung: <span className="font-medium">Thanh toan don hang {order.id.substring(0, 8)}</span></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Delivery Address */}
          {order.deliveryAddressId && (
            <div className="mb-6">
              <div className="flex items-center gap-2 text-gray-700 mb-3">
                <MapPin className="w-5 h-5" />
                <span className="font-semibold">Địa chỉ giao hàng</span>
              </div>
              <div className="text-gray-600">
                {order.specialInstructions?.split('\n')[0] || 'Đang cập nhật...'}
              </div>
            </div>
          )}

          {/* Order Items */}
          {order.items && order.items.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-gray-700 mb-3">
                <Package className="w-5 h-5" />
                <span className="font-semibold">Sản phẩm ({order.items.length})</span>
              </div>
              <div className="space-y-3">
                {order.items.map((item: any, index: number) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{item.productName || 'Sản phẩm'}</div>
                      <div className="text-sm text-gray-500">Số lượng: {item.quantity}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        {formatCurrency(item.totalPrice || item.unitPrice * item.quantity)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatCurrency(item.unitPrice)} x {item.quantity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/products')}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Tiếp tục mua sắm</span>
          </button>
          <button
            onClick={() => navigate('/buyer/orders')}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Xem đơn hàng của tôi
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
