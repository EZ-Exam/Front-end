import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  Clock, 
  ArrowLeft, 
  MessageSquare, 
  BookOpen,
  FileText,
  CheckCircle,
  RotateCcw
} from 'lucide-react';
import { mockLessons, mockComments } from '@/data/mockData';

export function LessonDetailPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('video');
  const [userNote, setUserNote] = useState('');
  const [newComment, setNewComment] = useState('');
  
  const lesson = mockLessons.find(l => l.id === id);
  
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

  const handleSaveNote = () => {
    console.log('Saving note:', userNote);
    // Would save to backend
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('New comment:', newComment);
    setNewComment('');
    // Would submit to backend
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="video" className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Video
          </TabsTrigger>
          <TabsTrigger value="quiz" className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            Quiz
          </TabsTrigger>
          <TabsTrigger value="comments" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Comments ({mockComments.length})
          </TabsTrigger>
          <TabsTrigger value="notes" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            My Notes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="video" className="space-y-6">
          <Card>
            <CardContent className="p-0">
              <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                <iframe
                  src={lesson.videoUrl}
                  title={lesson.title}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Video Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                {lesson.description} This comprehensive lesson covers all the essential concepts 
                you need to understand. Take your time to watch through the entire video and 
                don't hesitate to pause and replay sections as needed.
              </p>
              
              <div className="mt-6 flex gap-4">
                <Button>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark as Complete
                </Button>
                <Button variant="outline">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Download Transcript
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quiz" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Quiz</CardTitle>
              <p className="text-gray-600">
                Test your understanding of the lesson with these practice questions.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-6 border rounded-lg">
                <h3 className="font-medium mb-3">
                  Question 1: What is the main topic covered in this lesson?
                </h3>
                <div className="space-y-2">
                  {['Quadratic Equations', 'Linear Equations', 'Exponential Functions', 'Trigonometry'].map((option, index) => (
                    <label key={index} className="flex items-center space-x-3 cursor-pointer">
                      <input type="radio" name="q1" value={option} className="text-blue-600" />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <Button>Submit Quiz</Button>
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

        <TabsContent value="notes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Notes</CardTitle>
              <p className="text-gray-600">
                Write down your thoughts, key concepts, and questions while learning.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  placeholder="Start taking notes..."
                  value={userNote}
                  onChange={(e) => setUserNote(e.target.value)}
                  className="min-h-[200px] resize-none"
                />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Auto-saved {new Date().toLocaleTimeString()}
                  </span>
                  <Button onClick={handleSaveNote}>
                    <FileText className="mr-2 h-4 w-4" />
                    Save Notes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}