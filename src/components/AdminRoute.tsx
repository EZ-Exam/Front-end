import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/pages/auth/AuthContext';

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.roleId !== '2') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
