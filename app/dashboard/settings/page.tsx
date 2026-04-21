'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface ValidationErrors {
  accountHolderName?: string;
  accountNumber?: string;
  ifscCode?: string;
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
    </div>
  );
}