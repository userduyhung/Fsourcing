import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Building2, FileText, Globe } from 'lucide-react';
import authService from '../../services/authService';
import Toast from '../../components/Toast';
import { useApiToast } from '../../hooks/useApiToast';
import { logger } from '../../utils/logger';

const SellerRegister: React.FC = () => {
  // Step 1: Account Registration
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Step 2: Seller Profile (Required fields)
  const [companyName, setCompanyName] = useState('');
  const [legalRepresentative, setLegalRepresentative] = useState('');
  const [taxId, setTaxId] = useState('');
  const [country, setCountry] = useState('');
  
  // Step 2: Seller Profile (Optional fields)
  const [industry, setIndustry] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [city, setCity] = useState('');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const { toast, showLoading, showSuccess, showError, hideToast } = useApiToast();
  const navigate = useNavigate();

  const countries = [
    'Vietnam', 'United States', 'China', 'Japan', 'South Korea', 'Singapore',
    'Thailand', 'Malaysia', 'Indonesia', 'Philippines', 'India', 'Australia'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate Step 1: Account fields
    if (!email.trim() || !password) {
      setError('Vui lòng nhập email và mật khẩu.');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Vui lòng nhập email hợp lệ.');
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    // Validate Step 2: Required Seller Profile fields
    if (!companyName.trim()) {
      setError('Vui lòng nhập tên công ty.');
      return;
    }
    if (!legalRepresentative.trim()) {
      setError('Vui lòng nhập tên người đại diện pháp luật.');
      return;
    }
    if (!taxId.trim()) {
      setError('Vui lòng nhập mã số thuế.');
      return;
    }
    if (!country) {
      setError('Vui lòng chọn quốc gia.');
      return;
    }

    setIsLoading(true);
    showLoading('Đang đăng ký Seller...');

    try {
      // Step 1: Register account
      logger.debug('SellerRegister', 'Registering account', { email });
      const response = await authService.register({
        email,
        password,
        role: 'seller'
      });

      logger.debug('SellerRegister', 'Account registered', { success: !!response.success });

      // Check if registration successful
      const r: any = response as any;
      const registeredId = r?.user?.id || r?.data?.id || r?.data?.user?.id || r?.id;
      
      if (response.success === true || registeredId) {
        // Store token and user info to localStorage
        const token = response.token || response.data?.token;
        if (token) {
          localStorage.setItem('sellerToken', token);
          localStorage.setItem('token', token);
          localStorage.setItem('authToken', token);
        }
        localStorage.setItem('userName', email);
        localStorage.setItem('role', 'seller');
        localStorage.setItem('userRole', 'seller');
        if (registeredId) {
          localStorage.setItem('userId', String(registeredId));
        }

        // Show success message
        setShowSuccessToast(true);
        showSuccess('Đăng ký Seller thành công! Đang chuyển đến trang chỉnh sửa hồ sơ...');

        // Redirect to profile edit page immediately
        setTimeout(() => {
          navigate('/seller/profile', { 
            state: { isFirstLogin: true, message: 'Chào mừng! Vui lòng điền đầy đủ thông tin hồ sơ để hoàn thành đăng ký.' } 
          });
        }, 2000);
      } else {
        showError(response.message || 'Đăng ký thất bại. Vui lòng thử lại.');
        setError(response.message || 'Đăng ký thất bại. Vui lòng thử lại.');
      }
    } catch (err) {
      if (err instanceof Error) {
        showError(err.message);
        setError(err.message);
      } else {
        showError('Có lỗi xảy ra. Vui lòng thử lại.');
        setError('Có lỗi xảy ra. Vui lòng thử lại.');
      }
    } finally {
      setIsLoading(false);
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
          message="Đăng ký Seller thành công! Đang chuyển đến trang đăng nhập..."
          type="success"
          duration={5000}
          onClose={() => setShowSuccessToast(false)}
        />
      )}
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4 font-body">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold mb-3 text-gray-900 font-heading">Đăng ký Seller</h2>
            <p className="text-sm text-gray-600 font-body">Đăng ký công ty để bắt đầu bán hàng và kết nối với khách mua</p>
          </div>
        
          {error && !error.includes('thành công') && (
            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 mb-6 animate-fade-in">
              <p className="text-red-700 text-sm font-medium font-body">⚠ {error}</p>
            </div>
          )}
          {error && error.includes('thành công') && (
            <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 mb-6 animate-fade-in">
              <p className="text-green-700 text-sm font-medium font-body">✓ {error}</p>
            </div>
          )}

          {/* Step 1: Account Information */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <span className="bg-blue-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm mr-2">1</span>
              Thông tin tài khoản
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2 font-semibold text-sm font-body">Email <span className="text-red-500">*</span></label>
                <div className="flex items-center border-2 border-gray-200 rounded-xl px-4 py-3 focus-within:border-blue-500 transition-all hover:border-gray-300">
                  <Mail className="w-5 h-5 text-gray-400 mr-3" />
                  <input 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    className="w-full outline-none font-body" 
                    placeholder="email@company.com" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-semibold text-sm font-body">Mật khẩu <span className="text-red-500">*</span></label>
                <div className="flex items-center border-2 border-gray-200 rounded-xl px-4 py-3 focus-within:border-blue-500 transition-all hover:border-gray-300">
                  <Lock className="w-5 h-5 text-gray-400 mr-3" />
                  <input 
                    type="password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    className="w-full outline-none font-body" 
                    placeholder="Tối thiểu 6 ký tự" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Company Information */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <span className="bg-purple-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm mr-2">2</span>
              Thông tin công ty
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2 font-semibold text-sm font-body">Tên công ty <span className="text-red-500">*</span></label>
                  <div className="flex items-center border-2 border-gray-200 rounded-xl px-4 py-3 focus-within:border-purple-500 transition-all hover:border-gray-300">
                    <Building2 className="w-5 h-5 text-gray-400 mr-3" />
                    <input 
                      type="text" 
                      value={companyName} 
                      onChange={e => setCompanyName(e.target.value)} 
                      className="w-full outline-none font-body" 
                      placeholder="Tên công ty" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2 font-semibold text-sm font-body">Người đại diện pháp luật <span className="text-red-500">*</span></label>
                  <div className="flex items-center border-2 border-gray-200 rounded-xl px-4 py-3 focus-within:border-purple-500 transition-all hover:border-gray-300">
                    <User className="w-5 h-5 text-gray-400 mr-3" />
                    <input 
                      type="text" 
                      value={legalRepresentative} 
                      onChange={e => setLegalRepresentative(e.target.value)} 
                      className="w-full outline-none font-body" 
                      placeholder="Họ và tên" 
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2 font-semibold text-sm font-body">Mã số thuế <span className="text-red-500">*</span></label>
                  <div className="flex items-center border-2 border-gray-200 rounded-xl px-4 py-3 focus-within:border-purple-500 transition-all hover:border-gray-300">
                    <FileText className="w-5 h-5 text-gray-400 mr-3" />
                    <input 
                      type="text" 
                      value={taxId} 
                      onChange={e => setTaxId(e.target.value)} 
                      className="w-full outline-none font-body" 
                      placeholder="MST/Tax ID" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2 font-semibold text-sm font-body">Quốc gia <span className="text-red-500">*</span></label>
                  <div className="flex items-center border-2 border-gray-200 rounded-xl px-4 py-3 focus-within:border-purple-500 transition-all hover:border-gray-300">
                    <Globe className="w-5 h-5 text-gray-400 mr-3" />
                    <select 
                      value={country} 
                      onChange={e => setCountry(e.target.value)} 
                      className="w-full outline-none font-body bg-transparent"
                    >
                      <option value="">Chọn quốc gia</option>
                      {countries.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2 font-semibold text-sm font-body">Ngành nghề (tùy chọn)</label>
                  <div className="flex items-center border-2 border-gray-200 rounded-xl px-4 py-3 focus-within:border-purple-500 transition-all hover:border-gray-300">
                    <Building2 className="w-5 h-5 text-gray-400 mr-3" />
                    <input 
                      type="text" 
                      value={industry} 
                      onChange={e => setIndustry(e.target.value)} 
                      className="w-full outline-none font-body" 
                      placeholder="Ví dụ: Thực phẩm" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2 font-semibold text-sm font-body">Thành phố (tùy chọn)</label>
                  <div className="flex items-center border-2 border-gray-200 rounded-xl px-4 py-3 focus-within:border-purple-500 transition-all hover:border-gray-300">
                    <Globe className="w-5 h-5 text-gray-400 mr-3" />
                    <input 
                      type="text" 
                      value={city} 
                      onChange={e => setCity(e.target.value)} 
                      className="w-full outline-none font-body" 
                      placeholder="Tên thành phố" 
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-semibold text-sm font-body">Website (tùy chọn)</label>
                <div className="flex items-center border-2 border-gray-200 rounded-xl px-4 py-3 focus-within:border-purple-500 transition-all hover:border-gray-300">
                  <Globe className="w-5 h-5 text-gray-400 mr-3" />
                  <input 
                    type="url" 
                    value={website} 
                    onChange={e => setWebsite(e.target.value)} 
                    className="w-full outline-none font-body" 
                    placeholder="https://company.com" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-semibold text-sm font-body">Mô tả công ty (tùy chọn)</label>
                <textarea 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  rows={3}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-purple-500 transition-all hover:border-gray-300 font-body" 
                  placeholder="Giới thiệu ngắn về công ty..."
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed font-body" 
            disabled={isLoading}
          >
            {isLoading ? 'Đang đăng ký...' : 'Đăng ký Seller'}
          </button>

          <div className="mt-6 flex justify-between text-sm">
            <Link to="/login" className="text-blue-600 hover:underline font-semibold font-body">
              Đã có tài khoản? Đăng nhập
            </Link>
          </div>

          <div className="mt-6 text-xs text-gray-500 text-center font-body bg-gray-50 rounded-lg p-4">
            <p className="font-semibold mb-1">📋 Lưu ý:</p>
            <p>Tài khoản seller cần được xác minh trước khi có thể đăng sản phẩm.</p>
            <p className="mt-1">Các thông tin có dấu <span className="text-red-500">*</span> là bắt buộc.</p>
          </div>
        </form>
      </div>
    </>
  );
};

export default SellerRegister;
