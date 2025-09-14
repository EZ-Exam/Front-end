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
import { Bell, Search, Settings, User, LogOut, Menu } from 'lucide-react';
import { mockUser } from '@/data/mockData';
import EZEXAMLogo from '@/assest/EZEXAM_Icon.png';

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

        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            3
          </span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={mockUser.avatar} />
                <AvatarFallback>{mockUser.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="hidden md:block font-medium">{mockUser.name}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="p-2">
              <p className="font-medium">{mockUser.name}</p>
              <p className="text-sm text-gray-500">{mockUser.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/profile">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}