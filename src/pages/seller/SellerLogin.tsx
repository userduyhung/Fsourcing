import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { authApi, profileApi } from '../../services/apiClient';
import { logger } from '../../utils/logger';

const SellerLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Vui lòng nhập email và mật khẩu.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await authApi.login({ email: email.trim(), password });
      
      logger.info('SellerLogin', '🔐 Login response received', { 
        response,
        responseType: typeof response,
        responseKeys: response ? Object.keys(response) : [],
        hasToken: !!(response?.token),
        hasUser: !!(response?.user)
      });
      
      // Response structure from API: { token, user: { id, email, fullName, role }, expiresIn, userId }
      const token = response?.token;
      const user = response?.user || {};
      const userName = user?.email || user?.Email || email;
      const role = (user?.role || user?.Role || 'Seller')?.toLowerCase();
      const userId = response?.userId || user?.id;
      
      logger.info('SellerLogin', '📋 Extracted data', { 
        hasToken: !!token,
        tokenPreview: token ? token.substring(0, 30) + '...' : 'NONE',
        userName,
        role,
        userId
      });
      
      if (token) {
        // Debug: Decode JWT to see claims
        try {
          const parts = token.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            logger.info('SellerLogin', '🔑 JWT Claims in token:', { 
              nameid: payload.nameid,
              sub: payload.sub,
              email: payload.email,
              role: payload.role,
              allClaims: payload
            });
          }
        } catch (e) {
          logger.error('SellerLogin', 'Failed to decode JWT', e);
        }
        
        // Save seller-specific token and data
        localStorage.setItem('sellerToken', token);
        localStorage.setItem('token', token); // Fallback
        localStorage.setItem('authToken', token); // Another fallback
        localStorage.setItem('userName', userName || 'Seller');
        localStorage.setItem('role', 'seller'); // Force seller role for routing
        localStorage.setItem('userRole', role || 'seller');
        if (userId) {
          localStorage.setItem('userId', String(userId));
        }
        
        logger.info('SellerLogin', '✅ Token saved to localStorage', {
          sellerToken: localStorage.getItem('sellerToken')?.substring(0, 30) + '...',
          role: localStorage.getItem('role'),
          allKeys: Object.keys(localStorage)
        });
        
        // Fetch seller profile from backend
        try {
          logger.info('SellerLogin', '📋 Fetching seller profile from backend...');
          const profileData = await profileApi.sellerProfile({});
          
          if (profileData) {
            logger.info('SellerLogin', '✅ Seller profile loaded', { profileData });
            
            // Save profile to localStorage with lowercase keys for consistency
            const normalizedProfile = {
              companyName: profileData.companyName || profileData.CompanyName,
              legalRepresentative: profileData.legalRepresentative || profileData.LegalRepresentative,
              taxId: profileData.taxId || profileData.TaxId,
              country: profileData.country || profileData.Country,
              industry: profileData.industry || profileData.Industry,
              description: profileData.description || profileData.Description,
              website: profileData.website || profileData.Website,
              city: profileData.city || profileData.City,
              isVerified: profileData.isVerified || profileData.IsVerified || false,
              isPremium: profileData.isPremium || profileData.IsPremium || false
            };
            
            localStorage.setItem('sellerProfile', JSON.stringify(normalizedProfile));
            logger.info('SellerLogin', '💾 Seller profile saved to localStorage');
            
            // Dispatch event AFTER profile is saved so UserMenu can read it
            window.dispatchEvent(new Event('userProfileUpdated'));
          } else {
            logger.info('SellerLogin', '⚠️ No seller profile found - new seller needs to create profile');
            localStorage.removeItem('sellerProfile');
            // Still dispatch event for login flow
            window.dispatchEvent(new Event('userLoggedIn'));
          }
        } catch (profileErr: any) {
          logger.warn('SellerLogin', '⚠️ Failed to fetch seller profile', {
            error: profileErr?.response?.data || profileErr?.message
          });
          // Don't block login if profile fetch fails
          localStorage.removeItem('sellerProfile');
          // Still dispatch event for login flow
          window.dispatchEvent(new Event('userLoggedIn'));
        }
        
        // Check if seller has profile
        try {
          const profileCheckData = await profileApi.sellerProfile({});
          
          if (!profileCheckData || !profileCheckData.companyName) {
            // No profile yet - redirect to edit profile page (first login flow)
            logger.info('SellerLogin', '🆕 No profile detected - redirecting to profile creation');
            navigate('/seller/profile', { 
              state: { isFirstLogin: true, message: 'Vui lòng điền đầy đủ thông tin hồ sơ của bạn' } 
            });
          } else {
            // Profile exists - go to dashboard
            logger.info('SellerLogin', '✅ Profile found - redirecting to dashboard');
            navigate('/seller/dashboard');
          }
        } catch (profileCheckErr) {
          logger.warn('SellerLogin', '⚠️ Could not check profile, proceeding to dashboard');
          navigate('/seller/dashboard');
        }
      } else {
        logger.error('SellerLogin', '❌ No token in response', { 
          fullResponse: response,
          responseJSON: JSON.stringify(response, null, 2)
        });
        setError('Đăng nhập thành công nhưng không nhận được token. Vui lòng kiểm tra backend.');
        console.error('Full response:', JSON.stringify(response, null, 2));
      }
    } catch (err: any) {
      logger.error('SellerLogin', '❌ Login failed', {
        error: err,
        response: err?.response,
        responseData: err?.response?.data
      });
      console.error('Login error:', err);
      const errorMsg = err?.response?.data?.message 
        || err?.response?.data?.error 
        || err?.message 
        || 'Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-app">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Đăng nhập Seller</h2>
        {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Email</label>
          <div className="flex items-center border rounded px-3 py-2">
            <Mail className="w-5 h-5 text-gray-400 mr-2" />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full outline-none" placeholder="seller@demo.com" />
          </div>
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Mật khẩu</label>
          <div className="flex items-center border rounded px-3 py-2">
            <Lock className="w-5 h-5 text-gray-400 mr-2" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full outline-none" placeholder="Mật khẩu" />
          </div>
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition-colors" disabled={isLoading}>
          {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
        <div className="mt-4 flex justify-between text-sm">
          <Link to="/seller/forgot-password" className="text-blue-600 hover:underline">Quên mật khẩu?</Link>
          <Link to="/seller/register" className="text-blue-600 hover:underline">Đăng ký Seller</Link>
        </div>
      </form>
    </div>
  );
};

export default SellerLogin;
