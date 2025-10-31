import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/pages/auth/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { SubscriptionUtils, SubscriptionLevel } from '@/lib/subscription';

export function CreateContentDropdown() {
  const { user } = useAuth();
  const { error } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="relative h-10 w-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-64 bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-xl p-2">
          {/* Create Mock Test - chỉ dành cho User
          <DropdownMenuItem asChild>
            {SubscriptionUtils.canCreateMockTest(user) ? (
              <Link to="/create-mock-test" onClick={() => setIsOpen(false)} className="block">
                <div className="flex items-center gap-3 p-3 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 rounded-lg transition-all duration-300">
                  <div className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-orange-600">Create Mock Test</div>
                    <div className="text-xs text-gray-500">Add new test</div>
                  </div>
                </div>
              </Link>
            ) : (
              <div 
                onClick={() => {
                  setIsOpen(false);
                  error(SubscriptionUtils.getUpgradeMessage(SubscriptionLevel.PREMIUM), 'Cần nâng cấp subscription');
                }}
                className="block cursor-pointer"
              >
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg opacity-60">
                  <div className="p-2 bg-gray-400 rounded-lg">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-500 flex items-center gap-2">
                      Create Mock Test
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">LOCKED</span>
                    </div>
                    <div className="text-xs text-gray-400">Cần PREMIUM+</div>
                  </div>
                </div>
              </div>
            )}
          </DropdownMenuItem> */}

          {/* Generate Mock Test By AI - chỉ dành cho User */}
          <DropdownMenuItem asChild>
            {SubscriptionUtils.canCreateMockTest(user) ? (
              <Link to="/generate-mock-test-AI" onClick={() => setIsOpen(false)} className="block">
                <div className="flex items-center gap-3 p-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 rounded-lg transition-all duration-300">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-purple-600">Generate Mock Test By AI</div>
                    <div className="text-xs text-gray-500">AI-powered test generation</div>
                  </div>
                </div>
              </Link>
            ) : (
              <div 
                onClick={() => {
                  setIsOpen(false);
                  error(SubscriptionUtils.getUpgradeMessage(SubscriptionLevel.PREMIUM), 'Cần nâng cấp subscription');
                }}
                className="block cursor-pointer"
              >
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg opacity-60">
                  <div className="p-2 bg-gray-400 rounded-lg">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-500 flex items-center gap-2">
                      Generate Mock Test By AI
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">LOCKED</span>
                    </div>
                    <div className="text-xs text-gray-400">Cần PREMIUM+</div>
                  </div>
                </div>
              </div>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}