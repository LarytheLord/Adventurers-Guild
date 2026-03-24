'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CreditCard,
  DollarSign,
  Download,
  Search,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { formatCurrency, getPaymentHistory, Transaction } from '@/lib/payment-utils';
import { GuildCard, GuildHero, GuildKpi, GuildPage, GuildPanel } from '@/components/guild/primitives';

function paymentStatusClass(status: string) {
  switch (status) {
    case 'completed':
      return 'bg-emerald-100 text-emerald-700 border-emerald-300';
    case 'pending':
      return 'bg-amber-100 text-amber-700 border-amber-300';
    case 'failed':
      return 'bg-rose-100 text-rose-700 border-rose-300';
    case 'cancelled':
      return 'bg-slate-100 text-slate-700 border-slate-300';
    default:
      return 'bg-sky-100 text-sky-700 border-sky-300';
  }
}

export default function CompanyPaymentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  useEffect(() => {
    const fetchPayments = async () => {
      if (!session?.user?.id) return;
      try {
        setLoading(true);
        setError(null);

        const payments = await getPaymentHistory(
          session.user.id,
          'outgoing',
          statusFilter === 'all' ? undefined : statusFilter
        );

        setTransactions(payments as Transaction[]);
        setTotalSpent(payments.reduce((sum, transaction) => sum + transaction.amount, 0));
      } catch (fetchError) {
        console.error('Error fetching payments:', fetchError);
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to fetch payment history');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      void fetchPayments();
    }
  }, [router, session, status, statusFilter]);

  const filteredTransactions = useMemo(
    () =>
      transactions.filter((transaction) =>
        [
          transaction.quest?.title || '',
          transaction.toUser?.name || '',
          transaction.description || '',
          transaction.id,
          transaction.transactionId || '',
        ]
          .join(' ')
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      ),
    [searchTerm, transactions]
  );

  const completedTransactions = filteredTransactions.filter((transaction) => transaction.status === 'completed');
  const pendingTransactions = filteredTransactions.filter((transaction) => transaction.status === 'pending');
  const pendingTotal = pendingTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);

  if (status === 'loading' || loading) {
    return (
      <GuildPage>
        <GuildPanel className="flex min-h-[320px] items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
        </GuildPanel>
      </GuildPage>
    );
  }

  if (error) {
    return (
      <GuildPage>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button className="w-fit" variant="outline" onClick={() => router.back()}>
          Back
        </Button>
      </GuildPage>
    );
  }

  if (!shouldFetch) {
    return null;
  }

  return (
    <GuildPage>
      <GuildHero>
        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge className="rounded-full border border-emerald-300 bg-emerald-100 text-emerald-700">
              Treasury Ledger
            </Badge>
            <h1 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">Company Payments</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
              Review outgoing payments, monitor pending settlements, and keep quest payouts visible.
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push('/dashboard/company')}>
            Back to Dashboard
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </GuildHero>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <GuildKpi className="sm:col-span-2 xl:col-span-1">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Spent</p>
            <Wallet className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{formatCurrency(totalSpent)}</p>
          <p className="mt-1 text-xs text-slate-500">Lifetime payout volume</p>
        </GuildKpi>
        <GuildKpi>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Transactions</p>
            <CreditCard className="h-4 w-4 text-sky-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{filteredTransactions.length}</p>
          <p className="mt-1 text-xs text-slate-500">Matching current filters</p>
        </GuildKpi>
        <GuildKpi>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Completed</p>
            <TrendingUp className="h-4 w-4 text-violet-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{completedTransactions.length}</p>
          <p className="mt-1 text-xs text-slate-500">Settled payouts</p>
        </GuildKpi>
        <GuildKpi>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pending Value</p>
            <DollarSign className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{formatCurrency(pendingTotal)}</p>
          <p className="mt-1 text-xs text-slate-500">{pendingTransactions.length} payment(s) awaiting settlement</p>
        </GuildKpi>
      </section>

      <GuildPanel className="p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by quest, adventurer, description, or transaction ID"
              className="pl-9"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </GuildPanel>

      {filteredTransactions.length === 0 ? (
        <GuildPanel className="p-12 text-center">
          <Wallet className="mx-auto mb-4 h-14 w-14 text-slate-400" />
          <h3 className="text-xl font-semibold text-slate-900">No payments found</h3>
          <p className="mt-2 text-sm text-slate-500">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search terms or status filter.'
              : 'Complete quests to start building your payment history.'}
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <Button className="mt-4" onClick={() => router.push('/dashboard/company/quests')}>
              View Quests
            </Button>
          )}
        </GuildPanel>
      ) : (
        <section className="space-y-4">
          {filteredTransactions.map((transaction) => (
            <GuildCard key={transaction.id} className="border-slate-200/80">
              <CardContent className="p-5 sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold text-slate-900">
                        {transaction.quest?.title || 'Quest Payment'}
                      </h2>
                      <Badge variant="outline" className={paymentStatusClass(transaction.status)}>
                        {transaction.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600">
                      Paid to {transaction.toUser?.name || 'Unknown Adventurer'}
                    </p>
                    <p className="text-xs text-slate-500">
                      Transaction ID: {transaction.transactionId || transaction.id}
                    </p>
                    <p className="text-sm text-slate-500">
                      {transaction.description || 'Payment for quest completion'}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:min-w-[240px] sm:grid-cols-2 lg:grid-cols-1">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Amount</p>
                      <p className="mt-1 text-lg font-bold text-slate-900">
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <Calendar className="h-3.5 w-3.5" />
                        Created
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-900">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
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
              </CardContent>
            </GuildCard>
          ))}
        </section>
      )}
    </GuildPage>
  );
}
