import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  AlertCircle,
  Image as ImageIcon,
  Calculator,
  CheckCircle,
  BookOpen,
  Brain,
  Target,
  User,
  Lightbulb,
  Award
} from 'lucide-react';
import { Question } from '@/types';
import axios from '@/services/axios';
import { CommentSection } from '@/components/ui/CommentSection';

export function QuestionBankDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchQuestion(id);
    }
  }, [id]);

  const fetchQuestion = async (questionId: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`/questions/${questionId}`);
      console.log("Response",response.data);
      setQuestion(response.data);
    } catch (error) {
      console.error('Error fetching question:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-lg shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="relative mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Question</h2>
            <p className="text-gray-600">Please wait while we fetch the question details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-lg shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="p-4 bg-red-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Question Not Found</h2>
            <p className="text-gray-600 mb-6">The question you're looking for doesn't exist.</p>
            <Button asChild className="rounded-xl">
              <Link to="/question-bank">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Question Bank
              </Link>
            </Button>
          </CardContent>
        </Card>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="sm" asChild className="rounded-xl hover:bg-white/80">
              <Link to="/question-bank">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Question Bank
              </Link>
            </Button>
          </div>
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Question Details
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore this question in detail and understand the solution
            </p>
          </div>
        </div>

        {/* Question Info */}
        <Card className="mb-8 shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-2xl">Question Information</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={`${getDifficultyColor(question.difficultyLevel)} border-0 font-semibold text-sm px-3 py-1`}>
                  {question.difficultyLevel}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  ID: #{question.id}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Question Content */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Brain className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold">Question Content</h3>
              </div>
              <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                <p className="text-gray-900 text-lg leading-relaxed">{question.content}</p>
              </div>
            </div>
            
            {/* Lesson and Chapter Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <BookOpen className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold">Lesson</h3>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-gray-700 font-medium">{question.lessonName}</p>
                </div>
              </div>
              {question.chapterName && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Target className="h-5 w-5 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold">Chapter</h3>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-gray-700 font-medium">{question.chapterName}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Image */}
            {question.image && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <ImageIcon className="h-5 w-5 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold">Question Image</h3>
                </div>
                <div className="border-2 border-orange-200 rounded-xl p-6 bg-orange-50">
                  <img 
                    src={question.image} 
                    alt="Question image" 
                    className="max-w-full h-auto rounded-lg shadow-lg"
                  />
                </div>
              </div>
            )}

            {/* Formula */}
            {question.formula && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Calculator className="h-5 w-5 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-semibold">Formula</h3>
                </div>
                <div className="p-6 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl">
                  <p className="text-indigo-800 font-mono text-xl text-center">{question.formula}</p>
                </div>
              </div>
            )}

            {/* Options (for multiple choice questions) */}
            {question.options && question.options.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Award className="h-5 w-5 text-yellow-600" />
                  </div>
                  <h3 className="text-xl font-semibold">Answer Options</h3>
                </div>
                <div className="space-y-3">
                  {question.options.map((option, index) => (
                    <div key={index} className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 ${
                      option === question.correctAnswer 
                        ? 'bg-green-50 border-green-300 shadow-lg' 
                        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                    }`}>
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                        option === question.correctAnswer 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-300 text-gray-700'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <div className="flex-1">
                        <span className={`text-lg ${
                          option === question.correctAnswer ? 'font-semibold text-green-800' : 'text-gray-700'
                        }`}>
                          {option}
                        </span>
                      </div>
                      {option === question.correctAnswer && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-6 w-6 text-green-600" />
                          <span className="text-sm font-semibold text-green-600">Correct Answer</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Correct Answer */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold">Correct Answer</h3>
              </div>
              <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                <p className="text-green-800 font-semibold text-xl text-center">{question.correctAnswer}</p>
              </div>
            </div>

            {/* Explanation */}
            {question.explanation && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Lightbulb className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold">Explanation</h3>
                </div>
                <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl">
                  <p className="text-purple-800 text-lg leading-relaxed">{question.explanation}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comments Section */}
        {question && (
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                  <User className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-2xl">Discussion & Comments</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CommentSection questionId={Number(question.id)} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}