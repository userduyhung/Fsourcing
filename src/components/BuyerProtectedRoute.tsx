import React from 'react';
import { Navigate } from 'react-router-dom';

interface BuyerProtectedRouteProps {
  children: React.ReactNode;
}

const BuyerProtectedRoute: React.FC<BuyerProtectedRouteProps> = ({ children }) => {
  const buyerToken = localStorage.getItem('buyerToken');
  const userRole = localStorage.getItem('userRole');
  
  // Kiểm tra cả token và role
  if (!buyerToken || userRole !== 'buyer') {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

export default BuyerProtectedRoute;