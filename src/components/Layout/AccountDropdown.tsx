import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Building2
} from 'lucide-react';
import { mockUserAccount, mockBankAccounts } from '@/data/mockData';
import { useAuth } from '@/pages/auth/AuthContext';

export function AccountDropdown() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeDialog, setActiveDialog] = useState<'bank' | 'deposit' | 'withdrawal' | 'upgrade' | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [selectedBank, setSelectedBank] = useState('');

  // User data is now managed by AuthContext, no need to fetch here

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate('/profile');
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

  const getPackageBadgeColor = (packageType: string) => {
    switch (packageType) {
      case 'basic': return 'bg-gray-100 text-gray-800';
      case 'premium': return 'bg-blue-100 text-blue-800';
      case 'pro': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 px-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src={user?.avatarUrl || ''} />
              <AvatarFallback>
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="hidden md:block font-medium">
              {user?.fullName || 'User'}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <div className="p-3">
            <p className="font-medium">{user?.fullName || 'User'}</p>
            <p className="text-sm text-gray-500">{user?.email || 'No email'}</p>
            <div className="flex items-center justify-between mt-2">
              <Badge className={getPackageBadgeColor(mockUserAccount.packageType)}>
                {mockUserAccount.packageType.toUpperCase()}
              </Badge>
              <span className="text-sm font-medium">${mockUserAccount.balance.toFixed(2)}</span>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setActiveDialog('bank')}>
            <Building2 className="mr-2 h-4 w-4" />
            Bank Accounts
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setActiveDialog('deposit')}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Deposit Funds
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setActiveDialog('withdrawal')}>
            <MinusCircle className="mr-2 h-4 w-4" />
            Withdraw Funds
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setActiveDialog('upgrade')}>
            <TrendingUp className="mr-2 h-4 w-4" />
            Upgrade Package
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleProfileClick}>
            <User className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Bank Accounts Dialog */}
      <Dialog open={activeDialog === 'bank'} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bank Accounts</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {mockBankAccounts.map((account) => (
              <Card key={account.id}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{account.bankName}</h4>
                      <p className="text-sm text-gray-500">{account.accountNumber}</p>
                      <p className="text-sm text-gray-500">{account.accountHolder}</p>
                    </div>
                    {account.isDefault && (
                      <Badge>Default</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button className="w-full" variant="outline">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Bank Account
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Deposit Dialog */}
      <Dialog open={activeDialog === 'deposit'} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deposit Funds</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleDeposit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deposit-amount">Amount ($)</Label>
              <Input
                id="deposit-amount"
                type="number"
                step="0.01"
                min="10"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="Enter amount to deposit"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="card">Credit/Debit Card</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => setActiveDialog(null)}>
                Cancel
              </Button>
              <Button type="submit">Deposit</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Withdrawal Dialog */}
      <Dialog open={activeDialog === 'withdrawal'} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdraw Funds</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleWithdrawal} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="withdrawal-amount">Amount ($)</Label>
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
              />
              <p className="text-xs text-gray-500">
                Available balance: ${mockUserAccount.balance.toFixed(2)}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Bank Account</Label>
              <Select value={selectedBank} onValueChange={setSelectedBank}>
                <SelectTrigger>
                  <SelectValue placeholder="Select bank account" />
                </SelectTrigger>
                <SelectContent>
                  {mockBankAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.bankName} - {account.accountNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => setActiveDialog(null)}>
                Cancel
              </Button>
              <Button type="submit">Withdraw</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Upgrade Package Dialog */}
      <Dialog open={activeDialog === 'upgrade'} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upgrade Your Package</DialogTitle>
          </DialogHeader>
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="border-2 border-gray-200">
              <CardHeader>
                <CardTitle className="text-center">Basic</CardTitle>
                <div className="text-center">
                  <span className="text-2xl font-bold">Free</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• 5 lessons per month</li>
                  <li>• 2 mock tests per month</li>
                  <li>• Basic analytics</li>
                  <li>• Community support</li>
                </ul>
                <Button className="w-full mt-4" variant="outline" disabled>
                  Current Plan
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-500 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-center">Premium</CardTitle>
                <div className="text-center">
                  <span className="text-2xl font-bold">$29.99</span>
                  <span className="text-sm text-gray-500">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Unlimited lessons</li>
                  <li>• Unlimited mock tests</li>
                  <li>• Advanced analytics</li>
                  <li>• Priority support</li>
                  <li>• PDF downloads</li>
                </ul>
                <Button className="w-full mt-4">
                  Current Plan
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-500">
              <CardHeader>
                <CardTitle className="text-center">Pro</CardTitle>
                <div className="text-center">
                  <span className="text-2xl font-bold">$49.99</span>
                  <span className="text-sm text-gray-500">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Everything in Premium</li>
                  <li>• AI-powered recommendations</li>
                  <li>• 1-on-1 tutoring sessions</li>
                  <li>• Custom study plans</li>
                  <li>• Exam predictions</li>
                </ul>
                <Button className="w-full mt-4" variant="outline">
                  Upgrade to Pro
                </Button>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}