 
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { 
  Search, 
  BookOpen, 
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
  const [totalItemsForFilter, setTotalItemsForFilter] = useState<number>(0);

  // Server-side counts per difficulty for current search
  const [difficultyCounts, setDifficultyCounts] = useState<{Easy: number; Medium: number; Hard: number; VeryHard: number}>({
    Easy: 0,
    Medium: 0,
    Hard: 0,
    VeryHard: 0,
  });

  useEffect(() => {
    fetchQuestions();
  }, [pageNumber, difficultyFilter]);

  // Map difficulty to backend id; accepts names or id strings
  const getDifficultyId = (level: string) => {
    if (['1','2','3','4'].includes(level)) return Number(level);
    switch (level) {
      case 'Easy': return 1;
      case 'Medium': return 2;
      case 'Hard': return 3;
      case 'Very Hard': return 4;
      default: return undefined as unknown as number;
    }
  };

  // Fetch overall counts per difficulty (across all pages) for current search
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const levels = ['Easy', 'Medium', 'Hard', 'Very Hard'] as const;
        const requests = levels.map((lvl) => {
          const p = new URLSearchParams();
          p.append('page', '1');
          p.append('pageSize', '1');
          const id = getDifficultyId(lvl);
          if (id) p.append('difficultyLevelId', String(id));
          return axios.get(`/questions/feed?${p.toString()}`);
        });
        const [easyRes, medRes, hardRes, veryHardRes] = await Promise.all(requests);
        setDifficultyCounts({
          Easy: easyRes?.data?.totalItems || 0,
          Medium: medRes?.data?.totalItems || 0,
          Hard: hardRes?.data?.totalItems || 0,
          VeryHard: veryHardRes?.data?.totalItems || 0,
        });
      } catch (err) {
        console.error('Failed to fetch difficulty counts', err);
        setDifficultyCounts({ Easy: 0, Medium: 0, Hard: 0, VeryHard: 0 });
      }
    };
    fetchCounts();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      
      // Build query parameters for optimized feed endpoint
      const queryParams = new URLSearchParams();

      // Do not pass search/sort to backend; handled on client

      // Pass difficulty to server when selected for optimized filtering
      if (difficultyFilter !== 'all') {
        queryParams.append('difficultyLevelId', difficultyFilter);
      }

      // Pagination uses `page` and `pageSize` on the new API
      queryParams.append('page', pageNumber.toString());
      queryParams.append('pageSize', pageSize.toString());

      const queryString = queryParams.toString();
      const apiUrl = queryString ? `/questions/feed?${queryString}` : '/questions/feed';
      console.log("API URL", apiUrl);
      const response = await axios.get(apiUrl);
      console.log("Response", response.data);
      
      // Map API items to local `Question` shape if necessary
      const items = (response.data.items || []).map((item: any) => ({
        ...item,
        // Backward compatibility with UI expecting `questionSource`
        questionSource: item.questionSource ?? item.source,
      }));

      setQuestions(items);
      setTotalPages(response.data.totalPages || 0);
      const total = response.data.totalItems || 0;
      setTotalItems(total);
      // default total for current filter view
      setTotalItemsForFilter(total);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setQuestions([]);
      setTotalPages(0);
      setTotalItems(0);
      setTotalItemsForFilter(0);
    } finally {
      setLoading(false);
    }
  };

  // When difficulty filter changes, update totalItemsForFilter across all pages
  useEffect(() => {
    const updateTotalForFilter = async () => {
      if (difficultyFilter === 'all') {
        setTotalItemsForFilter(totalItems);
        return;
      }
      try {
        const params = new URLSearchParams();
        params.append('page', '1');
        params.append('pageSize', '1');
        if (searchQuery.trim()) params.append('search', searchQuery.trim());
        const id = getDifficultyId(difficultyFilter);
        if (id) params.append('difficultyLevelId', String(id));
        const res = await axios.get(`/questions/feed?${params.toString()}`);
        setTotalItemsForFilter(res?.data?.totalItems || 0);
      } catch (err) {
        console.error('Failed to fetch total for filter', err);
        setTotalItemsForFilter(0);
      }
    };
    updateTotalForFilter();
  }, [difficultyFilter, searchQuery, totalItems]);

  const getDifficultyDisplay = (level: string) => {
    switch (level) {
      case 'Easy': return { text: 'Recognition', color: 'bg-green-100 text-green-800' };
      case 'Medium': return { text: 'Understanding', color: 'bg-yellow-100 text-yellow-800' };
      case 'Hard': return { text: 'Application', color: 'bg-red-100 text-red-800' };
      case 'Very Hard': return { text: 'Advanced Application', color: 'bg-purple-100 text-purple-800' };
      default: return { text: 'Unknown', color: 'bg-gray-100 text-gray-800' };
    }
  };
  
  // Map id string to difficulty name returned by backend
  const getDifficultyNameFromId = (id: string) => {
    switch (id) {
      case '1': return 'Easy';
      case '2': return 'Medium';
      case '3': return 'Hard';
      case '4': return 'Very Hard';
      default: return '';
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

  // Client-side filter and sort
  const filteredQuestions = questions.filter(question => {
    const matchesDifficulty = difficultyFilter === 'all' || question.difficultyLevel === getDifficultyNameFromId(difficultyFilter);
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = q === '' ||
      question.content?.toLowerCase().includes(q) ||
      (question.questionSource?.toLowerCase?.().includes(q)) ||
      question.lessonName?.toLowerCase().includes(q) ||
      question.chapterName?.toLowerCase().includes(q);
    return matchesDifficulty && matchesSearch;
  });

  const sortedQuestions = [...filteredQuestions].sort((a, b) => {
    if (sortBy === 'updatedAt') {
      const aTime = new Date((a as any)['updatedAt']).getTime();
      const bTime = new Date((b as any)['updatedAt']).getTime();
      return sortOrder === 'asc' ? aTime - bTime : bTime - aTime;
    }
    if (sortBy === 'content') {
      const cmp = String(a.content || '').localeCompare(String(b.content || ''));
      return sortOrder === 'asc' ? cmp : -cmp;
    }
    return 0;
  });  

  const stats = {
    total: totalItems,
    easy: difficultyCounts.Easy,
    medium: difficultyCounts.Medium,
    hard: difficultyCounts.Hard,
    veryHard: difficultyCounts.VeryHard,
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
                onClick={() => { setDifficultyFilter('1'); setPageNumber(1); }}
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
                onClick={() => { setDifficultyFilter('2'); setPageNumber(1); }}
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
                onClick={() => { setDifficultyFilter('3'); setPageNumber(1); }}
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
                onClick={() => { setDifficultyFilter('4'); setPageNumber(1); }}
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
                Showing <span className="font-semibold text-blue-600">{sortedQuestions.length}</span> of <span className="font-semibold">{totalItemsForFilter}</span> questions
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
        {sortedQuestions.length === 0 ? (
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
            {sortedQuestions.map((question, index) => (
              <Card 
                key={question.id} 
                className="group hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 bg-white/90 backdrop-blur-sm shadow-lg cursor-pointer overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => window.location.href = `/question-bank/${question.id}`}
              >
                <CardHeader className="pb-4 overflow-hidden">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex-shrink-0">
                          <BookOpen className="h-4 w-4 text-white" />
                        </div>
                        <Badge variant="outline" className="text-xs flex-shrink-0">
                          Question #{question.id}
                        </Badge>
                      </div>
                      
                      <div className="mb-3 line-clamp-3 leading-relaxed break-words overflow-hidden">
                        <div className="prose prose-sm max-w-none text-gray-800 [&>*]:my-0 [&>p]:mb-1 [&>p:last-child]:mb-0 [&_.katex]:text-sm [&_.katex-display]:my-1">
                          <ReactMarkdown
                            remarkPlugins={[remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                            components={{
                              p: ({ children }) => <p className="mb-1 last:mb-0 text-base leading-relaxed">{children}</p>,
                            }}
                          >
                            {question.content || ''}
                          </ReactMarkdown>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600 min-w-0">
                          <Users className="h-4 w-4 text-blue-500 flex-shrink-0" />
                          <span className="font-medium flex-shrink-0">Lesson:</span>
                          <span className="truncate min-w-0">{question.lessonName || 'N/A'}</span>
                        </div>
                        
                        {question.chapterName && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 min-w-0">
                            <Clock className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span className="font-medium flex-shrink-0">Chapter:</span>
                            <span className="truncate min-w-0">{question.chapterName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge 
                      className={`${getDifficultyDisplay(question.difficultyLevel).color} border-0 font-semibold text-xs`}
                    >
                      {getDifficultyDisplay(question.difficultyLevel).text}
                    </Badge>
                    <Badge variant="secondary" className="bg-gray-100 text-gray-700 text-xs">
                      {question.type || 'multiple-choice'}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
        
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