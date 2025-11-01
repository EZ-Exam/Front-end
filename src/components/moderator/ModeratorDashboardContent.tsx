import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminStats } from '@/types';

interface ModeratorDashboardContentProps {
  stats: AdminStats;
}

export function ModeratorDashboardContent({ stats }: ModeratorDashboardContentProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Moderator Dashboard</h1>
        <p className="text-gray-400 mt-2">Tổng quan và thống kê quản lý nội dung</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-purple-900 to-purple-800 border-purple-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">
              Tổng Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats.totalQuestions}</div>
            <p className="text-xs text-purple-200 mt-1">
              Câu hỏi trong hệ thống
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-900 to-blue-800 border-blue-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">
              Tổng Exams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats.totalExams}</div>
            <p className="text-xs text-blue-200 mt-1">
              Đề thi trong hệ thống
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900 to-green-800 border-green-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-100">
              Tổng Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats.totalUsers}</div>
            <p className="text-xs text-green-200 mt-1">
              Người dùng trong hệ thống
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Thao tác nhanh</CardTitle>
          <CardDescription className="text-gray-400">
            Các chức năng thường dùng trong quản lý nội dung
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer">
              <div className="text-purple-400 font-semibold">Questions</div>
              <div className="text-2xl font-bold text-white">{stats.totalQuestions}</div>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer">
              <div className="text-blue-400 font-semibold">Exams</div>
              <div className="text-2xl font-bold text-white">{stats.totalExams}</div>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer">
              <div className="text-green-400 font-semibold">Users</div>
              <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer">
              <div className="text-orange-400 font-semibold">Doanh thu</div>
              <div className="text-2xl font-bold text-white">
                {stats.totalRevenue?.toLocaleString('vi-VN') || '0'} VNĐ
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

