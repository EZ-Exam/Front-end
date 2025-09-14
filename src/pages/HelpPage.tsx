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
  Bug
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
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Help & Support</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Find answers to common questions or contact our support team for assistance
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* FAQ Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Frequently Asked Questions
              </CardTitle>
              <CardDescription>
                Find quick answers to common questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredFAQs.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No results found for "{searchQuery}". Try different keywords.
                </p>
              ) : (
                <Accordion type="single" collapsible className="space-y-2">
                  {filteredFAQs.map((faq) => (
                    <AccordionItem key={faq.id} value={faq.id} className="border rounded-lg px-4">
                      <AccordionTrigger className="text-left">
                        <div className="flex items-center gap-3">
                          <span>{faq.question}</span>
                          <Badge variant="outline" className="ml-auto">
                            {faq.category}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-600">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>

          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Contact Support
              </CardTitle>
              <CardDescription>
                Can't find what you're looking for? Send us a message
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitSupport} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <select
                      id="category"
                      className="w-full p-2 border rounded-md bg-white"
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
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="Brief description of your issue"
                      value={supportForm.subject}
                      onChange={(e) => setSupportForm(prev => ({ ...prev, subject: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Describe your issue in detail..."
                    className="min-h-[120px] resize-none"
                    value={supportForm.message}
                    onChange={(e) => setSupportForm(prev => ({ ...prev, message: e.target.value }))}
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links & Contact Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="ghost" className="w-full justify-start" asChild>
                <a href="/getting-started">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Getting Started Guide
                </a>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <a href="/video-tutorials">
                  <Users className="mr-2 h-4 w-4" />
                  Video Tutorials
                </a>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <a href="/report-bug">
                  <Bug className="mr-2 h-4 w-4" />
                  Report a Bug
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Email Support</p>
                  <p className="text-sm text-gray-500">support@ezexam.com</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Phone Support</p>
                  <p className="text-sm text-gray-500">+1 (555) 123-EXAM</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium">Support Hours</p>
                  <p className="text-sm text-gray-500">Mon-Fri: 9AM-6PM EST</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6 text-center">
              <MessageCircle className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-medium mb-2">Need Immediate Help?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Join our community chat for real-time support from other students and moderators.
              </p>
              <Button size="sm" className="w-full">
                Join Community Chat
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}