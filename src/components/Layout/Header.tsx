import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Crown, User, Star, Infinity, LogIn, UserPlus, Home, BookOpen, FileText, HelpCircle, PenTool, History } from 'lucide-react';
import EZEXAMLogo from '@/assest/EZEXAM_Icon.png';
import {NotificationDropdown} from '@/components/Layout/NotificationDropdown';
import { CreateContentDropdown } from './CreateContentDropdown';
import { AccountDropdown } from './AccountDropdown';
import { useAuth } from '@/pages/auth/AuthContext';
import { useState, useEffect } from 'react';
import api from '@/services/axios';
interface HeaderProps {
  onRefreshData?: (refreshFn: () => void) => void;
  refreshTrigger?: number; // Trigger to refresh data from outside
}

// Define type for balance API response
interface BalanceResponse {
  userId: number;
  userEmail: string;
  userName: string;
  previousBalance: number;
  addedAmount: number;
  newBalance: number;
  description: string;
  updatedAt: string;
}

// Define type for subscription API response
interface SubscriptionResponse {
  userId: number;
  userEmail: string;
  subscriptionTypeId: number;
  subscriptionCode: string;
  subscriptionName: string;
  subscriptionPrice: number;
  startDate: string;
  endDate: string;
  paymentStatus: string;
  isActive: boolean;
  message: string;
}

export function Header({ onRefreshData, refreshTrigger }: HeaderProps) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  
  // State for balance and subscription from API
  const [balanceData, setBalanceData] = useState<BalanceResponse | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionResponse | null>(null);

  // Function to check if user is authenticated
  const checkUserAuthentication = (): boolean => {
    return isAuthenticated;
  };

  // Function to fetch balance and subscription from APIs
  const fetchBalanceAndSubscription = async () => {
    if (!isAuthenticated) return;
    
    try {
      const [balanceResponse, subscriptionResponse] = await Promise.all([
        api.get('/balance/current'),
        api.get('/subscription/current')
      ]);

      if (balanceResponse.status === 200) {
        setBalanceData(balanceResponse.data);
      }
      
      if (subscriptionResponse.status === 200) {
        setSubscriptionData(subscriptionResponse.data);
      }
    } catch (error) {
      console.error('Error fetching balance and subscription:', error);
    }
  };

  // Function to refresh data (can be called from outside)
  const refreshData = () => {
    fetchBalanceAndSubscription();
  };

  // Load balance and subscription data when component mounts or authentication changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchBalanceAndSubscription();
    } else {
      // Clear data when user logs out
      setBalanceData(null);
      setSubscriptionData(null);
    }
  }, [isAuthenticated]);

  // Expose refresh function to parent component
  useEffect(() => {
    if (onRefreshData) {
      onRefreshData(refreshData);
    }
  }, [onRefreshData]);

  // Listen for refresh trigger from parent
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      fetchBalanceAndSubscription();
    }
  }, [refreshTrigger]);

  // Function to get subscription icon and colors
  const getSubscriptionInfo = (subscriptionName: string | null) => {
    const subscription = subscriptionName?.toLowerCase() || 'free';
    
    switch (subscription) {
      case 'free':
        return {
          icon: User,
          gradient: 'from-gray-500 to-gray-600',
          textColor: 'text-gray-700'
        };
      case 'basic':
        return {
          icon: Star,
          gradient: 'from-green-500 to-green-600',
          textColor: 'text-green-700'
        };
      case 'premium':
        return {
          icon: Crown,
          gradient: 'from-blue-500 to-blue-600',
          textColor: 'text-blue-700'
        };
      case 'unlimited':
        return {
          icon: Infinity,
          gradient: 'from-purple-500 to-purple-600',
          textColor: 'text-purple-700'
        };
      default:
        return {
          icon: User,
          gradient: 'from-gray-500 to-gray-600',
          textColor: 'text-gray-700'
        };
    }
  };

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200/50 px-4 lg:px-6 h-16 flex items-center justify-between shadow-xl relative overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 via-transparent to-purple-50/30 pointer-events-none"></div>
      
      <div className="flex items-center gap-4 relative z-10">
        <Link to="/" className="flex items-center gap-3 group">
            <img src={EZEXAMLogo} alt='Logo' className='w-8 h-6 relative z-10'/>
          <span className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-purple-700 transition-all duration-300">
            EZEXAM
          </span>
        </Link>
      </div>

      {/* Center navigation (moved from Sidebar) */}
      <nav className="hidden md:flex items-center gap-2 relative z-10">
        {[
          { name: 'Home', href: '/', icon: Home },
          { name: 'Lessons', href: '/lessons', icon: BookOpen },
          { name: 'Question Bank', href: '/question-bank', icon: PenTool },
          { name: 'Mock Tests', href: '/mock-tests', icon: FileText },
          { name: 'Mock Test History', href: '/mock-tests/history', icon: History },
          { name: 'Help & Support', href: '/help', icon: HelpCircle },
        ].map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-4 relative z-10">
        {checkUserAuthentication() && <NotificationDropdown />}

        {/* Create Content Dropdown - chỉ hiển thị cho Moderator và Admin */}
        {checkUserAuthentication() && <CreateContentDropdown />}

        {/* Enhanced Account Balance & Package */}
        {checkUserAuthentication() && user && (() => {
          // Use data from API if available, fallback to token data
          const subscriptionName = subscriptionData?.subscriptionName || user.subscriptionName || 'Free';
          const subscriptionInfo = getSubscriptionInfo(subscriptionName);
          const IconComponent = subscriptionInfo.icon;
          const balanceVND = balanceData?.newBalance || user.balance || 0;
          
          return (
            <div className="hidden md:flex items-center gap-4 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-2">
                <div className={`p-1 bg-gradient-to-r ${subscriptionInfo.gradient} rounded-lg shadow-md`}>
                  <IconComponent className="h-4 w-4 text-white" />
                </div>
                <span className={`text-sm font-semibold capitalize ${subscriptionInfo.textColor}`}>
                  {subscriptionName}
                </span>
              </div>
              <div className="text-sm font-bold text-green-600 bg-gradient-to-r from-green-100 to-green-200 px-3 py-1 rounded-lg shadow-md">
                {typeof balanceVND === 'string' 
                  ? parseInt(balanceVND).toLocaleString('vi-VN', { useGrouping: true }).replace(/,/g, '.')
                  : balanceVND.toLocaleString('vi-VN', { useGrouping: true }).replace(/,/g, '.')
                }₫
              </div>
            </div>
          );
        })()}

        {/* Authentication Buttons for Unauthenticated Users */}
        {!checkUserAuthentication() && (
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="hidden sm:flex items-center gap-2 px-4 py-2 border-2 border-blue-200 hover:border-blue-500 hover:bg-blue-50 text-blue-600 hover:text-blue-700 font-semibold transition-all duration-300 hover:scale-105 rounded-xl shadow-md hover:shadow-lg"
              asChild
            >
              <Link to="/login">
                <LogIn className="h-4 w-4" />
                Sign In
              </Link>
            </Button>
            
            <Button 
              size="sm" 
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold transition-all duration-300 hover:scale-105 rounded-xl shadow-lg hover:shadow-xl"
              asChild
            >
              <Link to="/register">
                <UserPlus className="h-4 w-4" />
                Sign Up
              </Link>
            </Button>
          </div>
        )}

        {checkUserAuthentication() && <AccountDropdown onSubscriptionUpdated={refreshData} />}
      </div>
    </header>
  );
}