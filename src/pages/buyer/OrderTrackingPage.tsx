import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, MapPin, Truck, CheckCircle, ArrowLeft, AlertCircle } from 'lucide-react';
import { orderService, OrderDto } from '../../services/orderService';
import { logger } from '../../utils/logger';

interface TrackingStep {
  status: string;
  title: string;
  description: string;
  timestamp?: string;
  completed: boolean;
  icon: React.ReactNode;
}

const OrderTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    if (!id) {
      navigate('/buyer/orders');
      return;
    }

    loadOrderTracking();
  }, [id]);

  const loadOrderTracking = async () => {
    try {
      setLoading(true);
      logger.debug('OrderTracking', 'fetching order', { orderId: id });
      
      const orderData = await orderService.getOrderById(id!);
      setOrder(orderData);
      
      logger.info('OrderTracking', 'order loaded', orderData);
    } catch (error: any) {
      logger.error('OrderTracking', 'failed to load order', error);
      console.error('Failed to load order:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrackingSteps = (order: OrderDto): TrackingStep[] => {
    const statusLower = order.status.toLowerCase();
    
    const steps: TrackingStep[] = [
      {
        status: 'pending',
        title: 'Đơn hàng đã đặt',
        description: 'Đơn hàng của bạn đã được tạo và đang chờ xác nhận',
        timestamp: order.createdAt,
        completed: true,
        icon: <Package className="w-6 h-6" />
      },
      {
        status: 'confirmed',
        title: 'Đã xác nhận',
        description: 'Người bán đã xác nhận đơn hàng và đang chuẩn bị hàng',
        timestamp: order.updatedAt,
        completed: ['confirmed', 'shipped', 'delivered'].includes(statusLower),
        icon: <CheckCircle className="w-6 h-6" />
      },
      {
        status: 'shipped',
        title: 'Đang giao hàng',
        description: order.trackingNumber 
          ? `Đơn hàng đang được vận chuyển. Mã vận đơn: ${order.trackingNumber}`
          : 'Đơn hàng đang được vận chuyển đến bạn',
        timestamp: order.shippedAt,
        completed: ['shipped', 'delivered'].includes(statusLower),
        icon: <Truck className="w-6 h-6" />
      },
      {
        status: 'delivered',
        title: 'Đã giao hàng',
        description: 'Đơn hàng đã được giao thành công',
        timestamp: order.deliveredAt,
        completed: statusLower === 'delivered',
        icon: <CheckCircle className="w-6 h-6" />
      }
    ];

    // Handle cancelled/refunded status
    if (statusLower === 'cancelled' || statusLower === 'refunded') {
      return [
        steps[0], // Pending - always completed
        {
          status: statusLower,
          title: statusLower === 'cancelled' ? 'Đơn hàng đã hủy' : 'Đã hoàn tiền',
          description: statusLower === 'cancelled' 
            ? 'Đơn hàng đã bị hủy bởi bạn hoặc người bán'
            : 'Đơn hàng đã được hoàn tiền',
          timestamp: order.updatedAt,
          completed: true,
          icon: <AlertCircle className="w-6 h-6" />
        }
      ];
    }

    return steps;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy đơn hàng</h2>
          <p className="text-gray-600 mb-6">Đơn hàng không tồn tại hoặc đã bị xóa.</p>
          <button
            onClick={() => navigate('/buyer/orders')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Quay lại đơn hàng
          </button>
        </div>
      </div>
    );
  }

  const trackingSteps = getTrackingSteps(order);
  const isCancelled = order.status.toLowerCase() === 'cancelled' || order.status.toLowerCase() === 'refunded';

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(`/buyer/orders/${order.id}`)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Quay lại chi tiết đơn hàng</span>
        </button>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Theo dõi đơn hàng
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="font-mono font-semibold">
              #{order.id.substring(0, 8).toUpperCase()}
            </span>
            <span>•</span>
            <span>{formatCurrency(order.totalAmount || order.total || 0)}</span>
            <span>•</span>
            <span>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
          </div>
        </div>

        {/* Tracking Timeline */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Trạng thái đơn hàng</h2>
          
          <div className="relative">
            {trackingSteps.map((step, index) => {
              const isLast = index === trackingSteps.length - 1;
              const statusColor = isCancelled && index > 0
                ? 'red'
                : step.completed
                ? 'green'
                : 'gray';

              return (
                <div key={step.status} className="relative pb-8 last:pb-0">
                  {/* Connecting Line */}
                  {!isLast && (
                    <div
                      className={`absolute left-5 top-12 w-0.5 h-full ${
                        isCancelled && index === 0
                          ? 'bg-red-300'
                          : step.completed && trackingSteps[index + 1]?.completed
                          ? 'bg-green-300'
                          : 'bg-gray-200'
                      }`}
                    />
                  )}

                  {/* Step Content */}
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        statusColor === 'red'
                          ? 'bg-red-100 text-red-600'
                          : step.completed
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {step.icon}
                    </div>

                    {/* Details */}
                    <div className="flex-1 pt-1">
                      <div className="flex items-start justify-between mb-1">
                        <h3
                          className={`font-semibold ${
                            statusColor === 'red'
                              ? 'text-red-600'
                              : step.completed
                              ? 'text-gray-900'
                              : 'text-gray-400'
                          }`}
                        >
                          {step.title}
                        </h3>
                        {step.timestamp && (
                          <span className="text-sm text-gray-500">
                            {new Date(step.timestamp).toLocaleString('vi-VN')}
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-sm ${
                          step.completed ? 'text-gray-600' : 'text-gray-400'
                        }`}
                      >
                        {step.description}
                      </p>

                      {/* Tracking Number */}
                      {step.status === 'shipped' && order.trackingNumber && (
                        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="text-sm text-gray-600 mb-1">Mã vận đơn:</div>
                          <div className="font-mono font-semibold text-blue-600">
                            {order.trackingNumber}
                          </div>
                          {order.shippedWith && (
                            <div className="text-sm text-gray-600 mt-1">
                              Đơn vị vận chuyển: {order.shippedWith}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Delivery Address */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 text-gray-900 font-semibold mb-4">
            <MapPin className="w-5 h-5" />
            <span>Địa chỉ giao hàng</span>
          </div>
          <div className="text-gray-600">
            {order.specialInstructions?.split('\n').map((line, index) => (
              <div key={index}>{line}</div>
            )) || 'Đang cập nhật...'}
          </div>
        </div>

        {/* Order Items */}
        {order.items && order.items.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 text-gray-900 font-semibold mb-4">
              <Package className="w-5 h-5" />
              <span>Sản phẩm trong đơn hàng</span>
            </div>
            <div className="space-y-3">
              {order.items.map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
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

        {/* Action Button */}
        <div className="mt-6">
          <button
            onClick={() => navigate('/buyer/orders')}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Xem tất cả đơn hàng
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
