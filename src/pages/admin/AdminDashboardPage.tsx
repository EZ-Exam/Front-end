import { useState, useEffect } from 'react';
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

export function AdminDashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<AdminStats>(mockAdminStats);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [payments, setPayments] = useState<AdminPayment[]>([]);
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
  const [questionsCurrentPage, setQuestionsCurrentPage] = useState(1);
  const [examsCurrentPage, setExamsCurrentPage] = useState(1);
  
  const [usersTotalItems, setUsersTotalItems] = useState(0);
  const [usersTotalPages, setUsersTotalPages] = useState(0);
  const [subscriptionsTotalItems, setSubscriptionsTotalItems] = useState(0);
  const [subscriptionsTotalPages, setSubscriptionsTotalPages] = useState(0);
  const [questionsTotalItems, setQuestionsTotalItems] = useState(0);
  const [questionsTotalPages, setQuestionsTotalPages] = useState(0);
  const [examsTotalItems, setExamsTotalItems] = useState(0);
  const [examsTotalPages, setExamsTotalPages] = useState(0);
  
  // Loading states for pagination
  const [usersLoading, setUsersLoading] = useState(false);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [examsLoading, setExamsLoading] = useState(false);
  
  // Filter states
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  // Check if user is admin
  useEffect(() => {
    if (user?.roleId !== '2') {
      toast({
        title: "Không có quyền truy cập",
        description: "Bạn không có quyền truy cập trang admin",
        variant: "destructive"
      });
      return;
    }
    fetchDashboardData();
  }, [user]);

  // Refetch data when filters change
  useEffect(() => {
    if (user?.roleId === '2') {
      // Reset to first page when filters change for all tabs
      setUsersCurrentPage(1);
      setSubscriptionsCurrentPage(1);
      setQuestionsCurrentPage(1);
      setExamsCurrentPage(1);
      fetchDashboardData();
    }
  }, [searchTerm, selectedSubject, selectedDifficulty]);

  // Refetch data when page changes for each tab
  useEffect(() => {
    if (user?.roleId === '2') {
      if (activeTab === 'users') {
        fetchUsersData();
      } else if (activeTab === 'subscriptions') {
        // Update pagination when subscriptions page changes
      } else if (activeTab === 'questions') {
        fetchQuestionsData();
      } else if (activeTab === 'exams') {
        fetchExamsData();
      }
    }
  }, [usersCurrentPage, subscriptionsCurrentPage, questionsCurrentPage, examsCurrentPage]);

  const fetchDashboardData = async () => {
    try {
      // Fetch admin stats
      const statsData = await AdminApiService.getAdminStats();
      console.log('Admin Stats:', statsData);
      
      // Fetch revenue (toàn bộ doanh thu - không truyền days)
      try {
        const revenue = await AdminApiService.getRevenue();
        console.log('Fetched Revenue:', revenue);
        statsData.totalRevenue = revenue;
      } catch (revenueError) {
        console.error('Error fetching revenue:', revenueError);
        // Nếu lỗi khi fetch revenue, vẫn tiếp tục với stats khác
        statsData.totalRevenue = 0;
      }
      
      console.log('Final Stats with Revenue:', statsData);
      setStats(statsData);
      
      // Fetch all data without loading states for initial load
      await fetchUsersData();
      await fetchPaymentsData();
      await fetchQuestionsData();
      await fetchExamsData();
      
      toast({
        title: "Tải dữ liệu thành công",
        description: "Dữ liệu dashboard đã được cập nhật",
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Lỗi tải dữ liệu",
        description: "Không thể tải dữ liệu dashboard",
        variant: "destructive"
      });
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
      
      setUsers(paginatedUsers);
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

  const fetchPaymentsData = async () => {
    try {
      setPaymentsLoading(true);
      
      // Fetch all payments from API
      const paymentsData = await AdminApiService.getPayments();
      setPayments(paymentsData);
      
      // Update pagination info
      setSubscriptionsTotalItems(paymentsData.length);
      setSubscriptionsTotalPages(Math.ceil(paymentsData.length / pageSize));
      
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        title: "Lỗi tải dữ liệu payments",
        description: "Không thể tải danh sách thanh toán",
        variant: "destructive"
      });
    } finally {
      setPaymentsLoading(false);
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
    setQuestionsCurrentPage(1);
    setExamsCurrentPage(1);
    // Fetch data for the new tab
    if (user?.roleId === '2') {
      fetchDashboardData();
    }
  };

  // Users are already paginated from API, no need for frontend filtering
  const filteredUsers = users;

  // Filter payments by search term
  const filteredPayments = payments
    .filter(payment =>
      payment.id.toString().includes(searchTerm) ||
      payment.userId.toString().includes(searchTerm) ||
      payment.paymentStatus.toLowerCase().includes(searchTerm.toLowerCase())
    )
    // Sort by createdAt descending (newest first)
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA; // Descending order (newest first)
    });

  // Update pagination when filtered
  useEffect(() => {
    setSubscriptionsTotalItems(filteredPayments.length);
    setSubscriptionsTotalPages(Math.ceil(filteredPayments.length / pageSize));
  }, [filteredPayments.length, pageSize]);

  // Paginate filtered payments
  const paginatedPayments = filteredPayments.slice(
    (subscriptionsCurrentPage - 1) * pageSize,
    subscriptionsCurrentPage * pageSize
  );


  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboardContent stats={stats} />;
      
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

      case 'subscriptions':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Subscriptions</h1>
              <p className="text-gray-400 mt-2">Manage package subscriptions</p>
            </div>
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">List of Subscriptions</CardTitle>
                    <CardDescription className="text-gray-400">
                    Track and manage registration packages in the system
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
                    <Button variant="outline" size="sm" className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600">
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
                      <TableHead className="text-gray-300">Payment Status</TableHead>
                      <TableHead className="text-gray-300">Start Date</TableHead>
                      <TableHead className="text-gray-300">End Date</TableHead>
                      <TableHead className="text-gray-300">Active</TableHead>
                      <TableHead className="text-gray-300">Created At</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentsLoading ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mr-3"></div>
                            <span className="text-gray-400">Đang tải dữ liệu...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : paginatedPayments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8">
                          <span className="text-gray-400">Không có dữ liệu</span>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedPayments.map((payment) => (
                      <TableRow key={payment.id} className="border-gray-700 hover:bg-gray-700">
                        <TableCell className="font-medium text-white">{payment.id}</TableCell>
                        <TableCell className="text-gray-300">{payment.userId}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-white border-gray-500">
                            Type {payment.subscriptionTypeId}
                          </Badge>
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
                          {new Date(payment.createdAt).toLocaleDateString('vi-VN')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                
                {/* Pagination */}
                {subscriptionsTotalPages > 1 && (
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
        return <AdminDashboardContent stats={stats} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <AdminSidebar activeTab={activeTab} onTabChange={handleTabChange} />
      
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