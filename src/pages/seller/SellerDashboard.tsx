import React from 'react';
import { Link } from 'react-router-dom';
import { FaUserCircle, FaBoxOpen, FaClipboardList, FaBell } from 'react-icons/fa';

const SellerDashboard: React.FC = () => {
  // Dữ liệu demo
  const sellerInfo = {
    name: 'Công ty Sản xuất Demo',
    email: 'seller@demo.com',
    products: 12,
    orders: 5,
    notifications: 3
  };

  return (
    <div className="bg-[#f8ecd7] min-h-screen font-sans">
      <div className="max-w-4xl mx-auto py-10">
  <h2 className="text-2xl font-bold mb-6">Bảng điều khiển Người bán</h2>
        <div className="mb-8 bg-white rounded-lg shadow p-6 flex flex-col sm:flex-row items-center justify-between">
          <div>
            <div className="font-semibold text-lg">{sellerInfo.name}</div>
            <div className="text-gray-600 text-sm">Email: {sellerInfo.email}</div>
          </div>
          <div className="flex gap-6 mt-4 sm:mt-0">
            <div className="text-center">
              <div className="font-bold text-blue-600 text-xl">{sellerInfo.products}</div>
              <div className="text-xs text-gray-500">Sản phẩm đang bán</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-green-600 text-xl">{sellerInfo.orders}</div>
              <div className="text-xs text-gray-500">Đơn hàng đã bán</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-red-600 text-xl">{sellerInfo.notifications}</div>
              <div className="text-xs text-gray-500">Thông báo mới</div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
            <FaUserCircle className="w-16 h-16 mb-4 text-blue-400" />
            <h3 className="font-semibold text-lg mb-2">Thông tin cá nhân</h3>
            <Link to="/seller/profile" className="text-blue-600 hover:underline">Xem chi tiết</Link>
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
            <FaBoxOpen className="w-16 h-16 mb-4 text-green-400" />
            <h3 className="font-semibold text-lg mb-2">Quản lý sản phẩm</h3>
            <Link to="/seller/products" className="text-blue-600 hover:underline">Xem danh sách sản phẩm</Link>
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
            <FaClipboardList className="w-16 h-16 mb-4 text-orange-400" />
            <h3 className="font-semibold text-lg mb-2">Quản lý đơn hàng</h3>
            <Link to="/seller/orders" className="text-blue-600 hover:underline">Xem danh sách đơn hàng</Link>
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
            <FaBell className="w-16 h-16 mb-4 text-red-400" />
            <h3 className="font-semibold text-lg mb-2">Thông báo mới</h3>
            <Link to="/seller/notifications" className="text-blue-600 hover:underline">Xem tất cả thông báo</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
