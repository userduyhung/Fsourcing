import React, { useEffect, useState } from 'react';
import { CartItem } from '../../types';

interface Order {
  id: number;
  items: CartItem[];
  total: number;
  address: string;
  date: string;
}

const OrderDetail: React.FC = () => {
  // Scroll to top when mount
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, []);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    // Giả lập lấy dữ liệu đơn hàng từ localStorage
    const saved = localStorage.getItem('orders');
    if (saved) {
      setOrders(JSON.parse(saved));
    }
  }, []);

  return (
    <div className="bg-app min-h-screen font-sans">
      <div className="max-w-3xl mx-auto py-10">
        <h2 className="text-2xl font-bold mb-6">Đơn hàng đã mua</h2>
        {orders.length === 0 ? (
          <div className="text-gray-500">Bạn chưa có đơn hàng nào.</div>
        ) : (
          <ul className="space-y-6">
            {orders.map(order => (
              <li key={order.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-lg">Mã đơn: #{order.id}</span>
                  <span className="text-sm text-gray-500">{order.date}</span>
                </div>
                <div className="mb-2">Địa chỉ giao hàng: <span className="font-medium">{order.address}</span></div>
                <ul className="mb-2">
                  {order.items.map((item, idx) => (
                    <li key={`${order.id}-${item.name}-${idx}`} className="flex items-center gap-3 mb-1">
                      <img src={item.image} alt={item.name} className="w-8 h-8 rounded" />
                      <span className="font-medium text-base">{item.name}</span>
                      <span className="ml-auto text-blue-600 font-semibold">{item.price} đ</span>
                      <span className="ml-2 text-xs text-gray-500">x{item.quantity}</span>
                    </li>
                  ))}                </ul>
                <div className="font-bold text-lg">Tổng cộng: <span className="text-blue-600">{order.total} đ</span></div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default OrderDetail;
