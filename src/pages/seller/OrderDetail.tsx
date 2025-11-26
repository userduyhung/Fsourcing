import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

interface Order {
  id: number;
  buyer: string;
  items: Array<{ name: string; quantity: number; price: number; }>;
  total: number;
  address: string;
  date: string;
  status: string;
}

const OrderDetail: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Giả lập lấy đơn hàng từ localStorage
    setLoading(true);
    const saved = localStorage.getItem('sellerOrders');
    if (saved && orderId) {
      const orders: Order[] = JSON.parse(saved);
      const found = orders.find(o => o.id === Number(orderId));
      if (found) setOrder(found);
      else setOrder(null);
    } else {
      setOrder(null);
    }
    setLoading(false);
  }, [orderId]);

  if (loading) {
    return (
      <div className="bg-app min-h-screen font-sans flex items-center justify-center">
        <div className="text-lg text-gray-600 animate-pulse">Đang tải đơn hàng...</div>
      </div>
    );
  }
  if (!order) {
    return (
      <div className="bg-app min-h-screen font-sans flex items-center justify-center">
        Không tìm thấy đơn hàng.
      </div>
    );
  }

  return (
    <div className="bg-app min-h-screen font-sans">
      <div className="max-w-2xl mx-auto py-10">
        <h2 className="text-2xl font-bold mb-6">Chi tiết đơn hàng #{order.id}</h2>
        <div className="bg-white rounded-lg shadow p-8">
          <div className="mb-2">Ngày đặt: <span className="font-medium">{order.date}</span></div>
          <div className="mb-2">Người mua: <span className="font-medium">{order.buyer}</span></div>
          <div className="mb-2">Địa chỉ giao hàng: <span className="font-medium">{order.address}</span></div>
          <div className="mb-2">Trạng thái: <span className="font-semibold text-green-600">{order.status}</span></div>
          <ul className="mb-4">
            {order.items.map((item, idx) => (
              <li key={idx} className="flex items-center gap-3 mb-1">
                <span className="font-medium text-base">{item.name}</span>
                <span className="ml-auto text-blue-600 font-semibold">{item.price} đ</span>
                <span className="ml-2 text-xs text-gray-500">x{item.quantity}</span>
              </li>
            ))}
          </ul>
          <div className="font-bold text-lg">Tổng cộng: <span className="text-blue-600">{order.total} đ</span></div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
