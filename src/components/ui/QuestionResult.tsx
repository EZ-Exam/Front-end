import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle, Info } from 'lucide-react';
import { QuestionResult as QuestionResultType } from '@/types';

interface QuestionResultProps {
  result: QuestionResultType;
  explanation: string;
  correctAnswerTexts: string[];
  selectedAnswerTexts: string[];
}

export function QuestionResult({ result, explanation, correctAnswerTexts, selectedAnswerTexts }: QuestionResultProps) {
  return (
    <Card className={`border-l-4 ${result.isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            {result.isCorrect ? (
              <CheckCircle className="h-6 w-6 text-green-600" />
            ) : (
              <XCircle className="h-6 w-6 text-red-600" />
            )}
          </div>
          
          <div className="flex-1 space-y-3">
            <div>
              <h3 className={`font-semibold text-lg ${result.isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                {result.isCorrect ? 'Correct!' : 'Incorrect'}
              </h3>
            </div>
            
            <div className="space-y-2">
              <div>
                <span className="font-medium text-sm">Your Answer: </span>
                <span className={result.isCorrect ? 'text-green-700' : 'text-red-700'}>
                  {selectedAnswerTexts.join(', ') || 'No answer selected'}
                </span>
              </div>
              
              {!result.isCorrect && (
                <div>
                  <span className="font-medium text-sm">Correct Answer: </span>
                  <span className="text-green-700">
                    {correctAnswerTexts.join(', ')}
                  </span>
                </div>
              )}
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-sm text-blue-900 block mb-1">Explanation:</span>
                  <p className="text-sm text-blue-800">{explanation}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}