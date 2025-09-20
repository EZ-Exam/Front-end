import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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
import { mockTests, mockQuestionSets } from '@/data/mockData';
import { BlockMath } from 'react-katex';
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
  
  const test = mockTests.find(t => t.id === id);
  
  // Get all questions from the question sets
  const allQuestions = test?.questionSets.flatMap(qsId => 
    mockQuestionSets.find(qs => qs.id === qsId)?.questions || []
  ) || [];
  
  useEffect(() => {
    if (hasStarted && test && !submitted) {
      setTimeLeft(test.duration * 60); // Convert to seconds
      
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
  }, [hasStarted, test, submitted]);
  
  if (!test) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Mock test not found</h2>
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
            <CardTitle className="text-2xl">{test.title}</CardTitle>
            <div className="flex items-center justify-center gap-4 mt-4">
              <Badge className="bg-blue-100 text-blue-800">
                {test.subject}
              </Badge>
              <Badge variant="outline" className="bg-orange-100 text-orange-800">
                {test.difficulty}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{test.duration}</div>
                <div className="text-sm text-gray-600">Minutes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{test.totalQuestions}</div>
                <div className="text-sm text-gray-600">Questions</div>
              </div>
            </div>

            <div className="space-y-4 text-sm">
              <h3 className="font-semibold text-base">Instructions:</h3>
              <div className="space-y-2 text-gray-600">
                <p>• This is a timed test. You have {test.duration} minutes to complete all questions.</p>
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

  const currentQuestion = allQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / allQuestions.length) * 100;
  const answeredCount = Object.keys(answers).length;
  const flaggedCount = flagged.size;

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
    if (currentQuestionIndex < allQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setShowResults(true);
    setShowSubmitDialog(false);
  };

  const getScore = () => {
    const correct = allQuestions.filter(q => {
      const selectedAnswer = answers[q.id];
      return q.answers.find(a => a.text === selectedAnswer && a.isCorrect);
    }).length;
    return Math.round((correct / allQuestions.length) * 100);
  };

  if (showResults) {
    const score = getScore();
    const correctCount = allQuestions.filter(q => {
      const selectedAnswer = answers[q.id];
      return q.answers.find(a => a.text === selectedAnswer && a.isCorrect);
    }).length;
    const timeSpent = (test.duration * 60) - timeLeft;
    
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
              You scored {correctCount} out of {allQuestions.length} questions correct
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
          <h1 className="text-xl font-bold">{test.title}</h1>
          <Badge>{test.subject}</Badge>
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
              Question {currentQuestionIndex + 1} of {allQuestions.length}
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
                <p className="text-lg mb-4">{currentQuestion.questionText}</p>
              </div>

              {/* Answer Options */}
              <RadioGroup
                value={answers[currentQuestion.id] || ''}
                onValueChange={handleAnswerChange}
              >
                <div className="space-y-3">
                  {currentQuestion.answers.map((answer, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value={answer.text} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="cursor-pointer flex-1">
                        {answer.text}
                      </Label>
                    </div>
                  ))}
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

                <Button
                  onClick={handleNext}
                  disabled={currentQuestionIndex === allQuestions.length - 1}
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
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
                {allQuestions.map((question, index) => (
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
                <span className="font-medium ml-2">{answeredCount} / {allQuestions.length}</span>
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