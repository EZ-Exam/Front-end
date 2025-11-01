import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/pages/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, Shield } from 'lucide-react';

interface AccessDeniedProps {
  message?: string;
  showBackButton?: boolean;
}

export function AccessDenied({ 
  message = "Bạn không có quyền truy cập vào trang này", 
  showBackButton = true 
}: AccessDeniedProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGoHome = () => {
    const roleId = user?.roleId;
    if (roleId === '2') {
      navigate('/admin');
    } else if (roleId === '3') {
      navigate('/moderator');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Truy cập bị từ chối
          </h1>
          <p className="text-gray-600 mb-6">
            {message}
          </p>
        </div>

        <div className="space-y-4">
          {showBackButton && (
            <Button 
              onClick={handleGoHome}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Home className="h-4 w-4 mr-2" />
              Về trang chủ
            </Button>
          )}
          
          <Button 
            variant="outline" 
            onClick={() => navigate('/login')}
            className="w-full"
          >
            <Shield className="h-4 w-4 mr-2" />
            Đăng nhập lại
          </Button>
        </div>

        {user && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Role hiện tại:</strong> {
                user.roleId === '1' ? 'User' :
                user.roleId === '2' ? 'Admin' :
                user.roleId === '3' ? 'Moderator' : 'Không xác định'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
