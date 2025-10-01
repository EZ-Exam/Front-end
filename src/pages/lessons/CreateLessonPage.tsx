import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGlobalLoading } from '@/contexts/GlobalLoadingContext';
import { ArrowLeft, Save, Upload, Loader2 } from 'lucide-react';
import api from '@/services/axios';
import { useToast } from '@/hooks/use-toast';

export function CreateLessonPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Global loading hook
  const { withLoading } = useGlobalLoading();
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    subject: '',
    difficulty: '',
    duration: '',
    gradeId: undefined as number | undefined,
    semesterId: undefined as number | undefined,
    chapterId: undefined as number | undefined,
    lessonId: undefined as number | undefined,
    docFile: null as File | null
  });

  const [semesterOptions, setSemesterOptions] = useState<Array<{ id: number; name: string }>>([]);
  const [chapterOptions, setChapterOptions] = useState<Array<{ id: number; name: string }>>([]);
  const [lessonOptions, setLessonOptions] = useState<Array<{ id: number; name: string }>>([]);
  const [questions, setQuestions] = useState<Array<{ id: number; content: string }>>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<number[]>([]);

  // Dependent selects useEffect hooks
  useEffect(() => {
    const fetchSemesters = async () => {
      if (!lessonForm.gradeId) {
        setSemesterOptions([]);
        setLessonForm(prev => ({ ...prev, semesterId: undefined }));
        return;
      }
      try {
        const res = await api.get(`/semesters/by-grade/${lessonForm.gradeId}`);
        setSemesterOptions(res.data || []);
      } catch (err) {
        setSemesterOptions([]);
      }
    };
    fetchSemesters();
  }, [lessonForm.gradeId]);

  useEffect(() => {
    const fetchChapters = async () => {
      if (!lessonForm.semesterId) {
        setChapterOptions([]);
        setLessonForm(prev => ({ ...prev, chapterId: undefined }));
        return;
      }
      try {
        const res = await api.get(`/chapters/by-semester/${lessonForm.semesterId}`);
        setChapterOptions(res.data || []);
      } catch (err) {
        setChapterOptions([]);
      }
    };
    fetchChapters();
  }, [lessonForm.semesterId]);

  useEffect(() => {
    const fetchLessons = async () => {
      if (!lessonForm.chapterId) {
        setLessonOptions([]);
        setLessonForm(prev => ({ ...prev, lessonId: undefined }));
        return;
      }
      try {
        const res = await api.get(`/lessons/by-chapter/${lessonForm.chapterId}`);
        setLessonOptions(res.data || []);
      } catch (err) {
        setLessonOptions([]);
      }
    };
    fetchLessons();
  }, [lessonForm.chapterId]);

  // Fetch questions when lessonId changes
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!lessonForm.lessonId) {
        setQuestions([]);
        setSelectedQuestionIds([]);
        return;
      }
      try {
        const res = await api.get(`/questions?lessonId=${lessonForm.lessonId}`);
        console.log("Questions",res.data);
        setQuestions(res.data?.items || []);
        setSelectedQuestionIds([]);
      } catch (err) {
        console.error('Failed to fetch questions:', err);
        setQuestions([]);
        setSelectedQuestionIds([]);
      }
    };
    fetchQuestions();
  }, [lessonForm.lessonId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await withLoading(async () => {
      setIsLoading(true);

      try {
        // Validate required fields
        if (!lessonForm.title || !lessonForm.description || !lessonForm.subject || !lessonForm.gradeId || !lessonForm.semesterId || !lessonForm.chapterId || !lessonForm.lessonId || !lessonForm.docFile) {
          toast({
            title: "Validation Error",
            description: "Please fill in all required fields",
            variant: "destructive",
          });
          return;
        }

        if (selectedQuestionIds.length === 0) {
          toast({
            title: "Validation Error",
            description: "Please select at least one question",
            variant: "destructive",
          });
          return;
        }

        // Upload PDF file to get URL
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
          } catch (error) {
            console.error('Document upload error:', error);
            toast({
              title: "Upload Error",
              description: "Failed to upload Document file. Please try again.",
              variant: "destructive",
            });
            return;
          }
        }

        // Prepare API payload according to the schema
        const apiPayload = {
          title: lessonForm.title,
          description: lessonForm.description,
          subjectId: lessonForm.subject, // Assuming subject maps to subjectId
          pdfUrl: docUrl,
          questions: selectedQuestionIds.map(id => id.toString()) // Convert question IDs to array of strings
        };

        console.log("Dữ liệu gửi đi",apiPayload);

        // Call API
        await api.post('/lessons-enhanced', apiPayload);
        
        toast({
          title: "Success",
          description: "Lesson created successfully!",
          variant: "default",
        });

        // Navigate back to lessons page
        navigate('/lessons');

      } catch (error: any) {
        console.error('Error creating lesson:', error);
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to create lesson. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }, "Đang tạo bài học mới...");
  };


  return (
    <div className="space-y-6 flex flex-col items-center">
      <div className="flex items-center gap-4 w-full">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/lessons">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Lessons
          </Link>
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl w-full space-y-6">
      <h1 className="text-3xl font-bold ">Create New Lesson</h1>
        <Card>
          <CardHeader>
            <CardTitle>Lesson Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Select value={lessonForm.subject} onValueChange={(value) => setLessonForm(prev => ({ 
                  ...prev, 
                  subject: value,
                  gradeId: undefined,
                  semesterId: undefined,
                  chapterId: undefined,
                  lessonId: undefined
                }))}>
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
                <Label htmlFor="grade">Grade *</Label>
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
                <Label htmlFor="semester">Semester *</Label>
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
                    {semesterOptions.map((s) => (
                      <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="chapter">Chapter *</Label>
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
                  <SelectContent>
                    {chapterOptions.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lesson">Lesson *</Label>
              <Select 
                value={lessonForm.lessonId?.toString() ?? ''}
                onValueChange={(value) => setLessonForm(prev => ({ ...prev, lessonId: Number(value) }))}
                disabled={!lessonForm.chapterId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select lesson" />
                </SelectTrigger>
                <SelectContent>
                  {lessonOptions.map((l) => (
                    <SelectItem key={l.id} value={l.id.toString()}>{l.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Label htmlFor="doc">Document File *</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <Input
                  id="doc"
                  type="file"
                  accept=".doc,.docx,.pdf"
                  onChange={(e) => setLessonForm(prev => ({ ...prev, docFile: e.target.files?.[0] || null }))}
                  className="hidden"
                  required
                />
                <Label htmlFor="doc" className="cursor-pointer">
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quiz Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!lessonForm.lessonId ? (
              <p className="text-sm text-gray-500">
                Please select a lesson first to see available questions.
              </p>
            ) : questions.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 mb-2">
                  No questions available for this lesson.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/create-question-set">
                    Create Questions
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Label>Select Questions *</Label>
                <div className="max-h-60 overflow-y-auto border rounded-lg p-3 space-y-2">
                  {questions.map((question) => (
                    <div key={question.id} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        id={`question-${question.id}`}
                        checked={selectedQuestionIds.includes(question.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedQuestionIds(prev => [...prev, question.id]);
                          } else {
                            setSelectedQuestionIds(prev => prev.filter(id => id !== question.id));
                          }
                        }}
                        className="mt-1 h-4 w-4"
                      />
                      <label htmlFor={`question-${question.id}`} className="flex-1 text-sm cursor-pointer">
                        <span className="font-medium">Question {question.id}:</span> {question.content}
                      </label>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500">
                  Selected: {selectedQuestionIds.length} question(s)
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" asChild disabled={isLoading}>
            <Link to="/lessons">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isLoading ? 'Creating...' : 'Create Lesson'}
          </Button>
        </div>
      </form>
    </div>
  );
}