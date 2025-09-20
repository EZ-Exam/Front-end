import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Brain, BarChart3, Users, ArrowRight, Star } from 'lucide-react';
import { mockProgressData, mockUser } from '@/data/mockData';

export function HomePage() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center py-12 px-4 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Master Your <span className="text-blue-600">University Entrance</span> Exams
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            AI-powered exam preparation platform for Math, Physics, and Chemistry. 
            Learn with interactive lessons, practice with smart exercises, and track your progress.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link to="/lessons">
                <Play className="mr-2 h-5 w-5" />
                Start Practicing
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6" asChild>
              <Link to="/mock-tests">
                View Mock Tests
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-8">Why Choose EZEXAM?</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-xl">AI-Powered Learning</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Smart algorithms adapt to your learning pace and identify areas for improvement.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-xl">Practice Mock Testing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Practice knowledge with test-taking skills with real exam simulation
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-xl">Video Lessons</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                High-quality video content covering all topics with expert explanations.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle className="text-xl">Community Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Connect with fellow students and discuss lessons in our comment system.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="bg-white rounded-xl p-8 border">
        <h2 className="text-2xl font-bold text-center mb-6">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button variant="outline" size="lg" className="h-16 flex flex-col gap-2" asChild>
            <Link to="/lessons">
              <Play className="h-5 w-5" />
              Continue Learning
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="h-16 flex flex-col gap-2" asChild>
            <Link to="/exercises">
              <Brain className="h-5 w-5" />
              Practice Exercises
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="h-16 flex flex-col gap-2" asChild>
            <Link to="/mock-tests">
              <BarChart3 className="h-5 w-5" />
              Take Mock Test
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}