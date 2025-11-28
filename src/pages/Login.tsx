import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import authService from '../services/authService';
// DebugLogger removed - use console.log for debugging
import Toast from '../components/Toast';
import { useApiToast } from '../hooks/useApiToast';

const Login: React.FC = () => {
  // Auto-fill from registration if available
  const registeredEmail = sessionStorage.getItem('registeredEmail') || '';
  const registeredPassword = sessionStorage.getItem('registeredPassword') || '';

  console.log('==== LOGIN COMPONENT MOUNTED ====');
  console.log('Registered email from session:', registeredEmail);
  console.log('Registered password from session:', registeredPassword ? '***' : 'none');
  console.log('=================================');

  const [email, setEmail] = useState(registeredEmail);
  const [password, setPassword] = useState(registeredPassword);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast, showLoading, showSuccess, showError, hideToast } = useApiToast();
  const navigate = useNavigate();
  const location = useLocation();
  const fromLocation = (location.state as any)?.from;

  const navigateAfterLogin = (target: any) => {
    if (!target) {
      navigate('/');
      return;
    }
    if (typeof target === 'string') {
      navigate(target);
      return;
    }
    // target is expected to be { pathname, state }
    if (target && target.pathname) {
      navigate(target.pathname, { state: target.state });
      return;
    }
    navigate('/');
  };

  // Clear session storage and error state after auto-fill
  React.useEffect(() => {
    console.log('==== useEffect RUNNING ====');

    // Only clear on mount, not on every render
    const savedEmail = sessionStorage.getItem('registeredEmail');
    const savedPassword = sessionStorage.getItem('registeredPassword');

    console.log('Saved email:', savedEmail);
    console.log('Saved password:', savedPassword ? '***' : 'none');

    if (savedEmail || savedPassword) {
      console.log('Clearing sessionStorage...');
      sessionStorage.removeItem('registeredEmail');
      sessionStorage.removeItem('registeredPassword');
      setError(''); // Clear any previous error
      console.log('SessionStorage cleared, error state cleared');
    }
    console.log('==========================');
  }, []); // Run only once on mount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    console.log('==== LOGIN FORM SUBMIT ====');
    console.log('Email from form:', email);
    console.log('Password from form:', password);
    console.log('==========================');

    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    showLoading('Đang đăng nhập...');

    try {
      console.log('==== CALLING AUTH SERVICE ====');
      // Call real API
      const response = await authService.login({ email, password });

      console.log('==== LOGIN RESPONSE RECEIVED ====');
      console.log('Full response:', response);
      console.log('Has user:', !!response.user);
      console.log('Has token:', !!response.token);
      console.log('=================================');

      // Store user data based on role
      if (response.user) {
        // Normalize role to a string; default to empty string if missing
        const role = (response.user.role || '').toLowerCase();
        const token = response.token || 'auth-token';

        console.log('==== PROCESSING USER DATA ====');
        console.log('User role:', role);
        console.log('Token:', token);
        console.log('User object:', response.user);
        console.log('==============================');

        showSuccess('Đăng nhập thành công!');

        // Store common data
        localStorage.setItem('userName', response.user.fullName || response.user.email);
        localStorage.setItem('userRole', role ?? '');

        console.log('Stored userName:', response.user.fullName || response.user.email);
        console.log('Stored userRole:', role);

        // Store role-specific token and profile
        if (role === 'admin') {
          console.log('Redirecting to admin dashboard...');
          localStorage.setItem('adminToken', token);
          window.dispatchEvent(new Event('userLoggedIn'));
          setTimeout(() => navigate('/admin/dashboard'), 1000);
        } else if (role === 'buyer') {
          console.log('Redirecting to home for buyer...');
          const buyerProfile = {
            id: response.user.id,
            fullName: response.user.fullName,
            company: response.user.company,
            email: response.user.email,
            phone: response.user.phone,
            country: response.user.country,
            joinDate: response.user.joinDate || new Date().toISOString()
          };
          console.log('Buyer profile:', buyerProfile);
          localStorage.setItem('buyerToken', token);
          localStorage.setItem('buyerProfile', JSON.stringify(buyerProfile));
          window.dispatchEvent(new Event('userLoggedIn'));
          setTimeout(() => navigateAfterLogin(fromLocation), 1000);
        } else if (role === 'seller') {
          console.log('Redirecting to seller dashboard...');
          const sellerProfile = {
            id: response.user.id,
            companyName: response.user.company || response.user.fullName,
            contactName: response.user.fullName,
            fullName: response.user.fullName,
            email: response.user.email,
            phone: response.user.phone,
            country: response.user.country,
            joinDate: response.user.joinDate || new Date().toISOString()
          };
          console.log('Seller profile:', sellerProfile);
          localStorage.setItem('sellerToken', token);
          localStorage.setItem('sellerProfile', JSON.stringify(sellerProfile));
          window.dispatchEvent(new Event('userLoggedIn'));
          // Redirect sellers directly to their dashboard
          setTimeout(() => navigate('/seller/dashboard'), 600);
        } else {
          console.error('Unknown role:', role);
          showError('Unknown user role.');
          setError('Unknown user role.');
        }
      } else {
        console.error('No user in response!');
        showError('Invalid response from server.');
        setError('Invalid response from server.');
      }
    } catch (err) {
      console.error('==== LOGIN ERROR CAUGHT ====');
      console.error('Error:', err);
      console.error('Error type:', typeof err);
      console.error('============================');

      if (err instanceof Error) {
        console.error('Error message:', err.message);
        console.error('Error stack:', err.stack);
        showError(err.message);
        setError(err.message);
      } else {
        console.error('Unknown error type:', err);
        showError('An error occurred. Please try again.');
        setError('An error occurred. Please try again.');
      }
    } finally {
      console.log('Login process finished, isLoading set to false');
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* DebugLogger removed */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
      <div className="min-h-screen flex items-center justify-center bg-app py-12 px-4">
        <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center text-2xl font-bold text-blue-600 mb-6 font-sans">
            <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-2 text-sm">F</span>
            Fsourcing
          </Link>
          <h2 className="text-3xl font-extrabold text-gray-900 font-sans">Sign in to your account</h2>
          <p className="mt-2 text-sm text-gray-600 font-sans">
            Welcome back! Please sign in to continue
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {registeredEmail && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <p className="text-green-600 text-sm font-sans">
                ✓ Đăng ký thành công! Thông tin đăng nhập đã được điền sẵn. Nhấn "Sign in" để tiếp tục.
              </p>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600 text-sm font-sans">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 font-sans">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 font-sans">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
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
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link to="/buyer/forgot-password" className="font-medium text-blue-600 hover:text-blue-500 font-sans">
                Forgot your password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            onClick={(e) => {
              console.log('==== SIGN IN BUTTON CLICKED ====');
              console.log('Event:', e);
              console.log('isLoading:', isLoading);
              console.log('================================');
            }}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-sans"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
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
            <p className="text-sm text-gray-600 font-sans">
              Don't have an account?{' '}
              <Link to="/join" className="font-medium text-blue-600 hover:text-blue-500 font-sans">
                Create one here
              </Link>
            </p>
            {/* In-memory database notice */}
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="text-sm font-semibold text-yellow-900 mb-2 font-sans">⚠️ Lưu ý quan trọng:</h4>
              <p className="text-xs text-yellow-800 font-sans">
                Hệ thống đang dùng <strong>in-memory database</strong>. Vui lòng đăng ký tài khoản mới để sử dụng.
                Dữ liệu sẽ bị xóa khi server restart.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
    </>
  );
};

export default Login;
