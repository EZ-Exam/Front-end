import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/axios';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  LogOut, 
  Settings, 
  PlusCircle, 
  TrendingUp,
  Crown,
  Sparkles,
  Zap,
  Star,
  Infinity,
  X
} from 'lucide-react';
import { useAuth } from '@/pages/auth/AuthContext';
import { useToast } from '@/contexts/ToastContext';

interface AccountDropdownProps {
  onSubscriptionUpdated?: () => void; // Callback để thông báo Header refresh
}

// Define subscription type interface
interface SubscriptionType {
  id: number;
  subscriptionCode: string;
  subscriptionName: string;
  subscriptionPrice: number;
  description: string;
  maxSolutionViews: number;
  maxAIRequests: number;
  isAIEnabled: boolean;
  features: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  updatedBy: string | null;
  updatedByName: string | null;
}

// Define current subscription interface from API
interface CurrentSubscription {
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

export function AccountDropdown({ onSubscriptionUpdated }: AccountDropdownProps = {}) {
  const { user, logout, isAuthenticated } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [activeDialog, setActiveDialog] = useState<'deposit' | 'upgrade' | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [subscriptionTypes, setSubscriptionTypes] = useState<SubscriptionType[]>([]);
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscription | null>(null);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);

  // Predefined deposit amounts
  const predefinedAmounts = [2000, 5000, 10000, 50000, 100000, 500000];

