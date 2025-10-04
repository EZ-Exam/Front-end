import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useGlobalLoading } from '@/contexts/GlobalLoadingContext';
import { useAuth } from '@/pages/auth/AuthContext';
import { 
  ArrowLeft, 
  CheckCircle,
  XCircle,
  Trophy,
  Target,
  Clock,
  Calendar,
  RotateCcw,
  Plus,
  History
} from 'lucide-react';
import api from '@/services/axios';

interface ExamHistory {
  id: number;
  examId: string;
  userId: string;
  score: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  totalQuestions: number;
  submittedAt: string;
  timeTaken: number;
  answers: Array<{
    questionId: string;
    selectedAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    timeSpent: number;
  }>;
}

interface ExamDetail {
  id: string;
  title: string;
  subjectName: string;
  examTypeName: string;
}

interface Question {
  id: string;
  contentQuestion: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  imageUrl?: string;
  formula?: string;
}

export function MockTestHistoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { showLoading, hideLoading } = useGlobalLoading();
  
  const [examHistory, setExamHistory] = useState<ExamHistory | null>(null);
  const [examDetail, setExamDetail] = useState<ExamDetail | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistoryDetail = async () => {
    if (!id || !user?.id) {
      setError('Invalid history ID or user not authenticated');
      setLoading(false);
      return;
    }

    showLoading('Loading exam history details...');
    try {
      setError(null);
      
      // Fetch exam history by ID
      const historyResponse = await api.get(`/exam-history/${id}`);
      const history: ExamHistory = historyResponse.data;
      
      if (history.userId !== user.id) {
        throw new Error('Unauthorized access to this exam history');
      }
      
      setExamHistory(history);
      
      // Fetch exam details
      const examResponse = await api.get(`/exams/${history.examId}`);
      const examData = examResponse.data;
      
      setExamDetail({
        id: history.examId,
        title: examData.name || examData.title,
        subjectName: examData.subjectName,
        examTypeName: examData.examTypeName
      });
      
      // Fetch questions for this exam
      const questionsResponse = await api.get(`/exams/${history.examId}/questions/detail`);
      const mappedQuestions: Question[] = questionsResponse.data.map((q: any) => ({
        id: q.id.toString(),
        contentQuestion: q.contentQuestion,
        options: q.options ? Object.values(q.options) : [],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        imageUrl: q.imageUrl,
        formula: q.formula
      }));
      
      setQuestions(mappedQuestions);
      
    } catch (error: any) {
      console.error('Error fetching exam history details:', error);
      setError(error.response?.data?.message || 'Failed to load exam history details. Please try again.');
    } finally {
      setLoading(false);
      hideLoading();
    }
  };

  useEffect(() => {
    fetchHistoryDetail();
  }, [id, user?.id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const isCorrect = (question: Question, history: ExamHistory) => {
    const answer = history.answers.find(a => a.questionId === question.id);
    return answer?.isCorrect || false;
  };

  const getSelectedAnswer = (question: Question, history: ExamHistory) => {
    const answer = history.answers.find(a => a.questionId === question.id);
    return answer?.selectedAnswer || null;
  };

  const getTimeSpent = (question: Question, history: ExamHistory) => {
    const answer = history.answers.find(a => a.questionId === question.id);
    return answer?.timeSpent || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto absolute top-2 left-1/2 transform -translate-x-1/2 [animation-direction:reverse] [animation-duration:1.5s]"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Exam Details...</h2>
          <p className="text-gray-600">Please wait while we fetch the exam history</p>
        </div>
      </div>
    );
  }

  if (error || !examHistory || !examDetail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="p-6 bg-red-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <XCircle className="h-12 w-12 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Exam History</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={fetchHistoryDetail}>
              Try Again
            </Button>
            <Button asChild variant="outline">
              <Link to="/mock-tests/history">Back to History</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/mock-tests/history">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to History
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{examDetail.title} - Exam History</h1>
            <p className="text-gray-600">{examDetail.subjectName} • {examDetail.examTypeName}</p>
          </div>
        </div>

        {/* Score Summary */}
        <Card className={`border-2 ${examHistory.score >= 70 ? 'border-green-200 bg-green-50' : examHistory.score >= 50 ? 'border-yellow-200 bg-yellow-50' : 'border-red-200 bg-red-50'} mb-8`}>
          <CardHeader className="text-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
              examHistory.score >= 70 ? 'bg-green-100' : examHistory.score >= 50 ? 'bg-yellow-100' : 'bg-red-100'
            }`}>
              {examHistory.score >= 70 ? (
                <Trophy className="h-10 w-10 text-green-600" />
              ) : examHistory.score >= 50 ? (
                <CheckCircle className="h-10 w-10 text-yellow-600" />
              ) : (
                <XCircle className="h-10 w-10 text-red-600" />
              )}
            </div>
            <CardTitle className="text-4xl mb-2">{examHistory.score}%</CardTitle>
            <p className="text-xl font-semibold mb-2">
              {examHistory.score >= 70 ? 'Excellent!' : examHistory.score >= 50 ? 'Good Job!' : 'Keep Practicing!'}
            </p>
            <p className="text-gray-600">
              You scored {examHistory.correctCount} out of {examHistory.totalQuestions} questions correct
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500 mt-2">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(examHistory.submittedAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{formatDuration(examHistory.timeTaken)}</span>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Performance Metrics */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-green-600">{examHistory.correctCount}</div>
              <div className="text-sm text-gray-600">Correct</div>
              <Progress value={(examHistory.correctCount / examHistory.totalQuestions) * 100} className="mt-2 h-2" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-red-600">{examHistory.incorrectCount}</div>
              <div className="text-sm text-gray-600">Incorrect</div>
              <Progress value={(examHistory.incorrectCount / examHistory.totalQuestions) * 100} className="mt-2 h-2" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-gray-600">{examHistory.unansweredCount}</div>
              <div className="text-sm text-gray-600">Unanswered</div>
              <Progress value={(examHistory.unansweredCount / examHistory.totalQuestions) * 100} className="mt-2 h-2" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-blue-600">{examHistory.totalQuestions}</div>
              <div className="text-sm text-gray-600">Total Questions</div>
              <Progress value={100} className="mt-2 h-2" />
            </CardContent>
          </Card>
        </div>

        {/* Question Review */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Question Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {questions.map((question, index) => {
                const correct = isCorrect(question, examHistory);
                const selectedAnswer = getSelectedAnswer(question, examHistory);
                const timeSpent = getTimeSpent(question, examHistory);
                
                return (
                  <div key={question.id} className={`p-4 rounded-lg border ${
                    correct ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-sm">
                          Question {index + 1}
                        </Badge>
                        {correct ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <span className={`text-sm font-medium ${
                          correct ? 'text-green-800' : 'text-red-800'
                        }`}>
                          {correct ? 'Correct' : 'Incorrect'}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({formatDuration(timeSpent)})
                        </span>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-gray-800 font-medium">{question.contentQuestion}</p>
                    </div>
                    
                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => {
                        const isSelected = option === selectedAnswer;
                        const isCorrectAnswer = option === question.correctAnswer;
                        
                        return (
                          <div key={optionIndex} className={`p-2 rounded text-sm ${
                            isCorrectAnswer 
                              ? 'bg-green-100 text-green-800 border border-green-300' 
                              : isSelected 
                                ? 'bg-red-100 text-red-800 border border-red-300'
                                : 'bg-gray-50 text-gray-700'
                          }`}>
                            <span className="font-medium">
                              {String.fromCharCode(65 + optionIndex)}. 
                            </span>
                            {option}
                            {isCorrectAnswer && <span className="ml-2 text-green-600 font-semibold">✓ Correct Answer</span>}
                            {isSelected && !isCorrectAnswer && <span className="ml-2 text-red-600 font-semibold">✗ Your Answer</span>}
                          </div>
                        );
                      })}
                    </div>
                    
                    {!selectedAnswer && (
                      <div className="mt-2 p-2 bg-gray-100 rounded text-sm text-gray-600">
                        No answer selected
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button 
            asChild
            className="flex-1"
            variant="outline"
          >
            <Link to={`/mock-tests/${examHistory.examId}`}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Retake This Test
            </Link>
          </Button>
          <Button 
            asChild
            className="flex-1"
          >
            <Link to="/mock-tests">
              <Plus className="mr-2 h-4 w-4" />
              Take New Test
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
