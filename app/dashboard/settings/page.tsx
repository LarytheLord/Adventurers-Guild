'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { fetchWithAuth } from '@/lib/fetch-with-auth';

interface ValidationErrors {
  accountHolderName?: string;
  accountNumber?: string;
  ifscCode?: string;
}

interface ReferralStats {
  referralCode: string;
  referralLink: string;
  stats: { totalReferrals: number; totalXpEarned: number; milestoneXp: Record<string, number>; refereeSignupBonus: number };
  referrals: Array<{ id: string; name: string | null; username: string; joinedAt: string; questsCompleted: number }>;
}

function ReferralCard() {
  const [data, setData] = useState<ReferralStats | null>(null);

  useEffect(() => {
    fetchWithAuth('/api/referral').then(r => r.json()).then(d => { if (d.success) setData(d); }).catch(() => {});
  }, []);

  const copyLink = useCallback(() => {
    if (!data?.referralLink) return;
    navigator.clipboard.writeText(data.referralLink).then(() => toast.success('Referral link copied!')).catch(() => {});
  }, [data?.referralLink]);

  if (!data) return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 animate-pulse">
      <div className="h-5 w-32 rounded bg-slate-200 mb-4" />
      <div className="h-10 w-full rounded-xl bg-slate-100" />
    </section>
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Referral Program</h2>
        <p className="mt-1 text-sm text-slate-500">
          Share your link. When a friend signs up they get 50 XP — and when they complete their first quest you earn 200 XP. Three quests earns you 500 XP more.
        </p>
      </div>

      {/* Code + copy */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm text-slate-800 select-all">
          {data.referralLink}
        </div>
        <button
          onClick={copyLink}
          className="rounded-xl border border-slate-900 bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors sm:shrink-0"
        >
          Copy
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{data.stats.totalReferrals}</p>
          <p className="text-xs text-slate-500 mt-1">Friends referred</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
          <p className="text-2xl font-bold text-orange-500">{data.stats.totalXpEarned}</p>
          <p className="text-xs text-slate-500 mt-1">XP earned</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{data.stats.milestoneXp.first_quest_completed}</p>
          <p className="text-xs text-slate-500 mt-1">XP per referral</p>
        </div>
      </div>

      {/* Referral list */}
      {data.referrals.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Your referrals</p>
          {data.referrals.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5">
              <div>
                <p className="text-sm font-medium text-slate-900">{r.name ?? r.username}</p>
                <p className="text-xs text-slate-400">{r.questsCompleted} quest{r.questsCompleted !== 1 ? 's' : ''} completed</p>
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${r.questsCompleted >= 1 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'}`}>
                {r.questsCompleted >= 1 ? '+200 XP earned' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const [bankDetails, setBankDetails] = useState({
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLinked, setIsLinked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Validation functions
  const validateName = (name: string): string | undefined => {
    if (name.length < 2) return 'Name must be at least 2 characters';
    if (name.length > 60) return 'Name too long';
    if (!/^[a-zA-Z\s'-]+$/.test(name)) return 'Name contains invalid characters';
    return undefined;
  };

  const validateAccountNumber = (acc: string): string | undefined => {
    if (!/^\d{9,18}$/.test(acc)) return 'Account number must be 9-18 digits';
    return undefined;
  };

  const validateIfsc = (ifsc: string): string | undefined => {
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) return 'Invalid IFSC code (e.g., SBIN0001234)';
    return undefined;
  };

  const validateField = (field: keyof ValidationErrors, value: string) => {
    let error: string | undefined;
    if (field === 'accountHolderName') error = validateName(value);
    else if (field === 'accountNumber') error = validateAccountNumber(value);
    else if (field === 'ifscCode') error = validateIfsc(value);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/payments/razorpay/contact/status');
        const data = await res.json();
        setIsLinked(data.hasFundAccount);
      } catch {
        console.error('Failed to check payout status');
      }
    };
    if (status === 'authenticated') checkStatus();
  }, [status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate all fields
    const nameError = validateName(bankDetails.accountHolderName || session?.user?.name || '');
    const accError = validateAccountNumber(bankDetails.accountNumber);
    const ifscError = validateIfsc(bankDetails.ifscCode);

    if (nameError || accError || ifscError) {
      setErrors({
        accountHolderName: nameError,
        accountNumber: accError,
        ifscCode: ifscError,
      });
      return;
    }

    setLoading(true);
    setMessage(null);
    setErrors({});

    try {
      const res = await fetch('/api/payments/razorpay/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bankDetails),
      });
      const data = await res.json();
      if (res.ok) {
        setIsLinked(true);
        setMessage({ type: 'success', text: 'Bank account linked successfully!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Something went wrong' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') return <div className="p-8">Loading...</div>;
  if (!session) return <div className="p-8">Please sign in to access settings.</div>;

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <section className="border rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Payout Setup</h2>
        <p className="text-gray-600 mb-4">
          Link your bank account to receive payments for completed quests.
        </p>

        {isLinked ? (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 text-green-700">
            ✅ Bank account connected – you&apos;re ready to receive payments.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Account Holder Name</label>
              <input
                type="text"
                required
                value={bankDetails.accountHolderName}
                onChange={(e) => {
                  setBankDetails({ ...bankDetails, accountHolderName: e.target.value });
                  validateField('accountHolderName', e.target.value);
                }}
                className={`w-full border rounded-md p-2 ${errors.accountHolderName ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="John Doe"
              />
              {errors.accountHolderName && (
                <p className="text-red-500 text-xs mt-1">{errors.accountHolderName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Account Number</label>
              <input
                type="text"
                required
                value={bankDetails.accountNumber}
                onChange={(e) => {
                  setBankDetails({ ...bankDetails, accountNumber: e.target.value });
                  validateField('accountNumber', e.target.value);
                }}
                className={`w-full border rounded-md p-2 ${errors.accountNumber ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="1234567890"
              />
              {errors.accountNumber && (
                <p className="text-red-500 text-xs mt-1">{errors.accountNumber}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">IFSC Code</label>
              <input
                type="text"
                required
                value={bankDetails.ifscCode}
                onChange={(e) => {
                  setBankDetails({ ...bankDetails, ifscCode: e.target.value.toUpperCase() });
                  validateField('ifscCode', e.target.value.toUpperCase());
                }}
                className={`w-full border rounded-md p-2 ${errors.ifscCode ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="SBIN0001234"
              />
              {errors.ifscCode && (
                <p className="text-red-500 text-xs mt-1">{errors.ifscCode}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Linking...' : 'Link Bank Account'}
            </button>
            {message && (
              <div className={`mt-2 text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {message.text}
              </div>
            )}
          </form>
        )}
      </section>

      {session?.user?.role === 'adventurer' && <ReferralCard />}
    </div>
  );
}