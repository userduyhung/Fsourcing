import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User } from 'lucide-react';
import authService from '../../services/authService';
import Toast from '../../components/Toast';
import { useApiToast } from '../../hooks/useApiToast';

const SellerRegister: React.FC = () => {
  const [company, setCompany] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const { toast, showLoading, showSuccess, showError, hideToast } = useApiToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!company.trim() || !contactName.trim() || !email.trim() || !password) {
      setError('Vui lòng nhập đầy đủ thông tin.');
      return;
    }

    // Kiểm tra email cơ bản
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Vui lòng nhập email hợp lệ.');
      return;
    }

    setIsLoading(true);
    showLoading('Đang đăng ký Seller...');

    try {
      // Call real API
      const response = await authService.register({
        email,
        password,
        fullName: contactName,
        company,
        role: 'seller'
      });

      console.log('==== SELLER REGISTER RESPONSE CHECK ====');
      console.log('Response:', response);
      console.log('Has success:', response.success);
      console.log('Has data:', !!response.data);
      console.log('Message:', response.message);
      console.log('========================================');

      // Check if registration successful based on actual backend response
      // Backend may return several formats: {success: true, data: {id}}, or {data: {user: {id}}}, or normalized {user: {id}}
      const r: any = response as any;
      const registeredId = r?.user?.id || r?.data?.id || r?.data?.user?.id || r?.id;
      if (response.success === true || registeredId) {
        // Show success toast
        setShowSuccessToast(true);
        showSuccess('Đăng ký Seller thành công! Đang chuyển đến trang đăng nhập...');

        // Store credentials temporarily for auto-fill on login page
        sessionStorage.setItem('registeredEmail', email);
        sessionStorage.setItem('registeredPassword', password);
        // Store contact name for display after login
        sessionStorage.setItem('registeredFullName', contactName);
        sessionStorage.setItem('registeredCompany', company);
        // Store returned id when available
        if (registeredId) sessionStorage.setItem('registeredId', String(registeredId));

        // Wait 5 seconds before redirecting to login
        setTimeout(() => {
          navigate('/login');
        }, 5000);
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
      <div className="min-h-screen flex items-center justify-center bg-app py-12 px-4 font-body">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center font-heading">Đăng ký Seller</h2>
        <p className="text-sm text-gray-500 mb-4 text-center font-body">Đăng ký công ty để bắt đầu bán hàng và kết nối với khách mua.</p>
        <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-xs text-yellow-800 font-body text-center">
            ⚠️ <strong>Lưu ý:</strong> Hệ thống đang dùng in-memory database. Sau khi đăng ký thành công, hãy đăng nhập ngay lập tức.
          </p>
        </div>
        {error && !error.includes('thành công') && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <p className="text-red-600 text-sm text-center font-body">{error}</p>
          </div>
        )}
        {error && error.includes('thành công') && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
            <p className="text-green-600 text-sm text-center font-body">{error}</p>
          </div>
        )}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2 font-body">Tên công ty</label>
          <div className="flex items-center border rounded px-3 py-2">
            <User className="w-5 h-5 text-gray-400 mr-2" />
            <input type="text" value={company} onChange={e => setCompany(e.target.value)} className="w-full outline-none font-body" placeholder="Tên công ty hoặc nhà máy" />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2 font-body">Người liên hệ</label>
          <div className="flex items-center border rounded px-3 py-2">
            <User className="w-5 h-5 text-gray-400 mr-2" />
            <input type="text" value={contactName} onChange={e => setContactName(e.target.value)} className="w-full outline-none font-body" placeholder="Họ và tên" />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2 font-body">Email liên hệ</label>
          <div className="flex items-center border rounded px-3 py-2">
            <Mail className="w-5 h-5 text-gray-400 mr-2" />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full outline-none font-body" placeholder="Địa chỉ email" />
          </div>
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2 font-body">Mật khẩu</label>
          <div className="flex items-center border rounded px-3 py-2">
            <Lock className="w-5 h-5 text-gray-400 mr-2" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full outline-none font-body" placeholder="Chọn mật khẩu bảo mật" />
          </div>
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition-colors font-body" disabled={isLoading}>
          {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
        </button>
        <div className="mt-4 flex justify-between text-sm">
          <Link to="/login" className="text-blue-600 hover:underline font-body">Đã có tài khoản? Đăng nhập</Link>
        </div>
        <div className="mt-6 text-sm text-gray-500 text-center font-body">Đăng ký seller sẽ được xác minh trước khi kích hoạt.</div>
      </form>
    </div>
    </>
  );
};

export default SellerRegister;
