import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout/Layout';
import { AdminRoute } from '@/components/AdminRoute';
import { ModeratorRoute } from '@/components/ModeratorRoute';
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
import { MockTestAnalyticsPage } from '@/pages/mock-tests/MockTestAnalyticsPage';
import { MockTestHistoryPage } from '@/pages/mock-tests/MockTestHistoryPage';
import { MockTestHistoryDetailPage } from '@/pages/mock-tests/MockTestHistoryDetailPage';
import { CreateMockTestPage } from '@/pages/mock-tests/CreateMockTestPage';
import { QuestionBankPage } from '@/pages/question-bank/QuestionBankPage';
import { NotificationsPage } from '@/pages/NotificationPage';
import { QuestionBankDetailPage } from '@/pages/question-bank/QuestionBankDetailPage';
import { TermsOfServicePage } from '@/pages/TermsOfServicePage';
import { PrivacyPolicyPage } from '@/pages/PrivacyPolicyPage';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { ModeratorDashboardPage } from '@/pages/moderator/ModeratorDashboardPage';
import { AdminDemoPage } from '@/pages/AdminDemoPage';

export function AppRouter() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Legal Pages */}
        <Route path="/terms" element={<TermsOfServicePage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        
        {/* Demo Pages */}
        <Route path="/admin-demo" element={<AdminDemoPage />} />
        
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
          <Route path="question-bank/:id" element={<QuestionBankDetailPage />} />
          
          {/* Mock Tests Routes */}
          <Route path="mock-tests" element={<MockTestsPage />} />
          <Route path="mock-tests/:id" element={<MockTestDetailPage />} />
          <Route path="mock-tests/:id/analytics" element={<MockTestAnalyticsPage />} />
          <Route path="mock-tests/history" element={<MockTestHistoryPage />} />
          <Route path="mock-tests/history/:id" element={<MockTestHistoryDetailPage />} />
          <Route path="create-mock-test" element={<CreateMockTestPage />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminDashboardPage />
          </AdminRoute>
        } />
        
        {/* Moderator Routes */}
        <Route path="/moderator" element={
          <ModeratorRoute>
            <ModeratorDashboardPage />
          </ModeratorRoute>
        } />
        
        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}