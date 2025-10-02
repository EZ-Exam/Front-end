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