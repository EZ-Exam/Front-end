import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { AdminQuestion } from '@/types';

interface QuestionDetailModalProps {
  question: AdminQuestion | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuestionDetailModal({ question, isOpen, onClose }: QuestionDetailModalProps) {
  if (!question) return null;

  const getDifficultyText = (level: number) => {
    switch (level) {
      case 1: return 'Easy';
      case 2: return 'Medium';
      case 3: return 'Hard';
      default: return 'Unknown';
    }
  };

  const getDifficultyColor = (level: number) => {
    switch (level) {
      case 1: return 'default';
      case 2: return 'secondary';
      case 3: return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 border-gray-700 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">Question Details #{question.id}</DialogTitle>
          <DialogDescription className="text-gray-400">
            Detailed information about the question
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-white font-semibold mb-2">Basic Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">ID:</span>
                  <span className="text-white">{question.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Type:</span>
                  <Badge variant="outline" className="text-white border-gray-500">
                    {question.type || 'N/A'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Difficulty:</span>
                  <Badge variant={getDifficultyColor(question.difficultyLevelId)}>
                    {getDifficultyText(question.difficultyLevelId)}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Lesson:</span>
                  <span className="text-white">{question.lessonName || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Chapter:</span>
                  <span className="text-white">{question.chapterName || 'N/A'}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-2">Creation Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Creator:</span>
                  <span className="text-white">{question.createdByUserName || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Created:</span>
                  <span className="text-white">{new Date(question.createdAt).toLocaleString('vi-VN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Updated:</span>
                  <span className="text-white">{new Date(question.updatedAt).toLocaleString('vi-VN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Source:</span>
                  <span className="text-white">{question.questionSource || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Question Content */}
          <div>
            <h3 className="text-white font-semibold mb-2">Question Content</h3>
            <div className="bg-gray-700 p-4 rounded-lg">
              <p className="text-white whitespace-pre-wrap">{question.content}</p>
            </div>
          </div>

          {/* Formula (if any) */}
          {question.formula && (
            <div>
              <h3 className="text-white font-semibold mb-2">Formula</h3>
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-white font-mono">{question.formula}</p>
              </div>
            </div>
          )}

          {/* Image (if any) */}
          {question.image && (
            <div>
              <h3 className="text-white font-semibold mb-2">Image</h3>
              <div className="bg-gray-700 p-4 rounded-lg">
                <img 
                  src={question.image} 
                  alt="Question image" 
                  className="max-w-full h-auto rounded"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}

          {/* Options */}
          {question.options && question.options.length > 0 && (
            <div>
              <h3 className="text-white font-semibold mb-2">Options</h3>
              <div className="space-y-2">
                {question.options.map((option, index) => (
                  <div key={index} className="bg-gray-700 p-3 rounded-lg">
                    <span className="text-gray-400 mr-2">{String.fromCharCode(65 + index)}.</span>
                    <span className="text-white">{option}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Correct Answer */}
          <div>
            <h3 className="text-white font-semibold mb-2">Correct Answer</h3>
            <div className="bg-green-900/20 border border-green-500 p-4 rounded-lg">
              <p className="text-green-400 font-semibold">{question.correctAnswer}</p>
            </div>
          </div>

          {/* Explanation */}
          {question.explanation && (
            <div>
              <h3 className="text-white font-semibold mb-2">Explanation</h3>
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-white whitespace-pre-wrap">{question.explanation}</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
