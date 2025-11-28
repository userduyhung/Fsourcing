import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Search, Shield, Globe, TrendingUp, Users, BarChart3, Package, Star, ArrowRight, Mail, Phone, MapPin, ShoppingCart, MessageCircle } from 'lucide-react';
import Logo from './components/Logo';
import SearchBar from './components/SearchBar';
import ProductShowcase from './components/ProductShowcase';
import UserMenu from './components/UserMenu';
import RoleGuard from './components/RoleGuard';
import BuyerProtectedRoute from './components/BuyerProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import { ProductList } from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import LoginPage from './pages/LoginPage';
import AdminLogin from './pages/admin/AdminLogin';
// ...existing code...
import SellerDashboard from './pages/seller/SellerDashboard';
import SellerForgotPassword from './pages/seller/SellerForgotPassword';
import SellerChangePassword from './pages/seller/SellerChangePassword';
import SellerProducts from './pages/seller/SellerProducts';
import AddProduct from './pages/seller/AddProduct';
import EditProduct from './pages/seller/EditProduct';
// ...existing code...
import SellerRegister from './pages/seller/SellerRegister';
import SellerNotifications from './pages/seller/SellerNotifications';

import UnifiedRegister from './pages/UnifiedRegister';
import About from './pages/About';
import Services from './pages/Services';
import SuccessStories from './pages/SuccessStories';
import ChatWidget from './components/ChatWidget';
import CartModal from './components/CartModal';
import ToastListener from './components/ToastListener';
import CartPage from './pages/buyer/CartPage';
import CheckoutPage from './pages/buyer/CheckoutPage';
import { getCart } from './services/cartService';
import { sanitizeCartItems } from './utils/cartValidation';

import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import SellerApproval from './pages/admin/SellerApproval';
import BuyerRegister from './pages/buyer/BuyerRegister';
import ForgotPassword from './pages/buyer/ForgotPassword';
import ChangePassword from './pages/buyer/ChangePassword';
import BuyerDashboard from './pages/buyer/BuyerDashboard';
import BuyerProfile from './pages/buyer/BuyerProfile';
import SellerDetail from './pages/buyer/SellerDetail';
import SellerProfile from './pages/seller/SellerProfile';
import OrderList from './pages/buyer/OrderList';
import SellerOrderList from './pages/seller/OrderList';
import SellerOrderDetail from './pages/seller/OrderDetail';
import OrderDetail from './pages/buyer/OrderDetail';
import PaymentSuccess from './pages/buyer/PaymentSuccess';
import ChatPage from './pages/buyer/ChatPage';
import { CartItem } from './types';
import { useParams } from 'react-router-dom';

// Wrapper to extract productId from URL params and pass to EditProduct
const EditProductWrapper = () => {
  const { id } = useParams();
  const productId = id || '';
  return <EditProduct productId={productId} />;
}

