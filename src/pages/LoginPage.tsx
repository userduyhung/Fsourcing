import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import authService from '../services/authService';
import { buyerService } from '../services/buyerService';

const LoginPage: React.FC = () => {
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as any)?.from?.pathname || '/';

  useEffect(() => {
    // Prefill credentials if user just registered
    try {
      const justRegistered = sessionStorage.getItem('justRegistered');
      const regEmail = sessionStorage.getItem('registeredEmail');
      const regPassword = sessionStorage.getItem('registeredPassword');
      if (justRegistered === 'seller' && regEmail) {
        setRole('seller');
        setFormData({ email: regEmail, password: regPassword || '' });
      } else if (justRegistered === 'buyer' && regEmail) {
        // buyer is default role but prefill credentials
        setRole('buyer');
        setFormData({ email: regEmail, password: regPassword || '' });
      }
    } catch (e) {
      // ignore
    }
  }, []);

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
    try {
      // proceed to call backend login

      const resp = await authService.login({ email: formData.email, password: formData.password });
      // authService returns normalized response with token and user
      if (resp && resp.user) {
        // Prefer role returned by backend; fall back to UI selected role
        const roleFromRespRaw = resp.user.role;
        const roleFromResp = (roleFromRespRaw || role || '').toString().toLowerCase();
        const token = resp.token || '';

        // Determine display name: prefer fullName from response, then registeredFullName (from recent register).
        // Do NOT fall back to the user's email — avoid showing email as the display name in the header.
        const registeredFullName = sessionStorage.getItem('registeredFullName') || '';
        const displayName = resp.user.fullName || registeredFullName || '';

        // Ensure we always set a non-empty userName so App.tsx can detect session.
        const fallbackName = roleFromResp === 'buyer' ? 'Buyer' : roleFromResp === 'seller' ? 'Seller' : 'User';
        localStorage.setItem('userName', displayName || fallbackName);
        localStorage.setItem('userRole', roleFromResp || 'buyer');

        // Decide redirects based on role and whether the user just registered
        const justRegistered = sessionStorage.getItem('justRegistered');

        if (roleFromResp === 'buyer') {
          localStorage.setItem('buyerToken', token);
          // Attempt to fetch buyer profile to obtain authoritative name
          try {
            const profile = await buyerService.getProfile();
            const fullName = profile?.name && profile.name.trim() !== '' ? profile.name.trim() : (resp.user.fullName && !resp.user.fullName.includes('@') ? resp.user.fullName.trim() : '');
            localStorage.setItem('buyerProfile', JSON.stringify({
              id: resp.user.id,
              fullName: fullName || '',
              company: profile?.companyName || resp.user.company || '',
              email: resp.user.email,
              phone: profile?.phone || resp.user.phone || '',
              country: profile?.country || resp.user.country || '',
              joinDate: resp.user.joinDate || new Date().toISOString()
            }));
            localStorage.setItem('userName', fullName || 'Buyer');
          } catch (err) {
            // If profile fetch fails, fall back to response.fullName if it's not an email, else role fallback
            const fallback = (resp.user.fullName && !resp.user.fullName.includes('@')) ? resp.user.fullName : 'Buyer';
            localStorage.setItem('buyerProfile', JSON.stringify({
              id: resp.user.id,
              fullName: (resp.user.fullName && !resp.user.fullName.includes('@')) ? resp.user.fullName : '',
              company: resp.user.company,
              email: resp.user.email,
              phone: resp.user.phone,
              country: resp.user.country,
              joinDate: resp.user.joinDate || new Date().toISOString()
            }));
            localStorage.setItem('userName', fallback);
          }
          window.dispatchEvent(new Event('userLoggedIn'));
          // If user just registered as buyer, redirect to buyer profile to complete it
          const justRegistered = sessionStorage.getItem('justRegistered');
          if (justRegistered === 'buyer') {
            // cleanup temp data
            sessionStorage.removeItem('registeredEmail');
            sessionStorage.removeItem('registeredPassword');
            sessionStorage.removeItem('registeredFullName');
            sessionStorage.removeItem('justRegistered');
            try { localStorage.setItem('userEmail', resp.user.email || formData.email); } catch {}
            setIsLoading(false);
            navigate('/buyer/profile', { state: { isFirstLogin: true } });
          } else {
            // clean up any registration temp data
            sessionStorage.removeItem('registeredEmail');
            sessionStorage.removeItem('registeredPassword');
            sessionStorage.removeItem('registeredFullName');
            sessionStorage.removeItem('justRegistered');
            // persist email for older dashboard flows
            try { localStorage.setItem('userEmail', resp.user.email || formData.email); } catch {}
            navigate(redirectTo);
          }
        } else if (roleFromResp === 'seller') {
          localStorage.setItem('sellerToken', token);
          // Try to fetch seller profile to get authoritative company/contact name
          try {
            const sellerResp = await (await import('../services/apiClient')).default.client.get('/Profile/seller');
            const data = sellerResp?.data?.data || {};
            const companyName = data.companyName || data.CompanyName || resp.user.company || resp.user.fullName || '';
            const contactName = data.contactName || data.ContactName || resp.user.fullName || '';
            const normalized = {
              id: resp.user.id,
              companyName,
              contactName,
              fullName: resp.user.fullName || '',
              email: resp.user.email,
              phone: data.phone || data.Phone || resp.user.phone || '',
              country: data.country || data.Country || resp.user.country || '',
              address: data.address || data.Address || ''
            };
            localStorage.setItem('sellerProfile', JSON.stringify(normalized));
            // Prefer company name for header, fall back to contactName
            const sellerDisplay = companyName || contactName || 'Seller';
            localStorage.setItem('userName', sellerDisplay);
          } catch (err) {
            // fallback to response.user values if profile fetch fails
            const fallbackCompany = resp.user.company || resp.user.fullName || '';
            const normalized = {
              id: resp.user.id,
              companyName: fallbackCompany,
              contactName: resp.user.fullName || '',
              fullName: resp.user.fullName || '',
              email: resp.user.email,
              phone: resp.user.phone,
              country: resp.user.country,
              address: ''
            };
            localStorage.setItem('sellerProfile', JSON.stringify(normalized));
            localStorage.setItem('userName', fallbackCompany || 'Seller');
          }
          // One-time redirect for sellers: if not yet redirected, send to add-product
          const firstSellerRedirect = localStorage.getItem('sellerFirstLoginRedirectDone');
          window.dispatchEvent(new Event('userLoggedIn'));
          setIsLoading(false);
          // If the user just registered as a seller, send them to profile to complete company info
          if (justRegistered === 'seller') {
            sessionStorage.removeItem('registeredEmail');
            sessionStorage.removeItem('registeredPassword');
            sessionStorage.removeItem('registeredFullName');
            sessionStorage.removeItem('justRegistered');
            try { localStorage.setItem('userEmail', resp.user.email || formData.email); } catch {}
            navigate('/seller/profile', { state: { isFirstLogin: true } });
          } else if (!firstSellerRedirect) {
            localStorage.setItem('sellerFirstLoginRedirectDone', '1');
            navigate('/seller/add-product');
          } else {
            try { localStorage.setItem('userEmail', resp.user.email || formData.email); } catch {}
            navigate(redirectTo);
          }
        } else if (roleFromResp === 'admin') {
          localStorage.setItem('adminToken', token);
          window.dispatchEvent(new Event('userLoggedIn'));
          navigate(redirectTo);
        } else {
          // default redirect
          window.dispatchEvent(new Event('userLoggedIn'));
          navigate('/');
        }
        setIsLoading(false);
      } else {
        setIsLoading(false);
        setErrors({ general: 'Email hoặc mật khẩu không đúng.' });
      }
    } catch (err: any) {
      setIsLoading(false);
      const msg = err?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
      setErrors({ general: msg });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name] || errors.general) {
      setErrors(prev => ({ ...prev, [name]: '', general: '' }));
    }
  };

  // no demo autofill

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
            {/* demo credentials removed */}
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
