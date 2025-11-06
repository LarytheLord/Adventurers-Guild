'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CreditCard, DollarSign, TrendingUp, Wallet, Calendar, Search, Filter, Download } from 'lucide-react';
import { formatCurrency } from '@/lib/payment-utils';
import { getPaymentHistory, getTotalEarnings } from '@/lib/payment-utils';

interface Transaction {
  id: string;
  from_user_id: string;
  to_user_id: string;
  quest_id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  transaction_id?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  from_user: {
    name: string;
    email: string;
  };
  to_user: {
    name: string;
    email: string;
  };
  quests: {
    title: string;
  };
}

export default function EarningsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && session?.user?.role !== 'adventurer' && session.user.role !== 'admin') {
      // Only adventurers and admins can access this page
      router.push('/dashboard');
      return;
    }

    const fetchEarnings = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!session?.user?.id) {
          setError('User ID not found');
          return;
        }

        // Get total earnings
        const earnings = await getTotalEarnings(session.user.id);
        setTotalEarnings(earnings);

        // Get payment history
        const payments = await getPaymentHistory(
          session.user.id,
          'incoming', // Adventurers receive incoming payments
          statusFilter === 'all' ? undefined : statusFilter
        );

        setTransactions(payments as Transaction[]);
      } catch (err) {
        console.error('Error fetching earnings:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch earnings');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchEarnings();
    }
  }, [status, session, statusFilter, router]);

  const filteredTransactions = transactions.filter(transaction =>
    transaction.quests?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.from_user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Earnings & Payments</h1>
        <p className="text-muted-foreground mt-1">
          Track your payments earned from completed quests
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalEarnings)}</div>
            <p className="text-xs text-muted-foreground">Lifetime earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
            <p className="text-xs text-muted-foreground">Payment transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Quests</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {transactions.filter(t => t.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">Paid quests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(transactions.filter(t => t.status === 'pending').reduce((sum, t) => sum + t.amount, 0))}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by quest, company, or transaction ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              <Search className="h-4 w-4" />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              ← Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="text-center py-12">
          <Wallet className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">No payments yet</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || statusFilter !== 'all' 
              ? 'No payments match your current filters' 
              : 'You haven\'t earned any payments yet. Complete quests to start earning.'}
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
            <Card key={transaction.id}>
              <CardHeader className="sm:grid sm:grid-cols-3 sm:items-center">
                <div>
                  <CardTitle className="text-lg">{transaction.quests?.title || 'Quest Payment'}</CardTitle>
                  <CardDescription>
                    From {transaction.from_user?.name || 'Unknown Company'}
                  </CardDescription>
                </div>
                <div className="sm:mt-0 mt-2">
                  <div className="font-bold text-lg">{formatCurrency(transaction.amount, transaction.currency)}</div>
                  <div className="text-sm text-muted-foreground flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex sm:justify-end sm:mt-0 mt-2">
                  <Badge className={`
                    ${transaction.status === 'completed' ? 'bg-green-500' : 
                      transaction.status === 'pending' ? 'bg-yellow-500' : 
                      transaction.status === 'failed' ? 'bg-red-500' : 
                      transaction.status === 'cancelled' ? 'bg-gray-500' : 
                      'bg-gray-500'}
                  `}>
                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="text-sm">
                    <p className="font-medium">Transaction ID: {transaction.transaction_id || transaction.id}</p>
                    <p className="text-muted-foreground">{transaction.description || 'Payment for quest completion'}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Receipt
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => router.push(`/dashboard/quests/${transaction.quest_id}`)}
                    >
                      View Quest
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}