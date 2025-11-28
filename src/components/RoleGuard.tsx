import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface RoleGuardProps {
  children: React.ReactNode;
  blockedRoles?: string[]; // roles that should NOT be allowed
  redirectTo?: string;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ children, blockedRoles = ['seller'], redirectTo = '/' }) => {
  const location = useLocation();
  const rawRole = (localStorage.getItem('userRole') || '').toLowerCase();
  const normalizedBlocked = blockedRoles.map(r => r.toLowerCase());
  const isBlocked = normalizedBlocked.includes(rawRole);

  React.useEffect(() => {
    if (isBlocked) {
      // Emit a global toast event so ToastListener can show a message
      try {
        window.dispatchEvent(new CustomEvent('app:toast', { detail: { message: 'Tài khoản nhà cung cấp không được truy cập trang này.', type: 'error', duration: 3000 } }));
      } catch (e) {
        // Fallback: simple alert if CustomEvent isn't available
        // eslint-disable-next-line no-alert
        alert('Tài khoản nhà cung cấp không được truy cập trang này.');
      }
    }
  }, [isBlocked]);

  if (isBlocked) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default RoleGuard;
