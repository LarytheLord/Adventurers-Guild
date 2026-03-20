'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Coins, TrendingDown, TrendingUp, Calendar, ExternalLink, Search } from 'lucide-react';
import { formatCurrency, getPaymentHistory, Transaction } from '@/lib/payment-utils';
import { getStatusColor } from '@/lib/status-utils';

export default function MyPaymentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<'incoming' | 'outgoing' | 'all'>('incoming');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && session?.user?.role === 'company') {
      // Companies should go to their payment page instead
      router.push('/dashboard/company/payments');
      return;
    }

    const fetchPayments = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!session?.user?.id) {
          setError('User ID not found');
          return;
        }

        const payments = await getPaymentHistory(
          session.user.id,
          typeFilter,
          statusFilter === 'all' ? undefined : statusFilter
        );

        setTransactions(payments as Transaction[]);
      } catch (err) {
        console.error('Error fetching payments:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch payment history');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchPayments();
    }
  }, [status, session, typeFilter, statusFilter, router]);

  const filteredTransactions = transactions.filter(transaction => 
    transaction.quest?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.fromUser?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={() => router.back()}>
          ← Back
        </Button>
      </div>
    );
  }

  const totalEarned = filteredTransactions
    .filter(t => t.status === 'completed' && t.toUserId === session?.user?.id)
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const totalSpent = filteredTransactions
    .filter(t => t.status === 'completed' && t.fromUserId === session?.user?.id)
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Payment History</h1>
        <p className="text-muted-foreground mt-1">
          Track your earnings and payments on the Adventurers Guild platform
        </p>
      </div>

      <div className="mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          ← Back to Dashboard
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalEarned)}</div>
            <p className="text-xs text-muted-foreground">From completed quests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalSpent)}</div>
            <p className="text-xs text-muted-foreground">On platform services</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Transactions</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredTransactions.filter(t => t.status !== 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">Pending or processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quests Paid</CardTitle>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredTransactions.filter(t => t.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">Successful transactions</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                Your payment transactions on the platform
              </CardDescription>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex gap-1">
                <Button
                  variant={typeFilter === 'incoming' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTypeFilter('incoming')}
                >
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Earnings
                </Button>
                <Button
                  variant={typeFilter === 'outgoing' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTypeFilter('outgoing')}
                >
                  <TrendingDown className="w-3 h-3 mr-1" />
                  Payments
                </Button>
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <Coins className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg sm:text-xl font-medium mb-2">No transactions yet</h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 px-4">
                {searchTerm || statusFilter !== 'all'
                  ? 'No transactions match your current filters'
                  : 'You haven\'t received or made any payments yet.'}
              </p>
              {(!searchTerm && statusFilter === 'all') && (
                <Button onClick={() => router.push('/dashboard/quests')}>
                  Browse Quests
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <div 
                  key={transaction.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${
                      transaction.toUserId === session?.user?.id 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.toUserId === session?.user?.id ? (
                        <TrendingUp className="w-5 h-5" />
                      ) : (
                        <TrendingDown className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">
                        {transaction.quest?.title || 'Quest Payment'}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {transaction.description || 
                          (transaction.toUserId === session?.user?.id 
                            ? `Received from ${transaction.fromUser?.name || 'Unknown'}` 
                            : `Paid to ${transaction.toUser?.name || 'Unknown'}`)}
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <Calendar className="w-3 h-3 mr-1" />
                        <span>{new Date(transaction.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`font-medium ${
                      transaction.toUserId === session?.user?.id 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {transaction.toUserId === session?.user?.id ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </div>
                    <Badge variant="outline" className={getStatusColor(transaction.status)}>
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
