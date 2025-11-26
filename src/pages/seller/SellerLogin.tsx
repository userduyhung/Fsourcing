import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';

const SellerLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Vui lòng nhập email và mật khẩu.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      if (email === 'seller@demo.com' && password === 'demo123') {
        localStorage.setItem('sellerToken', 'mock-seller-token');
        localStorage.setItem('userName', 'Demo Seller');
        localStorage.setItem('userRole', 'seller');
        window.dispatchEvent(new Event('userLoggedIn'));
        navigate('/seller/dashboard');
      } else {
        setError('Email hoặc mật khẩu không đúng.');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-app">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Đăng nhập Seller</h2>
        {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
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
          {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
        <div className="mt-4 flex justify-between text-sm">
          <Link to="/seller/forgot-password" className="text-blue-600 hover:underline">Quên mật khẩu?</Link>
          <Link to="/seller/register" className="text-blue-600 hover:underline">Đăng ký Seller</Link>
        </div>
      </form>
    </div>
  );
};

export default SellerLogin;
