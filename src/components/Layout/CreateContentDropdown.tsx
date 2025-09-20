import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Plus, BookOpen, HelpCircle, FileText} from 'lucide-react';
import { Link } from 'react-router-dom';

export function CreateContentDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDialog, setActiveDialog] = useState<'lesson' | 'question' | 'mocktest' | null>(null);
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    subject: '',
    difficulty: '',
    pdfFile: null as File | null
  });
  const [questionForm, setQuestionForm] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    subject: ''
  });
  const [mocktestForm, setMocktestForm] = useState({
    title: '',
    subject: '',
    duration: '',
    difficulty: '',
    questions: [] as any[]
  });

  const handleCreateLesson = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating lesson:', lessonForm);
    setActiveDialog(null);
    setLessonForm({ title: '', description: '', subject: '', difficulty: '', pdfFile: null });
  };

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating question:', questionForm);
    setActiveDialog(null);
    setQuestionForm({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      subject: ''
    });
  };

  const handleCreateMocktest = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating mock test:', mocktestForm);
    setActiveDialog(null);
    setMocktestForm({
      title: '',
      subject: '',
      duration: '',
      difficulty: '',
      questions: []
    });
  };

  const updateQuestionOption = (index: number, value: string) => {
    const newOptions = [...questionForm.options];
    newOptions[index] = value;
    setQuestionForm(prev => ({ ...prev, options: newOptions }));
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
    </>
  );
}