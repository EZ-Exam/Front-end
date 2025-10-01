import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useGlobalLoading } from '@/contexts/GlobalLoadingContext';
import { 
  FileText, 
  ArrowLeft, 
  MessageSquare, 
  Download,
  CheckCircle,
  RotateCcw,
  Loader2
} from 'lucide-react';
import { mockComments } from '@/data/mockData';
import { PDFViewer } from '@/components/ui/pdf-viewer';
import api from '@/services/axios';

interface Lesson {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  pdfUrl: string;
  questions: string[];
  createdAt: string;
  updatedAt: string;
}

interface Question {
  id: number;
  content: string;
  questionSource: string;
  difficultyLevel: string;
  lessonId: number;
  gradeId: number;
  chapterId: number;
  image: string;
  createdByUserId: number;
  createdAt: string;
  updatedAt: string;
  formula: string;
  correctAnswer: string;
  explanation: string;
  type: string;
  options: string[];
  createdByUserName: string;
  lessonName: string;
  chapterName: string;
}

const subjectMapping: { [key: string]: string } = {
  '1': 'Math',
  '2': 'Physics',
  '3': 'Chemistry',
  '4': 'Biology',
  '5': 'Literature',
  '6': 'English',
  '7': 'History',
  '8': 'Geography'
};

