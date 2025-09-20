import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, Search, Settings, User, LogOut, Menu,Crown } from 'lucide-react';
import { mockUser,mockUserAccount } from '@/data/mockData';
import EZEXAMLogo from '@/assest/EZEXAM_Icon.png';
import {NotificationDropdown} from '@/components/Layout/NotificationDropdown';
import { CreateContentDropdown } from './CreateContentDropdown';
import { AccountDropdown } from './AccountDropdown';
interface HeaderProps {
  onMenuToggle: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-6 h-16 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden"
          onClick={onMenuToggle}
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              <img src={EZEXAMLogo} alt='Logo' className='w-14 h-10'/>
            </span>
          </div>
          <span className="font-bold text-xl text-gray-900">EZEXAM</span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 w-80">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search lessons, exercises..."
            className="bg-transparent border-none outline-none flex-1 text-sm"
          />
        </div>

        <NotificationDropdown />

        <CreateContentDropdown />

        {/* Account Balance & Package */}
        <div className="hidden md:flex items-center gap-3 px-3 py-1 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-1">
            <Crown className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium capitalize">{mockUserAccount.packageType}</span>
          </div>
          <div className="text-sm font-medium text-green-600">
            ${mockUserAccount.balance.toFixed(2)}
          </div>
        </div>

        <AccountDropdown />

      </div>
    </header>
  );
}