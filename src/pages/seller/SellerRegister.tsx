
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User } from 'lucide-react';

const SellerRegister: React.FC = () => {
  const [company, setCompany] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!company.trim() || !contactName.trim() || !email.trim() || !password) {
      setError('Vui lòng nhập đầy đủ thông tin.');
      return;
    }
    // Kiểm tra email cơ bản
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Vui lòng nhập email hợp lệ.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      // Mock đăng ký seller/supplier
      localStorage.setItem('sellerToken', 'mock-seller-token');
      localStorage.setItem('userName', contactName);
      localStorage.setItem('userRole', 'seller');
      localStorage.setItem('sellerProfile', JSON.stringify({
        contactName,
        company,
        email
      }));
      window.dispatchEvent(new Event('userLoggedIn'));
      navigate('/seller/dashboard');
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Đăng ký Seller / Supplier</h2>
        <p className="text-sm text-gray-500 mb-6 text-center">Đăng ký công ty để bắt đầu bán hàng và kết nối với khách mua.</p>
        {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Tên công ty</label>
          <div className="flex items-center border rounded px-3 py-2">
            <User className="w-5 h-5 text-gray-400 mr-2" />
            <input type="text" value={company} onChange={e => setCompany(e.target.value)} className="w-full outline-none" placeholder="Tên công ty hoặc nhà máy" />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Người liên hệ</label>
          <div className="flex items-center border rounded px-3 py-2">
            <User className="w-5 h-5 text-gray-400 mr-2" />
            <input type="text" value={contactName} onChange={e => setContactName(e.target.value)} className="w-full outline-none" placeholder="Họ và tên" />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Email liên hệ</label>
          <div className="flex items-center border rounded px-3 py-2">
            <Mail className="w-5 h-5 text-gray-400 mr-2" />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full outline-none" placeholder="Địa chỉ email" />
          </div>
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Mật khẩu</label>
          <div className="flex items-center border rounded px-3 py-2">
            <Lock className="w-5 h-5 text-gray-400 mr-2" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full outline-none" placeholder="Chọn mật khẩu bảo mật" />
          </div>
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition-colors" disabled={isLoading}>
          {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
        </button>
        <div className="mt-4 flex justify-between text-sm">
          <Link to="/seller/login" className="text-blue-600 hover:underline">Đã có tài khoản? Đăng nhập</Link>
        </div>
        <div className="mt-6 text-sm text-gray-500 text-center">Đăng ký seller/supplier sẽ được xác minh trước khi kích hoạt.</div>
      </form>
    </div>
  );
};

export default SellerRegister;
