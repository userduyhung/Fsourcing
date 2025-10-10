import React from 'react';
import { Navigate } from 'react-router-dom';

interface BuyerProtectedRouteProps {
  children: React.ReactNode;
}

const BuyerProtectedRoute: React.FC<BuyerProtectedRouteProps> = ({ children }) => {
  const buyerToken = localStorage.getItem('buyerToken');
  
  if (!buyerToken) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

export default BuyerProtectedRoute;