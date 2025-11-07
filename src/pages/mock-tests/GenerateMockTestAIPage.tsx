import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ArrowLeft, Sparkles, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/pages/auth/AuthContext';
import { SubscriptionUtils } from '@/lib/subscription';
import { AIExamApiService } from '@/services/aiExamApi';
import { SemesterApiService, ChapterApiService, LessonApiService, Semester, Chapter, Lesson } from '@/services/curriculumApi';
import { AIExamGenerationRequest, AIExamGenerationResponse, AIExamQuestion } from '@/types';
import { useToast } from '@/contexts/ToastContext';

export function GenerateMockTestAIPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error } = useToast();

  // Get user ID from token
  const getUserIdFromToken = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return 1; // fallback
      
      // Decode JWT token (simple base64 decode for payload)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.userId || payload.id || payload.sub || 1;
      
      // Ensure userId is a number
      return typeof userId === 'string' ? parseInt(userId, 10) : Number(userId);
    } catch {
      return 1; // fallback if token is invalid
    }
  };

  const [formData, setFormData] = useState<AIExamGenerationRequest>({
    userId: getUserIdFromToken(),
    questionCount: 10,
    mode: 'review',
    historyCount: 5,
    subjectIds: [],
    gradeIds: [],
    chapterIds: [],
    lessonIds: [],
    difficultyLevelId: undefined
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedExam, setGeneratedExam] = useState<AIExamGenerationResponse | null>(null);
  const [showModeDialog, setShowModeDialog] = useState(false);
  const [isInteractiveMode, setIsInteractiveMode] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(new Set());

  // Curriculum data states
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedSemesterIds, setSelectedSemesterIds] = useState<number[]>([]);
  const [selectedChapterIds, setSelectedChapterIds] = useState<number[]>([]);
  const [loadingSemesters, setLoadingSemesters] = useState(false);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [loadingLessons, setLoadingLessons] = useState(false);

  // Kiểm tra quyền truy cập
  if (!SubscriptionUtils.canCreateMockTest(user)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="p-4 bg-red-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800 mb-2">
              Tính năng bị khóa
            </CardTitle>
            <p className="text-gray-600">
              Bạn cần nâng cấp lên gói PREMIUM để sử dụng AI tạo Mock Test
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

  // Hardcoded grades
  const grades = [
    { id: 1, name: 'Lớp 10' },
    { id: 2, name: 'Lớp 11' },
    { id: 3, name: 'Lớp 12' }
  ];

  // Hardcoded difficulty levels
  const difficultyLevels = [
    { id: 1, name: 'Dễ', value: 'EASY' },
    { id: 2, name: 'Trung bình', value: 'MEDIUM' },
    { id: 3, name: 'Khó', value: 'HARD' }
  ];

  const handleInputChange = useCallback((field: keyof AIExamGenerationRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleArrayChange = useCallback((field: 'subjectIds' | 'gradeIds' | 'chapterIds' | 'lessonIds', value: number, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...(prev[field] || []), value]
        : (prev[field] || []).filter(id => id !== value)
    }));
  }, []);

  // Stable error handler
  const handleError = useCallback((message: string) => {
    error(message);
  }, [error]);

  // Fetch semesters when grade is selected
  useEffect(() => {
    const fetchSemesters = async () => {
      if (formData.gradeIds && formData.gradeIds.length > 0) {
        try {
          setLoadingSemesters(true);
          const allSemesters: Semester[] = [];
          
          // Fetch semesters for all selected grades
          for (const gradeId of formData.gradeIds) {
            const gradeSemesters = await SemesterApiService.getSemestersByGrade(gradeId);
            allSemesters.push(...gradeSemesters);
          }
          
          setSemesters(allSemesters);
        } catch (err) {
          console.error('Error fetching semesters:', err);
          handleError('Không thể tải danh sách học kỳ');
        } finally {
          setLoadingSemesters(false);
        }
      } else {
        setSemesters([]);
        setChapters([]);
        setLessons([]);
        setSelectedSemesterIds([]);
        setSelectedChapterIds([]);
      }
    };

    fetchSemesters();
  }, [formData.gradeIds, handleError]);

  // Fetch chapters when semesters are selected
  useEffect(() => {
    const fetchChapters = async () => {
      if (selectedSemesterIds.length > 0 && formData.subjectIds && formData.subjectIds.length > 0) {
        try {
          setLoadingChapters(true);
          const allChapters: Chapter[] = [];
          
          // Fetch chapters for all selected semester-subject combinations
          for (const semesterId of selectedSemesterIds) {
            for (const subjectId of formData.subjectIds) {
              const chapters = await ChapterApiService.getChaptersBySemesterAndSubject(semesterId, subjectId);
              allChapters.push(...chapters);
            }
          }
          
          // Remove duplicates based on chapter ID
          const uniqueChapters = Array.from(
            new Map(allChapters.map(chapter => [chapter.id, chapter])).values()
          );
          
          setChapters(uniqueChapters);
        } catch (err) {
          console.error('Error fetching chapters:', err);
          handleError('Không thể tải danh sách chương');
        } finally {
          setLoadingChapters(false);
        }
      } else {
        setChapters([]);
        setLessons([]);
        setSelectedChapterIds([]);
      }
    };

    fetchChapters();
  }, [selectedSemesterIds, formData.subjectIds, handleError]);

  // Fetch lessons when chapters are selected
  useEffect(() => {
    const fetchLessons = async () => {
      if (selectedChapterIds.length > 0) {
        try {
          setLoadingLessons(true);
          const allLessons: Lesson[] = [];
          
          // Fetch lessons for all selected chapters
          for (const chapterId of selectedChapterIds) {
            const chapterLessons = await LessonApiService.getLessonsByChapter(chapterId);
            allLessons.push(...chapterLessons);
          }
          
          // Remove duplicates based on lesson ID
          const uniqueLessons = Array.from(
            new Map(allLessons.map(lesson => [lesson.id, lesson])).values()
          );
          
          setLessons(uniqueLessons);
        } catch (err) {
          console.error('Error fetching lessons:', err);
          handleError('Không thể tải danh sách bài học');
        } finally {
          setLoadingLessons(false);
        }
      } else {
        setLessons([]);
      }
    };

    fetchLessons();
  }, [selectedChapterIds, handleError]);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setGeneratedExam(null);
      
      // Ensure userId is a number
      const payload = {
        ...formData,
        userId: Number(formData.userId)
      };
      
      console.log('Payload with userId as number:', payload);
      
      const response = await AIExamApiService.generateExam(payload);
      console.log('Response in Generate Mock Test AI Page', response);
      setGeneratedExam(response);
      setShowModeDialog(true);
      success('Tạo bài thi AI thành công!');
    } catch (err: any) {
      console.error('Error generating AI exam:', err);
      error(err.response?.data?.message || 'Có lỗi xảy ra khi tạo bài thi AI');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswerSelect = (questionId: string, selectedAnswer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: selectedAnswer
    }));
    setAnsweredQuestions(prev => new Set([...prev, questionId]));
  };

  const QuestionCard = ({ question, index }: { question: AIExamQuestion; index: number }) => {
    const questionId = question.questionId?.toString() || `question-${index}`;
    const userAnswer = userAnswers[questionId];
    const isAnswered = answeredQuestions.has(questionId);
    const showResults = !isInteractiveMode || isAnswered;

    return (
      <Card className="mb-4 border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg font-semibold text-gray-800">
              Câu {index + 1}
            </CardTitle>
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {question.difficultyLevel}
              </span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                {question.questionType}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed">{question.content}</p>
          </div>
          
          {question.options && question.options.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">Các lựa chọn:</Label>
              <div className="grid gap-2">
                {question.options.map((option, optionIndex) => {
                  const optionLetter = String.fromCharCode(65 + optionIndex);
                  const isCorrect = option === question.correctAnswer;
                  const isSelected = userAnswer === option;
                  const showAsCorrect = showResults && isCorrect;
                  const showAsIncorrect = showResults && isSelected && !isCorrect;

                  return (
                    <div 
                      key={optionIndex}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        showAsCorrect
                          ? 'bg-green-50 border-green-200 text-green-800'
                          : showAsIncorrect
                          ? 'bg-red-50 border-red-200 text-red-800'
                          : isSelected && !showResults
                          ? 'bg-blue-50 border-blue-300 text-blue-800'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => {
                        if (isInteractiveMode && !isAnswered) {
                          handleAnswerSelect(questionId, option);
                        }
                      }}
                    >
                      <span className="font-medium">{optionLetter}.</span> {option}
                      {showAsCorrect && (
                        <CheckCircle className="inline-block ml-2 h-4 w-4 text-green-600" />
                      )}
                      {showAsIncorrect && (
                        <XCircle className="inline-block ml-2 h-4 w-4 text-red-600" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {showResults && question.explanation && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <Label className="text-sm font-medium text-blue-800">Giải thích:</Label>
              <p className="text-blue-700 text-sm mt-1">{question.explanation}</p>
            </div>
          )}

          {question.formula && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <Label className="text-sm font-medium text-purple-800">Công thức:</Label>
              <p className="text-purple-700 text-sm mt-1 font-mono">{question.formula}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Lớp:</span> {question.gradeName}
            </div>
            <div>
              <span className="font-medium">Bài học:</span> {question.lessonName}
            </div>
          </div>

          {showResults && question.aiReasoning && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <Label className="text-sm font-medium text-yellow-800">Lý do AI chọn:</Label>
              <p className="text-yellow-700 text-sm mt-1">{question.aiReasoning}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (generatedExam) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Mode Selection Dialog */}
          <Dialog open={showModeDialog} onOpenChange={(open) => {
            // Prevent closing by clicking outside - user must choose a mode
            if (!open) return;
          }}>
            <DialogContent className="sm:max-w-md" onInteractOutside={(e) => {
              // Prevent closing by clicking outside
              e.preventDefault();
            }}>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-center">
                  The Mock Test has been created, do it now?
                </DialogTitle>
                <DialogDescription className="text-center pt-2">
                  Choose how you want to view the mock test
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                <Button
                  onClick={() => {
                    setIsInteractiveMode(true);
                    setShowModeDialog(false);
                  }}
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  OK, let's do it
                </Button>
                <Button
                  onClick={() => {
                    setIsInteractiveMode(false);
                    setShowModeDialog(false);
                  }}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  Show Mock Test
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Header */}
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => {
                setGeneratedExam(null);
                setShowModeDialog(false);
                setIsInteractiveMode(false);
                setUserAnswers({});
                setAnsweredQuestions(new Set());
                navigate('/mock-tests');
              }}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại Mock Tests
            </Button>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Bài thi AI đã tạo</h1>
                <p className="text-gray-600">
                  {isInteractiveMode ? 'Chế độ làm bài - Chọn đáp án để xem kết quả' : 'Kết quả từ AI Exam Generator'}
                </p>
              </div>
            </div>
          </div>

          {/* Exam Metadata */}
          <Card className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-purple-800">Thông tin bài thi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{generatedExam.metadata.totalQuestions}</div>
                  <div className="text-sm text-gray-600">Tổng câu hỏi</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{generatedExam.metadata.mode}</div>
                  <div className="text-sm text-gray-600">Chế độ</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{generatedExam.metadata.processingTimeSeconds}s</div>
                  <div className="text-sm text-gray-600">Thời gian xử lý</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{generatedExam.metadata.tokensUsed}</div>
                  <div className="text-sm text-gray-600">Tokens sử dụng</div>
                </div>
              </div>
              
              {generatedExam.metadata.analysis && (
                <div className="mt-4 p-4 bg-white rounded-lg border">
                  <Label className="text-sm font-medium text-gray-700">Phân tích AI:</Label>
                  <p className="text-gray-600 text-sm mt-1">{generatedExam.metadata.analysis}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Questions */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Danh sách câu hỏi</h2>
            {generatedExam.questions.map((question, index) => (
              <QuestionCard key={question.questionId} question={question} index={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/mock-tests')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại Mock Tests
          </Button>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Tạo Mock Test bằng AI</h1>
              <p className="text-gray-600">AI sẽ tự động tạo bài thi dựa trên lịch sử học tập của bạn</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800">Cấu hình bài thi AI</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="questionCount">Số câu hỏi</Label>
                <Input
                  id="questionCount"
                  type="number"
                  min="1"
                  max="50"
                  value={formData.questionCount}
                  onChange={(e) => handleInputChange('questionCount', parseInt(e.target.value))}
                  className="border-gray-300 focus:border-purple-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mode">Chế độ</Label>
                <Select value={formData.mode} onValueChange={(value: 'review' | 'advanced') => handleInputChange('mode', value)}>
                  <SelectTrigger className="border-gray-300 focus:border-purple-500">
                    <SelectValue placeholder="Chọn chế độ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="review">Review (Dễ - Trung bình)</SelectItem>
                    <SelectItem value="advanced">Advanced (Trung bình - Khó)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="historyCount">Số lịch sử thi để phân tích</Label>
                <Input
                  id="historyCount"
                  type="number"
                  min="1"
                  max="20"
                  value={formData.historyCount}
                  onChange={(e) => handleInputChange('historyCount', parseInt(e.target.value))}
                  className="border-gray-300 focus:border-purple-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="difficultyLevel">Độ khó</Label>
                <Select 
                  value={formData.difficultyLevelId?.toString() || 'all'} 
                  onValueChange={(value) => handleInputChange('difficultyLevelId', value === 'all' ? undefined : parseInt(value))}
                >
                  <SelectTrigger className="border-gray-300 focus:border-purple-500">
                    <SelectValue placeholder="Chọn độ khó (tùy chọn)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả độ khó</SelectItem>
                    {difficultyLevels.map(level => (
                      <SelectItem key={level.id} value={level.id.toString()}>
                        {level.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Subject Selection */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Môn học (tùy chọn)</Label>
              <p className="text-sm text-gray-600">Nếu không chọn, AI sẽ tự động phát hiện từ lịch sử thi</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {subjects.map(subject => (
                  <div key={subject.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`subject-${subject.id}`}
                      checked={formData.subjectIds?.includes(subject.id) || false}
                      onCheckedChange={(checked) => 
                        handleArrayChange('subjectIds', subject.id, checked as boolean)
                      }
                    />
                    <Label htmlFor={`subject-${subject.id}`} className="text-sm">
                      {subject.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Grade Selection */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Khối lớp (tùy chọn)</Label>
              <p className="text-sm text-gray-600">Nếu không chọn, AI sẽ tự động phát hiện từ lịch sử thi</p>
              <div className="grid grid-cols-3 gap-3">
                {grades.map(grade => (
                  <div key={grade.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`grade-${grade.id}`}
                      checked={formData.gradeIds?.includes(grade.id) || false}
                      onCheckedChange={(checked) => 
                        handleArrayChange('gradeIds', grade.id, checked as boolean)
                      }
                    />
                    <Label htmlFor={`grade-${grade.id}`} className="text-sm">
                      {grade.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Semester Selection */}
            {formData.gradeIds && formData.gradeIds.length > 0 && (
              <div className="space-y-3">
                <Label className="text-base font-medium">Học kỳ (tùy chọn)</Label>
                <p className="text-sm text-gray-600">Nếu không chọn, AI sẽ lấy từ tất cả học kỳ</p>
                {loadingSemesters ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-gray-600">Đang tải danh sách học kỳ...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {semesters.map(semester => (
                      <div key={semester.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`semester-${semester.id}`}
                          checked={selectedSemesterIds.includes(semester.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedSemesterIds(prev => [...prev, semester.id]);
                            } else {
                              setSelectedSemesterIds(prev => prev.filter(id => id !== semester.id));
                            }
                          }}
                        />
                        <Label htmlFor={`semester-${semester.id}`} className="text-sm">
                          {semester.name} - {semester.gradeName}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Chapter Selection (Checkboxes) */}
            {selectedSemesterIds.length > 0 && chapters.length > 0 && (
              <div className="space-y-3">
                <Label className="text-base font-medium">Chọn chương cụ thể (tùy chọn)</Label>
                <p className="text-sm text-gray-600">Nếu không chọn, AI sẽ lấy từ tất cả chương trong học kỳ đã chọn</p>
                {loadingChapters ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-gray-600">Đang tải danh sách chương...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                    {chapters.map(chapter => (
                      <div key={chapter.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`chapter-${chapter.id}`}
                          checked={formData.chapterIds?.includes(chapter.id) || false}
                          onCheckedChange={(checked) => {
                            handleArrayChange('chapterIds', chapter.id, checked as boolean);
                            if (checked) {
                              setSelectedChapterIds(prev => [...prev, chapter.id]);
                            } else {
                              setSelectedChapterIds(prev => prev.filter(id => id !== chapter.id));
                            }
                          }}
                        />
                        <Label htmlFor={`chapter-${chapter.id}`} className="text-sm">
                          {chapter.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Lesson Selection */}
            {selectedChapterIds.length > 0 && lessons.length > 0 && (
              <div className="space-y-3">
                <Label className="text-base font-medium">Chọn bài học cụ thể (tùy chọn)</Label>
                <p className="text-sm text-gray-600">Nếu không chọn, AI sẽ lấy từ tất cả bài học trong chương đã chọn</p>
                {loadingLessons ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-gray-600">Đang tải danh sách bài học...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                    {lessons.map(lesson => (
                      <div key={lesson.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`lesson-${lesson.id}`}
                          checked={formData.lessonIds?.includes(lesson.id) || false}
                          onCheckedChange={(checked) => 
                            handleArrayChange('lessonIds', lesson.id, checked as boolean)
                          }
                        />
                        <Label htmlFor={`lesson-${lesson.id}`} className="text-sm">
                          {lesson.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Generate Button */}
            <div className="pt-4">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Tạo bài thi bằng AI
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
