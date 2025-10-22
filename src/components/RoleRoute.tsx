import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/pages/auth/AuthContext';

interface RoleRouteProps {
  children: React.ReactNode;
  requiredRole: string;
  fallbackPath?: string;
}

// Mapping roleId với tên role và path tương ứng
const ROLE_CONFIG = {
  '1': { name: 'User', path: '/' },
  '2': { name: 'Admin', path: '/admin' },
  '3': { name: 'Moderator', path: '/moderator' }
};

export function RoleRoute({ 
  children, 
  requiredRole, 
  fallbackPath 
}: RoleRouteProps) {
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
    return <Navigate to="/login" replace />;
  }

  // Kiểm tra role có đúng không
  if (user.roleId !== requiredRole) {
    // Nếu có fallbackPath được chỉ định, sử dụng nó
    if (fallbackPath) {
      return <Navigate to={fallbackPath} replace />;
    }
    
    // Nếu không, redirect về trang mặc định của role hiện tại
    const currentRoleConfig = ROLE_CONFIG[user.roleId as keyof typeof ROLE_CONFIG];
    if (currentRoleConfig) {
      return <Navigate to={currentRoleConfig.path} replace />;
    }
    
    // Fallback cuối cùng
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
