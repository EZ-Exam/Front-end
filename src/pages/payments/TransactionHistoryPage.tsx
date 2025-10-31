import { useEffect, useState } from 'react';
import { useAuth } from '@/pages/auth/AuthContext';
import api from '@/services/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { XCircle, History, RefreshCw } from 'lucide-react';

interface SubscriptionTransactionItem {
  id: number;
  userId: number;
  subscriptionTypeId: number;
  paymentStatus: string; // Pending | COMPLETED | FAILED | ...
  amount: number;
  paymentGatewayTransactionId?: string | null;
  isActive: boolean;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  userEmail?: string | null;
  subscriptionName?: string | null;
}

export function TransactionHistoryPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<SubscriptionTransactionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const formatCurrency = (v: number) => (v || 0).toLocaleString('vi-VN') + ' VND';
  const formatDate = (iso: string) => new Date(iso).toLocaleString('vi-VN');

  const statusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s.includes('success') || s.includes('complete')) return 'bg-green-100 text-green-800 border-green-200';
    if (s.includes('pending')) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (s.includes('fail') || s.includes('cancel')) return 'bg-red-100 text-red-800 border-red-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const load = async () => {
    if (!user?.id) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const uid = parseInt(user.id as unknown as string, 10);
      const resp = await api.get(`/payments/user-subscriptions/${uid}`);
      const data: SubscriptionTransactionItem[] = resp.data || [];
      setItems(Array.isArray(data) ? data : []);
    } catch (e: any) {
      console.error('Failed to load transaction history', e);
      if (e.response?.status === 401) setError('Vui lòng đăng nhập lại để xem lịch sử giao dịch.');
      else setError(e.response?.data?.message || 'Không thể tải lịch sử giao dịch.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Transaction History...</h2>
          <p className="text-gray-600">Please wait while we fetch your transactions</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="p-6 bg-red-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <XCircle className="h-12 w-12 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Transaction History</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={load}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <div className="p-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center shadow-2xl">
            <History className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Transaction History</h1>
          <p className="text-gray-600 mt-2">List of your subscription payments</p>
        </div>

        <div className="space-y-4">
          {items.map((it) => (
            <Card key={it.id} className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-lg">
                  <span>Subscription #{it.subscriptionTypeId}{it.subscriptionName ? ` • ${it.subscriptionName}` : ''}</span>
                  <Badge className={statusBadge(it.paymentStatus)}>{it.paymentStatus}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-700">
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-gray-500">Amount</div>
                    <div className="font-semibold text-blue-700">{formatCurrency(it.amount)}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Active</div>
                    <div className="font-semibold">{it.isActive ? 'Yes' : 'No'}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Start → End</div>
                    <div className="font-semibold">{formatDate(it.startDate)} → {formatDate(it.endDate)}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Created</div>
                    <div className="font-semibold">{formatDate(it.createdAt)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {items.length === 0 && (
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="py-10 text-center text-gray-600">
                No transactions found.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default TransactionHistoryPage;

