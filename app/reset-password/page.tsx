'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => { setIsHydrated(true); }, []);

  if (!isHydrated) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!token) {
      setError('Invalid reset link — please request a new one');
      return;
    }

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
        setTimeout(() => { window.location.href = '/login'; }, 2000);
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'h-10 border-white/10 bg-white/5 text-[13px] text-white placeholder:text-white/20 focus:border-orange-500/40 focus:ring-orange-500/10 rounded-md';

  return (
    <div className="w-full max-w-[360px] space-y-8">
      {/* Mobile logo */}
      <div className="flex items-center gap-2.5 lg:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-orange-500">
          <span className="text-[11px] font-bold text-slate-950">AG</span>
        </div>
        <span className="text-[14px] font-semibold text-white">Adventurers Guild</span>
      </div>

      {!success ? (
        <>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-orange-400/70 mb-4">
              New password
            </p>
            <h1 className="text-[28px] font-bold leading-[1.1] tracking-[-0.025em] text-white">
              Reset your password.
            </h1>
            <p className="mt-3 text-[14px] leading-[1.6] text-white/50">
              Choose a strong password — at least 8 characters.
            </p>
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3">
              <p className="text-[12px] text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[12px] font-medium text-white/60 uppercase tracking-[0.08em]">
                New password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                minLength={8}
                required
                autoComplete="new-password"
                className={inputClass}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-[12px] font-medium text-white/60 uppercase tracking-[0.08em]">
                Confirm password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                minLength={8}
                required
                autoComplete="new-password"
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-1 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-orange-500 px-4 text-[13px] font-semibold text-slate-950 transition-colors hover:bg-orange-400 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Set new password
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
                </>
              )}
            </button>
          </form>

          <div className="border-t border-white/8 pt-6 text-center">
            <p className="text-[13px] text-white/35">
              Remember it?{' '}
              <Link href="/login" className="font-medium text-orange-400 hover:text-orange-300 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </>
      ) : (
        <div className="space-y-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5">
            <CheckCircle2 className="h-5 w-5 text-orange-400" />
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-orange-400/70 mb-4">
              Done
            </p>
            <h2 className="text-[28px] font-bold leading-[1.1] tracking-[-0.025em] text-white">
              Password updated.
            </h2>
            <p className="mt-3 text-[14px] leading-[1.6] text-white/50">
              Redirecting you to sign in...
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-orange-500 px-4 text-[13px] font-semibold text-slate-950 transition-colors hover:bg-orange-400"
          >
            Go to sign in
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
          </Link>
        </div>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[52%] flex-col justify-between border-r border-white/10 bg-slate-950 p-14 xl:p-20">
        <Link href="/home" className="flex items-center gap-2.5 group w-fit">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-orange-500 group-hover:bg-orange-400 transition-colors">
            <span className="text-[11px] font-bold text-slate-950">AG</span>
          </div>
          <span className="text-[14px] font-semibold text-white">Adventurers Guild</span>
        </Link>

        <div className="space-y-8">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-orange-400/70">
              Account security
            </p>
            <h2 className="mt-5 text-[36px] font-bold leading-[1.1] tracking-[-0.025em] text-white md:text-[42px]">
              Almost there.<br />Set a new<br />password.
            </h2>
            <p className="mt-5 text-[14px] leading-[1.65] text-white/50">
              Use at least 8 characters. A mix of letters, numbers, and symbols is best.
            </p>
          </div>

          <div className="rounded-lg border border-white/8 bg-white/3 px-5 py-4">
            <p className="text-[12px] leading-[1.6] text-white/40">
              This link expires in 1 hour. If it&apos;s expired, request a new one from the forgot password page.
            </p>
          </div>
        </div>

        <p className="text-[11px] text-white/20">
          Secure · One-time use · Expires in 1 hour
        </p>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 sm:px-8">
        <Suspense fallback={null}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
