import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { logger } from '../../utils/logger';
import authService from '../../services/authService';
import { buyerService } from '../../services/buyerService';

const BuyerLogin: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email format is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    logger.info('BuyerLogin', '🔑 LOGIN: Form submitted', { email: formData.email });
    
    if (!validateForm()) {
      logger.warn('BuyerLogin', '❌ VALIDATION: Form validation failed');
      return;
    }

    logger.info('BuyerLogin', '✅ VALIDATION: Form validation passed');
    setIsLoading(true);
    
    try {
      // Call real API
      logger.info('BuyerLogin', '📡 Calling login API...');
      
      const response = await authService.login({
        email: formData.email,
        password: formData.password
      });

      logger.info('BuyerLogin', '📦 Login API response received:', {
        hasToken: !!response.token,
        hasUser: !!response.user,
        userRole: response.user?.role
      });

      if (response.token && response.user) {
        // Check if user is buyer
        const role = response.user.role?.toLowerCase();
        logger.info('BuyerLogin', '🔍 Checking role:', role);
        
        if (role !== 'buyer') {
          logger.warn('BuyerLogin', '❌ Role mismatch:', role);
          setErrors({ general: 'This account is not a buyer account. Please use the correct login page.' });
          setIsLoading(false);
          return;
        }

        logger.info('BuyerLogin', '✅ AUTH SUCCESS: Buyer logged in', { userId: response.user.id, role });
        
        // Save token FIRST to localStorage
        localStorage.setItem('buyerToken', response.token);
        localStorage.setItem('userRole', 'buyer');
        
        logger.info('BuyerLogin', '💾 Token saved to localStorage');
        
        // Small delay to ensure localStorage write is complete
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Now fetch full profile from API to get accurate name
        logger.info('BuyerLogin', '🔄 Attempting to fetch buyer profile from API...');
        
        try {
          const profile = await buyerService.getProfile();
          
          logger.info('BuyerLogin', '📦 API PROFILE RESPONSE:', profile);
          logger.info('BuyerLogin', '📦 profile.name:', profile.name);
          logger.info('BuyerLogin', '📦 response.user.fullName:', response.user.fullName);
          
          // Determine fullName: prioritize profile.name, but don't fallback to email
          let fullNameToSave = '';
          if (profile.name && profile.name.trim() !== '') {
            fullNameToSave = profile.name.trim();
          } else if (response.user.fullName && response.user.fullName.trim() !== '' && !response.user.fullName.includes('@')) {
            // Only use response.user.fullName if it's not an email
            fullNameToSave = response.user.fullName.trim();
          }
          
          logger.info('BuyerLogin', '💾 Determined fullName to save:', fullNameToSave || '(empty - user needs to set name)');
          
          // Save to localStorage - prefer profile.name or response.user.fullName; do not fallback to email
          localStorage.setItem('userName', fullNameToSave || 'Buyer');
          localStorage.setItem('buyerProfile', JSON.stringify({
            id: response.user.id,
            fullName: fullNameToSave || '',
            company: profile.companyName || response.user.company || '',
            email: response.user.email,
            phone: profile.phone || response.user.phone || '',
            country: profile.country || response.user.country || '',
            joinDate: response.user.joinDate
          }));
          
          logger.info('BuyerLogin', '💾 STORAGE: Profile saved to localStorage', {
            fullName: fullNameToSave || '(empty)',
            email: response.user.email,
            company: profile.companyName || response.user.company || ''
          });
        } catch (profileError) {
          logger.error('BuyerLogin', '❌ PROFILE FETCH ERROR:', profileError);
          logger.error('BuyerLogin', '❌ Error details:', {
            message: (profileError as any)?.message,
            response: (profileError as any)?.response,
            status: (profileError as any)?.status
          });
          logger.warn('BuyerLogin', '⚠️ Failed to fetch profile, using login response data', profileError);
          
          // Fallback to login response if profile fetch fails
          // Prefer response.user.fullName (when not an email); otherwise default to 'Buyer'
          const fallbackName = (response.user.fullName && !response.user.fullName.includes('@'))
            ? response.user.fullName
            : '';

          localStorage.setItem('userName', fallbackName || 'Buyer');
          localStorage.setItem('buyerProfile', JSON.stringify({
            id: response.user.id,
            fullName: fallbackName || '',
            company: response.user.company || '',
            email: response.user.email,
            phone: response.user.phone || '',
            country: response.user.country || '',
            joinDate: response.user.joinDate
          }));
          
          logger.info('BuyerLogin', '💾 FALLBACK: Saved login data to localStorage (profile fetch failed)');
        }
        
        logger.info('BuyerLogin', '💾 STORAGE: Token and profile saved to localStorage');
        
        // Small delay to ensure localStorage is fully written
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Dispatch event to update App.tsx and UserMenu
        window.dispatchEvent(new Event('userLoggedIn'));
        logger.info('BuyerLogin', '📢 EVENT: userLoggedIn dispatched');
        
        // Small delay to let App.tsx process the event
        await new Promise(resolve => setTimeout(resolve, 100));
        
        logger.info('BuyerLogin', '➡️ REDIRECT: Navigating to /buyer/dashboard');
        navigate('/buyer/dashboard');
      } else {
        logger.warn('BuyerLogin', '❌ AUTH FAILED: No token or user in response');
        setErrors({ general: 'Invalid response from server' });
      }
    } catch (error: any) {
      logger.error('BuyerLogin', '❌ AUTH ERROR', error);
      setErrors({ general: error.message || 'Failed to login. Please check your credentials and try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name] || errors.general) {
      setErrors(prev => ({ ...prev, [name]: '', general: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center text-2xl font-bold text-blue-600 mb-6">
            <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-2 text-sm">F</span>
            Fsourcing
          </Link>
          <h2 className="text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Welcome back! Please sign in to continue
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email address"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-12 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
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
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
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
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link to="/buyer/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                Forgot your password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/buyer/register" className="font-medium text-blue-600 hover:text-blue-500">
                Create one here
              </Link>
            </p>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-800 font-semibold">Note:</p>
              <p className="text-xs text-blue-700">You need to register as a Buyer first to login.</p>
              <p className="text-xs text-blue-700">Use the registration link above to create your account.</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BuyerLogin;