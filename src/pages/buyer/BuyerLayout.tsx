import React, { useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  User, 
  Search, 
  FileText, 
  Bell, 
  Star,
  Flag,
  LogOut,
  Menu,
  X,
  MessageCircle
} from 'lucide-react';

const BuyerLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Kiểm tra authentication khi component mount
  useEffect(() => {
    const buyerToken = localStorage.getItem('buyerToken');
    const userRole = localStorage.getItem('userRole');

    if (!buyerToken || userRole !== 'buyer') {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  // Get buyer profile from localStorage
  const buyerProfile = JSON.parse(localStorage.getItem('buyerProfile') || '{}');

  const handleLogout = () => {
    // Xóa tất cả thông tin buyer
    localStorage.removeItem('buyerToken');
    localStorage.removeItem('buyerProfile');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    
    // Dispatch event để App.tsx cập nhật state
    window.dispatchEvent(new Event('userLoggedIn'));
    
    // Redirect về trang login
    navigate('/login', { replace: true });
  };

  const menuItems = [
    { path: '/buyer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/buyer/profile', label: 'My Profile', icon: User },
    { path: '/buyer/sellers', label: 'Find Sellers', icon: Search },
    { path: '/buyer/rfq', label: 'My RFQs', icon: FileText },
    // { path: '/buyer/chat', label: 'Messages', icon: MessageCircle },
    { path: '/buyer/notifications', label: 'Notifications', icon: Bell },
    { path: '/buyer/reviews', label: 'My Reviews', icon: Star },
    { path: '/buyer/reports', label: 'Reports', icon: Flag },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className={`${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <Link to="/" className="flex items-center text-xl font-bold text-blue-600">
            <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-2 text-sm">F</span>
            Fsourcing
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="mt-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className="absolute bottom-0 w-64 p-6 border-t border-gray-200">
          <div className="mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{buyerProfile.fullName || 'Buyer'}</p>
                <p className="text-xs text-gray-500 truncate">{buyerProfile.company || 'Company'}</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden text-gray-400 hover:text-gray-600 mr-4"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h2 className="text-lg font-semibold text-gray-800">
                {menuItems.find(item => item.path === location.pathname)?.label || 'Buyer Portal'}
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell className="w-6 h-6 text-gray-400 hover:text-gray-600 cursor-pointer" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
              </div>
              <div className="text-sm text-gray-500">
                Welcome back, {buyerProfile.fullName?.split(' ')[0] || 'Buyer'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      {/* Floating Chat Button */}
      {/* {location.pathname !== '/buyer/chat' && (
        <Link
          to="/buyer/chat"
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110 z-50 group"
          title="Tin nhắn"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
            3
          </span>
          <span className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Tin nhắn (3 chưa đọc)
          </span>
        </Link>
      )} */}
    </div>
  );
};

export default BuyerLayout;