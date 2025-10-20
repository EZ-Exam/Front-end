import { AdminStats, AdminUser, AdminOrder, AdminQuestion, AdminQuiz } from '@/types';

// Mock data for admin dashboard
export const mockAdminStats: AdminStats = {
  totalUsers: 1250,
  newUsersToday: 23,
  totalOrders: 456,
  totalQuestions: 2847,
  totalExams: 156,
  totalRevenue: 12500000,
};

export const mockAdminUsers: AdminUser[] = [
  {
    id: '1',
    fullName: 'Nguyễn Văn An',
    email: 'an.nguyen@email.com',
    roleId: '1',
    createdAt: '2024-01-15T08:30:00Z',
    lastLoginAt: '2024-01-20T14:22:00Z',
    isActive: true,
    subscriptionName: 'Premium',
    balance: 50000
  },
  {
    id: '2',
    fullName: 'Trần Thị Bình',
    email: 'binh.tran@email.com',
    roleId: '1',
    createdAt: '2024-01-10T10:15:00Z',
    lastLoginAt: '2024-01-19T16:45:00Z',
    isActive: true,
    subscriptionName: 'Basic',
    balance: 25000
  },
  {
    id: '3',
    fullName: 'Lê Văn Cường',
    email: 'cuong.le@email.com',
    roleId: '1',
    createdAt: '2024-01-05T14:20:00Z',
    lastLoginAt: '2024-01-18T09:30:00Z',
    isActive: false,
    subscriptionName: 'Premium',
    balance: 0
  },
  {
    id: '4',
    fullName: 'Phạm Thị Dung',
    email: 'dung.pham@email.com',
    roleId: '3',
    createdAt: '2024-01-12T11:45:00Z',
    lastLoginAt: '2024-01-20T13:15:00Z',
    isActive: true,
    subscriptionName: 'Premium',
    balance: 75000
  },
  {
    id: '5',
    fullName: 'Hoàng Văn Em',
    email: 'em.hoang@email.com',
    roleId: '1',
    createdAt: '2024-01-08T16:30:00Z',
    lastLoginAt: '2024-01-17T12:20:00Z',
    isActive: true,
    subscriptionName: 'Basic',
    balance: 15000
  }
];

export const mockAdminOrders: AdminOrder[] = [
  {
    id: 'PKG-001',
    userId: '1',
    userName: 'Nguyễn Văn An',
    userEmail: 'an.nguyen@email.com',
    amount: 299000,
    status: 'completed',
    createdAt: '2024-01-20T10:30:00Z',
    subscriptionType: 'Premium'
  },
  {
    id: 'PKG-002',
    userId: '2',
    userName: 'Trần Thị Bình',
    userEmail: 'binh.tran@email.com',
    amount: 199000,
    status: 'pending',
    createdAt: '2024-01-19T14:22:00Z',
    subscriptionType: 'Basic'
  },
  {
    id: 'PKG-003',
    userId: '3',
    userName: 'Lê Văn Cường',
    userEmail: 'cuong.le@email.com',
    amount: 299000,
    status: 'failed',
    createdAt: '2024-01-18T09:15:00Z',
    subscriptionType: 'Premium'
  },
  {
    id: 'PKG-004',
    userId: '4',
    userName: 'Phạm Thị Dung',
    userEmail: 'dung.pham@email.com',
    amount: 299000,
    status: 'completed',
    createdAt: '2024-01-17T16:45:00Z',
    subscriptionType: 'Premium'
  },
  {
    id: 'PKG-005',
    userId: '5',
    userName: 'Hoàng Văn Em',
    userEmail: 'em.hoang@email.com',
    amount: 199000,
    status: 'completed',
    createdAt: '2024-01-16T11:20:00Z',
    subscriptionType: 'Basic'
  }
];

