import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { AdminExam } from '@/types';

interface ExamDetailModalProps {
  exam: AdminExam | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ExamDetailModal({ exam, isOpen, onClose }: ExamDetailModalProps) {
  if (!exam) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 border-gray-700 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">Mock Test Details #{exam.id}</DialogTitle>
          <DialogDescription className="text-gray-400">
            Detailed information about Mock Test
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
                  <span className="text-white">{exam.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Name:</span>
                  <span className="text-white font-medium">{exam.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Subject:</span>
                  <Badge variant="outline" className="text-white border-gray-500">
                    {exam.subjectName || 'N/A'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Exam Type:</span>
                  <Badge variant="secondary" className="text-white">
                    {exam.examTypeName || 'N/A'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Lesson:</span>
                  <span className="text-white">{exam.lessonName || 'N/A'}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-2">Creation Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Creator:</span>
                  <span className="text-white">{exam.createdByUserName || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Created:</span>
                  <span className="text-white">{new Date(exam.createdAt).toLocaleString('vi-VN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Updated:</span>
                  <span className="text-white">{new Date(exam.updatedAt).toLocaleString('vi-VN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <div className="flex gap-1">
                    <Badge variant={exam.isActive ? 'default' : 'destructive'} className="text-xs">
                      {exam.isActive ? 'Active' : 'Locked'}
                    </Badge>
                    {exam.isPublic && (
                      <Badge variant="outline" className="text-xs text-green-400 border-green-400">
                        Public
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {exam.description && (
            <div>
              <h3 className="text-white font-semibold mb-2">Description</h3>
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-white whitespace-pre-wrap">{exam.description}</p>
              </div>
            </div>
          )}

          {/* Technical Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-white font-semibold mb-2">Technical Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Number of Questions:</span>
                  <span className="text-white">{exam.totalQuestions || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Score:</span>
                  <span className="text-white">{exam.totalMarks || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Time (minutes):</span>
                  <span className="text-white">{exam.duration || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Time Limit:</span>
                  <span className="text-white">{exam.timeLimit || 0} minutes</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-2">Statistics</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Attempts:</span>
                  <span className="text-white">{exam.historyCount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Auto Generated:</span>
                  <Badge variant={exam.isAutoGenerated ? 'default' : 'secondary'} className="text-xs">
                    {exam.isAutoGenerated ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Generation Source:</span>
                  <span className="text-white">{exam.generationSource || 'Manual'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Deleted:</span>
                  <Badge variant={exam.isDeleted ? 'destructive' : 'default'} className="text-xs">
                    {exam.isDeleted ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Test Configuration */}
          {exam.testConfiguration && (
            <div>
              <h3 className="text-white font-semibold mb-2">Test Configuration</h3>
              <div className="bg-gray-700 p-4 rounded-lg">
                <pre className="text-white text-sm whitespace-pre-wrap">{exam.testConfiguration}</pre>
              </div>
            </div>
          )}

          {/* Difficulty Distribution */}
          {exam.difficultyDistribution && (
            <div>
              <h3 className="text-white font-semibold mb-2">Difficulty Distribution</h3>
              <div className="bg-gray-700 p-4 rounded-lg">
                <pre className="text-white text-sm whitespace-pre-wrap">{exam.difficultyDistribution}</pre>
              </div>
            </div>
          )}

          {/* Topic Distribution */}
          {exam.topicDistribution && (
            <div>
              <h3 className="text-white font-semibold mb-2">Topic Distribution</h3>
              <div className="bg-gray-700 p-4 rounded-lg">
                <pre className="text-white text-sm whitespace-pre-wrap">{exam.topicDistribution}</pre>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
