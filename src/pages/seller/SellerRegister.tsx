import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User } from 'lucide-react';

const SellerRegister: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password || !company || !name) {
      setError('Vui lòng nhập đầy đủ thông tin.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      // Mock register
      localStorage.setItem('sellerToken', 'mock-seller-token');
      localStorage.setItem('userName', name);
      localStorage.setItem('userRole', 'seller');
      localStorage.setItem('sellerProfile', JSON.stringify({
        name,
        company,
        email
      }));
      window.dispatchEvent(new Event('userLoggedIn'));
      navigate('/seller/dashboard');
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Đăng ký Seller</h2>
        {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Tên</label>
          <div className="flex items-center border rounded px-3 py-2">
            <User className="w-5 h-5 text-gray-400 mr-2" />
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full outline-none" placeholder="Tên Seller" />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Công ty</label>
          <div className="flex items-center border rounded px-3 py-2">
            <User className="w-5 h-5 text-gray-400 mr-2" />
            <input type="text" value={company} onChange={e => setCompany(e.target.value)} className="w-full outline-none" placeholder="Tên công ty" />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Email</label>
          <div className="flex items-center border rounded px-3 py-2">
            <Mail className="w-5 h-5 text-gray-400 mr-2" />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full outline-none" placeholder="seller@demo.com" />
          </div>
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Mật khẩu</label>
          <div className="flex items-center border rounded px-3 py-2">
            <Lock className="w-5 h-5 text-gray-400 mr-2" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full outline-none" placeholder="Mật khẩu" />
          </div>
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition-colors" disabled={isLoading}>
          {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
        </button>
        <div className="mt-4 flex justify-between text-sm">
          <Link to="/seller/login" className="text-blue-600 hover:underline">Đã có tài khoản? Đăng nhập</Link>
        </div>
      </form>
    </div>
  );
};

export default SellerRegister;
