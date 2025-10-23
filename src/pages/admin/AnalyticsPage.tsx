
import React, { useEffect, useState } from 'react';

interface Order {
  total: number;
  // Add other properties as needed
}

const AnalyticsPage: React.FC = () => {
  const [buyerCount, setBuyerCount] = useState(0);
  const [sellerCount, setSellerCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [revenue, setRevenue] = useState(0);

  useEffect(() => {
    // Giả lập lấy dữ liệu từ localStorage
    if (typeof window !== 'undefined') {
      try {
        const buyers = window.localStorage.getItem('buyers');
        const sellers = window.localStorage.getItem('sellers');
        const orders = window.localStorage.getItem('allOrders');

        setBuyerCount(buyers ? JSON.parse(buyers).length : 0);
        setSellerCount(sellers ? JSON.parse(sellers).length : 0);
        if (orders) {
          const orderArr = JSON.parse(orders);
          setOrderCount(orderArr.length);
          setRevenue(orderArr.reduce((sum: number, o: Order) => sum + (o.total || 0), 0));
        } else {
          setOrderCount(0);
          setRevenue(0);
        }
      } catch (err) {
        setBuyerCount(0);
        setSellerCount(0);
        setOrderCount(0);
        setRevenue(0);
        console.error('Lỗi đọc dữ liệu thống kê:', err);
      }
    } else {
      setBuyerCount(0);
      setSellerCount(0);
      setOrderCount(0);
      setRevenue(0);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-10 font-sans">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-8">
        <h2 className="text-2xl font-bold mb-8 text-center">Thống kê hệ thống</h2>
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="bg-blue-50 rounded-lg p-6 text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">{buyerCount}</div>
            <div className="text-lg text-gray-700">Buyer</div>
          </div>
          <div className="bg-green-50 rounded-lg p-6 text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">{sellerCount}</div>
            <div className="text-lg text-gray-700">Seller</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-6 text-center">
            <div className="text-4xl font-bold text-yellow-600 mb-2">{orderCount}</div>
            <div className="text-lg text-gray-700">Đơn hàng</div>
          </div>
          <div className="bg-red-50 rounded-lg p-6 text-center">
            <div className="text-4xl font-bold text-red-600 mb-2">{revenue.toLocaleString()} đ</div>
            <div className="text-lg text-gray-700">Doanh thu</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
