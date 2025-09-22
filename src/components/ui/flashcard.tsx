import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ChevronLeft, 
  ChevronRight, 
  Heart, 
  Lightbulb, 
  Play, 
  Pause,
  RotateCcw,
  CheckCircle,
  X
} from 'lucide-react';
import { MultipleChoiceQuestion } from '@/types';

interface FlashcardProps {
  questions: MultipleChoiceQuestion[];
  onComplete?: (results: any[]) => void;
  autoSlide?: boolean;
  autoSlideInterval?: number;
  showCorrectAnswers?: boolean;
}

interface UserAnswer {
  questionId: string;
  selectedAnswers: string[];
  isCorrect: boolean;
  timeSpent: number;
}

export function Flashcard({ 
  questions, 
  onComplete,
  autoSlide = false,
  autoSlideInterval = 5000,
  showCorrectAnswers = false
}: FlashcardProps) {
  const getProgressWidth = () => {
    return ((currentIndex + 1) / questions.length) * 100;
  };
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoSlide);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [showAnswers, setShowAnswers] = useState(showCorrectAnswers);

  const currentQuestion = questions[currentIndex];
  const progress = `${currentIndex + 1} / ${questions.length}`;
  const isLastQuestion = currentIndex === questions.length - 1;
  const isFirstQuestion = currentIndex === 0;

  // Auto-slide functionality
  useEffect(() => {
    if (isAutoPlaying && !isLastQuestion) {
      const timer = setTimeout(() => {
        handleNext();
      }, autoSlideInterval);
      return () => clearTimeout(timer);
    }
  }, [isAutoPlaying, currentIndex, autoSlideInterval, isLastQuestion]);

  // Track time spent on current question
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(Date.now() - startTime);
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  const handleAnswerSelect = (answerId: string, isSelected: boolean) => {
    const currentAnswer = userAnswers.find(a => a.questionId === currentQuestion.id);
    
    if (currentAnswer) {
      // Update existing answer
      const updatedAnswers = userAnswers.map(answer => 
        answer.questionId === currentQuestion.id 
          ? {
              ...answer,
              selectedAnswers: isSelected
                ? [...answer.selectedAnswers, answerId]
                : answer.selectedAnswers.filter(id => id !== answerId)
            }
          : answer
      );
      setUserAnswers(updatedAnswers);
    } else {
      // Create new answer
      const newAnswer: UserAnswer = {
        questionId: currentQuestion.id,
        selectedAnswers: isSelected ? [answerId] : [],
        isCorrect: false,
        timeSpent: 0
      };
      setUserAnswers([...userAnswers, newAnswer]);
    }
  };

  const handleNext = () => {
    if (!isLastQuestion) {
      // Save current answer with time spent
      const currentAnswer = userAnswers.find(a => a.questionId === currentQuestion.id);
      if (currentAnswer) {
        const updatedAnswers = userAnswers.map(answer => 
          answer.questionId === currentQuestion.id 
            ? { ...answer, timeSpent: Math.floor(timeSpent / 1000) }
            : answer
        );
        setUserAnswers(updatedAnswers);
      }
      
      setCurrentIndex(prev => prev + 1);
      setShowHint(false);
      setStartTime(Date.now());
      setTimeSpent(0);
    }
  };

  const handlePrevious = () => {
    if (!isFirstQuestion) {
      setCurrentIndex(prev => prev - 1);
      setShowHint(false);
      setStartTime(Date.now());
      setTimeSpent(0);
    }
  };

  const handleToggleFavorite = () => {
    const newFavorites = new Set(favorites);
    if (favorites.has(currentQuestion.id)) {
      newFavorites.delete(currentQuestion.id);
    } else {
      newFavorites.add(currentQuestion.id);
    }
    setFavorites(newFavorites);
  };

  const handleToggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setUserAnswers([]);
    setShowHint(false);
    setStartTime(Date.now());
    setTimeSpent(0);
  };

  const getCurrentAnswer = () => {
    return userAnswers.find(a => a.questionId === currentQuestion.id);
  };

  const isAnswerSelected = (answerId: string) => {
    const currentAnswer = getCurrentAnswer();
    return currentAnswer?.selectedAnswers.includes(answerId) || false;
  };

  const getCorrectAnswers = () => {
    return currentQuestion.answers.filter(answer => answer.isCorrect).map(answer => answer.id);
  };

  const isQuestionAnswered = () => {
    const currentAnswer = getCurrentAnswer();
    return currentAnswer && currentAnswer.selectedAnswers.length > 0;
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header with progress and controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-sm">
            {progress}
          </Badge>
          <div className="text-sm text-gray-500">
            {Math.floor(timeSpent / 1000)}s
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleFavorite}
            className={favorites.has(currentQuestion.id) ? 'text-red-500' : ''}
          >
            <Heart className={`h-4 w-4 ${favorites.has(currentQuestion.id) ? 'fill-current' : ''}`} />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHint(!showHint)}
          >
            <Lightbulb className="h-4 w-4" />
            {showHint ? 'Hide Hint' : 'Show Hint'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAnswers(!showAnswers)}
            className={showAnswers ? 'bg-green-50 border-green-300 text-green-700' : ''}
          >
            <CheckCircle className="h-4 w-4" />
            {showAnswers ? 'Hide Answers' : 'Show Answers'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleAutoPlay}
          >
            {isAutoPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isAutoPlaying ? 'Pause' : 'Auto'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRestart}
          >
            <RotateCcw className="h-4 w-4" />
            Restart
          </Button>
        </div>
      </div>

      {/* Main Flashcard */}
      <Card className="mb-6 shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
        <CardContent className="p-8">
          {/* Question */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 leading-relaxed">
              {currentQuestion.questionText}
            </h2>
          </div>

          {/* Answer Options */}
          <div className="space-y-4 max-w-2xl mx-auto">
            {currentQuestion.answers.map((answer, index) => {
              const isCorrect = answer.isCorrect;
              const isSelected = isAnswerSelected(answer.id);
              const showAsCorrect = showAnswers && isCorrect;
              const showAsIncorrect = showAnswers && isSelected && !isCorrect;
              
              return (
                <div
                  key={answer.id}
                  className={`
                    p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                    ${showAsCorrect 
                      ? 'border-green-500 bg-green-50 shadow-md' 
                      : showAsIncorrect
                      ? 'border-red-500 bg-red-50 shadow-md'
                      : isSelected 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }
                  `}
                  onClick={() => handleAnswerSelect(answer.id, !isAnswerSelected(answer.id))}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={isSelected}
                      onChange={() => handleAnswerSelect(answer.id, !isAnswerSelected(answer.id))}
                      className="pointer-events-none"
                    />
                    <span className="text-sm font-medium text-gray-500 mr-3">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className={`
                      flex-1
                      ${showAsCorrect ? 'text-green-800 font-semibold' : ''}
                      ${showAsIncorrect ? 'text-red-800' : ''}
                      ${!showAnswers ? 'text-gray-800' : ''}
                    `}>
                      {answer.text}
                    </span>
                    {showAnswers && isCorrect && (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span className="text-sm font-medium">Correct</span>
                      </div>
                    )}
                    {showAnswers && isSelected && !isCorrect && (
                      <div className="flex items-center gap-2 text-red-600">
                        <X className="h-5 w-5" />
                        <span className="text-sm font-medium">Wrong</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Hint/Explanation */}
          {showHint && currentQuestion.explanation && (
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">Explanation:</h3>
              <p className="text-blue-700">{currentQuestion.explanation}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={isFirstQuestion}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex items-center gap-2">
          {!isLastQuestion ? (
            <Button
              onClick={handleNext}
              disabled={!isQuestionAnswered()}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={() => onComplete?.(userAnswers)}
              disabled={!isQuestionAnswered()}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              Complete
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-6">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            data-width={getProgressWidth()}
            style={{ width: `${getProgressWidth()}%` }}
          />
        </div>
      </div>
    </div>
  );
}
