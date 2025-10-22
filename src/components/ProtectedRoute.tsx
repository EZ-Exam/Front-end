import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/pages/auth/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  allowedRoles = ['1'], // Mặc định chỉ cho phép user (roleId = '1')
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();

  // Hiển thị loading khi đang kiểm tra authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Nếu chưa đăng nhập, redirect về login
  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Kiểm tra role có được phép truy cập không
  if (!allowedRoles.includes(user.roleId || '')) {
    // Redirect dựa trên role của user
    const roleId = user.roleId;
    if (roleId === '2') {
      return <Navigate to="/admin" replace />;
    } else if (roleId === '3') {
      return <Navigate to="/moderator" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}
