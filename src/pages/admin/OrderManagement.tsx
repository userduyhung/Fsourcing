import React, { useState, useEffect, useRef } from 'react';

interface Order {
  id: number;
  buyer: string;
  seller: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  address: string;
  date: string;
  status: string;
}

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Giả lập lấy đơn hàng từ localStorage
    const saved = localStorage.getItem('allOrders');
    if (saved) {
      setOrders(JSON.parse(saved));
    }
  }, []);

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

  return (
    <div className="min-h-screen bg-gray-50 py-10 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Quản lý tất cả đơn Buyer → Seller</h2>
            {orders.length === 0 ? (
              <div className="text-center text-gray-500">Không có đơn hàng nào.</div>
            ) : (
              <table className="w-full border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-3">Mã đơn</th>
                    <th className="py-2 px-3">Ngày đặt</th>
                    <th className="py-2 px-3">Người mua</th>
                    <th className="py-2 px-3">Người bán</th>
                    <th className="py-2 px-3">Tổng tiền</th>
                    <th className="py-2 px-3">Trạng thái</th>
                    <th className="py-2 px-3">Chi tiết</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id} className="border-b">
                      <td className="py-2 px-3 font-medium">#{order.id}</td>
                      <td className="py-2 px-3">{order.date}</td>
                      <td className="py-2 px-3">{order.buyer}</td>
                      <td className="py-2 px-3">{order.seller}</td>
                      <td className="py-2 px-3 text-blue-600 font-semibold">{Number(order.total).toLocaleString('vi-VN')} đ</td>
                      <td className="py-2 px-3">
                        <span className="font-bold text-green-600">{order.status}</span>
                      </td>
                      <td className="py-2 px-3">
                        <button
                          className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsModalOpen(true);
                          }}
                        >
                          Xem
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
      </div>
      {/* Modal for order details */}
      {isModalOpen && selectedOrder && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
          tabIndex={-1}
        >
          <div
            ref={modalRef}
            className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full outline-none"
            tabIndex={0}
            aria-modal="true"
            role="dialog"
          >
            <h3 className="text-xl font-bold mb-4">Chi tiết đơn hàng #{selectedOrder.id}</h3>
            <div className="mb-2"><span className="font-semibold">Ngày đặt:</span> {selectedOrder.date}</div>
            <div className="mb-2"><span className="font-semibold">Người mua:</span> {selectedOrder.buyer}</div>
            <div className="mb-2"><span className="font-semibold">Người bán:</span> {selectedOrder.seller}</div>
            <div className="mb-2"><span className="font-semibold">Địa chỉ giao hàng:</span> {selectedOrder.address}</div>
            <div className="mb-2"><span className="font-semibold">Trạng thái:</span> <span className="font-bold text-green-600">{selectedOrder.status}</span></div>
            <div className="mb-4"><span className="font-semibold">Tổng tiền:</span> <span className="text-blue-600 font-bold">{Number(selectedOrder.total).toLocaleString('vi-VN')} đ</span></div>
            <div className="mb-4">
              <span className="font-semibold">Sản phẩm:</span>
              <ul className="mt-2 list-disc list-inside">
                {selectedOrder.items.map((item, idx) => (
                  <li key={idx} className="mb-1">
                    {item.name} <span className="text-gray-500">x{item.quantity}</span> - <span className="text-blue-600">{item.price} đ</span>
                  </li>
                ))}
              </ul>
            </div>
            <button
              className="bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-900 focus:outline-none"
              onClick={() => {
                setIsModalOpen(false);
                setSelectedOrder(null);
              }}
              autoFocus
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
