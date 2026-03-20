'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Calendar, Coins, ExternalLink, Search, TrendingDown, TrendingUp } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useApiFetch } from '@/lib/hooks';
import { formatCurrency, type Transaction } from '@/lib/payment-utils';
import { getStatusColor } from '@/lib/status-utils';

type PaymentsResponse = {
  success: boolean;
  transactions: Transaction[];
  error?: string;
};

export default function MyPaymentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [typeFilter, setTypeFilter] = useState<'incoming' | 'outgoing' | 'all'>('incoming');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && session?.user?.role === 'company') {
      router.push('/dashboard/company/payments');
    }
  }, [router, session?.user?.role, status]);

  const shouldFetch = status === 'authenticated' && session?.user?.role !== 'company';
  const paymentParams = new URLSearchParams({ type: typeFilter });

  if (statusFilter !== 'all') {
    paymentParams.set('status', statusFilter);
  }

  const { data, loading, error } = useApiFetch<PaymentsResponse>(`/api/payments?${paymentParams.toString()}`, {
    skip: !shouldFetch,
  });

  const transactions = data?.transactions ?? [];
  const viewerId = session?.user?.id;
  const filteredTransactions = transactions.filter(transaction =>
    transaction.quest?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.fromUser?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center py-8">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
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
          Back
        </Button>
      </div>
    );
  }

  if (status !== 'authenticated' || session?.user?.role === 'company') {
    return null;
  }

  const totalEarned = filteredTransactions
    .filter(transaction => transaction.status === 'completed' && transaction.toUserId === viewerId)
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const totalSpent = filteredTransactions
    .filter(transaction => transaction.status === 'completed' && transaction.fromUserId === viewerId)
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  return (
    <div className="container mx-auto max-w-6xl py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Payment History</h1>
        <p className="mt-1 text-muted-foreground">
          Track your earnings and payments on the Adventurers Guild platform
        </p>
      </div>

      <div className="mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          Back to Dashboard
        </Button>
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-4">
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
              {filteredTransactions.filter(transaction => transaction.status !== 'completed').length}
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
              {filteredTransactions.filter(transaction => transaction.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">Successful transactions</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Your payment transactions on the platform</CardDescription>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="flex gap-1">
                <Button
                  variant={typeFilter === 'incoming' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTypeFilter('incoming')}
                >
                  <TrendingUp className="mr-1 h-3 w-3" />
                  Earnings
                </Button>
                <Button
                  variant={typeFilter === 'outgoing' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTypeFilter('outgoing')}
                >
                  <TrendingDown className="mr-1 h-3 w-3" />
                  Payments
                </Button>
              </div>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full rounded-lg border py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="py-8 text-center sm:py-12">
              <Coins className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-medium sm:text-xl">No transactions yet</h3>
              <p className="mb-4 px-4 text-sm text-muted-foreground sm:text-base">
                {searchTerm || statusFilter !== 'all'
                  ? 'No transactions match your current filters'
                  : "You haven't received or made any payments yet."}
              </p>
              {!searchTerm && statusFilter === 'all' ? (
                <Button onClick={() => router.push('/dashboard/quests')}>Browse Quests</Button>
              ) : null}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTransactions.map(transaction => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`rounded-full p-2 ${
                        transaction.toUserId === viewerId
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {transaction.toUserId === viewerId ? (
                        <TrendingUp className="h-5 w-5" />
                      ) : (
                        <TrendingDown className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">{transaction.quest?.title || 'Quest Payment'}</h4>
                      <p className="text-sm text-muted-foreground">
                        {transaction.description ||
                          (transaction.toUserId === viewerId
                            ? `Received from ${transaction.fromUser?.name || 'Unknown'}`
                            : `Paid to ${transaction.toUser?.name || 'Unknown'}`)}
                      </p>
                      <div className="mt-1 flex items-center text-xs text-muted-foreground">
                        <Calendar className="mr-1 h-3 w-3" />
                        <span>{new Date(transaction.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`font-medium ${
                        transaction.toUserId === viewerId ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {transaction.toUserId === viewerId ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
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
