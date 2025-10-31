import api from './axios';
import { AIExamGenerationRequest, AIExamGenerationResponse } from '@/types';

// AI Exam Generation API Service
export class AIExamApiService {
  // Generate AI-powered exam
  static async generateExam(request: AIExamGenerationRequest): Promise<AIExamGenerationResponse> {
    try {
      console.log('request payload for AI Exam Generation', request);
      const response = await api.post('/ai-exam/generate', request);

      // The backend may return either:
      // 1) { success, message, questions, metadata }
      // 2) { success, data: { success, message, questions, metadata }, examId, message, note }
      const raw = response.data;
      const inner = raw?.data && (raw.data.questions || raw.data.metadata) ? raw.data : raw;

      const normalized: AIExamGenerationResponse = {
        success: Boolean(inner?.success ?? raw?.success ?? true),
        message: inner?.message || raw?.message || 'Generated successfully',
        questions: inner?.questions || [],
        metadata: inner?.metadata || {
          examId: raw?.examId ?? 0,
          totalQuestions: (request.questionCount ?? inner?.questions?.length) || 0,
          mode: request.mode,
          userId: request.userId,
          generatedAt: new Date().toISOString(),
          aiModel: 'unknown',
          tokensUsed: 0,
          processingTimeSeconds: 0,
          analysis: '',
          difficultyDistribution: {},
          subjectDistribution: {}
        }
      };

      return normalized;
    } catch (error) {
      console.error('Error generating AI exam:', error);
      throw error;
    }
  }
}

export default AIExamApiService;
