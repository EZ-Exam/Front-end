import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save } from 'lucide-react';
import { mockQuestionSets } from '@/data/mockData';

export function CreateMockTestPage() {
  const navigate = useNavigate();
  const [mockTestForm, setMockTestForm] = useState({
    title: '',
    description: '',
    subject: '',
    difficulty: '',
    duration: '',
    selectedQuestionSets: [] as string[]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating mock test:', mockTestForm);
    // Here you would save to backend
    navigate('/mock-tests');
  };

  const availableQuestionSets = mockQuestionSets.filter(qs => 
    !mockTestForm.subject || qs.subject === mockTestForm.subject
  );

  const toggleQuestionSet = (questionSetId: string) => {
    setMockTestForm(prev => ({
      ...prev,
      selectedQuestionSets: prev.selectedQuestionSets.includes(questionSetId)
        ? prev.selectedQuestionSets.filter(id => id !== questionSetId)
        : [...prev.selectedQuestionSets, questionSetId]
    }));
  };

  const totalQuestions = mockTestForm.selectedQuestionSets.reduce((total, setId) => {
    const questionSet = mockQuestionSets.find(qs => qs.id === setId);
    return total + (questionSet?.questions.length || 0);
  }, 0);

  return (
    <div className="space-y-6 flex flex-col items-center">
      <div className="flex items-center gap-4 w-full">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/mock-tests">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Mock Tests
          </Link>
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl w-full space-y-6">
      <h1 className="text-3xl font-bold">Create Mock Test</h1>
        <Card>
          <CardHeader>
            <CardTitle>Mock Test Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={mockTestForm.title}
                  onChange={(e) => setMockTestForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter mock test title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Select value={mockTestForm.subject} onValueChange={(value) => setMockTestForm(prev => ({ ...prev, subject: value, selectedQuestionSets: [] }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Math">Math</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty *</Label>
                <Select value={mockTestForm.difficulty} onValueChange={(value) => setMockTestForm(prev => ({ ...prev, difficulty: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes) *</Label>
                <Input
                  id="duration"
                  type="number"
                  value={mockTestForm.duration}
                  onChange={(e) => setMockTestForm(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="90"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={mockTestForm.description}
                onChange={(e) => setMockTestForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this mock test covers"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Question Sets</CardTitle>
            <p className="text-sm text-gray-600">
              Select question sets to include in this mock test. Total questions: {totalQuestions}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {!mockTestForm.subject && (
              <p className="text-sm text-gray-500">
                Select a subject first to see available question sets.
              </p>
            )}
            
            {mockTestForm.subject && availableQuestionSets.length === 0 && (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 mb-2">
                  No question sets available for {mockTestForm.subject}.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/create-question-set">
                    Create Question Set
                  </Link>
                </Button>
              </div>
            )}
            
            {availableQuestionSets.length > 0 && (
              <div className="space-y-3">
                {availableQuestionSets.map((questionSet) => (
                  <div key={questionSet.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <Checkbox
                      checked={mockTestForm.selectedQuestionSets.includes(questionSet.id)}
                      onCheckedChange={() => toggleQuestionSet(questionSet.id)}
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{questionSet.title}</h4>
                      <p className="text-sm text-gray-600">{questionSet.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {questionSet.questions.length} questions
                        </span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {questionSet.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {mockTestForm.selectedQuestionSets.length === 0 && mockTestForm.subject && (
              <p className="text-sm text-orange-600">
                Please select at least one question set for your mock test.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link to="/mock-tests">Cancel</Link>
          </Button>
          <Button 
            type="submit" 
            disabled={mockTestForm.selectedQuestionSets.length === 0}
          >
            <Save className="mr-2 h-4 w-4" />
            Create Mock Test
          </Button>
        </div>
      </form>
    </div>
  );
}