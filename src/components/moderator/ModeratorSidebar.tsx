import { cn } from '@/lib/utils';
import { useAuth } from '@/pages/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CreditCard, 
  HelpCircle, 
  FileText,
  Shield,
  LogOut
} from 'lucide-react';

interface ModeratorSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function ModeratorSidebar({ activeTab, onTabChange }: ModeratorSidebarProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    {
      id: 'lessons',
      label: 'Lessons',
      icon: LayoutDashboard,
      description: 'Quản lý bài học'
    },
    {
      id: 'questions',
      label: 'Questions',
      icon: HelpCircle,
      description: 'Quản lý câu hỏi'
    },
    {
      id: 'exams',
      label: 'Mock Tests',
      icon: FileText,
      description: 'Quản lý đề thi'
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-full bg-gray-800 border-b border-gray-700 h-16 flex items-center justify-between px-6">
      {/* Logo and Title */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-white font-bold text-lg">Moderator Panel</h2>
          <p className="text-gray-400 text-xs">EZ EXAM Content Management</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex items-center space-x-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 relative group",
                isActive
                  ? "bg-purple-600 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              )}
              title={item.description}
            >
              <Icon className={cn(
                "w-4 h-4",
                isActive ? "text-white" : "text-gray-400"
              )} />
              <span className="font-medium text-sm">{item.label}</span>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                {item.description}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="flex items-center">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 text-red-400 hover:bg-red-900/20 hover:text-red-300 relative group"
          title="Đăng xuất khỏi hệ thống"
        >
          <LogOut className="w-4 h-4" />
          <span className="font-medium text-sm">Đăng xuất</span>
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
            Đăng xuất khỏi hệ thống
            <div className="absolute top-full right-4 border-4 border-transparent border-t-gray-900"></div>
          </div>
        </button>
      </div>
    </div>
  );
}

