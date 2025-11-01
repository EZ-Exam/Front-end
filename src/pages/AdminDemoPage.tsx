import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/pages/auth/AuthContext';
import { Shield, Users, BarChart3, Settings } from 'lucide-react';

export function AdminDemoPage() {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const [demoMode, setDemoMode] = useState(false);

  const switchToAdmin = () => {
    // Simulate admin user
    const adminUser = {
      id: 'admin-1',
      fullName: 'Admin User',
      email: 'admin@ezexam.com',
      roleId: '2',
      balance: 1000000,
      subscriptionName: 'Premium',
      subscriptionTypeId: '3',
      subscriptionCode: 'PREMIUM',
      subscriptionEndDate: '2024-12-31',
      subscriptionIsActive: true,
    };
    
    setUser(adminUser);
    setDemoMode(true);
    
    toast({
      title: "Chuyển sang Admin Mode",
      description: "Bạn đã được chuyển sang chế độ admin demo",
    });
  };

  const switchToUser = () => {
    // Simulate regular user
    const regularUser = {
      id: 'user-1',
      fullName: 'Regular User',
      email: 'user@ezexam.com',
      roleId: '1',
      balance: 50000,
      subscriptionName: 'Basic',
      subscriptionTypeId: '1',
      subscriptionCode: 'BASIC',
      subscriptionEndDate: '2024-06-30',
      subscriptionIsActive: true,
    };
    
    setUser(regularUser);
    setDemoMode(false);
    
    toast({
      title: "Chuyển sang User Mode",
      description: "Bạn đã được chuyển sang chế độ user thường",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Admin Dashboard Demo
          </h1>
          <p className="text-gray-600 text-lg">
            Trang demo để test các tính năng admin dashboard
          </p>
        </div>

        {/* Current User Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Thông tin User hiện tại
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Tên:</Label>
                <p className="text-lg">{user?.fullName || 'Chưa đăng nhập'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Email:</Label>
                <p className="text-lg">{user?.email || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Role:</Label>
                <div className="flex items-center gap-2">
                  {user?.roleId === '2' ? (
                    <Shield className="h-4 w-4 text-red-500" />
                  ) : (
                    <Users className="h-4 w-4 text-blue-500" />
                  )}
                  <span className="text-lg font-medium">
                    {user?.roleId === '2' ? 'Admin' : user?.roleId === '1' ? 'User' : 'Moderator'}
                  </span>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Trạng thái Demo:</Label>
                <p className="text-lg">
                  {demoMode ? (
                    <span className="text-green-600 font-medium">Đang demo</span>
                  ) : (
                    <span className="text-gray-600">Bình thường</span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-500" />
                Admin Mode
              </CardTitle>
              <CardDescription>
                Chuyển sang chế độ admin để truy cập dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={switchToAdmin}
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={user?.roleId === '2'}
              >
                {user?.roleId === '2' ? 'Đã là Admin' : 'Chuyển sang Admin'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                User Mode
              </CardTitle>
              <CardDescription>
                Chuyển về chế độ user thường
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={switchToUser}
                variant="outline"
                className="w-full"
                disabled={user?.roleId === '1'}
              >
                {user?.roleId === '1' ? 'Đã là User' : 'Chuyển sang User'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Các tính năng Admin Dashboard
            </CardTitle>
            <CardDescription>
              Danh sách các tính năng đã được implement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-green-600">✅ Đã hoàn thành:</h4>
                <ul className="space-y-2 text-sm">
                  <li>• Thiết kế trang admin và dashboard</li>
                  <li>• Ghi nhận số user và số user tăng theo thời gian</li>
                  <li>• Ghi nhận số đơn hàng</li>
                  <li>• Khôi phục tài khoản cho user</li>
                  <li>• Ghi nhận số câu hỏi</li>
                  <li>• Ghi nhận số quiz và các thống kê khác</li>
                  <li>• Biểu đồ doanh thu theo tháng</li>
                  <li>• Biểu đồ tăng trưởng user</li>
                  <li>• Quản lý user với tìm kiếm và lọc</li>
                  <li>• Quản lý đơn hàng</li>
                  <li>• Quản lý câu hỏi</li>
                  <li>• Quản lý quiz</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-blue-600">🔧 Tính năng:</h4>
                <ul className="space-y-2 text-sm">
                  <li>• Dashboard với thống kê tổng quan</li>
                  <li>• Charts và biểu đồ trực quan</li>
                  <li>• Bảng dữ liệu với pagination</li>
                  <li>• Tìm kiếm và lọc dữ liệu</li>
                  <li>• Actions: Khôi phục, khóa tài khoản</li>
                  <li>• Responsive design</li>
                  <li>• Role-based access control</li>
                  <li>• Mock data để demo</li>
                  <li>• Toast notifications</li>
                  <li>• Loading states</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Hướng dẫn sử dụng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">1. Chuyển sang Admin Mode:</h4>
                <p>Nhấn nút "Chuyển sang Admin" để có quyền truy cập admin dashboard.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">2. Truy cập Admin Dashboard:</h4>
                <p>Sau khi chuyển sang admin, bạn có thể truy cập <code>/admin</code> hoặc click vào "Admin Dashboard" trong sidebar.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">3. Các tính năng có thể test:</h4>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Xem thống kê tổng quan</li>
                  <li>Xem biểu đồ doanh thu và tăng trưởng user</li>
                  <li>Quản lý user: tìm kiếm, khôi phục, khóa tài khoản</li>
                  <li>Xem danh sách đơn hàng</li>
                  <li>Xem danh sách câu hỏi và quiz</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
