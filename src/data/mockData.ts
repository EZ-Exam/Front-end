import { User, Lesson, Question, MockTest, Comment, ProgressData } from '@/types';
import { Notification } from '@/types';
import { UserAccount, BankAccount, Transaction } from '@/types';

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
    pdfUrl: '/pdfs/quadratic-equations.pdf',
    difficulty: 'Medium',
    completed: true
  },
  {
    id: '2',
    title: 'Newton\'s Laws of Motion',
    description: 'Understanding the fundamental laws that govern motion',
    subject: 'Physics',
    duration: 30,
    pdfUrl: '/pdfs/newtons-laws.pdf',
    difficulty: 'Hard',
    completed: false
  },
  {
    id: '3',
    title: 'Chemical Bonding',
    description: 'Explore ionic and covalent bonds in molecules',
    subject: 'Chemistry',
    duration: 20,
    pdfUrl: '/pdfs/chemical-bonding.pdf',
    difficulty: 'Medium',
    completed: false
  }
];

export const mockQuestions: Question[] = [
  {
    id: '1',
    content: 'What is the discriminant of the quadratic equation x² - 5x + 6 = 0?',
    questionSource: 'Math Textbook Chapter 5',
    difficultyLevel: 'Medium',
    createdByUserName: 'Dr. Smith',
    lessonName: 'Quadratic Equations',
    chapterName: 'Discriminant and Roots',
    options: ['1', '25', '36', '49'],
    correctAnswer: '1',
    explanation: 'The discriminant is b² - 4ac = (-5)² - 4(1)(6) = 25 - 24 = 1',
    type: 'multiple-choice'
  },
  {
    id: '2',
    content: 'How many real solutions does x² - 5x + 6 = 0 have?',
    questionSource: 'Practice Workbook',
    difficultyLevel: 'Easy',
    createdByUserName: 'Prof. Johnson',
    lessonName: 'Quadratic Equations',
    chapterName: 'Discriminant and Roots',
    options: ['0', '1', '2', '3'],
    correctAnswer: '2',
    explanation: 'Since the discriminant is positive (1 > 0), there are 2 real solutions',
    type: 'multiple-choice'
  },
  {
    id: '3',
    content: 'What is Newton\'s first law also known as?',
    questionSource: 'Physics Fundamentals',
    difficultyLevel: 'Hard',
    createdByUserName: 'Dr. Brown',
    lessonName: 'Newton\'s Laws of Motion',
    chapterName: 'First Law of Motion',
    options: ['Law of Inertia', 'Law of Acceleration', 'Law of Action-Reaction', 'Law of Gravity'],
    correctAnswer: 'Law of Inertia',
    explanation: 'Newton\'s first law is also known as the Law of Inertia, which states that objects at rest stay at rest and objects in motion stay in motion unless acted upon by an external force.',
    type: 'multiple-choice'
  },
  {
    id: '4',
    content: 'Which type of bond forms between metals and non-metals?',
    questionSource: 'Chemistry Textbook',
    difficultyLevel: 'Medium',
    createdByUserName: 'Dr. Wilson',
    lessonName: 'Chemical Bonding',
    chapterName: 'Types of Bonds',
    options: ['Covalent', 'Ionic', 'Metallic', 'Hydrogen'],
    correctAnswer: 'Ionic',
    explanation: 'Ionic bonds form between metals and non-metals through the transfer of electrons from metal atoms to non-metal atoms.',
    type: 'multiple-choice'
  },
  {
    id: '5',
    content: 'Calculate the area of a circle with radius 5 cm.',
    questionSource: 'Geometry Workbook',
    difficultyLevel: 'Easy',
    createdByUserName: 'Ms. Davis',
    lessonName: 'Circle Geometry',
    chapterName: 'Area and Circumference',
    formula: 'A = πr²',
    correctAnswer: '78.54 cm²',
    explanation: 'Using the formula A = πr², A = π × 5² = π × 25 = 78.54 cm²',
    type: 'numerical'
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
    questionSets: ['1', '2']
  },
  {
    id: '2',
    title: 'Physics Midterm',
    subject: 'Physics',
    duration: 90,
    totalQuestions: 30,
    difficulty: 'Medium',
    questionSets: ['3']
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
]

export const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'New Mock Test Available',
    message: 'A new Physics mock test has been added to help you prepare for your upcoming exam.',
    type: 'info',
    timestamp: '2024-01-20T10:30:00Z',
    read: false,
    actionUrl: '/mock-tests'
  },
  {
    id: '2',
    title: 'Exercise Completed',
    message: 'Congratulations! You scored 92% on the Algebra Basics exercise.',
    type: 'success',
    timestamp: '2024-01-20T09:15:00Z',
    read: false
  },
  {
    id: '3',
    title: 'Study Reminder',
    message: 'Don\'t forget to complete your daily Chemistry practice. You\'re on a 5-day streak!',
    type: 'warning',
    timestamp: '2024-01-20T08:00:00Z',
    read: false
  },
  {
    id: '4',
    title: 'New Lesson Available',
    message: 'A new lesson on Quadratic Equations has been added to your Math course.',
    type: 'info',
    timestamp: '2024-01-19T16:45:00Z',
    read: true,
    actionUrl: '/lessons'
  },
  {
    id: '5',
    title: 'Weekly Progress Report',
    message: 'Your weekly progress report is ready. Check out your improvements in all subjects!',
    type: 'info',
    timestamp: '2024-01-19T12:00:00Z',
    read: true,
    actionUrl: '/analytics'
  },
  {
    id: '6',
    title: 'Mock Test Reminder',
    message: 'You have a scheduled mock test tomorrow at 2:00 PM. Make sure you\'re prepared!',
    type: 'warning',
    timestamp: '2024-01-19T10:30:00Z',
    read: true
  },
  {
    id: '7',
    title: 'Achievement Unlocked',
    message: 'You\'ve completed 50 exercises! Keep up the excellent work.',
    type: 'success',
    timestamp: '2024-01-18T14:20:00Z',
    read: true
  },
  {
    id: '8',
    title: 'System Maintenance',
    message: 'Scheduled maintenance will occur tonight from 2:00 AM to 4:00 AM. Plan accordingly.',
    type: 'warning',
    timestamp: '2024-01-18T11:00:00Z',
    read: true
  }
];

export const mockUserAccount: UserAccount = {
  balance: 1250.50,
  packageType: 'premium',
  packageExpiry: '2024-12-31'
};

export const mockBankAccounts: BankAccount[] = [
  {
    id: '1',
    bankName: 'Chase Bank',
    accountNumber: '****1234',
    accountHolder: 'Alex Johnson',
    isDefault: true
  },
  {
    id: '2',
    bankName: 'Bank of America',
    accountNumber: '****5678',
    accountHolder: 'Alex Johnson',
    isDefault: false
  }
];

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'deposit',
    amount: 500,
    description: 'Account top-up',
    timestamp: '2024-01-20T10:30:00Z',
    status: 'completed'
  },
  {
    id: '2',
    type: 'payment',
    amount: 99.99,
    description: 'Premium package upgrade',
    timestamp: '2024-01-19T14:20:00Z',
    status: 'completed'
  },
  {
    id: '3',
    type: 'withdrawal',
    amount: 200,
    description: 'Withdrawal to bank account',
    timestamp: '2024-01-18T09:15:00Z',
    status: 'pending'
  }
];