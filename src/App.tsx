import { AppRouter } from '@/routes/AppRouter';
import { Toaster } from '@/components/ui/sonner';
import { Toaster as UIToaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/pages/auth/AuthContext';

function App() {
  return (
    <AuthProvider>
      <AppRouter />
      <Toaster />
      <UIToaster />
    </AuthProvider>
  );
}

export default App;