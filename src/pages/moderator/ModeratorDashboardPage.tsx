import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/pages/auth/AuthContext';
import { AdminQuestion, AdminExam, ApiResponse } from '@/types';
import { QuestionDetailModal } from '@/components/admin/QuestionDetailModal';
import { ExamDetailModal } from '@/components/admin/ExamDetailModal';
import { ModeratorSidebar } from '@/components/moderator/ModeratorSidebar';
import api from '@/services/axios';
import { uploadImgBBMultipleFile } from '@/services/imgBB';
import { useToast as useToastContext } from '@/contexts/ToastContext';
import { 
  RefreshCw,
  Search,
  Eye,
  Edit,
  Trash2,
  Plus,
  BookOpen,
  Brain,
  Sparkles,
  Upload,
  Save,
  Loader2,
  FileText
} from 'lucide-react';

// Subject mapping
const SUBJECT_NAMES: { [key: number]: string } = {
  1: 'Math', 
  2: 'Physics',
  3: 'Chemistry',
  4: 'Biology',
  5: 'Literature',
  6: 'English',
  7: 'History',
  8: 'Geography'
};

// Helper function to calculate pagination pages with ellipsis
const getPaginationPages = (currentPage: number, totalPages: number, maxVisible: number = 7): (number | 'ellipsis')[] => {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | 'ellipsis')[] = [];
  const halfVisible = Math.floor(maxVisible / 2);

  if (currentPage <= halfVisible + 1) {
    // Show first pages: 1, 2, 3, 4, 5, ..., totalPages
    for (let i = 1; i <= maxVisible - 2; i++) {
      pages.push(i);
    }
    if (totalPages > maxVisible - 1) {
      pages.push('ellipsis');
    }
    pages.push(totalPages);
  } else if (currentPage >= totalPages - halfVisible) {
    // Show last pages: 1, ..., totalPages-4, totalPages-3, totalPages-2, totalPages-1, totalPages
    pages.push(1);
    if (totalPages > maxVisible - 1) {
      pages.push('ellipsis');
    }
    for (let i = totalPages - (maxVisible - 3); i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // Show middle pages: 1, ..., currentPage-1, currentPage, currentPage+1, ..., totalPages
    pages.push(1);
    pages.push('ellipsis');
    for (let i = currentPage - 1; i <= currentPage + 1; i++) {
      pages.push(i);
    }
    pages.push('ellipsis');
    pages.push(totalPages);
  }

  return pages;
};