function App() {
  const [user, setUser] = useState<{name: string, role: string} | null>(null);
  // State giỏ hàng
  const [cart, setCart] = useState<CartItem[]>([]);
  // State hiển thị modal giỏ hàng
  const [showCart, setShowCart] = useState(false);

  // Hàm thêm sản phẩm vào giỏ hàng
  const addToCart = (product: Omit<CartItem, 'quantity'>) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        // Nếu đã có, tăng số lượng
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        // Nếu chưa có, thêm mới
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  useEffect(() => {
    const checkUserSession = () => {
      const adminToken = localStorage.getItem('adminToken');
      const buyerToken = localStorage.getItem('buyerToken');
      const sellerToken = localStorage.getItem('sellerToken');
      const userName = localStorage.getItem('userName');
      const userRole = localStorage.getItem('userRole');
      
      // Nếu là buyer mà chưa có userName, lấy từ buyerProfile
      if (buyerToken && (!userName || !userRole)) {
        const buyerProfile = localStorage.getItem('buyerProfile');
        if (buyerProfile) {
          try {
            const profile = JSON.parse(buyerProfile);
            if (profile && (profile.fullName || profile.name)) {
              setUser({ name: profile.fullName || profile.name || 'Buyer', role: 'buyer' });
              return;
            }
          } catch (error) {
            console.error('Failed to parse buyerProfile:', error);
            // Fall through to normal validation
          }
        }
      }
      
      // Nếu là seller mà chưa có userName, lấy từ sellerProfile
      if (sellerToken && (!userName || !userRole)) {
        const sellerProfile = localStorage.getItem('sellerProfile');
        if (sellerProfile) {
          try {
            const profile = JSON.parse(sellerProfile);
            // Seller profile có thể có companyName hoặc contactName hoặc fullName
            if (profile && (profile.companyName || profile.contactName || profile.fullName || profile.name)) {
              const displayName = profile.companyName || profile.contactName || profile.fullName || profile.name || 'Seller';
              setUser({ name: displayName, role: 'seller' });
              return;
            }
          } catch (error) {
            console.error('Failed to parse sellerProfile:', error);
            // Fall through to normal validation
          }
        }
      }
      
      if ((adminToken || buyerToken || sellerToken) && userName && userRole) {
        setUser({ name: userName, role: userRole });
      } else {
        setUser(null);
      }
    };

    checkUserSession();
    
    // Listen for storage changes (when user logs in from another tab)
    window.addEventListener('storage', checkUserSession);
    
    // Listen for login events
    window.addEventListener('userLoggedIn', checkUserSession);
    
    return () => {
      window.removeEventListener('storage', checkUserSession);
      window.removeEventListener('userLoggedIn', checkUserSession);
    };
  }, []);

  // Load cart from localStorage and sync with state
  useEffect(() => {
    const loadCart = async () => {
      try {
        const stored = await getCart();
        setCart(sanitizeCartItems(stored.items as any));
      } catch (e) {
        console.error('Failed to load cart:', e);
      }
    };

    loadCart();

    // Listen for cart changes from localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'localCart') {
        loadCart();
      }
    };

    // Custom event for cart updates within the same tab
    const handleCartUpdate = () => {
      loadCart();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <ToastListener />
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Link to="/" className="flex items-center">
                  <Logo className="h-8 w-8" />
                  <span className="ml-2 text-xl font-bold text-gray-900 font-sans">Fsourcing</span>
                </Link>
              </div>
              <nav className="hidden md:flex space-x-8 font-sans">
                {/* If logged-in user is a seller, show only seller dashboard link; hide buyer-facing product listing */}
                {user && user.role === 'seller' ? (
                  <Link to="/seller/dashboard" className="text-gray-600 hover:text-blue-600 transition-colors">Dashboard nhà cung cấp</Link>
                ) : (
                  <>
                    <Link to="/products" className="text-gray-600 hover:text-blue-600 transition-colors">Sản phẩm</Link>
                    <Link to="/services" className="text-gray-600 hover:text-blue-600 transition-colors">Dịch vụ</Link>
                    <Link to="/about" className="text-gray-600 hover:text-blue-600 transition-colors">Giới thiệu</Link>
                  </>
                )}
              </nav>
              <div className="flex items-center space-x-4">
                {user && user.role ? (
                  <>
                    {user.role === 'buyer' && (
                      <>
                        {/* <Link to="/buyer/chat" className="relative text-gray-600 hover:text-blue-600 transition-colors" title="Tin nhắn">
                          <MessageCircle className="h-6 w-6" />
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                            3
                          </span>
                        </Link> */}
                        <Link to="/cart" className="relative">
                          <ShoppingCart className="h-6 w-6 text-blue-600" />
                          {cart.length > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{cart.length}</span>
                          )}
                        </Link>
                      </>
                    )}
                    <UserMenu userName={user.name} userRole={user.role} />
                  </>
                ) : (
                  <>
                    <Link to="/login" className="text-gray-600 hover:text-blue-600 transition-colors">Đăng nhập</Link>
                    <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">Đăng ký</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>
        {/* Hiển thị modal giỏ hàng */}
        {showCart && (
          <CartModal cart={cart} onClose={() => setShowCart(false)} />
        )}
        {/* Main Routes */}
        <Routes>
          <Route path="/" element={
            <>
              {/* <ChatWidget /> */}
              {/* Hero Section */}
              <section className="bg-gradient-to-br from-blue-50 to-indigo-100 pt-16 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 font-sans">
                      <span className="inline-block">Khám phá sản phẩm chất lượng</span>
                      <span className="text-blue-600 inline-block"> cho doanh nghiệp của bạn</span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto font-sans">
                      Tìm các sản phẩm đáng tin cậy, tối ưu hóa quy trình mua sắm với nền tảng B2B tiện lợi.
                    </p>
                    {/* Search Bar */}
                    <div className="mb-12">
                      <SearchBar />
                    </div>
                    {/* Supplier CTAs removed temporarily */}
                    <div className="relative max-w-4xl mx-auto">
                      <div className="bg-white rounded-xl shadow-2xl p-4">
                        <img
                          src="https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg"
                          alt="Global Trade Platform"
                          className="w-full h-96 object-cover rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              <ProductShowcase addToCart={addToCart} />
              
              {/* Các section chỉ hiển thị khi chưa đăng nhập Buyer */}
              {!(user && user.role === 'buyer') && (
                <>
                  {/* Features Section */}
                  <section className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-sans">
                          Vì sao chọn Fsourcing?
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto font-sans">
                          Tất cả những gì bạn cần để mua hàng hiệu quả và phát triển kinh doanh toàn cầu
                        </p>
                      </div>
                      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
                        <div className="text-center group">
                          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                            <Shield className="h-8 w-8 text-blue-600" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2 font-sans">Đối tác đã xác thực</h3>
                          <p className="text-gray-600 font-sans">Tất cả đối tác đều được kiểm duyệt nghiêm ngặt để đảm bảo uy tín và chất lượng.</p>
                        </div>
                        {/* <div className="text-center group">
                          <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                            <MessageCircle className="h-8 w-8 text-purple-600" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2 font-sans">Chat trực tiếp</h3>
                          <p className="text-gray-600 font-sans">Liên hệ và trao đổi trực tiếp với nhà cung cấp qua hệ thống chat tích hợp.</p>
                        </div> */}
                        <div className="text-center group">
                          <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-teal-200 transition-colors">
                            <Search className="h-8 w-8 text-teal-600" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2 font-sans">Tìm kiếm thông minh</h3>
                          <p className="text-gray-600 font-sans">Tìm kiếm thông minh giúp bạn dễ dàng tìm đúng sản phẩm cần thiết.</p>
                        </div>
                        <div className="text-center group">
                          <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 transition-colors">
                            <TrendingUp className="h-8 w-8 text-orange-600" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2 font-sans">Thông tin thị trường</h3>
                          <p className="text-gray-600 font-sans">Cập nhật dữ liệu và xu hướng thị trường để ra quyết định mua hàng chính xác.</p>
                        </div>
                        <div className="text-center group">
                          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                            <Users className="h-8 w-8 text-green-600" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2 font-sans">Mạng lưới toàn cầu</h3>
                          <p className="text-gray-600 font-sans">Kết nối với nhà cung cấp từ hơn 180 quốc gia và vùng lãnh thổ.</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Supplier directory preview removed temporarily */}

                  {/* Dashboard and Ready-to-Transform sections removed per request */}
                </>
              )}
            </>
          } />
          <Route path="/products" element={
            <RoleGuard blockedRoles={['seller']} redirectTo={'/seller/dashboard'}>
              <ProductList addToCart={addToCart} />
            </RoleGuard>
          } />
          <Route path="/product/:id" element={<ProductDetail addToCart={addToCart} />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/buyer/login" element={<LoginPage />} />
          <Route path="/seller/login" element={<LoginPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          // ...existing code...
          <Route path="/register" element={<UnifiedRegister />} />
          <Route path="/unified-register" element={<UnifiedRegister />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/success-stories" element={<SuccessStories />} />
          <Route path="/seller/register" element={<SellerRegister />} />
          <Route path="/seller/dashboard" element={<SellerDashboard />} />
          <Route path="/seller/products" element={<SellerProducts />} />
          <Route path="/seller/profile" element={<SellerProfile />} />
          <Route path="/seller/notifications" element={<SellerNotifications />} />
          <Route path="/seller/orders" element={<SellerOrderList />} />
          <Route path="/seller/order-detail/:id" element={<SellerOrderDetail />} />
          <Route path="/seller/add-product" element={<AddProduct />} />
          <Route path="/seller/edit-product/:id" element={
            <EditProductWrapper />
          } />
          {/* <Route path="/supplier/register" element={<SupplierRegister />} /> */}
          <Route path="/seller/forgot-password" element={<SellerForgotPassword />} />
          <Route path="/seller/change-password" element={<SellerChangePassword />} />
          <Route path="/buyer/register" element={<BuyerRegister />} />
          <Route path="/buyer/forgot-password" element={<ForgotPassword />} />
          <Route path="/buyer/change-password" element={
            <BuyerProtectedRoute>
              <ChangePassword />
            </BuyerProtectedRoute>
          } />
          <Route path="/buyer/dashboard" element={
            <BuyerProtectedRoute>
              <BuyerDashboard />
            </BuyerProtectedRoute>
          } />
          <Route path="/buyer/profile" element={
            <BuyerProtectedRoute>
              <BuyerProfile />
            </BuyerProtectedRoute>
          } />
          {/* <Route path="/buyer/chat" element={
            <BuyerProtectedRoute>
              <ChatPage />
            </BuyerProtectedRoute>
          } /> */}
          <Route path="/buyer/rfq-list" element={
            <BuyerProtectedRoute>
              <OrderList />
            </BuyerProtectedRoute>
          } />
          <Route path="/buyer/order-detail" element={
            <BuyerProtectedRoute>
              <OrderDetail />
            </BuyerProtectedRoute>
          } />
          <Route path="/buyer/seller-detail/:id" element={<SellerDetail />} />
          <Route path="/seller-detail/:id" element={<SellerDetail />} />
          <Route path="/buyer/payment-success" element={
            <BuyerProtectedRoute>
              <PaymentSuccess />
            </BuyerProtectedRoute>
          } />
          <Route path="/admin/*" element={<AdminLayout />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/user-management" element={<UserManagement />} />
          <Route path="/admin/seller-approval" element={<SellerApproval />} />
          <Route path="/cart" element={
            <BuyerProtectedRoute>
              <CartPage />
            </BuyerProtectedRoute>
          } />
          <Route path="/buyer/checkout" element={
            <BuyerProtectedRoute>
              <CheckoutPage onClearCart={() => setCart([])} />
            </BuyerProtectedRoute>
          } />
        </Routes>
        {/* Footer */}
        <footer className="bg-slate-dark text-white pt-16 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center mb-4">
                  <Globe className="h-8 w-8 text-cyan" />
                  <span className="ml-2 text-xl font-bold font-heading">Fsourcing</span>
                </div>
                <p className="text-gray-400 mb-4 font-body font-sans">
                  Nền tảng B2B hàng đầu kết nối doanh nghiệp Việt Nam với nhà cung cấp uy tín trên toàn thế giới.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-cyan mr-2" />
                    <span className="text-gray-400 font-body">hotro@fsourcing.com</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-cyan mr-2" />
                    <span className="text-gray-400 font-body">(+84) 888 123 456</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-cyan mr-2" />
                    <span className="text-gray-400 font-body">Hà Nội, Việt Nam</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 font-heading font-sans">Dành cho người mua</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors font-body font-sans">Tìm nhà cung cấp</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors font-body font-sans">Danh mục sản phẩm</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors font-body font-sans">Thông báo giao dịch</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors font-body font-sans">Bảo vệ người mua</a></li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 font-heading font-sans">Dành cho nhà cung cấp</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors font-body font-sans">Bán hàng trên Fsourcing</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors font-body font-sans">Quyền lợi thành viên</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors font-body font-sans">Công cụ tiếp thị</a></li>
                  <li><Link to="/success-stories" className="text-gray-400 hover:text-white transition-colors font-body font-sans">Câu chuyện thành công</Link></li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 font-heading font-sans">Về Fsourcing</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors font-body font-sans">Giới thiệu công ty</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors font-body font-sans">Tin tức & Sự kiện</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors font-body font-sans">Tuyển dụng</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors font-body font-sans">Liên hệ</a></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 font-body">&copy; 2024 Fsourcing. Bản quyền thuộc về Công ty TNHH Fsourcing Việt Nam.</p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-gray-400 hover:text-white transition-colors font-body font-sans">Chính sách bảo mật</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors font-body font-sans">Điều khoản sử dụng</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors font-body font-sans">Chính sách Cookie</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;