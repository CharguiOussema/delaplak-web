import React, { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuth, useAuthModal } from '../hooks';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Sign in/up no longer live at dedicated routes — an unauthenticated visit to a
// protected route bounces to "/" (the public home page) and opens the auth modal on
// top of it, resuming to the originally requested path on success.
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { open } = useAuthModal();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading || isAuthenticated) return;
    const target = `${location.pathname}${location.search}`;
    open('login', () => navigate(target, { replace: true }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
