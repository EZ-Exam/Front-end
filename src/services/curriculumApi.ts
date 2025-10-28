import api from './axios';

// Semester API Service
export interface Semester {
  id: number;
  name: string;
  gradeId: number;
  gradeName: string;
  createdAt: string;
  updatedAt: string;
}

export class SemesterApiService {
  static async getSemestersByGrade(gradeId: number): Promise<Semester[]> {
    try {
      const response = await api.get<Semester[]>(`/semesters/by-grade/${gradeId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching semesters by grade:', error);
      throw error;
    }
  }
}

// Chapter API Service
export interface Chapter {
  id: number;
  name: string;
  semesterId: number;
  createdAt: string;
  updatedAt: string;
}

export class ChapterApiService {
  static async getChaptersBySemester(semesterId: number): Promise<Chapter[]> {
    try {
      const response = await api.get<Chapter[]>(`/chapters/by-semester/${semesterId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching chapters by semester:', error);
      throw error;
    }
  }

  static async getChaptersBySemesterAndSubject(semesterId: number, subjectId: number): Promise<Chapter[]> {
    try {
      const response = await api.get<Chapter[]>(`/chapters/semester/${semesterId}/subject/${subjectId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching chapters by semester and subject:', error);
      throw error;
    }
  }
}

// Lesson API Service
export interface Lesson {
  id: number;
  name: string;
  chapterId: number;
  gradeId: number;
  document: string;
  documentType: string;
  createdAt: string;
  updatedAt: string;
}

export class LessonApiService {
  static async getLessonsByChapter(chapterId: number): Promise<Lesson[]> {
    try {
      const response = await api.get<Lesson[]>(`/lessons/by-chapter/${chapterId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching lessons by chapter:', error);
      throw error;
    }
  }
}

export default { SemesterApiService, ChapterApiService, LessonApiService };
