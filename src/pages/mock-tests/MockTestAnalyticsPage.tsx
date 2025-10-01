import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useGlobalLoading } from '@/contexts/GlobalLoadingContext';
import { 
  ArrowLeft, 
  CheckCircle,
  XCircle,
  Trophy,
  Target,
  RotateCcw,
  Plus
} from 'lucide-react';
import api from '@/services/axios';

export function MockTestAnalyticsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submittedAt, setSubmittedAt] = useState<Date | null>(null);

  // Global loading hook
  const { withLoading } = useGlobalLoading();

  // Fetch exam data and answers from localStorage or API
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!id) return;
      
      await withLoading(async () => {
        try {
          setLoading(true);
          setError(null);
          
          // Fetch exam details
          const examResponse = await api.get(`/exams/${id}`);
          setExam(examResponse.data);
          
          // Fetch exam questions
          const questionsResponse = await api.get(`/exams/${id}/questions`);
          const questionData = Array.isArray(questionsResponse?.data?.items) 
            ? questionsResponse.data.items 
            : (Array.isArray(questionsResponse?.data) ? questionsResponse.data : []);
          
          // Sort questions by order
          const sortedQuestions = questionData.sort((a: any, b: any) => {
            const orderA = a.order || a.questionOrder || 0;
            const orderB = b.order || b.questionOrder || 0;
            return orderA - orderB;
          });
          
          // Fetch full question details
          const questionsWithDetails = await Promise.all(
            sortedQuestions.map(async (examQuestion: any) => {
              try {
                const questionResponse = await api.get(`/questions/${examQuestion.questionId}`);
                const questionDetails = questionResponse.data;
                
                return {
                  ...examQuestion,
                  ...questionDetails,
                  content: questionDetails.content || questionDetails.text || examQuestion.content,
                  options: questionDetails.options || questionDetails.answers || examQuestion.options,
                  CorrectAnswer: questionDetails.CorrectAnswer || questionDetails.correctAnswer || examQuestion.CorrectAnswer
                };
              } catch (err) {
                console.error(`Failed to fetch question ${examQuestion.questionId}:`, err);
                return examQuestion;
              }
            })
          );
          
          setQuestions(questionsWithDetails);
          
          // Get answers from localStorage (from the completed test)
          const savedAnswers = localStorage.getItem(`mocktest_${id}_answers`);
          const savedSubmittedAt = localStorage.getItem(`mocktest_${id}_submitted_at`);
          
          if (savedAnswers) {
            setAnswers(JSON.parse(savedAnswers));
          }
          
          if (savedSubmittedAt) {
            setSubmittedAt(new Date(savedSubmittedAt));
          }
          
        } catch (err: any) {
          console.error('Failed to fetch analytics data:', err);
          setError(err?.response?.data?.message || 'Failed to load analytics');
        } finally {
          setLoading(false);
        }
      }, "Đang tải dữ liệu phân tích...");
    };

    fetchAnalyticsData();
  }, [id, withLoading]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Loading analytics...</h2>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Analytics not found</h2>
        <p className="text-red-600 mb-4">{error}</p>
        <Button asChild>
          <Link to="/mock-tests">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Mock Tests
          </Link>
        </Button>
      </div>
    );
  }

  const getScore = () => {
    const correct = questions.filter(q => {
      const selectedAnswer = answers[q.id];
      const correctAnswer = q.CorrectAnswer || q.correctAnswer;
      return correctAnswer === selectedAnswer;
    }).length;
    return Math.round((correct / questions.length) * 100);
  };

  const getCorrectCount = () => {
    return questions.filter(q => {
      const selectedAnswer = answers[q.id];
      const correctAnswer = q.CorrectAnswer || q.correctAnswer;
      return correctAnswer === selectedAnswer;
    }).length;
  };

  const getIncorrectCount = () => {
    return questions.length - getCorrectCount();
  };

  const getUnansweredCount = () => {
    return questions.filter(q => !answers[q.id]).length;
  };

  const isCorrect = (question: any) => {
    const selectedAnswer = answers[question.id];
    const correctAnswer = question.CorrectAnswer || question.correctAnswer;
    return correctAnswer === selectedAnswer;
  };

  const handleRetakeTest = () => {
    // Clear saved answers and redirect to test
    if (id) {
      localStorage.removeItem(`mocktest_${id}_answers`);
      localStorage.removeItem(`mocktest_${id}_submitted_at`);
    }
    navigate(`/mock-tests/${id}`);
  };

  const handleNewTest = () => {
    navigate('/mock-tests');
  };

  const score = getScore();
  const correctCount = getCorrectCount();
  const incorrectCount = getIncorrectCount();
  const unansweredCount = getUnansweredCount();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/mock-tests">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Mock Tests
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{exam.name} - Analytics</h1>
          <p className="text-gray-600">{exam.subjectName} • {exam.difficultyLevel}</p>
        </div>
      </div>

      {/* Score Summary */}
      <Card className={`border-2 ${score >= 70 ? 'border-green-200 bg-green-50' : score >= 50 ? 'border-yellow-200 bg-yellow-50' : 'border-red-200 bg-red-50'}`}>
        <CardHeader className="text-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
            score >= 70 ? 'bg-green-100' : score >= 50 ? 'bg-yellow-100' : 'bg-red-100'
          }`}>
            {score >= 70 ? (
              <Trophy className="h-10 w-10 text-green-600" />
            ) : score >= 50 ? (
              <CheckCircle className="h-10 w-10 text-yellow-600" />
            ) : (
              <XCircle className="h-10 w-10 text-red-600" />
            )}
          </div>
          <CardTitle className="text-4xl mb-2">{score}%</CardTitle>
          <p className="text-xl font-semibold mb-2">
            {score >= 70 ? 'Excellent!' : score >= 50 ? 'Good Job!' : 'Keep Practicing!'}
          </p>
          <p className="text-gray-600">
            You scored {correctCount} out of {questions.length} questions correct
          </p>
          {submittedAt && (
            <p className="text-sm text-gray-500 mt-2">
              Completed on {submittedAt.toLocaleDateString()} at {submittedAt.toLocaleTimeString()}
            </p>
          )}
        </CardHeader>
      </Card>

      {/* Performance Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-green-600">{correctCount}</div>
            <div className="text-sm text-gray-600">Correct</div>
            <Progress value={(correctCount / questions.length) * 100} className="mt-2 h-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-red-600">{incorrectCount}</div>
            <div className="text-sm text-gray-600">Incorrect</div>
            <Progress value={(incorrectCount / questions.length) * 100} className="mt-2 h-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-gray-600">{unansweredCount}</div>
            <div className="text-sm text-gray-600">Unanswered</div>
            <Progress value={(unansweredCount / questions.length) * 100} className="mt-2 h-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-blue-600">{questions.length}</div>
            <div className="text-sm text-gray-600">Total Questions</div>
            <Progress value={100} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Question Review */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Question Review
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {questions.map((question, index) => {
              const correct = isCorrect(question);
              const selectedAnswer = answers[question.id];
              const correctAnswer = question.CorrectAnswer || question.correctAnswer;
              
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
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-gray-800 font-medium">{question.content || question.text}</p>
                  </div>
                  
                  <div className="space-y-2">
                    {question.options && question.options.map((option: string, optionIndex: number) => {
                      const isSelected = option === selectedAnswer;
                      const isCorrect = option === correctAnswer;
                      
                      return (
                        <div key={optionIndex} className={`p-2 rounded text-sm ${
                          isCorrect 
                            ? 'bg-green-100 text-green-800 border border-green-300' 
                            : isSelected 
                              ? 'bg-red-100 text-red-800 border border-red-300'
                              : 'bg-gray-50 text-gray-700'
                        }`}>
                          <span className="font-medium">
                            {String.fromCharCode(65 + optionIndex)}. 
                          </span>
                          {option}
                          {isCorrect && <span className="ml-2 text-green-600 font-semibold">✓ Correct Answer</span>}
                          {isSelected && !isCorrect && <span className="ml-2 text-red-600 font-semibold">✗ Your Answer</span>}
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
          onClick={handleRetakeTest}
          className="flex-1"
          variant="outline"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Retake This Test
        </Button>
        <Button 
          onClick={handleNewTest}
          className="flex-1"
        >
          <Plus className="mr-2 h-4 w-4" />
          Take New Test
        </Button>
      </div>
    </div>
  );
}
