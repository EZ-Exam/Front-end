import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ShoppingCart, FileText, BarChart3 } from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface ChartData {
  name: string;
  value: number;
  icon: React.ComponentType<any>;
  color: string;
}

interface AdminChartsProps {
  stats: {
    totalUsers: number;
    newUsersToday?: number;
    totalOrders?: number;
    totalQuestions: number;
    totalExams: number;
    totalRevenue?: number;
  };
}

export function AdminCharts({ stats }: AdminChartsProps) {
  const chartData: ChartData[] = [
    {
      name: 'Total User',
      value: stats.totalUsers,
      icon: Users,
      color: 'from-blue-500 to-blue-600'
    },
    {
      name: 'Subscription',
      value: stats.totalOrders || 0,
      icon: ShoppingCart,
      color: 'from-green-500 to-green-600'
    },
    {
      name: 'Question',
      value: stats.totalQuestions,
      icon: FileText,
      color: 'from-purple-500 to-purple-600'
    },
    {
      name: 'Mock Test',
      value: stats.totalExams,
      icon: BarChart3,
      color: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {chartData.map((item) => {
        const Icon = item.icon;
        
        return (
          <Card key={item.name} className="relative overflow-hidden bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                {item.name}
              </CardTitle>
              <div className={`p-2 rounded-lg bg-gradient-to-r ${item.color}`}>
                <Icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {item.value.toLocaleString()}
              </div>
            </CardContent>
            
            {/* Background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-10 pointer-events-none`} />
          </Card>
        );
      })}
    </div>
  );
}

// Revenue Chart Component với Recharts
export function RevenueChart({ stats: _stats }: AdminChartsProps) {
  const revenueData = [
    { day: 'Week 1', revenue: 2100000, orders: 12 },
    { day: 'Week 2', revenue: 2800000, orders: 18 },
    { day: 'Week 3', revenue: 3200000, orders: 22 },
    { day: 'Week 4', revenue: 2900000, orders: 19 }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 p-3 border border-gray-600 rounded-lg shadow-lg">
          <p className="font-semibold text-white">{label}</p>
          <p className="text-blue-400">
            Revenue: {payload[0].value.toLocaleString('vi-VN')} VNĐ
          </p>
          <p className="text-green-400">
            Subscriptions: {payload[1].value} packages
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <BarChart3 className="h-5 w-5 text-blue-400" />
          Revenue & Subscriptions Chart
        </CardTitle>
        <CardDescription className="text-gray-400">
        Revenue and subscription packages within current month
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={revenueData}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="day" 
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#9CA3AF' }}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#9CA3AF' }}
              tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#3B82F6"
              fillOpacity={1}
              fill="url(#revenueGradient)"
              name="Revenue (VNĐ)"
              strokeWidth={3}
            />
            <Area
              type="monotone"
              dataKey="orders"
              stroke="#10B981"
              fillOpacity={1}
              fill="url(#ordersGradient)"
              name="Subscriptions"
              strokeWidth={3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// User Growth Chart Component với Recharts
export function UserGrowthChart({ stats: _stats }: AdminChartsProps) {
  const growthData = [
    { week: 'Week 1', users: 1200, newUsers: 15 },
    { week: 'Week 2', users: 1250, newUsers: 50 },
    { week: 'Week 3', users: 1280, newUsers: 30 },
    { week: 'Week 4', users: 1300, newUsers: 40 }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 p-3 border border-gray-600 rounded-lg shadow-lg">
          <p className="font-semibold text-white">{label}</p>
          <p className="text-purple-400">
            Total users: {payload[0].value.toLocaleString()}
          </p>
          <p className="text-green-400">
            New users: +{payload[1].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Users className="h-5 w-5 text-purple-400" />
          User Growth
        </CardTitle>
        <CardDescription className="text-gray-400">
          Number of users and new users within current month
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={growthData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="week" 
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#9CA3AF' }}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#9CA3AF' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="users"
              stroke="#8B5CF6"
              strokeWidth={3}
              dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8, stroke: '#8B5CF6', strokeWidth: 2 }}
              name="Total Users"
            />
            <Line
              type="monotone"
              dataKey="newUsers"
              stroke="#10B981"
              strokeWidth={3}
              dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8, stroke: '#10B981', strokeWidth: 2 }}
              name="New Users"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Subject Distribution Chart
export function SubjectDistributionChart() {
  const subjectData = [
    { name: 'Math', value: 25, color: '#3B82F6' },
    { name: 'Physics', value: 18, color: '#10B981' },
    { name: 'Chemistry', value: 15, color: '#F59E0B' },
    { name: 'Biology', value: 12, color: '#EF4444' },
    { name: 'Literature', value: 10, color: '#8B5CF6' },
    { name: 'English', value: 8, color: '#06B6D4' },
    { name: 'History', value: 7, color: '#84CC16' },
    { name: 'Geography', value: 5, color: '#F97316' }
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-gray-800 p-3 border border-gray-600 rounded-lg shadow-lg">
          <p className="font-semibold text-white">{data.name}</p>
          <p className="text-gray-300">{data.value}% total number of questions</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <FileText className="h-5 w-5 text-orange-400" />
          Distribution of Questions by Subject
        </CardTitle>
        <CardDescription className="text-gray-400">
         Percentage of questions by each subject within current month
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={subjectData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              paddingAngle={5}
              dataKey="value"
            >
              {subjectData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value) => (
                <span className="text-gray-300">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Subscription Package Distribution Chart
export function OrderStatusChart() {
  const subscriptionData = [
    { name: 'FREE', value: 45, color: '#6B7280' },
    { name: 'BASIC', value: 30, color: '#3B82F6' },
    { name: 'PREMIUM', value: 20, color: '#10B981' },
    { name: 'UNLIMITED', value: 5, color: '#F59E0B' }
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-gray-800 p-3 border border-gray-600 rounded-lg shadow-lg">
          <p className="font-semibold text-white">{data.name}</p>
          <p className="text-gray-300">{data.value}% người dùng</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <ShoppingCart className="h-5 w-5 text-green-400" />
          Distribution of Registration Packages
        </CardTitle>
        <CardDescription className="text-gray-400">
        Percentage of users subscribed to FREE, BASIC, PREMIUM and UNLIMITED plans
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={subscriptionData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              paddingAngle={5}
              dataKey="value"
            >
              {subscriptionData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value) => (
                <span className="text-gray-300">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}