import React from 'react';

const SupplierLogin: React.FC = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Kết nối API đăng nhập supplier (comment lại)
    /*
    try {
      const response = await fetch('/api/supplier-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!response.ok) throw new Error('Đăng nhập thất bại!');
      const data = await response.json();
      // Xử lý đăng nhập thành công, ví dụ lưu token, chuyển trang...
      alert('Đăng nhập thành công!');
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi!');
    }
    setIsLoading(false);
    return;
    */

    // Demo: kiểm tra email và password đơn giản
    setTimeout(() => {
      if (email === 'supplier@example.com' && password === '123456') {
        alert('Đăng nhập thành công!');
      } else {
        setError('Email hoặc mật khẩu không đúng!');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-app">
      <div className="bg-white rounded-lg shadow-lg p-10 max-w-md mx-auto text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Đăng nhập Supplier</h2>
        {/* Thông tin tài khoản demo */}
        <div className="mb-6 text-left text-sm bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
          <div className="font-semibold text-yellow-700 mb-1">Tài khoản demo Supplier:</div>
          <div><span className="font-medium">Email:</span> <span className="font-mono">supplier@example.com</span></div>
          <div><span className="font-medium">Mật khẩu:</span> <span className="font-mono">123456</span></div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="email"
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <input
              type="password"
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="Mật khẩu"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-base"
            disabled={isLoading}
          >
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SupplierLogin;
