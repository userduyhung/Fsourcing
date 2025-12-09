import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  Building2, 
  User, 
  FileText, 
  Globe, 
  Mail, 
  Phone, 
  MapPin,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Trash2,
  Info
} from 'lucide-react';
import { useApiToast } from '../../hooks/useApiToast';
import apiClient from '../../services/apiClient';
import { logger } from '../../utils/logger';

const SellerProfile: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccess, showError } = useApiToast();

  // Check if this is first login
  const isFirstLogin = (location.state as any)?.isFirstLogin || false;
  const firstLoginMessage = (location.state as any)?.message || '';

  // Required fields (theo Backend UpdateSellerProfileDto)
  const [companyName, setCompanyName] = useState('');
  const [legalRepresentative, setLegalRepresentative] = useState('');
  const [taxId, setTaxId] = useState('');
  const [country, setCountry] = useState('Vietnam');

  // Optional fields
  const [industry, setIndustry] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [city, setCity] = useState('');

  // Additional info (not in UpdateDto but useful for display)
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const [saving, setSaving] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const draftTimer = useRef<number | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const countries = [
    'Vietnam', 'United States', 'China', 'Japan', 'South Korea', 'Singapore',
    'Thailand', 'Malaysia', 'Indonesia', 'Philippines', 'India', 'Australia'
  ];

  // Load persisted profile from backend and localStorage
  useEffect(() => {
    const loadProfile = async () => {
      try {
        logger.info('SellerProfile', '📋 Fetching seller profile from backend...');
        const response = await apiClient.client.get('/Profile/seller');
        
        if (response?.data?.data) {
          const p = response.data.data;
          logger.info('SellerProfile', '✅ Seller profile loaded from backend', { profile: p });
          
          // Populate form fields (handle both camelCase and PascalCase)
          setCompanyName(p.companyName || p.CompanyName || '');
          setLegalRepresentative(p.legalRepresentative || p.LegalRepresentative || '');
          setTaxId(p.taxId || p.TaxId || '');
          setCountry(p.country || p.Country || 'Vietnam');
          setIndustry(p.industry || p.Industry || '');
          setDescription(p.description || p.Description || '');
          setWebsite(p.website || p.Website || '');
          setCity(p.city || p.City || '');
          
          // Save to localStorage as backup
          const normalizedProfile = {
            companyName: p.companyName || p.CompanyName,
            legalRepresentative: p.legalRepresentative || p.LegalRepresentative,
            taxId: p.taxId || p.TaxId,
            country: p.country || p.Country,
            industry: p.industry || p.Industry,
            description: p.description || p.Description,
            website: p.website || p.Website,
            city: p.city || p.City,
            email: p.email || p.Email || '',
            phone: p.phone || p.Phone || '',
            address: p.address || p.Address || ''
          };
          localStorage.setItem('sellerProfile', JSON.stringify(normalizedProfile));
        } else {
          logger.info('SellerProfile', '⚠️ No profile in backend, checking localStorage...');
          
          // Fallback to localStorage if backend has no profile
          const sp = localStorage.getItem('sellerProfile');
          if (sp) {
            try {
              const p = JSON.parse(sp);
              setCompanyName(p.companyName || '');
              setLegalRepresentative(p.legalRepresentative || '');
              setTaxId(p.taxId || '');
              setCountry(p.country || 'Vietnam');
              setIndustry(p.industry || '');
              setDescription(p.description || '');
              setWebsite(p.website || '');
              setCity(p.city || '');
              setEmail(p.email || '');
              setPhone(p.phone || '');
              setAddress(p.address || '');
              logger.info('SellerProfile', '✅ Loaded profile from localStorage');
            } catch (e) {
              logger.error('SellerProfile', '❌ Failed to parse localStorage profile', e);
            }
          }
        }
      } catch (err: any) {
        logger.warn('SellerProfile', '⚠️ Failed to fetch profile from backend', {
          error: err?.response?.data || err?.message
        });
        
        // Fallback to localStorage on error
        const sp = localStorage.getItem('sellerProfile');
        if (sp) {
          try {
            const p = JSON.parse(sp);
            setCompanyName(p.companyName || '');
            setLegalRepresentative(p.legalRepresentative || '');
            setTaxId(p.taxId || '');
            setCountry(p.country || 'Vietnam');
            setIndustry(p.industry || '');
            setDescription(p.description || '');
            setWebsite(p.website || '');
            setCity(p.city || '');
            setEmail(p.email || '');
            setPhone(p.phone || '');
            setAddress(p.address || '');
            logger.info('SellerProfile', '✅ Loaded profile from localStorage (fallback)');
          } catch (e) {
            logger.error('SellerProfile', '❌ Failed to parse localStorage profile', e);
          }
        }
      }
    };
    
    loadProfile();
  }, []);

  // Load draft if exists
  useEffect(() => {
    const draft = localStorage.getItem('sellerProfileDraft');
    if (draft) {
      try {
        const d = JSON.parse(draft);
        if (d.companyName) setCompanyName(d.companyName);
        if (d.legalRepresentative) setLegalRepresentative(d.legalRepresentative);
        if (d.taxId) setTaxId(d.taxId);
        if (d.country) setCountry(d.country);
        if (d.industry) setIndustry(d.industry);
        if (d.description) setDescription(d.description);
        if (d.website) setWebsite(d.website);
        if (d.city) setCity(d.city);
        if (d.email) setEmail(d.email);
        if (d.phone) setPhone(d.phone);
        if (d.address) setAddress(d.address);
        setDraftSaved(true);
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const validateEmail = (e: string) => /\S+@\S+\.\S+/.test(e);
  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSave = async () => {
    // Client-side validations
    const errors: string[] = [];
    
    // Required fields validation
    if (!companyName.trim()) errors.push('Tên công ty là bắt buộc');
    else if (companyName.length > 255) errors.push('Tên công ty không được vượt quá 255 ký tự');
    
    if (!legalRepresentative.trim()) errors.push('Người đại diện pháp luật là bắt buộc');
    else if (legalRepresentative.length > 255) errors.push('Tên người đại diện không được vượt quá 255 ký tự');
    
    if (!taxId.trim()) errors.push('Mã số thuế là bắt buộc');
    else if (taxId.length > 50) errors.push('Mã số thuế không được vượt quá 50 ký tự');
    
    if (!country.trim()) errors.push('Quốc gia là bắt buộc');
    else if (country.length > 100) errors.push('Tên quốc gia không được vượt quá 100 ký tự');

    // Optional fields validation
    if (industry && industry.length > 100) errors.push('Ngành nghề không được vượt quá 100 ký tự');
    if (description && description.length > 1000) errors.push('Mô tả không được vượt quá 1000 ký tự');
    if (website && website.length > 255) errors.push('Website không được vượt quá 255 ký tự');
    if (website && website.trim() && !validateUrl(website)) errors.push('Website không hợp lệ (phải bắt đầu bằng http:// hoặc https://)');
    if (city && city.length > 100) errors.push('Tên thành phố không được vượt quá 100 ký tự');
    
    // Additional validations
    if (email && !validateEmail(email)) errors.push('Email không hợp lệ');
    if (phone) {
      const digits = phone.replace(/[^\d]/g, '');
      if (digits.length < 9 || digits.length > 15) errors.push('Số điện thoại phải có 9-15 chữ số');
    }

    if (errors.length) {
      setValidationErrors(errors);
      errors.forEach((m) => showError(m));
      return;
    }

    setValidationErrors([]);
    
    // Build profile according to UpdateSellerProfileDto
    const profileData = {
      CompanyName: companyName.trim(),
      LegalRepresentative: legalRepresentative.trim(),
      TaxId: taxId.trim(),
      Country: country.trim(),
      Industry: industry.trim() || undefined,
      Description: description.trim() || undefined,
      Website: website.trim() || undefined,
      City: city.trim() || undefined
    };

    // Save additional info locally (not in BE DTO)
    const fullProfile = {
      ...profileData,
      companyName: companyName.trim(),
      legalRepresentative: legalRepresentative.trim(),
      taxId: taxId.trim(),
      country: country.trim(),
      industry: industry.trim(),
      description: description.trim(),
      website: website.trim(),
      city: city.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim()
    };

    setSaving(true);
    try {
      // Call API to create/update seller profile in backend
      // Backend expects PascalCase properties
      const apiPayload = {
        ProfileData: {
          CompanyName: companyName.trim(),
          LegalRepresentative: legalRepresentative.trim(),
          TaxId: taxId.trim(),
          Country: country.trim(),
          Industry: industry.trim() || undefined,
          Description: description.trim() || undefined,
          Website: website.trim() || undefined,
          City: city.trim() || undefined
        }
      };

      logger.info('SellerProfile', '💾 Saving profile to backend', { payload: apiPayload });
      // Use PUT to update seller profile. Backend expects PUT on /profile/seller for updates.
      const response = await apiClient.client.put('/Profile/seller', apiPayload);
      logger.info('SellerProfile', '✅ Profile saved successfully', { response: response?.data });
      
      // Also persist locally for offline access
      localStorage.setItem('sellerProfile', JSON.stringify(fullProfile));
      
      // Clear draft
      localStorage.removeItem('sellerProfileDraft');
      setDraftSaved(false);
      
      window.dispatchEvent(new Event('userLoggedIn'));
      showSuccess('Lưu hồ sơ thành công!');

      // Always redirect to dashboard after successful save
      logger.info('SellerProfile', '🎉 Profile saved successfully - redirecting to dashboard');
      setTimeout(() => navigate('/seller/dashboard'), 1500);
    } catch (err: any) {
      console.error('Failed to save seller profile', err);
      const errorMsg = err?.response?.data?.error || err?.response?.data?.message || 'Lỗi khi lưu hồ sơ';
      showError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  // Autosave draft to localStorage (debounced)
  useEffect(() => {
    if (draftTimer.current) {
      window.clearTimeout(draftTimer.current);
    }
    draftTimer.current = window.setTimeout(() => {
      const draft = { 
        companyName, legalRepresentative, taxId, country, 
        industry, description, website, city,
        email, phone, address 
      };
      try {
        localStorage.setItem('sellerProfileDraft', JSON.stringify(draft));
        setDraftSaved(true);
      } catch (e) {
        // ignore
      }
    }, 2000) as unknown as number;

    return () => {
      if (draftTimer.current) window.clearTimeout(draftTimer.current);
    };
  }, [companyName, legalRepresentative, taxId, country, industry, description, website, city, email, phone, address]);

  const clearDraft = () => {
    localStorage.removeItem('sellerProfileDraft');
    setDraftSaved(false);
    showSuccess('Đã xóa bản nháp');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4 font-body">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl shadow-xl p-8 text-white mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold mb-2">Hồ Sơ Công Ty</h1>
              <p className="text-blue-100">Quản lý thông tin doanh nghiệp của bạn</p>
            </div>
            <div className="flex items-center space-x-3">
              {draftSaved && (
                <div className="flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span className="text-sm">Đã lưu nháp</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* First Login Alert */}
        {isFirstLogin && firstLoginMessage && (
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 mb-6 shadow-md animate-fade-in">
            <div className="flex items-start">
              <Info className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-blue-800 font-bold mb-1">👋 {firstLoginMessage}</h3>
                <p className="text-sm text-blue-700">Các trường có dấu <span className="text-red-500 font-bold">*</span> là bắt buộc phải điền.</p>
              </div>
            </div>
          </div>
        )}

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 mb-6 shadow-md animate-fade-in">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-red-800 font-bold mb-2">Vui lòng kiểm tra các lỗi sau:</h3>
                <ul className="text-sm text-red-700 space-y-1">
                  {validationErrors.map((err, idx) => <li key={idx}>• {err}</li>)}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Required Information Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center mr-4">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Thông tin bắt buộc</h2>
                  <p className="text-sm text-gray-500">Các trường có dấu <span className="text-red-500">*</span> là bắt buộc</p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Tên công ty <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center border-2 border-gray-200 rounded-xl px-4 py-3 focus-within:border-blue-500 transition-all hover:border-gray-300">
                    <Building2 className="w-5 h-5 text-gray-400 mr-3" />
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full outline-none"
                      placeholder="Nhập tên công ty"
                      maxLength={255}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{companyName.length}/255 ký tự</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Người đại diện pháp luật <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center border-2 border-gray-200 rounded-xl px-4 py-3 focus-within:border-blue-500 transition-all hover:border-gray-300">
                    <User className="w-5 h-5 text-gray-400 mr-3" />
                    <input
                      type="text"
                      value={legalRepresentative}
                      onChange={(e) => setLegalRepresentative(e.target.value)}
                      className="w-full outline-none"
                      placeholder="Nhập họ tên người đại diện"
                      maxLength={255}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{legalRepresentative.length}/255 ký tự</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Mã số thuế <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center border-2 border-gray-200 rounded-xl px-4 py-3 focus-within:border-blue-500 transition-all hover:border-gray-300">
                      <FileText className="w-5 h-5 text-gray-400 mr-3" />
                      <input
                        type="text"
                        value={taxId}
                        onChange={(e) => setTaxId(e.target.value)}
                        className="w-full outline-none"
                        placeholder="MST/Tax ID"
                        maxLength={50}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{taxId.length}/50 ký tự</p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Quốc gia <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center border-2 border-gray-200 rounded-xl px-4 py-3 focus-within:border-blue-500 transition-all hover:border-gray-300">
                      <Globe className="w-5 h-5 text-gray-400 mr-3" />
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full outline-none bg-transparent"
                      >
                        {countries.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Optional Information Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-4">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Thông tin bổ sung</h2>
                  <p className="text-sm text-gray-500">Các trường tùy chọn</p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Ngành nghề
                    </label>
                    <div className="flex items-center border-2 border-gray-200 rounded-xl px-4 py-3 focus-within:border-purple-500 transition-all hover:border-gray-300">
                      <Building2 className="w-5 h-5 text-gray-400 mr-3" />
                      <input
                        type="text"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="w-full outline-none"
                        placeholder="Ví dụ: Thực phẩm"
                        maxLength={100}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{industry.length}/100 ký tự</p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Thành phố
                    </label>
                    <div className="flex items-center border-2 border-gray-200 rounded-xl px-4 py-3 focus-within:border-purple-500 transition-all hover:border-gray-300">
                      <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full outline-none"
                        placeholder="Tên thành phố"
                        maxLength={100}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{city.length}/100 ký tự</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Website
                  </label>
                  <div className="flex items-center border-2 border-gray-200 rounded-xl px-4 py-3 focus-within:border-purple-500 transition-all hover:border-gray-300">
                    <Globe className="w-5 h-5 text-gray-400 mr-3" />
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="w-full outline-none"
                      placeholder="https://company.com"
                      maxLength={255}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{website.length}/255 ký tự</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Mô tả công ty
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-purple-500 transition-all hover:border-gray-300 resize-none"
                    placeholder="Giới thiệu về công ty, sản phẩm, dịch vụ..."
                    maxLength={1000}
                  />
                  <p className="text-xs text-gray-500 mt-1">{description.length}/1000 ký tự</p>
                </div>
              </div>
            </div>

            {/* Contact Information Card (Local only) */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center mr-4">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Thông tin liên hệ</h2>
                  <p className="text-sm text-gray-500">Chỉ lưu cục bộ, không đồng bộ lên server</p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Email
                    </label>
                    <div className="flex items-center border-2 border-gray-200 rounded-xl px-4 py-3 focus-within:border-green-500 transition-all hover:border-gray-300">
                      <Mail className="w-5 h-5 text-gray-400 mr-3" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full outline-none"
                        placeholder="email@company.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Số điện thoại
                    </label>
                    <div className="flex items-center border-2 border-gray-200 rounded-xl px-4 py-3 focus-within:border-green-500 transition-all hover:border-gray-300">
                      <Phone className="w-5 h-5 text-gray-400 mr-3" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full outline-none"
                        placeholder="+84 xxx xxx xxx"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Địa chỉ
                  </label>
                  <div className="flex items-center border-2 border-gray-200 rounded-xl px-4 py-3 focus-within:border-green-500 transition-all hover:border-gray-300">
                    <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full outline-none"
                      placeholder="Địa chỉ chi tiết"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={clearDraft}
                disabled={!draftSaved}
                className="flex items-center px-5 py-3 border-2 border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-5 h-5 mr-2" />
                Xóa bản nháp
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl hover:shadow-xl transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed font-bold"
              >
                <Save className="w-5 h-5 mr-2" />
                {saving ? 'Đang lưu...' : 'Lưu hồ sơ'}
              </button>
            </div>
          </div>

          {/* Preview Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Xem trước</h3>
                <button
                  onClick={() => setPreviewMode(!previewMode)}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-700 font-semibold"
                >
                  {previewMode ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                  {previewMode ? 'Ẩn' : 'Hiện'}
                </button>
              </div>

              {previewMode ? (
                <div className="space-y-4">
                  <div className="text-center pb-4 border-b border-gray-200">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <Building2 className="w-10 h-10 text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-1">
                      {companyName || 'Tên công ty'}
                    </h4>
                    <p className="text-sm text-gray-500">{industry || 'Ngành nghề'}</p>
                  </div>

                  <div className="space-y-3">
                    {legalRepresentative && (
                      <div className="flex items-start">
                        <User className="w-4 h-4 text-gray-400 mr-2 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500">Người đại diện</p>
                          <p className="text-sm text-gray-900 font-medium">{legalRepresentative}</p>
                        </div>
                      </div>
                    )}

                    {taxId && (
                      <div className="flex items-start">
                        <FileText className="w-4 h-4 text-gray-400 mr-2 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500">Mã số thuế</p>
                          <p className="text-sm text-gray-900 font-medium">{taxId}</p>
                        </div>
                      </div>
                    )}

                    {country && (
                      <div className="flex items-start">
                        <Globe className="w-4 h-4 text-gray-400 mr-2 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500">Quốc gia</p>
                          <p className="text-sm text-gray-900 font-medium">{country}</p>
                        </div>
                      </div>
                    )}

                    {city && (
                      <div className="flex items-start">
                        <MapPin className="w-4 h-4 text-gray-400 mr-2 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500">Thành phố</p>
                          <p className="text-sm text-gray-900 font-medium">{city}</p>
                        </div>
                      </div>
                    )}

                    {website && (
                      <div className="flex items-start">
                        <Globe className="w-4 h-4 text-gray-400 mr-2 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500">Website</p>
                          <a href={website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline break-all">
                            {website}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  {description && (
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-2">Mô tả</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{description}</p>
                    </div>
                  )}

                  {(email || phone) && (
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-2">Liên hệ</p>
                      {email && <p className="text-sm text-gray-700">📧 {email}</p>}
                      {phone && <p className="text-sm text-gray-700 mt-1">📞 {phone}</p>}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Bấm "Hiện" để xem trước hồ sơ</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerProfile;