export const mockAdminQuestions: AdminQuestion[] = [
  {
    id: 'Q-001',
    content: 'Tính đạo hàm của hàm số f(x) = x² + 3x - 2',
    subject: 'Toán học',
    difficulty: 'Easy',
    createdAt: '2024-01-20T08:30:00Z',
    createdBy: 'Nguyễn Văn An',
    isActive: true
  },
  {
    id: 'Q-002',
    content: 'Một vật có khối lượng 2kg chuyển động với vận tốc 5m/s. Tính động năng của vật.',
    subject: 'Vật lý',
    difficulty: 'Medium',
    createdAt: '2024-01-19T14:22:00Z',
    createdBy: 'Trần Thị Bình',
    isActive: true
  },
  {
    id: 'Q-003',
    content: 'Viết phương trình phản ứng khi cho kim loại Na tác dụng với nước.',
    subject: 'Hóa học',
    difficulty: 'Easy',
    createdAt: '2024-01-18T09:15:00Z',
    createdBy: 'Lê Văn Cường',
    isActive: false
  },
  {
    id: 'Q-004',
    content: 'Tính tích phân ∫(2x + 1)dx từ 0 đến 2',
    subject: 'Toán học',
    difficulty: 'Hard',
    createdAt: '2024-01-17T16:45:00Z',
    createdBy: 'Phạm Thị Dung',
    isActive: true
  },
  {
    id: 'Q-005',
    content: 'Một con lắc đơn có chu kỳ dao động là 2 giây. Tính chiều dài của con lắc.',
    subject: 'Vật lý',
    difficulty: 'Medium',
    createdAt: '2024-01-16T11:20:00Z',
    createdBy: 'Hoàng Văn Em',
    isActive: true
  },
  {
    id: 'Q-006',
    content: 'Quá trình quang hợp diễn ra ở đâu trong tế bào thực vật?',
    subject: 'Sinh học',
    difficulty: 'Medium',
    createdAt: '2024-01-15T10:30:00Z',
    createdBy: 'Nguyễn Thị Lan',
    isActive: true
  },
  {
    id: 'Q-007',
    content: 'Phân tích tác phẩm "Truyện Kiều" của Nguyễn Du',
    subject: 'Ngữ văn',
    difficulty: 'Hard',
    createdAt: '2024-01-14T15:20:00Z',
    createdBy: 'Trần Văn Minh',
    isActive: true
  },
  {
    id: 'Q-008',
    content: 'What is the past tense of "go"?',
    subject: 'Tiếng Anh',
    difficulty: 'Easy',
    createdAt: '2024-01-13T12:10:00Z',
    createdBy: 'Lê Thị Hoa',
    isActive: true
  },
  {
    id: 'Q-009',
    content: 'Cuộc khởi nghĩa Hai Bà Trưng diễn ra vào năm nào?',
    subject: 'Lịch sử',
    difficulty: 'Medium',
    createdAt: '2024-01-12T09:45:00Z',
    createdBy: 'Phạm Văn Đức',
    isActive: true
  },
  {
    id: 'Q-010',
    content: 'Thủ đô của Việt Nam là thành phố nào?',
    subject: 'Địa lý',
    difficulty: 'Easy',
    createdAt: '2024-01-11T14:30:00Z',
    createdBy: 'Hoàng Thị Mai',
    isActive: true
  }
];

export const mockAdminQuizzes: AdminQuiz[] = [
  {
    id: 'QUIZ-001',
    title: 'Kiểm tra Toán học lớp 11 - Chương 1',
    subject: 'Toán học',
    totalQuestions: 20,
    createdAt: '2024-01-20T08:30:00Z',
    createdBy: 'Nguyễn Văn An',
    isActive: true
  },
  {
    id: 'QUIZ-002',
    title: 'Bài tập Vật lý - Động học',
    subject: 'Vật lý',
    totalQuestions: 15,
    createdAt: '2024-01-19T14:22:00Z',
    createdBy: 'Trần Thị Bình',
    isActive: true
  },
  {
    id: 'QUIZ-003',
    title: 'Trắc nghiệm Hóa học - Phản ứng oxi hóa khử',
    subject: 'Hóa học',
    totalQuestions: 25,
    createdAt: '2024-01-18T09:15:00Z',
    createdBy: 'Lê Văn Cường',
    isActive: false
  },
  {
    id: 'QUIZ-004',
    title: 'Đề thi thử Toán học - Tổng hợp',
    subject: 'Toán học',
    totalQuestions: 30,
    createdAt: '2024-01-17T16:45:00Z',
    createdBy: 'Phạm Thị Dung',
    isActive: true
  },
  {
    id: 'QUIZ-005',
    title: 'Bài kiểm tra Vật lý - Dao động',
    subject: 'Vật lý',
    totalQuestions: 18,
    createdAt: '2024-01-16T11:20:00Z',
    createdBy: 'Hoàng Văn Em',
    isActive: true
  },
  {
    id: 'QUIZ-006',
    title: 'Trắc nghiệm Sinh học - Tế bào',
    subject: 'Sinh học',
    totalQuestions: 22,
    createdAt: '2024-01-15T10:30:00Z',
    createdBy: 'Nguyễn Thị Lan',
    isActive: true
  },
  {
    id: 'QUIZ-007',
    title: 'Đề thi Ngữ văn - Truyện Kiều',
    subject: 'Ngữ văn',
    totalQuestions: 12,
    createdAt: '2024-01-14T15:20:00Z',
    createdBy: 'Trần Văn Minh',
    isActive: true
  },
  {
    id: 'QUIZ-008',
    title: 'English Grammar Test - Past Tense',
    subject: 'Tiếng Anh',
    totalQuestions: 16,
    createdAt: '2024-01-13T12:10:00Z',
    createdBy: 'Lê Thị Hoa',
    isActive: true
  },
  {
    id: 'QUIZ-009',
    title: 'Lịch sử Việt Nam - Khởi nghĩa Hai Bà Trưng',
    subject: 'Lịch sử',
    totalQuestions: 14,
    createdAt: '2024-01-12T09:45:00Z',
    createdBy: 'Phạm Văn Đức',
    isActive: true
  },
  {
    id: 'QUIZ-010',
    title: 'Địa lý Việt Nam - Thành phố và Tỉnh',
    subject: 'Địa lý',
    totalQuestions: 20,
    createdAt: '2024-01-11T14:30:00Z',
    createdBy: 'Hoàng Thị Mai',
    isActive: true
  }
];
