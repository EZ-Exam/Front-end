import { useParams, Link } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  ArrowRight, 
  Clock,
  CheckCircle,
  XCircle,
  Flag,
  AlertTriangle,
  Trophy
} from 'lucide-react';
import api from '@/services/axios';
import 'katex/dist/katex.min.css';

export function MockTestDetailPage() {
  const { id } = useParams();
  const [hasStarted, setHasStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = useCallback(() => {
    setSubmitted(true);
    setShowResults(true);
    setShowSubmitDialog(false);
  }, []);
  
  // Fetch exam and questions from API
  useEffect(() => {
    const fetchExamData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch exam details
        const examResponse = await api.get(`/exams/${id}`);
        console.log('Exam data:', examResponse.data); // Debug log
        setExam(examResponse.data);
        
        // Fetch exam questions with order
        const questionsResponse = await api.get(`/exams/${id}/questions`);
        const questionData = Array.isArray(questionsResponse?.data?.items) 
          ? questionsResponse.data.items 
          : (Array.isArray(questionsResponse?.data) ? questionsResponse.data : []);
        
        console.log('Questions data:', questionData); // Debug log
        
        // Sort questions by order field from exam_questions table
        const sortedQuestions = questionData.sort((a: any, b: any) => {
          const orderA = a.order || a.questionOrder || 0;
          const orderB = b.order || b.questionOrder || 0;
          return orderA - orderB;
        });
        
        // Fetch full question details for each question
        const questionsWithDetails = await Promise.all(
          sortedQuestions.map(async (examQuestion: any) => {
            try {
              const questionResponse = await api.get(`/questions/${examQuestion.questionId}`);
              const questionDetails = questionResponse.data;
              
              console.log(`Question ${examQuestion.questionId} details:`, questionDetails); // Debug each question
              console.log(`Question ${examQuestion.questionId} options:`, questionDetails.options); // Debug options specifically
              console.log(`Question ${examQuestion.questionId} type:`, questionDetails.type); // Debug type
              
              return {
                ...examQuestion,
                ...questionDetails,
                // Ensure we have the essential fields
                content: questionDetails.content || questionDetails.text || examQuestion.content,
                options: questionDetails.options || questionDetails.answers || examQuestion.options,
                CorrectAnswer: questionDetails.CorrectAnswer || questionDetails.correctAnswer || examQuestion.CorrectAnswer
              };
            } catch (err) {
              console.error(`Failed to fetch question ${examQuestion.questionId}:`, err);
              return examQuestion; // Return original if fetch fails
            }
          })
        );
        
        console.log('Questions with details:', questionsWithDetails); // Debug log
        setQuestions(questionsWithDetails);
        
      } catch (err: any) {
        console.error('Failed to fetch exam data:', err);
        setError(err?.response?.data?.message || 'Failed to load exam');
      } finally {
        setLoading(false);
      }
    };

    fetchExamData();
  }, [id]);
  
  useEffect(() => {
    if (hasStarted && exam && !submitted) {
      const duration = exam.duration || exam.timeLimit; 
      setTimeLeft(duration * 60); // Convert to seconds
      
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 0) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [hasStarted, exam, submitted, handleSubmit]);
  
  if (loading) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Loading exam...</h2>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Exam not found</h2>
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

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!hasStarted) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/mock-tests">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Mock Tests
            </Link>
          </Button>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">{exam.name}</CardTitle>
            <div className="flex items-center justify-center gap-4 mt-4">
              <Badge className="bg-blue-100 text-blue-800">
                {exam.subjectName}
              </Badge>
              <Badge variant="outline" className="bg-orange-100 text-orange-800">
                {exam.difficultyLevel}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{exam.duration || exam.timeLimit || 60}</div>
                <div className="text-sm text-gray-600">Minutes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{questions.length}</div>
                <div className="text-sm text-gray-600">Questions</div>
              </div>
            </div>

            <div className="space-y-4 text-sm">
              <h3 className="font-semibold text-base">Instructions:</h3>
              <div className="space-y-2 text-gray-600">
                <p>• This is a timed test. You have {exam.duration || exam.timeLimit || 60} minutes to complete all questions.</p>
                <p>• You can navigate between questions and change your answers before submitting.</p>
                <p>• Use the flag feature to mark questions you want to review later.</p>
                <p>• The test will auto-submit when time runs out.</p>
                <p>• Make sure you have a stable internet connection.</p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-900 mb-1">Important</h4>
                  <p className="text-sm text-amber-700">
                    Once you start the test, the timer cannot be paused. Make sure you're ready to commit 
                    the full duration to complete this mock test.
                  </p>
                </div>
              </div>
            </div>

            <Button 
              size="lg" 
              className="w-full"
              onClick={() => setHasStarted(true)}
            >
              Start Test
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;
  const flaggedCount = flagged.size;

  // Debug log for current question
  console.log('Current question:', currentQuestion);

  const handleAnswerChange = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };

  const handleFlag = () => {
    setFlagged(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestion.id)) {
        newSet.delete(currentQuestion.id);
      } else {
        newSet.add(currentQuestion.id);
      }
      return newSet;
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const getScore = () => {
    const correct = questions.filter(q => {
      const selectedAnswer = answers[q.id];
      // Sử dụng CorrectAnswer từ database hoặc correctAnswer từ API
      const correctAnswer = q.CorrectAnswer || q.correctAnswer;
      return correctAnswer === selectedAnswer;
    }).length;
    return Math.round((correct / questions.length) * 100);
  };

  if (showResults) {
    const score = getScore();
    const correctCount = questions.filter(q => {
      const selectedAnswer = answers[q.id];
      // Sử dụng CorrectAnswer từ database hoặc correctAnswer từ API
      const correctAnswer = q.CorrectAnswer || q.correctAnswer;
      return correctAnswer === selectedAnswer;
    }).length;
    const duration = exam.duration || exam.timeLimit || 60;
    const timeSpent = (duration * 60) - timeLeft;
    
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/mock-tests">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Mock Tests
            </Link>
          </Button>
        </div>

        {/* Results Summary */}
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
            <CardTitle className="text-3xl mb-2">{score}%</CardTitle>
            <p className="text-xl font-semibold mb-2">
              {score >= 70 ? 'Excellent!' : score >= 50 ? 'Good Job!' : 'Keep Practicing!'}
            </p>
            <p className="text-gray-600">
              You scored {correctCount} out of {questions.length} questions correct
            </p>
          </CardHeader>
        </Card>

        {/* Performance Metrics */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-blue-600">{correctCount}</div>
              <div className="text-sm text-gray-600">Correct Answers</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-orange-600">{answeredCount}</div>
              <div className="text-sm text-gray-600">Questions Attempted</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-purple-600">{formatTime(timeSpent)}</div>
              <div className="text-sm text-gray-600">Time Spent</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4">
          <Button asChild className="flex-1">
            <Link to="/analytics">
              View Detailed Analytics
            </Link>
          </Button>
          <Button variant="outline" asChild className="flex-1">
            <Link to="/mock-tests">
              Take Another Test
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white border rounded-lg p-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">{exam.name}</h1>
          <Badge>{exam.subjectName}</Badge>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-sm text-gray-500">Time Remaining</div>
            <div className={`text-lg font-mono font-bold ${timeLeft < 600 ? 'text-red-600' : ''}`}>
              {formatTime(timeLeft)}
            </div>
          </div>
          
          <Button
            variant="outline"
            onClick={() => setShowSubmitDialog(true)}
          >
            Submit Test
          </Button>
        </div>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>Answered: {answeredCount}</span>
              <span>Flagged: {flaggedCount}</span>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Question */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Question {currentQuestionIndex + 1}
                </CardTitle>
                <Button
                  variant={flagged.has(currentQuestion.id) ? "default" : "outline"}
                  size="sm"
                  onClick={handleFlag}
                >
                  <Flag className={`h-4 w-4 ${flagged.has(currentQuestion.id) ? 'fill-current' : ''}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-lg mb-4">{currentQuestion.content || currentQuestion.text || 'No question content available'}</p>
              </div>

              {/* Answer Options */}
              <RadioGroup
                value={answers[currentQuestion.id] || ''}
                onValueChange={handleAnswerChange}
              >
                <div className="space-y-3">
                  {currentQuestion.options && currentQuestion.options.length > 0 ? (
                    currentQuestion.options.map((option: string, index: number) => (
                      <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                        <RadioGroupItem value={option} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`} className="cursor-pointer flex-1">
                          {option}
                        </Label>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No answer options available for this question.</p>
                      <p className="text-sm mt-2">Question ID: {currentQuestion.id}</p>
                      <p className="text-xs mt-1">Available fields: {JSON.stringify(Object.keys(currentQuestion))}</p>
                      <p className="text-xs mt-1">Options value: {JSON.stringify(currentQuestion.options)}</p>
                    </div>
                  )}
                </div>
              </RadioGroup>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>

                {currentQuestionIndex === questions.length - 1 ? (
                  <Button
                    onClick={() => setShowSubmitDialog(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Submit Test
                    <CheckCircle className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                  >
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Question Navigator */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="text-sm">Question Navigator</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((question, index) => (
                  <Button
                    key={index}
                    variant={index === currentQuestionIndex ? 'default' : 'outline'}
                    size="sm"
                    className={`w-10 h-10 p-0 relative ${
                      answers[question.id] ? 'bg-green-50 border-green-200' : ''
                    }`}
                    onClick={() => setCurrentQuestionIndex(index)}
                  >
                    {index + 1}
                    {flagged.has(question.id) && (
                      <Flag className="absolute -top-1 -right-1 h-3 w-3 fill-yellow-500 text-yellow-500" />
                    )}
                  </Button>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  <span>Legend:</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border rounded"></div>
                    <span>Not answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Flag className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                    <span>Flagged</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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