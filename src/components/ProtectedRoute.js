import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, userType }) => {
  const { currentUser, userType: currentUserType } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (userType && currentUserType !== userType) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute; 