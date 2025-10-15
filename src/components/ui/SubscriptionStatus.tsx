import { useAuth } from '@/pages/auth/AuthContext';
import { SubscriptionUtils, SubscriptionLevel } from '@/lib/subscription';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Crown, Star, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SubscriptionStatusProps {
  showUpgradeButton?: boolean;
  className?: string;
}

export function SubscriptionStatus({ showUpgradeButton = true, className = '' }: SubscriptionStatusProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const subscriptionLevel = SubscriptionUtils.getDisplaySubscriptionLevel(user);
  const isFree = SubscriptionUtils.isFreeUser(user);
  
  const getSubscriptionIcon = () => {
    switch (subscriptionLevel) {
      case 'FREE':
        return <Lock className="h-4 w-4" />;
      case 'BASIC':
        return <Star className="h-4 w-4" />;
      case 'PREMIUM':
        return <Crown className="h-4 w-4" />;
      case 'PRO':
        return <Zap className="h-4 w-4" />;
      default:
        return <Star className="h-4 w-4" />;
    }
  };

  const getSubscriptionColor = () => {
    switch (subscriptionLevel) {
      case 'FREE':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      case 'BASIC':
        return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'PREMIUM':
        return 'bg-purple-100 text-purple-600 border-purple-200';
      case 'PRO':
        return 'bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-600 border-orange-200';
      default:
        return 'bg-blue-100 text-blue-600 border-blue-200';
    }
  };

  return (
    <Card className={`shadow-lg border-0 bg-white/90 backdrop-blur-sm ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          {getSubscriptionIcon()}
          Subscription Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Current Plan:</span>
          <Badge className={`${getSubscriptionColor()} border`}>
            {subscriptionLevel}
          </Badge>
        </div>
        
        {isFree && (
          <div className="p-3 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-700 font-medium mb-2">
              Upgrade để mở khóa tất cả tính năng!
            </p>
            <div className="text-xs text-orange-600 space-y-1">
              <p>• BASIC+: Xem đáp án và giải thích</p>
              <p>• PREMIUM+: Tạo Mock Test</p>
              <p>• Analytics và chi tiết bài thi</p>
            </div>
          </div>
        )}
        
        {showUpgradeButton && (
          <Button 
            onClick={() => navigate('/profile')}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isFree ? 'Nâng cấp ngay' : 'Quản lý Subscription'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

interface FeatureLockProps {
  featureName: string;
  requiredLevel: SubscriptionLevel;
  currentLevel: string;
  onUpgrade?: () => void;
  children?: React.ReactNode;
}

export function FeatureLock({ 
  featureName, 
  requiredLevel, 
  currentLevel, 
  onUpgrade,
  children 
}: FeatureLockProps) {
  const navigate = useNavigate();
  
  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      navigate('/profile');
    }
  };

  return (
    <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl text-center">
      <div className="flex items-center justify-center gap-3 text-gray-500 mb-4">
        <Lock className="h-8 w-8" />
        <span className="text-xl font-semibold">
          {featureName} bị khóa
        </span>
      </div>
      
      <div className="space-y-3 mb-6">
        <p className="text-gray-600">
          Bạn cần nâng cấp lên gói <strong>{requiredLevel}</strong> để sử dụng tính năng này
        </p>
        
        <div className="flex items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Hiện tại:</span>
            <Badge variant="outline" className="bg-gray-100 text-gray-600">
              {currentLevel}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Cần:</span>
            <Badge className="bg-blue-100 text-blue-600 border-blue-200">
              {requiredLevel}+
            </Badge>
          </div>
        </div>
      </div>
      
      <Button 
        onClick={handleUpgrade}
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
      >
        Nâng cấp ngay
      </Button>
      
      {children}
    </div>
  );
}
