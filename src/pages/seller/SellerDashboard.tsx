import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaBoxOpen, FaClipboardList, FaBell } from 'react-icons/fa';
import { dashboardService } from '../../services/dashboardService';
import { productService } from '../../services/productService';
import { orderService } from '../../services/orderService';
import { notificationService } from '../../services/notificationService';
import { logger } from '../../utils/logger';

const SellerDashboard: React.FC = () => {
  const [sellerProfile, setSellerProfile] = useState<any | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [ordersCount, setOrdersCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        logger.info('SellerDashboard', '📊 Fetching dashboard data...');

        // Fetch all dashboard data in parallel including profile
        const [profileResp, productsResp, ordersResp] = await Promise.allSettled([
          dashboardService.getProfile(),
          productService.getMyProducts(),
          orderService.getReceivedOrders(1, 10)
        ]);

        if (!mounted) return;

        // Handle profile
        if (profileResp.status === 'fulfilled') {
          const profileData = profileResp.value;
          setSellerProfile(profileData);
          logger.info('SellerDashboard', '✅ Loaded seller profile', { profileData });
          
          // Check if profile is complete
          if (!profileData || !profileData.companyName) {
            logger.info('SellerDashboard', '⚠️ Profile incomplete - redirecting to profile edit');
            navigate('/seller/profile', { 
              state: { message: 'Vui lòng hoàn thành thông tin hồ sơ để tiếp tục' } 
            });
            return;
          }
          
          // Save to localStorage as backup
          if (profileData) {
            localStorage.setItem('sellerProfile', JSON.stringify(profileData));
          }
        } else {
          logger.warn('SellerDashboard', '⚠️ Failed to fetch profile, using localStorage fallback');
          const localProfile = localStorage.getItem('sellerProfile');
          const profile = localProfile ? JSON.parse(localProfile) : null;
          setSellerProfile(profile);
          
          // Check if profile is complete
          if (!profile || !profile.companyName) {
            logger.info('SellerDashboard', '⚠️ No profile found - redirecting to profile edit');
            navigate('/seller/profile', { 
              state: { message: 'Vui lòng hoàn thành thông tin hồ sơ để tiếp tục' } 
            });
            return;
          }
        }

        // Handle products
        if (productsResp.status === 'fulfilled') {
          const productsData = productsResp.value || [];
          setProducts(productsData);
          logger.info('SellerDashboard', `✅ Loaded ${productsData.length} products`);
          
          // Save to localStorage as backup
          localStorage.setItem('sellerProducts', JSON.stringify(productsData));
        } else {
          logger.warn('SellerDashboard', '⚠️ Failed to fetch products, using localStorage fallback');
          const localProducts = localStorage.getItem('sellerProducts');
          setProducts(localProducts ? JSON.parse(localProducts) : []);
        }

        // Handle orders
        if (ordersResp.status === 'fulfilled') {
          const ordersData = ordersResp.value?.data?.total || 0;
          setOrdersCount(ordersData);
          logger.info('SellerDashboard', `✅ Loaded orders count: ${ordersData}`);
        } else {
          logger.warn('SellerDashboard', '⚠️ Failed to fetch orders');
          setOrdersCount(0);
        }

        setIsLoading(false);
      } catch (err) {
        logger.error('SellerDashboard', '❌ Failed to fetch dashboard data', err);
        
        // Fallback to localStorage
        const localProducts = localStorage.getItem('sellerProducts');
        if (mounted) {
          setProducts(localProducts ? JSON.parse(localProducts) : []);
          setOrdersCount(0);
          setIsLoading(false);
        }
      }
    };

    fetchDashboardData();

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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-stretch">
              <div className="p-4 border rounded flex flex-col items-center justify-between h-full">
                <div className="w-full">
                  <FaUserCircle className="mx-auto w-12 h-12 text-blue-400 mb-3" />
                  <h4 className="font-semibold mb-2 text-center">Hoàn thiện hồ sơ</h4>
                  <p className="text-sm text-gray-500 mb-3 text-center">Thêm tên công ty, thông tin liên hệ và mô tả cửa hàng.</p>
                </div>
                <div className="w-full text-center mt-2">
                  <Link to="/seller/profile" className="inline-block bg-blue-600 text-white px-4 py-2 rounded">Chỉnh sửa hồ sơ</Link>
                </div>
              </div>
              <div className="p-4 border rounded flex flex-col items-center justify-between h-full">
                <div className="w-full">
                  <FaBoxOpen className="mx-auto w-12 h-12 text-green-400 mb-3" />
                  <h4 className="font-semibold mb-2 text-center">Tạo sản phẩm</h4>
                  <p className="text-sm text-gray-500 mb-3 text-center">Tạo sản phẩm đầu tiên để bắt đầu bán hàng trên nền tảng.</p>
                </div>
                <div className="w-full text-center mt-2">
                  <button onClick={() => navigate('/seller/add-product')} className="inline-block bg-green-600 text-white px-4 py-2 rounded">Thêm sản phẩm</button>
                </div>
              </div>
              <div className="p-4 border rounded flex flex-col items-center justify-between h-full">
                <div className="w-full">
                  <FaClipboardList className="mx-auto w-12 h-12 text-orange-400 mb-3" />
                  <h4 className="font-semibold mb-2 text-center">Quản lý đơn hàng</h4>
                  <p className="text-sm text-gray-500 mb-3 text-center">Khi có đơn hàng, chúng sẽ xuất hiện tại đây.</p>
                </div>
                <div className="w-full text-center mt-2">
                  <Link to="/seller/orders" className="inline-block bg-orange-600 text-white px-4 py-2 rounded">Xem đơn hàng</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const sellerName = sellerProfile?.companyName || sellerProfile?.legalRepresentative || 'Seller';
  const email = sellerProfile?.emailAddress || localStorage.getItem('userEmail') || '';
  const productsCount = products.length;

  // Show loading state
  if (isLoading) {
    return (
      <div className="bg-app min-h-screen font-sans flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-app min-h-screen font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="text-2xl font-bold mb-6">Bảng điều khiển Người bán</h2>
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 pb-4 border-b">
            <div>
              <div className="font-semibold text-lg">{sellerName}</div>
              <div className="text-gray-600 text-sm">Email: {email}</div>
            </div>
          </div>
          <div className="flex gap-6 flex-wrap">
            <div className="text-center">
              <div className="font-bold text-blue-600 text-xl">{productsCount}</div>
              <div className="text-xs text-gray-500">Sản phẩm đang bán</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-green-600 text-xl">{ordersCount}</div>
              <div className="text-xs text-gray-500">Đơn hàng đã bán</div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
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
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
