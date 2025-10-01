import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  MessageCircle, 
  Mail, 
  Phone, 
  Clock,
  HelpCircle,
  BookOpen,
  Users,
  Bug,
  Send,
  FileText,
  Zap,
  Sparkles,
  Rocket,
  Shield,
  CheckCircle,
  AlertCircle,
  Star,
  Heart,
  Lightbulb,
  Target,
  Award,
  TrendingUp,
  Globe,
  Headphones
} from 'lucide-react';

export function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [supportForm, setSupportForm] = useState({
    category: '',
    subject: '',
    message: ''
  });

  const faqData = [
    {
      id: '1',
      question: 'How do I reset my password?',
      answer: 'You can reset your password by clicking on the "Forgot Password" link on the login page. You\'ll receive an email with instructions to create a new password.',
      category: 'Account'
    },
    {
      id: '2',
      question: 'How are exercises and mock tests graded?',
      answer: 'Our AI-powered grading system automatically evaluates your answers and provides detailed explanations for each question. Scores are calculated based on correct answers and time taken.',
      category: 'Learning'
    },
    {
      id: '3',
      question: 'Can I download lessons for offline viewing?',
      answer: 'Currently, offline viewing is not available. However, we\'re working on this feature for future releases. All content requires an internet connection.',
      category: 'Features'
    },
    {
      id: '4',
      question: 'How do I track my progress?',
      answer: 'Visit the Analytics page to see detailed progress reports, including subject-wise performance, completion rates, and improvement trends over time.',
      category: 'Progress'
    },
    {
      id: '5',
      question: 'What subjects are covered?',
      answer: 'EZEXAM covers Math, Physics, and Chemistry for grades 10-12, with content specifically designed for university entrance exam preparation.',
      category: 'Content'
    },
    {
      id: '6',
      question: 'How do I report a technical issue?',
      answer: 'Use the contact form below or email us at support@ezexam.com with details about the issue. Include screenshots if possible.',
      category: 'Technical'
    }
  ];

  const filteredFAQs = faqData.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmitSupport = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Support request:', supportForm);
    // Reset form
    setSupportForm({ category: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg">
              <HelpCircle className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Help & Support
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Find answers to common questions or contact our support team for assistance. 
            We're here to help you succeed!
          </p>
        </div>

        {/* Enhanced Search */}
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm mb-8">
          <CardContent className="pt-8 pb-8">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search for help topics, questions, or solutions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 pl-12 text-lg rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-colors"
              />
            </div>
            {searchQuery && (
              <p className="text-center text-gray-600 mt-4">
                Found {filteredFAQs.length} result{filteredFAQs.length !== 1 ? 's' : ''} for "{searchQuery}"
              </p>
            )}
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Enhanced FAQ Section */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-800">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <HelpCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  Frequently Asked Questions
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Find quick answers to common questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredFAQs.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                      <Search className="h-10 w-10 text-gray-400" />
                    </div>
                    <p className="text-lg text-gray-500 mb-2">No results found for "{searchQuery}"</p>
                    <p className="text-gray-400">Try different keywords or browse our categories below</p>
                  </div>
                ) : (
                  <Accordion type="single" collapsible className="space-y-4">
                    {filteredFAQs.map((faq) => (
                      <AccordionItem key={faq.id} value={faq.id} className="border-2 border-gray-200 rounded-xl px-6 hover:border-blue-300 transition-colors">
                        <AccordionTrigger className="text-left py-6 hover:no-underline">
                          <div className="flex items-center gap-4 w-full">
                            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                              <Lightbulb className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-semibold text-gray-800">{faq.question}</span>
                            <Badge className="ml-auto bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
                              {faq.category}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-600 pb-6 leading-relaxed">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </CardContent>
            </Card>

            {/* Enhanced Contact Form */}
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-800">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <MessageCircle className="h-6 w-6 text-green-600" />
                  </div>
                  Contact Support
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Can't find what you're looking for? Send us a message and we'll get back to you within 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitSupport} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="category" className="text-sm font-semibold text-gray-700">Category</Label>
                      <select
                        id="category"
                        className="w-full h-12 p-3 border-2 border-gray-200 rounded-xl bg-white focus:border-blue-500 transition-colors"
                        value={supportForm.category}
                        onChange={(e) => setSupportForm(prev => ({ ...prev, category: e.target.value }))}
                        required
                        aria-label="Select a category"
                      >
                        <option value="">Select a category</option>
                        <option value="technical">Technical Issue</option>
                        <option value="account">Account Help</option>
                        <option value="content">Content Question</option>
                        <option value="billing">Billing Support</option>
                        <option value="feature">Feature Request</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="subject" className="text-sm font-semibold text-gray-700">Subject</Label>
                      <Input
                        id="subject"
                        placeholder="Brief description of your issue"
                        value={supportForm.subject}
                        onChange={(e) => setSupportForm(prev => ({ ...prev, subject: e.target.value }))}
                        required
                        className="h-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="message" className="text-sm font-semibold text-gray-700">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Describe your issue in detail..."
                      className="min-h-[140px] resize-none rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-colors"
                      value={supportForm.message}
                      onChange={(e) => setSupportForm(prev => ({ ...prev, message: e.target.value }))}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 rounded-xl text-lg">
                    <Send className="mr-3 h-5 w-5" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Quick Links & Contact Info */}
          <div className="space-y-8">
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-800">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Rocket className="h-5 w-5 text-purple-600" />
                  </div>
                  Quick Links
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="ghost" className="w-full justify-start h-12 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all duration-300" asChild>
                  <a href="/getting-started">
                    <BookOpen className="mr-3 h-5 w-5" />
                    Getting Started Guide
                  </a>
                </Button>
                <Button variant="ghost" className="w-full justify-start h-12 rounded-xl hover:bg-green-50 hover:text-green-600 transition-all duration-300" asChild>
                  <a href="/video-tutorials">
                    <Users className="mr-3 h-5 w-5" />
                    Video Tutorials
                  </a>
                </Button>
                <Button variant="ghost" className="w-full justify-start h-12 rounded-xl hover:bg-orange-50 hover:text-orange-600 transition-all duration-300" asChild>
                  <a href="/report-bug">
                    <Bug className="mr-3 h-5 w-5" />
                    Report a Bug
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-800">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Headphones className="h-5 w-5 text-blue-600" />
                  </div>
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                  <Mail className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-800">Email Support</p>
                    <p className="text-sm text-gray-600">support@ezexam.com</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
                  <Phone className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-semibold text-gray-800">Phone Support</p>
                    <p className="text-sm text-gray-600">+1 (555) 123-EXAM</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl">
                  <Clock className="h-6 w-6 text-orange-600" />
                  <div>
                    <p className="font-semibold text-gray-800">Support Hours</p>
                    <p className="text-sm text-gray-600">Mon-Fri: 9AM-6PM EST</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-2xl border-0 bg-gradient-to-r from-blue-50 to-purple-50">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <MessageCircle className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Need Immediate Help?</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Join our community chat for real-time support from other students and moderators.
                </p>
                <Button size="lg" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 rounded-xl">
                  <Users className="mr-3 h-5 w-5" />
                  Join Community Chat
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}