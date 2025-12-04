import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import authService from '../../services/authService';
import { logger } from '../../utils/logger';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleDemoClick = () => {
    setEmail('adminb2b@marketplace.com');
    setPassword('123456');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim() || !password) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      logger.info('AdminLogin', 'attempting admin login', { email });
      
      const response = await authService.login({ email, password });
      
      logger.debug('AdminLogin', 'login response', { 
        hasToken: !!response.token, 
        role: response.user?.role 
      });
      
      // Check if user is admin
      if (response.user?.role?.toLowerCase() !== 'admin') {
        setError('Tài khoản này không có quyền quản trị viên.');
        setIsLoading(false);
        return;
      }
      
      // Store auth data
      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('adminToken', response.token);
      }
      
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('userName', response.user.fullName || response.user.email || 'Admin');
        localStorage.setItem('userId', response.user.id);
        localStorage.setItem('userRole', 'admin');
      }
      
      window.dispatchEvent(new Event('userLoggedIn'));
      logger.info('AdminLogin', 'admin login successful, navigating to dashboard');
      navigate('/admin/dashboard');
      
    } catch (err: any) {
      logger.error('AdminLogin', 'login failed', err);
      setError(err.message || 'Email hoặc mật khẩu không đúng.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Đăng nhập Quản trị viên</h2>
          <p className="text-sm text-gray-500 mt-2">Truy cập trang quản trị hệ thống</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="Nhập email quản trị"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="Nhập mật khẩu"
            />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-base hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">Tài khoản demo quản trị:</h4>
          <div
            onClick={handleDemoClick}
            className="bg-white p-2 rounded border text-xs cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-colors"
            title="Click để tự động điền thông tin"
          >
            <span className="font-semibold text-blue-800">adminb2b@marketplace.com / 123456</span>
          </div>
          <p className="text-xs text-gray-600 mt-2 italic">💡 Click vào ô trên để tự động điền thông tin</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;