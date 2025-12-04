import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import authService from '../services/authService';
import { logger } from '../utils/logger';
// DebugLogger removed - use console.log for debugging
import Toast from '../components/Toast';
import { useApiToast } from '../hooks/useApiToast';

const Login: React.FC = () => {
  // Auto-fill from registration if available
  const registeredEmail = sessionStorage.getItem('registeredEmail') || '';
  const registeredPassword = sessionStorage.getItem('registeredPassword') || '';

  logger.debug('Login', 'component mounted', { hasRegisteredEmail: !!registeredEmail });

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
    // Only clear on mount, not on every render
    const savedEmail = sessionStorage.getItem('registeredEmail');
    const savedPassword = sessionStorage.getItem('registeredPassword');

    logger.debug('Login', 'useEffect mount', { savedEmailPresent: !!savedEmail, savedPasswordPresent: !!savedPassword });

    if (savedEmail || savedPassword) {
      sessionStorage.removeItem('registeredEmail');
      sessionStorage.removeItem('registeredPassword');
      setError(''); // Clear any previous error
      logger.debug('Login', 'cleared sessionStorage and reset error state');
    }
  }, []); // Run only once on mount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    logger.debug('Login', 'form submit', { emailProvided: !!email });

    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    showLoading('Đang đăng nhập...');

    try {
      logger.debug('Login', 'calling authService.login');
      const response = await authService.login({ email, password });
      logger.debug('Login', 'authService response', { hasUser: !!response.user, hasToken: !!response.token });

      // Store user data based on role
      if (response.user) {
        // Normalize role to a string; default to empty string if missing
        const role = (response.user.role || '').toLowerCase();
        const token = response.token || 'auth-token';

        logger.debug('Login', 'processing user', { role, userId: response.user?.id });

        showSuccess('Đăng nhập thành công!');

        // Store common data
        localStorage.setItem('userName', response.user.fullName || response.user.email);
        localStorage.setItem('userRole', role ?? '');

        logger.debug('Login', 'stored user info', { userName: response.user.fullName || response.user.email, role });

        // Store role-specific token and profile
        if (role === 'admin') {
          logger.info('Login', 'redirecting to admin dashboard');
          localStorage.setItem('adminToken', token);
          window.dispatchEvent(new Event('userLoggedIn'));
          setTimeout(() => navigate('/admin/dashboard'), 1000);
        } else if (role === 'buyer') {
          logger.info('Login', 'redirecting to home for buyer');
          const buyerProfile = {
            id: response.user.id,
            fullName: response.user.fullName,
            company: response.user.company,
            email: response.user.email,
            phone: response.user.phone,
            country: response.user.country,
            joinDate: response.user.joinDate || new Date().toISOString()
          };
          logger.debug('Login', 'buyer profile prepared', { buyerId: buyerProfile.id });
          localStorage.setItem('buyerToken', token);
          localStorage.setItem('buyerProfile', JSON.stringify(buyerProfile));
          window.dispatchEvent(new Event('userLoggedIn'));
          setTimeout(() => navigateAfterLogin(fromLocation), 1000);
        } else if (role === 'seller') {
          logger.info('Login', 'redirecting to seller dashboard');
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
          logger.debug('Login', 'seller profile prepared', { sellerId: sellerProfile.id });
          localStorage.setItem('sellerToken', token);
          localStorage.setItem('sellerProfile', JSON.stringify(sellerProfile));
          window.dispatchEvent(new Event('userLoggedIn'));
          // Redirect sellers directly to their dashboard
          setTimeout(() => navigate('/seller/dashboard'), 600);
        } else {
          logger.error('Login', 'unknown role', { role });
          showError('Unknown user role.');
          setError('Unknown user role.');
        }
      } else {
        logger.error('Login', 'no user in response');
        showError('Invalid response from server.');
        setError('Invalid response from server.');
      }
    } catch (err) {
      logger.error('Login', 'error caught', err);

      if (err instanceof Error) {
        logger.error('Login', 'error details', { message: err.message });
        showError(err.message);
        setError(err.message);
      } else {
        logger.error('Login', 'unknown error type', err);
        showError('An error occurred. Please try again.');
        setError('An error occurred. Please try again.');
      }
    } finally {
      logger.debug('Login', 'finished process, isLoading=false');
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
            onClick={(e) => logger.debug('Login', 'sign-in clicked', { isLoading })}
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
