import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/pages/auth/AuthContext';

interface ModeratorRouteProps {
  children: React.ReactNode;
}

export function ModeratorRoute({ children }: ModeratorRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.roleId !== '3') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

