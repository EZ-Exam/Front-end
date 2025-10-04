import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Home,
  BookOpen,
  FileText,
  User,
  Settings,
  HelpCircle, 
  PenTool,
  X,
  Sparkles,
  Zap,
  History
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: 'Home', href: '/', icon: Home, color: 'from-blue-500 to-blue-600' },
  { name: 'Lessons', href: '/lessons', icon: BookOpen, color: 'from-green-500 to-green-600' },
  { name: 'Question Bank', href: '/question-bank', icon: PenTool, color: 'from-purple-500 to-purple-600' },
  { name: 'Mock Tests', href: '/mock-tests', icon: FileText, color: 'from-orange-500 to-orange-600' },
  { name: 'Mock Test History', href: '/mock-tests/history', icon: History, color: 'from-indigo-500 to-indigo-600' },
  { name: 'Profile', href: '/profile', icon: User, color: 'from-pink-500 to-pink-600' },
  { name: 'Settings', href: '/settings', icon: Settings, color: 'from-gray-500 to-gray-600' },
  { name: 'Help & Support', href: '/help', icon: HelpCircle, color: 'from-teal-500 to-teal-600' },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm lg:hidden z-40" onClick={onClose} />
      )}
      
      <aside className={cn(
        "fixed left-0 top-16 bottom-0 z-40 w-72 bg-white/95 backdrop-blur-sm border-r border-gray-200/50 transform transition-all duration-300 ease-in-out shadow-2xl",
        "lg:translate-x-0 lg:static lg:z-0 lg:shadow-none",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Enhanced Mobile Header */}
        <div className="flex items-center justify-between p-6 lg:hidden border-b border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              EZEXAM
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-red-50 rounded-xl">
            <X className="h-5 w-5 text-gray-600" />
          </Button>
        </div>
        
        {/* Enhanced Navigation */}
        <nav className="p-6 space-y-3">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "group flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 relative overflow-hidden",
                  isActive
                    ? `bg-gradient-to-r ${item.color} text-white shadow-lg transform scale-105`
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-md hover:scale-105"
                )}
                onClick={onClose}
              >
                {/* Background gradient for active state */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
                )}
                
                <div className={cn(
                  "p-2 rounded-lg transition-all duration-300",
                  isActive 
                    ? "bg-white/20 shadow-lg" 
                    : `bg-gradient-to-r ${item.color} group-hover:shadow-lg`
                )}>
                  <item.icon className={cn(
                    "h-5 w-5 transition-colors duration-300",
                    isActive ? "text-white" : "text-white group-hover:text-white"
                  )} />
                </div>
                
                <span className="relative z-10">{item.name}</span>
                
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute right-2 w-2 h-2 bg-white rounded-full shadow-lg"></div>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}