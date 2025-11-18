import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ShoppingCart, FileText, BarChart3, DollarSign, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

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
    totalSubscriptions?: number;
    activePaidSubscriptions?: number;
    totalQuestions: number;
    totalExams: number;
    totalRevenue?: number;
  };
}

export function AdminCharts({ stats }: AdminChartsProps) {
  const { t } = useLanguage();
  
  const chartData: ChartData[] = [
    {
      name: t('stats.totalUser'),
      value: stats.totalUsers,
      icon: Users,
      color: 'from-blue-500 to-blue-600'
    },
    {
      name: t('stats.subscription'),
      value: stats.totalSubscriptions || stats.totalOrders || 0,
      icon: ShoppingCart,
      color: 'from-green-500 to-green-600'
    },
    {
      name: t('stats.activePaidSubscription'),
      value: stats.activePaidSubscriptions || 0,
      icon: CheckCircle,
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      name: t('stats.question'),
      value: stats.totalQuestions,
      icon: FileText,
      color: 'from-purple-500 to-purple-600'
    },
    {
      name: t('stats.mockTest'),
      value: stats.totalExams,
      icon: BarChart3,
      color: 'from-orange-500 to-orange-600'
    },
    {
      name: t('stats.revenue'),
      value: stats.totalRevenue || 0,
      icon: DollarSign,
      color: 'from-yellow-500 to-yellow-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
      {chartData.map((item) => {
        const Icon = item.icon;
        const isRevenue = item.name === 'Revenue';
        
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
                {isRevenue 
                  ? `${(item.value || 0).toLocaleString('vi-VN')} VNĐ`
                  : item.value.toLocaleString()}
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