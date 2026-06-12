'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { SunIcon as Sunburst, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';

const inputClass =
  'text-sm w-full py-2 px-3 border rounded-lg focus:outline-none focus:ring-1 bg-white text-black focus:ring-orange-500 border-gray-300';
const labelClass = 'block text-sm mb-2';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    if (!searchParams.get('token')) {
      setError('Invalid reset link — please request a new one');
    }
  }, [searchParams]);

  if (!isHydrated) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!password || !confirmPassword) { setError('Please fill in all fields'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (!token) { setError('Invalid reset link — please request a new one'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to reset password');
      } else {
        setSuccess(true);
        setTimeout(() => { router.push('/login'); }, 2000);
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {!success ? (
        <>
          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}
          <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
            <div>
              <label htmlFor="password" className={labelClass}>New password</label>
              <input
                id="password"
                type="password"
                placeholder="Min. 8 characters"
                minLength={8}
                autoComplete="new-password"
                className={inputClass}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className={labelClass}>Confirm password</label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Repeat password"
                minLength={8}
                autoComplete="new-password"
                className={inputClass}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                <><ArrowRight className="h-4 w-4" /> Set new password</>
              )}
            </button>
            <div className="text-center text-gray-600 text-sm">
              Remember it?{' '}
              <Link href="/login" className="text-orange-500 font-medium underline">Sign in</Link>
            </div>
          </form>
        </>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-lg bg-green-50 border border-green-200 px-4 py-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
            <p className="text-sm text-green-700">Password updated! Redirecting...</p>
          </div>
          <Link
            href="/login"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            Go to sign in <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col overflow-hidden relative bg-background">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: [
            'radial-gradient(ellipse 50% 40% at 30% 65%, #f9731618 0%, transparent 50%)',
            'radial-gradient(ellipse 70% 55% at 30% 65%, #ea580c10 0%, transparent 55%)',
            'radial-gradient(ellipse 85% 70% at 30% 65%, #1a1a1a08 0%, transparent 65%)',
            'radial-gradient(ellipse 110% 90% at 30% 65%, #29252406 0%, transparent 80%)',
          ].join(', '),
        }}
      />

      <div className="flex-1 flex items-center justify-center p-4 pb-12">
        <div className="w-full relative max-w-5xl overflow-hidden flex flex-col md:flex-row shadow-2xl rounded-2xl">

          {/* Left panel */}
          <div className="bg-black text-white p-8 md:p-12 md:w-1/2 relative rounded-bl-2xl overflow-hidden">
            <div className="w-full h-full z-[2] absolute inset-0 bg-gradient-to-t from-transparent to-black pointer-events-none" />
            <div className="flex absolute inset-0 z-[2] overflow-hidden backdrop-blur-2xl pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-full z-[2] w-[4rem] bg-gradient-to-r from-[#ffffff00] via-[#000000] via-[69%] to-[#ffffff30] opacity-30" />
              ))}
            </div>
            <div className="w-[15rem] h-[15rem] bg-orange-500 absolute z-[1] rounded-full -bottom-16 -left-16 pointer-events-none" />
            <div className="w-[8rem] h-[5rem] bg-white absolute z-[1] rounded-full -bottom-8 left-8 pointer-events-none" />
            <h1 className="text-2xl md:text-3xl font-medium leading-tight z-10 tracking-tight relative">
              Almost there — set your new password.
            </h1>
          </div>

          {/* Right panel */}
          <div className="p-8 md:p-12 md:w-1/2 flex flex-col bg-secondary text-secondary-foreground">
            <div className="flex flex-col items-start mb-8">
              <div className="text-orange-500 mb-4">
                <Sunburst className="h-10 w-10" />
              </div>
              <h2 className="text-3xl font-medium mb-2 tracking-tight">Reset password</h2>
              <p className="opacity-80">Choose a strong password — at least 8 characters.</p>
            </div>
            <Suspense fallback={null}>
              <ResetPasswordForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
