import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  X, 
  Plus, 
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { mockQuestionSets } from '@/data/mockData';
import { QuestionSet, MultipleChoiceQuestion, Answer } from '@/types';

export function QuestionBankDetailPage() {
  const { id, mode } = useParams<{ id: string; mode: 'view' | 'edit' }>();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(mode === 'edit');
  const [questionSet, setQuestionSet] = useState<QuestionSet | null>(null);
  const [editedQuestionSet, setEditedQuestionSet] = useState<QuestionSet | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const foundQuestionSet = mockQuestionSets.find(qs => qs.id === id);
    if (foundQuestionSet) {
      setQuestionSet(foundQuestionSet);
      setEditedQuestionSet(JSON.parse(JSON.stringify(foundQuestionSet))); // Deep copy
    }
  }, [id]);

  useEffect(() => {
    setIsEditing(mode === 'edit');
  }, [mode]);

  if (!questionSet || !editedQuestionSet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Question Set Not Found</h2>
            <p className="text-gray-600 mb-4">The question set you're looking for doesn't exist.</p>
            <Button asChild>
              <Link to="/question-bank">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Question Bank
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSubjectColor = (subject: string) => {
    switch (subject) {
      case 'Math': return 'bg-blue-100 text-blue-800';
      case 'Physics': return 'bg-purple-100 text-purple-800';
      case 'Chemistry': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSave = () => {
    console.log('Saving question set:', editedQuestionSet);
    setQuestionSet(editedQuestionSet);
    setHasChanges(false);
    setIsEditing(false);
    navigate(`/question-bank/${id}/view`);
  };

  const handleCancel = () => {
    setEditedQuestionSet(JSON.parse(JSON.stringify(questionSet)));
    setHasChanges(false);
    setIsEditing(false);
    navigate(`/question-bank/${id}/view`);
  };

  const handleEdit = () => {
    setIsEditing(true);
    navigate(`/question-bank/${id}/edit`);
  };

  const updateQuestionSetField = (field: keyof QuestionSet, value: any) => {
    setEditedQuestionSet(prev => prev ? { ...prev, [field]: value } : null);
    setHasChanges(true);
  };

  const updateQuestion = (questionIndex: number, field: keyof MultipleChoiceQuestion, value: any) => {
    if (!editedQuestionSet) return;
    
    const updatedQuestions = [...editedQuestionSet.questions];
    updatedQuestions[questionIndex] = { ...updatedQuestions[questionIndex], [field]: value };
    
    setEditedQuestionSet({ ...editedQuestionSet, questions: updatedQuestions });
    setHasChanges(true);
  };

  const updateAnswer = (questionIndex: number, answerIndex: number, field: keyof Answer, value: any) => {
    if (!editedQuestionSet) return;
    
    const updatedQuestions = [...editedQuestionSet.questions];
    const updatedAnswers = [...updatedQuestions[questionIndex].answers];
    updatedAnswers[answerIndex] = { ...updatedAnswers[answerIndex], [field]: value };
    updatedQuestions[questionIndex] = { ...updatedQuestions[questionIndex], answers: updatedAnswers };
    
    setEditedQuestionSet({ ...editedQuestionSet, questions: updatedQuestions });
    setHasChanges(true);
  };

  const addAnswer = (questionIndex: number) => {
    if (!editedQuestionSet) return;
    
    const updatedQuestions = [...editedQuestionSet.questions];
    const question = updatedQuestions[questionIndex];
    
    if (question.answers.length < 5) {
      const newAnswer: Answer = {
        id: `${Date.now()}_${question.answers.length}`,
        text: '',
        isCorrect: false
      };
      
      updatedQuestions[questionIndex] = {
        ...question,
        answers: [...question.answers, newAnswer]
      };
      
      setEditedQuestionSet({ ...editedQuestionSet, questions: updatedQuestions });
      setHasChanges(true);
    }
  };

  const removeAnswer = (questionIndex: number, answerIndex: number) => {
    if (!editedQuestionSet) return;
    
    const updatedQuestions = [...editedQuestionSet.questions];
    const question = updatedQuestions[questionIndex];
    
    if (question.answers.length > 2) {
      const updatedAnswers = question.answers.filter((_, index) => index !== answerIndex);
      updatedQuestions[questionIndex] = { ...question, answers: updatedAnswers };
      
      setEditedQuestionSet({ ...editedQuestionSet, questions: updatedQuestions });
      setHasChanges(true);
    }
  };

  const addQuestion = () => {
    if (!editedQuestionSet) return;
    
    const newQuestion: MultipleChoiceQuestion = {
      id: Date.now().toString(),
      questionText: '',
      answers: [
        { id: `${Date.now()}_a1`, text: '', isCorrect: false },
        { id: `${Date.now()}_a2`, text: '', isCorrect: false }
      ],
      explanation: ''
    };
    
    setEditedQuestionSet({
      ...editedQuestionSet,
      questions: [...editedQuestionSet.questions, newQuestion]
    });
    setHasChanges(true);
  };

  const removeQuestion = (questionIndex: number) => {
    if (!editedQuestionSet || editedQuestionSet.questions.length <= 1) return;
    
    const updatedQuestions = editedQuestionSet.questions.filter((_, index) => index !== questionIndex);
    setEditedQuestionSet({ ...editedQuestionSet, questions: updatedQuestions });
    setHasChanges(true);
  };

  const currentData = isEditing ? editedQuestionSet : questionSet;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/question-bank">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Question Bank
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Question Set Details</h1>
          </div>
          
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={!hasChanges}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </>
            ) : (
              <Button onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
          </div>
        </div>

        {/* Question Set Info */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">
                {isEditing ? (
                  <Input
                    value={currentData.title}
                    onChange={(e) => updateQuestionSetField('title', e.target.value)}
                    className="text-2xl font-semibold border-none p-0 h-auto"
                    placeholder="Question set title"
                  />
                ) : (
                  currentData.title
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge className={getSubjectColor(currentData.subject)}>
                  {currentData.subject}
                </Badge>
                <Badge className={getDifficultyColor(currentData.difficulty)} variant="outline">
                  {currentData.difficulty}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Select 
                      value={currentData.subject} 
                      onValueChange={(value) => updateQuestionSetField('subject', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Math">Math</SelectItem>
                        <SelectItem value="Physics">Physics</SelectItem>
                        <SelectItem value="Chemistry">Chemistry</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Difficulty</Label>
                    <Select 
                      value={currentData.difficulty} 
                      onValueChange={(value) => updateQuestionSetField('difficulty', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={currentData.description}
                    onChange={(e) => updateQuestionSetField('description', e.target.value)}
                    placeholder="Describe what this question set covers"
                    rows={3}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600">{currentData.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{currentData.questions.length} questions</span>
                  <span>•</span>
                  <span>Created {new Date(currentData.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>Updated {new Date(currentData.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Questions */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Questions</h2>
            {isEditing && (
              <Button onClick={addQuestion} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Question
              </Button>
            )}
          </div>

          {currentData.questions.map((question, questionIndex) => (
            <Card key={question.id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Question {questionIndex + 1}</CardTitle>
                  {isEditing && currentData.questions.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeQuestion(questionIndex)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Question Text */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Question</Label>
                  {isEditing ? (
                    <Textarea
                      value={question.questionText}
                      onChange={(e) => updateQuestion(questionIndex, 'questionText', e.target.value)}
                      placeholder="Enter your question here..."
                      rows={3}
                    />
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-900">{question.questionText}</p>
                    </div>
                  )}
                </div>

                {/* Answer Options */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Answer Options</Label>
                    {isEditing && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addAnswer(questionIndex)}
                        disabled={question.answers.length >= 5}
                      >
                        <Plus className="mr-2 h-3 w-3" />
                        Add Option
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    {question.answers.map((answer, answerIndex) => (
                      <div key={answer.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          {isEditing ? (
                            <Checkbox
                              checked={answer.isCorrect}
                              onCheckedChange={(checked) => 
                                updateAnswer(questionIndex, answerIndex, 'isCorrect', checked === true)
                              }
                            />
                          ) : (
                            answer.isCorrect ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <div className="w-5 h-5 border-2 border-gray-300 rounded"></div>
                            )
                          )}
                          <span className="text-sm font-medium text-gray-500">
                            {String.fromCharCode(65 + answerIndex)}
                          </span>
                        </div>
                        
                        <div className="flex-1">
                          {isEditing ? (
                            <Input
                              value={answer.text}
                              onChange={(e) => updateAnswer(questionIndex, answerIndex, 'text', e.target.value)}
                              placeholder={`Option ${String.fromCharCode(65 + answerIndex)}`}
                            />
                          ) : (
                            <span className={answer.isCorrect ? 'font-medium text-green-700' : ''}>
                              {answer.text}
                            </span>
                          )}
                        </div>
                        
                        {isEditing && question.answers.length > 2 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeAnswer(questionIndex, answerIndex)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {isEditing && (
                    <p className="text-xs text-gray-500">
                      Check the box next to correct answer(s). Multiple correct answers are allowed.
                    </p>
                  )}
                </div>

                {/* Explanation */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Explanation</Label>
                  {isEditing ? (
                    <Textarea
                      value={question.explanation}
                      onChange={(e) => updateQuestion(questionIndex, 'explanation', e.target.value)}
                      placeholder="Explain why the correct answer(s) are correct..."
                      rows={3}
                    />
                  ) : (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-blue-800">{question.explanation}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom Actions */}
        {isEditing && (
          <div className="flex justify-center gap-4 mt-8 pb-8">
            <Button variant="outline" onClick={handleCancel} size="lg">
              <X className="mr-2 h-4 w-4" />
              Cancel Changes
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges} size="lg">
              <Save className="mr-2 h-4 w-4" />
              Save Question Set
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}