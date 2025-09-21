import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { SupportChat } from './SupportChat';

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      </div>
      
      {/* Fixed Sidebar - only on desktop */}
      <div className="hidden lg:block fixed top-16 left-0 bottom-0 z-40">
        <Sidebar isOpen={true} onClose={() => setSidebarOpen(false)} />
      </div>
      
      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>
      
      {/* Main Content with proper spacing */}
      <div className="flex">
        <main className="flex-1 lg:ml-64 p-6 pt-24" >
          <Outlet />
        </main>
      </div>
      
      {/* Footer */}
      <Footer />
      <SupportChat />
    </div>
  );
}