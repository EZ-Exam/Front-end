import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, RadialBarChart, RadialBar
} from 'recharts';
import { 
  TrendingUp, 
  Target, 
  Clock, 
  Award,
  BookOpen,
  Brain,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { mockProgressData } from '@/data/mockData';

export function AnalyticsPage() {
  // Mock analytics data
  const performanceData = [
    { month: 'Jan', Math: 65, Physics: 55, Chemistry: 70 },
    { month: 'Feb', Math: 70, Physics: 60, Chemistry: 75 },
    { month: 'Mar', Math: 75, Physics: 68, Chemistry: 80 },
    { month: 'Apr', Math: 80, Physics: 72, Chemistry: 85 },
    { month: 'May', Math: 85, Physics: 78, Chemistry: 92 },
  ];

  const difficultyData = [
    { name: 'Easy', value: 40, color: '#10B981' },
    { name: 'Medium', value: 35, color: '#F59E0B' },
    { name: 'Hard', value: 25, color: '#EF4444' },
  ];

  const weeklyActivity = [
    { day: 'Mon', hours: 2.5 },
    { day: 'Tue', hours: 3.0 },
    { day: 'Wed', hours: 1.5 },
    { day: 'Thu', hours: 4.0 },
    { day: 'Fri', hours: 2.0 },
    { day: 'Sat', hours: 5.5 },
    { day: 'Sun', hours: 3.5 },
  ];

  const strengthsWeaknesses = [
    { subject: 'Math', strength: 'Algebra', weakness: 'Geometry', score: 85 },
    { subject: 'Physics', strength: 'Mechanics', weakness: 'Thermodynamics', score: 78 },
    { subject: 'Chemistry', strength: 'Organic', weakness: 'Inorganic', score: 92 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <Badge variant="outline" className="text-sm">
          Last updated: Today
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Overall Score</span>
            </div>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">Study Time</span>
            </div>
            <div className="text-2xl font-bold">22h</div>
            <p className="text-xs text-gray-500">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-gray-600">Lessons</span>
            </div>
            <div className="text-2xl font-bold">30</div>
            <p className="text-xs text-gray-500">Completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-gray-600">Tests Passed</span>
            </div>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <CheckCircle className="h-3 w-3 mr-1" />
              Above 70%
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          {/* Subject Performance */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Subject Performance Trends</CardTitle>
                <CardDescription>
                  Monthly performance across all subjects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="Math" stroke="#3B82F6" strokeWidth={2} />
                    <Line type="monotone" dataKey="Physics" stroke="#8B5CF6" strokeWidth={2} />
                    <Line type="monotone" dataKey="Chemistry" stroke="#10B981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Subject Scores</CardTitle>
                <CardDescription>
                  Your latest performance by subject
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockProgressData.map((subject) => (
                  <div key={subject.subject} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{subject.subject}</span>
                      <span className="text-lg font-bold">{subject.score}%</span>
                    </div>
                    <Progress value={subject.score} className="h-2" />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{subject.completed} completed</span>
                      <span>{subject.total - subject.completed} remaining</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Difficulty Distribution</CardTitle>
                <CardDescription>
                  Questions completed by difficulty level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={difficultyData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {difficultyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-6 mt-4">
                  {difficultyData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">{item.name}: {item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Learning Goals</CardTitle>
                <CardDescription>
                  Track your progress towards learning objectives
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Complete Math Course</span>
                      <span className="text-sm text-gray-500">80%</span>
                    </div>
                    <Progress value={80} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Master Physics Fundamentals</span>
                      <span className="text-sm text-gray-500">65%</span>
                    </div>
                    <Progress value={65} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Chemistry Problem Solving</span>
                      <span className="text-sm text-gray-500">92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Mock Test Readiness</span>
                      <span className="text-sm text-gray-500">73%</span>
                    </div>
                    <Progress value={73} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Study Hours</CardTitle>
                <CardDescription>
                  Your study time throughout the week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="hours" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Study Streak</CardTitle>
                <CardDescription>
                  Keep up your daily learning habit
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-600 mb-2">15</div>
                  <div className="text-lg font-medium">Day Streak</div>
                  <p className="text-sm text-gray-500">Keep it up!</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Today</span>
                    </div>
                    <span className="text-sm text-green-600">2.5 hours</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-gray-400" />
                      <span>Yesterday</span>
                    </div>
                    <span className="text-sm text-gray-500">3.0 hours</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-gray-400" />
                      <span>2 days ago</span>
                    </div>
                    <span className="text-sm text-gray-500">1.5 hours</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Strengths & Weaknesses</CardTitle>
                <CardDescription>
                  Areas where you excel and need improvement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {strengthsWeaknesses.map((item) => (
                  <div key={item.subject} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold">{item.subject}</h4>
                      <Badge variant="outline">{item.score}%</Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-gray-600">Strong in:</span>
                        <span className="font-medium text-green-700">{item.strength}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                        <span className="text-gray-600">Improve:</span>
                        <span className="font-medium text-orange-700">{item.weakness}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Recommendations</CardTitle>
                <CardDescription>
                  Personalized suggestions to improve your performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Brain className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">Focus on Physics</h4>
                      <p className="text-sm text-blue-700">
                        Your Physics scores have room for improvement. Spend more time on 
                        thermodynamics and wave mechanics topics.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-900 mb-1">Maintain Chemistry Momentum</h4>
                      <p className="text-sm text-green-700">
                        Excellent progress in Chemistry! Keep practicing organic chemistry 
                        problems to maintain your 92% score.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-purple-900 mb-1">Study Schedule</h4>
                      <p className="text-sm text-purple-700">
                        Consider increasing weekend study time. Your weekday consistency 
                        is great, but weekends could boost overall performance.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}