import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout/Layout';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { SettingsPage } from '@/pages/SettingsPage';
import { HelpPage } from '@/pages/HelpPage';
import { LessonsPage } from '@/pages/lessons/LessonsPage';
import { LessonDetailPage } from '@/pages/lessons/LessonDetailPage';
import { CreateLessonPage } from '@/pages/lessons/CreateLessonPage';
import { MockTestsPage } from '@/pages/mock-tests/MockTestsPage';
import { MockTestDetailPage } from '@/pages/mock-tests/MockTestDetailPage';
import { CreateMockTestPage } from '@/pages/mock-tests/CreateMockTestPage';
import { QuestionBankPage } from '@/pages/question-bank/QuestionBankPage';
import { CreateQuestionSetPage } from '@/pages/question-bank/CreateQuestionSetPage';
import { NotificationsPage } from '@/pages/NotificationPage';
import { QuestionBankDetailPage } from '@/pages/question-bank/QuestionBankDetailPagr';

export function AppRouter() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Protected Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="help" element={<HelpPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          
          {/* Lessons Routes */}
          <Route path="lessons" element={<LessonsPage />} />
          <Route path="lessons/:id" element={<LessonDetailPage />} />
          <Route path="create-lesson" element={<CreateLessonPage />} />
          
          {/* Question Bank Routes */}
          <Route path="question-bank" element={<QuestionBankPage />} />
          <Route path="question-bank/:id/:mode" element={<QuestionBankDetailPage />} />
          <Route path="create-question-set" element={<CreateQuestionSetPage />} />
          
          {/* Mock Tests Routes */}
          <Route path="mock-tests" element={<MockTestsPage />} />
          <Route path="mock-tests/:id" element={<MockTestDetailPage />} />
          <Route path="create-mock-test" element={<CreateMockTestPage />} />
        </Route>
        
        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}