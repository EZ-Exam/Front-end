import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Plus, BookOpen, HelpCircle, FileText, MessageSquare} from 'lucide-react';
import { Link } from 'react-router-dom';

export function CreateContentDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDialog, setActiveDialog] = useState<'single-question' | null>(null);
  const [singleQuestionForm, setSingleQuestionForm] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    subject: '',
    difficulty: '',
    grade: '',
    semester: '',
    chapter: '',
    lesson: '',
    questionSource: '',
  });

  const handleCreateSingleQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating single question:', singleQuestionForm);
    setActiveDialog(null);
    setSingleQuestionForm({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      subject: '',
      difficulty: '',
      grade: '',
      semester: '',
      chapter: '',
      lesson: '',
      questionSource: '',
    });
  };

  const updateSingleQuestionOption = (index: number, value: string) => {
    const newOptions = [...singleQuestionForm.options];
    newOptions[index] = value;
    setSingleQuestionForm(prev => ({ ...prev, options: newOptions }));
  };

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="relative">
            <Plus className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem className='text-[#646cff]' onClick={() => { setActiveDialog('single-question'); setIsOpen(false); }}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Create Question
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/create-question-set" onClick={() => setIsOpen(false)}>
              <HelpCircle className="mr-2 h-4 w-4" />
              Create Question Set
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/create-lesson" onClick={() => setIsOpen(false)}>
            <BookOpen className="mr-2 h-4 w-4" />
            Create Lesson
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/create-mock-test" onClick={() => setIsOpen(false)}>
            <FileText className="mr-2 h-4 w-4" />
            Create Mock Test
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Single Question Creation Dialog */}
      <Dialog 
        open={activeDialog === 'single-question'} 
        onOpenChange={(open) => {
          if (!open) {
            setActiveDialog(null);
            setSingleQuestionForm({
              question: '',
              options: ['', '', '', ''],
              correctAnswer: 0,
              explanation: '',
              subject: '',
              difficulty: '',
              grade: '',
              semester: '',
              chapter: '',
              lesson: '',
              questionSource: '',
            });
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Question</DialogTitle>
            <DialogDescription>
              Add a new question to the question bank. This question will be available for use in question sets and mock tests.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreateSingleQuestion} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="question-text">Question</Label>
                <Textarea
                  id="question-text"
                  placeholder="Enter your question here..."
                  value={singleQuestionForm.question}
                  onChange={(e) => setSingleQuestionForm(prev => ({ ...prev, question: e.target.value }))}
                  className="min-h-[100px] resize-none"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject*</Label>
                  <Select 
                    value={singleQuestionForm.subject} 
                    onValueChange={(value) => setSingleQuestionForm(prev => ({ 
                      ...prev, 
                      subject: value,
                      grade: '',
                      semester: '',
                      chapter: '',
                      lesson: ''
                    }))}
                    required
                  >
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

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty*</Label>
                  <Select 
                    value={singleQuestionForm.difficulty} 
                    onValueChange={(value) => setSingleQuestionForm(prev => ({ ...prev, difficulty: value }))}
                    required
                  >
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
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="grade">Grade*</Label>
                  <Select 
                    value={singleQuestionForm.grade} 
                    onValueChange={(value) => setSingleQuestionForm(prev => ({ 
                      ...prev, 
                      grade: value,
                      semester: '',
                      chapter: '',
                      lesson: ''
                    }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Grade 10">Grade 10</SelectItem>
                      <SelectItem value="Grade 11">Grade 11</SelectItem>
                      <SelectItem value="Grade 12">Grade 12</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
              <Label htmlFor="semester">
                Semester*{" "}
                {!singleQuestionForm.grade && (
                  <span className="text-red-500 text-sm ml-2">
                    (Must choose Grade)
                  </span>
                )}
              </Label>
                  <Select 
                    value={singleQuestionForm.semester} 
                    onValueChange={(value) => setSingleQuestionForm(prev => ({ 
                      ...prev, 
                      semester: value,
                      chapter: '',
                      lesson: ''
                    }))}
                    disabled={!singleQuestionForm.grade}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Semester 1">Semester 1</SelectItem>
                      <SelectItem value="Semester 2">Semester 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="chapter">
                    Chapter*
                    {!singleQuestionForm.semester && (
                  <span className="text-red-500 text-sm ml-2">
                    (Must choose Semester)
                  </span>
                )}
                  </Label>
                  <Select 
                    value={singleQuestionForm.chapter} 
                    onValueChange={(value) => setSingleQuestionForm(prev => ({ 
                      ...prev, 
                      chapter: value,
                      lesson: ''
                    }))}
                    disabled={!singleQuestionForm.semester}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select chapter" />
                    </SelectTrigger>
                    <SelectContent className="max-h-48 overflow-y-auto">
                      <SelectItem value="Chapter 1">Chapter 1</SelectItem>
                      <SelectItem value="Chapter 2">Chapter 2</SelectItem>
                      <SelectItem value="Chapter 3">Chapter 3</SelectItem>
                      <SelectItem value="Chapter 4">Chapter 4</SelectItem>
                      <SelectItem value="Chapter 5">Chapter 5</SelectItem>
                      <SelectItem value="Chapter 6">Chapter 6</SelectItem>
                      <SelectItem value="Chapter 7">Chapter 7</SelectItem>
                      <SelectItem value="Chapter 8">Chapter 8</SelectItem>
                      <SelectItem value="Chapter 9">Chapter 9</SelectItem>
                      <SelectItem value="Chapter 10">Chapter 10</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lesson">
                    Lesson*
                    {!singleQuestionForm.chapter && (
                  <span className="text-red-500 text-sm ml-2">
                    (Must choose Chapter)
                  </span>
                    )}
                    </Label>
                  <Select 
                    value={singleQuestionForm.lesson} 
                    onValueChange={(value) => setSingleQuestionForm(prev => ({ ...prev, lesson: value }))}
                    disabled={!singleQuestionForm.chapter}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select lesson" />
                    </SelectTrigger>
                    <SelectContent className="max-h-48 overflow-y-auto">
                      <SelectItem value="Lesson 1">Lesson 1</SelectItem>
                      <SelectItem value="Lesson 2">Lesson 2</SelectItem>
                      <SelectItem value="Lesson 3">Lesson 3</SelectItem>
                      <SelectItem value="Lesson 4">Lesson 4</SelectItem>
                      <SelectItem value="Lesson 5">Lesson 5</SelectItem>
                      <SelectItem value="Lesson 6">Lesson 6</SelectItem>
                      <SelectItem value="Lesson 7">Lesson 7</SelectItem>
                      <SelectItem value="Lesson 8">Lesson 8</SelectItem>
                      <SelectItem value="Lesson 9">Lesson 9</SelectItem>
                      <SelectItem value="Lesson 10">Lesson 10</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
              <Label htmlFor="title">Question Source*</Label>
                <Input
                  id="title"
                  value={singleQuestionForm.questionSource}
                  onChange={(e) => setSingleQuestionForm(prev => ({ ...prev, questionSource: e.target.value }))}
                  placeholder="Enter question source"
                  required
                />
              </div>

              <div className="space-y-3">
                <Label>Answer Options</Label>
                {singleQuestionForm.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correctAnswer"
                        value={index}
                        checked={singleQuestionForm.correctAnswer === index}
                        onChange={(e) => setSingleQuestionForm(prev => ({ ...prev, correctAnswer: parseInt(e.target.value) }))}
                        className="h-4 w-4"
                        aria-label={`Select option ${String.fromCharCode(65 + index)} as correct answer`}
                      />
                    </div>
                    <Input
                      placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      value={option}
                      onChange={(e) => updateSingleQuestionOption(index, e.target.value)}
                      required
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="explanation">Explanation</Label>
                <Textarea
                  id="explanation"
                  placeholder="Explain why this answer is correct..."
                  value={singleQuestionForm.explanation}
                  onChange={(e) => setSingleQuestionForm(prev => ({ ...prev, explanation: e.target.value }))}
                  className="min-h-[80px] resize-none"
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setActiveDialog(null);
                  setSingleQuestionForm({
                    question: '',
                    options: ['', '', '', ''],
                    correctAnswer: 0,
                    explanation: '',
                    subject: '',
                    difficulty: '',
                    grade: '',
                    semester: '',
                    chapter: '',
                    lesson: '',
                    questionSource:'',
                  });
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                Create Question
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}