import { AppRouter } from '@/routes/AppRouter';
import { Toaster } from '@/components/ui/sonner';
import { Toaster as UIToaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/pages/auth/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppRouter />
        <Toaster />
        <UIToaster />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;