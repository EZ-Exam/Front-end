import { Outlet } from 'react-router-dom';
import { GlobalLoadingProvider } from '@/contexts/GlobalLoadingContext';
import { Header } from './Header';
import { Footer } from './Footer';
import { SupportChat } from './SupportChat';

export function Layout() {
  return (
    <GlobalLoadingProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Fixed Header */}
        <div className="fixed top-0 left-0 right-0 z-50">
          <Header />
        </div>
        
        {/* Main Content with proper spacing - flex-1 to push footer down */}
        <div className="flex flex-1">
          <main className="flex-1 p-6 pt-24 pb-6" >
            <Outlet />
          </main>
        </div>
        
        {/* Footer - always at bottom of viewport */}
        <div className="mt-auto">
          <Footer />
          <SupportChat />
        </div>
      </div>
    </GlobalLoadingProvider>
  );
}