import { useParams, Link } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useGlobalLoading } from '@/contexts/GlobalLoadingContext';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle,
  Flag,
  Trophy,
  Brain,
  Target,
  AlertTriangle
} from 'lucide-react';
import api from '@/services/axios';
import { useAuth } from '@/pages/auth/AuthContext';

interface Question {
  id: string;
  contentQuestion?: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  imageUrl?: string;
  formula?: string;
  difficultyLevel?: string;
  chapterId?: number;
  gradeId?: number;
}

interface Exam {
  id: string;
  title: string;
  subject: string;
  lesson: string;
  duration: number;
  totalQuestions: number;
  examTypeName: string;
}

export function MockTestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { showLoading, hideLoading } = useGlobalLoading();
  const { user } = useAuth();
  
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [isTestCompleted, setIsTestCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [questionTimes, setQuestionTimes] = useState<Record<string, number>>({});
  const [testStartTime, setTestStartTime] = useState<number>(Date.now());

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;
  const flaggedCount = flagged.size;
  const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (value: string) => {
    if (currentQuestion) {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
    }
  };

  const handleFlag = () => {
    if (currentQuestion) {
    setFlagged(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestion.id)) {
        newSet.delete(currentQuestion.id);
      } else {
        newSet.add(currentQuestion.id);
      }
      return newSet;
    });
    }
  };

  const handleNext = () => {
    // Track time spent on current question
    if (currentQuestion) {
      const timeSpent = Date.now() - questionStartTime;
      setQuestionTimes(prev => ({
        ...prev,
        [currentQuestion.id]: (prev[currentQuestion.id] || 0) + timeSpent
      }));
    }
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setQuestionStartTime(Date.now());
    }
  };

  const handlePrevious = () => {
    // Track time spent on current question
    if (currentQuestion) {
      const timeSpent = Date.now() - questionStartTime;
      setQuestionTimes(prev => ({
        ...prev,
        [currentQuestion.id]: (prev[currentQuestion.id] || 0) + timeSpent
      }));
    }
    
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setQuestionStartTime(Date.now());
    }
  };

  const handleSubmit = async () => {
    setShowSubmitDialog(false);
    showLoading('Submitting your test...');
    
    try {
      // Calculate score
      let correctAnswers = 0;
      const details: any[] = [];
      
      questions.forEach(question => {
        const userAnswer = answers[question.id];
        const isCorrect = userAnswer === question.correctAnswer;
        if (isCorrect) {
          correctAnswers++;
        }
        
        // Prepare detail for each question
        details.push({
          questionId: question.id,
          difficulty: question.difficultyLevel || 'Medium', // Default if not available
          chapterId: question.chapterId || null,
          gradeId: question.gradeId || null,
          isCorrect: isCorrect
        });
      });
      
      const calculatedScore = Math.round((correctAnswers / questions.length) * 100);
      const timeTaken = Math.round((Date.now() - testStartTime) / 1000); // Actual time taken in seconds
      const incorrectCount = questions.length - correctAnswers;
      const unansweredCount = questions.length - answeredCount;
      
      // Get userId from localStorage or context (adjust as needed)
      const userId = user?.id || 'anonymous';
      
      // Track time for current question before submitting
      if (currentQuestion) {
        const timeSpent = Date.now() - questionStartTime;
        setQuestionTimes(prev => ({
          ...prev,
          [currentQuestion.id]: (prev[currentQuestion.id] || 0) + timeSpent
        }));
      }
      
      // Prepare answers array with detailed information
      const answersArray = questions.map(question => {
        const selectedAnswer = answers[question.id] || null;
        const isCorrect = selectedAnswer === question.correctAnswer;
        const questionTimeSpent = questionTimes[question.id] || 0;
        
        return {
          questionId: question.id.toString(), // ensure string
          selectedAnswer: selectedAnswer || "", // ensure string (empty if null)
          correctAnswer: question.correctAnswer || "", // ensure string
          isCorrect: Boolean(isCorrect), // ensure boolean
          timeSpent: Number(Math.round(questionTimeSpent / 1000)) // ensure number (seconds)
        };
      });
      
      // Prepare submission data according to the required format
      const submissionData = {
        examId: id!, // string
        userId: userId.toString(), // ensure string
        score: Number(calculatedScore), // ensure number
        correctCount: Number(correctAnswers), // ensure number
        incorrectCount: Number(incorrectCount), // ensure number
        unansweredCount: Number(unansweredCount), // ensure number
        totalQuestions: Number(questions.length), // ensure number
        submittedAt: new Date().toISOString(), // ISO string
        timeTaken: Number(timeTaken), // ensure number (seconds)
        answers: answersArray
      };
      
      console.log('Submitting exam data:', submissionData);
      
      // Call API to submit exam results
      const response = await api.post('/exam-history', submissionData);
      console.log('Submission successful:', response.data);
      
      // Save results to localStorage for analytics page
      const resultsData = {
        totalQuestions: questions.length,
        answeredQuestions: answeredCount,
        correctAnswers,
        incorrectAnswers: incorrectCount,
        unansweredQuestions: unansweredCount,
        flaggedQuestions: flaggedCount,
        timeSpent: timeTaken,
        score: calculatedScore,
        performance: calculatedScore >= 80 ? 'Excellent' : calculatedScore >= 60 ? 'Good' : 'Needs Improvement'
      };
      
      // Save data for analytics page
      localStorage.setItem(`mocktest_${id}_answers`, JSON.stringify(answers));
      localStorage.setItem(`mocktest_${id}_submitted_at`, new Date().toISOString());
      localStorage.setItem(`mocktest_${id}_results`, JSON.stringify(resultsData));
      
      setScore(calculatedScore);
      setResults(resultsData);
      setIsTestCompleted(true);
      
    } catch (error: any) {
      console.error('Error submitting exam:', error);
      
      // More detailed error handling
      let errorMessage = 'Failed to submit exam. Please try again.';
      
      if (error.response) {
        // API returned an error response
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 400) {
          errorMessage = `Bad Request: ${data.message || 'Invalid data format'}`;
        } else if (status === 401) {
          errorMessage = 'Unauthorized. Please login again.';
        } else if (status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = `Error ${status}: ${data.message || 'Unknown error'}`;
        }
        
        console.error('API Error Details:', {
          status,
          data,
          headers: error.response.headers
        });
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection.';
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      hideLoading();
    }
  };

  const startTest = async () => {
    if (!exam) return;
    
    showLoading('Loading questions...');
    try {
      const response = await api.get(`/exams/${id}/questions/detail`);
      console.log("Response Questions by examId",response.data);
      // Map API response to Question interface
      const mappedQuestions: Question[] = response.data.map((q: any) => ({
        id: q.id.toString(),
        contentQuestion: q.contentQuestion,
        options: q.options ? Object.values(q.options) : [],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        imageUrl: q.imageUrl,
        formula: q.formula,
        difficultyLevel: q.difficultyLevel,
        chapterId: q.chapterId,
        gradeId: q.gradeId
      }));
      
      console.log("Mapped Questions:", mappedQuestions);
      setQuestions(mappedQuestions);
      setIsTestStarted(true);
      setTimeLeft(exam.duration * 60);
      const now = Date.now();
      setTestStartTime(now); // Initialize test start time
      setQuestionStartTime(now); // Initialize question time tracking
      setError(null);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setError('Failed to load questions. Please try again.');
    } finally {
      hideLoading();
    }
  };

  const retakeTest = () => {
    setIsTestStarted(false);
    setIsTestCompleted(false);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setFlagged(new Set());
    setScore(0);
    setResults(null);
  };

  const fetchExam = useCallback(async () => {
    if (!id) return;
    
    showLoading('Loading Mock Test...');
    try {
      const response = await api.get(`/exams/${id}`);
      console.log("Response Exam by examId",response.data);
      const examData = response.data;
      
      // Map API response to Exam interface
      const mappedExam: Exam = {
        id: examData.id.toString(),
        title: examData.name,
        subject: examData.subjectName || 'Unknown Subject',
        lesson: examData.lessonName || 'Unknown Lesson',
        duration: examData.duration, 
        totalQuestions: examData.totalQuestions,
        examTypeName: examData.examTypeName || 'Mock Test'
      };
      
      setExam(mappedExam);
      setError(null);
    } catch (error) {
      console.error('Error fetching exam:', error);
      setError('Failed to load exam details. Please try again.');
    } finally {
      hideLoading();
    }
  }, [id, showLoading, hideLoading]);

  useEffect(() => {
    fetchExam();
  }, [fetchExam]);

  useEffect(() => {
    if (isTestStarted && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isTestStarted && timeLeft === 0) {
      handleSubmit();
    }
  }, [isTestStarted, timeLeft]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="p-6 bg-red-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <AlertTriangle className="h-12 w-12 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Mock Test</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={fetchExam}>
              Try Again
            </Button>
            <Button asChild variant="outline">
              <Link to="/mock-tests">Back to Mock Tests</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto absolute top-2 left-1/2 transform -translate-x-1/2 [animation-direction:reverse] [animation-duration:1.5s]"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Mock Test...</h2>
          <p className="text-gray-600">Please wait while we prepare your test</p>
        </div>
      </div>
    );
  }

  // Only check for questions if test has started
  if (isTestStarted && questions.length === 0 && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="p-6 bg-red-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <AlertTriangle className="h-12 w-12 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Questions Available</h2>
          <p className="text-gray-600 mb-6">This mock test doesn't have any questions yet.</p>
          <Button asChild>
            <Link to="/mock-tests">Back to Mock Tests</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Pre-test screen
  if (!isTestStarted && !isTestCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="p-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center shadow-2xl">
              <Trophy className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              {exam.title}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get ready to test your knowledge with this comprehensive mock exam
            </p>
          </div>

          {/* Test Stats */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="text-center p-8 bg-white/90 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all duration-300">
              <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{exam.totalQuestions}</h3>
              <p className="text-gray-600 font-semibold">Questions</p>
            </Card>

            <Card className="text-center p-8 bg-white/90 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all duration-300">
              <div className="p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{exam.duration}</h3>
              <p className="text-gray-600 font-semibold">Minutes</p>
        </Card>

            <Card className="text-center p-8 bg-white/90 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all duration-300">
              <div className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{exam.examTypeName}</h3>
              <p className="text-gray-600 font-semibold">Type</p>
            </Card>
          </div>

          {/* Instructions */}
          <Card className="mb-12 bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                Test Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Answer All Questions</h4>
                    <p className="text-sm text-gray-600">Complete all questions to get your final score</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Flag className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Flag Questions</h4>
                    <p className="text-sm text-gray-600">Mark questions for review if needed</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Target className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Time Management</h4>
                    <p className="text-sm text-gray-600">Manage your time wisely during the test</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Trophy className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Get Results</h4>
                    <p className="text-sm text-gray-600">Receive detailed performance analysis</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Start Button */}
          <div className="text-center">
            <Button
              onClick={startTest}
              className="h-16 px-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 rounded-2xl text-xl font-bold"
            >
              <Trophy className="mr-3 h-6 w-6" />
              Start Mock Test
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Results screen
  if (isTestCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          {/* Results Header */}
          <div className="text-center mb-12">
            <div className="p-6 bg-gradient-to-r from-green-500 to-blue-500 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center shadow-2xl">
              <Trophy className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Test Completed!
            </h1>
            <p className="text-xl text-gray-600">Here are your results</p>
          </div>

          {/* Score Display */}
          <Card className="text-center mb-12 bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
            <CardContent className="p-12">
              <div className="text-6xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
                {score}%
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Score</h2>
              <p className="text-gray-600 text-lg">
                {results?.performance === 'Excellent' ? 'Outstanding performance!' : 
                 results?.performance === 'Good' ? 'Good job! Keep it up!' : 
                 'Keep practicing to improve!'}
              </p>
            </CardContent>
          </Card>
          
          {/* Performance Metrics */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="text-center p-6 bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1">{results?.correctAnswers || 0}</h3>
              <p className="text-gray-600 font-semibold">Correct</p>
            </Card>

            <Card className="text-center p-6 bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="p-3 bg-gradient-to-r from-red-500 to-red-600 rounded-xl w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1">{results?.incorrectAnswers || 0}</h3>
              <p className="text-gray-600 font-semibold">Incorrect</p>
            </Card>

            <Card className="text-center p-6 bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <Flag className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1">{results?.flaggedQuestions || 0}</h3>
              <p className="text-gray-600 font-semibold">Flagged</p>
            </Card>

            <Card className="text-center p-6 bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <Target className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1">{Math.round((results?.timeSpent || 0) / 60)}</h3>
              <p className="text-gray-600 font-semibold">Minutes</p>
          </Card>
        </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              className="h-12 px-8 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 rounded-xl text-lg font-semibold"
            >
              <Link to={`/mock-tests/${id}/analytics`}>
                <Target className="mr-2 h-5 w-5" />
                View Analytics
              </Link>
            </Button>
            <Button 
              onClick={retakeTest}
              className="h-12 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 rounded-xl text-lg font-semibold"
            >
              <Trophy className="mr-2 h-5 w-5" />
              Retake Test
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-12 px-8 border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 rounded-xl text-lg font-semibold"
            >
              <Link to="/mock-tests">
                <Brain className="mr-2 h-5 w-5" />
                Back to Tests
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-6">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between bg-white/90 backdrop-blur-sm border-0 rounded-2xl p-6 shadow-2xl mb-6">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{exam.title}</h1>
              <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 mt-1">
                {exam.subject}
              </Badge>
            </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right">
              <div className="text-sm text-gray-500 font-medium">Time Remaining</div>
              <div className={`text-2xl font-mono font-bold ${timeLeft < 600 ? 'text-red-600' : 'text-blue-600'}`}>
              {formatTime(timeLeft)}
            </div>
          </div>
          
          <Button
            variant="outline"
            onClick={() => setShowSubmitDialog(true)}
              className="h-12 px-6 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-xl"
          >
              <CheckCircle className="mr-2 h-5 w-5" />
            Submit Test
          </Button>
        </div>
      </div>

        {/* Enhanced Progress */}
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm mb-6">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-gray-800">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="font-semibold">Answered: {answeredCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Flag className="h-4 w-4 text-orange-500" />
                  <span className="font-semibold">Flagged: {flaggedCount}</span>
                </div>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
          </div>
        </CardContent>
      </Card>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Enhanced Question */}
        <div className="lg:col-span-3">
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-6 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                      <Brain className="h-5 w-5 text-white" />
                    </div>
                  Question {currentQuestionIndex + 1}
                </CardTitle>
                <Button
                  variant={flagged.has(currentQuestion.id) ? "default" : "outline"}
                  size="sm"
                  onClick={handleFlag}
                    className={`h-10 px-4 rounded-xl transition-all duration-300 ${
                      flagged.has(currentQuestion.id) 
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg' 
                        : 'border-2 border-gray-300 hover:border-orange-500 hover:bg-orange-50'
                    }`}
                >
                  <Flag className={`h-4 w-4 ${flagged.has(currentQuestion.id) ? 'fill-current' : ''}`} />
                </Button>
              </div>
            </CardHeader>
              <CardContent className="space-y-8 p-8">
                <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                  <p className="text-xl text-gray-800 leading-relaxed">
                    {currentQuestion.contentQuestion || 'No question content available'}
                  </p>
                  {currentQuestion.imageUrl && (
                    <div className="mt-4">
                      <img 
                        src={currentQuestion.imageUrl} 
                        alt="Question illustration" 
                        className="max-w-full h-auto rounded-lg shadow-md"
                      />
                    </div>
                  )}
                  {currentQuestion.formula && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-600 font-medium mb-2">Formula:</p>
                      <p className="text-blue-800 font-mono">{currentQuestion.formula}</p>
                    </div>
                  )}
              </div>

                {/* Enhanced Answer Options */}
              <RadioGroup
                value={answers[currentQuestion.id] || ''}
                onValueChange={handleAnswerChange}
              >
                  <div className="space-y-4">
                  {currentQuestion.options && currentQuestion.options.length > 0 ? (
                    currentQuestion.options.map((option: string, index: number) => (
                        <div key={index} className="group">
                          <div className="flex items-center space-x-4 p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 cursor-pointer">
                            <RadioGroupItem value={option} id={`option-${index}`} className="w-5 h-5" />
                            <Label htmlFor={`option-${index}`} className="cursor-pointer flex-1 text-lg font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                          {option}
                        </Label>
                          </div>
                      </div>
                    ))
                  ) : (
                      <div className="text-center py-12 text-gray-500">
                        <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                          <AlertTriangle className="h-10 w-10 text-gray-400" />
                        </div>
                        <p className="text-lg">No answer options available for this question.</p>
                      <p className="text-sm mt-2">Question ID: {currentQuestion.id}</p>
                    </div>
                  )}
                </div>
              </RadioGroup>

                {/* Enhanced Navigation */}
                <div className="flex items-center justify-between pt-6 border-t-2 border-gray-100">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                    className="h-12 px-6 rounded-xl border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 disabled:opacity-50"
                >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                  Previous
                </Button>

                {currentQuestionIndex === questions.length - 1 ? (
                  <Button
                    onClick={() => setShowSubmitDialog(true)}
                      className="h-12 px-8 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 rounded-xl text-lg font-semibold"
                  >
                    Submit Test
                      <CheckCircle className="ml-2 h-5 w-5" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                      className="h-12 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 rounded-xl text-lg font-semibold"
                  >
                    Next
                      <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

          {/* Enhanced Question Navigator */}
        <div>
            <Card className="sticky top-4 shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-6 bg-gradient-to-r from-purple-50 to-blue-50">
                <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  Question Navigator
                </CardTitle>
            </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-5 gap-3 mb-6">
                {questions.map((question, index) => (
                  <Button
                    key={index}
                    variant={index === currentQuestionIndex ? 'default' : 'outline'}
                    size="sm"
                      className={`w-12 h-12 p-0 relative rounded-xl transition-all duration-300 ${
                        answers[question.id] ? 'bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg' : 
                        index === currentQuestionIndex ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 shadow-lg' :
                        'border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                    }`}
                    onClick={() => {
                      // Track time spent on current question
                      if (currentQuestion) {
                        const timeSpent = Date.now() - questionStartTime;
                        setQuestionTimes(prev => ({
                          ...prev,
                          [currentQuestion.id]: (prev[currentQuestion.id] || 0) + timeSpent
                        }));
                      }
                      setCurrentQuestionIndex(index);
                      setQuestionStartTime(Date.now());
                    }}
                  >
                    {index + 1}
                    {flagged.has(question.id) && (
                        <Flag className="absolute -top-1 -right-1 h-3 w-3 fill-orange-500 text-orange-500" />
                    )}
                  </Button>
                ))}
              </div>
              
                <div className="pt-6 border-t-2 border-gray-100">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <span className="font-semibold">Legend:</span>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-green-600 rounded border-0"></div>
                      <span className="font-medium">Answered</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
                      <span className="font-medium">Not answered</span>
                  </div>
                    <div className="flex items-center gap-3">
                      <Flag className="w-4 h-4 fill-orange-500 text-orange-500" />
                      <span className="font-medium">Flagged</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          </div>
        </div>
      </div>

      {/* Submit Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Mock Test</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit your test? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Questions answered:</span>
                <span className="font-medium ml-2">{answeredCount} / {questions.length}</span>
              </div>
              <div>
                <span className="text-gray-500">Time remaining:</span>
                <span className="font-medium ml-2">{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
              Continue Test
            </Button>
            <Button onClick={handleSubmit}>
              Submit Test
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}