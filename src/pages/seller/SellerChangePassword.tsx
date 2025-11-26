import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock } from 'lucide-react';

const SellerChangePassword: React.FC = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!oldPassword || !newPassword) {
      setError('Vui lòng nhập đủ thông tin.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      // Mock change password
      setMessage('Mật khẩu đã được thay đổi thành công!');
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-app">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Đổi mật khẩu Seller</h2>
        {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
        {message && <div className="text-green-600 mb-4 text-center">{message}</div>}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Mật khẩu cũ</label>
          <div className="flex items-center border rounded px-3 py-2">
            <Lock className="w-5 h-5 text-gray-400 mr-2" />
            <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} className="w-full outline-none" placeholder="Mật khẩu cũ" />
          </div>
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Mật khẩu mới</label>
          <div className="flex items-center border rounded px-3 py-2">
            <Lock className="w-5 h-5 text-gray-400 mr-2" />
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full outline-none" placeholder="Mật khẩu mới" />
          </div>
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition-colors" disabled={isLoading}>
          {isLoading ? 'Đang đổi...' : 'Đổi mật khẩu'}
        </button>
        <div className="mt-4 flex justify-between text-sm">
          <Link to="/seller/login" className="text-blue-600 hover:underline">Quay lại đăng nhập</Link>
        </div>
      </form>
    </div>
  );
};

export default SellerChangePassword;
