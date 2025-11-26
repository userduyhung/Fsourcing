import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface BuyerProtectedRouteProps {
  children: React.ReactNode;
}

const BuyerProtectedRoute: React.FC<BuyerProtectedRouteProps> = ({ children }) => {
  const buyerToken = localStorage.getItem('buyerToken');
  const userRole = localStorage.getItem('userRole');
  const location = useLocation();

  // Kiểm tra cả token và role
  if (!buyerToken || userRole !== 'buyer') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  
  return <>{children}</>;
};

export default BuyerProtectedRoute;