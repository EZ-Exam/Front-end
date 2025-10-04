import { useState } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  LogOut, 
  Settings, 
  PlusCircle, 
  MinusCircle, 
  TrendingUp,
  Building2,
  Crown,
  Sparkles,
  Zap,
  Star,
  Infinity
} from 'lucide-react';
import { mockUserAccount, mockBankAccounts } from '@/data/mockData';
import { useAuth } from '@/pages/auth/AuthContext';

export function AccountDropdown() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeDialog, setActiveDialog] = useState<'bank' | 'deposit' | 'withdrawal' | 'upgrade' | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // User data is now managed by AuthContext, no need to fetch here

  // Subscription type mapping
  const subscriptionTypeMapping = {
    'free': 1,
    'basic': 2,
    'premium': 3,
    'unlimited': 4
  };

  const subscriptionNameMapping = {
    'free': 'Free',
    'basic': 'Basic',
    'premium': 'Premium',
    'unlimited': 'Unlimited'
  };

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

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Deposit:', depositAmount);
    setActiveDialog(null);
    setDepositAmount('');
  };

  const handleWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Withdrawal:', withdrawalAmount, 'to bank:', selectedBank);
    setActiveDialog(null);
    setWithdrawalAmount('');
    setSelectedBank('');
  };

  // Function to handle subscription upgrade
  const handleUpgradeSubscription = async (subscriptionType: string) => {
    if (!user) {
      console.error('User not found');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        userId: parseInt(user.id),
        subscriptionTypeId: subscriptionTypeMapping[subscriptionType.toLowerCase() as keyof typeof subscriptionTypeMapping],
        itemName: subscriptionNameMapping[subscriptionType.toLowerCase() as keyof typeof subscriptionNameMapping],
        quantity: 1,
        amount: 2000, // Test amount as requested
        description: `${user.fullName} mua gói ${subscriptionNameMapping[subscriptionType.toLowerCase() as keyof typeof subscriptionNameMapping]}`
      };

      console.log('Creating payment with payload:', payload);
      
      const response = await api.post('/payments/create-payment', payload);
      
      if (response.status === 200 || response.status === 201) {
        console.log('Payment created successfully:', response.data);
        
        // Check if checkoutUrl exists in response
        if (response.data.checkoutUrl) {
          // Redirect to checkout URL
          window.location.href = response.data.checkoutUrl;
        } else {
          console.warn('No checkoutUrl found in response:', response.data);
          alert('Payment created but no checkout URL provided');
        }
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      // You can add error notification here
      alert('Error creating payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPackageBadgeColor = (packageType: string) => {
    switch (packageType) {
      case 'free': return 'bg-gray-100 text-gray-800';
      case 'basic': return 'bg-green-100 text-green-800';
      case 'premium': return 'bg-blue-100 text-blue-800';
      case 'unlimited': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Function to check if a package is the current plan
  const isCurrentPlan = (packageName: string) => {
    const currentSubscription = user?.subscriptionName?.toLowerCase() || 'free';
    return currentSubscription === packageName.toLowerCase();
  };

  // Function to get package styling based on current plan
  const getPackageStyling = (packageName: string) => {
    const isCurrent = isCurrentPlan(packageName);
    
    switch (packageName.toLowerCase()) {
      case 'free':
        return {
          borderColor: isCurrent ? 'border-gray-500' : 'border-gray-200',
          bgGradient: isCurrent ? 'bg-gradient-to-b from-gray-50 to-gray-100' : '',
          shadow: isCurrent ? 'shadow-xl hover:shadow-2xl' : 'hover:shadow-lg',
          titleColor: 'text-gray-800',
          priceColor: 'text-gray-600'
        };
      case 'basic':
        return {
          borderColor: isCurrent ? 'border-green-500' : 'border-green-200',
          bgGradient: isCurrent ? 'bg-gradient-to-b from-green-50 to-green-100' : '',
          shadow: isCurrent ? 'shadow-xl hover:shadow-2xl' : 'hover:shadow-lg',
          titleColor: 'text-green-800',
          priceColor: 'text-green-600'
        };
      case 'premium':
        return {
          borderColor: isCurrent ? 'border-blue-500' : 'border-blue-200',
          bgGradient: isCurrent ? 'bg-gradient-to-b from-blue-50 to-blue-100' : '',
          shadow: isCurrent ? 'shadow-xl hover:shadow-2xl' : 'hover:shadow-lg',
          titleColor: 'text-blue-800',
          priceColor: 'text-blue-600'
        };
      case 'pro':
        return {
          borderColor: isCurrent ? 'border-purple-500' : 'border-purple-200',
          bgGradient: isCurrent ? 'bg-gradient-to-b from-purple-50 to-purple-100' : '',
          shadow: isCurrent ? 'shadow-xl hover:shadow-2xl' : 'hover:shadow-lg',
          titleColor: 'text-purple-800',
          priceColor: 'text-purple-600'
        };
      case 'unlimited':
        return {
          borderColor: isCurrent ? 'border-indigo-500' : 'border-indigo-200',
          bgGradient: isCurrent ? 'bg-gradient-to-b from-indigo-50 to-indigo-100' : '',
          shadow: isCurrent ? 'shadow-xl hover:shadow-2xl' : 'hover:shadow-lg',
          titleColor: 'text-indigo-800',
          priceColor: 'text-indigo-600'
        };
      default:
        return {
          borderColor: 'border-gray-200',
          bgGradient: '',
          shadow: 'hover:shadow-lg',
          titleColor: 'text-gray-800',
          priceColor: 'text-gray-600'
        };
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
                <div>
                  <p className="font-bold text-gray-800">{user?.fullName || 'User'}</p>
                  <p className="text-sm text-gray-600">{user?.email || 'No email'}</p>
                </div>
              </div>
            </div>
            <DropdownMenuSeparator className="my-2" />
            <DropdownMenuItem onClick={() => setActiveDialog('bank')} className="p-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 rounded-lg transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                  <Building2 className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-blue-600">Bank Accounts</div>
                  <div className="text-xs text-gray-500">Manage your accounts</div>
                </div>
              </div>
            </DropdownMenuItem>
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
            <DropdownMenuItem onClick={() => setActiveDialog('withdrawal')} className="p-3 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 rounded-lg transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg">
                  <MinusCircle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-orange-600">Withdraw Funds</div>
                  <div className="text-xs text-gray-500">Transfer to bank</div>
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

      {/* Bank Accounts Dialog */}
      <Dialog open={activeDialog === 'bank'} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-2xl">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              Bank Accounts
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {mockBankAccounts.map((account) => (
              <Card key={account.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-gray-800 text-lg">{account.bankName}</h4>
                      <p className="text-sm text-gray-600 font-medium">{account.accountNumber}</p>
                      <p className="text-sm text-gray-600">{account.accountHolder}</p>
                    </div>
                    {account.isDefault && (
                      <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-md">
                        <Star className="w-3 h-3 mr-1" />
                        Default
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-xl text-lg font-semibold">
              <PlusCircle className="mr-2 h-5 w-5" />
              Add Bank Account
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Deposit Dialog */}
      <Dialog open={activeDialog === 'deposit'} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-2xl">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
                <PlusCircle className="h-6 w-6 text-white" />
              </div>
              Deposit Funds
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleDeposit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="deposit-amount" className="text-sm font-semibold text-gray-700">Amount ($)</Label>
              <Input
                id="deposit-amount"
                type="number"
                step="0.01"
                min="10"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="Enter amount to deposit"
                required
                className="border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300 h-12 text-lg"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Payment Method</Label>
              <Select>
                <SelectTrigger className="border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300 h-12">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-sm border-0 shadow-xl rounded-xl">
                  <SelectItem value="card">Credit/Debit Card</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => setActiveDialog(null)} className="h-12 px-6 border-2 border-gray-300 hover:border-red-500 hover:bg-red-50 transition-all duration-300 rounded-xl">
                Cancel
              </Button>
              <Button type="submit" className="h-12 px-8 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-xl text-lg font-semibold">
                <Zap className="mr-2 h-5 w-5" />
                Deposit
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Withdrawal Dialog */}
      <Dialog open={activeDialog === 'withdrawal'} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-2xl">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg">
                <MinusCircle className="h-6 w-6 text-white" />
              </div>
              Withdraw Funds
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleWithdrawal} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="withdrawal-amount" className="text-sm font-semibold text-gray-700">Amount ($)</Label>
              <Input
                id="withdrawal-amount"
                type="number"
                step="0.01"
                min="10"
                max={mockUserAccount.balance}
                value={withdrawalAmount}
                onChange={(e) => setWithdrawalAmount(e.target.value)}
                placeholder="Enter amount to withdraw"
                required
                className="border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300 h-12 text-lg"
              />
              <p className="text-xs text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
                Available balance: ${mockUserAccount.balance.toFixed(2)}
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Bank Account</Label>
              <Select value={selectedBank} onValueChange={setSelectedBank}>
                <SelectTrigger className="border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300 h-12">
                  <SelectValue placeholder="Select bank account" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-sm border-0 shadow-xl rounded-xl">
                  {mockBankAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.bankName} - {account.accountNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => setActiveDialog(null)} className="h-12 px-6 border-2 border-gray-300 hover:border-red-500 hover:bg-red-50 transition-all duration-300 rounded-xl">
                Cancel
              </Button>
              <Button type="submit" className="h-12 px-8 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-xl text-lg font-semibold">
                <Zap className="mr-2 h-5 w-5" />
                Withdraw
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
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className={`border-2 ${getPackageStyling('free').borderColor} hover:border-gray-300 transition-all duration-300 ${getPackageStyling('free').shadow} hover:scale-105 ${getPackageStyling('free').bgGradient} ${isCurrentPlan('free') ? 'relative' : ''}`}>
              {isCurrentPlan('free') && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-gray-500 to-gray-600 text-white border-0 shadow-lg px-4 py-1">
                    <User className="w-3 h-3 mr-1" />
                    Current
                  </Badge>
                </div>
              )}
              <CardHeader className={`text-center ${isCurrentPlan('free') ? 'pt-6' : 'pb-4'}`}>
                <CardTitle className={`text-xl font-bold ${getPackageStyling('free').titleColor}`}>Free</CardTitle>
                <div className="text-center">
                  <span className={`text-3xl font-bold ${getPackageStyling('free').priceColor}`}>Free</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    5 lessons per month
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    2 mock tests per month
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    Basic analytics
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    Community support
                  </li>
                </ul>
                <Button 
                  className={`w-full mt-6 h-12 ${isCurrentPlan('free') ? 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105' : ''}`}
                  variant={isCurrentPlan('free') ? 'default' : 'outline'}
                  disabled={isCurrentPlan('free') || isLoading}
                  onClick={() => !isCurrentPlan('free') && handleUpgradeSubscription('basic')}
                >
                  {isCurrentPlan('free') ? (
                    <>
                      <User className="mr-2 h-4 w-4" />
                      Current Plan
                    </>
                  ) : (
                    <>
                      <Star className="mr-2 h-4 w-4" />
                      {isLoading ? 'Processing...' : 'Upgrade to Basic'}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className={`border-2 ${getPackageStyling('premium').borderColor} transition-all duration-300 ${getPackageStyling('premium').shadow} hover:scale-105 ${getPackageStyling('premium').bgGradient} ${isCurrentPlan('premium') ? 'relative' : ''}`}>
              {isCurrentPlan('premium') && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg px-4 py-1">
                    <Crown className="w-3 h-3 mr-1" />
                    Current
                  </Badge>
                </div>
              )}
              <CardHeader className={`text-center ${isCurrentPlan('premium') ? 'pt-6' : 'pb-4'}`}>
                <CardTitle className={`text-xl font-bold ${getPackageStyling('premium').titleColor}`}>Premium</CardTitle>
                <div className="text-center">
                  <span className={`text-3xl font-bold ${getPackageStyling('premium').priceColor}`}>$29.99</span>
                  <span className="text-sm text-gray-500">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Unlimited lessons
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Unlimited mock tests
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Advanced analytics
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Priority support
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    PDF downloads
                  </li>
                </ul>
                <Button 
                  className={`w-full mt-6 h-12 ${isCurrentPlan('premium') ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105' : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105'}`}
                  variant="default"
                  disabled={isCurrentPlan('premium') || isLoading}
                  onClick={() => !isCurrentPlan('premium') && handleUpgradeSubscription('premium')}
                >
                  {isCurrentPlan('premium') ? (
                    <>
                      <Crown className="mr-2 h-4 w-4" />
                      Current Plan
                    </>
                  ) : (
                    <>
                      <Crown className="mr-2 h-4 w-4" />
                      {isLoading ? 'Processing...' : 'Upgrade to Premium'}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className={`border-2 ${getPackageStyling('pro').borderColor} hover:border-purple-600 transition-all duration-300 ${getPackageStyling('pro').shadow} hover:scale-105 ${getPackageStyling('pro').bgGradient} ${isCurrentPlan('pro') ? 'relative' : ''}`}>
              {isCurrentPlan('pro') && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg px-4 py-1">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Current
                  </Badge>
                </div>
              )}
              <CardHeader className={`text-center ${isCurrentPlan('pro') ? 'pt-6' : 'pb-4'}`}>
                <CardTitle className={`text-xl font-bold ${getPackageStyling('pro').titleColor}`}>Pro</CardTitle>
                <div className="text-center">
                  <span className={`text-3xl font-bold ${getPackageStyling('pro').priceColor}`}>$49.99</span>
                  <span className="text-sm text-gray-500">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    Everything in Premium
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    AI-powered recommendations
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    1-on-1 tutoring sessions
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    Custom study plans
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    Exam predictions
                  </li>
                </ul>
                <Button 
                  className={`w-full mt-6 h-12 ${isCurrentPlan('pro') ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105' : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105'}`}
                  variant="default"
                  disabled={isCurrentPlan('pro') || isLoading}
                  onClick={() => !isCurrentPlan('pro') && handleUpgradeSubscription('pro')}
                >
                  {isCurrentPlan('pro') ? (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Current Plan
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      {isLoading ? 'Processing...' : 'Upgrade to Pro'}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className={`border-2 ${getPackageStyling('unlimited').borderColor} hover:border-indigo-600 transition-all duration-300 ${getPackageStyling('unlimited').shadow} hover:scale-105 ${getPackageStyling('unlimited').bgGradient} ${isCurrentPlan('unlimited') ? 'relative' : ''}`}>
              {isCurrentPlan('unlimited') && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white border-0 shadow-lg px-4 py-1">
                    <Infinity className="w-3 h-3 mr-1" />
                    Current
                  </Badge>
                </div>
              )}
              <CardHeader className={`text-center ${isCurrentPlan('unlimited') ? 'pt-6' : 'pb-4'}`}>
                <CardTitle className={`text-xl font-bold ${getPackageStyling('unlimited').titleColor}`}>Unlimited</CardTitle>
                <div className="text-center">
                  <span className={`text-3xl font-bold ${getPackageStyling('unlimited').priceColor}`}>$99.99</span>
                  <span className="text-sm text-gray-500">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    Everything in Pro
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    Unlimited AI tutoring
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    Live expert sessions
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    Priority exam scheduling
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    White-label solutions
                  </li>
                </ul>
                <Button 
                  className={`w-full mt-6 h-12 ${isCurrentPlan('unlimited') ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105' : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105'}`}
                  variant="default"
                  disabled={isCurrentPlan('unlimited') || isLoading}
                  onClick={() => !isCurrentPlan('unlimited') && handleUpgradeSubscription('unlimited')}
                >
                  {isCurrentPlan('unlimited') ? (
                    <>
                      <Infinity className="mr-2 h-4 w-4" />
                      Current Plan
                    </>
                  ) : (
                    <>
                      <Infinity className="mr-2 h-4 w-4" />
                      {isLoading ? 'Processing...' : 'Upgrade to Unlimited'}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}