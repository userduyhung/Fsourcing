import React, { useState } from 'react';
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

interface ProfileData {
  fullName: string;
  company: string;
  email: string;
  phone: string;
  country: string;
  jobTitle: string;
  address: string;
  website?: string;
  joinDate: string;
}

const BuyerProfile: React.FC = () => {
  // Scroll to top when mount
  React.useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, []);
  // Get buyer profile from localStorage
  const savedProfile = JSON.parse(localStorage.getItem('buyerProfile') || '{}');
  
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: savedProfile.fullName || '',
    company: savedProfile.company || '',
    email: savedProfile.email || '',
    phone: savedProfile.phone || '',
    country: savedProfile.country || '',
    jobTitle: savedProfile.jobTitle || '',
    address: savedProfile.address || '',
    website: savedProfile.website || '',
    joinDate: savedProfile.joinDate || new Date().toISOString()
  });

  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const countries = [
    'Vietnam', 'United States', 'China', 'Japan', 'South Korea', 'Singapore', 
    'Thailand', 'Malaysia', 'Indonesia', 'Philippines', 'India', 'Australia'
  ];

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!profileData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!profileData.company.trim()) newErrors.company = 'Company name is required';
    if (!profileData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = 'Email format is invalid';
    }
    if (!profileData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!profileData.country) newErrors.country = 'Country is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    
    // Mock save - update localStorage
    setTimeout(() => {
      const updatedProfile = { ...savedProfile, ...profileData };
      localStorage.setItem('buyerProfile', JSON.stringify(updatedProfile));
      
      setIsLoading(false);
      setIsEditing(false);
      setShowSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  const handleCancel = () => {
    setProfileData({
      fullName: savedProfile.fullName || '',
      company: savedProfile.company || '',
      email: savedProfile.email || '',
      phone: savedProfile.phone || '',
      country: savedProfile.country || '',
      jobTitle: savedProfile.jobTitle || '',
      address: savedProfile.address || '',
      website: savedProfile.website || '',
      joinDate: savedProfile.joinDate || new Date().toISOString()
    });
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account information and preferences</p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Edit Profile
          </button>
        ) : (
          <div className="flex space-x-3">
            <button
              onClick={handleCancel}
              className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-center">
          <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
          <p className="text-green-800">Profile updated successfully!</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Picture and Basic Info */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="relative inline-block">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-12 h-12 text-blue-600" />
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700">
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{profileData.fullName}</h3>
            <p className="text-gray-600">{profileData.company}</p>
            <p className="text-sm text-gray-500 mt-2">
              Member since {new Date(profileData.joinDate).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long' 
              })}
            </p>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center text-sm text-gray-600">
              <Mail className="w-4 h-4 mr-3 text-gray-400" />
              {profileData.email}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="w-4 h-4 mr-3 text-gray-400" />
              {profileData.phone}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Globe className="w-4 h-4 mr-3 text-gray-400" />
              {profileData.country}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-3 text-gray-400" />
              Joined {new Date(profileData.joinDate).toLocaleDateString()}
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <Link 
              to="/buyer/change-password"
              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors text-center block"
            >
              Change Password
            </Link>
          </div>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h3>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                {isEditing ? (
                  <input
                    name="fullName"
                    type="text"
                    value={profileData.fullName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.fullName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your full name"
                  />
                ) : (
                  <p className="py-2 text-gray-900">{profileData.fullName || 'Not provided'}</p>
                )}
                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
              </div>

              {/* Job Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                {isEditing ? (
                  <input
                    name="jobTitle"
                    type="text"
                    value={profileData.jobTitle}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your job title"
                  />
                ) : (
                  <p className="py-2 text-gray-900">{profileData.jobTitle || 'Not provided'}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Company */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                {isEditing ? (
                  <input
                    name="company"
                    type="text"
                    value={profileData.company}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.company ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your company name"
                  />
                ) : (
                  <p className="py-2 text-gray-900">{profileData.company || 'Not provided'}</p>
                )}
                {errors.company && <p className="text-red-500 text-xs mt-1">{errors.company}</p>}
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                {isEditing ? (
                  <select
                    name="country"
                    value={profileData.country}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.country ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select your country</option>
                    {countries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                ) : (
                  <p className="py-2 text-gray-900">{profileData.country || 'Not provided'}</p>
                )}
                {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                {isEditing ? (
                  <input
                    name="email"
                    type="email"
                    value={profileData.email}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your email address"
                  />
                ) : (
                  <p className="py-2 text-gray-900">{profileData.email || 'Not provided'}</p>
                )}
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                {isEditing ? (
                  <input
                    name="phone"
                    type="tel"
                    value={profileData.phone}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <p className="py-2 text-gray-900">{profileData.phone || 'Not provided'}</p>
                )}
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              {isEditing ? (
                <textarea
                  name="address"
                  value={profileData.address}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your full address"
                />
              ) : (
                <p className="py-2 text-gray-900">{profileData.address || 'Not provided'}</p>
              )}
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Website (Optional)</label>
              {isEditing ? (
                <input
                  name="website"
                  type="url"
                  value={profileData.website}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com"
                />
              ) : (
                <p className="py-2 text-gray-900">
                  {profileData.website ? (
                    <a href={profileData.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                      {profileData.website}
                    </a>
                  ) : (
                    'Not provided'
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerProfile;