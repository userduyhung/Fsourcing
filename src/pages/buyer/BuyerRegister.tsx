import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Building, Phone, Globe } from 'lucide-react';
import authService from '../../services/authService';
import Toast from '../../components/Toast';
import { useApiToast } from '../../hooks/useApiToast';

const BuyerRegister: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    company: '',
    email: '',
    phone: '',
    country: 'Vietnam',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const { toast, showLoading, showSuccess, showError, hideToast } = useApiToast();
  const navigate = useNavigate();

  const countries = [
    'Vietnam', 'United States', 'China', 'Japan', 'South Korea', 'Singapore', 
    'Thailand', 'Malaysia', 'Indonesia', 'Philippines', 'India', 'Australia'
  ];

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Họ tên không được để trống';
    // Company is optional
    if (!formData.email.trim()) {
      newErrors.email = 'Email không được để trống';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Số điện thoại không được để trống';
    } else {
      const digits = formData.phone.replace(/\D/g, '');
      if (digits.length !== 10) newErrors.phone = 'Số điện thoại phải là 10 chữ số';
    }
    if (!formData.country) newErrors.country = 'Quốc gia không được để trống';
    if (!formData.password) {
      newErrors.password = 'Mật khẩu không được để trống';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu không khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    showLoading('Đang đăng ký...');

    try {
      // Call real API
      const response = await authService.register({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        company: formData.company,
        phone: formData.phone,
        country: formData.country,
        role: 'buyer'
      });

      console.log('==== BUYER REGISTER RESPONSE CHECK ====');
      console.log('Response:', response);
      console.log('Has success:', response.success);
      console.log('Has data:', !!response.data);
      console.log('Message:', response.message);
      console.log('=======================================');

      // Check if registration successful based on actual backend response
      // Backend returns: {success: true, message: "...", data: {id, email, role}}
      if (response.success === true || (response.data && response.data.id)) {
        // Show success toast
        setShowSuccessToast(true);
        showSuccess('Đăng ký thành công! Đang chuyển đến trang đăng nhập...');

        // Store credentials temporarily for auto-fill on login page
        sessionStorage.setItem('registeredEmail', formData.email);
        sessionStorage.setItem('registeredPassword', formData.password);
        // Also store full name so login can show the correct display name if backend doesn't return it immediately
        sessionStorage.setItem('registeredFullName', formData.fullName);

        // Wait 5 seconds before redirecting to login
        setTimeout(() => {
          navigate('/login');
        }, 5000);
      } else {
        showError(response.message || 'Đăng ký thất bại. Vui lòng thử lại.');
        setErrors({ email: response.message || 'Đăng ký thất bại. Vui lòng thử lại.' });
      }
    } catch (err) {
      if (err instanceof Error) {
        showError(err.message);
        setErrors({ email: err.message });
      } else {
        showError('Có lỗi xảy ra. Vui lòng thử lại.');
        setErrors({ email: 'Có lỗi xảy ra. Vui lòng thử lại.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target as HTMLInputElement;
    // Live-format phone: keep digits only, limit to 10
    if (name === 'phone') {
      const digits = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, phone: digits }));
      if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <>
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
      {showSuccessToast && (
        <Toast
          message="Đăng ký thành công! Đang chuyển đến trang đăng nhập..."
          type="success"
          duration={5000}
          onClose={() => setShowSuccessToast(false)}
        />
      )}
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-vn">
        <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center text-2xl font-bold text-blue-600 mb-6 font-heading">
            <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-2 text-sm font-heading">F</span>
            Fsourcing
          </Link>
          <h2 className="text-3xl font-extrabold text-gray-900 font-heading">Đăng ký tài khoản Buyer</h2>
          <p className="mt-2 text-sm text-gray-600 font-body">
            Tham gia sàn giao dịch để kết nối với nhà cung cấp toàn cầu
          </p>
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-xs text-yellow-800 font-body">
              ⚠️ <strong>Lưu ý:</strong> Hệ thống đang dùng in-memory database. Sau khi đăng ký thành công, hãy đăng nhập ngay lập tức. Nếu server restart, bạn cần đăng ký lại.
            </p>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errors.email && !errors.email.includes('thành công') && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600 text-sm font-body">{errors.email}</p>
              {errors.email.includes('đã được đăng ký') && (
                <Link to="/login" className="text-blue-600 hover:text-blue-500 text-sm font-medium mt-2 inline-block">
                  → Đăng nhập ngay
                </Link>
              )}
            </div>
          )}
            {errors.email && errors.email.includes('thành công') && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <p className="text-green-600 text-sm font-body">{errors.email}</p>
            </div>
          )}
          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 font-body">Họ và tên</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-body ${
                    errors.fullName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nhập họ và tên"
                />
              </div>
              {errors.fullName && <p className="text-red-500 text-xs mt-1 font-body">{errors.fullName}</p>}
            </div>

            {/* Company */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 font-body">Tên công ty <span className="text-gray-400 text-xs">(tùy chọn)</span></label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  name="company"
                  type="text"
                  value={formData.company}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-body ${
                    errors.company ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nhập tên công ty"
                />
              </div>
              {errors.company && <p className="text-red-500 text-xs mt-1 font-body">{errors.company}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 font-body">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-body ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nhập địa chỉ email"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1 font-body">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 font-body">Số điện thoại</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={10}
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-body ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0xxxxxxxxx"
                />
              </div>
              {errors.phone && <p className="text-red-500 text-xs mt-1 font-body">{errors.phone}</p>}
              {!errors.phone && <p className="text-gray-500 text-xs mt-1 font-body">Nhập 10 chữ số, ví dụ: 0912345678</p>}
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 font-body">Quốc gia</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-body ${
                    errors.country ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Chọn quốc gia</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
              {errors.country && <p className="text-red-500 text-xs mt-1 font-body">{errors.country}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 font-body">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-12 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-body ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Tạo mật khẩu"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1 font-body">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 font-body">Xác nhận mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-12 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-body ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nhập lại mật khẩu"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 font-body">{errors.confirmPassword}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-body"
          >
            {isLoading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600 font-body">
              Đã có tài khoản?{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 font-body">
                Đăng nhập tại đây
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
    </>
  );
};

export default BuyerRegister;