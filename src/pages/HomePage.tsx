import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Brain, 
  BarChart3, 
  Users, 
  ArrowRight, 
  Zap, 
  Target, 
  BookOpen, 
  Trophy,
  Sparkles,
  Rocket,
  Award,
  Lightbulb
} from 'lucide-react';
import EZEXAMLogo from '@/assest/EZEXAM_Icon.png';

export function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Hero Section */}
        <section className="text-center py-16 px-4 mb-16">
          <div className="max-w-5xl mx-auto">
            {/* Enhanced Logo Section */}
            <div className="relative mb-12">
              {/* Floating Elements */}
              <div className="absolute -top-8 -left-8 w-12 h-12 bg-blue-400 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute -top-4 -right-12 w-8 h-8 bg-purple-400 rounded-full opacity-30 animate-pulse [animation-delay:1s]"></div>
              <div className="absolute -bottom-4 -left-16 w-6 h-6 bg-pink-400 rounded-full opacity-25 animate-pulse [animation-delay:2s]"></div>
              <div className="absolute top-8 right-8 w-10 h-10 bg-green-400 rounded-full opacity-20 animate-pulse [animation-delay:3s]"></div>
              
              {/* Large Logo */}
              <div className="flex flex-col items-center mb-8">
                <div className="relative group">
                  {/* Main Logo Container */}
                  <div className="w-32 h-32 bg-gradient-to-r rounded-3xl flex items-center justify-center shadow-2xl group-hover:shadow-3xl transition-all duration-500 group-hover:scale-110 relative overflow-hidden">
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
                    {/* Animated background circles */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-3xl animate-pulse"></div>
                    {/* Logo */}
                    <img src={EZEXAMLogo} alt='EZEXAM Logo' className='w-20 h-16 relative z-10 group-hover:scale-110 transition-transform duration-500'/>
                  </div>
                  
                  {/* Rotating ring around logo */}
                  <div className="absolute inset-0 w-32 h-32 border-4 border-transparent border-t-blue-500 border-r-purple-500 rounded-3xl animate-spin opacity-60"></div>
                  <div className="absolute inset-2 w-28 h-28 border-2 border-transparent border-b-pink-500 border-l-green-500 rounded-2xl animate-spin opacity-40 [animation-direction:reverse] [animation-duration:2s]"></div>
                </div>
                
                {/* Logo Text */}
                <div className="mt-6 text-center">
                  <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                    EZEXAM
                  </h1>
                  <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 px-6 py-3 text-lg font-semibold shadow-lg">
                    <Sparkles className="h-5 w-5 mr-2" />
                    AI-Powered Learning Platform
                  </Badge>
                </div>
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-8">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Master Your
              </span>
              <br />
              <span className="text-gray-800">
                University Entrance
              </span>
              <br />
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Exams
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              AI-powered exam preparation platform for Math, Physics, and Chemistry. 
              Learn with interactive lessons, practice with smart exercises, and track your progress.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              <Button asChild size="lg" className="text-lg px-10 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <Link to="/lessons">
                  <Play className="mr-3 h-6 w-6" />
                  Start Practicing
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-10 py-6 border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 hover:scale-105" asChild>
                <Link to="/mock-tests">
                  <Trophy className="mr-3 h-6 w-6" />
                  View Mock Tests
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">1000+</div>
                <div className="text-sm text-gray-600">Practice Questions</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">50+</div>
                <div className="text-sm text-gray-600">Video Lessons</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">95%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
                <div className="text-sm text-gray-600">AI Support</div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Features Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Why Choose EZEXAM?
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the future of education with our cutting-edge AI technology
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="group hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold">AI-Powered Learning</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center leading-relaxed">
                  Smart algorithms adapt to your learning pace and identify areas for improvement with personalized recommendations.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold">Practice Mock Testing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center leading-relaxed">
                  Practice knowledge with test-taking skills with real exam simulation and detailed analytics.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold">Interactive Lessons</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center leading-relaxed">
                  High-quality interactive content covering all topics with expert explanations and real-time feedback.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold">Community Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center leading-relaxed">
                  Connect with fellow students and discuss lessons in our interactive comment system with expert moderation.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Enhanced Quick Actions */}
        <section className="mb-16">
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-3xl font-bold mb-2">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Quick Actions
                </span>
              </CardTitle>
              <CardDescription className="text-lg text-gray-600">
                Jump into your learning journey with these quick access options
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <Button variant="outline" size="lg" className="h-20 flex flex-col gap-3 border-2 border-blue-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 hover:scale-105" asChild>
                  <Link to="/lessons">
                    <Play className="h-6 w-6 text-blue-600" />
                    <span className="font-semibold">Continue Learning</span>
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="h-20 flex flex-col gap-3 border-2 border-green-200 hover:border-green-500 hover:bg-green-50 transition-all duration-300 hover:scale-105" asChild>
                  <Link to="/question-bank">
                    <Brain className="h-6 w-6 text-green-600" />
                    <span className="font-semibold">Practice Questions</span>
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="h-20 flex flex-col gap-3 border-2 border-purple-200 hover:border-purple-500 hover:bg-purple-50 transition-all duration-300 hover:scale-105" asChild>
                  <Link to="/mock-tests">
                    <Trophy className="h-6 w-6 text-purple-600" />
                    <span className="font-semibold">Take Mock Test</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Learning Path Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Your Learning Path
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Follow our structured approach to maximize your exam preparation
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="group hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-blue-800">Step 1: Learn</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-700 text-center leading-relaxed">
                  Master fundamental concepts through interactive lessons and video content.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 bg-gradient-to-br from-green-50 to-green-100 shadow-lg">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-green-800">Step 2: Practice</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-green-700 text-center leading-relaxed">
                  Apply your knowledge with AI-powered practice questions and exercises.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 bg-gradient-to-br from-purple-50 to-purple-100 shadow-lg">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-purple-800">Step 3: Test</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-purple-700 text-center leading-relaxed">
                  Validate your progress with comprehensive mock tests and detailed analytics.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center py-16 px-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Ace Your Exams?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of students who have already improved their scores with EZEXAM
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-10 py-6 bg-white text-blue-600 hover:bg-blue-50 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105" asChild>
                <Link to="/lessons">
                  <Rocket className="mr-3 h-6 w-6" />
                  Get Started Now
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-10 py-6 border-2 border-white text-blue-600 hover:bg-white hover:text-blue-600 transition-all duration-300 hover:scale-105" asChild>
                <Link to="/help">
                  <Lightbulb className="mr-3 h-6 w-6" />
                  Learn More
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}