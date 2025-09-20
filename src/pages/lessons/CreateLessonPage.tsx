import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import { mockQuestionSets } from '@/data/mockData';

export function CreateLessonPage() {
  const navigate = useNavigate();
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    subject: '',
    difficulty: '',
    duration: '',
    questionSetId: '',
    pdfFile: null as File | null
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating lesson:', lessonForm);
    // Here you would save to backend
    navigate('/lessons');
  };

  const availableQuestionSets = mockQuestionSets.filter(qs => 
    !lessonForm.subject || qs.subject === lessonForm.subject
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/lessons">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Lessons
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Create New Lesson</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Lesson Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter lesson title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Select value={lessonForm.subject} onValueChange={(value) => setLessonForm(prev => ({ ...prev, subject: value, questionSetId: '' }))}>
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
                <Select value={lessonForm.difficulty} onValueChange={(value) => setLessonForm(prev => ({ ...prev, difficulty: value }))}>
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
                  value={lessonForm.duration}
                  onChange={(e) => setLessonForm(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="30"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={lessonForm.description}
                onChange={(e) => setLessonForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this lesson covers"
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lesson Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pdf">PDF File *</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <Input
                  id="pdf"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setLessonForm(prev => ({ ...prev, pdfFile: e.target.files?.[0] || null }))}
                  className="hidden"
                  required
                />
                <Label htmlFor="pdf" className="cursor-pointer">
                  <span className="text-blue-600 hover:text-blue-700">Click to upload PDF</span>
                  <span className="text-gray-500"> or drag and drop</span>
                </Label>
                {lessonForm.pdfFile && (
                  <p className="mt-2 text-sm text-green-600">
                    Selected: {lessonForm.pdfFile.name}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quiz Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="questionSet">Select Question Set *</Label>
              <Select 
                value={lessonForm.questionSetId} 
                onValueChange={(value) => setLessonForm(prev => ({ ...prev, questionSetId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a question set for this lesson" />
                </SelectTrigger>
                <SelectContent>
                  {availableQuestionSets.map((questionSet) => (
                    <SelectItem key={questionSet.id} value={questionSet.id}>
                      {questionSet.title} ({questionSet.questions.length} questions)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {!lessonForm.subject && (
              <p className="text-sm text-gray-500">
                Select a subject first to see available question sets.
              </p>
            )}
            
            {lessonForm.subject && availableQuestionSets.length === 0 && (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 mb-2">
                  No question sets available for {lessonForm.subject}.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/create-question-set">
                    Create Question Set
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link to="/lessons">Cancel</Link>
          </Button>
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            Create Lesson
          </Button>
        </div>
      </form>
    </div>
  );
}