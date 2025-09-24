import { useEffect, useRef, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Plus, BookOpen, HelpCircle, FileText, MessageSquare} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '@/services/axios';
import { uploadImgBBMultipleFile } from '@/services/imgBB';
import { useAuth } from '@/pages/auth/AuthContext';
import { addStyles, EditableMathField } from 'react-mathquill';
import { toast, ToastContainer } from 'react-toastify';
addStyles();

export function CreateContentDropdown() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeDialog, setActiveDialog] = useState<'single-question' | null>(null);
  const [singleQuestionForm, setSingleQuestionForm] = useState({
    content: '',
    difficultyLevelId: undefined as number | undefined,
    subjectId: undefined as number | undefined,
    gradeId: undefined as number | undefined,
    semesterId: undefined as number | undefined,
    chapterId: undefined as number | undefined,
    lessonId: undefined as number | undefined,
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
  // MathQuill refs for handling paste
  const contentMQRef = useRef<any>(null);
  const formulaMQRef = useRef<any>(null);
  const explanationMQRef = useRef<any>(null);
  const optionMQRefs = useRef<any[]>([]);

  const handleCreateSingleQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Required field validation
      if (!singleQuestionForm.content || singleQuestionForm.content.trim() === '') {
        toast.error('Question is required');
        return;
      }
      if (!singleQuestionForm.subjectId) {
        toast.error('Subject is required');
        return;
      }
      if (!singleQuestionForm.difficultyLevelId) {
        toast.error('Difficulty is required');
        return;
      }
      if (!singleQuestionForm.gradeId) {
        toast.error('Grade is required');
        return;
      }
      if (!singleQuestionForm.semesterId) {
        toast.error('Semester is required');
        return;
      }
      if (!singleQuestionForm.chapterId) {
        toast.error('Chapter is required');
        return;
      }
      if (!singleQuestionForm.lessonId) {
        toast.error('Lesson is required');
        return;
      }

      const trimmedOptionsFull = singleQuestionForm.options.map(o => o.trim());
      const nonEmptyOptions = trimmedOptionsFull.filter(o => o.length > 0);
      if (nonEmptyOptions.length < 2) {
        toast.error('At least 2 answer options are required');
        return;
      }
      const selectedOptionValue = trimmedOptionsFull[singleQuestionForm.correctAnswerIndex];
      if (!selectedOptionValue || selectedOptionValue.trim() === '') {
        toast.error('Please select a valid correct answer among the options');
        return;
      }
      if (!singleQuestionForm.explanation || singleQuestionForm.explanation.trim() === '') {
        toast.error('Explanation is required');
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
        image: imageUrl,
        createdByUserId: user?.id ? Number(user.id) : undefined,
        // Commonly required by APIs handling question creation
        questionSource: 'manual',
        questionType: 'multiple-choice',
        formula: singleQuestionForm.formula && singleQuestionForm.formula.trim() !== '' ? singleQuestionForm.formula : null,
        explanation: singleQuestionForm.explanation,
        options: nonEmptyOptions,
        correctAnswer: selectedOptionValue,
      };

      console.log("Dữ liệu gửi đi",payload);

      const response = await api.post('/questions', payload);
      if (response.status >= 200 && response.status < 300) {
        toast.success('Question created successfully');
      }
     

      setActiveDialog(null);
      setSingleQuestionForm({
        content: '',
        difficultyLevelId: undefined,
        subjectId: undefined,
        gradeId: undefined,
        semesterId: undefined,
        chapterId: undefined,
        lessonId: undefined,
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
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.response?.data || error?.message || 'Failed to create question';
      console.error('Failed to create question', message);
      toast.error(typeof message === 'string' ? message : 'Failed to create question');
    }
  };

  const updateSingleQuestionOption = (index: number, value: string) => {
    const newOptions = [...singleQuestionForm.options];
    newOptions[index] = value;
    setSingleQuestionForm(prev => ({ ...prev, options: newOptions }));
  };

  // dependent selects
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
      if (!singleQuestionForm.semesterId) {
        setChapterOptions([]);
        setSingleQuestionForm(prev => ({ ...prev, chapterId: undefined }));
        return;
      }
      try {
        const res = await api.get(`/chapters/by-semester/${singleQuestionForm.semesterId}`);
        setChapterOptions(res.data || []);
      } catch (err) {
        setChapterOptions([]);
      }
    };
    fetchChapters();
  }, [singleQuestionForm.semesterId]);

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

  return (
    <>
      <ToastContainer />
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
              content: '',
              difficultyLevelId: undefined,
              subjectId: undefined,
              gradeId: undefined,
              semesterId: undefined,
              chapterId: undefined,
              lessonId: undefined,
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
                <Label htmlFor="question-text">Question*</Label>
                <div
                  onPaste={(e) => {
                    e.preventDefault();
                    const text = e.clipboardData.getData('text/plain');
                    if (contentMQRef.current) {
                      contentMQRef.current.write(text);
                      setSingleQuestionForm(prev => ({ ...prev, content: contentMQRef.current.latex() }));
                    }
                  }}
                >
                  <EditableMathField
                    latex={singleQuestionForm.content}
                    style={{ width: "100%",          // w-full
                      border: "1px solid #e5e7eb", // border (Tailwind default = gray-300)
                      borderRadius: "0.375rem",    // rounded (6px)
                      paddingLeft: "0.75rem",  // px-3 = 12px
                      paddingRight: "0.75rem",
                      paddingTop: "0.5rem",    // py-2 = 8px
                      paddingBottom: "0.5rem",
                      minHeight: "48px",       // min-h-[48px]
                      boxSizing: "border-box", // để padding không phá width
                      outline: "none",}}
                    onChange={(mathField) =>
                      setSingleQuestionForm(prev => ({ ...prev, content: mathField.latex() }))
                    }
                    mathquillDidMount={(mf) => {
                      contentMQRef.current = mf;
                    }}
                  />
                </div>
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
                <Label htmlFor="formula">Formula (optional) </Label>
                <div
                  onPaste={(e) => {
                    e.preventDefault();
                    const text = e.clipboardData.getData('text/plain');
                    if (formulaMQRef.current) {
                      formulaMQRef.current.write(text);
                      setSingleQuestionForm(prev => ({ ...prev, formula: formulaMQRef.current.latex() }));
                    }
                  }}
                >
                  <EditableMathField 
                      latex={singleQuestionForm.formula}
                      style={{ width: "100%",          // w-full
                        border: "1px solid #e5e7eb", // border (Tailwind default = gray-300)
                        borderRadius: "0.375rem",    // rounded (6px)
                        paddingLeft: "0.75rem",  // px-3 = 12px
                        paddingRight: "0.75rem",
                        paddingTop: "0.5rem",    // py-2 = 8px
                        paddingBottom: "0.5rem",
                        minHeight: "48px",       // min-h-[48px]
                        boxSizing: "border-box", // để padding không phá width
                        outline: "none",}}
                      onChange={(mathField) =>
                        setSingleQuestionForm(prev => ({ ...prev, formula: mathField.latex() }))
                      }
                      mathquillDidMount={(mf) => {
                        formulaMQRef.current = mf;
                      }}
                    />
                </div>
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
                      <div
                        className="flex-1"
                        onPaste={(e) => {
                          e.preventDefault();
                          const text = e.clipboardData.getData('text/plain');
                          const mf = optionMQRefs.current[index];
                          if (mf) {
                            mf.write(text);
                            updateSingleQuestionOption(index, mf.latex());
                          }
                        }}
                      >
                        <EditableMathField
                          latex={option}
                          onChange={(mathField) => updateSingleQuestionOption(index, mathField.latex())}
                          style={{ width: "100%",          // w-full
                            border: "1px solid #e5e7eb", // border (Tailwind default = gray-300)
                            borderRadius: "0.375rem",    // rounded (6px)
                            paddingLeft: "0.75rem",  // px-3 = 12px
                            paddingRight: "0.75rem",
                            paddingTop: "0.5rem",    // py-2 = 8px
                            paddingBottom: "0.5rem",
                            minHeight: "48px",       // min-h-[48px]
                            boxSizing: "border-box", // để padding không phá width
                            outline: "none",}}
                          mathquillDidMount={(mf) => {
                            optionMQRefs.current[index] = mf;
                          }}
                        />
                      </div>
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
                <div
                  onPaste={(e) => {
                    e.preventDefault();
                    const text = e.clipboardData.getData('text/plain');
                    if (explanationMQRef.current) {
                      explanationMQRef.current.write(text);
                      setSingleQuestionForm(prev => ({ ...prev, explanation: explanationMQRef.current.latex() }));
                    }
                  }}
                >
                  <EditableMathField 
                    latex={singleQuestionForm.explanation}
                    style={{ width: "100%",          // w-full
                      border: "1px solid #e5e7eb", // border (Tailwind default = gray-300)
                      borderRadius: "0.375rem",    // rounded (6px)
                      paddingLeft: "0.75rem",  // px-3 = 12px
                      paddingRight: "0.75rem",
                      paddingTop: "0.5rem",    // py-2 = 8px
                      paddingBottom: "0.5rem",
                      minHeight: "48px",       // min-h-[48px]
                      boxSizing: "border-box", // để padding không phá width
                      outline: "none",}}
                    onChange={(mathField) =>
                      setSingleQuestionForm(prev => ({ ...prev, explanation: mathField.latex() }))
                    }
                    mathquillDidMount={(mf) => {
                      explanationMQRef.current = mf;
                    }}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setActiveDialog(null);
                  setSingleQuestionForm({
                    content: '',
                    difficultyLevelId: undefined,
                    subjectId: undefined,
                    gradeId: undefined,
                    semesterId: undefined,
                    chapterId: undefined,
                    lessonId: undefined,
                    imageFiles: [],
                    image: '',
                    formula:'',
                    explanation: '',
                    options: ['', ''],
                    correctAnswerIndex: 0,
                  });
                  setSemesterOptions([]);
                  setChapterOptions([]);
                  setLessonOptions([]);
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