import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGlobalLoading } from '@/contexts/GlobalLoadingContext';
import { 
  Clock, 
  Users, 
  Search, 
  AlertTriangle, 
  Filter, 
  RefreshCw,
  Trophy,
  Play,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import api from '@/services/axios';

export function MockTestsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // New state for ID-based filtering and sorting
  const [subjectId, setSubjectId] = useState<string>('');
  const [lessonId, setLessonId] = useState<string>('');
  const [examTypeId, setExamTypeId] = useState<string>('');
  const [createdById, setCreatedById] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<string>('asc');
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize] = useState<number>(6);
  const [totalPages, setTotalPages] = useState<number>(0);

  // Global loading hook
  const { withLoading } = useGlobalLoading();

  // Fetch exams from API with query parameters
  useEffect(() => {
    const fetchExams = async () => {
      await withLoading(async () => {
        try {
          setLoading(true);
          setError(null);
          
          // Build query parameters for optimized exams feed
          const queryParams = new URLSearchParams();
          
          // Add search parameter
          if (searchQuery.trim()) {
            queryParams.append('search', searchQuery.trim());
          }
          
          // Add ID-based filters
          if (subjectId) queryParams.append('subjectId', subjectId);
          if (lessonId) queryParams.append('lessonId', lessonId);
          if (examTypeId) queryParams.append('examTypeId', examTypeId);
          if (createdById) queryParams.append('createdByUserId', createdById);

          // Pagination parameters for new API
          queryParams.append('page', pageNumber.toString());
          queryParams.append('pageSize', pageSize.toString());

          const queryString = queryParams.toString();
          const apiUrl = queryString ? `/exams/optimized/feed?${queryString}` : '/exams/optimized/feed';

          const response = await api.get(apiUrl);
          const items = Array.isArray(response?.data?.items) ? response.data.items : [];

          // Update pagination info if available
          // If totalPages is not provided, calculate it based on items or default to 1
          const apiTotalPages = response?.data?.totalPages;
          if (apiTotalPages !== undefined && apiTotalPages !== null) {
            setTotalPages(apiTotalPages);
          } else {
            // If no totalPages from API, calculate based on items length
            // This is a fallback - ideally API should provide totalPages
            setTotalPages(items.length > 0 ? Math.ceil(items.length / pageSize) : 1);
          }

          // Map items to shape used by UI
          const mapped = items.map((exam: any) => ({
            ...exam,
            questionCount: exam.totalQuestions,
            // keep compatibility
            duration: exam.duration ?? exam.timeLimit ?? null,
          }));

          setExams(mapped);
        } catch (err: any) {
          console.error('Failed to fetch exams:', err);
          setError(err?.response?.data?.message || 'Failed to load exams');
        } finally {
          setLoading(false);
        }
      }, "Loading mock tests list...");
    };

    fetchExams();
  }, [withLoading, searchQuery, subjectId, lessonId, examTypeId, createdById, sortBy, sortOrder, pageNumber, pageSize]);

  // Since filtering is now done server-side via API, we use exams directly
  // Keep client-side filtering for backward compatibility with existing UI filters
  const filteredTests = exams.filter(test => {
    const matchesSubject = subjectFilter === 'all' || test.subjectName === subjectFilter;
    const matchesType = difficultyFilter === 'all' || test.examTypeName === difficultyFilter;
    return matchesSubject && matchesType;
  });

  const getTypeColor = (type: string) => {
    // simple color mapping by exam type name
    if (!type) return 'bg-gray-100 text-gray-800';
    const lower = type.toLowerCase();
    if (lower.includes('15') || lower.includes('short')) return 'bg-green-100 text-green-800';
    if (lower.includes('giữa') || lower.includes('mid') || lower.includes('quiz')) return 'bg-yellow-100 text-yellow-800';
    if (lower.includes('cuối') || lower.includes('final') || lower.includes('hoc ky') || lower.includes('semester')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getSubjectColor = (subject: string) => {
    switch (subject) {
      case 'Math': return 'bg-blue-100 text-blue-800';
      case 'Physics': return 'bg-purple-100 text-purple-800';
      case 'Chemistry': return 'bg-green-100 text-green-800';
      case 'Biology': return 'bg-green-100 text-green-800';
      case 'Literature': return 'bg-orange-100 text-orange-800';
      case 'English': return 'bg-pink-100 text-pink-800';
      case 'History': return 'bg-yellow-100 text-yellow-800';
      case 'Geography': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Mock Tests</h2>
            <p className="text-gray-600">Preparing exam simulations for you...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <div className="p-4 bg-red-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <AlertTriangle className="h-10 w-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Tests</h2>
            <p className="text-red-600 mb-6">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Mock Tests
            </h1>
          </div>
        </div>

        {/* Search Section */}
        <Card className="mb-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Search className="h-5 w-5 text-blue-600" />
              Search Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search mock tests by name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                />
              </div>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery('');
                }}
                className="h-12 border-2 border-gray-200 hover:border-red-500 hover:text-red-600 rounded-xl"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sort Section */}
        <Card className="mb-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Filter className="h-5 w-5 text-blue-600" />
              Sort & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Sort by:</label>
                <Select value={`${sortBy}:${sortOrder}`} onValueChange={(value) => {
                  const [field, order] = value.split(':');
                  setSortBy(field);
                  setSortOrder(order);
                }}>
                  <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt:desc">Newest first</SelectItem>
                    <SelectItem value="createdAt:asc">Oldest first</SelectItem>
                    <SelectItem value="updatedAt:desc">Most recent update first</SelectItem>
                    <SelectItem value="updatedAt:asc">Longest update first</SelectItem>
                    <SelectItem value="name:asc">Name A→Z</SelectItem>
                    <SelectItem value="name:desc">Name Z→A</SelectItem>
                    <SelectItem value="totalQuestions:asc">Fewest questions</SelectItem>
                    <SelectItem value="totalQuestions:desc">Most questions</SelectItem>
                    <SelectItem value="timeLimit:asc">Shortest time</SelectItem>
                    <SelectItem value="timeLimit:desc">Longest time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Subject:</label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={subjectFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSubjectFilter('all')}
                    className={`rounded-lg transition-all duration-300 ${
                      subjectFilter === 'all' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0' 
                        : 'border-2 border-gray-200 hover:border-blue-500'
                    }`}
                  >
                    All
                  </Button>
                  <Button
                    variant={subjectFilter === 'Math' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSubjectFilter('Math')}
                    className={`rounded-lg transition-all duration-300 ${
                      subjectFilter === 'Math' 
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0' 
                        : 'border-2 border-gray-200 hover:border-blue-500'
                    }`}
                  >
                    Math
                  </Button>
                  <Button
                    variant={subjectFilter === 'Physics' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSubjectFilter('Physics')}
                    className={`rounded-lg transition-all duration-300 ${
                      subjectFilter === 'Physics' 
                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white border-0' 
                        : 'border-2 border-gray-200 hover:border-green-500'
                    }`}
                  >
                    Physics
                  </Button>
                  <Button
                    variant={subjectFilter === 'Chemistry' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSubjectFilter('Chemistry')}
                    className={`rounded-lg transition-all duration-300 ${
                      subjectFilter === 'Chemistry' 
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0' 
                        : 'border-2 border-gray-200 hover:border-orange-500'
                    }`}
                  >
                    Chemistry
                  </Button>
                  <Button
                    variant={subjectFilter === 'Biology' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSubjectFilter('Biology')}
                    className={`rounded-lg transition-all duration-300 ${
                      subjectFilter === 'Biology' 
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0' 
                        : 'border-2 border-gray-200 hover:border-emerald-500'
                    }`}
                  >
                    Biology
                  </Button>
                  <Button
                    variant={subjectFilter === 'Literature' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSubjectFilter('Literature')}
                    className={`rounded-lg transition-all duration-300 ${
                      subjectFilter === 'Literature' 
                        ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white border-0' 
                        : 'border-2 border-gray-200 hover:border-pink-500'
                    }`}
                  >
                    Literature
                  </Button>
                  <Button
                    variant={subjectFilter === 'English' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSubjectFilter('English')}
                    className={`rounded-lg transition-all duration-300 ${
                      subjectFilter === 'English' 
                        ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0' 
                        : 'border-2 border-gray-200 hover:border-purple-500'
                    }`}
                  >
                    English
                  </Button>
                  <Button
                    variant={subjectFilter === 'History' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSubjectFilter('History')}
                    className={`rounded-lg transition-all duration-300 ${
                      subjectFilter === 'History' 
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0' 
                        : 'border-2 border-gray-200 hover:border-amber-500'
                    }`}
                  >
                    History
                  </Button>
                  <Button
                    variant={subjectFilter === 'Geography' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSubjectFilter('Geography')}
                    className={`rounded-lg transition-all duration-300 ${
                      subjectFilter === 'Geography' 
                        ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white border-0' 
                        : 'border-2 border-gray-200 hover:border-teal-500'
                    }`}
                  >
                    Geography
                  </Button>
                </div>
              </div>

              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSubjectFilter('all');
                    setDifficultyFilter('all');
                    setSubjectId('');
                    setLessonId('');
                    setExamTypeId('');
                    setCreatedById('');
                    setSortBy('name');
                    setSortOrder('asc');
                    setPageNumber(1);
                  }}
                  className="h-12 border-2 border-gray-200 hover:border-red-500 hover:text-red-600 rounded-xl"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reset Filters
                </Button>
              </div>
            </div>
            
            {/* Results count */}
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold text-blue-600">{filteredTests.length}</span> of <span className="font-semibold">{exams.length}</span> tests
                {totalPages > 1 && (
                  <span className="ml-2">(Page {pageNumber} of {totalPages})</span>
                )}
              </p>
              {(searchQuery || subjectFilter !== 'all' || subjectId || lessonId || examTypeId || createdById) && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Filtered Results
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

      {/* Mock Tests Grid */}
      {filteredTests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No mock tests match your current filters.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setSearchQuery('');
                setSubjectFilter('all');
                setDifficultyFilter('all');
              }}
            >
              Show All Tests
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTests.map((test, index) => (
            <Card 
              key={test.id} 
              className="group hover:shadow-2xl transition-all duration-500 hover:scale-105 border-0 bg-white/90 backdrop-blur-sm overflow-hidden"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Enhanced Card Header with Gradient */}
              <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-purple-50 relative">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-bl-full"></div>
                <div className="flex items-start justify-between relative z-10">
                  <div className="flex-1">
                    <CardTitle className="text-xl font-bold mb-3 group-hover:text-blue-600 transition-colors duration-300">
                      {test.name}
                    </CardTitle>
                  </div>
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg shadow-lg">
                    <Trophy className="h-5 w-5 text-white" />
                  </div>
                </div>
                
                <div className="flex items-center gap-3 flex-wrap relative z-10">
                  <Badge className={`${getSubjectColor(test.subjectName)} border-0 shadow-md font-semibold px-3 py-1`}>
                    {test.subjectName}
                  </Badge>
                  <Badge className={`${getTypeColor(test.examTypeName)} border-0 shadow-md font-semibold px-3 py-1`}>
                    {test.examTypeName}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6 p-6">
                {/* Enhanced Stats Grid */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-blue-600 mb-1">{test.duration || 'N/A'}</div>
                    <div className="text-sm text-gray-600 font-medium">Minutes</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
                    <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-green-600 mb-1">{test.totalQuestions ?? test.questionCount ?? 0}</div>
                    <div className="text-sm text-gray-600 font-medium">Questions</div>
                  </div>
                </div>
                
                {/* Enhanced Description */}
                <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Simulates real exam conditions with time pressure and comprehensive scoring
                  </p>
                </div>
                
                {/* Enhanced Action Button */}
                <Button 
                  asChild 
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 rounded-xl text-lg font-semibold"
                >
                  <Link to={`/mock-tests/${test.id}`}>
                    <Play className="mr-3 h-5 w-5" />
                    Start Mock Test
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Enhanced Ellipsis Pagination */}
      {totalPages >= 1 && filteredTests.length > 0 && (
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