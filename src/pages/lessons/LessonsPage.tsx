import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGlobalLoading } from '@/contexts/GlobalLoadingContext';
import { Play, Search, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [difficultyFilter, setDifficultyFilter] = useState('all');
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

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(i)}
          className="min-w-[40px]"
        >
          {i}
        </Button>
      );
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {pages}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Lessons</h1>
        <Badge variant="outline" className="text-sm">
          {loading ? 'Loading...' : `${totalFilteredItems} lessons available`}
        </Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search lessons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger>
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

            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Difficulties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => {
              setSearchQuery('');
              setSubjectFilter('all');
              setDifficultyFilter('all');
            }}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lessons Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="animate-pulse">
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
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No lessons match your current filters.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setSearchQuery('');
                setSubjectFilter('all');
                setDifficultyFilter('all');
              }}
            >
              Show All Lessons
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedLessons.map((lesson) => (
              <Card key={lesson.id} className="hover:shadow-lg transition-shadow group">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2 group-hover:text-blue-600 transition-colors">
                        {lesson.title}
                      </CardTitle>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {lesson.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={getSubjectColor(lesson.subjectId)}>
                      {subjectMapping[lesson.subjectId] || 'Unknown'}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <Button asChild className="w-full">
                    <Link to={`/lessons/${lesson.id}`}>
                      <Play className="mr-2 h-4 w-4" />
                      Start Lesson
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && renderPagination()}
        </>
      )}
    </div>
  );
}