  // Function to format number with Vietnamese locale
  const formatCurrency = (amount: number | string): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return '0';
    return numAmount.toLocaleString('vi-VN');
  };

  // Function to parse formatted currency back to number
  const parseCurrency = (formattedAmount: string): number => {
    return parseFloat(formattedAmount.replace(/[.,]/g, '')) || 0;
  };

  // Function to handle predefined amount selection
  const handlePredefinedAmount = (amount: number) => {
    setDepositAmount(formatCurrency(amount));
  };

  // User data is now managed by AuthContext, no need to fetch here

  // Fetch subscription types from API
  const fetchSubscriptionTypes = async () => {
    setIsLoadingSubscriptions(true);
    try {
      const response = await api.get('/subscription-types');
      if (response.status === 200) {
        setSubscriptionTypes(response.data);
        console.log('Subscription types loaded:', response.data);
      }
    } catch (error) {
      console.error('Error fetching subscription types:', error);
    } finally {
      setIsLoadingSubscriptions(false);
    }
  };

  // Fetch current subscription from API
  const fetchCurrentSubscription = async () => {
    try {
      const response = await api.get('/subscription/current');
      if (response.status === 200) {
        setCurrentSubscription(response.data);
        console.log('Current subscription loaded:', response.data);
      }
    } catch (error) {
      console.error('Error fetching current subscription:', error);
      setCurrentSubscription(null);
    }
  };



  // Load subscription types and current subscription when upgrade dialog opens
  useEffect(() => {
    if (activeDialog === 'upgrade') {
      if (subscriptionTypes.length === 0) {
        fetchSubscriptionTypes();
      }
      fetchCurrentSubscription();
    }
  }, [activeDialog]);

  // Load current subscription when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      fetchCurrentSubscription();
    }
  }, [isAuthenticated]);


  const handleLogin = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseCurrency(depositAmount);
    
    // Validation
    if (amount < 2000) {
      error('Minimum deposit amount is 2,000 VND', 'Invalid Amount');
      return;
    }

    if (amount > 10000000) {
      error('Maximum deposit amount is 10,000,000 VND', 'Invalid Amount');
      return;
    }

    if (!user?.id) {
      error('User not found. Please login again.', 'Authentication Error');
      return;
    }

    setIsLoading(true);
    try {
      // Prepare payload according to API specification
      const payload = {
        userId: parseInt(user.id),
        subscriptionTypeId: 1,
        itemName: "Deposit",
        quantity: 1,
        amount: Math.floor(amount), // Convert to integer, no decimal points
        description: "Deposit for EZEXAM"
      };

      console.log('Creating deposit payment with payload:', payload);
      
      // Call the deposit API
      const response = await api.post('/payments/create-payment', payload);
      
      if (response.status === 200 || response.status === 201) {
        console.log('Payment created successfully:', response.data);
        
        // Check if checkoutUrl exists in response
        if (response.data.checkoutUrl) {
          // Redirect to checkout URL
          window.location.href = response.data.checkoutUrl;
        } else {
          console.warn('No checkoutUrl found in response:', response.data);
          success(`Deposit payment created successfully for ${formatCurrency(amount)} VND`, 'Success');
          setActiveDialog(null);
          setDepositAmount('');
        }
      }
    } catch (err: any) {
      console.error('Error creating deposit payment:', err);
      
      // Handle different error scenarios
      if (err.response?.data?.message) {
        error(err.response.data.message, 'Deposit Error');
      } else if (err.response?.status === 401) {
        error('Authentication failed. Please login again.', 'Authentication Error');
      } else if (err.response?.status === 400) {
        error('Invalid deposit amount or user data.', 'Validation Error');
      } else {
        error('An error occurred while creating deposit payment. Please try again.', 'Deposit Error');
      }
    } finally {
      setIsLoading(false);
    }
  };


  // Function to show cancellation confirmation modal
  const handleCancelSubscriptionClick = () => {
    setShowCancelConfirmation(true);
  };

  // Function to handle subscription cancellation
  const handleCancelSubscription = async () => {
    if (!user) {
      error('User not found. Please login again.', 'Authentication Error');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Cancelling subscription...');
      
      // Step 1: Cancel current subscription
      const cancelResponse = await api.post('/subscription/cancel');
      
      if (cancelResponse.status === 200) {
        console.log('Subscription cancelled successfully:', cancelResponse.data);
        
        // Step 2: Subscribe to FREE plan (subscriptionTypeId = 1)
        console.log('Subscribing to FREE plan...');
        const subscribePayload = {
          subscriptionTypeId: 1, // FREE plan
          description: `${user.fullName} downgraded to FREE plan`
        };
        
        const subscribeResponse = await api.post('/subscription/subscribe', subscribePayload);
        
        if (subscribeResponse.status === 200 || subscribeResponse.status === 201) {
          console.log('Successfully subscribed to FREE plan:', subscribeResponse.data);
          
          success('Subscription cancelled and moved to FREE plan successfully!', 'Cancellation Success');
          
          // Refresh current subscription data
          await fetchCurrentSubscription();
          
          // Notify Header to refresh its data
          if (onSubscriptionUpdated) {
            onSubscriptionUpdated();
          }
          
          // Close modals
          setShowCancelConfirmation(false);
          setActiveDialog(null);
        } else {
          throw new Error('Failed to subscribe to FREE plan');
        }
      }
    } catch (err: any) {
      console.error('Error cancelling subscription:', err);
      
      // Handle different error scenarios
      if (err.response?.data?.message) {
        error(err.response.data.message, 'Cancellation Error');
      } else if (err.response?.status === 401) {
        error('Authentication failed. Please login again.', 'Authentication Error');
      } else if (err.response?.status === 400) {
        error('Invalid request or no active subscription to cancel.', 'Validation Error');
      } else if (err.response?.status === 404) {
        error('No active subscription found to cancel.', 'Not Found');
      } else {
        error('An error occurred while cancelling subscription. Please try again.', 'Cancellation Error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle subscription upgrade
  const handleUpgradeSubscription = async (subscriptionType: SubscriptionType) => {
    if (!user) {
      error('User not found. Please login again.', 'Authentication Error');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        subscriptionTypeId: subscriptionType.id,
        description: `${user.fullName} subscribed to ${subscriptionType.subscriptionName} plan`
      };

      console.log('Subscribing to subscription with payload:', payload);
      
      const response = await api.post('/subscription/subscribe', payload);
      
      if (response.status === 200 || response.status === 201) {
        console.log('Subscription created successfully:', response.data);
        
        success(`Successfully subscribed to ${subscriptionType.subscriptionName} plan!`, 'Subscription Success');
        
        // Refresh current subscription data
        await fetchCurrentSubscription();
        
        // Notify Header to refresh its data
        if (onSubscriptionUpdated) {
          onSubscriptionUpdated();
        }
        
        // Close the modal
        setActiveDialog(null);
      }
    } catch (err: any) {
      console.error('Error subscribing to plan:', err);
      
      // Handle different error scenarios
      if (err.response?.data?.message) {
        error(err.response.data.message, 'Subscription Error');
      } else if (err.response?.status === 401) {
        error('Authentication failed. Please login again.', 'Authentication Error');
      } else if (err.response?.status === 400) {
        error('Invalid subscription data or user already subscribed.', 'Validation Error');
      } else if (err.response?.status === 403) {
        error('You do not have permission to subscribe to this plan.', 'Permission Error');
      } else {
        error('An error occurred while subscribing. Please try again.', 'Subscription Error');
      }
    } finally {
      setIsLoading(false);
    }
  };


  // Function to get subscription priority order (higher number = higher priority)
  const getSubscriptionPriority = (subscriptionName: string): number => {
    const name = subscriptionName.toLowerCase();
    switch (name) {
      case 'free': return 1;
      case 'basic': return 2;
      case 'premium': return 3;
      case 'pro': return 4;
      case 'unlimited': return 5;
      default: return 0;
    }
  };

  // Function to check if a package is the current plan
  const isCurrentPlan = (subscriptionType: SubscriptionType) => {
    // Ưu tiên dữ liệu từ API, fallback về token data
    const currentSubscriptionId = currentSubscription?.subscriptionTypeId || user?.subscriptionTypeId;
    const currentSubscriptionName = currentSubscription?.subscriptionName || user?.subscriptionName;
    
    // Nếu không có subscription ID và không có subscription name, coi như đang ở gói Free
    if (!currentSubscriptionId && !currentSubscriptionName) {
      return subscriptionType.subscriptionName.toLowerCase() === 'free';
    }
    
    // Nếu có subscription name là "Free" hoặc không có subscription, coi như đang ở gói Free
    if (!currentSubscriptionId || currentSubscriptionName?.toLowerCase() === 'free') {
      return subscriptionType.subscriptionName.toLowerCase() === 'free';
    }
    
    // Kiểm tra bằng subscription name nếu có
    if (currentSubscriptionName) {
      return currentSubscriptionName.toLowerCase() === subscriptionType.subscriptionName.toLowerCase();
    }
    
    // Fallback về subscription ID
    return parseInt(currentSubscriptionId.toString()) === subscriptionType.id;
  };

  // Function to check if a package should be disabled (lower priority than current)
  const isPackageDisabled = (subscriptionType: SubscriptionType) => {
    // Ưu tiên dữ liệu từ API, fallback về token data
    const currentSubscriptionName = currentSubscription?.subscriptionName || user?.subscriptionName;
    const currentSubscriptionId = currentSubscription?.subscriptionTypeId || user?.subscriptionTypeId;
    
    // Nếu không có subscription hoặc đang ở gói Free, không disable gói nào
    if (!currentSubscriptionName && !currentSubscriptionId) {
      return false;
    }
    
    // Nếu đang ở gói Free, không disable gói nào
    if (!currentSubscriptionId || currentSubscriptionName?.toLowerCase() === 'free') {
      return false;
    }
    
    const currentPriority = getSubscriptionPriority(currentSubscriptionName || 'free');
    const packagePriority = getSubscriptionPriority(subscriptionType.subscriptionName);
    
    return packagePriority < currentPriority;
  };

  // Function to get package styling based on subscription type
  const getPackageStyling = (subscriptionType: SubscriptionType) => {
    const isCurrent = isCurrentPlan(subscriptionType);
    const isDisabled = isPackageDisabled(subscriptionType);
    const packageName = subscriptionType.subscriptionName.toLowerCase();
    
    // Base styling for disabled packages
    if (isDisabled) {
      return {
        borderColor: 'border-gray-300',
        bgGradient: 'bg-gradient-to-b from-gray-50 to-gray-100',
        shadow: 'shadow-sm',
        titleColor: 'text-gray-400',
        priceColor: 'text-gray-400',
        opacity: 'opacity-60'
      };
    }
    
    switch (packageName) {
      case 'free':
        return {
          borderColor: isCurrent ? 'border-gray-500' : 'border-gray-200',
          bgGradient: isCurrent ? 'bg-gradient-to-b from-gray-50 to-gray-100' : '',
          shadow: isCurrent ? 'shadow-xl hover:shadow-2xl' : 'hover:shadow-lg',
          titleColor: 'text-gray-800',
          priceColor: 'text-gray-600',
          opacity: ''
        };
      case 'basic':
        return {
          borderColor: isCurrent ? 'border-green-500' : 'border-green-200',
          bgGradient: isCurrent ? 'bg-gradient-to-b from-green-50 to-green-100' : '',
          shadow: isCurrent ? 'shadow-xl hover:shadow-2xl' : 'hover:shadow-lg',
          titleColor: 'text-green-800',
          priceColor: 'text-green-600',
          opacity: ''
        };
      case 'premium':
        return {
          borderColor: isCurrent ? 'border-blue-500' : 'border-blue-200',
          bgGradient: isCurrent ? 'bg-gradient-to-b from-blue-50 to-blue-100' : '',
          shadow: isCurrent ? 'shadow-xl hover:shadow-2xl' : 'hover:shadow-lg',
          titleColor: 'text-blue-800',
          priceColor: 'text-blue-600',
          opacity: ''
        };
      case 'pro':
        return {
          borderColor: isCurrent ? 'border-purple-500' : 'border-purple-200',
          bgGradient: isCurrent ? 'bg-gradient-to-b from-purple-50 to-purple-100' : '',
          shadow: isCurrent ? 'shadow-xl hover:shadow-2xl' : 'hover:shadow-lg',
          titleColor: 'text-purple-800',
          priceColor: 'text-purple-600',
          opacity: ''
        };
      case 'unlimited':
        return {
          borderColor: isCurrent ? 'border-indigo-500' : 'border-indigo-200',
          bgGradient: isCurrent ? 'bg-gradient-to-b from-indigo-50 to-indigo-100' : '',
          shadow: isCurrent ? 'shadow-xl hover:shadow-2xl' : 'hover:shadow-lg',
          titleColor: 'text-indigo-800',
          priceColor: 'text-indigo-600',
          opacity: ''
        };
      default:
        return {
          borderColor: 'border-gray-200',
          bgGradient: '',
          shadow: 'hover:shadow-lg',
          titleColor: 'text-gray-800',
          priceColor: 'text-gray-600',
          opacity: ''
        };
    }
  };

  // Function to get icon for subscription type
  const getSubscriptionIcon = (subscriptionType: SubscriptionType) => {
    const packageName = subscriptionType.subscriptionName.toLowerCase();
    switch (packageName) {
      case 'free': return User;
      case 'basic': return Star;
      case 'premium': return Crown;
      case 'pro': return Sparkles;
      case 'unlimited': return Infinity;
      default: return Star;
    }
  };

  return (
    <>
      {isAuthenticated ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-3 px-3 py-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-300 hover:scale-105">
              <Avatar className="w-8 h-8 border-2 border-blue-200 shadow-md">
                <AvatarImage src={user?.avatarUrl || ''} />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold">
                  {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:block font-semibold text-gray-700">
                {user?.fullName || 'User'}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72 bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-xl p-2">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl mb-2">
              <div className="flex items-center gap-3 mb-2">
                <Avatar className="w-12 h-12 border-2 border-white shadow-lg">
                  <AvatarImage src={user?.avatarUrl || ''} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold text-lg">
                    {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-bold text-gray-800">{user?.fullName || 'User'}</p>
                  <p className="text-sm text-gray-600">{user?.email || 'No email'}</p>
                  {(currentSubscription?.subscriptionName || user?.subscriptionName) ? (
                    <div className="mt-1">
                      <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 text-xs px-2 py-1">
                        {currentSubscription?.subscriptionName || user?.subscriptionName}
                      </Badge>
                    </div>
                  ) : (
                    <div className="mt-1">
                      <Badge variant="outline" className="text-xs px-2 py-1 border-gray-300 text-gray-600">
                        Free Plan
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DropdownMenuSeparator className="my-2" />
            <DropdownMenuItem onClick={() => setActiveDialog('deposit')} className="p-3 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 rounded-lg transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
                  <PlusCircle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-green-600">Deposit Funds</div>
                  <div className="text-xs text-gray-500">Add money to account</div>
                </div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setActiveDialog('upgrade')} className="p-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 rounded-lg transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-purple-600">Upgrade Package</div>
                  <div className="text-xs text-gray-500">Get more features</div>
                </div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-2" />
            <DropdownMenuItem onClick={handleProfileClick} className="p-3 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 rounded-lg transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-600">Profile</div>
                  <div className="text-xs text-gray-500">View your profile</div>
                </div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSettingsClick} className="p-3 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 rounded-lg transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg">
                  <Settings className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-600">Settings</div>
                  <div className="text-xs text-gray-500">Account settings</div>
                </div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-2" />
            <DropdownMenuItem onClick={handleLogout} className="p-3 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 rounded-lg transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-red-500 to-red-600 rounded-lg">
                  <LogOut className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-red-600">Logout</div>
                  <div className="text-xs text-gray-500">Sign out of account</div>
                </div>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button onClick={handleLogin} variant="outline">
          Login
        </Button>
      )}

      {/* Deposit Dialog */}
      <Dialog open={activeDialog === 'deposit'} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-2xl max-w-md">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
                <PlusCircle className="h-6 w-6 text-white" />
              </div>
              Deposit Funds
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleDeposit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deposit-amount" className="text-sm font-semibold text-gray-700">
                  Deposit Amount (VND)
                </Label>
                <Input
                  id="deposit-amount"
                  type="text"
                  value={depositAmount}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    if (value) {
                      setDepositAmount(formatCurrency(value));
                    } else {
                      setDepositAmount('');
                    }
                  }}
                  placeholder="Enter amount to deposit"
                  required
                  className="border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300 h-12 text-lg font-semibold"
                />
                <p className="text-xs text-gray-500">
                  Minimum: 2,000 VND - Maximum: 10,000,000 VND
                </p>
              </div>

              {/* Predefined Amount Buttons */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700">
                  Quick Select Amount
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {predefinedAmounts.map((amount) => (
                    <Button
                      key={amount}
                      type="button"
                      variant="outline"
                      onClick={() => handlePredefinedAmount(amount)}
                      className={`h-12 border-2 transition-all duration-300 hover:scale-105 ${
                        parseCurrency(depositAmount) === amount
                          ? 'border-green-500 bg-green-50 text-green-700 font-semibold'
                          : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                      }`}
                    >
                      <span className="font-semibold">{formatCurrency(amount)} VND</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Current Balance Display */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Current Balance</p>
                    <p className="text-lg font-bold text-green-600">
                      {user?.balance ? formatCurrency(user.balance) : '0'} VND
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-600">After Deposit</p>
                    <p className="text-lg font-bold text-blue-600">
                      {depositAmount ? formatCurrency(parseCurrency(depositAmount) + (typeof user?.balance === 'string' ? parseInt(user.balance) : user?.balance || 0)) : formatCurrency(user?.balance || 0)} VND
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setActiveDialog(null)} 
                className="h-12 px-6 border-2 border-gray-300 hover:border-red-500 hover:bg-red-50 transition-all duration-300 rounded-xl"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="h-12 px-8 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-xl text-lg font-semibold disabled:opacity-50"
                disabled={isLoading || !depositAmount || parseCurrency(depositAmount) < 2000}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Zap className="mr-2 h-5 w-5" />
                    Deposit
                  </div>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>


      {/* Upgrade Package Dialog */}
      <Dialog open={activeDialog === 'upgrade'} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="max-w-4xl bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-2xl">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              Upgrade Your Package
            </DialogTitle>
          </DialogHeader>
          {isLoadingSubscriptions ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              <span className="ml-3 text-gray-600">Loading subscription packages...</span>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {subscriptionTypes.map((subscriptionType) => {
                const styling = getPackageStyling(subscriptionType);
                const IconComponent = getSubscriptionIcon(subscriptionType);
                const isCurrent = isCurrentPlan(subscriptionType);
                const isDisabled = isPackageDisabled(subscriptionType);
                
                return (
                  <Card 
                    key={subscriptionType.id} 
                    className={`border-2 ${styling.borderColor} transition-all duration-300 ${styling.shadow} ${styling.bgGradient} ${styling.opacity} ${isCurrent ? 'relative' : ''} ${isDisabled ? 'cursor-not-allowed' : 'hover:scale-105'}`}
                    title={isDisabled ? `Bạn đang sử dụng gói ${currentSubscription?.subscriptionName || user?.subscriptionName} cao hơn. Không thể downgrade xuống gói ${subscriptionType.subscriptionName}.` : ''}
                  >
                    {isCurrent && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg px-4 py-1">
                          <IconComponent className="w-3 h-3 mr-1" />
                          Current
                        </Badge>
                      </div>
                    )}
                    <CardHeader className={`text-center ${isCurrent ? 'pt-6' : 'pb-4'}`}>
                      <CardTitle className={`text-xl font-bold ${styling.titleColor}`}>
                        {subscriptionType.subscriptionName}
                      </CardTitle>
                      <div className="text-center">
                        <span className={`text-3xl font-bold ${styling.priceColor}`}>
                          {subscriptionType.subscriptionPrice === 0 ? 'Free' : `${subscriptionType.subscriptionPrice.toLocaleString('vi-VN')} VND`}
                        </span>
                        {subscriptionType.subscriptionPrice > 0 && (
                          <span className="text-sm text-gray-500">/month</span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-3">{subscriptionType.description}</p>
                      </div>
                      <ul className="space-y-3 text-sm">
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          Max Solution Views: {subscriptionType.maxSolutionViews === -1 ? 'Forever' : subscriptionType.maxSolutionViews}
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          Max AI Requests: {subscriptionType.maxAIRequests === -1 ? 'Forever' : subscriptionType.maxAIRequests}
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          AI Enabled: {subscriptionType.isAIEnabled ? 'Yes' : 'No'}
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          Features: {subscriptionType.features}
                        </li>
                      </ul>
                      <Button 
                        className={`w-full mt-6 h-20 flex flex-col items-center justify-center px-2 ${
                          isCurrent 
                            ? 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105' 
                            : isDisabled
                            ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-500 border-0 shadow-sm cursor-not-allowed'
                            : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105'
                        }`}
                        variant="default"
                        disabled={isCurrent || isLoading || isDisabled}
                        onClick={() => !isCurrent && !isDisabled && handleUpgradeSubscription(subscriptionType)}
                        title={isDisabled ? `Không thể downgrade từ ${currentSubscription?.subscriptionName || user?.subscriptionName} xuống ${subscriptionType.subscriptionName}` : ''}
                      >
                        {isCurrent ? (
                          <div className="flex items-center">
                            <IconComponent className="mr-2 h-4 w-4 flex-shrink-0" />
                            <span className="text-sm font-semibold">Current Plan</span>
                          </div>
                        ) : isDisabled ? (
                          <div className="flex flex-col items-center">
                            <div className="flex items-center mb-1">
                              <span className="text-xs font-medium text-gray-500">Downgrade Not Allowed</span>
                            </div>
                            <span className="text-sm font-semibold leading-tight text-center break-words text-gray-500">
                              {subscriptionType.subscriptionName}
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <div className="flex items-center mb-1">
                              <IconComponent className="mr-2 h-4 w-4 flex-shrink-0" />
                              <span className="text-xs font-medium">Upgrade to</span>
                            </div>
                            <span className="text-sm font-semibold leading-tight text-center break-words">
                              {isLoading ? 'Processing...' : subscriptionType.subscriptionName}
                            </span>
                          </div>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
          
          {/* Cancel Subscription Button */}
          {(currentSubscription?.isActive || user?.subscriptionName) && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Want to cancel your current subscription?
                </p>
                <Button
                  onClick={handleCancelSubscriptionClick}
                  disabled={isLoading}
                  variant="outline"
                  className="h-12 px-8 border-2 border-red-300 hover:border-red-500 hover:bg-red-50 text-red-600 hover:text-red-700 transition-all duration-300 hover:scale-105 rounded-xl font-semibold disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                      Cancelling...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <X className="h-4 w-4" />
                      Cancel Subscription
                    </div>
                  )}
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  This will cancel your current subscription and you'll be moved to the Free plan.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Subscription Confirmation Modal */}
      <Dialog open={showCancelConfirmation} onOpenChange={setShowCancelConfirmation}>
        <DialogContent className="max-w-2xl w-full bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-2xl">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-red-500 to-red-600 rounded-lg">
                <X className="h-6 w-6 text-white" />
              </div>
              Cancel Subscription
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border border-red-200">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-100 rounded-lg flex-shrink-0">
                  <X className="h-6 w-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-red-800 mb-3 text-lg">Important Notice</h3>
                  <p className="text-base text-red-700 leading-relaxed">
                    Are you sure you want to cancel your current subscription? 
                    <strong className="text-red-800"> We do not offer refunds for cancelled subscriptions.</strong>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-lg flex-shrink-0">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-blue-800 mb-3 text-lg">What happens next?</h3>
                  <ul className="text-base text-blue-700 space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Your current subscription will be cancelled immediately
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Your account will be moved to the FREE plan
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      You'll lose access to premium features
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      You can upgrade again anytime
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-6 pt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowCancelConfirmation(false)} 
                className="h-14 px-8 border-2 border-gray-300 hover:border-gray-500 hover:bg-gray-50 transition-all duration-300 rounded-xl text-base font-semibold"
                disabled={isLoading}
              >
                Keep Subscription
              </Button>
              <Button 
                onClick={handleCancelSubscription}
                className="h-14 px-10 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-xl text-lg font-semibold disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <X className="h-5 w-5" />
                    Yes, Cancel Subscription
                  </div>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}