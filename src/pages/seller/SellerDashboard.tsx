import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaBoxOpen, FaClipboardList, FaBell } from 'react-icons/fa';

const SellerDashboard: React.FC = () => {
  const [sellerProfile, setSellerProfile] = useState<any | null>(null);
  const [products, setProducts] = useState<any[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    const sp = localStorage.getItem('sellerProfile');
    setSellerProfile(sp ? JSON.parse(sp) : null);

    // Fetch seller products from backend (server-only). If API unavailable, show empty list.
    let mounted = true;
    (async () => {
      try {
        const resp = await (await import('../../services/apiClient')).default.productsApi.list();
        const items = Array.isArray(resp) ? resp : (resp?.data || resp?.items || []);
        if (mounted) setProducts(items);
      } catch (err) {
        console.warn('Failed to fetch seller products for dashboard', err);
        if (mounted) setProducts([]);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const isNewSeller = !sellerProfile || ((!sellerProfile.company && !sellerProfile.fullName) && products.length === 0);

  if (isNewSeller) {
    return (
      <div className="bg-app min-h-screen font-sans flex items-center justify-center">
        <div className="max-w-3xl w-full mx-auto px-4 py-12">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Chào mừng Seller mới!</h2>
            <p className="text-gray-600 mb-6">Bạn vừa tạo tài khoản Seller — bảng điều khiển của bạn còn trống. Bắt đầu bằng cách thêm thông tin cửa hàng và tạo sản phẩm đầu tiên.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <FaUserCircle className="mx-auto w-12 h-12 text-blue-400 mb-3" />
                <h4 className="font-semibold mb-2">Hoàn thiện hồ sơ</h4>
                <p className="text-sm text-gray-500 mb-3">Thêm tên công ty, thông tin liên hệ và mô tả cửa hàng.</p>
                <Link to="/seller/profile" className="inline-block bg-blue-600 text-white px-4 py-2 rounded">Chỉnh sửa hồ sơ</Link>
              </div>
              <div className="p-4 border rounded">
                <FaBoxOpen className="mx-auto w-12 h-12 text-green-400 mb-3" />
                <h4 className="font-semibold mb-2">Tạo sản phẩm</h4>
                <p className="text-sm text-gray-500 mb-3">Tạo sản phẩm đầu tiên để bắt đầu bán hàng trên nền tảng.</p>
                <button onClick={() => navigate('/seller/add-product')} className="inline-block bg-green-600 text-white px-4 py-2 rounded">Thêm sản phẩm</button>
              </div>
              <div className="p-4 border rounded">
                <FaClipboardList className="mx-auto w-12 h-12 text-orange-400 mb-3" />
                <h4 className="font-semibold mb-2">Quản lý đơn hàng</h4>
                <p className="text-sm text-gray-500 mb-3">Khi có đơn hàng, chúng sẽ xuất hiện tại đây.</p>
                <Link to="/seller/orders" className="inline-block bg-orange-600 text-white px-4 py-2 rounded">Xem đơn hàng</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const sellerName = sellerProfile?.company || sellerProfile?.fullName || 'Seller';
  const email = sellerProfile?.email || '';
  const productsCount = products.length;
  const ordersCount = 0; // placeholder (could be wired to real data)
  const notificationsCount = 0;

  return (
    <div className="bg-app min-h-screen font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="text-2xl font-bold mb-6">Bảng điều khiển Người bán</h2>
        <div className="mb-8 bg-white rounded-lg shadow p-6 flex flex-col sm:flex-row items-center justify-between">
          <div>
            <div className="font-semibold text-lg">{sellerName}</div>
            <div className="text-gray-600 text-sm">Email: {email}</div>
          </div>
          <div className="flex gap-6 mt-4 sm:mt-0">
            <div className="text-center">
              <div className="font-bold text-blue-600 text-xl">{productsCount}</div>
              <div className="text-xs text-gray-500">Sản phẩm đang bán</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-green-600 text-xl">{ordersCount}</div>
              <div className="text-xs text-gray-500">Đơn hàng đã bán</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-red-600 text-xl">{notificationsCount}</div>
              <div className="text-xs text-gray-500">Thông báo mới</div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
            <FaUserCircle className="w-16 h-16 mb-4 text-blue-400" />
            <h3 className="font-semibold text-lg mb-2">Thông tin cá nhân</h3>
            <Link to="/seller/profile" className="text-blue-600 hover:underline">Xem chi tiết</Link>
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
            <FaBoxOpen className="w-16 h-16 mb-4 text-green-400" />
            <h3 className="font-semibold text-lg mb-2">Quản lý sản phẩm</h3>
            <Link to="/seller/products" className="text-blue-600 hover:underline">Xem danh sách sản phẩm</Link>
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
            <FaClipboardList className="w-16 h-16 mb-4 text-orange-400" />
            <h3 className="font-semibold text-lg mb-2">Quản lý đơn hàng</h3>
            <Link to="/seller/orders" className="text-blue-600 hover:underline">Xem danh sách đơn hàng</Link>
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
            <FaBell className="w-16 h-16 mb-4 text-red-400" />
            <h3 className="font-semibold text-lg mb-2">Thông báo mới</h3>
            <Link to="/seller/notifications" className="text-blue-600 hover:underline">Xem tất cả thông báo</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
