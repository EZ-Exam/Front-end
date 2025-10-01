import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGlobalLoading } from '@/contexts/GlobalLoadingContext';
import { 
  Play, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Filter, 
  RefreshCw
} from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/services/axios';

interface Lesson {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  pdfUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

// API returns array directly, not wrapped in object
// interface LessonsResponse {
//   items: Lesson[];
//   pageNumber: number;
//   pageSize: number;
//   totalItems: number;
//   totalPages: number;
// }

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

export function LessonsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 6;

  // Global loading hook
  const { withLoading } = useGlobalLoading();

  // Fetch all lessons from API (no pagination on backend yet)
  const fetchLessons = async () => {
    await withLoading(async () => {
      try {
        setLoading(true);
        const response = await api.get(`/lessons-enhanced`);
        console.log("data",response.data);
        const data = response.data;
        
        // API returns array directly, not wrapped in object
        setLessons(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch lessons:', error);
        setLessons([]);
      } finally {
        setLoading(false);
      }
    }, "Đang tải danh sách bài học...");
  };

  useEffect(() => {
    fetchLessons();
  }, [withLoading]);

  // Client-side filtering for search and subject
  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lesson.description.toLowerCase().includes(searchQuery.toLowerCase());
    const lessonSubject = subjectMapping[lesson.subjectId] || 'Unknown';
    const matchesSubject = subjectFilter === 'all' || lessonSubject === subjectFilter;
    
    return matchesSearch && matchesSubject;
  });

  // Calculate pagination for filtered results
  const totalFilteredItems = filteredLessons.length;
  const totalFilteredPages = Math.ceil(totalFilteredItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedLessons = filteredLessons.slice(startIndex, endIndex);

  // Update total pages when filtered results change
  useEffect(() => {
    setTotalPages(totalFilteredPages);
    // Reset to page 1 if current page is beyond available pages
    if (currentPage > totalFilteredPages && totalFilteredPages > 0) {
      setCurrentPage(1);
    }
  }, [totalFilteredPages, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, subjectFilter]);


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

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Lessons
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
            Explore our comprehensive collection of interactive lessons designed to help you master exam concepts
          </p>
          <Badge variant="outline" className="text-sm px-4 py-2 bg-white/80 backdrop-blur-sm">
            {loading ? 'Loading...' : `${totalFilteredItems} lessons available`}
          </Badge>
        </div>

        {/* Enhanced Filters */}
        <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Filter className="h-5 w-5 text-blue-600" />
              Search & Filter Lessons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search lessons by title or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                />
              </div>
              
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl">
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  <SelectItem value="Math">Math</SelectItem>
                  <SelectItem value="Physics">Physics</SelectItem>
                  <SelectItem value="Chemistry">Chemistry</SelectItem>
                  <SelectItem value="Biology">Biology</SelectItem>
                  <SelectItem value="Literature">Literature</SelectItem>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="History">History</SelectItem>
                  <SelectItem value="Geography">Geography</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery('');
                  setSubjectFilter('all');
                }}
                className="h-12 border-2 border-gray-200 hover:border-red-500 hover:text-red-600 rounded-xl"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Clear All
              </Button>
            </div>
            
            {/* Results count */}
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold text-blue-600">{totalFilteredItems}</span> of <span className="font-semibold">{lessons.length}</span> lessons
              </p>
              {totalFilteredItems !== lessons.length && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Filtered Results
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Lessons Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="animate-pulse border-0 bg-white/80 backdrop-blur-sm shadow-lg">
                <CardHeader className="pb-4">
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : totalFilteredItems === 0 ? (
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="py-20 text-center">
              <div className="max-w-md mx-auto">
                <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <BookOpen className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {lessons.length === 0 ? 'No Lessons Available' : 'No Lessons Found'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {lessons.length === 0 
                    ? 'Lessons will be loaded from the server.' 
                    : 'Try adjusting your search criteria or filters.'}
                </p>
                {lessons.length > 0 && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery('');
                      setSubjectFilter('all');
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
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedLessons.map((lesson, index) => (
                <Card 
                  key={lesson.id} 
                  className="group hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 bg-white/90 backdrop-blur-sm shadow-lg"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                            <BookOpen className="h-4 w-4 text-white" />
                          </div>
                          <Badge variant="outline" className="text-xs">
                            Lesson #{lesson.id}
                          </Badge>
                        </div>
                        
                        <CardTitle className="text-lg mb-3 line-clamp-2 leading-relaxed group-hover:text-blue-600 transition-colors">
                          {lesson.title}
                        </CardTitle>
                        
                        <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                          {lesson.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge 
                        className={`${getSubjectColor(lesson.subjectId)} border-0 font-semibold`}
                      >
                        {subjectMapping[lesson.subjectId] || 'Unknown'}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <Button 
                      asChild 
                      className="w-full group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-purple-500 group-hover:text-white group-hover:border-transparent transition-all duration-300 rounded-xl"
                    >
                      <Link to={`/lessons/${lesson.id}`}>
                        <Play className="mr-2 h-4 w-4" />
                        Start Learning
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Enhanced Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-xl p-2 shadow-lg">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="rounded-lg"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className={`min-w-[40px] rounded-lg ${
                        page === currentPage 
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
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="rounded-lg"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}