import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, MapPin, CheckCircle, XCircle, ShoppingBag, ChevronDown, ChevronUp } from 'lucide-react';
import { CartItem } from '../../types';

interface Order {
  id: number;
  orderId?: string;
  items: CartItem[];
  total: number;
  address: string;
  date: string;
  status?: 'pending' | 'completed' | 'cancelled';
  estimatedDelivery?: string;
}

const OrderDetail: React.FC = () => {
  // Scroll to top when mount
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, []);
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());

  const toggleOrderExpansion = (orderId: number) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  useEffect(() => {
    // Giả lập lấy dữ liệu đơn hàng từ localStorage
    const saved = localStorage.getItem('orders');
    if (saved) {
      setOrders(JSON.parse(saved));
    }
  }, []);

  const currency = (v: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
      case 'pending':
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5" />;
      case 'cancelled': return <XCircle className="w-5 h-5" />;
      case 'pending':
      default: return <Clock className="w-5 h-5" />;
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'completed': return 'Đã hoàn thành';
      case 'cancelled': return 'Đã hủy';
      case 'pending':
      default: return 'Đang xử lý';
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 min-h-screen font-sans py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Đơn hàng của tôi</h2>
          <p className="text-gray-600">Quản lý và theo dõi các đơn hàng của bạn</p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="inline-block bg-gray-100 rounded-full p-6 mb-4">
              <Package className="w-16 h-16 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có đơn hàng nào</h3>
            <p className="text-gray-500 mb-6">Bạn chưa thực hiện đơn hàng nào. Hãy bắt đầu mua sắm!</p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
            >
              <ShoppingBag className="w-5 h-5" />
              Khám phá sản phẩm
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 text-white">
                  <div className="flex justify-between items-center flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <Package className="w-6 h-6" />
                      <div>
                        <span className="font-semibold text-lg">Mã đơn: {order.orderId || `#${order.id}`}</span>
                        <p className="text-sm text-blue-100">Ngày đặt: {order.date}</p>
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
                  {/* Delivery Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl">
                      <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600 font-medium mb-1">Địa chỉ giao hàng</p>
                        <p className="text-gray-900 font-semibold">{order.address}</p>
                      </div>
                    </div>
                    {order.estimatedDelivery && (
                      <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl">
                        <Clock className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600 font-medium mb-1">Dự kiến giao hàng</p>
                          <p className="text-gray-900 font-semibold">{order.estimatedDelivery}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Products List */}
                  <div className="mb-4">
                    <button
                      onClick={() => toggleOrderExpansion(order.id)}
                      className="w-full flex items-center justify-between text-sm font-semibold text-gray-600 mb-3 hover:text-gray-900 transition-colors"
                    >
                      <span>Sản phẩm đã đặt ({order.items.length} sản phẩm)</span>
                      {expandedOrders.has(order.id) ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                    
                    {expandedOrders.has(order.id) && (
                      <div className="space-y-3">
                        {order.items.map((item, idx) => (
                          <div key={`${order.id}-${item.name}-${idx}`} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                            <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg shadow" />
                            <div className="flex-1">
                              <h5 className="font-semibold text-gray-900">{item.name}</h5>
                              <p className="text-sm text-gray-600">Số lượng: x{item.quantity}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-blue-600">{currency(item.price * item.quantity)}</p>
                              <p className="text-xs text-gray-500">{currency(item.price)}/sp</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Total */}
                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-700">Tổng thanh toán:</span>
                      <span className="text-2xl font-bold text-blue-600">{currency(order.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetail;
