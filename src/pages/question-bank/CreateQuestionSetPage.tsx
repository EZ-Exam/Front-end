import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useGlobalLoading } from '@/contexts/GlobalLoadingContext';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { MultipleChoiceQuestion } from '@/types';

export function CreateQuestionSetPage() {
  const navigate = useNavigate();
  
  // Global loading hook
  const { withLoading } = useGlobalLoading();
  
  const [questionSetForm, setQuestionSetForm] = useState({
    title: '',
    description: '',
    subject: '',
    difficulty: ''
  });
  
  const [questions, setQuestions] = useState<MultipleChoiceQuestion[]>([
    {
      id: '1',
      questionText: '',
      answers: [
        { id: 'a1', text: '', isCorrect: false },
        { id: 'a2', text: '', isCorrect: false }
      ],
      explanation: ''
    }
  ]);

  const addQuestion = () => {
    const newQuestion: MultipleChoiceQuestion = {
      id: Date.now().toString(),
      questionText: '',
      answers: [
        { id: `${Date.now()}_a1`, text: '', isCorrect: false },
        { id: `${Date.now()}_a2`, text: '', isCorrect: false }
      ],
      explanation: ''
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (questionId: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== questionId));
    }
  };

  const updateQuestion = (questionId: string, field: string, value: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, [field]: value } : q
    ));
  };

  const addAnswer = (questionId: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId && q.answers.length < 5
        ? {
            ...q,
            answers: [
              ...q.answers,
              { id: `${Date.now()}_${q.answers.length}`, text: '', isCorrect: false }
            ]
          }
        : q
    ));
  };

  const removeAnswer = (questionId: string, answerId: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId && q.answers.length > 2
        ? { ...q, answers: q.answers.filter(a => a.id !== answerId) }
        : q
    ));
  };

  const updateAnswer = (questionId: string, answerId: string, field: string, value: string | boolean) => {
    setQuestions(questions.map(q => 
      q.id === questionId 
        ? {
            ...q,
            answers: q.answers.map(a => 
              a.id === answerId ? { ...a, [field]: value } : a
            )
          }
        : q
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await withLoading(async () => {
      console.log('Creating question set:', { questionSetForm, questions });
      // Here you would save to backend
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      navigate('/question-bank');
    }, "Đang tạo bộ câu hỏi mới...");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/question-bank">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Question Bank
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Create Question Set</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Question Set Details */}
        <Card>
          <CardHeader>
            <CardTitle>Question Set Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={questionSetForm.title}
                  onChange={(e) => setQuestionSetForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter question set title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Select value={questionSetForm.subject} onValueChange={(value) => setQuestionSetForm(prev => ({ ...prev, subject: value }))}>
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
                <Select value={questionSetForm.difficulty} onValueChange={(value) => setQuestionSetForm(prev => ({ ...prev, difficulty: value }))}>
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
                <Label htmlFor="subject">Class *</Label>
                <Select value={questionSetForm.subject} onValueChange={(value) => setQuestionSetForm(prev => ({ ...prev, subject: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Math">10</SelectItem>
                    <SelectItem value="Physics">11</SelectItem>
                    <SelectItem value="Chemistry">12</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>


            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={questionSetForm.description}
                onChange={(e) => setQuestionSetForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this question set covers"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Questions</h2>
            <Button type="button" onClick={addQuestion} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Question
            </Button>
          </div>

          {questions.map((question, questionIndex) => (
            <Card key={question.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Question {questionIndex + 1}</CardTitle>
                  {questions.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeQuestion(question.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Question Text *</Label>
                  <Textarea
                    value={question.questionText}
                    onChange={(e) => updateQuestion(question.id, 'questionText', e.target.value)}
                    placeholder="Enter your question here..."
                    required
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Answer Options *</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {question.answers.length}/5 options
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addAnswer(question.id)}
                        disabled={question.answers.length >= 5}
                      >
                        <Plus className="mr-2 h-3 w-3" />
                        Add Option
                      </Button>
                    </div>
                  </div>
                  
                  {question.answers.map((answer, answerIndex) => (
                    <div key={answer.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <Checkbox
                        checked={answer.isCorrect}
                        onCheckedChange={(checked) => updateAnswer(question.id, answer.id, 'isCorrect', checked === true)}
                      />
                      <div className="flex-1">
                        <Input
                          value={answer.text}
                          onChange={(e) => updateAnswer(question.id, answer.id, 'text', e.target.value)}
                          placeholder={`Option ${String.fromCharCode(65 + answerIndex)}`}
                          required
                        />
                      </div>
                      {question.answers.length > 2 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeAnswer(question.id, answer.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                  
                  <p className="text-xs text-gray-500">
                    Check the box next to correct answer(s). Multiple correct answers are allowed.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Explanation *</Label>
                  <Textarea
                    value={question.explanation}
                    onChange={(e) => updateQuestion(question.id, 'explanation', e.target.value)}
                    placeholder="Explain why the correct answer(s) are correct..."
                    required
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link to="/question-bank">Cancel</Link>
          </Button>
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            Create Question Set
          </Button>
        </div>
      </form>
    </div>
  );
}