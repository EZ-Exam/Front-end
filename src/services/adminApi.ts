import api from './axios';
import { AdminStats, AdminUser, AdminQuestion, AdminExam, ApiResponse } from '@/types';

// Admin API Service
export class AdminApiService {
  // Lấy thống kê tổng quan
  static async getAdminStats(): Promise<AdminStats> {
    try {
      const response = await api.get<AdminStats>('/users/total-count');
      return response.data;
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      throw error;
    }
  }

  // Lấy danh sách users với pagination và filtering
  static async getUsers(params?: {
    pageNumber?: number;
    pageSize?: number;
    search?: string;
    sort?: string;
    isSort?: number;
  }): Promise<ApiResponse<AdminUser>> {
    try {
      const response = await api.get<AdminUser[]>('/users', { params });
      
      // Transform response to match ApiResponse format
      // Note: Backend returns array directly, we need to create pagination structure
      const items = response.data;
      return {
        items,
        pageNumber: params?.pageNumber || 1,
        pageSize: params?.pageSize || items.length,
        totalItems: items.length,
        totalPages: Math.ceil(items.length / (params?.pageSize || items.length))
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // Lấy danh sách questions với pagination và filtering
  static async getQuestions(params?: {
    pageNumber?: number;
    pageSize?: number;
    search?: string;
    sort?: string;
    lessonId?: number;
    difficultyLevel?: string;
    chapterId?: number;
    gradeId?: number;
    isSort?: number;
    userId?: number;
    textbookId?: number;
  }): Promise<ApiResponse<AdminQuestion>> {
    try {
      const response = await api.get<ApiResponse<AdminQuestion>>('/questions', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching questions:', error);
      throw error;
    }
  }

  // Lấy danh sách exams (Mock Tests) với pagination và filtering
  static async getExams(params?: {
    pageNumber?: number;
    pageSize?: number;
    search?: string;
    sort?: string;
    subjectId?: number;
    lessonId?: number;
    examTypeId?: number;
    createdByUserId?: number;
    isSort?: number;
  }): Promise<ApiResponse<AdminExam>> {
    try {
      const response = await api.get<ApiResponse<AdminExam>>('/exams', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching exams:', error);
      throw error;
    }
  }

  // Khôi phục tài khoản user
  static async restoreUser(userId: number): Promise<void> {
    try {
      await api.patch(`/users/${userId}/restore`);
    } catch (error) {
      console.error('Error restoring user:', error);
      throw error;
    }
  }

  // Vô hiệu hóa tài khoản user
  static async deactivateUser(userId: number): Promise<void> {
    try {
      await api.patch(`/users/${userId}/deactivate`);
    } catch (error) {
      console.error('Error deactivating user:', error);
      throw error;
    }
  }

  // Xóa câu hỏi
  static async deleteQuestion(questionId: number): Promise<void> {
    try {
      await api.delete(`/questions/${questionId}`);
    } catch (error) {
      console.error('Error deleting question:', error);
      throw error;
    }
  }

  // Xóa exam
  static async deleteExam(examId: number): Promise<void> {
    try {
      await api.delete(`/exams/${examId}`);
    } catch (error) {
      console.error('Error deleting exam:', error);
      throw error;
    }
  }

  // Cập nhật trạng thái câu hỏi
  static async updateQuestionStatus(questionId: number, isActive: boolean): Promise<void> {
    try {
      await api.patch(`/questions/${questionId}/status`, { isActive });
    } catch (error) {
      console.error('Error updating question status:', error);
      throw error;
    }
  }

  // Cập nhật trạng thái exam
  static async updateExamStatus(examId: number, isActive: boolean): Promise<void> {
    try {
      await api.patch(`/exams/${examId}/status`, { isActive });
    } catch (error) {
      console.error('Error updating exam status:', error);
      throw error;
    }
  }
}

export default AdminApiService;
