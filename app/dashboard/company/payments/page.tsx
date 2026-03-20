'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Calendar, CreditCard, DollarSign, Download, Search, TrendingUp, Wallet } from 'lucide-react';
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

export default function CompanyPaymentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const role = session?.user?.role;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && role !== 'company' && role !== 'admin') {
      router.push('/dashboard');
    }
  }, [role, router, status]);

  const shouldFetch = status === 'authenticated' && (role === 'company' || role === 'admin');

  const paymentParams = new URLSearchParams({ type: 'outgoing' });
  if (statusFilter !== 'all') {
    paymentParams.set('status', statusFilter);
  }

  const { data, loading, error } = useApiFetch<PaymentsResponse>(`/api/payments?${paymentParams.toString()}`, {
    skip: !shouldFetch,
  });

  const transactions = data?.transactions ?? [];
  const totalSpent = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const filteredTransactions = transactions.filter(transaction =>
    transaction.quest?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.toUser?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
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

  if (!shouldFetch) {
    return null;
  }

  return (
    <div className="container mx-auto max-w-6xl py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Payment History</h1>
        <p className="mt-1 text-muted-foreground">
          Track your payments to adventurers for completed quests
        </p>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
            <p className="text-xs text-muted-foreground">Lifetime spending</p>
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
              {transactions.filter(transaction => transaction.status === 'completed').length}
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
              {formatCurrency(
                transactions
                  .filter(transaction => transaction.status === 'pending')
                  .reduce((sum, transaction) => sum + transaction.amount, 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by quest, adventurer, or transaction ID..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full rounded-lg border py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Search className="h-4 w-4" />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <Button variant="outline" onClick={() => router.push('/dashboard/company')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="py-12 text-center">
          <Wallet className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
          <h3 className="mb-2 text-xl font-medium">No payments yet</h3>
          <p className="mb-4 text-muted-foreground">
            {searchTerm || statusFilter !== 'all'
              ? 'No payments match your current filters'
              : "You haven't made any payments yet. Complete quests to start paying adventurers."}
          </p>
          {!searchTerm && statusFilter === 'all' ? (
            <Button onClick={() => router.push('/dashboard/company/quests')}>View Quests</Button>
          ) : null}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTransactions.map(transaction => (
            <Card key={transaction.id}>
              <CardHeader className="sm:grid sm:grid-cols-3 sm:items-center">
                <div>
                  <CardTitle className="text-lg">{transaction.quest?.title || 'Quest Payment'}</CardTitle>
                  <CardDescription>To {transaction.toUser?.name || 'Unknown Adventurer'}</CardDescription>
                </div>
                <div className="mt-2 sm:mt-0">
                  <div className="text-lg font-bold">{formatCurrency(transaction.amount, transaction.currency)}</div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-1 h-4 w-4" />
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="mt-2 flex sm:mt-0 sm:justify-end">
                  <Badge variant="outline" className={getStatusColor(transaction.status)}>
                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm">
                    <p className="font-medium">Transaction ID: {transaction.transactionId || transaction.id}</p>
                    <p className="text-muted-foreground">
                      {transaction.description || 'Payment for quest completion'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Receipt
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/dashboard/company/quests/${transaction.questId}`)}
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
