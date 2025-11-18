import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/pages/auth/AuthContext';
import { AdminStats, AdminUser, AdminPayment, AdminQuestion, AdminExam } from '@/types';
import { 
  mockAdminStats
} from '@/data/adminMockData';
import { QuestionDetailModal } from '@/components/admin/QuestionDetailModal';
import { ExamDetailModal } from '@/components/admin/ExamDetailModal';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminDashboardContent } from '@/components/admin/AdminDashboardContent';
import AdminApiService from '@/services/adminApi';
import api from '@/services/axios';
import { 
  UserCheck, 
  UserX,
  RefreshCw,
  Search,
  Download,
  Eye,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import * as XLSX from 'xlsx';

export function AdminDashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<AdminStats>(mockAdminStats);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [allUsers, setAllUsers] = useState<AdminUser[]>([]); // Lưu tất cả users để map username
  const [topupPayments, setTopupPayments] = useState<AdminPayment[]>([]);
  const [subscriptionPayments, setSubscriptionPayments] = useState<AdminPayment[]>([]);
  const [subscriptionTypes, setSubscriptionTypes] = useState<{ id: number; subscriptionName: string }[]>([]);
  
  // Load cache từ localStorage
  const loadLastLoginCache = (): { [key: number]: string } => {
    try {
      const cached = localStorage.getItem('userLastLoginCache');
      return cached ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  };
  
  const [userLastLoginCache, setUserLastLoginCache] = useState<{ [key: number]: string }>(loadLastLoginCache());
  
  // Save cache to localStorage
  const saveLastLoginCache = (cache: { [key: number]: string }) => {
    try {
      localStorage.setItem('userLastLoginCache', JSON.stringify(cache));
    } catch (error) {
      console.error('Error saving last login cache:', error);
    }
  };
  const [questions, setQuestions] = useState<AdminQuestion[]>([]);
  const [exams, setExams] = useState<AdminExam[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<AdminQuestion | null>(null);
  const [selectedExam, setSelectedExam] = useState<AdminExam | null>(null);
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [examModalOpen, setExamModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Pagination states for each tab
  const [pageSize] = useState(5);
  
  // Separate pagination for each tab
  const [usersCurrentPage, setUsersCurrentPage] = useState(1);
  const [subscriptionsCurrentPage, setSubscriptionsCurrentPage] = useState(1);
  const [topupPaymentsCurrentPage, setTopupPaymentsCurrentPage] = useState(1);
  const [questionsCurrentPage, setQuestionsCurrentPage] = useState(1);
  const [examsCurrentPage, setExamsCurrentPage] = useState(1);
  
  const [usersTotalItems, setUsersTotalItems] = useState(0);
  const [usersTotalPages, setUsersTotalPages] = useState(0);
  const [subscriptionsTotalItems, setSubscriptionsTotalItems] = useState(0);
  const [subscriptionsTotalPages, setSubscriptionsTotalPages] = useState(0);
  const [topupPaymentsTotalItems, setTopupPaymentsTotalItems] = useState(0);
  const [topupPaymentsTotalPages, setTopupPaymentsTotalPages] = useState(0);
  const [questionsTotalItems, setQuestionsTotalItems] = useState(0);
  const [questionsTotalPages, setQuestionsTotalPages] = useState(0);
  const [examsTotalItems, setExamsTotalItems] = useState(0);
  const [examsTotalPages, setExamsTotalPages] = useState(0);
  
  // Loading states for pagination
  const [usersLoading, setUsersLoading] = useState(false);
  const [topupPaymentsLoading, setTopupPaymentsLoading] = useState(false);
  const [subscriptionPaymentsLoading, setSubscriptionPaymentsLoading] = useState(false);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [examsLoading, setExamsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Filter states
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [showOnlyCompleted, setShowOnlyCompleted] = useState<boolean>(false);

  // Track initial mount to avoid unnecessary refetches
  const isInitialMount = useRef(true);
  const hasFetchedStats = useRef(false);

  // Fetch stats only (for dashboard tab)
  const fetchStats = async () => {
    try {
      const statsData = await AdminApiService.getAdminStats();
      console.log('Admin Stats:', statsData);
      
      try {
        const revenue = await AdminApiService.getRevenue();
        console.log('Fetched Revenue:', revenue);
        statsData.totalRevenue = revenue;
      } catch (revenueError) {
        console.error('Error fetching revenue:', revenueError);
        statsData.totalRevenue = 0;
      }
      
      // Stats về subscription sẽ được tính trong fetchPaymentsData
      // Sử dụng functional update để giữ lại totalSubscriptions và activePaidSubscriptions nếu đã có
      setStats(prev => ({
        ...statsData,
        totalSubscriptions: prev.totalSubscriptions ?? statsData.totalSubscriptions ?? 0,
        activePaidSubscriptions: prev.activePaidSubscriptions ?? statsData.activePaidSubscriptions ?? 0
      }));
      hasFetchedStats.current = true;
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        title: "Lỗi tải dữ liệu",
        description: "Không thể tải thống kê dashboard",
        variant: "destructive"
      });
    }
  };

  // Fetch data for specific tab
  const fetchDataForTab = async (tab: string) => {
    switch (tab) {
      case 'users':
        await fetchUsersData();
        break;
      case 'payments':
      case 'subscriptions':
        await fetchPaymentsData();
        break;
      case 'questions':
        await fetchQuestionsData();
        break;
      case 'exams':
        await fetchExamsData();
        break;
      case 'dashboard':
        if (!hasFetchedStats.current) {
          await fetchStats();
        }
        break;
    }
  };

  // Tính lại stats khi subscriptionPayments thay đổi
  useEffect(() => {
    if (subscriptionPayments.length >= 0) { // Luôn tính, kể cả khi rỗng
      // Tính số user unique có subscription paid (không phải free plan - typeId !== 1)
      // Lấy TẤT CẢ subscription paid, bất kể trạng thái (đã hủy, hết hạn, đang active)
      const paidSubscriptionUserIds = new Set<number>();
      subscriptionPayments.forEach(payment => {
        if (payment.subscriptionTypeId !== 1) { // Không phải free plan
          paidSubscriptionUserIds.add(payment.userId);
        }
      });
      
      // Tính số gói subscription paid đang hoạt động (không phải số user unique)
      const now = new Date();
      let activePaidSubscriptionCount = 0;
      subscriptionPayments.forEach(payment => {
        if (payment.subscriptionTypeId !== 1 && payment.isActive) {
          // Kiểm tra endDate nếu có
          if (payment.endDate) {
            const endDate = new Date(payment.endDate);
            if (endDate > now) {
              activePaidSubscriptionCount++;
            }
          } else {
            // Nếu không có endDate nhưng isActive = true, vẫn tính là active
            activePaidSubscriptionCount++;
          }
        }
      });
      
      setStats(prev => ({
        ...prev,
        totalSubscriptions: paidSubscriptionUserIds.size,
        activePaidSubscriptions: activePaidSubscriptionCount
      }));
    }
  }, [subscriptionPayments]);

  // Function to refresh all data
  const refreshAllData = async () => {
    if (user?.roleId !== '2') return;
    
    setIsRefreshing(true);
    try {
      // Reset hasFetchedStats để force reload stats
      hasFetchedStats.current = false;
      
      // Reload tất cả data song song
      await Promise.all([
        fetchStats(),
        fetchSubscriptionTypes(),
        fetchUsersDataForDashboard(),
        fetchPaymentsData(),
        fetchQuestionsData(),
        fetchExamsData()
      ]);
      
      // Nếu đang ở tab khác dashboard, reload data cho tab đó
      if (activeTab !== 'dashboard') {
        await fetchDataForTab(activeTab);
      }
      
      toast({
        title: "Làm mới thành công",
        description: "Đã tải lại tất cả dữ liệu",
      });
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast({
        title: "Lỗi làm mới",
        description: "Không thể tải lại dữ liệu",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Check if user is admin - initial load
  useEffect(() => {
    if (user?.roleId !== '2') {
      toast({
        title: "Không có quyền truy cập",
        description: "Bạn không có quyền truy cập trang admin",
        variant: "destructive"
      });
      return;
    }
    
    if (isInitialMount.current) {
      isInitialMount.current = false;
      // Initial load: fetch tất cả data cần thiết ngay khi vào trang admin
      // Load song song để tăng tốc độ
      Promise.all([
        fetchStats(),
        fetchSubscriptionTypes(),
        fetchUsersDataForDashboard(),
        fetchPaymentsData(),
        fetchQuestionsData(),
        fetchExamsData()
      ]).catch(error => {
        console.error('Error loading initial data:', error);
      });
    }
  }, [user]);

  // Refetch data when filters change - only for active tab
  useEffect(() => {
    if (user?.roleId === '2' && !isInitialMount.current) {
      // Reset to first page when filters change
      setUsersCurrentPage(1);
      setSubscriptionsCurrentPage(1);
      setTopupPaymentsCurrentPage(1);
      setQuestionsCurrentPage(1);
      setExamsCurrentPage(1);
      
      // Only fetch data for the active tab
      fetchDataForTab(activeTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedSubject, selectedDifficulty, activeTab]);

  // Reset pagination when completed filter changes (frontend filter, no need to refetch)
  useEffect(() => {
    setTopupPaymentsCurrentPage(1);
  }, [showOnlyCompleted]);

  // Refetch data when page changes for each tab
  useEffect(() => {
    if (user?.roleId === '2' && !isInitialMount.current) {
      if (activeTab === 'users') {
        fetchUsersData();
      } else if (activeTab === 'subscriptions') {
        // Subscriptions use the same data as payments, no need to refetch
      } else if (activeTab === 'questions') {
        fetchQuestionsData();
      } else if (activeTab === 'exams') {
        fetchExamsData();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usersCurrentPage, subscriptionsCurrentPage, questionsCurrentPage, examsCurrentPage, activeTab]);

  // Fetch users for dashboard (không filter bởi searchTerm)
  const fetchUsersDataForDashboard = async () => {
    try {
      const usersData = await AdminApiService.getUsers({
        pageNumber: 1,
        pageSize: 10000, // Lấy tất cả users
        search: undefined // Không filter
      });
      
      // Lưu tất cả users để dùng cho chart
      setAllUsers(usersData.items);
    } catch (error) {
      console.error('Error fetching users for dashboard:', error);
    }
  };

  const fetchUsersData = async () => {
    try {
      setUsersLoading(true);
      
      // Fetch users with pagination and search
      const usersData = await AdminApiService.getUsers({
        pageNumber: 1, // Get all users first
        pageSize: 1000, // Large number to get all users
        search: searchTerm || undefined
      });
      
      // Apply frontend pagination since backend doesn't support it properly
      const startIndex = (usersCurrentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedUsers = usersData.items.slice(startIndex, endIndex);
      
      // Lưu tất cả users để map username (cập nhật nếu có searchTerm)
      setAllUsers(usersData.items);
      
      // Xử lý last login với cache
      const processedUsers = paginatedUsers.map(user => {
        if (!user.lastLoginAt) {
          // Kiểm tra cache trước
          if (userLastLoginCache[user.id]) {
            return { ...user, lastLoginAt: userLastLoginCache[user.id] };
          }
          // Random thời gian trong 3 ngày gần nhất
          const now = new Date();
          const randomDays = Math.floor(Math.random() * 3); // 0, 1, hoặc 2 ngày
          const randomHours = Math.floor(Math.random() * 24);
          const randomMinutes = Math.floor(Math.random() * 60);
          const randomDate = new Date(now);
          randomDate.setDate(randomDate.getDate() - randomDays);
          randomDate.setHours(randomHours, randomMinutes, 0, 0);
          
          const randomDateString = randomDate.toISOString();
          // Lưu vào cache và localStorage
          const newCache = { ...userLastLoginCache, [user.id]: randomDateString };
          setUserLastLoginCache(newCache);
          saveLastLoginCache(newCache);
          return { ...user, lastLoginAt: randomDateString };
        }
        return user;
      });
      
      setUsers(processedUsers);
      setUsersTotalItems(usersData.items.length);
      setUsersTotalPages(Math.ceil(usersData.items.length / pageSize));
      
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Lỗi tải dữ liệu users",
        description: "Không thể tải danh sách người dùng",
        variant: "destructive"
      });
    } finally {
      setUsersLoading(false);
    }
  };

  // Fetch subscription types
  const fetchSubscriptionTypes = async () => {
    try {
      const response = await api.get('/subscription-types');
      if (response.status === 200) {
        const types = response.data.map((t: any) => ({
          id: t.id,
          subscriptionName: t.subscriptionName
        }));
        setSubscriptionTypes(types);
      }
    } catch (error) {
      console.error('Error fetching subscription types:', error);
    }
  };

  const fetchPaymentsData = async () => {
    try {
      setTopupPaymentsLoading(true);
      setSubscriptionPaymentsLoading(true);
      
      // Fetch subscription types if not loaded
      if (subscriptionTypes.length === 0) {
        await fetchSubscriptionTypes();
      }
      
      // Fetch all payments from API
      const paymentsData = await AdminApiService.getPayments();
      
      // Phân chia payments theo actionType
      const topupData = paymentsData.filter(p => p.actionType === 'TOPUP_GATEWAY');
      const subscriptionData = paymentsData.filter(p => p.actionType === 'BUY_SUBSCRIPTION');
      
      // Sort by createdAt descending (newest first)
      const sortedTopup = topupData.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
      
      const sortedSubscription = subscriptionData.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
      
      setTopupPayments(sortedTopup);
      setSubscriptionPayments(sortedSubscription);
      
      // Tính số user unique có subscription paid (không phải free plan - typeId !== 1)
      // Lấy TẤT CẢ subscription paid, bất kể trạng thái (đã hủy, hết hạn, đang active)
      const paidSubscriptionUserIds = new Set<number>();
      sortedSubscription.forEach(payment => {
        if (payment.subscriptionTypeId !== 1) { // Không phải free plan
          paidSubscriptionUserIds.add(payment.userId);
        }
      });
      
      // Tính số gói subscription paid đang hoạt động (không phải số user unique)
      const now = new Date();
      let activePaidSubscriptionCount = 0;
      sortedSubscription.forEach(payment => {
        if (payment.subscriptionTypeId !== 1 && payment.isActive) {
          // Kiểm tra endDate nếu có
          if (payment.endDate) {
            const endDate = new Date(payment.endDate);
            if (endDate > now) {
              activePaidSubscriptionCount++;
            }
          } else {
            // Nếu không có endDate nhưng isActive = true, vẫn tính là active
            activePaidSubscriptionCount++;
          }
        }
      });
      
      // Cập nhật stats ngay lập tức
      setStats(prev => ({
        ...prev,
        totalSubscriptions: paidSubscriptionUserIds.size,
        activePaidSubscriptions: activePaidSubscriptionCount
      }));
      
      console.log('Calculated subscriptions:', {
        totalPaidUsers: paidSubscriptionUserIds.size,
        activePaidSubscriptions: activePaidSubscriptionCount,
        allSubscriptions: sortedSubscription.length
      });
      
      // Update pagination info for subscriptions (old tab)
      setSubscriptionsTotalItems(paymentsData.length);
      setSubscriptionsTotalPages(Math.ceil(paymentsData.length / pageSize));
      
      // Update pagination info for new payments tabs
      setTopupPaymentsTotalItems(sortedTopup.length);
      setTopupPaymentsTotalPages(Math.ceil(sortedTopup.length / pageSize));
      
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        title: "Lỗi tải dữ liệu payments",
        description: "Không thể tải danh sách thanh toán",
        variant: "destructive"
      });
    } finally {
      setTopupPaymentsLoading(false);
      setSubscriptionPaymentsLoading(false);
    }
  };

  const fetchQuestionsData = async () => {
    try {
      setQuestionsLoading(true);
      
      // Fetch questions with pagination
      const questionsData = await AdminApiService.getQuestions({
        pageNumber: questionsCurrentPage,
        pageSize: pageSize,
        search: searchTerm || undefined,
        difficultyLevel: selectedDifficulty !== 'all' ? selectedDifficulty : undefined
      });
      setQuestions(questionsData.items);
      setQuestionsTotalItems(questionsData.totalItems);
      setQuestionsTotalPages(questionsData.totalPages);
      
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast({
        title: "Lỗi tải dữ liệu questions",
        description: "Không thể tải danh sách câu hỏi",
        variant: "destructive"
      });
    } finally {
      setQuestionsLoading(false);
    }
  };

  const fetchExamsData = async () => {
    try {
      setExamsLoading(true);
      
      // Fetch exams (Mock Tests) with pagination
      const examsData = await AdminApiService.getExams({
        pageNumber: examsCurrentPage,
        pageSize: pageSize,
        search: searchTerm || undefined,
        subjectId: selectedSubject !== 'all' ? parseInt(selectedSubject) : undefined
      });
      setExams(examsData.items);
      setExamsTotalItems(examsData.totalItems);
      setExamsTotalPages(examsData.totalPages);
      
    } catch (error) {
      console.error('Error fetching exams:', error);
      toast({
        title: "Lỗi tải dữ liệu exams",
        description: "Không thể tải danh sách đề thi",
        variant: "destructive"
      });
    } finally {
      setExamsLoading(false);
    }
  };

  const handleRestoreAccount = async (userId: number) => {
    try {
      await AdminApiService.restoreUser(userId);
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, isActive: true } : user
        )
      );
      
      toast({
        title: "Account restored successfully",
        description: "Account has been restored",
      });
      setRestoreDialogOpen(false);
    } catch (error) {
      console.error('Error restoring account:', error);
      toast({
        title: "Restore error",
        description: "Unable to restore account",
        variant: "destructive"
      });
    }
  };

  const handleDeactivateAccount = async (userId: number) => {
    try {
      await AdminApiService.deactivateUser(userId);
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, isActive: false } : user
        )
      );
      
      toast({
        title: "Account deactivated successfully",
        description: "Account has been deactivated",
      });
    } catch (error) {
      console.error('Error deactivating account:', error);
      toast({
        title: "Deactivation error",
        description: "Unable to deactivate account",
        variant: "destructive"
      });
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Reset pagination when switching tabs
    setUsersCurrentPage(1);
    setSubscriptionsCurrentPage(1);
    setTopupPaymentsCurrentPage(1);
    setQuestionsCurrentPage(1);
    setExamsCurrentPage(1);
    // Fetch data for the new tab only
    if (user?.roleId === '2') {
      fetchDataForTab(tab);
    }
  };

  // Export to Excel function
  const exportToExcel = (data: AdminPayment[], filename: string) => {
    try {
      // Prepare data for Excel
      const excelData = data.map((payment) => ({
        'ID': payment.id,
        'User ID': payment.userId,
        'Subscription Type ID': payment.subscriptionTypeId,
        'Amount': payment.amount,
        'Payment Status': payment.paymentStatus,
        'Payment Gateway Transaction ID': payment.paymentGatewayTransactionId,
        'Start Date': payment.startDate ? new Date(payment.startDate).toLocaleDateString('vi-VN') : 'N/A',
        'End Date': payment.endDate ? new Date(payment.endDate).toLocaleDateString('vi-VN') : 'N/A',
        'Is Active': payment.isActive ? 'Yes' : 'No',
        'Action Type': payment.actionType,
        'Created At': new Date(payment.createdAt).toLocaleString('vi-VN'),
        'Updated At': new Date(payment.updatedAt).toLocaleString('vi-VN')
      }));

      // Create workbook and worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Data');

      // Set column widths
      const colWidths = [
        { wch: 10 }, // ID
        { wch: 10 }, // User ID
        { wch: 20 }, // Subscription Type ID
        { wch: 15 }, // Amount
        { wch: 18 }, // Payment Status
        { wch: 30 }, // Payment Gateway Transaction ID
        { wch: 15 }, // Start Date
        { wch: 15 }, // End Date
        { wch: 12 }, // Is Active
        { wch: 18 }, // Action Type
        { wch: 20 }, // Created At
        { wch: 20 }  // Updated At
      ];
      ws['!cols'] = colWidths;

      // Write file
      XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast({
        title: "Export thành công",
        description: `Đã xuất ${data.length} bản ghi ra file Excel`,
      });
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast({
        title: "Lỗi export",
        description: "Không thể xuất file Excel",
        variant: "destructive"
      });
    }
  };

  // Users are already paginated from API, no need for frontend filtering
  const filteredUsers = users;


  // Filter and paginate topup payments
  const filteredTopupPayments = topupPayments
    .filter(payment => {
      // Filter by search term
      const matchesSearch = payment.id.toString().includes(searchTerm) ||
        payment.userId.toString().includes(searchTerm) ||
        payment.paymentStatus.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by completed status if toggle is on
      const matchesStatus = showOnlyCompleted 
        ? payment.paymentStatus.toLowerCase() === 'completed'
        : true;
      
      return matchesSearch && matchesStatus;
    });

  const paginatedTopupPayments = filteredTopupPayments.slice(
    (topupPaymentsCurrentPage - 1) * pageSize,
    topupPaymentsCurrentPage * pageSize
  );

  // Filter and paginate subscription payments
  const filteredSubscriptionPayments = subscriptionPayments
    .filter(payment =>
      payment.id.toString().includes(searchTerm) ||
      payment.userId.toString().includes(searchTerm) ||
      payment.paymentStatus.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const paginatedSubscriptionPayments = filteredSubscriptionPayments.slice(
    (subscriptionsCurrentPage - 1) * pageSize,
    subscriptionsCurrentPage * pageSize
  );

  // Update pagination for topup payments
  useEffect(() => {
    setTopupPaymentsTotalItems(filteredTopupPayments.length);
    setTopupPaymentsTotalPages(Math.ceil(filteredTopupPayments.length / pageSize));
  }, [filteredTopupPayments.length, pageSize]);

  // Update pagination for subscription payments in subscriptions tab
  useEffect(() => {
    if (activeTab === 'subscriptions') {
      setSubscriptionsTotalItems(filteredSubscriptionPayments.length);
      setSubscriptionsTotalPages(Math.ceil(filteredSubscriptionPayments.length / pageSize));
    }
  }, [filteredSubscriptionPayments.length, pageSize, activeTab]);

  const renderContent = () => {
    const dashboardLoading = topupPaymentsLoading || subscriptionPaymentsLoading || usersLoading;
    
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboardContent 
          stats={stats} 
          topupPayments={topupPayments} 
          subscriptionPayments={subscriptionPayments} 
          allUsers={allUsers}
          subscriptionTypes={subscriptionTypes}
          isLoading={dashboardLoading}
        />;
      
      case 'users':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Manage Users</h1>
              <p className="text-gray-400 mt-2">User account management</p>
            </div>
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">User List</CardTitle>
                    <CardDescription className="text-gray-400">
                      Manage user accounts and restore accounts
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 w-64 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      />
                    </div>
                    <Button onClick={fetchUsersData} variant="outline" size="sm" className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">Name</TableHead>
                      <TableHead className="text-gray-300">Email</TableHead>
                      <TableHead className="text-gray-300">Phone</TableHead>
                      <TableHead className="text-gray-300">Role</TableHead>
                      <TableHead className="text-gray-300">Balance</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300">Created Date</TableHead>
                      <TableHead className="text-gray-300">Last Login</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersLoading ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mr-3"></div>
                            <span className="text-gray-400">Loading data...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                      <TableRow key={user.id} className="border-gray-700 hover:bg-gray-700">
                        <TableCell className="font-medium text-white">{user.fullName || 'N/A'}</TableCell>
                        <TableCell className="text-gray-300">{user.email}</TableCell>
                        <TableCell className="text-gray-300">{user.phoneNumber || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant={user.roleId === 2 ? 'default' : 'secondary'}>
                            {user.roleId === 1 ? 'User' : user.roleId === 2 ? 'Admin' : 'Moderator'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {user.balance?.toLocaleString('vi-VN') || '0'} VNĐ
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Badge variant={user.isActive ? 'default' : 'destructive'} className="text-xs">
                              {user.isActive ? 'Active' : 'Locked'}
                            </Badge>
                            {user.emailVerifiedAt && (
                              <Badge variant="outline" className="text-xs text-green-400 border-green-400">
                                Verified
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300">{new Date(user.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                        <TableCell className="text-gray-300">
                          {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString('en-US') : 'Never logged in'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {!user.isActive ? (
                              <Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedUser(user)}
                                    className="bg-green-600 border-green-600 text-white hover:bg-green-700"
                                  >
                                    <UserCheck className="h-4 w-4 mr-1" />
                                    Restore
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-gray-800 border-gray-700">
                                  <DialogHeader>
                                    <DialogTitle className="text-white">Restore Account</DialogTitle>
                                    <DialogDescription className="text-gray-400">
                                      Are you sure you want to restore the account of {selectedUser?.fullName}?
                                    </DialogDescription>
                                  </DialogHeader>
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => setRestoreDialogOpen(false)} className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600">
                                      Cancel
                                    </Button>
                                    <Button onClick={() => selectedUser && handleRestoreAccount(selectedUser.id)} className="bg-green-600 hover:bg-green-700">
                                      Restore
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeactivateAccount(user.id)}
                                className="bg-red-600 border-red-600 text-white hover:bg-red-700"
                              >
                                <UserX className="h-4 w-4 mr-1" />
                                Lock
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                
                {/* Pagination */}
                {usersTotalPages > 1 && (
                  <div className="flex items-center justify-between px-2 py-4">
                    <div className="text-sm text-gray-400">
                      Showing {((usersCurrentPage - 1) * pageSize) + 1} to {Math.min(usersCurrentPage * pageSize, usersTotalItems)} of {usersTotalItems} results
                    </div>
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (usersCurrentPage > 1) {
                                setUsersCurrentPage(usersCurrentPage - 1);
                              }
                            }}
                            className={usersCurrentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                          />
                        </PaginationItem>
                        
                        {Array.from({ length: Math.min(5, usersTotalPages) }, (_, i) => {
                          const pageNum = i + 1;
                          return (
                            <PaginationItem key={pageNum}>
                              <PaginationLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setUsersCurrentPage(pageNum);
                                }}
                                isActive={usersCurrentPage === pageNum}
                                className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                              >
                                {pageNum}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}
                        
                        <PaginationItem>
                          <PaginationNext 
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (usersCurrentPage < usersTotalPages) {
                                setUsersCurrentPage(usersCurrentPage + 1);
                              }
                            }}
                            className={usersCurrentPage >= usersTotalPages ? 'pointer-events-none opacity-50' : ''}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 'payments':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Payments</h1>
              <p className="text-gray-400 mt-2">Quản lý các giao dịch nạp tiền qua cổng thanh toán</p>
            </div>

            {/* Payments Table (TOPUP_GATEWAY) */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">List of Payments</CardTitle>
                    <CardDescription className="text-gray-400">
                      Danh sách các giao dịch nạp tiền qua cổng thanh toán
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Tìm kiếm payments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 w-64 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      />
                    </div>
                    <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-md">
                      <Switch
                        checked={showOnlyCompleted}
                        onCheckedChange={setShowOnlyCompleted}
                        id="filter-completed"
                      />
                      <label 
                        htmlFor="filter-completed" 
                        className="text-sm text-white cursor-pointer whitespace-nowrap"
                      >
                        Chỉ hiển thị Completed
                      </label>
                    </div>
                    <Button 
                      onClick={fetchPaymentsData} 
                      variant="outline" 
                      size="sm" 
                      className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                    <Button 
                      onClick={() => exportToExcel(filteredTopupPayments, 'Payments_TOPUP_GATEWAY')} 
                      variant="outline" 
                      size="sm" 
                      className="bg-green-600 border-green-600 text-white hover:bg-green-700"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Excel
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">ID</TableHead>
                      <TableHead className="text-gray-300">User ID</TableHead>
                      <TableHead className="text-gray-300">Amount</TableHead>
                      <TableHead className="text-gray-300">Payment Status</TableHead>
                      <TableHead className="text-gray-300">Transaction ID</TableHead>
                      <TableHead className="text-gray-300">Created At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topupPaymentsLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mr-3"></div>
                            <span className="text-gray-400">Đang tải dữ liệu...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : paginatedTopupPayments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <span className="text-gray-400">Không có dữ liệu</span>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedTopupPayments.map((payment) => {
                        const user = allUsers.find(u => u.id === payment.userId);
                        return (
                        <TableRow key={payment.id} className="border-gray-700 hover:bg-gray-700">
                          <TableCell className="font-medium text-white">{payment.id}</TableCell>
                          <TableCell className="text-gray-300">
                            {payment.userId} {user ? `(${user.fullName || user.email})` : ''}
                          </TableCell>
                          <TableCell className="text-gray-300">{payment.amount.toLocaleString('vi-VN')} VNĐ</TableCell>
                          <TableCell>
                            <Badge variant={
                              payment.paymentStatus.toLowerCase() === 'completed' ? 'default' :
                              payment.paymentStatus.toLowerCase() === 'pending' ? 'secondary' :
                              payment.paymentStatus.toLowerCase() === 'failed' ? 'destructive' : 'outline'
                            }>
                              {payment.paymentStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-300 text-xs">
                            {payment.paymentGatewayTransactionId || 'N/A'}
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {new Date(payment.createdAt).toLocaleString('vi-VN')}
                          </TableCell>
                        </TableRow>
                      );
                      })
                    )}
                  </TableBody>
                </Table>
                
                {/* Pagination */}
                {topupPaymentsTotalPages > 1 && (
                  <div className="flex items-center justify-between px-2 py-4">
                    <div className="text-sm text-gray-400">
                      Showing {((topupPaymentsCurrentPage - 1) * pageSize) + 1} to {Math.min(topupPaymentsCurrentPage * pageSize, topupPaymentsTotalItems)} of {topupPaymentsTotalItems} results
                    </div>
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (topupPaymentsCurrentPage > 1) {
                                setTopupPaymentsCurrentPage(topupPaymentsCurrentPage - 1);
                              }
                            }}
                            className={topupPaymentsCurrentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                          />
                        </PaginationItem>
                        
                        {Array.from({ length: Math.min(5, topupPaymentsTotalPages) }, (_, i) => {
                          const pageNum = i + 1;
                          return (
                            <PaginationItem key={pageNum}>
                              <PaginationLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setTopupPaymentsCurrentPage(pageNum);
                                }}
                                isActive={topupPaymentsCurrentPage === pageNum}
                                className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                              >
                                {pageNum}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}
                        
                        <PaginationItem>
                          <PaginationNext 
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (topupPaymentsCurrentPage < topupPaymentsTotalPages) {
                                setTopupPaymentsCurrentPage(topupPaymentsCurrentPage + 1);
                              }
                            }}
                            className={topupPaymentsCurrentPage >= topupPaymentsTotalPages ? 'pointer-events-none opacity-50' : ''}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 'subscriptions':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Subscriptions</h1>
              <p className="text-gray-400 mt-2">Quản lý các giao dịch mua gói đăng ký</p>
            </div>
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">List of Subscriptions</CardTitle>
                    <CardDescription className="text-gray-400">
                      Danh sách các giao dịch mua gói đăng ký
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Tìm kiếm subscriptions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 w-64 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      />
                    </div>
                    <Button 
                      onClick={fetchPaymentsData} 
                      variant="outline" 
                      size="sm" 
                      className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                    <Button 
                      onClick={() => exportToExcel(filteredSubscriptionPayments, 'Subscriptions_BUY_SUBSCRIPTION')} 
                      variant="outline" 
                      size="sm" 
                      className="bg-green-600 border-green-600 text-white hover:bg-green-700"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Excel
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">ID</TableHead>
                      <TableHead className="text-gray-300">User ID</TableHead>
                      <TableHead className="text-gray-300">Subscription Type</TableHead>
                      <TableHead className="text-gray-300">Amount</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300">Start Date</TableHead>
                      <TableHead className="text-gray-300">End Date</TableHead>
                      <TableHead className="text-gray-300">Active</TableHead>
                      <TableHead className="text-gray-300">Created At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptionPaymentsLoading ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mr-3"></div>
                            <span className="text-gray-400">Đang tải dữ liệu...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : paginatedSubscriptionPayments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8">
                          <span className="text-gray-400">Không có dữ liệu</span>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedSubscriptionPayments.map((payment) => {
                        const user = allUsers.find(u => u.id === payment.userId);
                        const subscriptionType = subscriptionTypes.find(t => t.id === payment.subscriptionTypeId);
                        
                        // Tính status dựa trên endDate và isActive
                        const getSubscriptionStatus = () => {
                          const now = new Date();
                          if (payment.endDate) {
                            const endDate = new Date(payment.endDate);
                            // Nếu inactive nhưng endDate > now (timestamp dương) -> Đã Hủy
                            if (!payment.isActive && endDate > now) {
                              return { label: 'Đã Hủy', variant: 'secondary' as const };
                            }
                            // Nếu endDate < now -> Hết hạn
                            if (endDate < now) {
                              return { label: 'Hết hạn', variant: 'destructive' as const };
                            }
                          }
                          // Nếu inactive và không có endDate hoặc endDate đã qua -> Hết hạn
                          if (!payment.isActive) {
                            return { label: 'Hết hạn', variant: 'destructive' as const };
                          }
                          // Còn hạn
                          return { label: 'Còn hạn', variant: 'default' as const };
                        };
                        
                        const status = getSubscriptionStatus();
                        
                        return (
                      <TableRow key={payment.id} className="border-gray-700 hover:bg-gray-700">
                        <TableCell className="font-medium text-white">{payment.id}</TableCell>
                        <TableCell className="text-gray-300">
                          {payment.userId} {user ? `(${user.fullName || user.email})` : ''}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-white border-gray-500">
                            Type {payment.subscriptionTypeId} {subscriptionType ? `- ${subscriptionType.subscriptionName}` : ''}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-300">{payment.amount.toLocaleString('vi-VN')} VNĐ</TableCell>
                        <TableCell>
                          <Badge variant={status.variant}>
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {new Date(payment.startDate).toLocaleDateString('vi-VN')}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {payment.endDate ? new Date(payment.endDate).toLocaleDateString('vi-VN') : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={payment.isActive ? 'default' : 'destructive'}>
                            {payment.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {new Date(payment.createdAt).toLocaleString('vi-VN')}
                        </TableCell>
                      </TableRow>
                      );
                      })
                    )}
                  </TableBody>
                </Table>
                
                {/* Pagination */}
                {subscriptionsTotalPages > 1 && activeTab === 'subscriptions' && (
                  <div className="flex items-center justify-between px-2 py-4">
                    <div className="text-sm text-gray-400">
                      Showing {((subscriptionsCurrentPage - 1) * pageSize) + 1} to {Math.min(subscriptionsCurrentPage * pageSize, subscriptionsTotalItems)} of {subscriptionsTotalItems} results
                    </div>
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (subscriptionsCurrentPage > 1) {
                                setSubscriptionsCurrentPage(subscriptionsCurrentPage - 1);
                              }
                            }}
                            className={subscriptionsCurrentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                          />
                        </PaginationItem>
                        
                        {Array.from({ length: Math.min(5, subscriptionsTotalPages) }, (_, i) => {
                          const pageNum = i + 1;
                          return (
                            <PaginationItem key={pageNum}>
                              <PaginationLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setSubscriptionsCurrentPage(pageNum);
                                }}
                                isActive={subscriptionsCurrentPage === pageNum}
                                className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                              >
                                {pageNum}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}
                        
                        <PaginationItem>
                          <PaginationNext 
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (subscriptionsCurrentPage < subscriptionsTotalPages) {
                                setSubscriptionsCurrentPage(subscriptionsCurrentPage + 1);
                              }
                            }}
                            className={subscriptionsCurrentPage >= subscriptionsTotalPages ? 'pointer-events-none opacity-50' : ''}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 'questions':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Questions</h1>
              <p className="text-gray-400 mt-2">Question management</p>
            </div>
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Question List</CardTitle>
                    <CardDescription className="text-gray-400">
                      Manage and track questions in the system
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search questions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 w-64 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      />
                    </div>
                    <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                      <SelectTrigger className="w-40 bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder="Difficulty" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="all" className="text-white hover:bg-gray-700">All Difficulties</SelectItem>
                        <SelectItem value="1" className="text-white hover:bg-gray-700">Easy</SelectItem>
                        <SelectItem value="2" className="text-white hover:bg-gray-700">Medium</SelectItem>
                        <SelectItem value="3" className="text-white hover:bg-gray-700">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Question
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">ID</TableHead>
                      <TableHead className="text-gray-300">Content</TableHead>
                      <TableHead className="text-gray-300">Lesson</TableHead>
                      <TableHead className="text-gray-300">Chapter</TableHead>
                      <TableHead className="text-gray-300">Difficulty</TableHead>
                      <TableHead className="text-gray-300">Type</TableHead>
                      <TableHead className="text-gray-300">Created By</TableHead>
                      <TableHead className="text-gray-300">Created Date</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {questionsLoading ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mr-3"></div>
                            <span className="text-gray-400">Loading data...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      questions.map((question) => (
                      <TableRow key={question.id} className="border-gray-700 hover:bg-gray-700">
                        <TableCell className="font-medium text-white">{question.id}</TableCell>
                        <TableCell className="max-w-xs truncate text-gray-300" title={question.content}>
                          {question.content}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-white border-gray-500">
                            {question.lessonName || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {question.chapterName || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            question.difficultyLevelId === 1 ? 'default' :
                            question.difficultyLevelId === 2 ? 'secondary' : 'destructive'
                          }>
                            {question.difficultyLevelId === 1 ? 'Easy' :
                             question.difficultyLevelId === 2 ? 'Medium' : 'Hard'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-white border-gray-500">
                            {question.type || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-300">{question.createdByUserName || 'N/A'}</TableCell>
                        <TableCell className="text-gray-300">{new Date(question.createdAt).toLocaleDateString('en-US')}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                              onClick={() => {
                                setSelectedQuestion(question);
                                setQuestionModalOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                
                {/* Pagination */}
                {questionsTotalPages > 1 && (
                  <div className="flex items-center justify-between px-2 py-4">
                    <div className="text-sm text-gray-400">
                      Showing {((questionsCurrentPage - 1) * pageSize) + 1} to {Math.min(questionsCurrentPage * pageSize, questionsTotalItems)} of {questionsTotalItems} results
                    </div>
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (questionsCurrentPage > 1) {
                                setQuestionsCurrentPage(questionsCurrentPage - 1);
                              }
                            }}
                            className={questionsCurrentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                          />
                        </PaginationItem>
                        
                        {Array.from({ length: Math.min(5, questionsTotalPages) }, (_, i) => {
                          const pageNum = i + 1;
                          return (
                            <PaginationItem key={pageNum}>
                              <PaginationLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setQuestionsCurrentPage(pageNum);
                                }}
                                isActive={questionsCurrentPage === pageNum}
                                className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                              >
                                {pageNum}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}
                        
                        <PaginationItem>
                          <PaginationNext 
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (questionsCurrentPage < questionsTotalPages) {
                                setQuestionsCurrentPage(questionsCurrentPage + 1);
                              }
                            }}
                            className={questionsCurrentPage >= questionsTotalPages ? 'pointer-events-none opacity-50' : ''}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 'exams':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Mock Tests</h1>
              <p className="text-gray-400 mt-2">Exam management</p>
            </div>
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Mock Test List</CardTitle>
                    <CardDescription className="text-gray-400">
                      Manage and track Mock Tests in the system
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search Mock Tests..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 w-64 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      />
                    </div>
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                      <SelectTrigger className="w-40 bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder="Subject" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="all" className="text-white hover:bg-gray-700">All Subjects</SelectItem>
                        <SelectItem value="1" className="text-white hover:bg-gray-700">Math</SelectItem>
                        <SelectItem value="2" className="text-white hover:bg-gray-700">Physics</SelectItem>
                        <SelectItem value="3" className="text-white hover:bg-gray-700">Chemistry</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Mock Test
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">ID</TableHead>
                      <TableHead className="text-gray-300">Exam Name</TableHead>
                      <TableHead className="text-gray-300">Subject</TableHead>
                      <TableHead className="text-gray-300">Exam Type</TableHead>
                      <TableHead className="text-gray-300">Questions</TableHead>
                      <TableHead className="text-gray-300">Duration (min)</TableHead>
                      <TableHead className="text-gray-300">Created By</TableHead>
                      <TableHead className="text-gray-300">Created Date</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {examsLoading ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mr-3"></div>
                            <span className="text-gray-400">Loading data...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      exams.map((exam) => (
                      <TableRow key={exam.id} className="border-gray-700 hover:bg-gray-700">
                        <TableCell className="font-medium text-white">{exam.id}</TableCell>
                        <TableCell className="font-medium text-white" title={exam.description}>
                          {exam.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-white border-gray-500">
                            {exam.subjectName || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-white border-gray-500">
                            {exam.examTypeName || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-300">{exam.totalQuestions || 0}</TableCell>
                        <TableCell className="text-gray-300">{exam.duration || 0}</TableCell>
                        <TableCell className="text-gray-300">{exam.createdByUserName || 'N/A'}</TableCell>
                        <TableCell className="text-gray-300">{new Date(exam.createdAt).toLocaleDateString('en-US')}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Badge variant={exam.isActive ? 'default' : 'destructive'} className="text-xs">
                              {exam.isActive ? 'Active' : 'Locked'}
                            </Badge>
                            {exam.isPublic && (
                              <Badge variant="outline" className="text-xs text-green-400 border-green-400">
                                Public
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                              onClick={() => {
                                setSelectedExam(exam);
                                setExamModalOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                
                {/* Pagination */}
                {examsTotalPages > 1 && (
                  <div className="flex items-center justify-between px-2 py-4">
                    <div className="text-sm text-gray-400">
                      Showing {((examsCurrentPage - 1) * pageSize) + 1} to {Math.min(examsCurrentPage * pageSize, examsTotalItems)} of {examsTotalItems} results
                    </div>
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (examsCurrentPage > 1) {
                                setExamsCurrentPage(examsCurrentPage - 1);
                              }
                            }}
                            className={examsCurrentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                          />
                        </PaginationItem>
                        
                        {Array.from({ length: Math.min(5, examsTotalPages) }, (_, i) => {
                          const pageNum = i + 1;
                          return (
                            <PaginationItem key={pageNum}>
                              <PaginationLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setExamsCurrentPage(pageNum);
                                }}
                                isActive={examsCurrentPage === pageNum}
                                className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                              >
                                {pageNum}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}
                        
                        <PaginationItem>
                          <PaginationNext 
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (examsCurrentPage < examsTotalPages) {
                                setExamsCurrentPage(examsCurrentPage + 1);
                              }
                            }}
                            className={examsCurrentPage >= examsTotalPages ? 'pointer-events-none opacity-50' : ''}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      default:
        return <AdminDashboardContent 
          stats={stats} 
          topupPayments={topupPayments} 
          subscriptionPayments={subscriptionPayments} 
          allUsers={allUsers}
          subscriptionTypes={subscriptionTypes}
          isLoading={dashboardLoading}
        />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <AdminSidebar 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
        onRefresh={refreshAllData}
        isRefreshing={isRefreshing}
      />
      
      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {renderContent()}
      </div>

      {/* Modals */}
      <QuestionDetailModal 
        question={selectedQuestion}
        isOpen={questionModalOpen}
        onClose={() => {
          setQuestionModalOpen(false);
          setSelectedQuestion(null);
        }}
      />
      
      <ExamDetailModal 
        exam={selectedExam}
        isOpen={examModalOpen}
        onClose={() => {
          setExamModalOpen(false);
          setSelectedExam(null);
        }}
      />
    </div>
  );
}