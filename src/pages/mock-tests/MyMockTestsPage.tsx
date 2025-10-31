import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users, Trophy, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '@/services/axios';
import { useAuth } from '@/pages/auth/AuthContext';

export function MyMockTestsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<any[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(6);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchFeed = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const qs = new URLSearchParams();
        qs.append('page', String(pageNumber));
        qs.append('pageSize', String(pageSize));
        const res = await api.get(`/exams/optimized/user/${user.id}/feed?${qs.toString()}`);
        const items = Array.isArray(res?.data?.items) ? res.data.items : [];
        setExams(items);
        setTotalPages(res?.data?.totalPages || 0);
      } catch (e) {
        setExams([]);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, [user?.id, pageNumber, pageSize]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">Loading...</div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              My Mock Tests
            </h1>
          </div>
        </div>

        {exams.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">No mock tests found.</CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {exams.map((test, index) => (
              <Card key={test.id} className="group hover:shadow-2xl transition-all duration-500 hover:scale-105 border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
                <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-purple-50 relative">
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
                    <Badge className="bg-blue-100 text-blue-800 border-0 shadow-md font-semibold px-3 py-1">
                      {test.examTypeName}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
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
                      <div className="text-2xl font-bold text-green-600 mb-1">{test.totalQuestions ?? 0}</div>
                      <div className="text-sm text-gray-600 font-medium">Questions</div>
                    </div>
                  </div>
                  <Button asChild className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg">
                    <Link to={`/my-mock-tests/${test.id}`}>Start Mock Test</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-xl p-2 shadow-lg">
              <Button variant="outline" size="sm" onClick={() => setPageNumber(Math.max(1, pageNumber - 1))} disabled={pageNumber === 1} className="rounded-lg">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button key={page} variant={page === pageNumber ? 'default' : 'outline'} size="sm" onClick={() => setPageNumber(page)} className={`min-w-[40px] rounded-lg ${page === pageNumber ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0' : ''}`}>
                  {page}
                </Button>
              ))}
              <Button variant="outline" size="sm" onClick={() => setPageNumber(Math.min(totalPages, pageNumber + 1))} disabled={pageNumber === totalPages} className="rounded-lg">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


