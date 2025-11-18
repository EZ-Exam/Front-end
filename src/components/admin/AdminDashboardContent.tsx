import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminStats, AdminPayment } from '@/types';
import { AdminCharts } from '@/components/admin/AdminCharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, defs, linearGradient, stop } from 'recharts';
import { useLanguage } from '@/contexts/LanguageContext';

interface AdminDashboardContentProps {
  stats: AdminStats;
  topupPayments?: AdminPayment[];
  subscriptionPayments?: AdminPayment[];
  allUsers?: any[];
  subscriptionTypes?: { id: number; subscriptionName: string }[];
  isLoading?: boolean;
}

export function AdminDashboardContent({ stats, topupPayments = [], subscriptionPayments = [], allUsers = [], subscriptionTypes = [], isLoading = false }: AdminDashboardContentProps) {
  const { t } = useLanguage();
  
  // Tính giao dịch QR theo thời gian (30 ngày gần nhất, nhóm theo ngày)
  const getWeeklyQRData = () => {
    const days: { [key: string]: number } = {};
    const today = new Date();
    const daysToShow = 30; // Hiển thị 30 ngày gần nhất
    
    // Khởi tạo tất cả các ngày
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayKey = date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' });
      days[dayKey] = 0;
    }

    // Đếm QR transactions theo ngày
    topupPayments.filter(p => p.paymentGatewayTransactionId).forEach(payment => {
      const paymentDate = new Date(payment.createdAt);
      const diffDays = Math.floor((today.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays < daysToShow) {
        const dayKey = paymentDate.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' });
        if (days[dayKey] !== undefined) {
          days[dayKey]++;
        }
      }
    });

    // Nhóm lại thành các điểm dữ liệu
    const groupedData: { [key: string]: number } = {};
    const entries = Object.entries(days);
    const groupSize = Math.max(1, Math.floor(entries.length / 10)); // Tối đa 10 điểm trên chart
    
    for (let i = 0; i < entries.length; i += groupSize) {
      const group = entries.slice(i, i + groupSize);
      const groupKey = group[0][0] + (group.length > 1 ? ` - ${group[group.length - 1][0]}` : '');
      const groupValue = group.reduce((sum, [, value]) => sum + value, 0);
      groupedData[groupKey] = groupValue;
    }

    return Object.entries(groupedData).map(([name, value]) => ({ name, value }));
  };

  // Tính total users theo thời gian (30 ngày gần nhất, nhóm theo ngày)
  const getWeeklyUsersData = () => {
    const days: { [key: string]: number } = {};
    const today = new Date();
    const daysToShow = 30; // Hiển thị 30 ngày gần nhất
    
    // Khởi tạo tất cả các ngày
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayKey = date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' });
      days[dayKey] = 0;
    }

    // Đếm users theo ngày tạo
    if (allUsers && allUsers.length > 0) {
      allUsers.forEach(user => {
        if (user.createdAt) {
          const userDate = new Date(user.createdAt);
          const diffDays = Math.floor((today.getTime() - userDate.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays >= 0 && diffDays < daysToShow) {
            const dayKey = userDate.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' });
            if (days[dayKey] !== undefined) {
              days[dayKey]++;
            }
          }
        }
      });
    }

    // Nhóm lại thành các điểm dữ liệu (có thể nhóm 3-5 ngày một để giảm số lượng điểm)
    const groupedData: { [key: string]: number } = {};
    const entries = Object.entries(days);
    const groupSize = Math.max(1, Math.floor(entries.length / 10)); // Tối đa 10 điểm trên chart
    
    for (let i = 0; i < entries.length; i += groupSize) {
      const group = entries.slice(i, i + groupSize);
      const groupKey = group[0][0] + (group.length > 1 ? ` - ${group[group.length - 1][0]}` : '');
      const groupValue = group.reduce((sum, [, value]) => sum + value, 0);
      groupedData[groupKey] = groupValue;
    }

    return Object.entries(groupedData).map(([name, value]) => ({ name, value }));
  };

  // Tính subscription theo thời gian (30 ngày gần nhất, nhóm theo ngày)
  const getWeeklySubscriptionData = () => {
    const days: { [key: string]: number } = {};
    const today = new Date();
    const daysToShow = 30; // Hiển thị 30 ngày gần nhất
    
    // Khởi tạo tất cả các ngày
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayKey = date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' });
      days[dayKey] = 0;
    }

    // Đếm subscriptions theo ngày
    subscriptionPayments.forEach(payment => {
      const paymentDate = new Date(payment.createdAt);
      const diffDays = Math.floor((today.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays < daysToShow) {
        const dayKey = paymentDate.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' });
        if (days[dayKey] !== undefined) {
          days[dayKey]++;
        }
      }
    });

    // Nhóm lại thành các điểm dữ liệu
    const groupedData: { [key: string]: number } = {};
    const entries = Object.entries(days);
    const groupSize = Math.max(1, Math.floor(entries.length / 10)); // Tối đa 10 điểm trên chart
    
    for (let i = 0; i < entries.length; i += groupSize) {
      const group = entries.slice(i, i + groupSize);
      const groupKey = group[0][0] + (group.length > 1 ? ` - ${group[group.length - 1][0]}` : '');
      const groupValue = group.reduce((sum, [, value]) => sum + value, 0);
      groupedData[groupKey] = groupValue;
    }

    return Object.entries(groupedData).map(([name, value]) => ({ name, value }));
  };

  // Tính phân loại gói đăng ký
  const getSubscriptionTypeData = () => {
    const typeUserCounts: { [key: number]: Set<number> } = {}; // Lưu Set userId theo từng loại gói
    const now = new Date();
    
    // Đếm số user unique có subscription active theo từng loại gói
    subscriptionPayments.forEach(payment => {
      const typeId = payment.subscriptionTypeId;
      
      // Chỉ đếm subscription còn hoạt động
      if (payment.isActive) {
        let isActive = false;
        if (payment.endDate) {
          const endDate = new Date(payment.endDate);
          if (endDate > now) {
            isActive = true;
          }
        } else {
          // Nếu không có endDate nhưng isActive = true, vẫn tính là active
          isActive = true;
        }
        
        if (isActive) {
          // Khởi tạo Set nếu chưa có
          if (!typeUserCounts[typeId]) {
            typeUserCounts[typeId] = new Set<number>();
          }
          // Thêm userId vào Set (tự động loại bỏ duplicate)
          typeUserCounts[typeId].add(payment.userId);
        }
      }
    });

    // Tính tổng số user có subscription active (unique)
    const allActiveSubscriptionUserIds = new Set<number>();
    Object.values(typeUserCounts).forEach(userSet => {
      userSet.forEach(userId => allActiveSubscriptionUserIds.add(userId));
    });
    const activeSubscriptionUsersCount = allActiveSubscriptionUserIds.size;

    // Tính số user đang dùng gói 1 (free plan) = tổng user - user có subscription active
    const freePlanUsers = stats.totalUsers - activeSubscriptionUsersCount;
    
    // Chuyển Set thành số lượng user
    const typeCounts: { [key: number]: number } = {};
    Object.entries(typeUserCounts).forEach(([typeIdStr, userSet]) => {
      const typeId = parseInt(typeIdStr, 10);
      typeCounts[typeId] = userSet.size;
    });
    
    // Thêm gói 1 (free plan) vào data
    if (freePlanUsers > 0) {
      typeCounts[1] = freePlanUsers;
    }

    // Map tên gói từ subscriptionTypes
    return Object.entries(typeCounts).map(([idStr, value]) => {
      const id = parseInt(idStr, 10);
      let name = `Gói ${id}`;
      
      // Tìm tên gói từ subscriptionTypes
      if (id === 1) {
        name = 'Free Plan';
      } else {
        const subscriptionType = subscriptionTypes.find(t => t.id === id);
        if (subscriptionType) {
          name = subscriptionType.subscriptionName;
        }
      }
      
      return {
        name,
        value
      };
    }).sort((a, b) => {
      // Sắp xếp: Free Plan đầu tiên, sau đó theo thứ tự id
      if (a.name === 'Free Plan') return -1;
      if (b.name === 'Free Plan') return 1;
      return 0;
    });
  };

  const weeklySubscriptionData = getWeeklySubscriptionData();
  const weeklyQRData = getWeeklyQRData();
  const weeklyUsersData = getWeeklyUsersData();
  const subscriptionTypeData = getSubscriptionTypeData();

  const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4'];
  const PIE_COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899', '#14B8A6'];

  const chartConfig = {
    value: {
      label: 'Value',
      color: 'hsl(var(--chart-1))',
    },
  };

  // Gradient definitions cho AreaChart
  const GradientDefinitions = () => (
    <defs>
      <linearGradient id="colorQR" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
        <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
      </linearGradient>
      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
      </linearGradient>
      <linearGradient id="colorSubscription" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
      </linearGradient>
    </defs>
  );

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">{t('dashboard.title')}</h1>
          <p className="text-gray-400 mt-2">Systematic overview and statistics</p>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-gray-400">{t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">{t('dashboard.title')}</h1>
        <p className="text-gray-400 mt-2">Systematic overview and statistics</p>
      </div>

      {/* Stats Cards */}
      <AdminCharts stats={stats} />

      {/* Charts Grid - 2x2 layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Transactions Chart - Top Left */}
        <Card className="bg-gray-800 border-gray-700 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white">{t('dashboard.qrTransactions')}</CardTitle>
            <CardDescription className="text-gray-400">
              {t('dashboard.qrTransactionsDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyQRData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <GradientDefinitions />
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#9CA3AF" 
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    axisLine={{ stroke: '#4B5563' }}
                  />
                  <YAxis 
                    stroke="#9CA3AF" 
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    axisLine={{ stroke: '#4B5563' }}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F3F4F6'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    fill="url(#colorQR)"
                    dot={{ fill: '#10B981', r: 5, strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 7, stroke: '#10B981', strokeWidth: 2 }}
                    animationDuration={1000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Total Users by Week - Top Right */}
        <Card className="bg-gray-800 border-gray-700 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white">{t('dashboard.weeklyUsers')}</CardTitle>
            <CardDescription className="text-gray-400">
              {t('dashboard.weeklyUsersDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyUsersData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <GradientDefinitions />
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#9CA3AF" 
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    axisLine={{ stroke: '#4B5563' }}
                  />
                  <YAxis 
                    stroke="#9CA3AF" 
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    axisLine={{ stroke: '#4B5563' }}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F3F4F6'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    fill="url(#colorUsers)"
                    dot={{ fill: '#3B82F6', r: 5, strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 7, stroke: '#3B82F6', strokeWidth: 2 }}
                    animationDuration={1000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Subscription by Week - Bottom Left */}
        <Card className="bg-gray-800 border-gray-700 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white">{t('dashboard.weeklySubscriptions')}</CardTitle>
            <CardDescription className="text-gray-400">
              {t('dashboard.weeklySubscriptionsDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklySubscriptionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <GradientDefinitions />
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#9CA3AF" 
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    axisLine={{ stroke: '#4B5563' }}
                  />
                  <YAxis 
                    stroke="#9CA3AF" 
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    axisLine={{ stroke: '#4B5563' }}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F3F4F6'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#8B5CF6" 
                    strokeWidth={3}
                    fill="url(#colorSubscription)"
                    dot={{ fill: '#8B5CF6', r: 5, strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 7, stroke: '#8B5CF6', strokeWidth: 2 }}
                    animationDuration={1000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Subscription by Type - Bottom Right */}
        <Card className="bg-gray-800 border-gray-700 shadow-xl">
        <CardHeader>
            <CardTitle className="text-white">{t('dashboard.subscriptionTypes')}</CardTitle>
          <CardDescription className="text-gray-400">
              {t('dashboard.subscriptionTypesDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subscriptionTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent, value }) => {
                      if (percent < 0.05) return ''; // Ẩn label nếu quá nhỏ
                      return `${(percent * 100).toFixed(0)}%`;
                    }}
                    outerRadius={110}
                    innerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    animationDuration={1000}
                    paddingAngle={2}
                  >
                    {subscriptionTypeData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                        stroke="#1F2937"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <ChartTooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
                            <p className="text-white font-semibold">{payload[0].payload.name}</p>
                            <p className="text-gray-300 text-sm">
                              Số lượng: <span className="text-white font-bold">{payload[0].value}</span>
                            </p>
                            <p className="text-gray-400 text-xs">
                              Tỷ lệ: {((payload[0].payload.value / stats.totalUsers) * 100).toFixed(1)}%
                            </p>
            </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value, entry: any) => (
                      <span style={{ color: '#F3F4F6', fontSize: '12px' }}>
                        {value} ({entry.payload.value})
                      </span>
                    )}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
        </CardContent>
      </Card>
      </div>

    </div>
  );
}