export function LessonDetailPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('pdf');
  const [newComment, setNewComment] = useState('');
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string[]>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [questionResults, setQuestionResults] = useState<Record<string, { isCorrect: boolean; selectedAnswers: string[]; correctAnswer: string }>>({});

  // Global loading hook
  const { withLoading } = useGlobalLoading();

  // Fetch lesson data from API
  useEffect(() => {
    const fetchLesson = async () => {
      if (!id) return;
      
      await withLoading(async () => {
        try {
          setLoading(true);
          setError(null);
          const response = await api.get(`/lessons-enhanced/${id}`);
          setLesson(response.data);
        } catch (err: any) {
          console.error('Failed to fetch lesson:', err);
          setError(err.response?.data?.message || 'Failed to load lesson');
        } finally {
          setLoading(false);
        }
      }, "Đang tải bài học...");
    };

    fetchLesson();
  }, [id, withLoading]);

  // Fetch questions when lesson is loaded
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!lesson || !lesson.questions || lesson.questions.length === 0) {
        setQuestions([]);
        return;
      }

      try {
        setQuestionsLoading(true);
        const questionPromises = lesson.questions.map(questionId => 
          api.get(`/questions/${questionId}`)
        );
        
        const responses = await Promise.all(questionPromises);
        const questionsData = responses.map(response => response.data);
        console.log("questionsData",questionsData);
        setQuestions(questionsData);
      } catch (err: any) {
        console.error('Failed to fetch questions:', err);
        setQuestions([]);
      } finally {
        setQuestionsLoading(false);
      }
    };

    fetchQuestions();
  }, [lesson]);
  
  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/lessons">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Lessons
            </Link>
          </Button>
        </div>
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading lesson...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !lesson) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/lessons">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Lessons
            </Link>
          </Button>
        </div>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">
            {error ? 'Error loading lesson' : 'Lesson not found'}
          </h2>
          <p className="text-gray-600 mb-4">
            {error || 'The lesson you are looking for does not exist.'}
          </p>
          <Button asChild>
            <Link to="/lessons">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Lessons
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const getSubjectColor = (subjectId: string) => {
    const subject = subjectMapping[subjectId] || 'Unknown';
    switch (subject) {
      case 'Math': return 'bg-blue-100 text-blue-800';
      case 'Physics': return 'bg-purple-100 text-purple-800';
      case 'Chemistry': return 'bg-green-100 text-green-800';
      case 'Biology': return 'bg-emerald-100 text-emerald-800';
      case 'Literature': return 'bg-orange-100 text-orange-800';
      case 'English': return 'bg-pink-100 text-pink-800';
      case 'History': return 'bg-amber-100 text-amber-800';
      case 'Geography': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };


  const handleQuizSubmit = () => {
    if (!questions || questions.length === 0) return;
    
    const results: Record<string, { isCorrect: boolean; selectedAnswers: string[]; correctAnswer: string }> = {};
    
    questions.forEach(question => {
      const selectedAnswers = quizAnswers[question.id.toString()] || [];
      const correctAnswer = question.correctAnswer;
      
      // For multiple choice, check if selected answer matches correct answer
      const isCorrect = selectedAnswers.includes(correctAnswer);
      
      results[question.id.toString()] = {
        isCorrect,
        selectedAnswers,
        correctAnswer
      };
    });
    
    setQuestionResults(results);
    setQuizSubmitted(true);
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('New comment:', newComment);
    setNewComment('');
    // Would submit to backend
  };

  const handleQuizReset = () => {
    setQuizAnswers({});
    setQuestionResults({});
    setQuizSubmitted(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/lessons">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Lessons
          </Link>
        </Button>
      </div>

      {/* Lesson Info */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={getSubjectColor(lesson.subjectId)}>
                  {subjectMapping[lesson.subjectId] || 'Unknown'}
                </Badge>
              </div>
              
              <CardTitle className="text-2xl mb-2">{lesson.title}</CardTitle>
              <p className="text-gray-600 mb-4">{lesson.description}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Lesson Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pdf" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            PDF Lesson
          </TabsTrigger>
          <TabsTrigger value="quiz" className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            Quiz
          </TabsTrigger>
          <TabsTrigger value="comments" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Comments ({mockComments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pdf" className="space-y-6">
          {/* PDF Viewer */}
          <Card className="min-h-[1600px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                PDF Viewer
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <PDFViewer 
                src={lesson.pdfUrl}
                title="Lesson PDF"
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Lesson Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                {lesson.description} This comprehensive lesson covers all the essential concepts 
                you need to understand. Take your time to read through the entire PDF and 
                don't hesitate to review sections as needed.
              </p>
              
              <div className="mt-6 flex gap-4">
                <Button>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark as Complete
                </Button>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quiz" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RotateCcw className="h-5 w-5" />
                  Quiz Questions
                </div>
                {quizSubmitted && (
                  <Button variant="outline" size="sm" onClick={handleQuizReset}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset Quiz
                  </Button>
                )}
              </CardTitle>
              <p className="text-gray-600">
                Test your understanding of the lesson with these practice questions.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {questionsLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  <p className="text-gray-500">Loading questions...</p>
                </div>
              ) : questions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No questions available for this lesson.</p>
                </div>
              ) : (
                questions.map((question, questionIndex) => {
                  const userAnswers = quizAnswers[question.id.toString()] || [];
                  const result = questionResults[question.id.toString()];

                  return (
                    <div key={question.id} className="space-y-4">
                      <div className="p-6 border rounded-lg">
                        <h3 className="font-medium mb-4">
                          Question {questionIndex + 1}: {question.content}
                        </h3>
                        
                        {question.formula && (
                          <div className="mb-4 p-3 bg-gray-50 rounded">
                            <p className="text-sm font-mono">{question.formula}</p>
                          </div>
                        )}
                        
                        <RadioGroup
                          value={userAnswers[0] || ""}
                          onValueChange={(value) => {
                            if (!quizSubmitted) {
                              setQuizAnswers(prev => ({
                                ...prev,
                                [question.id.toString()]: [value]
                              }));
                            }
                          }}
                          disabled={quizSubmitted}
                          className="space-y-3"
                        >
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center space-x-3">
                              <RadioGroupItem 
                                value={option} 
                                id={`question-${question.id}-option-${optionIndex}`}
                              />
                              <Label 
                                htmlFor={`question-${question.id}-option-${optionIndex}`}
                                className="cursor-pointer flex-1"
                              >
                                {option}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                      
                      {quizSubmitted && result && (
                        <div className={`p-4 rounded-lg ${result.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                          <div className="flex items-center gap-2 mb-2">
                            {result.isCorrect ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <div className="h-5 w-5 rounded-full bg-red-600 flex items-center justify-center">
                                <span className="text-white text-xs">✗</span>
                              </div>
                            )}
                            <span className={`font-medium ${result.isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                              {result.isCorrect ? 'Correct!' : 'Incorrect'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">
                            <strong>Your answer:</strong> {result.selectedAnswers.join(', ') || 'No answer selected'}
                          </p>
                          <p className="text-sm text-gray-700 mb-2">
                            <strong>Correct answer:</strong> {result.correctAnswer}
                          </p>
                          {question.explanation && (
                            <p className="text-sm text-gray-600">
                              <strong>Explanation:</strong> {question.explanation}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              
              {!quizSubmitted && questions.length > 0 ? (
                <Button 
                  onClick={handleQuizSubmit} 
                  disabled={Object.keys(quizAnswers).length < questions.length}
                >
                  Submit Quiz
                </Button>
              ) : quizSubmitted && questions.length > 0 ? (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium mb-2">Quiz Complete!</h3>
                  <p className="text-sm text-gray-600">
                    You got {Object.values(questionResults).filter(r => r.isCorrect).length} out of {questions.length} questions correct.
                  </p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comments" className="space-y-6">
          {/* Add Comment */}
          <Card>
            <CardHeader>
              <CardTitle>Join the Discussion</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitComment} className="space-y-4">
                <Textarea
                  placeholder="Share your thoughts or ask a question..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="resize-none"
                />
                <Button type="submit" disabled={!newComment.trim()}>
                  Post Comment
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Comments List */}
          <div className="space-y-4">
            {mockComments.map((comment) => (
              <Card key={comment.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="" />
                      <AvatarFallback>{comment.userName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{comment.userName}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-700">{comment.content}</p>
                      
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-4 pl-4 border-l-2 border-gray-100 space-y-3">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex items-start gap-3">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src="" />
                                <AvatarFallback className="text-xs">{reply.userName.charAt(0)}</AvatarFallback>
                              </Avatar>
                              
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-xs">{reply.userName}</span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(reply.timestamp).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-700 mt-1">{reply.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <Button variant="ghost" size="sm" className="text-xs h-8 px-2">
                        Reply
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
}