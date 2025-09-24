import { AppRouter } from '@/routes/AppRouter';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/pages/auth/AuthContext';

function App() {
  return (
    <AuthProvider>
      <AppRouter />
      <Toaster />
    </AuthProvider>
  );
}

export default App;