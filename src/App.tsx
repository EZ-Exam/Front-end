import { AppRouter } from '@/routes/AppRouter';
import { Toaster } from '@/components/ui/sonner';
import { Toaster as UIToaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/pages/auth/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { LanguageProvider } from '@/contexts/LanguageContext';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <LanguageProvider>
          <AppRouter />
          <Toaster />
          <UIToaster />
        </LanguageProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;