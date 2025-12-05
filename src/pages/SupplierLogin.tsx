import React from 'react';
import { Link } from 'react-router-dom';

const SupplierLogin: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-app">
      <div className="bg-white rounded-lg shadow-lg p-10 max-w-md mx-auto text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Đăng nhập Supplier</h2>
        <p className="text-gray-600 mb-6">Chức năng đăng nhập tạm thời bị tắt. Vui lòng liên hệ quản trị hệ thống để được hỗ trợ.</p>
        <Link to="/" className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded">Về trang chủ</Link>
      </div>
    </div>
  );
};

export default SupplierLogin;
