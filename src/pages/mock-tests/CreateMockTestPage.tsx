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
import { ArrowLeft, Save, Lock } from 'lucide-react';
import { useAuth } from '@/pages/auth/AuthContext';
import { SubscriptionUtils } from '@/lib/subscription';
// import { mockQuestionSets } from '@/data/mockData';
import api from '@/services/axios';
import { useToast } from '@/contexts/ToastContext';

export function CreateMockTestPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Global loading hook
  const { withLoading } = useGlobalLoading();
  const { success, error } = useToast();

  // Kiểm tra quyền truy cập
  if (!SubscriptionUtils.canCreateMockTest(user)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="p-4 bg-red-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Lock className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800 mb-2">
              Tính năng bị khóa
            </CardTitle>
            <p className="text-gray-600">
              Bạn cần nâng cấp lên gói PREMIUM để tạo Mock Test
            </p>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4">
              <h3 className="font-semibold text-orange-800 mb-2">Subscription hiện tại:</h3>
              <p className="text-orange-700 font-bold">
                {SubscriptionUtils.getDisplaySubscriptionLevel(user)}
              </p>
            </div>
            <div className="space-y-2">
              <Button 
                onClick={() => navigate('/profile')}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Nâng cấp Subscription
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/mock-tests')}
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại Mock Tests
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const [mockTestForm, setMockTestForm] = useState({
    name: '',
    description: '',
    duration: '',
    subjectId: '' as unknown as number | '' ,
    gradeId: undefined as number | undefined,
    semesterId: undefined as number | undefined,
    chapterId: undefined as number | undefined,
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
  const [semesterOptions, setSemesterOptions] = useState<Array<{ id: number; name: string }>>([]);
  const [chapterOptions, setChapterOptions] = useState<Array<{ id: number; name: string }>>([]);

  // Helper function to check if subject is selected
  const isSubjectSelected = () => {
    const subjectId = mockTestForm.subjectId;
    return subjectId !== '' && subjectId != null;
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      // Chỉ fetch khi đã chọn lesson
      const lessonId = mockTestForm.lessonId;
      if (lessonId === '' || lessonId == null) {
        setQuestions([]);
        return;
      }

      try {
        setQuestionsLoading(true);
        setQuestionsError(null);
        console.log('Fetching questions for lessonId:', lessonId);
        const res = await api.get(`/questions`, { params: { lessonId } });
        console.log('Full API Response:', res);
        console.log('API Response data:', res.data);
        console.log('Response structure:', {
          data: res.data,
          isArray: Array.isArray(res.data),
          hasItems: res.data?.items,
          itemsIsArray: Array.isArray(res.data?.items)
        });
        
        // Thử nhiều cách để lấy dữ liệu
        let items = [];
        if (Array.isArray(res.data)) {
          items = res.data;
          console.log('Using res.data directly (array)');
        } else if (Array.isArray(res.data?.items)) {
          items = res.data.items;
          console.log('Using res.data.items');
        } else if (Array.isArray(res.data?.data)) {
          items = res.data.data;
          console.log('Using res.data.data');
        } else if (res.data?.questions && Array.isArray(res.data.questions)) {
          items = res.data.questions;
          console.log('Using res.data.questions');
        } else {
          console.log('No valid data structure found. Available keys:', Object.keys(res.data || {}));
        }
        
        console.log('Extracted items:', items);
        console.log('Items length:', items.length);
        
        // Map fields including CorrectAnswer and options
        const mapped = items.map((q: any) => ({ 
          id: q.id, 
          content: q.content,
          CorrectAnswer: q.CorrectAnswer,
          options: q.options
        }));
        console.log('Mapped questions:', mapped);
        console.log('Setting questions with length:', mapped.length);
        setQuestions(mapped);
      } catch (err: any) {
        console.error('Failed to fetch questions', err);
        console.error('Error details:', {
          message: err.message,
          response: err.response,
          status: err.response?.status,
          data: err.response?.data
        });
        setQuestionsError(err?.response?.data?.message || 'Không thể tải danh sách câu hỏi');
      } finally {
        setQuestionsLoading(false);
      }
    };

    fetchQuestions();
  }, [mockTestForm.lessonId]);

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


  // Dependent selects similar to Create Question/Lesson flows
  useEffect(() => {
    const fetchSemesters = async () => {
      if (!mockTestForm.gradeId) {
        setSemesterOptions([]);
        setMockTestForm(prev => ({ ...prev, semesterId: undefined }));
        return;
      }
      try {
        const res = await api.get(`/semesters/by-grade/${mockTestForm.gradeId}`);
        setSemesterOptions(res.data || []);
      } catch {
        setSemesterOptions([]);
      }
    };
    fetchSemesters();
  }, [mockTestForm.gradeId]);

  useEffect(() => {
    const fetchChapters = async () => {
      if (!mockTestForm.semesterId || !mockTestForm.subjectId) {
        setChapterOptions([]);
        setMockTestForm(prev => ({ ...prev, chapterId: undefined }));
        return;
      }
      try {
        const res = await api.get(`/chapters/semester/${mockTestForm.semesterId}/subject/${mockTestForm.subjectId}`);
        setChapterOptions(res.data || []);
      } catch {
        setChapterOptions([]);
      }
    };
    fetchChapters();
  }, [mockTestForm.semesterId, mockTestForm.subjectId]);

  useEffect(() => {
    const fetchLessons = async () => {
      if (!mockTestForm.chapterId) {
        setLessons([]);
        setMockTestForm(prev => ({ ...prev, lessonId: '' as unknown as number | '' }));
        return;
      }
      try {
        const res = await api.get(`/lessons/by-chapter/${mockTestForm.chapterId}`);
        const items = Array.isArray(res?.data?.items) ? res.data.items : (Array.isArray(res?.data) ? res.data : []);
        setLessons(items.map((x: any) => ({ id: Number(x.id), name: x.name ?? x.title ?? `${x.id}` })));
      } catch {
        setLessons([]);
      }
    };
    fetchLessons();
  }, [mockTestForm.chapterId]);

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
        success("Tạo bài thi thử thành công!", "Thành công");
        
        // Delay navigation to allow toast to show
        setTimeout(() => {
          navigate('/mock-tests');
        }, 1000);
        
      } catch (err: any) {
        console.error('Error creating mock test:', err);
        console.log('Showing error toast...');
        error("Tạo bài thi thử thất bại. Vui lòng thử lại.", "Lỗi");
      }
    }, "Đang tạo bài thi thử mới...");
  };

  // const availableQuestionSets = mockQuestionSets; // no longer used

  // Deprecated with direct question selection flow

  const totalSelectedQuestions = selectedQuestionIds.length;

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
                <Select value={mockTestForm.subjectId === '' ? undefined : String(mockTestForm.subjectId)} onValueChange={(v) => setMockTestForm(prev => ({ ...prev, subjectId: v ? Number(v) : '', gradeId: undefined, semesterId: undefined, chapterId: undefined, lessonId: '' as unknown as number | '' }))}>
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
                <Label htmlFor="gradeId">Grade *</Label>
                <Select 
                  value={mockTestForm.gradeId?.toString() ?? ''}
                  onValueChange={(v) => setMockTestForm(prev => ({ ...prev, gradeId: Number(v), semesterId: undefined, chapterId: undefined, lessonId: '' as unknown as number | '' }))}
                  disabled={!mockTestForm.subjectId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">10</SelectItem>
                    <SelectItem value="2">11</SelectItem>
                    <SelectItem value="3">12</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="semesterId">Semester *</Label>
                <Select 
                  value={mockTestForm.semesterId?.toString() ?? ''}
                  onValueChange={(v) => setMockTestForm(prev => ({ ...prev, semesterId: Number(v), chapterId: undefined, lessonId: '' as unknown as number | '' }))}
                  disabled={!mockTestForm.gradeId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {semesterOptions.map(s => (
                      <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="chapterId">Chapter *</Label>
                <Select 
                  value={mockTestForm.chapterId?.toString() ?? ''}
                  onValueChange={(v) => setMockTestForm(prev => ({ ...prev, chapterId: Number(v), lessonId: '' as unknown as number | '' }))}
                  disabled={!mockTestForm.semesterId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select chapter" />
                  </SelectTrigger>
                  <SelectContent className="max-h-48 overflow-y-auto">
                    {chapterOptions.map(c => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lessonId">Lesson *</Label>
              <Select value={mockTestForm.lessonId === '' ? undefined : String(mockTestForm.lessonId)} onValueChange={(v) => setMockTestForm(prev => ({ ...prev, lessonId: v ? Number(v) : '' }))} disabled={!mockTestForm.chapterId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select lesson" />
                </SelectTrigger>
                <SelectContent className="max-h-48 overflow-y-auto">
                  {lessons.map(l => (
                    <SelectItem key={l.id} value={String(l.id)}>{l.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {lessonName && <p className="text-sm text-gray-600">Lesson: {lessonName}</p>}
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
            {questionsError && <p className="text-red-600">{questionsError} (Debug: error = {questionsError})</p>}
            {!questionsLoading && !questionsError && !isSubjectSelected() && (
              <p className="text-sm text-gray-500">Vui lòng chọn môn học để xem danh sách câu hỏi.</p>
            )}
            {!questionsLoading && !questionsError && isSubjectSelected() && questions.length === 0 && (
              <div>
                <p className="text-sm text-gray-500">Không có câu hỏi nào cho môn học này.</p>
              </div>
            )}
            {!questionsLoading && !questionsError && isSubjectSelected() && questions.length > 0 && (
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
            {!isSubjectSelected() && (
              <p className="text-sm text-orange-600">Vui lòng chọn môn học trước.</p>
            )}
            {isSubjectSelected() && selectedQuestionIds.length === 0 && (
              <p className="text-sm text-orange-600">Vui lòng chọn ít nhất một câu hỏi.</p>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link to="/mock-tests">Cancel</Link>
          </Button>
          <Button 
            type="submit" 
            disabled={!isSubjectSelected() || selectedQuestionIds.length === 0}
          >
            <Save className="mr-2 h-4 w-4" />
            Create Mock Test
          </Button>
        </div>
      </form>
    </div>
  );
}