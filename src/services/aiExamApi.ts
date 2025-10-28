import api from './axios';
import { AIExamGenerationRequest, AIExamGenerationResponse } from '@/types';

// AI Exam Generation API Service
export class AIExamApiService {
  // Generate AI-powered exam
  static async generateExam(request: AIExamGenerationRequest): Promise<AIExamGenerationResponse> {
    try {
      console.log('request payload for AI Exam Generation', request);
      const response = await api.post<AIExamGenerationResponse>('/ai-exam/generate', request);
      return response.data;
    } catch (error) {
      console.error('Error generating AI exam:', error);
      throw error;
    }
  }
}

export default AIExamApiService;
