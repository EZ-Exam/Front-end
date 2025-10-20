import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Eye, 
  BookOpen, 
  Filter, 
  RefreshCw, 
  TrendingUp,
  Users,
  Clock,
  ChevronRight,
  Brain,
  Target,
  Zap,
  ChevronLeft
} from 'lucide-react';
import { Question } from '@/types'; // Updated with difficultyLevelId
import axios from '@/services/axios';

export function QuestionBankPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New state for search, sort, and pagination
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<string>('desc');
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize] = useState<number>(6);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(0);

  useEffect(() => {
    fetchQuestions();
  }, [searchQuery, sortBy, sortOrder, pageNumber]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      
      // Add search parameter
      if (searchQuery.trim()) {
        queryParams.append('search', searchQuery.trim());
      }
      
      // Add sorting parameters
      if (sortBy && sortOrder) {
        const sortValue = `${sortBy}:${sortOrder}`;
        queryParams.append('sort', sortValue);
        queryParams.append('isSort', '1');
      } else {
        queryParams.append('isSort', '0');
      }
      
      // Add pagination parameters
      queryParams.append('pageNumber', pageNumber.toString());
      queryParams.append('pageSize', pageSize.toString());
      
      const queryString = queryParams.toString();
      const apiUrl = queryString ? `/questions?${queryString}` : '/questions?isSort=0';
      
      const response = await axios.get(apiUrl);
      console.log("Response", response.data);
      
      setQuestions(response.data.items || []);
      setTotalPages(response.data.totalPages || 0);
      setTotalItems(response.data.totalItems || 0);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setQuestions([]);
      setTotalPages(0);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyInfo = (difficultyLevelId: number) => {
    switch (difficultyLevelId) {
      case 1: return { text: 'Recognition', color: 'bg-green-100 text-green-800' };
      case 2: return { text: 'Understanding', color: 'bg-yellow-100 text-yellow-800' };
      case 3: return { text: 'Application', color: 'bg-red-100 text-red-800' };
      case 4: return { text: 'Advanced Application', color: 'bg-purple-100 text-purple-800' };
      default: return { text: 'Unknown', color: 'bg-gray-100 text-gray-800' };
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
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Question Bank</h2>
            <p className="text-gray-600">Preparing amazing questions for you...</p>
          </div>
        </div>
      </div>
    );
  }

  // Since filtering is now done server-side via API, we use questions directly
  // Keep client-side filtering for backward compatibility with existing UI filters
  const filteredQuestions = questions.filter(question => {
    const matchesDifficulty = difficultyFilter === 'all' || question.difficultyLevelId?.toString() === difficultyFilter;
    return matchesDifficulty;
  });

  const stats = {
    total: totalItems,
    easy: questions.filter(q => q.difficultyLevelId === 1).length,
    medium: questions.filter(q => q.difficultyLevelId === 2).length,
    hard: questions.filter(q => q.difficultyLevelId === 3).length,
    veryHard: questions.filter(q => q.difficultyLevelId === 4).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Question Bank
            </h1>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Questions</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Recognition</p>
                  <p className="text-3xl font-bold">{stats.easy}</p>
                </div>
                <Target className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm font-medium">Understanding</p>
                  <p className="text-3xl font-bold">{stats.medium}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-yellow-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Application</p>
                  <p className="text-3xl font-bold">{stats.hard}</p>
                </div>
                <Zap className="h-8 w-8 text-red-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Advanced Application</p>
                  <p className="text-3xl font-bold">{stats.veryHard}</p>
                </div>
                <Brain className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Sort Section */}
        <Card className="mb-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Search className="h-5 w-5 text-blue-600" />
              Search & Sort Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search questions by content or source..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                />
              </div>

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
                  <SelectItem value="content:asc">Content A→Z</SelectItem>
                  <SelectItem value="content:desc">Content Z→A</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery('');
                  setSortBy('createdAt');
                  setSortOrder('desc');
                  setPageNumber(1);
                }}
                className="h-12 border-2 border-gray-200 hover:border-red-500 hover:text-red-600 rounded-xl"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Difficulty Filter Section */}
        <Card className="mb-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Target className="h-5 w-5 text-blue-600" />
              Filter by Difficulty
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                variant={difficultyFilter === 'all' ? 'default' : 'outline'}
                size="lg"
                onClick={() => setDifficultyFilter('all')}
                className={`rounded-xl transition-all duration-300 ${
                  difficultyFilter === 'all' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 shadow-lg' 
                    : 'border-2 border-gray-200 hover:border-blue-500 hover:shadow-md'
                }`}
              >
                All Difficulties
              </Button>
              <Button
                variant={difficultyFilter === '1' ? 'default' : 'outline'}
                size="lg"
                onClick={() => setDifficultyFilter('1')}
                className={`rounded-xl transition-all duration-300 ${
                  difficultyFilter === '1' 
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg' 
                    : 'border-2 border-gray-200 hover:border-green-500 hover:shadow-md'
                }`}
              >
                Recognition
              </Button>
              <Button
                variant={difficultyFilter === '2' ? 'default' : 'outline'}
                size="lg"
                onClick={() => setDifficultyFilter('2')}
                className={`rounded-xl transition-all duration-300 ${
                  difficultyFilter === '2' 
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-lg' 
                    : 'border-2 border-gray-200 hover:border-yellow-500 hover:shadow-md'
                }`}
              >
                Understanding
              </Button>
              <Button
                variant={difficultyFilter === '3' ? 'default' : 'outline'}
                size="lg"
                onClick={() => setDifficultyFilter('3')}
                className={`rounded-xl transition-all duration-300 ${
                  difficultyFilter === '3' 
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-lg' 
                    : 'border-2 border-gray-200 hover:border-red-500 hover:shadow-md'
                }`}
              >
                Application
              </Button>
              <Button
                variant={difficultyFilter === '4' ? 'default' : 'outline'}
                size="lg"
                onClick={() => setDifficultyFilter('4')}
                className={`rounded-xl transition-all duration-300 ${
                  difficultyFilter === '4' 
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg' 
                    : 'border-2 border-gray-200 hover:border-purple-500 hover:shadow-md'
                }`}
              >
                Advanced Application
              </Button>
            </div>
            
            {/* Results count */}
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold text-blue-600">{filteredQuestions.length}</span> of <span className="font-semibold">{totalItems}</span> questions
                {totalPages > 1 && (
                  <span className="ml-2">(Page {pageNumber} of {totalPages})</span>
                )}
              </p>
              {(searchQuery || difficultyFilter !== 'all') && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Filtered Results
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Questions Grid */}
        {filteredQuestions.length === 0 ? (
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="py-20 text-center">
              <div className="max-w-md mx-auto">
                <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <BookOpen className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {questions.length === 0 ? 'No Questions Available' : 'No Questions Found'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {questions.length === 0 
                    ? 'Questions will be loaded from the server.' 
                    : 'Try adjusting your search criteria or filters.'}
                </p>
                {questions.length > 0 && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery('');
                      setDifficultyFilter('all');
                    }}
                    className="rounded-xl"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuestions.map((question, index) => (
              <Card 
                key={question.id} 
                className="group hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 bg-white/90 backdrop-blur-sm shadow-lg cursor-pointer"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => window.location.href = `/question-bank/${question.id}`}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                          <BookOpen className="h-4 w-4 text-white" />
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Question #{question.id}
                        </Badge>
                      </div>
                      
                      <CardTitle className="text-lg mb-3 line-clamp-3 leading-relaxed">
                        {question.content}
                      </CardTitle>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">Lesson:</span>
                          <span className="truncate">{question.lessonName}</span>
                        </div>
                        
                        {question.chapterName && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4 text-green-500" />
                            <span className="font-medium">Chapter:</span>
                            <span className="truncate">{question.chapterName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge 
                      className={`${getDifficultyInfo(question.difficultyLevelId).color} border-0 font-semibold`}
                    >
                      {getDifficultyInfo(question.difficultyLevelId).text}
                    </Badge>
                    <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                      {question.questionSource}
                    </Badge>
                  </div>
                </CardHeader>
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