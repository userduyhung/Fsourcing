import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApiToast } from '../../hooks/useApiToast';
import { profileApi } from '../../services/apiClient';

const SellerProfile: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useApiToast();

  const [name, setName] = useState('');
  const [owner, setOwner] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [industry, setIndustry] = useState('');
  const [certifications, setCertifications] = useState('');
  const [description, setDescription] = useState('');
  const [taxId, setTaxId] = useState('');
  const [country, setCountry] = useState('Vietnam');
  const [legalRepresentative, setLegalRepresentative] = useState('');

  const [saving, setSaving] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const draftTimer = useRef<number | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Load persisted profile
  useEffect(() => {
    const sp = localStorage.getItem('sellerProfile');
    if (sp) {
      try {
        const p = JSON.parse(sp);
        setName(p.companyName || p.name || '');
        setOwner(p.contactName || p.owner || '');
        setAddress(p.address || '');
        setPhone(p.phone || '');
        setEmail(p.email || '');
        setIndustry(p.industry || '');
        setCertifications((p.certifications && Array.isArray(p.certifications)) ? p.certifications.join(', ') : (p.certifications || ''));
        setDescription(p.description || '');
        setTaxId(p.taxId || '');
        setCountry(p.country || 'Vietnam');
        setLegalRepresentative(p.legalRepresentative || '');
      } catch (e) {
        // ignore
      }
    }
  }, []);

  // Load draft if exists
  useEffect(() => {
    const draft = localStorage.getItem('sellerProfileDraft');
    if (draft) {
      try {
        const d = JSON.parse(draft);
        if (d.name) setName(d.name);
        if (d.owner) setOwner(d.owner);
        if (d.address) setAddress(d.address);
        if (d.phone) setPhone(d.phone);
        if (d.email) setEmail(d.email);
        if (d.industry) setIndustry(d.industry);
        if (d.certifications) setCertifications(d.certifications);
        if (d.description) setDescription(d.description);
        if (d.taxId) setTaxId(d.taxId);
        if (d.country) setCountry(d.country);
        if (d.legalRepresentative) setLegalRepresentative(d.legalRepresentative);
        setDraftSaved(true);
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const validateEmail = (e: string) => /\S+@\S+\.\S+/.test(e);

  const handleSave = async () => {
    // Client-side validations
    const errors: string[] = [];
    if (!name.trim()) errors.push('Tên công ty bắt buộc.');
    if (!taxId.trim()) errors.push('Mã số thuế bắt buộc.');
    if (!country.trim()) errors.push('Quốc gia bắt buộc.');
    if (!legalRepresentative.trim()) errors.push('Người đại diện pháp luật bắt buộc.');
    if (email && !validateEmail(email)) errors.push('Email không hợp lệ.');
    // sanitize phone: keep digits only for validation
    const digits = phone.replace(/[^\d]/g, '');
    if (digits.length < 9 || digits.length > 15) errors.push('Số điện thoại phải có 9-15 chữ số.');
    if (description.trim().length > 500) errors.push('Mô tả không được vượt quá 500 ký tự.');
    if (description.trim().length > 0 && description.trim().length < 10) errors.push('Mô tả nên có ít nhất 10 ký tự.');

    if (errors.length) {
      setValidationErrors(errors);
      errors.forEach((m) => showError(m));
      return;
    }

    setValidationErrors([]);
    const profile = {
      companyName: name.trim(),
      contactName: owner.trim(),
      address: address.trim(),
      phone: phone.trim(),
      email: email.trim(),
      industry: industry.trim(),
      certifications: certifications.split(',').map((s) => s.trim()).filter(Boolean),
      description: description.trim(),
      taxId: taxId.trim(),
      country: country.trim(),
      legalRepresentative: legalRepresentative.trim(),
    };

    // Wrap in ProfileData as server expects
    const payload = {
      ProfileData: profile
    };

    setSaving(true);
    try {
      // Persist locally first
      localStorage.setItem('sellerProfile', JSON.stringify(profile));
      // If API wrapper exists, call it and sync two-way
      /* API TEMPORARILY DISABLED - USING LOCAL STORAGE ONLY
      if (profileApi && typeof profileApi.sellerProfile === 'function') {
        try {
          console.log('=== SELLER PROFILE UPDATE ===');
          console.log('Payload to send:', payload);
          console.log('============================');
          const resp = await profileApi.sellerProfile(payload);
          const serverData: any = resp || {};
          const merged = { ...profile, ...(serverData || {}) };
          localStorage.setItem('sellerProfile', JSON.stringify(merged));
          window.dispatchEvent(new Event('userLoggedIn'));
          showSuccess('Đồng bộ hồ sơ với server thành công');
        } catch (apiErr: any) {
          console.error('=== API UPDATE ERROR ===');
          console.error('Error object:', apiErr);
          console.error('Response status:', apiErr?.response?.status);
          console.error('Response data:', apiErr?.response?.data);
          console.error('Validation errors:', apiErr?.response?.data?.errors);
          console.error('Error message:', apiErr?.message);
          console.error('=======================');
          
          // Parse validation errors from server
          const respData = apiErr?.response?.data;
          if (respData?.errors && typeof respData.errors === 'object') {
            const fieldErrors: string[] = [];
            for (const [field, messages] of Object.entries(respData.errors)) {
              const errorMsgs = Array.isArray(messages) ? messages.join(', ') : String(messages);
              fieldErrors.push(`${field}: ${errorMsgs}`);
            }
            setValidationErrors(fieldErrors);
            showError(`Lỗi validation: ${fieldErrors.join('; ')}`);
          } else if (respData?.title) {
            showError(respData.title);
          } else {
            showError(apiErr?.message || 'Không thể đồng bộ lên server. Lưu local tạm thời.');
          }
        }
      } else {
        window.dispatchEvent(new Event('userLoggedIn'));
        showSuccess('Lưu hồ sơ (local) thành công');
      }
      */
      
      // Local storage fallback
      window.dispatchEvent(new Event('userLoggedIn'));
      showSuccess('Lưu hồ sơ (local) thành công');

      // Clear draft saved state
      localStorage.removeItem('sellerProfileDraft');
      setDraftSaved(false);
      // navigate back after short delay
      setTimeout(() => navigate('/seller/dashboard'), 700);
    } catch (err) {
      console.error('Failed to save seller profile', err);
      showError('Lỗi khi lưu hồ sơ');
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
      const draft = { name, owner, address, phone, email, industry, certifications, description, taxId, country, legalRepresentative };
      try {
        localStorage.setItem('sellerProfileDraft', JSON.stringify(draft));
        setDraftSaved(true);
      } catch (e) {
        // ignore
      }
    }, 1500) as unknown as number;

    return () => {
      if (draftTimer.current) window.clearTimeout(draftTimer.current);
    };
  }, [name, owner, address, phone, email, industry, certifications, description, taxId, country, legalRepresentative]);

  return (
    <div className="bg-app min-h-screen font-sans">
      <div className="max-w-3xl mx-auto py-10 px-4">
        <h2 className="text-2xl font-bold mb-4">Chỉnh sửa hồ sơ</h2>
        {validationErrors.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
            <ul className="text-sm text-red-700">
              {validationErrors.map((err, idx) => <li key={idx}>• {err}</li>)}
            </ul>
          </div>
        )}
        <div className="bg-white rounded-lg shadow p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="grid grid-cols-1 gap-4">
              <label className="block">
                <span className="text-sm font-medium">Tên công ty</span>
                <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full border rounded p-2" />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Người liên hệ</span>
                <input value={owner} onChange={(e) => setOwner(e.target.value)} className="mt-1 block w-full border rounded p-2" />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Địa chỉ</span>
                <input value={address} onChange={(e) => setAddress(e.target.value)} className="mt-1 block w-full border rounded p-2" />
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm font-medium">Điện thoại</span>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 block w-full border rounded p-2" />
                </label>
                <label className="block">
                  <span className="text-sm font-medium">Email</span>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full border rounded p-2" />
                </label>
              </div>
              <label className="block">
                <span className="text-sm font-medium">Ngành nghề</span>
                <input value={industry} onChange={(e) => setIndustry(e.target.value)} className="mt-1 block w-full border rounded p-2" />
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm font-medium">Mã số thuế <span className="text-red-500">*</span></span>
                  <input value={taxId} onChange={(e) => setTaxId(e.target.value)} className="mt-1 block w-full border rounded p-2" placeholder="VD: 0123456789" />
                </label>
                <label className="block">
                  <span className="text-sm font-medium">Quốc gia <span className="text-red-500">*</span></span>
                  <input value={country} onChange={(e) => setCountry(e.target.value)} className="mt-1 block w-full border rounded p-2" />
                </label>
              </div>
              <label className="block">
                <span className="text-sm font-medium">Người đại diện pháp luật <span className="text-red-500">*</span></span>
                <input value={legalRepresentative} onChange={(e) => setLegalRepresentative(e.target.value)} className="mt-1 block w-full border rounded p-2" />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Chứng nhận (phân cách bằng dấu phẩy)</span>
                <input value={certifications} onChange={(e) => setCertifications(e.target.value)} className="mt-1 block w-full border rounded p-2" />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Giới thiệu</span>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={6} className="mt-1 block w-full border rounded p-2" />
                <div className="text-xs text-gray-500 mt-1">{description.length} / 500 ký tự</div>
              </label>
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-500">{draftSaved ? 'Bản nháp đã lưu' : 'Chưa có bản nháp'}</div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => { localStorage.removeItem('sellerProfileDraft'); setDraftSaved(false); showSuccess('Bản nháp đã xóa'); }} className="px-3 py-2 border rounded">Xóa bản nháp</button>
                  <button type="button" onClick={handleSave} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded">{saving ? 'Đang lưu...' : 'Lưu & Đồng bộ'}</button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Preview</h3>
              <button onClick={() => setPreviewMode(!previewMode)} className="text-sm text-blue-600">{previewMode ? 'Ẩn' : 'Hiện'}</button>
            </div>
            {previewMode ? (
              <div className="bg-gray-50 p-4 rounded border">
                <h4 className="text-xl font-bold">{name || 'Tên công ty'}</h4>
                <div className="text-sm text-gray-600">Người liên hệ: {owner || '—'}</div>
                <p className="mt-3 text-sm text-gray-700">{description || 'Mô tả cửa hàng sẽ hiển thị ở đây.'}</p>
                <div className="mt-4 text-xs text-gray-500">Email: {email || '—'} • Điện thoại: {phone || '—'}</div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">Bấm "Hiện" để xem bản xem trước khi lưu.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerProfile;
