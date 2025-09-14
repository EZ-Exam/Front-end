import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Users, Search, AlertTriangle } from 'lucide-react';
import { mockTests } from '@/data/mockData';

export function MockTestsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  const filteredTests = mockTests.filter(test => {
    const matchesSearch = test.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = subjectFilter === 'all' || test.subject === subjectFilter;
    const matchesDifficulty = difficultyFilter === 'all' || test.difficulty === difficultyFilter;
    
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
      case 'Math': return 'bg-blue-100 text-blue-800';
      case 'Physics': return 'bg-purple-100 text-purple-800';
      case 'Chemistry': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
                <SelectItem value="Math">Math</SelectItem>
                <SelectItem value="Physics">Physics</SelectItem>
                <SelectItem value="Chemistry">Chemistry</SelectItem>
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
                      {test.title}
                    </CardTitle>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={getSubjectColor(test.subject)}>
                    {test.subject}
                  </Badge>
                  <Badge className={getDifficultyColor(test.difficulty)} variant="outline">
                    {test.difficulty}
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
                    <p className="font-medium">{test.duration} min</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center text-gray-500 mb-1">
                      <Users className="h-3 w-3 mr-1" />
                      Questions
                    </div>
                    <p className="font-medium">{test.totalQuestions}</p>
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