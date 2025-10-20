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
          
          // Build query parameters
          const queryParams = new URLSearchParams();
          
          // Add search parameter
          if (searchQuery.trim()) {
            queryParams.append('search', searchQuery.trim());
          }
          
          // Add ID-based filters
          if (subjectId) queryParams.append('subjectId', subjectId);
          if (lessonId) queryParams.append('lessonId', lessonId);
          if (examTypeId) queryParams.append('examTypeId', examTypeId);
          if (createdById) queryParams.append('createdById', createdById);
          
          // Add sorting parameters
          if (sortBy && sortOrder) {
            const sortValue = `${sortBy}:${sortOrder}`;
            queryParams.append('sort', sortValue);
            queryParams.append('isSort', '1');
          }
          
          // Add pagination parameters
          queryParams.append('pageNumber', pageNumber.toString());
          queryParams.append('pageSize', pageSize.toString());
          
          const queryString = queryParams.toString();
          const apiUrl = queryString ? `/exams?${queryString}` : '/exams';
          
          const response = await api.get(apiUrl);
          const examData = Array.isArray(response?.data?.items) ? response.data.items : (Array.isArray(response?.data) ? response.data : []);
          
          // Update pagination info if available
          if (response?.data?.totalPages) {
            setTotalPages(response.data.totalPages);
          }
          
          // Fetch question count and order info for each exam
          const examsWithDetails = await Promise.all(
            examData.map(async (exam: any) => {
              try {
                const questionsResponse = await api.get(`/exams/${exam.id}/questions`);
                const questions = Array.isArray(questionsResponse?.data?.items) 
                  ? questionsResponse.data.items 
                  : (Array.isArray(questionsResponse?.data) ? questionsResponse.data : []);
                
                return {
                  ...exam,
                  questionCount: questions.length,
                  questions: questions.sort((a: any, b: any) => {
                    const orderA = a.order || a.questionOrder || 0;
                    const orderB = b.order || b.questionOrder || 0;
                    return orderA - orderB;
                  })
                };
              } catch (err) {
                console.error(`Failed to fetch questions for exam ${exam.id}:`, err);
                return {
                  ...exam,
                  questionCount: 0,
                  questions: []
                };
              }
            })
          );
          
          setExams(examsWithDetails);
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
    const matchesDifficulty = difficultyFilter === 'all' || test.difficultyLevel === difficultyFilter;
    
    return matchesSubject && matchesDifficulty;
  });

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
      case 'Biology': return 'bg-green-100 text-green-800';
      case 'Literature': return 'bg-orange-100 text-orange-800';
      case 'English': return 'bg-pink-100 text-pink-800';
      case 'History': return 'bg-yellow-100 text-yellow-800';
      case 'Geography': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
                  <Badge className={`${getDifficultyColor(test.difficultyLevel)} border-0 shadow-md font-semibold px-3 py-1`}>
                    {test.difficultyLevel}
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
                    <div className="text-2xl font-bold text-green-600 mb-1">{test.questionCount || 0}</div>
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
      
      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 flex justify-center">
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-xl p-2 shadow-lg">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
              disabled={pageNumber === 1}
              className="rounded-lg"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === pageNumber ? "default" : "outline"}
                size="sm"
                onClick={() => setPageNumber(page)}
                className={`min-w-[40px] rounded-lg ${
                  page === pageNumber 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0' 
                    : ''
                }`}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageNumber(Math.min(totalPages, pageNumber + 1))}
              disabled={pageNumber === totalPages}
              className="rounded-lg"
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