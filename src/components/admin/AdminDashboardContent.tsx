import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminStats } from '@/types';
import { AdminCharts, RevenueChart, UserGrowthChart, SubjectDistributionChart, OrderStatusChart } from '@/components/admin/AdminCharts';

interface AdminDashboardContentProps {
  stats: AdminStats;
}

export function AdminDashboardContent({ stats }: AdminDashboardContentProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-gray-400 mt-2">Systematic overview and statistics</p>
      </div>

      {/* Stats Cards */}
      <AdminCharts stats={stats} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart stats={stats} />
        <UserGrowthChart stats={stats} />
      </div>

      {/* Additional Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SubjectDistributionChart />
        <OrderStatusChart />
      </div>

      {/* Quick Actions */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Quick action</CardTitle>
          <CardDescription className="text-gray-400">
            Commonly used operations in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer">
              <div className="text-blue-400 font-semibold">Tổng Users</div>
              <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer">
              <div className="text-green-400 font-semibold">Tổng Questions</div>
              <div className="text-2xl font-bold text-white">{stats.totalQuestions}</div>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer">
              <div className="text-purple-400 font-semibold">Tổng Exams</div>
              <div className="text-2xl font-bold text-white">{stats.totalExams}</div>
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
