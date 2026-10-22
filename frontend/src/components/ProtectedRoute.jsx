import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FullPageLoader } from './LoadingSpinner';
import Navbar from './Navbar';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <FullPageLoader message="Authenticating..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content-area">
        <div className="content-container">{children}</div>
      </main>
    </div>
  );
};

export default ProtectedRoute;