export function ModeratorDashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { success, error } = useToastContext();
  const [lessons, setLessons] = useState<any[]>([]);
  const [questions, setQuestions] = useState<AdminQuestion[]>([]);
  const [exams, setExams] = useState<AdminExam[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState<AdminQuestion | null>(null);
  const [selectedExam, setSelectedExam] = useState<AdminExam | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<any | null>(null);
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [examModalOpen, setExamModalOpen] = useState(false);
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [editQuestionDialogOpen, setEditQuestionDialogOpen] = useState(false);
  const [editExamDialogOpen, setEditExamDialogOpen] = useState(false);
  const [deleteQuestionDialogOpen, setDeleteQuestionDialogOpen] = useState(false);
  const [deleteExamDialogOpen, setDeleteExamDialogOpen] = useState(false);
  const [recoverExamDialogOpen, setRecoverExamDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<AdminQuestion | null>(null);
  const [examToDelete, setExamToDelete] = useState<AdminExam | null>(null);
  const [examToRecover, setExamToRecover] = useState<AdminExam | null>(null);
  const [activeTab, setActiveTab] = useState('lessons');
  
  // Create Question Dialog State
  const [createQuestionDialogOpen, setCreateQuestionDialogOpen] = useState(false);
  const [singleQuestionForm, setSingleQuestionForm] = useState({
    content: '',
    difficultyLevelId: undefined as number | undefined,
    subjectId: undefined as number | undefined,
    gradeId: undefined as number | undefined,
    semesterId: undefined as number | undefined,
    chapterId: undefined as number | undefined,
    lessonId: undefined as number | undefined,
    textbookId: undefined as number | undefined,
    imageFiles: [] as File[],
    image: '',
    formula: '',
    explanation: '',
    options: ['', ''],
    correctAnswerIndex: 0,
  });

  const [semesterOptions, setSemesterOptions] = useState<Array<{ id: number; name: string }>>([]);
  const [chapterOptions, setChapterOptions] = useState<Array<{ id: number; name: string }>>([]);
  const [lessonOptions, setLessonOptions] = useState<Array<{ id: number; name: string }>>([]);
  const [textbookOptions, setTextbookOptions] = useState<Array<{ id: number; name: string }>>([]);
  
  // Edit Question Form
  const [editQuestionForm, setEditQuestionForm] = useState({
    id: 0,
    content: '',
    difficultyLevelId: undefined as number | undefined,
    subjectId: undefined as number | undefined,
    gradeId: undefined as number | undefined,
    semesterId: undefined as number | undefined,
    chapterId: undefined as number | undefined,
    lessonId: undefined as number | undefined,
    textbookId: undefined as number | undefined,
    imageFiles: [] as File[],
    image: '',
    formula: '',
    explanation: '',
    options: ['', ''],
    correctAnswerIndex: 0,
  });

  // Edit Exam Form
  const [editExamForm, setEditExamForm] = useState({
    id: 0,
    name: '',
    description: '',
    duration: '',
    subjectId: '' as unknown as number | '',
    lessonId: '' as unknown as number | '',
    examTypeId: '' as unknown as number | '',
    isActive: true,
    isPublic: true,
  });
  

  // Create Lesson Dialog State
  const [createLessonDialogOpen, setCreateLessonDialogOpen] = useState(false);
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    subject: '',
    gradeId: undefined as number | undefined,
    semesterId: undefined as number | undefined,
    chapterId: undefined as number | undefined,
    lessonId: undefined as number | undefined,
    docFile: null as File | null
  });
  const [lessonSemesterOptions, setLessonSemesterOptions] = useState<Array<{ id: number; name: string }>>([]);
  const [lessonChapterOptions, setLessonChapterOptions] = useState<Array<{ id: number; name: string }>>([]);
  const [lessonLessonOptions, setLessonLessonOptions] = useState<Array<{ id: number; name: string }>>([]);
  const [lessonQuestions, setLessonQuestions] = useState<Array<{ id: number; content: string }>>([]);
  const [selectedLessonQuestionIds, setSelectedLessonQuestionIds] = useState<number[]>([]);
  const [isCreatingLesson, setIsCreatingLesson] = useState(false);

  // Create Mock Test Dialog State
  const [createMockTestDialogOpen, setCreateMockTestDialogOpen] = useState(false);
  const [mockTestForm, setMockTestForm] = useState({
    name: '',
    description: '',
    duration: '',
    subjectId: '' as unknown as number | '',
    gradeId: undefined as number | undefined,
    semesterId: undefined as number | undefined,
    chapterId: undefined as number | undefined,
    lessonId: '' as unknown as number | '',
    examTypeId: '' as unknown as number | '',
  });
  const [mockTestLessons, setMockTestLessons] = useState<Array<{ id: number; name: string }>>([]);
  const [mockTestQuestions, setMockTestQuestions] = useState<Array<{ id: number; content: string }>>([]);
  const [selectedMockTestQuestionIds, setSelectedMockTestQuestionIds] = useState<number[]>([]);
  const [mockTestQuestionsLoading, setMockTestQuestionsLoading] = useState(false);
  const [isCreatingMockTest, setIsCreatingMockTest] = useState(false);
  const [mockTestSemesterOptions, setMockTestSemesterOptions] = useState<Array<{ id: number; name: string }>>([]);
  const [mockTestChapterOptions, setMockTestChapterOptions] = useState<Array<{ id: number; name: string }>>([]);
  
  // Pagination states for each tab
  const [pageSize] = useState(10);
  
  // Separate pagination for each tab
  const [lessonsCurrentPage, setLessonsCurrentPage] = useState(1);
  const [questionsCurrentPage, setQuestionsCurrentPage] = useState(1);
  const [examsCurrentPage, setExamsCurrentPage] = useState(1);
  
  const [lessonsTotalItems, setLessonsTotalItems] = useState(0);
  const [lessonsTotalPages, setLessonsTotalPages] = useState(0);
  const [questionsTotalItems, setQuestionsTotalItems] = useState(0);
  const [questionsTotalPages, setQuestionsTotalPages] = useState(0);
  const [examsTotalItems, setExamsTotalItems] = useState(0);
  const [examsTotalPages, setExamsTotalPages] = useState(0);
  
  // Loading states for pagination
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [examsLoading, setExamsLoading] = useState(false);
  
  // Filter states
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedLessonSubject, setSelectedLessonSubject] = useState<string>('all');

  // Check if user is moderator
  useEffect(() => {
    if (user?.roleId !== '3') {
      toast({
        title: "Không có quyền truy cập",
        description: "Bạn không có quyền truy cập trang moderator",
        variant: "destructive"
      });
      return;
    }
    
    // Chỉ fetch data cho tab hiện tại
    fetchDataForActiveTab();
  }, [user]);

  // Refetch data when filters change - reset về page 1
  useEffect(() => {
    if (user?.roleId === '3') {
      if (activeTab === 'lessons') {
        setLessonsCurrentPage(1);
      } else if (activeTab === 'questions') {
        setQuestionsCurrentPage(1);
      } else if (activeTab === 'exams') {
        setExamsCurrentPage(1);
      }
    }
  }, [searchTerm, selectedSubject, selectedDifficulty, selectedLessonSubject]);

  // Refetch data when page changes or filters change for each tab
  useEffect(() => {
    if (user?.roleId === '3') {
      if (activeTab === 'lessons') {
        fetchLessonsData();
      } else if (activeTab === 'questions') {
        fetchQuestionsData();
      } else if (activeTab === 'exams') {
        fetchExamsData();
      }
    }
  }, [lessonsCurrentPage, questionsCurrentPage, examsCurrentPage, searchTerm, selectedSubject, selectedDifficulty, selectedLessonSubject]);

  // Fetch data cho tab hiện tại
  const fetchDataForActiveTab = () => {
    switch (activeTab) {
      case 'lessons':
        fetchLessonsData();
        break;
      case 'questions':
        fetchQuestionsData();
        break;
      case 'exams':
        fetchExamsData();
        break;
    }
  };

  const fetchLessonsData = async () => {
    try {
      setLessonsLoading(true);
      
      // Gọi API với phân trang
      const response = await api.get('/lessons-enhanced/paged', {
        params: {
          pageNumber: lessonsCurrentPage,
          pageSize: pageSize,
          subjectId: selectedLessonSubject !== 'all' ? parseInt(selectedLessonSubject) : undefined,
          search: searchTerm || undefined
        }
      });
      const lessonsData = response.data;
      setLessons(lessonsData.items || []);
      
      // Update pagination info từ server
      setLessonsTotalItems(lessonsData.totalItems || 0);
      setLessonsTotalPages(lessonsData.totalPages || 0);
      
    } catch (error) {
      console.error('Error fetching lessons:', error);
      toast({
        title: "Lỗi tải dữ liệu lessons",
        description: "Không thể tải danh sách bài học",
        variant: "destructive"
      });
    } finally {
      setLessonsLoading(false);
    }
  };

  const fetchQuestionsData = async () => {
    try {
      setQuestionsLoading(true);
      
      // Gọi API trực tiếp
      const response = await api.get<ApiResponse<AdminQuestion>>('/questions', {
        params: {
          pageNumber: questionsCurrentPage,
          pageSize: pageSize,
          search: searchTerm || undefined,
          difficultyLevel: selectedDifficulty !== 'all' ? selectedDifficulty : undefined
        }
      });
      const questionsData = response.data;
      setQuestions(questionsData.items);
      setQuestionsTotalItems(questionsData.totalItems);
      setQuestionsTotalPages(questionsData.totalPages);
      
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast({
        title: "Lỗi tải dữ liệu questions",
        description: "Không thể tải danh sách câu hỏi",
        variant: "destructive"
      });
    } finally {
      setQuestionsLoading(false);
    }
  };

  const fetchExamsData = async () => {
    try {
      setExamsLoading(true);
      
      // Gọi API trực tiếp
      const response = await api.get<ApiResponse<AdminExam>>('/exams', {
        params: {
          pageNumber: examsCurrentPage,
          pageSize: pageSize,
          search: searchTerm || undefined,
          subjectId: selectedSubject !== 'all' ? parseInt(selectedSubject) : undefined
        }
      });
      const examsData = response.data;
      setExams(examsData.items);
      setExamsTotalItems(examsData.totalItems);
      setExamsTotalPages(examsData.totalPages);
      
    } catch (error) {
      console.error('Error fetching exams:', error);
      toast({
        title: "Lỗi tải dữ liệu exams",
        description: "Không thể tải danh sách đề thi",
        variant: "destructive"
      });
    } finally {
      setExamsLoading(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    
    // Fetch data chỉ cho tab được chọn
    if (user?.roleId === '3') {
      switch (tab) {
        case 'lessons':
          setLessonsCurrentPage(1);
          fetchLessonsData();
          break;
        case 'questions':
          setQuestionsCurrentPage(1);
          fetchQuestionsData();
          break;
        case 'exams':
          setExamsCurrentPage(1);
          fetchExamsData();
          break;
      }
    }
  };

  // Handle Create Single Question
  const handleCreateSingleQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Required field validation
      if (!singleQuestionForm.content || singleQuestionForm.content.trim() === '') {
        error('Câu hỏi là bắt buộc', 'Thiếu thông tin');
        return;
      }
      if (!singleQuestionForm.subjectId) {
        error('Môn học là bắt buộc', 'Thiếu thông tin');
        return;
      }
      if (!singleQuestionForm.difficultyLevelId) {
        error('Độ khó là bắt buộc', 'Thiếu thông tin');
        return;
      }
      if (!singleQuestionForm.gradeId) {
        error('Khối lớp là bắt buộc', 'Thiếu thông tin');
        return;
      }
      if (!singleQuestionForm.semesterId) {
        error('Học kỳ là bắt buộc', 'Thiếu thông tin');
        return;
      }
      if (!singleQuestionForm.chapterId) {
        error('Chương là bắt buộc', 'Thiếu thông tin');
        return;
      }
      if (!singleQuestionForm.lessonId) {
        error('Bài học là bắt buộc', 'Thiếu thông tin');
        return;
      }
      if (!singleQuestionForm.textbookId) {
        error('Sách giáo khoa là bắt buộc', 'Thiếu thông tin');
        return;
      }

      const trimmedOptionsFull = singleQuestionForm.options.map(o => o.trim());
      const nonEmptyOptions = trimmedOptionsFull.filter(o => o.length > 0);
      if (nonEmptyOptions.length < 2) {
        error('Cần ít nhất 2 phương án trả lời', 'Thiếu thông tin');
        return;
      }
      const selectedOptionValue = trimmedOptionsFull[singleQuestionForm.correctAnswerIndex];
      if (!selectedOptionValue || selectedOptionValue.trim() === '') {
        error('Vui lòng chọn đáp án đúng hợp lệ', 'Thiếu thông tin');
        return;
      }
      if (!singleQuestionForm.explanation || singleQuestionForm.explanation.trim() === '') {
        error('Giải thích là bắt buộc', 'Thiếu thông tin');
        return;
      }

      // Upload image(s) only after validation
      let imageUrl: string | null = null;
      if (singleQuestionForm.imageFiles && singleQuestionForm.imageFiles.length > 0) {
        const urls = await uploadImgBBMultipleFile(singleQuestionForm.imageFiles);
        const firstUrl = (urls?.filter(Boolean) as string[])[0];
        imageUrl = firstUrl ?? null;
      }

      const payload = {
        content: singleQuestionForm.content,
        difficultyLevelId: singleQuestionForm.difficultyLevelId,
        subjectId: singleQuestionForm.subjectId,
        gradeId: singleQuestionForm.gradeId,
        semesterId: singleQuestionForm.semesterId,
        chapterId: singleQuestionForm.chapterId,
        lessonId: singleQuestionForm.lessonId,
        textbookId: singleQuestionForm.textbookId,
        image: imageUrl,
        createdByUserId: user?.id ? Number(user.id) : undefined,
        questionSource: 'manual',
        questionType: 'multiple-choice',
        formula: singleQuestionForm.formula && singleQuestionForm.formula.trim() !== '' ? singleQuestionForm.formula : null,
        explanation: singleQuestionForm.explanation,
        options: nonEmptyOptions,
        correctAnswer: selectedOptionValue,
      };

      const response = await api.post('/questions', payload);
      if (response.status >= 200 && response.status < 300) {
        success('Tạo câu hỏi thành công!', 'Thành công');
        
        // Refresh questions list if on questions tab
        if (activeTab === 'questions') {
          fetchQuestionsData();
        }
      }

      // Reset form
      setCreateQuestionDialogOpen(false);
      setSingleQuestionForm({
        content: '',
        difficultyLevelId: undefined,
        subjectId: undefined,
        gradeId: undefined,
        semesterId: undefined,
        chapterId: undefined,
        lessonId: undefined,
        textbookId: undefined,
        imageFiles: [],
        image: '',
        formula: '',
        explanation: '',
        options: ['', ''],
        correctAnswerIndex: 0,
      });
      setSemesterOptions([]);
      setChapterOptions([]);
      setLessonOptions([]);
      setTextbookOptions([]);
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.response?.data || error?.message || 'Tạo câu hỏi thất bại';
      console.error('Failed to create question', message);
      error(typeof message === 'string' ? message : 'Tạo câu hỏi thất bại', 'Lỗi');
    }
  };

  const updateSingleQuestionOption = (index: number, value: string) => {
    const newOptions = [...singleQuestionForm.options];
    newOptions[index] = value;
    setSingleQuestionForm(prev => ({ ...prev, options: newOptions }));
  };

  const resetCreateQuestionForm = () => {
    setSingleQuestionForm({
      content: '',
      difficultyLevelId: undefined,
      subjectId: undefined,
      gradeId: undefined,
      semesterId: undefined,
      chapterId: undefined,
      lessonId: undefined,
      textbookId: undefined,
      imageFiles: [],
      image: '',
      formula: '',
      explanation: '',
      options: ['', ''],
      correctAnswerIndex: 0,
    });
    setSemesterOptions([]);
    setChapterOptions([]);
    setLessonOptions([]);
    setTextbookOptions([]);
  };

  // Dependent selects for Create Question form
  useEffect(() => {
    const fetchSemesters = async () => {
      if (!singleQuestionForm.gradeId) {
        setSemesterOptions([]);
        setSingleQuestionForm(prev => ({ ...prev, semesterId: undefined }));
        return;
      }
      try {
        const res = await api.get(`/semesters/by-grade/${singleQuestionForm.gradeId}`);
        setSemesterOptions(res.data || []);
      } catch (err) {
        setSemesterOptions([]);
      }
    };
    fetchSemesters();
  }, [singleQuestionForm.gradeId]);

  useEffect(() => {
    const fetchChapters = async () => {
      if (!singleQuestionForm.semesterId || !singleQuestionForm.subjectId) {
        setChapterOptions([]);
        setSingleQuestionForm(prev => ({ ...prev, chapterId: undefined }));
        return;
      }
      try {
        const res = await api.get(`/chapters/semester/${singleQuestionForm.semesterId}/subject/${singleQuestionForm.subjectId}`);
        setChapterOptions(res.data || []);
      } catch (err) {
        setChapterOptions([]);
      }
    };
    fetchChapters();
  }, [singleQuestionForm.semesterId, singleQuestionForm.subjectId]);

  useEffect(() => {
    const fetchLessons = async () => {
      if (!singleQuestionForm.chapterId) {
        setLessonOptions([]);
        setSingleQuestionForm(prev => ({ ...prev, lessonId: undefined }));
        return;
      }
      try {
        const res = await api.get(`/lessons/by-chapter/${singleQuestionForm.chapterId}`);
        setLessonOptions(res.data || []);
      } catch (err) {
        setLessonOptions([]);
      }
    };
    fetchLessons();
  }, [singleQuestionForm.chapterId]);

  useEffect(() => {
    const fetchTextbooks = async () => {
      if (!singleQuestionForm.gradeId || !singleQuestionForm.subjectId) {
        setTextbookOptions([]);
        setSingleQuestionForm(prev => ({ ...prev, textbookId: undefined }));
        return;
      }
      console.log(singleQuestionForm.gradeId, singleQuestionForm.subjectId);
      try {
        const res = await api.get(`/text-books?gradeId=${singleQuestionForm.gradeId}&subjectId=${singleQuestionForm.subjectId}`);
        setTextbookOptions(res.data || []);
      } catch (err) {
        setTextbookOptions([]);
      }
    };
    fetchTextbooks();
  }, [singleQuestionForm.gradeId, singleQuestionForm.subjectId]);

  // Dependent selects for Create Lesson form
  useEffect(() => {
    const fetchLessonSemesters = async () => {
      if (!lessonForm.gradeId) {
        setLessonSemesterOptions([]);
        setLessonForm(prev => ({ ...prev, semesterId: undefined }));
        return;
      }
      try {
        const res = await api.get(`/semesters/by-grade/${lessonForm.gradeId}`);
        setLessonSemesterOptions(res.data || []);
      } catch (err) {
        setLessonSemesterOptions([]);
      }
    };
    fetchLessonSemesters();
  }, [lessonForm.gradeId]);

  useEffect(() => {
    const fetchLessonChapters = async () => {
      if (!lessonForm.semesterId || !lessonForm.subject) {
        setLessonChapterOptions([]);
        setLessonForm(prev => ({ ...prev, chapterId: undefined }));
        return;
      }
      try {
        const res = await api.get(`/chapters/semester/${lessonForm.semesterId}/subject/${lessonForm.subject}`);
        setLessonChapterOptions(res.data || []);
      } catch (err) {
        setLessonChapterOptions([]);
      }
    };
    fetchLessonChapters();
  }, [lessonForm.semesterId, lessonForm.subject]);

  useEffect(() => {
    const fetchLessonLessons = async () => {
      if (!lessonForm.chapterId) {
        setLessonLessonOptions([]);
        setLessonForm(prev => ({ ...prev, lessonId: undefined }));
        return;
      }
      try {
        const res = await api.get(`/lessons/by-chapter/${lessonForm.chapterId}`);
        setLessonLessonOptions(res.data || []);
      } catch (err) {
        setLessonLessonOptions([]);
      }
    };
    fetchLessonLessons();
  }, [lessonForm.chapterId]);

  // Fetch questions for lesson when lessonId changes
  useEffect(() => {
    const fetchLessonQuestions = async () => {
      if (!lessonForm.lessonId) {
        setLessonQuestions([]);
        setSelectedLessonQuestionIds([]);
        return;
      }
      try {
        const res = await api.get(`/questions?lessonId=${lessonForm.lessonId}`);
        setLessonQuestions(res.data?.items || []);
        setSelectedLessonQuestionIds([]);
      } catch (err) {
        console.error('Failed to fetch lesson questions:', err);
        setLessonQuestions([]);
        setSelectedLessonQuestionIds([]);
      }
    };
    fetchLessonQuestions();
  }, [lessonForm.lessonId]);

  // Fetch lessons for mock test
  useEffect(() => {
    const fetchMockTestLessons = async () => {
      try {
        const res = await api.get('/lessons');
        const items = Array.isArray(res?.data?.items) ? res.data.items : (Array.isArray(res?.data) ? res.data : []);
        setMockTestLessons(items.map((x: any) => ({ id: Number(x.id), name: x.name ?? x.title ?? `${x.id}` })));
      } catch {
        setMockTestLessons([]);
      }
    };
    fetchMockTestLessons();
  }, []);

  // Fetch questions for mock test when lesson changes
  useEffect(() => {
    const fetchMockTestQuestions = async () => {
      const lessonId = mockTestForm.lessonId;
      if (lessonId === '' || lessonId == null) {
        setMockTestQuestions([]);
        return;
      }

      try {
        setMockTestQuestionsLoading(true);
        const res = await api.get(`/questions?lessonId=${lessonId}`);
        let items = [];
        if (Array.isArray(res.data)) {
          items = res.data;
        } else if (Array.isArray(res.data?.items)) {
          items = res.data.items;
        }
        
        const mapped = items.map((q: any) => ({ 
          id: q.id, 
          content: q.content
        }));
        setMockTestQuestions(mapped);
      } catch (err: any) {
        console.error('Failed to fetch mock test questions', err);
      } finally {
        setMockTestQuestionsLoading(false);
      }
    };

    fetchMockTestQuestions();
  }, [mockTestForm.lessonId]);

  // Dependent selects for Create Mock Test dialog
  useEffect(() => {
    const fetchSemesters = async () => {
      if (!mockTestForm.gradeId) {
        setMockTestSemesterOptions([]);
        setMockTestForm(prev => ({ ...prev, semesterId: undefined }));
        return;
      }
      try {
        const res = await api.get(`/semesters/by-grade/${mockTestForm.gradeId}`);
        setMockTestSemesterOptions(res.data || []);
      } catch {
        setMockTestSemesterOptions([]);
      }
    };
    fetchSemesters();
  }, [mockTestForm.gradeId]);

  useEffect(() => {
    const fetchChapters = async () => {
      if (!mockTestForm.semesterId || !mockTestForm.subjectId) {
        setMockTestChapterOptions([]);
        setMockTestForm(prev => ({ ...prev, chapterId: undefined }));
        return;
      }
      try {
        const res = await api.get(`/chapters/semester/${mockTestForm.semesterId}/subject/${mockTestForm.subjectId}`);
        setMockTestChapterOptions(res.data || []);
      } catch {
        setMockTestChapterOptions([]);
      }
    };
    fetchChapters();
  }, [mockTestForm.semesterId, mockTestForm.subjectId]);

  useEffect(() => {
    const fetchLessons = async () => {
      if (!mockTestForm.chapterId) {
        setMockTestLessons([]);
        setMockTestForm(prev => ({ ...prev, lessonId: '' as unknown as number | '' }));
        return;
      }
      try {
        const res = await api.get(`/lessons/by-chapter/${mockTestForm.chapterId}`);
        const items = Array.isArray(res?.data?.items) ? res.data.items : (Array.isArray(res?.data) ? res.data : []);
        setMockTestLessons(items.map((x: any) => ({ id: Number(x.id), name: x.name ?? x.title ?? `${x.id}` })));
      } catch {
        setMockTestLessons([]);
      }
    };
    fetchLessons();
  }, [mockTestForm.chapterId]);

  const handleCreateQuestion = () => {
    setCreateQuestionDialogOpen(true);
  };

  const handleCreateLesson = () => {
    setCreateLessonDialogOpen(true);
  };

  // Handle Submit Create Lesson
  const handleSubmitCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingLesson(true);

    try {
        // Validate required fields
        if (!lessonForm.title || !lessonForm.description || !lessonForm.subject || !lessonForm.gradeId || !lessonForm.semesterId || !lessonForm.chapterId || !lessonForm.lessonId || !lessonForm.docFile) {
          error('Vui lòng điền đầy đủ các trường bắt buộc', 'Thiếu thông tin');
          return;
        }

        if (selectedLessonQuestionIds.length === 0) {
          error('Vui lòng chọn ít nhất một câu hỏi', 'Thiếu thông tin');
          return;
        }

        // Upload PDF file
        let docUrl = '';
        if (lessonForm.docFile) {
          try {
            const formData = new FormData();
            formData.append('file', lessonForm.docFile);
            
            const uploadResponse = await api.post('/document-blob/upload?folder=uploads', formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });
            
            if (uploadResponse.data && uploadResponse.data.publicUrl) {
              docUrl = uploadResponse.data.publicUrl;
            } else {
              throw new Error('No publicUrl in response');
            }
          } catch (uploadError) {
            console.error('Document upload error:', uploadError);
            error('Không thể upload tài liệu. Vui lòng thử lại.', 'Lỗi upload');
            return;
          }
        }

        // Prepare API payload
        const apiPayload = {
          title: lessonForm.title,
          description: lessonForm.description,
          subjectId: lessonForm.subject,
          pdfUrl: docUrl,
          questions: selectedLessonQuestionIds.map(id => id.toString())
        };

        // Call API
        await api.post('/lessons-enhanced', apiPayload);
        
        success('Tạo bài học thành công!', 'Thành công');

        // Refresh lessons list if on lessons tab
        if (activeTab === 'lessons') {
          fetchLessonsData();
        }

        // Reset form and close dialog
        setCreateLessonDialogOpen(false);
        setLessonForm({
          title: '',
          description: '',
          subject: '',
          gradeId: undefined,
          semesterId: undefined,
          chapterId: undefined,
          lessonId: undefined,
          docFile: null
        });
        setLessonSemesterOptions([]);
        setLessonChapterOptions([]);
        setLessonLessonOptions([]);
        setLessonQuestions([]);
        setSelectedLessonQuestionIds([]);

    } catch (err: any) {
      console.error('Error creating lesson:', err);
      error(err.response?.data?.message || 'Tạo bài học thất bại. Vui lòng thử lại.', 'Lỗi');
    } finally {
      setIsCreatingLesson(false);
    }
  };

  // Handle Submit Create Mock Test
  const handleSubmitCreateMockTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingMockTest(true);

    try {
        // Validate
        if (!mockTestForm.name || !mockTestForm.duration || !mockTestForm.subjectId || !mockTestForm.lessonId || !mockTestForm.examTypeId) {
          error('Vui lòng điền đầy đủ các trường bắt buộc', 'Thiếu thông tin');
          return;
        }

        if (selectedMockTestQuestionIds.length === 0) {
          error('Vui lòng chọn ít nhất một câu hỏi', 'Thiếu thông tin');
          return;
        }

        // Step 1: Create the exam
        const examResponse = await api.post('/exams', {
          name: mockTestForm.name,
          description: mockTestForm.description,
          duration: parseInt(mockTestForm.duration),
          subjectId: Number(mockTestForm.subjectId),
          lessonId: Number(mockTestForm.lessonId),
          examTypeId: Number(mockTestForm.examTypeId),
          createdByUserId: user?.id ? Number(user.id) : undefined
        });
      
        const examId = examResponse.data.id;
        
        // Step 2: Add selected questions to the exam with order
        for (let i = 0; i < selectedMockTestQuestionIds.length; i++) {
          const qId = selectedMockTestQuestionIds[i];
          await api.post('/exams/questions', {
            examId: examId,
            questionId: qId,
            order: i + 1
          });
        }
        
        success('Tạo bài thi thử thành công!', 'Thành công');
        
        // Refresh exams list if on exams tab
        if (activeTab === 'exams') {
          fetchExamsData();
        }

        // Reset form and close dialog
        setCreateMockTestDialogOpen(false);
        setMockTestForm({
          name: '',
          description: '',
          duration: '',
          subjectId: '',
          gradeId: undefined,
          semesterId: undefined,
          chapterId: undefined,
          lessonId: '',
          examTypeId: '',
        });
        setMockTestQuestions([]);
        setSelectedMockTestQuestionIds([]);
        
    } catch (err: any) {
      console.error('Error creating mock test:', err);
      error('Tạo bài thi thử thất bại. Vui lòng thử lại.', 'Lỗi');
    } finally {
      setIsCreatingMockTest(false);
    }
  };

  // Handle Edit Question
  const handleEditQuestion = (question: AdminQuestion) => {
    // Populate edit form with question data
    setEditQuestionForm({
      id: question.id,
      content: question.content || '',
      difficultyLevelId: question.difficultyLevelId,
      subjectId: undefined, // AdminQuestion không có subjectId
      gradeId: question.gradeId,
      semesterId: undefined, // AdminQuestion không có semesterId
      chapterId: question.chapterId,
      lessonId: question.lessonId,
      textbookId: question.textbookId,
      imageFiles: [],
      image: question.image || '',
      formula: question.formula || '',
      explanation: question.explanation || '',
      options: question.options || ['', ''],
      correctAnswerIndex: question.options?.indexOf(question.correctAnswer || '') || 0,
    });
    setEditQuestionDialogOpen(true);
  };


  const handleSubmitEditQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validation
      if (!editQuestionForm.content || editQuestionForm.content.trim() === '') {
        error('Câu hỏi là bắt buộc', 'Thiếu thông tin');
        return;
      }

      const trimmedOptionsFull = editQuestionForm.options.map(o => o.trim());
      const nonEmptyOptions = trimmedOptionsFull.filter(o => o.length > 0);
      if (nonEmptyOptions.length < 2) {
        error('Cần ít nhất 2 phương án trả lời', 'Thiếu thông tin');
        return;
      }

      const selectedOptionValue = trimmedOptionsFull[editQuestionForm.correctAnswerIndex];
      if (!selectedOptionValue || selectedOptionValue.trim() === '') {
        error('Vui lòng chọn đáp án đúng hợp lệ', 'Thiếu thông tin');
        return;
      }

      // Upload image if changed
      let imageUrl: string | null = editQuestionForm.image || null;
      if (editQuestionForm.imageFiles && editQuestionForm.imageFiles.length > 0) {
        const urls = await uploadImgBBMultipleFile(editQuestionForm.imageFiles);
        const firstUrl = (urls?.filter(Boolean) as string[])[0];
        imageUrl = firstUrl ?? null;
      }

      const payload = {
        id: editQuestionForm.id,
        content: editQuestionForm.content,
        difficultyLevelId: editQuestionForm.difficultyLevelId,
        subjectId: editQuestionForm.subjectId,
        chapterId: editQuestionForm.chapterId,
        lessonId: editQuestionForm.lessonId,
        textbookId: editQuestionForm.textbookId,
        image: imageUrl,
        questionSource: 'manual',
        questionType: 'multiple-choice',
        formula: editQuestionForm.formula && editQuestionForm.formula.trim() !== '' ? editQuestionForm.formula : null,
        explanation: editQuestionForm.explanation,
        options: nonEmptyOptions,
        correctAnswer: selectedOptionValue,
      };

      await api.put(`/questions/${editQuestionForm.id}`, payload);
      success('Cập nhật câu hỏi thành công!', 'Thành công');
      
      // Refresh questions list
      if (activeTab === 'questions') {
        fetchQuestionsData();
      }

      setEditQuestionDialogOpen(false);
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.response?.data || error?.message || 'Cập nhật câu hỏi thất bại';
      console.error('Failed to update question', message);
      error(typeof message === 'string' ? message : 'Cập nhật câu hỏi thất bại', 'Lỗi');
    }
  };

  // Handle Delete Question
  const handleDeleteQuestion = (question: AdminQuestion) => {
    setQuestionToDelete(question);
    setDeleteQuestionDialogOpen(true);
  };

  const confirmDeleteQuestion = async () => {
    if (!questionToDelete) return;

    try {
      await api.delete(`/questions/${questionToDelete.id}`);
      success('Xóa câu hỏi thành công!', 'Thành công');
      
      // Refresh questions list
      if (activeTab === 'questions') {
        fetchQuestionsData();
      }

      setDeleteQuestionDialogOpen(false);
      setQuestionToDelete(null);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Xóa câu hỏi thất bại';
      console.error('Failed to delete question', error);
      error(message, 'Lỗi');
    }
  };

  // Handle Edit Exam
  const handleEditExam = (exam: AdminExam) => {
    setEditExamForm({
      id: exam.id,
      name: exam.name || '',
      description: exam.description || '',
      duration: exam.duration?.toString() || '',
      subjectId: exam.subjectId || '',
      lessonId: exam.lessonId || '',
      examTypeId: exam.examTypeId || '',
      isActive: exam.isActive ?? true,
      isPublic: exam.isPublic ?? true,
    });
    setEditExamDialogOpen(true);
  };

  const handleSubmitEditExam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!editExamForm.name || !editExamForm.duration) {
        error('Vui lòng điền đầy đủ các trường bắt buộc', 'Thiếu thông tin');
        return;
      }

      const payload = {
        id: editExamForm.id,
        name: editExamForm.name,
        description: editExamForm.description,
        subjectId: Number(editExamForm.subjectId),
        lessonId: Number(editExamForm.lessonId),
        examTypeId: Number(editExamForm.examTypeId),
        timeLimit: parseInt(editExamForm.duration),
        totalQuestions: 0, // Keep existing
        totalMarks: 0, // Keep existing
        duration: parseInt(editExamForm.duration),
        testConfiguration: '',
        difficultyDistribution: '',
        topicDistribution: '',
        isAutoGenerated: false,
        generationSource: '',
        aiTestRecommendationId: null,
        isActive: editExamForm.isActive,
        isPublic: editExamForm.isPublic,
      };

      await api.put(`/exams/${editExamForm.id}`, payload);
      success('Cập nhật đề thi thành công!', 'Thành công');
      
      // Refresh exams list
      if (activeTab === 'exams') {
        fetchExamsData();
      }

      setEditExamDialogOpen(false);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Cập nhật đề thi thất bại';
      console.error('Failed to update exam', error);
      error(message, 'Lỗi');
    }
  };

  // Handle Delete Exam (Soft Delete)
  const handleDeleteExam = (exam: AdminExam) => {
    setExamToDelete(exam);
    setDeleteExamDialogOpen(true);
  };

  const confirmDeleteExam = async () => {
    if (!examToDelete) return;

    try {
      await api.put(`/exams/${examToDelete.id}/soft-delete`);
      success('Xóa đề thi thành công!', 'Thành công');
      
      // Refresh exams list
      if (activeTab === 'exams') {
        fetchExamsData();
      }

      setDeleteExamDialogOpen(false);
      setExamToDelete(null);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Xóa đề thi thất bại';
      console.error('Failed to delete exam', error);
      error(message, 'Lỗi');
    }
  };

  // Handle Recover Exam
  const handleRecoverExam = (exam: AdminExam) => {
    setExamToRecover(exam);
    setRecoverExamDialogOpen(true);
  };

  const confirmRecoverExam = async () => {
    if (!examToRecover) return;

    try {
      await api.put(`/exams/${examToRecover.id}/recover`);
      success('Khôi phục đề thi thành công!', 'Thành công');
      
      // Refresh exams list
      if (activeTab === 'exams') {
        fetchExamsData();
      }

      setRecoverExamDialogOpen(false);
      setExamToRecover(null);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Khôi phục đề thi thất bại';
      console.error('Failed to recover exam', error);
      error(message, 'Lỗi');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'lessons':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Lessons</h1>
              <p className="text-gray-400 mt-2">Quản lý bài học</p>
            </div>
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Danh sách Lessons</CardTitle>
                    <CardDescription className="text-gray-400">
                      Quản lý và theo dõi bài học trong hệ thống
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Tìm kiếm bài học..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 w-64 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      />
                    </div>
                    <Select value={selectedLessonSubject} onValueChange={setSelectedLessonSubject}>
                      <SelectTrigger className="w-40 bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder="Môn học" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="all" className="text-white hover:bg-gray-700">Tất cả môn học</SelectItem>
                        <SelectItem value="1" className="text-white hover:bg-gray-700">Toán</SelectItem>
                        <SelectItem value="2" className="text-white hover:bg-gray-700">Vật lý</SelectItem>
                        <SelectItem value="3" className="text-white hover:bg-gray-700">Hóa học</SelectItem>
                        <SelectItem value="4" className="text-white hover:bg-gray-700">Sinh học</SelectItem>
                        <SelectItem value="5" className="text-white hover:bg-gray-700">Ngữ văn</SelectItem>
                        <SelectItem value="6" className="text-white hover:bg-gray-700">Tiếng Anh</SelectItem>
                        <SelectItem value="7" className="text-white hover:bg-gray-700">Lịch sử</SelectItem>
                        <SelectItem value="8" className="text-white hover:bg-gray-700">Địa lý</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      onClick={fetchLessonsData} 
                      variant="outline" 
                      size="sm" 
                      className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="bg-green-600 border-green-600 text-white hover:bg-green-700"
                      onClick={handleCreateLesson}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Tạo Lesson
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">ID</TableHead>
                      <TableHead className="text-gray-300">Tiêu đề</TableHead>
                      <TableHead className="text-gray-300">Mô tả</TableHead>
                      <TableHead className="text-gray-300">Môn học</TableHead>
                      <TableHead className="text-gray-300">PDF</TableHead>
                      <TableHead className="text-gray-300">Số câu hỏi</TableHead>
                      <TableHead className="text-gray-300">Ngày tạo</TableHead>
                      <TableHead className="text-gray-300">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lessonsLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mr-3"></div>
                            <span className="text-gray-400">Đang tải dữ liệu...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : lessons.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <span className="text-gray-400">Không có dữ liệu</span>
                        </TableCell>
                      </TableRow>
                    ) : (
                      lessons.map((lesson) => (
                      <TableRow key={lesson.id} className="border-gray-700 hover:bg-gray-700">
                        <TableCell className="font-medium text-white">{lesson.id}</TableCell>
                        <TableCell className="font-medium text-white max-w-xs truncate" title={lesson.title}>
                          {lesson.title}
                        </TableCell>
                        <TableCell className="text-gray-300 max-w-xs truncate" title={lesson.description}>
                          {lesson.description || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-white border-gray-500">
                            {SUBJECT_NAMES[lesson.subjectId] || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {lesson.pdfUrl ? (
                            <a 
                              href={lesson.pdfUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:underline"
                            >
                              Xem PDF
                            </a>
                          ) : 'N/A'}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {lesson.questions?.length || 0}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {new Date(lesson.createdAt).toLocaleDateString('vi-VN')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                              onClick={() => {
                                setSelectedLesson(lesson);
                                setLessonModalOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                
                {/* Pagination */}
                {lessonsTotalPages > 1 && (
                  <div className="flex items-center justify-between px-2 py-4">
                    <div className="text-sm text-gray-400">
                      Hiển thị {((lessonsCurrentPage - 1) * pageSize) + 1} đến {Math.min(lessonsCurrentPage * pageSize, lessonsTotalItems)} của {lessonsTotalItems} kết quả
                    </div>
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (lessonsCurrentPage > 1) {
                                setLessonsCurrentPage(lessonsCurrentPage - 1);
                              }
                            }}
                            className={lessonsCurrentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                          />
                        </PaginationItem>
                        
                        {getPaginationPages(lessonsCurrentPage, lessonsTotalPages).map((page, index) => {
                          if (page === 'ellipsis') {
                            return (
                              <PaginationItem key={`ellipsis-${index}`}>
                                <span className="px-3 py-2 text-gray-400">...</span>
                              </PaginationItem>
                            );
                          }
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setLessonsCurrentPage(page);
                                }}
                                isActive={lessonsCurrentPage === page}
                                className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}
                        
                        <PaginationItem>
                          <PaginationNext 
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (lessonsCurrentPage < lessonsTotalPages) {
                                setLessonsCurrentPage(lessonsCurrentPage + 1);
                              }
                            }}
                            className={lessonsCurrentPage >= lessonsTotalPages ? 'pointer-events-none opacity-50' : ''}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 'questions':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Questions</h1>
              <p className="text-gray-400 mt-2">Quản lý câu hỏi</p>
            </div>
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Danh sách Questions</CardTitle>
                    <CardDescription className="text-gray-400">
                      Quản lý và theo dõi câu hỏi trong hệ thống
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Tìm kiếm câu hỏi..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 w-64 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      />
                    </div>
                    <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                      <SelectTrigger className="w-40 bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder="Độ khó" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="all" className="text-white hover:bg-gray-700">Tất cả độ khó</SelectItem>
                        <SelectItem value="1" className="text-white hover:bg-gray-700">Dễ</SelectItem>
                        <SelectItem value="2" className="text-white hover:bg-gray-700">Trung bình</SelectItem>
                        <SelectItem value="3" className="text-white hover:bg-gray-700">Khó</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="bg-purple-600 border-purple-600 text-white hover:bg-purple-700"
                      onClick={handleCreateQuestion}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Tạo Question
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">ID</TableHead>
                      <TableHead className="text-gray-300">Nội dung</TableHead>
                      <TableHead className="text-gray-300">Bài học</TableHead>
                      <TableHead className="text-gray-300">Chương</TableHead>
                      <TableHead className="text-gray-300">Độ khó</TableHead>
                      <TableHead className="text-gray-300">Loại</TableHead>
                      <TableHead className="text-gray-300">Người tạo</TableHead>
                      <TableHead className="text-gray-300">Ngày tạo</TableHead>
                      <TableHead className="text-gray-300">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {questionsLoading ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mr-3"></div>
                            <span className="text-gray-400">Đang tải dữ liệu...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      questions.map((question) => (
                      <TableRow key={question.id} className="border-gray-700 hover:bg-gray-700">
                        <TableCell className="font-medium text-white">{question.id}</TableCell>
                        <TableCell className="max-w-xs truncate text-gray-300" title={question.content}>
                          {question.content}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-white border-gray-500">
                            {question.lessonName || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {question.chapterName || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            question.difficultyLevelId === 1 ? 'default' :
                            question.difficultyLevelId === 2 ? 'secondary' : 'destructive'
                          }>
                            {question.difficultyLevelId === 1 ? 'Dễ' :
                             question.difficultyLevelId === 2 ? 'Trung bình' : 'Khó'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-white border-gray-500">
                            {question.type || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-300">{question.createdByUserName || 'N/A'}</TableCell>
                        <TableCell className="text-gray-300">{new Date(question.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                              onClick={() => {
                                setSelectedQuestion(question);
                                setQuestionModalOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="bg-blue-600 border-blue-600 text-white hover:bg-blue-700"
                              onClick={() => handleEditQuestion(question)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="bg-red-600 border-red-600 text-white hover:bg-red-700"
                              onClick={() => handleDeleteQuestion(question)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                
                {/* Pagination */}
                {questionsTotalPages > 1 && (
                  <div className="flex items-center justify-between px-2 py-4">
                    <div className="text-sm text-gray-400">
                      Hiển thị {((questionsCurrentPage - 1) * pageSize) + 1} đến {Math.min(questionsCurrentPage * pageSize, questionsTotalItems)} của {questionsTotalItems} kết quả
                    </div>
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (questionsCurrentPage > 1) {
                                setQuestionsCurrentPage(questionsCurrentPage - 1);
                              }
                            }}
                            className={questionsCurrentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                          />
                        </PaginationItem>
                        
                        {getPaginationPages(questionsCurrentPage, questionsTotalPages).map((page, index) => {
                          if (page === 'ellipsis') {
                            return (
                              <PaginationItem key={`ellipsis-${index}`}>
                                <span className="px-3 py-2 text-gray-400">...</span>
                              </PaginationItem>
                            );
                          }
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setQuestionsCurrentPage(page);
                                }}
                                isActive={questionsCurrentPage === page}
                                className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}
                        
                        <PaginationItem>
                          <PaginationNext 
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (questionsCurrentPage < questionsTotalPages) {
                                setQuestionsCurrentPage(questionsCurrentPage + 1);
                              }
                            }}
                            className={questionsCurrentPage >= questionsTotalPages ? 'pointer-events-none opacity-50' : ''}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 'exams':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Mock Tests</h1>
              <p className="text-gray-400 mt-2">Quản lý đề thi</p>
            </div>
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Danh sách Mock Tests</CardTitle>
                    <CardDescription className="text-gray-400">
                      Quản lý và theo dõi Mock Tests trong hệ thống
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Tìm kiếm Mock Tests..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 w-64 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      />
                    </div>
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                      <SelectTrigger className="w-40 bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder="Môn học" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="all" className="text-white hover:bg-gray-700">Tất cả môn học</SelectItem>
                        <SelectItem value="1" className="text-white hover:bg-gray-700">Toán</SelectItem>
                        <SelectItem value="2" className="text-white hover:bg-gray-700">Vật lý</SelectItem>
                        <SelectItem value="3" className="text-white hover:bg-gray-700">Hóa học</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      onClick={fetchExamsData} 
                      variant="outline" 
                      size="sm" 
                      className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="bg-orange-600 border-orange-600 text-white hover:bg-orange-700"
                      onClick={() => setCreateMockTestDialogOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Tạo Mock Test
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">ID</TableHead>
                      <TableHead className="text-gray-300">Tên đề thi</TableHead>
                      <TableHead className="text-gray-300">Môn học</TableHead>
                      <TableHead className="text-gray-300">Loại đề</TableHead>
                      <TableHead className="text-gray-300">Câu hỏi</TableHead>
                      <TableHead className="text-gray-300">Thời gian (phút)</TableHead>
                      <TableHead className="text-gray-300">Người tạo</TableHead>
                      <TableHead className="text-gray-300">Ngày tạo</TableHead>
                      <TableHead className="text-gray-300">Trạng thái</TableHead>
                      <TableHead className="text-gray-300">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {examsLoading ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mr-3"></div>
                            <span className="text-gray-400">Đang tải dữ liệu...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      exams.map((exam) => (
                      <TableRow key={exam.id} className="border-gray-700 hover:bg-gray-700">
                        <TableCell className="font-medium text-white">{exam.id}</TableCell>
                        <TableCell className="font-medium text-white" title={exam.description}>
                          {exam.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-white border-gray-500">
                            {exam.subjectName || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-white border-gray-500">
                            {exam.examTypeName || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-300">{exam.totalQuestions || 0}</TableCell>
                        <TableCell className="text-gray-300">{exam.duration || 0}</TableCell>
                        <TableCell className="text-gray-300">{exam.createdByUserName || 'N/A'}</TableCell>
                        <TableCell className="text-gray-300">{new Date(exam.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Badge variant={exam.isActive ? 'default' : 'destructive'} className="text-xs">
                              {exam.isActive ? 'Active' : 'Locked'}
                            </Badge>
                            {exam.isPublic && (
                              <Badge variant="outline" className="text-xs text-green-400 border-green-400">
                                Public
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                              onClick={() => {
                                setSelectedExam(exam);
                                setExamModalOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="bg-blue-600 border-blue-600 text-white hover:bg-blue-700"
                              onClick={() => handleEditExam(exam)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {exam.isActive ? (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="bg-red-600 border-red-600 text-white hover:bg-red-700"
                                onClick={() => handleDeleteExam(exam)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="bg-green-600 border-green-600 text-white hover:bg-green-700"
                                onClick={() => handleRecoverExam(exam)}
                                title="Khôi phục đề thi"
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                
                {/* Pagination */}
                {examsTotalPages > 1 && (
                  <div className="flex items-center justify-between px-2 py-4">
                    <div className="text-sm text-gray-400">
                      Hiển thị {((examsCurrentPage - 1) * pageSize) + 1} đến {Math.min(examsCurrentPage * pageSize, examsTotalItems)} của {examsTotalItems} kết quả
                    </div>
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (examsCurrentPage > 1) {
                                setExamsCurrentPage(examsCurrentPage - 1);
                              }
                            }}
                            className={examsCurrentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                          />
                        </PaginationItem>
                        
                        {getPaginationPages(examsCurrentPage, examsTotalPages).map((page, index) => {
                          if (page === 'ellipsis') {
                            return (
                              <PaginationItem key={`ellipsis-${index}`}>
                                <span className="px-3 py-2 text-gray-400">...</span>
                              </PaginationItem>
                            );
                          }
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setExamsCurrentPage(page);
                                }}
                                isActive={examsCurrentPage === page}
                                className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}
                        
                        <PaginationItem>
                          <PaginationNext 
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (examsCurrentPage < examsTotalPages) {
                                setExamsCurrentPage(examsCurrentPage + 1);
                              }
                            }}
                            className={examsCurrentPage >= examsTotalPages ? 'pointer-events-none opacity-50' : ''}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Moderator Panel</h1>
              <p className="text-gray-400 mt-2">Chọn một tab để quản lý nội dung</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <ModeratorSidebar activeTab={activeTab} onTabChange={handleTabChange} />
      
      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {renderContent()}
      </div>

      {/* Modals */}
      <QuestionDetailModal 
        question={selectedQuestion}
        isOpen={questionModalOpen}
        onClose={() => {
          setQuestionModalOpen(false);
          setSelectedQuestion(null);
        }}
      />
      
      <ExamDetailModal 
        exam={selectedExam}
        isOpen={examModalOpen}
        onClose={() => {
          setExamModalOpen(false);
          setSelectedExam(null);
        }}
      />

      {/* Lesson Detail Modal */}
      <Dialog 
        open={lessonModalOpen} 
        onOpenChange={(open) => {
          if (!open) {
            setLessonModalOpen(false);
            setSelectedLesson(null);
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-green-500" />
              Chi tiết Lesson
            </DialogTitle>
          </DialogHeader>
          
          {selectedLesson && (
            <div className="space-y-6 mt-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-400">ID</Label>
                  <p className="text-white font-medium">{selectedLesson.id}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-400">Môn học</Label>
                  <Badge variant="outline" className="text-white border-gray-500">
                    {SUBJECT_NAMES[selectedLesson.subjectId] || 'N/A'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-400">Tiêu đề</Label>
                <p className="text-white font-medium text-lg">{selectedLesson.title}</p>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-400">Mô tả</Label>
                <p className="text-gray-300">{selectedLesson.description || 'Không có mô tả'}</p>
              </div>

              {/* PDF Link */}
              {selectedLesson.pdfUrl && (
                <div className="space-y-2">
                  <Label className="text-gray-400">Tài liệu PDF</Label>
                  <div>
                    <a 
                      href={selectedLesson.pdfUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 hover:underline"
                    >
                      <FileText className="h-4 w-4" />
                      Xem tài liệu PDF
                    </a>
                  </div>
                </div>
              )}

              {/* Questions List */}
              <div className="space-y-2">
                <Label className="text-gray-400">Danh sách câu hỏi ({selectedLesson.questions?.length || 0})</Label>
                {selectedLesson.questions && selectedLesson.questions.length > 0 ? (
                  <div className="max-h-60 overflow-y-auto border border-gray-700 rounded-lg">
                    {selectedLesson.questions.map((question: any, index: number) => (
                      <div 
                        key={question.id || index} 
                        className="p-3 border-b border-gray-700 last:border-b-0 hover:bg-gray-700/50"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-gray-400 font-medium min-w-[30px]">#{index + 1}</span>
                          <div className="flex-1">
                            <p className="text-white">{question.content || 'Không có nội dung'}</p>
                            {question.difficultyLevelId && (
                              <Badge 
                                variant={
                                  question.difficultyLevelId === 1 ? 'default' :
                                  question.difficultyLevelId === 2 ? 'secondary' : 'destructive'
                                }
                                className="mt-2"
                              >
                                {question.difficultyLevelId === 1 ? 'Dễ' :
                                 question.difficultyLevelId === 2 ? 'Trung bình' : 'Khó'}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">Chưa có câu hỏi nào</p>
                )}
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
                <div className="space-y-2">
                  <Label className="text-gray-400">Ngày tạo</Label>
                  <p className="text-white">
                    {new Date(selectedLesson.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>
                {selectedLesson.updatedAt && (
                  <div className="space-y-2">
                    <Label className="text-gray-400">Cập nhật lần cuối</Label>
                    <p className="text-white">
                      {new Date(selectedLesson.updatedAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="mt-6">
            <Button 
              variant="outline" 
              onClick={() => {
                setLessonModalOpen(false);
                setSelectedLesson(null);
              }}
              className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Question Dialog */}
      <Dialog 
        open={createQuestionDialogOpen} 
        onOpenChange={(open) => {
          if (!open) {
            setCreateQuestionDialogOpen(false);
            resetCreateQuestionForm();
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-2xl">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              Create New Question
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-base">
              Add a new question to the question bank. This question will be available for use in question sets and mock tests.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreateSingleQuestion} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="question-text" className="text-sm font-semibold text-gray-700">Question*</Label>
                <Textarea
                  id="question-text"
                  value={singleQuestionForm.content}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSingleQuestionForm(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter your question here..."
                  rows={3}
                  required
                  className="border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject*</Label>
                  <Select 
                    value={singleQuestionForm.subjectId?.toString() ?? ''}
                    onValueChange={(value) => setSingleQuestionForm(prev => ({ 
                      ...prev, 
                      subjectId: Number(value),
                      gradeId: undefined,
                      semesterId: undefined,
                      chapterId: undefined,
                      lessonId: undefined,
                    }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Math</SelectItem>
                      <SelectItem value="2">Physics</SelectItem>
                      <SelectItem value="3">Chemistry</SelectItem>
                      <SelectItem value="4">Biology</SelectItem>
                      <SelectItem value="5">Literature</SelectItem>
                      <SelectItem value="6">English</SelectItem>
                      <SelectItem value="7">History</SelectItem>
                      <SelectItem value="8">Geography</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty*</Label>
                  <Select 
                    value={singleQuestionForm.difficultyLevelId?.toString() ?? ''}
                    onValueChange={(value) => setSingleQuestionForm(prev => ({ ...prev, difficultyLevelId: Number(value) }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Easy</SelectItem>
                      <SelectItem value="2">Medium</SelectItem>
                      <SelectItem value="3">Hard</SelectItem>
                      <SelectItem value="4">Very Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="grade">Grade*</Label>
                  <Select 
                    value={singleQuestionForm.gradeId?.toString() ?? ''}
                    onValueChange={(value) => setSingleQuestionForm(prev => ({ 
                      ...prev, 
                      gradeId: Number(value),
                      semesterId: undefined,
                      chapterId: undefined,
                      lessonId: undefined,
                    }))}
                    required
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

                <div className="space-y-2">
                  <Label htmlFor="semester">
                    Semester*{" "}
                    {!singleQuestionForm.gradeId && (
                      <span className="text-red-500 text-sm ml-2">
                        (Must choose Grade)
                      </span>
                    )}
                  </Label>
                  <Select 
                    value={singleQuestionForm.semesterId?.toString() ?? ''}
                    onValueChange={(value) => setSingleQuestionForm(prev => ({ 
                      ...prev, 
                      semesterId: Number(value),
                      chapterId: undefined,
                      lessonId: undefined,
                    }))}
                    disabled={!singleQuestionForm.gradeId}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {semesterOptions.map((s) => (
                        <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="chapter">
                    Chapter*
                    {!singleQuestionForm.semesterId && (
                      <span className="text-red-500 text-sm ml-2">
                        (Must choose Semester)
                      </span>
                    )}
                  </Label>
                  <Select 
                    value={singleQuestionForm.chapterId?.toString() ?? ''}
                    onValueChange={(value) => setSingleQuestionForm(prev => ({ 
                      ...prev, 
                      chapterId: Number(value),
                      lessonId: undefined,
                    }))}
                    disabled={!singleQuestionForm.semesterId}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select chapter" />
                    </SelectTrigger>
                    <SelectContent className="max-h-48 overflow-y-auto">
                      {chapterOptions.map((c) => (
                        <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lesson">
                    Lesson*
                    {!singleQuestionForm.chapterId && (
                      <span className="text-red-500 text-sm ml-2">
                        (Must choose Chapter)
                      </span>
                    )}
                  </Label>
                  <Select 
                    value={singleQuestionForm.lessonId?.toString() ?? ''}
                    onValueChange={(value) => setSingleQuestionForm(prev => ({ ...prev, lessonId: Number(value) }))}
                    disabled={!singleQuestionForm.chapterId}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select lesson" />
                    </SelectTrigger>
                    <SelectContent className="max-h-48 overflow-y-auto">
                      {lessonOptions.map((l) => (
                        <SelectItem key={l.id} value={l.id.toString()}>{l.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="textbook">
                  Textbook*
                  {(!singleQuestionForm.gradeId || !singleQuestionForm.subjectId) && (
                    <span className="text-red-500 text-sm ml-2">
                      (Must choose Grade and Subject)
                    </span>
                  )}
                </Label>
                <Select 
                  value={singleQuestionForm.textbookId?.toString() ?? ''}
                  onValueChange={(value) => setSingleQuestionForm(prev => ({ ...prev, textbookId: Number(value) }))}
                  disabled={!singleQuestionForm.gradeId || !singleQuestionForm.subjectId}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select textbook" />
                  </SelectTrigger>
                  <SelectContent className="max-h-48 overflow-y-auto">
                    {textbookOptions.map((t) => (
                      <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="formula">Formula (optional)</Label>
                <Input
                  id="formula"
                  value={singleQuestionForm.formula}
                  onChange={(e) => setSingleQuestionForm(prev => ({ ...prev, formula: e.target.value }))}
                  placeholder="Enter mathematical formula if applicable"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Upload Image(s) (optional)</Label>
                <Input
                  id="image"
                  type="file"
                  multiple
                  onChange={(e) => {
                    const files = e.target.files ? Array.from(e.target.files) : [];
                    setSingleQuestionForm(prev => ({ ...prev, imageFiles: files }));
                  }}
                />
              </div>

              <div className="space-y-3">
                <Label>Answer Options*</Label>
                {singleQuestionForm.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correctAnswer"
                        value={index}
                        checked={singleQuestionForm.correctAnswerIndex === index}
                        onChange={(e) => setSingleQuestionForm(prev => ({ ...prev, correctAnswerIndex: parseInt(e.target.value) }))}
                        className="h-4 w-4"
                        aria-label={`Select option ${String.fromCharCode(65 + index)} as correct answer`}
                      />
                    </div>
                    <Input
                      value={option}
                      onChange={(e) => updateSingleQuestionOption(index, e.target.value)}
                      placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      className="flex-1"
                    />
                  </div>
                ))}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setSingleQuestionForm(prev => ({ ...prev, options: prev.options.length < 5 ? [...prev.options, ''] : prev.options }))
                    }
                    disabled={singleQuestionForm.options.length >= 5}
                  >
                    + Add option
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setSingleQuestionForm(prev => ({ ...prev, options: prev.options.length > 2 ? prev.options.slice(0, prev.options.length - 1) : prev.options }))
                    }
                    disabled={singleQuestionForm.options.length <= 2}
                  >
                    Remove last
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="explanation">Explanation*</Label>
                <Textarea
                  id="explanation"
                  value={singleQuestionForm.explanation}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSingleQuestionForm(prev => ({ ...prev, explanation: e.target.value }))}
                  placeholder="Explain why the correct answer(s) are correct..."
                  rows={3}
                  required
                />
              </div>
            </div>

            <DialogFooter className="pt-6 border-t border-gray-200">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setCreateQuestionDialogOpen(false);
                  resetCreateQuestionForm();
                }}
                className="h-12 px-6 border-2 border-gray-300 hover:border-red-500 hover:bg-red-50 transition-all duration-300 rounded-xl"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="h-12 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-xl text-lg font-semibold"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Create Question
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Lesson Dialog */}
      <Dialog 
        open={createLessonDialogOpen} 
        onOpenChange={(open) => {
          if (!open) {
            setCreateLessonDialogOpen(false);
            setLessonForm({
              title: '',
              description: '',
              subject: '',
              gradeId: undefined,
              semesterId: undefined,
              chapterId: undefined,
              lessonId: undefined,
              docFile: null
            });
            setLessonSemesterOptions([]);
            setLessonChapterOptions([]);
            setLessonLessonOptions([]);
            setLessonQuestions([]);
            setSelectedLessonQuestionIds([]);
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-2xl">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              Create New Lesson
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-base">
              Create a new lesson with document and questions
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmitCreateLesson} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="lesson-title">Title *</Label>
                <Input
                  id="lesson-title"
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter lesson title"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lesson-subject">Subject *</Label>
                  <Select 
                    value={lessonForm.subject} 
                    onValueChange={(value) => setLessonForm(prev => ({ 
                      ...prev, 
                      subject: value,
                      gradeId: undefined,
                      semesterId: undefined,
                      chapterId: undefined,
                      lessonId: undefined
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Math</SelectItem>
                      <SelectItem value="2">Physics</SelectItem>
                      <SelectItem value="3">Chemistry</SelectItem>
                      <SelectItem value="4">Biology</SelectItem>
                      <SelectItem value="5">Literature</SelectItem>
                      <SelectItem value="6">English</SelectItem>
                      <SelectItem value="7">History</SelectItem>
                      <SelectItem value="8">Geography</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lesson-grade">Grade *</Label>
                  <Select 
                    value={lessonForm.gradeId?.toString() ?? ''}
                    onValueChange={(value) => setLessonForm(prev => ({ 
                      ...prev, 
                      gradeId: Number(value),
                      semesterId: undefined,
                      chapterId: undefined,
                      lessonId: undefined
                    }))}
                    disabled={!lessonForm.subject}
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
                  <Label htmlFor="lesson-semester">Semester *</Label>
                  <Select 
                    value={lessonForm.semesterId?.toString() ?? ''}
                    onValueChange={(value) => setLessonForm(prev => ({ 
                      ...prev, 
                      semesterId: Number(value),
                      chapterId: undefined,
                      lessonId: undefined
                    }))}
                    disabled={!lessonForm.gradeId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {lessonSemesterOptions.map((s) => (
                        <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lesson-chapter">Chapter *</Label>
                  <Select 
                    value={lessonForm.chapterId?.toString() ?? ''}
                    onValueChange={(value) => setLessonForm(prev => ({ 
                      ...prev, 
                      chapterId: Number(value),
                      lessonId: undefined
                    }))}
                    disabled={!lessonForm.semesterId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select chapter" />
                    </SelectTrigger>
                    <SelectContent className="max-h-48 overflow-y-auto">
                      {lessonChapterOptions.map((c) => (
                        <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lesson-lesson">Lesson *</Label>
                <Select 
                  value={lessonForm.lessonId?.toString() ?? ''}
                  onValueChange={(value) => setLessonForm(prev => ({ ...prev, lessonId: Number(value) }))}
                  disabled={!lessonForm.chapterId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select lesson" />
                  </SelectTrigger>
                  <SelectContent className="max-h-48 overflow-y-auto">
                    {lessonLessonOptions.map((l) => (
                      <SelectItem key={l.id} value={l.id.toString()}>{l.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lesson-description">Description *</Label>
                <Textarea
                  id="lesson-description"
                  value={lessonForm.description}
                  onChange={(e) => setLessonForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this lesson covers"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lesson-doc">Document File *</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <Input
                    id="lesson-doc"
                    type="file"
                    accept=".doc,.docx,.pdf"
                    onChange={(e) => setLessonForm(prev => ({ ...prev, docFile: e.target.files?.[0] || null }))}
                    className="hidden"
                    required
                  />
                  <Label htmlFor="lesson-doc" className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-700">Click to upload Document</span>
                    <span className="text-gray-500"> or drag and drop</span>
                  </Label>
                  {lessonForm.docFile && (
                    <p className="mt-2 text-sm text-green-600">
                      Selected: {lessonForm.docFile.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Select Questions *</Label>
                {!lessonForm.lessonId ? (
                  <p className="text-sm text-gray-500">
                    Please select a lesson first to see available questions.
                  </p>
                ) : lessonQuestions.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No questions available for this lesson.
                  </p>
                ) : (
                  <div className="max-h-60 overflow-y-auto border rounded-lg p-3 space-y-2">
                    {lessonQuestions.map((question) => (
                      <div key={question.id} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded">
                        <input
                          type="checkbox"
                          id={`lesson-question-${question.id}`}
                          checked={selectedLessonQuestionIds.includes(question.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedLessonQuestionIds(prev => [...prev, question.id]);
                            } else {
                              setSelectedLessonQuestionIds(prev => prev.filter(id => id !== question.id));
                            }
                          }}
                          className="mt-1 h-4 w-4"
                        />
                        <label htmlFor={`lesson-question-${question.id}`} className="flex-1 text-sm cursor-pointer">
                          <span className="font-medium">Question {question.id}:</span> {question.content}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-sm text-gray-500">
                  Selected: {selectedLessonQuestionIds.length} question(s)
                </p>
              </div>
            </div>

            <DialogFooter className="pt-6 border-t border-gray-200">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setCreateLessonDialogOpen(false);
                  setLessonForm({
                    title: '',
                    description: '',
                    subject: '',
                    gradeId: undefined,
                    semesterId: undefined,
                    chapterId: undefined,
                    lessonId: undefined,
                    docFile: null
                  });
                  setLessonSemesterOptions([]);
                  setLessonChapterOptions([]);
                  setLessonLessonOptions([]);
                  setLessonQuestions([]);
                  setSelectedLessonQuestionIds([]);
                }}
                disabled={isCreatingLesson}
                className="h-12 px-6 border-2 border-gray-300 hover:border-red-500 hover:bg-red-50 transition-all duration-300 rounded-xl"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isCreatingLesson}
                className="h-12 px-8 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-xl text-lg font-semibold"
              >
                {isCreatingLesson ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Save className="mr-2 h-5 w-5" />
                )}
                {isCreatingLesson ? 'Creating...' : 'Create Lesson'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Mock Test Dialog */}
      <Dialog 
        open={createMockTestDialogOpen} 
        onOpenChange={(open) => {
          if (!open) {
            setCreateMockTestDialogOpen(false);
            setMockTestForm({
              name: '',
              description: '',
              duration: '',
              subjectId: '',
              gradeId: undefined,
              semesterId: undefined,
              chapterId: undefined,
              lessonId: '',
              examTypeId: '',
            });
            setMockTestQuestions([]);
            setSelectedMockTestQuestionIds([]);
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-2xl">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              Create Mock Test
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-base">
              Create a new mock test with questions
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmitCreateMockTest} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mocktest-name">Name *</Label>
                <Input
                  id="mocktest-name"
                  value={mockTestForm.name}
                  onChange={(e) => setMockTestForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter exam name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mocktest-description">Description</Label>
                <Textarea
                  id="mocktest-description"
                  value={mockTestForm.description}
                  onChange={(e) => setMockTestForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this mock test covers"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mocktest-duration">Duration (minutes) *</Label>
                <Input
                  id="mocktest-duration"
                  type="number"
                  value={mockTestForm.duration}
                  onChange={(e) => setMockTestForm(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="90"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mocktest-subjectId">Subject *</Label>
                  <Select 
                    value={mockTestForm.subjectId === '' ? undefined : String(mockTestForm.subjectId)} 
                    onValueChange={(v) => setMockTestForm(prev => ({ 
                      ...prev, 
                      subjectId: v ? Number(v) : '',
                      gradeId: undefined,
                      semesterId: undefined,
                      chapterId: undefined,
                      lessonId: '' as unknown as number | ''
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Toán học</SelectItem>
                      <SelectItem value="2">Vật lý</SelectItem>
                      <SelectItem value="3">Hóa học</SelectItem>
                      <SelectItem value="4">Sinh học</SelectItem>
                      <SelectItem value="5">Ngữ văn</SelectItem>
                      <SelectItem value="6">Tiếng Anh</SelectItem>
                      <SelectItem value="7">Lịch sử</SelectItem>
                      <SelectItem value="8">Địa lý</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Grade *</Label>
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
                  <Label>Semester *</Label>
                  <Select 
                    value={mockTestForm.semesterId?.toString() ?? ''}
                    onValueChange={(v) => setMockTestForm(prev => ({ ...prev, semesterId: Number(v), chapterId: undefined, lessonId: '' as unknown as number | '' }))}
                    disabled={!mockTestForm.gradeId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockTestSemesterOptions.map(s => (
                        <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Chapter *</Label>
                  <Select 
                    value={mockTestForm.chapterId?.toString() ?? ''}
                    onValueChange={(v) => setMockTestForm(prev => ({ ...prev, chapterId: Number(v), lessonId: '' as unknown as number | '' }))}
                    disabled={!mockTestForm.semesterId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select chapter" />
                    </SelectTrigger>
                    <SelectContent className="max-h-48 overflow-y-auto">
                      {mockTestChapterOptions.map(c => (
                        <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mocktest-lessonId">Lesson *</Label>
                <Select 
                  value={mockTestForm.lessonId === '' ? undefined : String(mockTestForm.lessonId)} 
                  onValueChange={(v) => setMockTestForm(prev => ({ ...prev, lessonId: v ? Number(v) : '' }))}
                  disabled={!mockTestForm.chapterId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select lesson" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockTestLessons.map(l => (
                      <SelectItem key={l.id} value={String(l.id)}>{l.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mocktest-examTypeId">Exam Type *</Label>
                <Select 
                  value={mockTestForm.examTypeId === '' ? undefined : String(mockTestForm.examTypeId)} 
                  onValueChange={(v) => setMockTestForm(prev => ({ ...prev, examTypeId: v ? Number(v) : '' }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select exam type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Kiểm tra 15 phút</SelectItem>
                    <SelectItem value="2">Kiểm tra 1 tiết</SelectItem>
                    <SelectItem value="3">Kiểm tra giữa kỳ</SelectItem>
                    <SelectItem value="4">Kiểm tra cuối kỳ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Questions *</Label>
                <p className="text-sm text-gray-600">
                  Total selected: {selectedMockTestQuestionIds.length}
                </p>
                {mockTestQuestionsLoading && <p className="text-sm text-gray-500">Đang tải danh sách câu hỏi...</p>}
                {!mockTestQuestionsLoading && !mockTestForm.lessonId && (
                  <p className="text-sm text-gray-500">Vui lòng chọn bài học để xem danh sách câu hỏi.</p>
                )}
                {!mockTestQuestionsLoading && mockTestForm.lessonId && mockTestQuestions.length === 0 && (
                  <p className="text-sm text-gray-500">Không có câu hỏi nào cho bài học này.</p>
                )}
                {!mockTestQuestionsLoading && mockTestForm.lessonId && mockTestQuestions.length > 0 && (
                  <div className="max-h-60 overflow-y-auto border rounded-lg p-3 space-y-2">
                    {mockTestQuestions.map((q) => (
                      <div key={q.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                        <Checkbox
                          checked={selectedMockTestQuestionIds.includes(q.id)}
                          onCheckedChange={() => {
                            setSelectedMockTestQuestionIds((prev) =>
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
              </div>
            </div>

            <DialogFooter className="pt-6 border-t border-gray-200">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setCreateMockTestDialogOpen(false);
                  setMockTestForm({
                    name: '',
                    description: '',
                    duration: '',
                    subjectId: '',
                    gradeId: undefined,
                    semesterId: undefined,
                    chapterId: undefined,
                    lessonId: '',
                    examTypeId: '',
                  });
                  setMockTestQuestions([]);
                  setSelectedMockTestQuestionIds([]);
                }}
                disabled={isCreatingMockTest}
                className="h-12 px-6 border-2 border-gray-300 hover:border-red-500 hover:bg-red-50 transition-all duration-300 rounded-xl"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isCreatingMockTest || !mockTestForm.subjectId || selectedMockTestQuestionIds.length === 0}
                className="h-12 px-8 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-xl text-lg font-semibold"
              >
                {isCreatingMockTest ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Save className="mr-2 h-5 w-5" />
                )}
                {isCreatingMockTest ? 'Creating...' : 'Create Mock Test'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Question Dialog */}
      <Dialog open={editQuestionDialogOpen} onOpenChange={setEditQuestionDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-2xl">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                <Edit className="h-6 w-6 text-white" />
              </div>
              Chỉnh sửa Câu hỏi
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-base">
              Cập nhật thông tin câu hỏi
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmitEditQuestion} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-question-text" className="text-sm font-semibold text-gray-700">Nội dung câu hỏi*</Label>
                <Textarea
                  id="edit-question-text"
                  value={editQuestionForm.content}
                  onChange={(e) => setEditQuestionForm(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Nhập nội dung câu hỏi..."
                  rows={3}
                  required
                  className="border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Độ khó*</Label>
                  <Select 
                    value={editQuestionForm.difficultyLevelId?.toString() ?? ''}
                    onValueChange={(value) => setEditQuestionForm(prev => ({ ...prev, difficultyLevelId: Number(value) }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn độ khó" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Dễ</SelectItem>
                      <SelectItem value="2">Trung bình</SelectItem>
                      <SelectItem value="3">Khó</SelectItem>
                      <SelectItem value="4">Rất khó</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Công thức (tuỳ chọn)</Label>
                  <Input
                    value={editQuestionForm.formula}
                    onChange={(e) => setEditQuestionForm(prev => ({ ...prev, formula: e.target.value }))}
                    placeholder="Nhập công thức nếu có"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Các lựa chọn*</Label>
                {editQuestionForm.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="edit-correctAnswer"
                      checked={editQuestionForm.correctAnswerIndex === index}
                      onChange={() => setEditQuestionForm(prev => ({ ...prev, correctAnswerIndex: index }))}
                      className="h-4 w-4"
                      aria-label={`Chọn đáp án ${index + 1} là đáp án đúng`}
                      title={`Chọn đáp án ${index + 1} là đáp án đúng`}
                    />
                    <Input
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...editQuestionForm.options];
                        newOptions[index] = e.target.value;
                        setEditQuestionForm(prev => ({ ...prev, options: newOptions }));
                      }}
                      placeholder={`Lựa chọn ${index + 1}`}
                      className="flex-1"
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-explanation">Giải thích*</Label>
                <Textarea
                  id="edit-explanation"
                  value={editQuestionForm.explanation}
                  onChange={(e) => setEditQuestionForm(prev => ({ ...prev, explanation: e.target.value }))}
                  placeholder="Giải thích đáp án đúng..."
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-image">Upload ảnh mới (tuỳ chọn)</Label>
                <Input
                  id="edit-image"
                  type="file"
                  multiple
                  onChange={(e) => {
                    const files = e.target.files ? Array.from(e.target.files) : [];
                    setEditQuestionForm(prev => ({ ...prev, imageFiles: files }));
                  }}
                />
                {editQuestionForm.image && (
                  <p className="text-sm text-gray-600">Ảnh hiện tại: <a href={editQuestionForm.image} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Xem</a></p>
                )}
              </div>
            </div>

            <DialogFooter className="pt-6 border-t border-gray-200">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setEditQuestionDialogOpen(false)}
                className="h-12 px-6 border-2 border-gray-300 hover:border-red-500 hover:bg-red-50 transition-all duration-300 rounded-xl"
              >
                Hủy
              </Button>
              <Button 
                type="submit"
                className="h-12 px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-xl text-lg font-semibold"
              >
                <Save className="mr-2 h-5 w-5" />
                Cập nhật
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Exam Dialog */}
      <Dialog open={editExamDialogOpen} onOpenChange={setEditExamDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-2xl">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                <Edit className="h-6 w-6 text-white" />
              </div>
              Chỉnh sửa Đề thi
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-base">
              Cập nhật thông tin đề thi
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmitEditExam} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-exam-name">Tên đề thi*</Label>
                <Input
                  id="edit-exam-name"
                  value={editExamForm.name}
                  onChange={(e) => setEditExamForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nhập tên đề thi"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-exam-description">Mô tả</Label>
                <Textarea
                  id="edit-exam-description"
                  value={editExamForm.description}
                  onChange={(e) => setEditExamForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Mô tả đề thi"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-exam-duration">Thời gian (phút)*</Label>
                <Input
                  id="edit-exam-duration"
                  type="number"
                  value={editExamForm.duration}
                  onChange={(e) => setEditExamForm(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="90"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Trạng thái Active</Label>
                  <Select 
                    value={editExamForm.isActive ? 'true' : 'false'}
                    onValueChange={(v) => setEditExamForm(prev => ({ ...prev, isActive: v === 'true' }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Locked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Trạng thái Public</Label>
                  <Select 
                    value={editExamForm.isPublic ? 'true' : 'false'}
                    onValueChange={(v) => setEditExamForm(prev => ({ ...prev, isPublic: v === 'true' }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Public</SelectItem>
                      <SelectItem value="false">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-6 border-t border-gray-200">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setEditExamDialogOpen(false)}
                className="h-12 px-6 border-2 border-gray-300 hover:border-red-500 hover:bg-red-50 transition-all duration-300 rounded-xl"
              >
                Hủy
              </Button>
              <Button 
                type="submit"
                className="h-12 px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-xl text-lg font-semibold"
              >
                <Save className="mr-2 h-5 w-5" />
                Cập nhật
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Question Confirmation Dialog */}
      <Dialog open={deleteQuestionDialogOpen} onOpenChange={setDeleteQuestionDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Xác nhận xóa câu hỏi</DialogTitle>
            <DialogDescription className="text-gray-400">
              Bạn có chắc chắn muốn xóa câu hỏi này? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          {questionToDelete && (
            <div className="py-4">
              <p className="text-white font-medium">ID: {questionToDelete.id}</p>
              <p className="text-gray-300 mt-2">{questionToDelete.content}</p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteQuestionDialogOpen(false);
                setQuestionToDelete(null);
              }}
              className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteQuestion}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Exam Confirmation Dialog */}
      <Dialog open={deleteExamDialogOpen} onOpenChange={setDeleteExamDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Xác nhận xóa đề thi</DialogTitle>
            <DialogDescription className="text-gray-400">
              Bạn có chắc chắn muốn xóa đề thi này? Đề thi sẽ được đánh dấu là đã xóa (soft delete).
            </DialogDescription>
          </DialogHeader>
          {examToDelete && (
            <div className="py-4">
              <p className="text-white font-medium">ID: {examToDelete.id}</p>
              <p className="text-white font-medium">Tên: {examToDelete.name}</p>
              <p className="text-gray-300 mt-2">{examToDelete.description}</p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteExamDialogOpen(false);
                setExamToDelete(null);
              }}
              className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteExam}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recover Exam Confirmation Dialog */}
      <Dialog open={recoverExamDialogOpen} onOpenChange={setRecoverExamDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-green-500" />
              Xác nhận khôi phục đề thi
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Bạn có chắc chắn muốn khôi phục đề thi này? Đề thi sẽ được kích hoạt lại.
            </DialogDescription>
          </DialogHeader>
          {examToRecover && (
            <div className="py-4">
              <p className="text-white font-medium">ID: {examToRecover.id}</p>
              <p className="text-white font-medium">Tên: {examToRecover.name}</p>
              <p className="text-gray-300 mt-2">{examToRecover.description}</p>
              <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-green-400 text-sm">
                  ✓ Đề thi sẽ được đánh dấu là Active và có thể sử dụng lại
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRecoverExamDialogOpen(false);
                setExamToRecover(null);
              }}
              className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
            >
              Hủy
            </Button>
            <Button
              onClick={confirmRecoverExam}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Khôi phục
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

