import React, { useEffect, useState } from 'react';

interface Order {
  id: number;
  buyer: string;
  items: Array<{ name: string; quantity: number; price: number; }>;
  total: number;
  address: string;
  date: string;
  status: string;
}

const OrderList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    // Giả lập lấy danh sách đơn hàng từ localStorage
    const saved = localStorage.getItem('sellerOrders');
    if (saved) {
      setOrders(JSON.parse(saved));
    }
  }, []);

  return (
    <div className="bg-[#f8ecd7] min-h-screen font-sans">
      <div className="max-w-3xl mx-auto py-10">
        <h2 className="text-2xl font-bold mb-6">Danh sách đơn hàng đã bán</h2>
        {orders.length === 0 ? (
          <div className="text-gray-500">Chưa có đơn hàng nào.</div>
        ) : (
          <ul className="space-y-6">
            {orders.map(order => (
              <li key={order.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-lg">Mã đơn: #{order.id}</span>
                  <span className="text-sm text-gray-500">{order.date}</span>
                </div>
                <div className="mb-2">Người mua: <span className="font-medium">{order.buyer}</span></div>
                <div className="mb-2">Địa chỉ giao hàng: <span className="font-medium">{order.address}</span></div>
                <ul className="mb-2">
                  {order.items.map((item, idx) => (
                    <li key={`${order.id}-${item.name}-${idx}`} className="flex items-center gap-3 mb-1">
                      <span className="font-medium text-base">{item.name}</span>
                      <span className="ml-auto text-blue-600 font-semibold">{item.price} đ</span>
                      <span className="ml-2 text-xs text-gray-500">x{item.quantity}</span>
                    </li>
                  ))}                </ul>
                <div className="font-bold text-lg">Tổng cộng: <span className="text-blue-600">{order.total} đ</span></div>
                <div className="mt-2">Trạng thái: <span className="font-semibold text-green-600">{order.status}</span></div>
                <a href={`/seller/order-detail/${order.id}`} className="inline-block mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Xem chi tiết</a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default OrderList;
