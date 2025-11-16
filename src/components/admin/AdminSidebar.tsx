import { cn } from '@/lib/utils';
import { useAuth } from '@/pages/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  BarChart3,
  LogOut,
  Wallet
} from 'lucide-react';

interface AdminHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function AdminSidebar({ activeTab, onTabChange }: AdminHeaderProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Admin Dashboard',
      icon: LayoutDashboard,
      description: 'System Overview'
    },
    {
      id: 'users',
      label: 'Manage Users',
      icon: Users,
      description: 'User Management'
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: Wallet,
      description: 'Payment Management'
    },
    {
      id: 'subscriptions',
      label: 'Subscriptions',
      icon: CreditCard,
      description: 'Subscription Management'
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
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-white font-bold text-lg">Admin Panel</h2>
          <p className="text-gray-400 text-xs">EZ EXAM Management</p>
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
                  ? "bg-blue-600 text-white"
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
          title="Sign out of system"
        >
          <LogOut className="w-4 h-4" />
          <span className="font-medium text-sm">Log out</span>
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
            Sign out of system
            <div className="absolute top-full right-4 border-4 border-transparent border-t-gray-900"></div>
          </div>
        </button>
      </div>
    </div>
  );
}
