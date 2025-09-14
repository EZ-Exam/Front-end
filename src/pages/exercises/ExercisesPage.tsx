import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain, Clock, Search, HelpCircle } from 'lucide-react';
import { mockExercises } from '@/data/mockData';

export function ExercisesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  const filteredExercises = mockExercises.filter(exercise => {
    const matchesSearch = exercise.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = subjectFilter === 'all' || exercise.subject === subjectFilter;
    const matchesDifficulty = difficultyFilter === 'all' || exercise.difficulty === difficultyFilter;
    
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
        <h1 className="text-3xl font-bold">Practice Exercises</h1>
        <Badge variant="outline" className="text-sm">
          {filteredExercises.length} exercises available
        </Badge>
      </div>

      {/* Info Banner */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <HelpCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 mb-1">Practice Makes Perfect</h3>
              <p className="text-sm text-blue-700">
                Complete exercises to reinforce your learning and track your progress. 
                Each exercise provides instant feedback and detailed explanations.
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
                placeholder="Search exercises..."
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

      {/* Exercises Grid */}
      {filteredExercises.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No exercises match your current filters.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setSearchQuery('');
                setSubjectFilter('all');
                setDifficultyFilter('all');
              }}
            >
              Show All Exercises
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExercises.map((exercise) => (
            <Card key={exercise.id} className="hover:shadow-lg transition-shadow group">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2 group-hover:text-blue-600 transition-colors">
                      {exercise.title}
                    </CardTitle>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={getSubjectColor(exercise.subject)}>
                    {exercise.subject}
                  </Badge>
                  <Badge className={getDifficultyColor(exercise.difficulty)} variant="outline">
                    {exercise.difficulty}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Questions:</span>
                    <span className="font-medium">{exercise.questions.length}</span>
                  </div>
                  
                  {exercise.timeLimit && (
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Time Limit:</span>
                      <span className="font-medium flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {exercise.timeLimit} min
                      </span>
                    </div>
                  )}
                </div>
                
                <Button asChild className="w-full">
                  <Link to={`/exercises/${exercise.id}`}>
                    <Brain className="mr-2 h-4 w-4" />
                    Start Exercise
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}