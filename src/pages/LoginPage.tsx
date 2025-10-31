import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

const demoCredentials = {
  buyer: { email: 'buyer@demo.com', password: 'demo123', name: 'John Buyer', role: 'buyer', dashboard: '/buyer/dashboard' },
  seller: { email: 'seller@demo.com', password: 'demo123', name: 'Demo Seller', role: 'seller', dashboard: '/seller/dashboard' }
};

const LoginPage: React.FC = () => {
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email không được để trống';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    if (!formData.password) {
      newErrors.password = 'Mật khẩu không được để trống';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setTimeout(() => {
      const cred = demoCredentials[role];
      if (formData.email === cred.email && formData.password === cred.password) {
        if (role === 'seller') {
          localStorage.setItem('sellerToken', 'mock-seller-token');
          localStorage.setItem('userName', cred.name);
          localStorage.setItem('userRole', cred.role);
        } else if (role === 'buyer') {
          localStorage.setItem('buyerToken', 'mock-buyer-token');
          localStorage.setItem('buyerProfile', JSON.stringify({
            id: 1,
            fullName: cred.name,
            company: 'ABC Manufacturing Co',
            email: cred.email,
            phone: '+1-555-0123',
            country: 'Vietnam',
            joinDate: '2024-01-15T00:00:00Z'
          }));
        } else if (role === 'supplier') {
          localStorage.setItem('supplierToken', 'mock-supplier-token');
          localStorage.setItem('userName', cred.name);
          localStorage.setItem('userRole', cred.role);
        }
        window.dispatchEvent(new Event('userLoggedIn'));
        setIsLoading(false);
        navigate(cred.dashboard);
      } else {
        setIsLoading(false);
        setErrors({ general: 'Email hoặc mật khẩu không đúng.' });
      }
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name] || errors.general) {
      setErrors(prev => ({ ...prev, [name]: '', general: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center text-2xl font-bold text-blue-600 mb-6 font-sans">
            <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-2 text-sm font-sans">F</span>
            Fsourcing
          </Link>
          <h2 className="text-3xl font-extrabold text-gray-900 font-sans">
            Đăng nhập {role === 'buyer' ? 'Buyer' : role === 'seller' ? 'Seller' : 'Supplier'}
          </h2>
          <p className="mt-2 text-sm text-gray-600 font-sans">
            {role === 'buyer' ? 'Chào Buyer! Vui lòng đăng nhập để tiếp tục.' : role === 'seller' ? 'Chào Seller! Vui lòng đăng nhập để tiếp tục.' : 'Chào Supplier! Vui lòng đăng nhập để tiếp tục.'}
          </p>
        </div>
        {/* Nút chọn role */}
        <div className="flex justify-center gap-2 mb-4">
          <button type="button" className={`px-4 py-2 rounded-lg font-semibold border font-sans ${role === 'buyer' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border-blue-600'}`} onClick={() => setRole('buyer')}>Buyer</button>
          <button type="button" className={`px-4 py-2 rounded-lg font-semibold border font-sans ${role === 'seller' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border-blue-600'}`} onClick={() => setRole('seller')}>Seller</button>
        </div>
        <form className="mt-4 space-y-6" onSubmit={handleSubmit}>
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600 text-sm font-sans">{errors.general}</p>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 font-sans">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Nhập email"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1 font-sans">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 font-sans">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-12 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Nhập mật khẩu"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1 font-sans">{errors.password}</p>}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 font-sans">
                Ghi nhớ đăng nhập
              </label>
            </div>
            <div className="text-sm">
              {role === 'buyer' && (
                <Link to="/buyer/forgot-password" className="font-medium text-blue-600 hover:text-blue-500 font-sans">Quên mật khẩu?</Link>
              )}
              {role === 'seller' && (
                <Link to="/seller/forgot-password" className="font-medium text-blue-600 hover:text-blue-500 font-sans">Quên mật khẩu?</Link>
              )}
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-sans"
          >
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>

          {/* Nút đăng nhập với tư cách Admin luôn hiển thị */}
          <div className="w-full flex justify-center mt-2">
            <button
              type="button"
              onClick={() => navigate('/admin/login')}
              className="w-full py-2 px-4 border border-blue-600 text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-sans"
            >
              Đăng nhập với tư cách Admin
            </button>
          </div>

          <div className="text-center space-y-2">
            {role === 'buyer' && (
              <p className="text-sm text-gray-600 font-sans">
                Chưa có tài khoản Buyer?{' '}
                <Link to="/buyer/register" className="font-medium text-blue-600 hover:text-blue-500 font-sans">Đăng ký ngay</Link>
              </p>
            )}
            {role === 'seller' && (
              <p className="text-sm text-gray-600 font-sans">
                Chưa có tài khoản Seller?{' '}
                <Link to="/seller/register" className="font-medium text-blue-600 hover:text-blue-500 font-sans">Đăng ký ngay</Link>
              </p>
            )}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-800 font-semibold font-sans">Demo Credentials:</p>
              <p className="text-xs text-blue-700 font-sans">Email: {demoCredentials[role].email}</p>
              <p className="text-xs text-blue-700 font-sans">Password: {demoCredentials[role].password}</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
