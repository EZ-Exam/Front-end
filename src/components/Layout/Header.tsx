import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search, Menu, Crown } from 'lucide-react';
import { mockUserAccount } from '@/data/mockData';
import EZEXAMLogo from '@/assest/EZEXAM_Icon.png';
import {NotificationDropdown} from '@/components/Layout/NotificationDropdown';
import { CreateContentDropdown } from './CreateContentDropdown';
import { AccountDropdown } from './AccountDropdown';
import { useAuth } from '@/pages/auth/AuthContext';
interface HeaderProps {
  onMenuToggle: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { isAuthenticated } = useAuth();

  // Function to check if user is authenticated
  const checkUserAuthentication = (): boolean => {
    return isAuthenticated;
  };

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200/50 px-4 lg:px-6 h-16 flex items-center justify-between shadow-xl relative overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 via-transparent to-purple-50/30 pointer-events-none"></div>
      
      <div className="flex items-center gap-4 relative z-10">
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-300 hover:scale-105"
          onClick={onMenuToggle}
        >
          <Menu className="h-5 w-5 text-gray-600" />
        </Button>
        
        <Link to="/" className="flex items-center gap-3 group">
            <img src={EZEXAMLogo} alt='Logo' className='w-8 h-6 relative z-10'/>
          <span className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-purple-700 transition-all duration-300">
            EZEXAM
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-4 relative z-10">
        <div className="hidden md:flex items-center gap-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl px-4 py-3 w-80 border-2 border-gray-200 focus-within:border-blue-500 focus-within:shadow-lg transition-all duration-300 hover:shadow-md">
          <div className="p-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
            <Search className="h-4 w-4 text-white" />
          </div>
          <input
            type="text"
            placeholder="Search lessons, exercises..."
            className="bg-transparent border-none outline-none flex-1 text-sm font-medium placeholder-gray-500"
          />
        </div>

        {checkUserAuthentication() && <NotificationDropdown />}

        {checkUserAuthentication() && <CreateContentDropdown />}

        {/* Enhanced Account Balance & Package */}
        {checkUserAuthentication() && (
          <div className="hidden md:flex items-center gap-4 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg shadow-md">
                <Crown className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-700 capitalize">{mockUserAccount.packageType}</span>
            </div>
            <div className="text-sm font-bold text-green-600 bg-gradient-to-r from-green-100 to-green-200 px-3 py-1 rounded-lg shadow-md">
              ${mockUserAccount.balance.toFixed(2)}
            </div>
          </div>
        )}

        <AccountDropdown />
      </div>
    </header>
  );
}