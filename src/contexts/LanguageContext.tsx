import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'vi' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translations
const translations: Record<Language, Record<string, string>> = {
  vi: {
    // Stats
    'stats.totalUser': 'Tổng người dùng',
    'stats.subscription': 'Đăng ký có trả phí',
    'stats.activePaidSubscription': 'Số gói đăng ký đang hoạt động',
    'stats.question': 'Câu hỏi',
    'stats.mockTest': 'Đề thi',
    'stats.revenue': 'Doanh thu',
    
    // Dashboard
    'dashboard.title': 'Bảng điều khiển',
    'dashboard.qrTransactions': 'Giao dịch QR theo thời gian',
    'dashboard.qrTransactionsDesc': 'Số lượng giao dịch QR trong 30 ngày gần nhất',
    'dashboard.weeklyUsers': 'Người dùng mới theo thời gian',
    'dashboard.weeklyUsersDesc': 'Số lượng người dùng mới trong 30 ngày gần nhất',
    'dashboard.weeklySubscriptions': 'Đăng ký theo thời gian',
    'dashboard.weeklySubscriptionsDesc': 'Số lượng đăng ký trong 30 ngày gần nhất',
    'dashboard.subscriptionTypes': 'Phân loại gói đăng ký',
    'dashboard.subscriptionTypesDesc': 'Số lượng người dùng theo từng loại gói',
    
    // Tabs
    'tabs.dashboard': 'Bảng điều khiển',
    'tabs.users': 'Người dùng',
    'tabs.payments': 'Thanh toán',
    'tabs.subscriptions': 'Đăng ký',
    'tabs.questions': 'Câu hỏi',
    'tabs.exams': 'Đề thi',
    
    // Common
    'common.loading': 'Đang tải...',
    'common.search': 'Tìm kiếm',
    'common.filter': 'Lọc',
    'common.export': 'Xuất file',
    'common.status': 'Trạng thái',
    'common.active': 'Hoạt động',
    'common.inactive': 'Không hoạt động',
  },
  en: {
    // Stats
    'stats.totalUser': 'Total Users',
    'stats.subscription': 'Paid Subscriptions',
    'stats.activePaidSubscription': 'Active Subscription Packages',
    'stats.question': 'Questions',
    'stats.mockTest': 'Mock Tests',
    'stats.revenue': 'Revenue',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.qrTransactions': 'QR Transactions Over Time',
    'dashboard.qrTransactionsDesc': 'Number of QR transactions in the last 30 days',
    'dashboard.weeklyUsers': 'New Users Over Time',
    'dashboard.weeklyUsersDesc': 'Number of new users in the last 30 days',
    'dashboard.weeklySubscriptions': 'Subscriptions Over Time',
    'dashboard.weeklySubscriptionsDesc': 'Number of subscriptions in the last 30 days',
    'dashboard.subscriptionTypes': 'Subscription Type Distribution',
    'dashboard.subscriptionTypesDesc': 'Number of users by subscription type',
    
    // Tabs
    'tabs.dashboard': 'Dashboard',
    'tabs.users': 'Users',
    'tabs.payments': 'Payments',
    'tabs.subscriptions': 'Subscriptions',
    'tabs.questions': 'Questions',
    'tabs.exams': 'Exams',
    
    // Common
    'common.loading': 'Loading...',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.export': 'Export',
    'common.status': 'Status',
    'common.active': 'Active',
    'common.inactive': 'Inactive',
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('dashboardLanguage');
    return (saved as Language) || 'vi';
  });

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('dashboardLanguage', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

