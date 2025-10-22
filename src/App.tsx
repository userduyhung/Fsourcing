import React, { useState, useEffect } from 'react';
// Định nghĩa kiểu dữ liệu sản phẩm cho giỏ hàng
export type CartItem = {
  id: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
};
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Search, Shield, Globe, TrendingUp, Users, BarChart3, Package, Star, ArrowRight, Mail, Phone, MapPin, ShoppingCart } from 'lucide-react';
import Logo from './components/Logo';
import SearchBar from './components/SearchBar';
import ProductShowcase from './components/ProductShowcase';
import UserMenu from './components/UserMenu';
import { ProductList } from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import SellerLogin from './pages/seller/SellerLogin';
import SellerForgotPassword from './pages/seller/SellerForgotPassword';
import SellerChangePassword from './pages/seller/SellerChangePassword';
import SellerSearch from './pages/seller/SellerSearch';
import Register from './pages/Register';
import UnifiedRegister from './pages/UnifiedRegister';
import About from './pages/About';
import Services from './pages/Services';
import ChatWidget from './components/ChatWidget';
import CartModal from './components/CartModal';
import CartPage from './pages/buyer/CartPage';
import CheckoutPage from './pages/buyer/CheckoutPage';

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
import BuyerRFQList from './pages/buyer/BuyerRFQList';

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
      
      if ((adminToken || buyerToken || sellerToken) && userName && userRole) {
        setUser({name: userName, role: userRole});
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

  return (
    <Router>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Link to="/" className="flex items-center">
                  <Logo className="h-8 w-8" />
                  <span className="ml-2 text-xl font-bold text-gray-900">Fsourcing</span>
                </Link>
              </div>
              <nav className="hidden md:flex space-x-8">
                <Link to="/" className="text-gray-600 hover:text-blue-600 transition-colors">Suppliers</Link>
                <Link to="/products" className="text-gray-600 hover:text-blue-600 transition-colors">Products</Link>
                <Link to="/services" className="text-gray-600 hover:text-blue-600 transition-colors">Services</Link>
                <Link to="/about" className="text-gray-600 hover:text-blue-600 transition-colors">About</Link>
              </nav>
              <div className="flex items-center space-x-4">
                {user ? (
                  <>
                    {user.role === 'buyer' && (
                      <Link to="/cart" className="relative">
                        <ShoppingCart className="h-6 w-6 text-blue-600" />
                        {cart.length > 0 && (
                          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{cart.length}</span>
                        )}
                      </Link>
                    )}
                    <UserMenu userName={user.name} userRole={user.role} />
                  </>
                ) : (
                  <>
                    <Link to="/login" className="text-gray-600 hover:text-blue-600 transition-colors">Sign In</Link>
                    <Link to="/join" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">Join Now</Link>
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
              <ChatWidget />
              {/* Hero Section */}
              <section className="bg-gradient-to-br from-blue-50 to-indigo-100 pt-16 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                      Connect with Verified
                      <span className="text-blue-600"> Global Suppliers</span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                      Discover millions of products from trusted manufacturers worldwide. Streamline your sourcing process with our AI-powered B2B marketplace.
                    </p>
                    {/* Search Bar */}
                    <div className="mb-12">
                      <SearchBar />
                    </div>
                    {!(user && user.role === 'buyer') && (
                      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                        <button className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg">
                          Start Sourcing Now
                        </button>
                        <Link to="/supplier-register" className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-600 hover:text-white transition-colors">
                          Become a Supplier
                        </Link>
                      </div>
                    )}
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
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                          Why Choose Our Platform?
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                          Everything you need to source products efficiently and grow your business globally
                        </p>
                      </div>
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="text-center group">
                          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                            <Shield className="h-8 w-8 text-blue-600" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">Verified Suppliers</h3>
                          <p className="text-gray-600">All suppliers undergo rigorous verification to ensure authenticity and reliability.</p>
                        </div>
                        <div className="text-center group">
                          <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-teal-200 transition-colors">
                            <Search className="h-8 w-8 text-teal-600" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Search</h3>
                          <p className="text-gray-600">AI-powered search helps you find exactly what you need from millions of products.</p>
                        </div>
                        <div className="text-center group">
                          <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 transition-colors">
                            <TrendingUp className="h-8 w-8 text-orange-600" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">Market Insights</h3>
                          <p className="text-gray-600">Get real-time market data and trends to make informed sourcing decisions.</p>
                        </div>
                        <div className="text-center group">
                          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                            <Users className="h-8 w-8 text-green-600" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">Global Network</h3>
                          <p className="text-gray-600">Connect with suppliers from over 180 countries and regions worldwide.</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Supplier Directory Preview */}
                  <section className="py-20 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                          Featured Suppliers
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                          Discover top-rated suppliers across various industries
                        </p>
                      </div>
                      
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                          {
                            name: "TechManufacturing Co.",
                            country: "China",
                            products: "Electronics & Components",
                            rating: 4.9,
                            verified: true,
                            image: "https://images.pexels.com/photos/3862132/pexels-photo-3862132.jpeg"
                          },
                          {
                            name: "Global Textiles Ltd.",
                            country: "India",
                            products: "Clothing & Accessories",
                            rating: 4.8,
                            verified: true,
                            image: "https://images.pexels.com/photos/7876665/pexels-photo-7876665.jpeg"
                          },
                          {
                            name: "Industrial Solutions Inc.",
                            country: "Germany",
                            products: "Machinery & Equipment",
                            rating: 4.9,
                            verified: true,
                            image: "https://images.pexels.com/photos/3862373/pexels-photo-3862373.jpeg"
                          },
                          {
                            name: "Green Energy Systems",
                            country: "USA",
                            products: "Renewable Energy",
                            rating: 4.7,
                            verified: true,
                            image: "https://images.pexels.com/photos/2800832/pexels-photo-2800832.jpeg"
                          },
                          {
                            name: "Precision Parts Co.",
                            country: "Japan",
                            products: "Auto Parts & Accessories",
                            rating: 4.8,
                            verified: true,
                            image: "https://images.pexels.com/photos/3846080/pexels-photo-3846080.jpeg"
                          },
                          {
                            name: "Beauty & Care International",
                            country: "South Korea",
                            products: "Cosmetics & Personal Care",
                            rating: 4.9,
                            verified: true,
                            image: "https://images.pexels.com/photos/3018841/pexels-photo-3018841.jpeg"
                          }
                        ].map((supplier, index) => (
                          <div key={index} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer">
                            <div className="relative h-48">
                              <img
                                src={supplier.image}
                                alt={supplier.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              {supplier.verified && (
                                <div className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                                  Verified
                                </div>
                              )}
                            </div>
                            <div className="p-6">
                              <h3 className="text-xl font-semibold text-gray-900 mb-2">{supplier.name}</h3>
                              <p className="text-gray-600 mb-2">{supplier.country}</p>
                              <p className="text-blue-600 font-medium mb-4">{supplier.products}</p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                  <span className="text-gray-700 ml-1 font-medium">{supplier.rating}</span>
                                </div>
                                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="text-center mt-12">
                        <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                          View All Suppliers
                        </button>
                      </div>
                    </div>
                  </section>

                  {/* Dashboard Preview */}
                  <section className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                            Powerful Dashboard for Smart Sourcing
                          </h2>
                          <p className="text-xl text-gray-600 mb-8">
                            Manage your entire sourcing workflow from one intuitive dashboard. Track orders, analyze supplier performance, and optimize your procurement process.
                          </p>
                          
                          <div className="space-y-4 mb-8">
                            <div className="flex items-center">
                              <BarChart3 className="h-6 w-6 text-blue-600 mr-3" />
                              <span className="text-gray-700">Real-time analytics and reporting</span>
                            </div>
                            <div className="flex items-center">
                              <Package className="h-6 w-6 text-blue-600 mr-3" />
                              <span className="text-gray-700">Order tracking and management</span>
                            </div>
                            <div className="flex items-center">
                              <Users className="h-6 w-6 text-blue-600 mr-3" />
                              <span className="text-gray-700">Supplier relationship management</span>
                            </div>
                          </div>
                          
                          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                            Try Dashboard Demo
                          </button>
                        </div>
                        
                        <div className="relative">
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8">
                            <img
                              src="https://images.pexels.com/photos/590020/pexels-photo-590020.jpeg"
                              alt="Dashboard Analytics"
                              className="w-full rounded-lg shadow-2xl"
                            />
                          </div>
                          <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-xl">
                            <div className="flex items-center space-x-4">
                              <div className="bg-green-100 p-3 rounded-full">
                                <TrendingUp className="h-6 w-6 text-green-600" />
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Total Savings</p>
                                <p className="text-xl font-bold text-gray-900">$2.4M</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Ready to Transform Section */}
                  <section className="py-20 bg-blue-600">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                      <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                        Ready to Transform Your Sourcing?
                      </h2>
                      <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                        Join thousands of businesses already using our platform to streamline their global sourcing operations.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors">
                          Start Free Trial
                        </button>
                        <button className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                          Schedule Demo
                        </button>
                      </div>
                    </div>
                  </section>
                </>
              )}
            </>
          } />
          <Route path="/products" element={<ProductList addToCart={addToCart} />} />
          <Route path="/product/:id" element={<ProductDetail addToCart={addToCart} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unified-register" element={<UnifiedRegister />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/supplier-register" element={<Register />} />
          <Route path="/seller/login" element={<SellerLogin />} />
          <Route path="/seller/register" element={<Register />} />
          <Route path="/seller/forgot-password" element={<SellerForgotPassword />} />
          <Route path="/seller/change-password" element={<SellerChangePassword />} />
          <Route path="/seller/search" element={<SellerSearch />} />
          <Route path="/buyer/register" element={<BuyerRegister />} />
          <Route path="/buyer/forgot-password" element={<ForgotPassword />} />
          <Route path="/buyer/change-password" element={<ChangePassword />} />
          <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
          <Route path="/buyer/profile" element={<BuyerProfile />} />
          <Route path="/buyer/rfq-list" element={<BuyerRFQList />} />
          <Route path="/buyer/seller-detail/:id" element={<SellerDetail />} />
          <Route path="/admin/*" element={<AdminLayout />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/user-management" element={<UserManagement />} />
          <Route path="/admin/seller-approval" element={<SellerApproval />} />
          <Route path="/cart" element={<CartPage cart={cart} />} />
          <Route path="/checkout" element={<CheckoutPage cart={cart} />} />
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
                <p className="text-gray-400 mb-4 font-body">
                  The world's leading B2B marketplace connecting buyers with verified suppliers globally.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-cyan mr-2" />
                    <span className="text-gray-400 font-body">contact@fsourcing.com</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-cyan mr-2" />
                    <span className="text-gray-400 font-body">+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-cyan mr-2" />
                    <span className="text-gray-400 font-body">San Francisco, CA</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4 font-heading">For Buyers</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors font-body">Find Suppliers</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors font-body">Product Categories</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors font-body">Trade Alerts</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors font-body">Buyer Protection</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4 font-heading">For Suppliers</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors font-body">Sell on Platform</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors font-body">Supplier Membership</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors font-body">Marketing Tools</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors font-body">Success Stories</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4 font-heading">Company</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors font-body">About Us</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors font-body">News & Events</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors font-body">Careers</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors font-body">Contact</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 font-body">&copy; 2024 Fsourcing. All rights reserved.</p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-gray-400 hover:text-white transition-colors font-body">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors font-body">Terms of Service</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors font-body">Cookie Policy</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;