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
  videoUrl: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  completed: boolean;
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
  text: string;
  formula?: string;
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
  type: 'multiple-choice' | 'text' | 'numerical';
}

export interface MockTest {
  id: string;
  title: string;
  subject: 'Math' | 'Physics' | 'Chemistry';
  duration: number;
  totalQuestions: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  questions: Question[];
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