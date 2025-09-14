import { User, Lesson, Exercise, Question, MockTest, Comment, ProgressData } from '@/types';

export const mockUser: User = {
  id: '1',
  name: 'Alex Johnson',
  email: 'alex@example.com',
  avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
  grade: 12,
  subjects: ['Math', 'Physics', 'Chemistry'],
  joinDate: '2024-01-15'
};

export const mockLessons: Lesson[] = [
  {
    id: '1',
    title: 'Quadratic Equations',
    description: 'Learn to solve quadratic equations using various methods',
    subject: 'Math',
    duration: 25,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    difficulty: 'Medium',
    completed: true
  },
  {
    id: '2',
    title: 'Newton\'s Laws of Motion',
    description: 'Understanding the fundamental laws that govern motion',
    subject: 'Physics',
    duration: 30,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    difficulty: 'Hard',
    completed: false
  },
  {
    id: '3',
    title: 'Chemical Bonding',
    description: 'Explore ionic and covalent bonds in molecules',
    subject: 'Chemistry',
    duration: 20,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    difficulty: 'Medium',
    completed: false
  }
];

export const mockQuestions: Question[] = [
  {
    id: '1',
    text: 'Solve for x in the equation x² - 5x + 6 = 0',
    formula: 'x^2 - 5x + 6 = 0',
    options: ['x = 2, 3', 'x = 1, 6', 'x = -2, -3', 'x = 0, 5'],
    correctAnswer: 'x = 2, 3',
    explanation: 'Factor the quadratic: (x-2)(x-3) = 0, so x = 2 or x = 3',
    type: 'multiple-choice'
  },
  {
    id: '2',
    text: 'What is the acceleration due to gravity on Earth?',
    options: ['9.8 m/s²', '10 m/s²', '8.9 m/s²', '11.2 m/s²'],
    correctAnswer: '9.8 m/s²',
    explanation: 'The standard acceleration due to gravity is approximately 9.8 m/s²',
    type: 'multiple-choice'
  }
];

export const mockExercises: Exercise[] = [
  {
    id: '1',
    title: 'Algebra Basics',
    subject: 'Math',
    difficulty: 'Easy',
    questions: mockQuestions,
    timeLimit: 30
  },
  {
    id: '2',
    title: 'Mechanics Problems',
    subject: 'Physics',
    difficulty: 'Hard',
    questions: mockQuestions,
    timeLimit: 45
  }
];

export const mockTests: MockTest[] = [
  {
    id: '1',
    title: 'Math Final Practice',
    subject: 'Math',
    duration: 120,
    totalQuestions: 50,
    difficulty: 'Hard',
    questions: mockQuestions
  },
  {
    id: '2',
    title: 'Physics Midterm',
    subject: 'Physics',
    duration: 90,
    totalQuestions: 30,
    difficulty: 'Medium',
    questions: mockQuestions
  }
];

export const mockComments: Comment[] = [
  {
    id: '1',
    userId: '1',
    userName: 'Sarah Chen',
    content: 'Great explanation of quadratic equations! The examples really helped.',
    timestamp: '2024-01-20T10:30:00Z',
    replies: [
      {
        id: '2',
        userId: '2',
        userName: 'Mike Johnson',
        content: 'I agree! The step-by-step approach made it so much clearer.',
        timestamp: '2024-01-20T11:00:00Z'
      }
    ]
  }
];

export const mockProgressData: ProgressData[] = [
  { subject: 'Math', score: 85, completed: 12, total: 15 },
  { subject: 'Physics', score: 78, completed: 8, total: 12 },
  { subject: 'Chemistry', score: 92, completed: 10, total: 10 }
];