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
import { ExercisesPage } from '@/pages/exercises/ExercisesPage';
import { ExerciseDetailPage } from '@/pages/exercises/ExerciseDetailPage';
import { MockTestsPage } from '@/pages/mock-tests/MockTestsPage';
import { MockTestDetailPage } from '@/pages/mock-tests/MockTestDetailPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';

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
          <Route path="analytics" element={<AnalyticsPage />} />
          
          {/* Lessons Routes */}
          <Route path="lessons" element={<LessonsPage />} />
          <Route path="lessons/:id" element={<LessonDetailPage />} />
          
          {/* Exercises Routes */}
          <Route path="exercises" element={<ExercisesPage />} />
          <Route path="exercises/:id" element={<ExerciseDetailPage />} />
          
          {/* Mock Tests Routes */}
          <Route path="mock-tests" element={<MockTestsPage />} />
          <Route path="mock-tests/:id" element={<MockTestDetailPage />} />
        </Route>
        
        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}