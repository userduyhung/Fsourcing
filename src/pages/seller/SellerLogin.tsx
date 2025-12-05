import React from 'react';
import { Link } from 'react-router-dom';

const SellerLogin: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-app">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4">Đăng nhập Seller</h2>
        <p className="text-gray-600">Chức năng đăng nhập tạm thời bị tắt. Vui lòng liên hệ quản trị hệ thống để được hỗ trợ.</p>
        <Link to="/" className="inline-block mt-6 bg-blue-600 text-white px-6 py-2 rounded">Về trang chủ</Link>
      </div>
    </div>
  );
};

export default SellerLogin;
