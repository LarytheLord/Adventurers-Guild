'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const [bankDetails, setBankDetails] = useState({
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
  });
  const [isLinked, setIsLinked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
    setLoading(true);
    setMessage(null);

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
                onChange={(e) => setBankDetails({ ...bankDetails, accountHolderName: e.target.value })}
                className="w-full border rounded-md p-2"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Account Number</label>
              <input
                type="text"
                required
                value={bankDetails.accountNumber}
                onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                className="w-full border rounded-md p-2"
                placeholder="1234567890"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">IFSC Code</label>
              <input
                type="text"
                required
                value={bankDetails.ifscCode}
                onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value.toUpperCase() })}
                className="w-full border rounded-md p-2"
                placeholder="SBIN0001234"
              />
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
    </div>
  );
}