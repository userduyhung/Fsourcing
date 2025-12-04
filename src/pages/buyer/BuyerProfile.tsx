import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  Globe, 
  Calendar,
  Edit3,
  Save,
  X,
  Camera,
  CheckCircle
} from 'lucide-react';
import { logger } from '../../utils/logger';
import { buyerService } from '../../services/buyerService';

interface ProfileData {
  fullName: string;
  company: string;
  email: string;
  phone: string;
  country: string;
  jobTitle: string;
  address: string;
  joinDate: string;
}

const BuyerProfile: React.FC = () => {
  // Scroll to top when mount
  React.useEffect(() => { 
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
    logger.info('BuyerProfile', 'component mounted');
  }, []);
  
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: '',
    company: '',
    email: '',
    phone: '',
    country: '',
    jobTitle: '',
    address: '',
    joinDate: new Date().toISOString()
  });

  const [originalData, setOriginalData] = useState<ProfileData>({
    fullName: '',
    company: '',
    email: '',
    phone: '',
    country: '',
    jobTitle: '',
    address: '',
    joinDate: new Date().toISOString()
  });

  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  // ✅ Fetch profile from API on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        logger.info('BuyerProfile', '🔄 Fetching profile from API...');
        const response = await buyerService.getProfile();
        
        logger.info('BuyerProfile', '✅ Profile fetched successfully', response);
        
        // Get email and userId from localStorage (set during login)
        let userEmail = '';
        let userId = '';
        
        try {
          const buyerProfileStr = localStorage.getItem('buyerProfile');
          if (buyerProfileStr) {
            const buyerProfile = JSON.parse(buyerProfileStr);
            userEmail = buyerProfile.email || '';
            userId = buyerProfile.id || '';
          }
        } catch (e) {
          logger.warn('BuyerProfile', 'Failed to parse buyerProfile from localStorage');
        }
        
        // Map backend response (Name, CompanyName, Country, Phone) to frontend state
        const data: ProfileData = {
          fullName: response.name || '',
          company: response.companyName || '',
          email: userEmail,
          phone: response.phone || '',
          country: response.country || '',
          jobTitle: '', // Not in API response
          address: '', // Not in API response
          joinDate: new Date().toISOString().split('T')[0] // Default to today
        };
        
        logger.info('BuyerProfile', '📊 Mapped profile data:', data);
        
        setProfileData(data);
        setOriginalData(data); // Save original for cancel
      } catch (error: any) {
        logger.error('BuyerProfile', '❌ Failed to fetch profile', error);
        
        // If profile doesn't exist, still populate email from localStorage
        try {
          const buyerProfileStr = localStorage.getItem('buyerProfile');
          if (buyerProfileStr) {
            const buyerProfile = JSON.parse(buyerProfileStr);
            setProfileData(prev => ({ ...prev, email: buyerProfile.email || '' }));
            setOriginalData(prev => ({ ...prev, email: buyerProfile.email || '' }));
          }
        } catch (e) {
          logger.warn('BuyerProfile', 'Failed to get email from localStorage');
        }
      } finally {
        setIsFetching(false);
      }
    };
    
    fetchProfile();
  }, []);

  // Track when entering edit mode
  const handleEditClick = () => {
    logger.info('BuyerProfile', '✏️ EDIT MODE: User started editing profile');
    setIsEditing(true);
  };

  const countries = [
    'Vietnam', 'United States', 'China', 'Japan', 'South Korea', 'Singapore', 
    'Thailand', 'Malaysia', 'Indonesia', 'Philippines', 'India', 'Australia'
  ];

  const validateForm = () => {
    logger.debug('BuyerProfile', 'validating form', { 
      fullName: profileData.fullName,
      company: profileData.company 
    });
    
    const newErrors: {[key: string]: string} = {};

    // Name: required, max 255
    if (!profileData.fullName || !profileData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
      logger.warn('BuyerProfile', 'validation failed: fullName required');
    } else if (profileData.fullName.length > 255) {
      newErrors.fullName = 'Full name must be at most 255 characters';
      logger.warn('BuyerProfile', 'validation failed: fullName too long', { length: profileData.fullName.length });
    }

    // Optional fields: validate only when provided
    if (profileData.company && profileData.company.length > 255) {
      newErrors.company = 'Company name must be at most 255 characters';
    }
    if (profileData.country && profileData.country.length > 100) {
      newErrors.country = 'Country must be at most 100 characters';
    }
    if (profileData.phone && profileData.phone.replace(/\D/g, '').length > 20) {
      newErrors.phone = 'Phone number must be at most 20 digits';
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    
    if (isValid) {
      logger.info('BuyerProfile', 'validation passed');
    } else {
      logger.error('BuyerProfile', 'validation failed', { errors: newErrors });
    }
    
    return isValid;
  };

  const handleSave = async () => {
    logger.info('BuyerProfile', '🔄 START: handleSave triggered', { 
      currentData: profileData
    });
    
    if (!validateForm()) {
      logger.warn('BuyerProfile', '❌ ABORT: validation failed');
      return;
    }

    // Build DTO according to UpdateBuyerProfileDto — PascalCase for backend
    const dto: any = {
      Name: profileData.fullName.trim(),
      CompanyName: profileData.company?.trim() || undefined,
      Country: profileData.country?.trim() || undefined,
      Phone: profileData.phone?.trim() || undefined
    };

    logger.info('BuyerProfile', '✏️ Saving profile changes...');

    setIsLoading(true);

    // Call API to update profile
    logger.debug('BuyerProfile', '📡 API CALL: Sending update request...', { dto });
    
    buyerService.updateProfile(dto)
      .then((response) => {
        logger.info('BuyerProfile', '✅ SUCCESS: Profile updated successfully', { 
          response,
          timestamp: new Date().toISOString()
        });
        
        // Update local state with saved data
        setProfileData(prev => ({
          ...prev,
          fullName: dto.Name,
          company: dto.CompanyName || '',
          country: dto.Country || '',
          phone: dto.Phone || ''
        }));

        // Sync changes to localStorage so BuyerLayout shows updated name
        try {
          const buyerProfileStr = localStorage.getItem('buyerProfile');
          if (buyerProfileStr) {
            const buyerProfile = JSON.parse(buyerProfileStr);
            buyerProfile.fullName = dto.Name;
            buyerProfile.company = dto.CompanyName || '';
            buyerProfile.phone = dto.Phone || '';
            buyerProfile.country = dto.Country || '';
            localStorage.setItem('buyerProfile', JSON.stringify(buyerProfile));
            
            // Dispatch event để UserMenu và các component khác re-render
            window.dispatchEvent(new Event('userProfileUpdated'));
            
            logger.info('BuyerProfile', '💾 localStorage synced with updated profile');
          }
        } catch (e) {
          logger.warn('BuyerProfile', '⚠️ Failed to sync localStorage', e);
        }

        setIsLoading(false);
        setIsEditing(false);
        setShowSuccess(true);
        // Hide success message after 3 seconds
        setTimeout(() => setShowSuccess(false), 3000);
      })
      .catch((error) => {
        logger.error('BuyerProfile', '❌ API ERROR: Failed to update profile', error);
        setIsLoading(false);
        
        // Parse error message
        const errorMsg = error.message || 'Không xác định';
        
        // Show error alert with proper formatting
        alert(`❌ LỖI CẬP NHẬT PROFILE\n\n${errorMsg}`);
      });
  };

  const handleCancel = () => {
    logger.info('BuyerProfile', '🔙 CANCEL: User cancelled editing, reverting changes');
    
    setProfileData(originalData);
    setIsEditing(false);
    setErrors({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setProfileData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Loading state */}
      {isFetching && (
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 flex items-center shadow-md">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
          <p className="text-blue-800 font-medium">Đang tải thông tin hồ sơ...</p>
        </div>
      )}
      
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold mb-2">Hồ Sơ Của Tôi</h1>
            <p className="text-blue-100 text-lg">Quản lý thông tin tài khoản và cài đặt của bạn</p>
          </div>
          {!isEditing ? (
            <button
              onClick={handleEditClick}
              className="mt-4 md:mt-0 flex items-center px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl font-semibold"
            >
              <Edit3 className="w-5 h-5 mr-2" />
              Chỉnh sửa
            </button>
          ) : (
            <div className="mt-4 md:mt-0 flex space-x-3">
              <button
                onClick={handleCancel}
                className="flex items-center px-5 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all border border-white/30 font-semibold"
              >
                <X className="w-5 h-5 mr-2" />
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="flex items-center px-5 py-3 bg-white text-green-600 rounded-xl hover:bg-green-50 transition-all shadow-lg disabled:opacity-50 font-semibold"
              >
                <Save className="w-5 h-5 mr-2" />
                {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 flex items-center shadow-md animate-fade-in">
          <CheckCircle className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" />
          <p className="text-green-800 font-medium">Cập nhật hồ sơ thành công!</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card - Left Side */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="text-center">
            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto shadow-xl">
                <User className="w-16 h-16 text-white" />
              </div>
              {isEditing && (
                <button className="absolute bottom-2 right-2 bg-blue-600 text-white rounded-full p-3 hover:bg-blue-700 transition-all shadow-lg hover:scale-110">
                  <Camera className="w-5 h-5" />
                </button>
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{profileData.fullName || 'Chưa có tên'}</h3>
            <p className="text-gray-600 font-medium mb-2">{profileData.jobTitle || 'Chưa có chức vụ'}</p>
            <p className="text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2 inline-block">
              {profileData.company || 'Chưa có công ty'}
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <div className="flex items-center p-3 bg-blue-50 rounded-xl transition-all hover:bg-blue-100">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 mb-1">Email</p>
                <p className="text-sm text-gray-900 font-medium truncate">{profileData.email || 'Chưa có email'}</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-green-50 rounded-xl transition-all hover:bg-green-100">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                <Phone className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 mb-1">Điện thoại</p>
                <p className="text-sm text-gray-900 font-medium">{profileData.phone || 'Chưa có số điện thoại'}</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-purple-50 rounded-xl transition-all hover:bg-purple-100">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                <Globe className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 mb-1">Quốc gia</p>
                <p className="text-sm text-gray-900 font-medium">{profileData.country || 'Chưa chọn quốc gia'}</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-orange-50 rounded-xl transition-all hover:bg-orange-100">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 mb-1">Tham gia từ</p>
                <p className="text-sm text-gray-900 font-medium">
                  {new Date(profileData.joinDate).toLocaleDateString('vi-VN', { 
                    year: 'numeric', 
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <Link 
              to="/buyer/change-password"
              className="w-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 py-3 px-4 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all text-center block font-semibold shadow-sm hover:shadow-md"
            >
              Đổi mật khẩu
            </Link>
          </div>
        </div>

        {/* Profile Form - Right Side */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-4">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Thông tin cá nhân</h3>
              <p className="text-gray-500 text-sm">Cập nhật thông tin chi tiết của bạn</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Họ và tên <span className="text-red-500">*</span></label>
                {isEditing ? (
                  <input
                    name="fullName"
                    type="text"
                    value={profileData.fullName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                      errors.fullName ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    placeholder="Nhập họ tên đầy đủ"
                  />
                ) : (
                  <div className="py-3 px-4 bg-gray-50 rounded-xl text-gray-900 font-medium">{profileData.fullName || 'Chưa cung cấp'}</div>
                )}
                {errors.fullName && <p className="text-red-500 text-xs mt-2 font-medium">⚠ {errors.fullName}</p>}
              </div>

              {/* Job Title */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Chức vụ</label>
                {isEditing ? (
                  <input
                    name="jobTitle"
                    type="text"
                    value={profileData.jobTitle}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-300 transition-all"
                    placeholder="Nhập chức vụ của bạn"
                  />
                ) : (
                  <div className="py-3 px-4 bg-gray-50 rounded-xl text-gray-900 font-medium">{profileData.jobTitle || 'Chưa cung cấp'}</div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Company */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Tên công ty</label>
                {isEditing ? (
                  <input
                    name="company"
                    type="text"
                    value={profileData.company}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                      errors.company ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    placeholder="Nhập tên công ty"
                  />
                ) : (
                  <div className="py-3 px-4 bg-gray-50 rounded-xl text-gray-900 font-medium">{profileData.company || 'Chưa cung cấp'}</div>
                )}
                {errors.company && <p className="text-red-500 text-xs mt-2 font-medium">⚠ {errors.company}</p>}
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Quốc gia</label>
                {isEditing ? (
                  <select
                    name="country"
                    value={profileData.country}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                      errors.country ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <option value="">Chọn quốc gia</option>
                    {countries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                ) : (
                  <div className="py-3 px-4 bg-gray-50 rounded-xl text-gray-900 font-medium">{profileData.country || 'Chưa cung cấp'}</div>
                )}
                {errors.country && <p className="text-red-500 text-xs mt-2 font-medium">⚠ {errors.country}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Email</label>
                {isEditing ? (
                  <input
                    name="email"
                    type="email"
                    value={profileData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                      errors.email ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    placeholder="Nhập email của bạn"
                  />
                ) : (
                  <div className="py-3 px-4 bg-gray-50 rounded-xl text-gray-900 font-medium">{profileData.email || 'Chưa cung cấp'}</div>
                )}
                {errors.email && <p className="text-red-500 text-xs mt-2 font-medium">⚠ {errors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Số điện thoại</label>
                {isEditing ? (
                  <input
                    name="phone"
                    type="tel"
                    value={profileData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                      errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    placeholder="Nhập số điện thoại"
                  />
                ) : (
                  <div className="py-3 px-4 bg-gray-50 rounded-xl text-gray-900 font-medium">{profileData.phone || 'Chưa cung cấp'}</div>
                )}
                {errors.phone && <p className="text-red-500 text-xs mt-2 font-medium">⚠ {errors.phone}</p>}
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Địa chỉ</label>
              {isEditing ? (
                <textarea
                  name="address"
                  value={profileData.address}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-300 transition-all"
                  placeholder="Nhập địa chỉ đầy đủ của bạn"
                />
              ) : (
                <div className="py-3 px-4 bg-gray-50 rounded-xl text-gray-900 font-medium min-h-[80px]">{profileData.address || 'Chưa cung cấp'}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerProfile;