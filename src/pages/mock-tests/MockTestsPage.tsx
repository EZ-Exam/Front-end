import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGlobalLoading } from '@/contexts/GlobalLoadingContext';
import { Clock, Users, Search, AlertTriangle } from 'lucide-react';
import api from '@/services/axios';

export function MockTestsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Global loading hook
  const { withLoading } = useGlobalLoading();

  // Fetch exams from API
  useEffect(() => {
    const fetchExams = async () => {
      await withLoading(async () => {
        try {
          setLoading(true);
          setError(null);
          const response = await api.get('/exams');
          const examData = Array.isArray(response?.data?.items) ? response.data.items : (Array.isArray(response?.data) ? response.data : []);
          
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
      }, "Đang tải danh sách bài thi...");
    };

    fetchExams();
  }, [withLoading]);

  const filteredTests = exams.filter(test => {
    const matchesSearch = test.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const matchesSubject = subjectFilter === 'all' || test.subjectName === subjectFilter;
    const matchesDifficulty = difficultyFilter === 'all' || test.difficultyLevel === difficultyFilter;
    
    return matchesSearch && matchesSubject && matchesDifficulty;
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
      case 'Toán học': return 'bg-blue-100 text-blue-800';
      case 'Vật lý': return 'bg-purple-100 text-purple-800';
      case 'Hóa học': return 'bg-green-100 text-green-800';
      case 'Sinh học': return 'bg-green-100 text-green-800';
      case 'Ngữ văn': return 'bg-orange-100 text-orange-800';
      case 'Tiếng Anh': return 'bg-pink-100 text-pink-800';
      case 'Lịch sử': return 'bg-yellow-100 text-yellow-800';
      case 'Địa lý': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Mock Tests</h1>
        </div>
        <div className="text-center py-12">
          <p>Loading exams...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Mock Tests</h1>
        </div>
        <div className="text-center py-12">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Mock Tests</h1>
        <Badge variant="outline" className="text-sm">
          {filteredTests.length} tests available
        </Badge>
      </div>

      {/* Info Banner */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-900 mb-1">Exam Simulation</h3>
              <p className="text-sm text-amber-700">
                Mock tests simulate real exam conditions with time limits and comprehensive scoring. 
                Complete the entire test to receive detailed performance analytics.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search mock tests..."
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
                <SelectItem value="Toán học">Toán học</SelectItem>
                <SelectItem value="Vật lý">Vật lý</SelectItem>
                <SelectItem value="Hóa học">Hóa học</SelectItem>
                <SelectItem value="Sinh học">Sinh học</SelectItem>
                <SelectItem value="Ngữ văn">Ngữ văn</SelectItem>
                <SelectItem value="Tiếng Anh">Tiếng Anh</SelectItem>
                <SelectItem value="Lịch sử">Lịch sử</SelectItem>
                <SelectItem value="Địa lý">Địa lý</SelectItem>
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTests.map((test) => (
            <Card key={test.id} className="hover:shadow-lg transition-shadow group">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2 group-hover:text-blue-600 transition-colors">
                      {test.name}
                    </CardTitle>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={getSubjectColor(test.subjectName)}>
                    {test.subjectName}
                  </Badge>
                  <Badge className={getDifficultyColor(test.difficultyLevel)} variant="outline">
                    {test.difficultyLevel}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="flex items-center text-gray-500 mb-1">
                      <Clock className="h-3 w-3 mr-1" />
                      Duration
                    </div>
                    <p className="font-medium">{test.duration || 'N/A'} min</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center text-gray-500 mb-1">
                      <Users className="h-3 w-3 mr-1" />
                      Questions
                    </div>
                    <p className="font-medium">{test.questionCount || 0}</p>
                  </div>
                </div>
                
                <div className="pt-2 border-t">
                  <p className="text-xs text-gray-500 mb-3">
                    Simulates real exam conditions with time pressure and comprehensive scoring
                  </p>
                  
                  <Button asChild className="w-full">
                    <Link to={`/mock-tests/${test.id}`}>
                      Start Mock Test
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}