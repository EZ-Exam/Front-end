import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useGlobalLoading } from '@/contexts/GlobalLoadingContext';
import { ArrowLeft, Save } from 'lucide-react';
// import { mockQuestionSets } from '@/data/mockData';
import api from '@/services/axios';
import { toast, ToastContainer } from 'react-toastify';

export function CreateMockTestPage() {
  const navigate = useNavigate();
  
  // Global loading hook
  const { withLoading } = useGlobalLoading();
  
  const [mockTestForm, setMockTestForm] = useState({
    name: '',
    description: '',
    duration: '',
    subjectId: '' as unknown as number | '' ,
    lessonId: '' as unknown as number | '' ,
    examTypeId: '' as unknown as number | '' ,
    createdByUserId: 1 as number,
    selectedQuestionSets: [] as string[]
  });

  // Questions fetched from API and selected IDs
  const [questions, setQuestions] = useState<Array<{ 
    id: number; 
    content: string; 
    CorrectAnswer?: string; 
    options?: string[] 
  }>>([]);
  const [questionsLoading, setQuestionsLoading] = useState<boolean>(false);
  const [questionsError, setQuestionsError] = useState<string | null>(null);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<number[]>([]);
  const [subjectName, setSubjectName] = useState<string>('');
  const [lessonName, setLessonName] = useState<string>('');
  const [examTypeName, setExamTypeName] = useState<string>('');

  // Get user ID from token
  const getUserIdFromToken = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return 1; // fallback
      
      // Decode JWT token (simple base64 decode for payload)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId || payload.id || payload.sub || 1;
    } catch {
      return 1; // fallback if token is invalid
    }
  };
  // Hardcoded subjects from DB
  const subjects = [
    { id: 1, name: 'Toán học', code: 'MATH' },
    { id: 2, name: 'Vật lý', code: 'PHYS' },
    { id: 3, name: 'Hóa học', code: 'CHEM' },
    { id: 4, name: 'Sinh học', code: 'BIO' },
    { id: 5, name: 'Ngữ văn', code: 'LIT' },
    { id: 6, name: 'Tiếng Anh', code: 'ENG' },
    { id: 7, name: 'Lịch sử', code: 'HIST' },
    { id: 8, name: 'Địa lý', code: 'GEO' }
  ];

  // Hardcoded exam types from DB
  const examTypes = [
    { id: 1, name: 'Mock Test' },
    { id: 2, name: 'AI-Gen Test' },
    { id: 3, name: 'User Test' }
  ];

  const [lessons, setLessons] = useState<Array<{ id: number; name: string }>>([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setQuestionsLoading(true);
        setQuestionsError(null);
        const res = await api.get('/questions');
        const items = Array.isArray(res?.data?.items) ? res.data.items : [];
        // Map fields including CorrectAnswer and options
        const mapped = items.map((q: any) => ({ 
          id: q.id, 
          content: q.content,
          CorrectAnswer: q.CorrectAnswer,
          options: q.options
        }));
        setQuestions(mapped);
      } catch (err: any) {
        console.error('Failed to fetch questions', err);
        setQuestionsError(err?.response?.data?.message || 'Không thể tải danh sách câu hỏi');
      } finally {
        setQuestionsLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  // Resolve names from IDs
  useEffect(() => {
    if (mockTestForm.subjectId === '' || mockTestForm.subjectId == null) {
      setSubjectName('');
      return;
    }
    const subject = subjects.find(s => s.id === mockTestForm.subjectId);
    setSubjectName(subject?.name ?? '');
  }, [mockTestForm.subjectId, subjects]);

  useEffect(() => {
    const fetchLesson = async () => {
      if (mockTestForm.lessonId === '' || mockTestForm.lessonId == null) {
        setLessonName('');
        return;
      }
      try {
        const res = await api.get(`/lessons/${mockTestForm.lessonId}`);
        setLessonName(res?.data?.name ?? res?.data?.title ?? '');
      } catch {
        setLessonName('');
      }
    };
    fetchLesson();
  }, [mockTestForm.lessonId]);

  useEffect(() => {
    if (mockTestForm.examTypeId === '' || mockTestForm.examTypeId == null) {
      setExamTypeName('');
      return;
    }
    const examType = examTypes.find(et => et.id === mockTestForm.examTypeId);
    setExamTypeName(examType?.name ?? '');
  }, [mockTestForm.examTypeId, examTypes]);


  // Fetch option lists for selects (only lessons now)
  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const res = await api.get('/lessons');
        const items = Array.isArray(res?.data?.items) ? res.data.items : (Array.isArray(res?.data) ? res.data : []);
        setLessons(items.map((x: any) => ({ id: Number(x.id), name: x.name ?? x.title ?? `${x.id}` })));
      } catch {
        setLessons([]);
      }
    };
    fetchLessons();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await withLoading(async () => {
      try {
        // Step 1: Create the exam
        const examResponse = await api.post('/exams', {
          name: mockTestForm.name,
          description: mockTestForm.description,
          duration: parseInt(mockTestForm.duration),
          subjectId: Number(mockTestForm.subjectId),
          lessonId: Number(mockTestForm.lessonId),
          examTypeId: Number(mockTestForm.examTypeId),
          createdByUserId: getUserIdFromToken()
        });
      
        const examId = examResponse.data.id;
        console.log('Exam created with ID:', examId);
        
        // Step 2: Add selected questions to the exam with order
        for (let i = 0; i < selectedQuestionIds.length; i++) {
          const qId = selectedQuestionIds[i];
          await api.post('/exams/questions', {
            examId: examId,
            questionId: qId,
            order: i + 1 // Order starts from 1 and increments for each question
          });
        }
        
        // Success - show toast and navigate
        console.log('Showing success toast...');
        toast.success("Mock test created successfully", {
          position: "top-center",
          theme: "light",
          autoClose: 3000
        });
        
        // Delay navigation to allow toast to show
        setTimeout(() => {
          navigate('/mock-tests');
        }, 1000);
        
      } catch (error) {
        console.error('Error creating mock test:', error);
        console.log('Showing error toast...');
        toast.error("Failed to create mock test. Please try again.", {
          position: "top-center",
          theme: "light",
          autoClose: 5000
        });
      }
    }, "Đang tạo bài thi thử mới...");
  };

  // const availableQuestionSets = mockQuestionSets; // no longer used

  // Deprecated with direct question selection flow

  const totalSelectedQuestions = selectedQuestionIds.length;

  return (
    <div className="space-y-6 flex flex-col items-center">
      <ToastContainer />
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
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={mockTestForm.name}
                onChange={(e) => setMockTestForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter exam name"
                required
              />
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

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subjectId">Subject *</Label>
                <Select value={mockTestForm.subjectId === '' ? undefined : String(mockTestForm.subjectId)} onValueChange={(v) => setMockTestForm(prev => ({ ...prev, subjectId: v ? Number(v) : '' }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map(s => (
                      <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {subjectName && <p className="text-sm text-gray-600">Subject: {subjectName}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lessonId">Lesson *</Label>
                <Select value={mockTestForm.lessonId === '' ? undefined : String(mockTestForm.lessonId)} onValueChange={(v) => setMockTestForm(prev => ({ ...prev, lessonId: v ? Number(v) : '' }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select lesson" />
                  </SelectTrigger>
                  <SelectContent>
                    {lessons.map(l => (
                      <SelectItem key={l.id} value={String(l.id)}>{l.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {lessonName && <p className="text-sm text-gray-600">Lesson: {lessonName}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="examTypeId">Exam Type *</Label>
              <Select value={mockTestForm.examTypeId === '' ? undefined : String(mockTestForm.examTypeId)} onValueChange={(v) => setMockTestForm(prev => ({ ...prev, examTypeId: v ? Number(v) : '' }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select exam type" />
                </SelectTrigger>
                <SelectContent>
                  {examTypes.map(et => (
                    <SelectItem key={et.id} value={String(et.id)}>{et.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {examTypeName && <p className="text-sm text-gray-600">Exam type: {examTypeName}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Questions</CardTitle>
            <p className="text-sm text-gray-600">
              Select questions to include. Total selected: {totalSelectedQuestions}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {questionsLoading && <p>Đang tải danh sách câu hỏi...</p>}
            {questionsError && <p className="text-red-600">{questionsError}</p>}
            {!questionsLoading && !questionsError && questions.length === 0 && (
              <p className="text-sm text-gray-500">Không có câu hỏi nào.</p>
            )}
            {!questionsLoading && !questionsError && questions.length > 0 && (
              <div className="space-y-3">
                {questions.map((q) => (
                  <div key={q.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <Checkbox
                      checked={selectedQuestionIds.includes(q.id)}
                      onCheckedChange={() => {
                        setSelectedQuestionIds((prev) =>
                          prev.includes(q.id) ? prev.filter((id) => id !== q.id) : [...prev, q.id]
                        );
                      }}
                    />
                    <div className="flex-1">
                      <p className="text-sm">{q.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {selectedQuestionIds.length === 0 && (
              <p className="text-sm text-orange-600">Please select at least one question.</p>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link to="/mock-tests">Cancel</Link>
          </Button>
          <Button 
            type="submit" 
            disabled={selectedQuestionIds.length === 0}
          >
            <Save className="mr-2 h-4 w-4" />
            Create Mock Test
          </Button>
        </div>
      </form>
    </div>
  );
}