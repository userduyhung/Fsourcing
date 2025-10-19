import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail } from 'lucide-react';

const SellerForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!email.trim()) {
      setError('Vui lòng nhập email.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setMessage('Nếu email tồn tại, hướng dẫn đặt lại mật khẩu đã được gửi.');
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Quên mật khẩu Seller</h2>
        {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
        {message && <div className="text-green-600 mb-4 text-center">{message}</div>}
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Email</label>
          <div className="flex items-center border rounded px-3 py-2">
            <Mail className="w-5 h-5 text-gray-400 mr-2" />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full outline-none" placeholder="seller@demo.com" />
          </div>
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition-colors" disabled={isLoading}>
          {isLoading ? 'Đang gửi...' : 'Gửi hướng dẫn đặt lại mật khẩu'}
        </button>
        <div className="mt-4 flex justify-between text-sm">
          <Link to="/seller/login" className="text-blue-600 hover:underline">Quay lại đăng nhập</Link>
        </div>
      </form>
    </div>
  );
};

export default SellerForgotPassword;
