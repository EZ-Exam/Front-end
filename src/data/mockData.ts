import { User, Lesson, Exercise, Question, MockTest, Comment, ProgressData } from '@/types';
import { QuestionSet, MultipleChoiceQuestion, Answer,Notification } from '@/types';
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

export const mockQuestionSets: QuestionSet[] = [
  {
    id: '1',
    title: 'Quadratic Equations Basics',
    description: 'Fundamental concepts and solving methods for quadratic equations',
    subject: 'Math',
    difficulty: 'Medium',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    questions: [
      {
        id: 'q1',
        questionText: 'What is the discriminant of the quadratic equation x² - 5x + 6 = 0?',
        answers: [
          { id: 'a1', text: '1', isCorrect: true },
          { id: 'a2', text: '25', isCorrect: false },
          { id: 'a3', text: '36', isCorrect: false },
          { id: 'a4', text: '49', isCorrect: false }
        ],
        explanation: 'The discriminant is b² - 4ac = (-5)² - 4(1)(6) = 25 - 24 = 1'
      },
      {
        id: 'q2',
        questionText: 'How many real solutions does x² - 5x + 6 = 0 have?',
        answers: [
          { id: 'a5', text: '0', isCorrect: false },
          { id: 'a6', text: '1', isCorrect: false },
          { id: 'a7', text: '2', isCorrect: true },
          { id: 'a8', text: '3', isCorrect: false }
        ],
        explanation: 'Since the discriminant is positive (1 > 0), there are 2 real solutions'
      }
    ]
  },
  {
    id: '2',
    title: 'Newton\'s Laws of Motion',
    description: 'Understanding the fundamental laws that govern motion',
    subject: 'Physics',
    difficulty: 'Hard',
    createdAt: '2024-01-16T14:30:00Z',
    updatedAt: '2024-01-16T14:30:00Z',
    questions: [
      {
        id: 'q3',
        questionText: 'What is Newton\'s first law also known as?',
        answers: [
          { id: 'a9', text: 'Law of Inertia', isCorrect: true },
          { id: 'a10', text: 'Law of Acceleration', isCorrect: false },
          { id: 'a11', text: 'Law of Action-Reaction', isCorrect: false },
          { id: 'a12', text: 'Law of Gravity', isCorrect: false }
        ],
        explanation: 'Newton\'s first law is also known as the Law of Inertia, which states that objects at rest stay at rest and objects in motion stay in motion unless acted upon by an external force.'
      }
    ]
  },
  {
    id: '3',
    title: 'Chemical Bonding Types',
    description: 'Explore ionic and covalent bonds in molecules',
    subject: 'Chemistry',
    difficulty: 'Medium',
    createdAt: '2024-01-17T09:15:00Z',
    updatedAt: '2024-01-17T09:15:00Z',
    questions: [
      {
        id: 'q4',
        questionText: 'Which type of bond forms between metals and non-metals?',
        answers: [
          { id: 'a13', text: 'Covalent', isCorrect: false },
          { id: 'a14', text: 'Ionic', isCorrect: true },
          { id: 'a15', text: 'Metallic', isCorrect: false },
          { id: 'a16', text: 'Hydrogen', isCorrect: false }
        ],
        explanation: 'Ionic bonds form between metals and non-metals through the transfer of electrons from metal atoms to non-metal atoms.'
      }
    ]
  }
];

export const mockLessons: Lesson[] = [
  {
    id: '1',
    title: 'Quadratic Equations',
    description: 'Learn to solve quadratic equations using various methods',
    subject: 'Math',
    duration: 25,
    pdfUrl: '/pdfs/quadratic-equations.pdf',
    difficulty: 'Medium',
    completed: true,
    questionSetId: '1'
  },
  {
    id: '2',
    title: 'Newton\'s Laws of Motion',
    description: 'Understanding the fundamental laws that govern motion',
    subject: 'Physics',
    duration: 30,
    pdfUrl: '/pdfs/newtons-laws.pdf',
    difficulty: 'Hard',
    completed: false,
    questionSetId: '2'
  },
  {
    id: '3',
    title: 'Chemical Bonding',
    description: 'Explore ionic and covalent bonds in molecules',
    subject: 'Chemistry',
    duration: 20,
    pdfUrl: '/pdfs/chemical-bonding.pdf',
    difficulty: 'Medium',
    completed: false,
    questionSetId: '3'
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
    questionSets: [mockQuestionSets[0].id]
  },
  {
    id: '2',
    title: 'Physics Midterm',
    subject: 'Physics',
    duration: 90,
    totalQuestions: 30,
    difficulty: 'Medium',
    questionSets: [mockQuestionSets[1].id]
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