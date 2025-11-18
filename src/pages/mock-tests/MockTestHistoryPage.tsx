import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGlobalLoading } from '@/contexts/GlobalLoadingContext';
import { useAuth } from '@/pages/auth/AuthContext';
import { 
  Clock,
  CheckCircle,
  XCircle,
  Trophy,
  Target,
  Calendar,
  ArrowRight,
  History,
  Lock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { SubscriptionUtils, SubscriptionLevel } from '@/lib/subscription';
import { useToast } from '@/contexts/ToastContext';
import api from '@/services/axios';

interface ExamHistory {
  id: number;
  examId: string;
  userId: string;
  score: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  totalQuestions: number;
  submittedAt: string;
  timeTaken: number;
  answers: Array<{
    questionId: string;
    selectedAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    timeSpent: number;
  }>;
}

interface ExamDetail {
  id: string;
  title: string;
  subjectName: string;
  examTypeName: string;
}

export function MockTestHistoryPage() {
  const { user } = useAuth();
  const { error: showError } = useToast();
  const { showLoading, hideLoading } = useGlobalLoading();
  
  const [examHistories, setExamHistories] = useState<ExamHistory[]>([]);
  const [allExamHistories, setAllExamHistories] = useState<ExamHistory[]>([]);
  const [examDetails, setExamDetails] = useState<Record<string, ExamDetail>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(6);
  const [totalPages, setTotalPages] = useState(0);

  const fetchExamHistory = async () => {
    if (!user?.id) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    showLoading('Loading exam history...');
    try {
      setError(null);
      
      // Fetch exam history for the user
      const response = await api.get(`/exam-history/user/${user.id}`);
      const histories: ExamHistory[] = response.data;
      
      setAllExamHistories(histories);
      
      // Calculate pagination
      const total = Math.ceil(histories.length / pageSize);
      setTotalPages(total);
      
      // Get paginated items
      const startIndex = (pageNumber - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedHistories = histories.slice(startIndex, endIndex);
      setExamHistories(paginatedHistories);
      
      // Fetch exam details for each unique examId
      const uniqueExamIds = [...new Set(histories.map(h => h.examId))];
      const examDetailsMap: Record<string, ExamDetail> = {};
      
      await Promise.all(
        uniqueExamIds.map(async (examId) => {
          try {
            const examResponse = await api.get(`/exams/${examId}`);
            examDetailsMap[examId] = {
              id: examId,
              title: examResponse.data.name || examResponse.data.title,
              subjectName: examResponse.data.subjectName,
              examTypeName: examResponse.data.examTypeName
            };
          } catch (err) {
            console.error(`Failed to fetch exam details for ${examId}:`, err);
            examDetailsMap[examId] = {
              id: examId,
              title: `Exam ${examId}`,
              subjectName: 'Unknown Subject',
              examTypeName: 'Mock Test'
            };
          }
        })
      );
      
      setExamDetails(examDetailsMap);
      
    } catch (error: any) {
      console.error('Error fetching exam history:', error);
      setError('Failed to load exam history. Please try again.');
    } finally {
      setLoading(false);
      hideLoading();
    }
  };

  useEffect(() => {
    fetchExamHistory();
  }, [user?.id]);

  // Update paginated items when pageNumber or allExamHistories change
  useEffect(() => {
    if (allExamHistories.length > 0) {
      const startIndex = (pageNumber - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedHistories = allExamHistories.slice(startIndex, endIndex);
      setExamHistories(paginatedHistories);
      
      const total = Math.ceil(allExamHistories.length / pageSize);
      setTotalPages(total);
    }
  }, [pageNumber, allExamHistories, pageSize]);

  const getPaginationRange = () => {
    const total = totalPages;
    const current = pageNumber;
    const delta = 2; // số trang hiển thị xung quanh current page
  
    if (total <= 7) {
      // Nếu tổng số trang <= 7, hiển thị tất cả
      return Array.from({ length: total }, (_, i) => i + 1);
    }
  
    const pages: (number | string)[] = [];
  
    // Luôn hiển thị trang đầu tiên
    pages.push(1);
  
    // Tính toán các trang cần hiển thị
    const start = Math.max(2, current - delta);
    const end = Math.min(total - 1, current + delta);
  
    // Nếu có khoảng trống giữa trang 1 và start, thêm ellipsis
    if (start > 2) {
      pages.push("...");
    }
  
    // Thêm các trang ở giữa
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
  
    // Nếu có khoảng trống giữa end và trang cuối, thêm ellipsis
    if (end < total - 1) {
      pages.push("...");
    }
  
    // Luôn hiển thị trang cuối cùng (nếu total > 1)
    if (total > 1) {
      pages.push(total);
    }
  
    return pages;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto absolute top-2 left-1/2 transform -translate-x-1/2 [animation-direction:reverse] [animation-duration:1.5s]"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Exam History...</h2>
          <p className="text-gray-600">Please wait while we fetch your test history</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="p-6 bg-red-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <XCircle className="h-12 w-12 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading History</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={fetchExamHistory}>
              Try Again
            </Button>
            <Button asChild variant="outline">
              <Link to="/mock-tests">Back to Mock Tests</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (examHistories.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="p-6 bg-gray-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <History className="h-12 w-12 text-gray-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Exam History</h2>
          <p className="text-gray-600 mb-6">You haven't taken any mock tests yet.</p>
          <Button asChild>
            <Link to="/mock-tests">
              <Trophy className="mr-2 h-5 w-5" />
              Take Your First Test
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="p-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center shadow-2xl">
            <History className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Mock Test History
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Review your past mock test performances and track your progress
          </p>
        </div>

        {/* Stats Summary */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Card className="text-center p-6 bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-1">{allExamHistories.length}</h3>
            <p className="text-gray-600 font-semibold">Tests Taken</p>
          </Card>

          <Card className="text-center p-6 bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-1">
              {allExamHistories.length > 0 ? Math.round(allExamHistories.reduce((sum, h) => sum + h.score, 0) / allExamHistories.length) : 0}%
            </h3>
            <p className="text-gray-600 font-semibold">Average Score</p>
          </Card>

          <Card className="text-center p-6 bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <Target className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-1">
              {allExamHistories.reduce((sum, h) => sum + h.correctCount, 0)}
            </h3>
            <p className="text-gray-600 font-semibold">Total Correct</p>
          </Card>

          <Card className="text-center p-6 bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-1">
              {allExamHistories.length > 0 ? Math.round(allExamHistories.reduce((sum, h) => sum + h.timeTaken, 0) / allExamHistories.length / 60) : 0}m
            </h3>
            <p className="text-gray-600 font-semibold">Avg Time</p>
          </Card>
        </div>

        {/* Exam History List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Tests</h2>
          
          {examHistories.map((history) => {
            const examDetail = examDetails[history.examId];
            
            return (
              <Card key={history.id} className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
                          <Trophy className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">
                            {examDetail?.title || `Exam ${history.examId}`}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <span>{examDetail?.subjectName || 'Unknown Subject'}</span>
                            <span>•</span>
                            <span>{examDetail?.examTypeName || 'Mock Test'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-gray-600">
                            <span className="font-semibold">{history.correctCount}</span> correct
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span className="text-sm text-gray-600">
                            <span className="font-semibold">{history.incorrectCount}</span> incorrect
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-500" />
                          <span className="text-sm text-gray-600">
                            <span className="font-semibold">{formatDuration(history.timeTaken)}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-purple-500" />
                          <span className="text-sm text-gray-600">
                            {formatDate(history.submittedAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`text-3xl font-bold mb-2 ${getScoreColor(history.score)}`}>
                        {history.score}%
                      </div>
                      <Badge className={getScoreBadgeColor(history.score)}>
                        {history.score >= 80 ? 'Excellent' : history.score >= 60 ? 'Good' : 'Needs Improvement'}
                      </Badge>
                      <div className="mt-4">
                        {SubscriptionUtils.canViewAnalyticsAndDetails(user) ? (
                          <Button asChild size="sm">
                            <Link to={`/mock-tests/history/${history.id}`}>
                              <ArrowRight className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </Button>
                        ) : (
                          <Button 
                            onClick={() => showError(SubscriptionUtils.getUpgradeMessage(SubscriptionLevel.BASIC), 'Cần nâng cấp subscription')}
                            size="sm"
                            variant="outline"
                            className="bg-gray-100 text-black-500 border-gray-300 cursor-not-allowed"
                            disabled
                          >
                            <Lock className="mr-2 h-4 w-4" />
                            View Details (LOCKED), BASIC+ to unlock
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Enhanced Ellipsis Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-xl p-2 shadow-lg">
              {/* Prev button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                disabled={pageNumber === 1}
                className="rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {/* Ellipsis Pagination */}
              {getPaginationRange().map((p, i) =>
                p === "..." ? (
                  <div 
                    key={`ellipsis-${i}`} 
                    className="px-2 text-gray-500 select-none font-semibold"
                  >
                    ...
                  </div>
                ) : (
                  <Button
                    key={p}
                    variant={p === pageNumber ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPageNumber(p as number)}
                    className={`min-w-[40px] rounded-lg transition-all duration-200 ${
                      p === pageNumber
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 shadow-md hover:shadow-lg"
                        : "hover:bg-gray-100 hover:border-blue-300"
                    }`}
                  >
                    {p}
                  </Button>
                )
              )}

              {/* Next Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPageNumber(Math.min(totalPages, pageNumber + 1))}
                disabled={pageNumber === totalPages}
                className="rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
