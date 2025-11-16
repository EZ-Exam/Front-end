export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  grade: number;
  subjects: string[];
  joinDate: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  subject: 'Math' | 'Physics' | 'Chemistry';
  duration: number;
  pdfUrl: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  completed: boolean;
  questionSetId?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface QuestionSet {
  id: string;
  title: string;
  description: string;
  subject: 'Math' | 'Physics' | 'Chemistry';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  questions: MultipleChoiceQuestion[];
  createdAt: string;
  updatedAt: string;
}

export interface MultipleChoiceQuestion {
  id: string;
  questionText: string;
  answers: Answer[];
  explanation: string;
}

export interface Answer {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuestionResult {
  questionId: string;
  selectedAnswers: string[];
  isCorrect: boolean;
  correctAnswers: string[];
}

export interface Exercise {
  id: string;
  title: string;
  subject: 'Math' | 'Physics' | 'Chemistry';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  questions: Question[];
  timeLimit?: number;
}

export interface Question {
  id: string;
  content: string;
  questionSource: string;
  difficultyLevel: 'Easy' | 'Medium' | 'Hard';
  difficultyLevelId: number;
  createdByUserName: string;
  lessonName: string;
  chapterName?: string;
  image?: string;
  formula?: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  type: 'multiple-choice' | 'text' | 'numerical';
}

export interface QuestionComment {
  id: number;
  questionId: number;
  userId: number;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  content: string;
  rating: number;
  parentCommentId?: number | null;
  isHelpful: boolean;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  replyCount: number;
  replies: QuestionComment[];
  // Soft delete fields
  isDeleted?: boolean;
  deletedBy?: number;
  deletedAt?: string;
  deletedByUserName?: string; // Tên của moderator đã xóa
}

export interface MockTest {
  id: string;
  title: string;
  subject: 'Math' | 'Physics' | 'Chemistry';
  duration: number;
  totalQuestions: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  questionSets: string[]; // Array of question set IDs
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
  replies?: Comment[];
}

export interface ProgressData {
  subject: string;
  score: number;
  completed: number;
  total: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export interface UserAccount {
  balance: number;
  packageType: 'basic' | 'premium' | 'pro';
  packageExpiry?: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  isDefault: boolean;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'payment';
  amount: number;
  description: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface SubscriptionData {
  userId: number;
  userEmail: string;
  subscriptionTypeId: number;
  subscriptionCode: string;
  subscriptionName: string;
  subscriptionPrice: number;
  startDate: string;
  endDate: string;
  paymentStatus: string;
  isActive: boolean;
  message: string;
}

// Admin Dashboard Types
export interface AdminStats {
  totalUsers: number;
  totalQuestions: number;
  totalExams: number;
  newUsersToday?: number;
  totalOrders?: number;
  totalRevenue?: number;
}

// API Response Types
export interface ApiResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface AdminUser {
  id: number;
  email: string;
  balance: number;
  fullName: string;
  avatarUrl: string;
  phoneNumber: string;
  roleId: number;
  isActive: boolean;
  emailVerifiedAt: string;
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminOrder {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  subscriptionType: string;
}

export interface AdminPayment {
  id: number;
  userId: number;
  subscriptionTypeId: number;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  paymentStatus: string;
  amount: number;
  paymentGatewayTransactionId: string;
  createdAt: string;
  updatedAt: string;
  actionType: string;
}

export interface AdminQuestion {
  id: number;
  content: string;
  questionSource: string;
  difficultyLevelId: number;
  lessonId: number;
  gradeId: number;
  chapterId: number;
  textbookId: number;
  image: string;
  createdByUserId: number;
  createdAt: string;
  updatedAt: string;
  formula: string;
  correctAnswer: string;
  explanation: string;
  type: string;
  options: string[];
  createdByUserName: string;
  lessonName: string;
  chapterName: string;
  isActive?: boolean;
}

export interface AdminExam {
  id: number;
  name: string;
  description: string;
  subjectId: number;
  gradeId: number;
  lessonId: number;
  examTypeId: number;
  createdByUserId: number;
  timeLimit: number;
  totalQuestions: number;
  totalMarks: number;
  duration: number;
  testConfiguration: string;
  difficultyDistribution: string;
  topicDistribution: string;
  isAutoGenerated: boolean;
  generationSource: string;
  aiTestRecommendationId: number;
  isDeleted: boolean;
  isActive: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  createdByUserName: string;
  examTypeName: string;
  lessonName: string;
  subjectName: string;
  questionCount: number;
  historyCount: number;
}

// Legacy type for backward compatibility
export interface AdminQuiz extends AdminExam {}

// AI Exam Generation Types
export interface AIExamGenerationRequest {
  userId: number;
  questionCount: number;
  mode: 'review' | 'advanced';
  historyCount: number;
  subjectIds?: number[];
  gradeIds?: number[];
  chapterIds?: number[];
  lessonIds?: number[];
  difficultyLevelId?: number; // 1=EASY, 2=MEDIUM, 3=HARD
}

export interface AIExamQuestion {
  questionId: number;
  content: string;
  difficultyLevel: string;
  questionType: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  formula: string;
  questionSource: string;
  gradeId: number;
  gradeName: string;
  lessonId: number;
  lessonName: string;
  aiReasoning: string;
}

export interface AIExamMetadata {
  examId: number;
  totalQuestions: number;
  mode: string;
  userId: number;
  generatedAt: string;
  aiModel: string;
  tokensUsed: number;
  processingTimeSeconds: number;
  analysis: string;
  difficultyDistribution: Record<string, number>;
  subjectDistribution: Record<string, number>;
}

export interface AIExamGenerationResponse {
  success: boolean;
  message: string;
  questions: AIExamQuestion[];
  metadata: AIExamMetadata;
}