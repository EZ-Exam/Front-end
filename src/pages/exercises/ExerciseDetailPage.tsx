import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, 
  ArrowRight, 
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  RotateCcw
} from 'lucide-react';
import { mockExercises } from '@/data/mockData';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

export function ExerciseDetailPage() {
  const { id } = useParams();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  
  const exercise = mockExercises.find(e => e.id === id);
  
  useEffect(() => {
    if (exercise?.timeLimit && !submitted) {
      setTimeLeft(exercise.timeLimit * 60); // Convert to seconds
      
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev === null || prev <= 0) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [exercise, submitted]);
  
  if (!exercise) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Exercise not found</h2>
        <Button asChild>
          <Link to="/exercises">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Exercises
          </Link>
        </Button>
      </div>
    );
  }

  const currentQuestion = exercise.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / exercise.questions.length) * 100;
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < exercise.questions.length - 1) {
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
  };

  const getScore = () => {
    const correct = exercise.questions.filter(q => 
      answers[q.id] === q.correctAnswer
    ).length;
    return Math.round((correct / exercise.questions.length) * 100);
  };

  const isCorrect = (questionId: string) => {
    const question = exercise.questions.find(q => q.id === questionId);
    return question && answers[questionId] === question.correctAnswer;
  };

  if (showResults) {
    const score = getScore();
    const correctCount = exercise.questions.filter(q => isCorrect(q.id)).length;
    
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/exercises">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Exercises
            </Link>
          </Button>
        </div>

        {/* Results Summary */}
        <Card className={`border-2 ${score >= 70 ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
          <CardHeader className="text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              score >= 70 ? 'bg-green-100' : 'bg-orange-100'
            }`}>
              {score >= 70 ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : (
                <XCircle className="h-8 w-8 text-orange-600" />
              )}
            </div>
            <CardTitle className="text-2xl">Exercise Complete!</CardTitle>
            <div className="text-3xl font-bold mb-2">{score}%</div>
            <p className="text-gray-600">
              You got {correctCount} out of {exercise.questions.length} questions correct
            </p>
          </CardHeader>
        </Card>

        {/* Question Review */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Review Your Answers</h2>
          {exercise.questions.map((question, index) => {
            const correct = isCorrect(question.id);
            const userAnswer = answers[question.id];
            
            return (
              <Card key={question.id} className={`border-l-4 ${
                correct ? 'border-green-500' : 'border-red-500'
              }`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">Question {index + 1}</span>
                        {correct ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <p className="mb-3">{question.text}</p>
                      {question.formula && (
                        <div className="mb-3">
                          <BlockMath math={question.formula} />
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-sm">Your Answer: </span>
                      <span className={correct ? 'text-green-600' : 'text-red-600'}>
                        {userAnswer || 'Not answered'}
                      </span>
                    </div>
                    
                    {!correct && (
                      <div>
                        <span className="font-medium text-sm">Correct Answer: </span>
                        <span className="text-green-600">{question.correctAnswer}</span>
                      </div>
                    )}
                    
                    {question.explanation && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <span className="font-medium text-sm block mb-1">Explanation:</span>
                        <p className="text-sm text-blue-800">{question.explanation}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex gap-4">
          <Button onClick={() => {
            setShowResults(false);
            setSubmitted(false);
            setCurrentQuestionIndex(0);
            setAnswers({});
          }} className="flex-1">
            <RotateCcw className="mr-2 h-4 w-4" />
            Retry Exercise
          </Button>
          <Button variant="outline" asChild className="flex-1">
            <Link to="/exercises">
              Back to Exercises
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/exercises">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">{exercise.title}</h1>
        </div>
        
        {timeLeft !== null && (
          <div className="flex items-center gap-2 text-lg font-mono">
            <Clock className="h-5 w-5" />
            <span className={timeLeft < 300 ? 'text-red-600' : ''}>
              {formatTime(timeLeft)}
            </span>
          </div>
        )}
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Question {currentQuestionIndex + 1} of {exercise.questions.length}
            </span>
            <span className="text-sm text-gray-500">{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Question */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Question {currentQuestionIndex + 1}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-lg mb-4">{currentQuestion.text}</p>
            
            {currentQuestion.formula && (
              <div className="my-4 p-4 bg-gray-50 rounded-lg">
                <BlockMath math={currentQuestion.formula} />
              </div>
            )}
          </div>

          {/* Answer Options */}
          {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
            <RadioGroup
              value={answers[currentQuestion.id] || ''}
              onValueChange={handleAnswerChange}
            >
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          )}

          {currentQuestion.type === 'text' && (
            <Input
              placeholder="Enter your answer..."
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswerChange(e.target.value)}
            />
          )}

          {currentQuestion.type === 'numerical' && (
            <Input
              type="number"
              placeholder="Enter numerical answer..."
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswerChange(e.target.value)}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        <div className="flex gap-2">
          {currentQuestionIndex === exercise.questions.length - 1 ? (
            <Button onClick={handleSubmit}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Submit Exercise
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Question Navigator */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Question Navigator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-10 gap-2">
            {exercise.questions.map((_, index) => (
              <Button
                key={index}
                variant={index === currentQuestionIndex ? 'default' : 'outline'}
                size="sm"
                className={`w-10 h-10 p-0 ${
                  answers[exercise.questions[index].id] ? 'bg-green-50 border-green-200' : ''
                }`}
                onClick={() => setCurrentQuestionIndex(index)}
              >
                {index + 1}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}