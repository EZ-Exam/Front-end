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
  CheckCircle
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
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Loading Question</h2>
            <p className="text-gray-600">Please wait while we fetch the question details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Question Not Found</h2>
            <p className="text-gray-600 mb-4">The question you're looking for doesn't exist.</p>
            <Button asChild>
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
    <div className="py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/question-bank">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Question Bank
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Question Details</h1>
          </div>
        </div>

        {/* Question Info */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Question Information</CardTitle>
              <div className="flex items-center gap-2">
                <Badge className={getDifficultyColor(question.difficultyLevel)}>
                  {question.difficultyLevel}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Question Content */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Question Content</h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-900">{question.content}</p>
              </div>
            </div>
            
            {/* Lesson and Chapter Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Lesson</h3>
                <p className="text-gray-700">{question.lessonName}</p>
              </div>
              {question.chapterName && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Chapter</h3>
                  <p className="text-gray-700">{question.chapterName}</p>
                </div>
              )}
            </div>

            {/* Image */}
            {question.image && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Image
                </h3>
                <div className="border rounded-lg p-4">
                  <img 
                    src={question.image} 
                    alt="Question image" 
                    className="max-w-full h-auto rounded"
                  />
                </div>
              </div>
            )}

            {/* Formula */}
            {question.formula && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Formula
                </h3>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 font-mono text-lg">{question.formula}</p>
                </div>
              </div>
            )}

            {/* Options (for multiple choice questions) */}
            {question.options && question.options.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Answer Options</h3>
                <div className="space-y-2">
                  {question.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-500">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className={option === question.correctAnswer ? 'font-medium text-green-700' : ''}>
                          {option}
                        </span>
                        {option === question.correctAnswer && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Correct Answer */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Correct Answer</h3>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium">{question.correctAnswer}</p>
              </div>
            </div>

            {/* Explanation */}
            {question.explanation && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Explanation</h3>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800">{question.explanation}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comments Section */}
        {question && (
          <CommentSection questionId={question.id} />
        )}
      </div>
    </div>
  );
}