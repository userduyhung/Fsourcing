import React, { useState, useRef, useEffect } from 'react';
import { User, ChevronDown, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LogoutModal from './LogoutModal';

interface UserMenuProps {
  userName: string;
  userRole: string;
}

const UserMenu: React.FC<UserMenuProps> = ({ userName, userRole }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'buyer':
        return 'bg-blue-100 text-blue-800';
      case 'seller':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDashboardUrl = (role: string) => {
    switch (role) {
      case 'admin':
        return '/admin/dashboard';
      case 'buyer':
        return '/buyer/dashboard';
      case 'seller':
        return '/products';
      default:
        return '/';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('buyerToken');
    localStorage.removeItem('sellerToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    setShowLogoutModal(false);
    navigate('/');
    window.location.reload();
  };

  const handleProfileClick = () => {
    const dashboardUrl = getDashboardUrl(userRole);
    navigate(dashboardUrl);
    setIsOpen(false);
  };

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
        >
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div className="hidden md:block text-left">
            <div className="text-sm font-medium">{userName}</div>
            <div className={`text-xs px-2 py-0.5 rounded-full inline-block ${getRoleBadgeColor(userRole)}`}>
              {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-50">
            <div className="px-4 py-2 border-b">
              <div className="text-sm font-medium text-gray-900">{userName}</div>
              <div className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1 ${getRoleBadgeColor(userRole)}`}>
                {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
              </div>
            </div>
            
            <button
              onClick={handleProfileClick}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Settings className="w-4 h-4 mr-3" />
              Dashboard
            </button>
            
            <button
              onClick={() => {
                setShowLogoutModal(true);
                setIsOpen(false);
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Đăng xuất
            </button>
          </div>
        )}
      </div>

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        userName={userName}
      />
    </>
  );
};

export default UserMenu;