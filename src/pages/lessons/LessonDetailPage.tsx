import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { 
  FileText, 
  Clock, 
  ArrowLeft, 
  MessageSquare, 
  Download,
  CheckCircle,
  RotateCcw
} from 'lucide-react';
import { mockLessons, mockComments, mockQuestionSets } from '@/data/mockData';
import { QuestionResult } from '@/components/ui/QuestionResult';
import { QuestionResult as QuestionResultType } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';
import { PDFViewer } from '@/components/ui/pdf-viewer';

export function LessonDetailPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('pdf');
  const [newComment, setNewComment] = useState('');
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string[]>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [questionResults, setQuestionResults] = useState<Record<string, QuestionResultType>>({});
  
  
  const lesson = mockLessons.find(l => l.id === id);
  const questionSet = lesson ? mockQuestionSets.find(qs => qs.id === lesson.questionSetId) : null;
  
  if (!lesson) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Lesson not found</h2>
        <Button asChild>
          <Link to="/lessons">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Lessons
          </Link>
        </Button>
      </div>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSubjectColor = (subject: string) => {
    switch (subject) {
      case 'Math': return 'bg-blue-100 text-blue-800';
      case 'Physics': return 'bg-purple-100 text-purple-800';
      case 'Chemistry': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };


  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('New comment:', newComment);
    setNewComment('');
    // Would submit to backend
  };

  const handleAnswerChange = (questionId: string, answerId: string, checked: boolean) => {
    setQuizAnswers(prev => {
      const currentAnswers = prev[questionId] || [];
      if (checked) {
        return { ...prev, [questionId]: [...currentAnswers, answerId] };
      } else {
        return { ...prev, [questionId]: currentAnswers.filter(id => id !== answerId) };
      }
    });
  };

  const handleQuizSubmit = () => {
    if (!questionSet) return;
    
    const results: Record<string, QuestionResultType> = {};
    
    questionSet.questions.forEach(question => {
      const selectedAnswers = quizAnswers[question.id] || [];
      const correctAnswers = question.answers.filter(a => a.isCorrect).map(a => a.id);
      
      const isCorrect = selectedAnswers.length === correctAnswers.length &&
                       selectedAnswers.every(id => correctAnswers.includes(id));
      
      results[question.id] = {
        questionId: question.id,
        selectedAnswers,
        isCorrect,
        correctAnswers
      };
    });
    
    setQuestionResults(results);
    setQuizSubmitted(true);
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
                <Badge className={getSubjectColor(lesson.subject)}>
                  {lesson.subject}
                </Badge>
                <Badge className={getDifficultyColor(lesson.difficulty)} variant="outline">
                  {lesson.difficulty}
                </Badge>
                {lesson.completed && (
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Completed
                  </Badge>
                )}
              </div>
              
              <CardTitle className="text-2xl mb-2">{lesson.title}</CardTitle>
              <p className="text-gray-600 mb-4">{lesson.description}</p>
              
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                {lesson.duration} minutes
              </div>
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
                src="https://view.officeapps.live.com/op/view.aspx?src=https%3A%2F%2Fthuvienhoclieu%2Ecom%3A443%2Fwp%2Dcontent%2Fuploads%2F2025%2F09%2Fthuvienhoclieu%2Ecom%2D50%2DBai%2Dtap%2Dtra%2Dloi%2Dngan%2Dchuong%2DKhao%2Dsat%2Dva%2Dve%2Ddo%2Dthi%2Dlop%2D12%2Edocx&wdAccPdf=0&wdEmbedFS=1"
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
                Quick Quiz
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
              {questionSet?.questions.map((question, questionIndex) => {
                const userAnswers = quizAnswers[question.id] || [];
                const result = questionResults[question.id];

                return (
                  <div key={question.id} className="space-y-4">
                    <div className="p-6 border rounded-lg">
                      <h3 className="font-medium mb-4">
                        Question {questionIndex + 1}: {question.questionText}
                      </h3>
                      
                      <div className="space-y-3">
                        {question.answers.map((answer) => (
                          <div key={answer.id} className="flex items-center space-x-3">
                            <Checkbox
                              checked={userAnswers.includes(answer.id)}
                              onCheckedChange={(checked) => {
                                if (!quizSubmitted) {
                                  handleAnswerChange(question.id, answer.id, checked === true);
                                }
                              }}
                              disabled={quizSubmitted}
                            />
                            <Label className="cursor-pointer flex-1">
                              {answer.text}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {quizSubmitted && result && (
                      <QuestionResult
                        result={result}
                        explanation={question.explanation}
                        correctAnswerTexts={question.answers.filter(a => a.isCorrect).map(a => a.text)}
                        selectedAnswerTexts={question.answers.filter(a => userAnswers.includes(a.id)).map(a => a.text)}
                      />
                    )}
                  </div>
                );
              })}
              
              {!quizSubmitted ? (
                <Button onClick={handleQuizSubmit} disabled={!questionSet || Object.keys(quizAnswers).length < questionSet.questions.length}>
                  Submit Quiz
                </Button>
              ) : (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium mb-2">Quiz Complete!</h3>
                  <p className="text-sm text-gray-600">
                    You got {Object.values(questionResults).filter(r => r.isCorrect).length} out of {questionSet?.questions.length || 0} questions correct.
                  </p>
                </div>
              )}
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