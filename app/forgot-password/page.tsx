'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong');
      } else {
        setSuccess(true);
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[52%] flex-col justify-between border-r border-white/10 bg-slate-950 p-14 xl:p-20">
        <Link href="/home" className="flex items-center gap-2.5 group w-fit">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-orange-500 group-hover:bg-orange-400 transition-colors">
            <span className="text-[11px] font-bold text-slate-950">AG</span>
          </div>
          <span className="text-[14px] font-semibold text-white">Guild</span>
        </Link>

        <div className="space-y-8">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-orange-400/70">
              Account recovery
            </p>
            <h2 className="mt-5 text-[36px] font-bold leading-[1.1] tracking-[-0.025em] text-white md:text-[42px]">
              Lost access?<br />We&apos;ll get you<br />back in.
            </h2>
            <p className="mt-5 text-[14px] leading-[1.65] text-white/50">
              Enter your email and we&apos;ll send a secure reset link. Takes about 30 seconds.
            </p>
          </div>

          <div className="rounded-lg border border-white/8 bg-white/3 px-5 py-4">
            <p className="text-[12px] leading-[1.6] text-white/40">
              Check your inbox — and spam folder — for a message from Guild. Links expire after 1 hour.
            </p>
          </div>
        </div>

        <p className="text-[11px] text-white/20">
          Secure · Encrypted · Links expire in 1 hour
        </p>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 sm:px-8">
        <div className="w-full max-w-[360px] space-y-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-orange-500">
              <span className="text-[11px] font-bold text-slate-950">AG</span>
            </div>
            <span className="text-[14px] font-semibold text-white">Guild</span>
          </div>

          {!success ? (
            <>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-orange-400/70 mb-4">
                  Reset password
                </p>
                <h1 className="text-[28px] font-bold leading-[1.1] tracking-[-0.025em] text-white">
                  Forgot your password?
                </h1>
                <p className="mt-3 text-[14px] leading-[1.6] text-white/50">
                  Enter your email and we&apos;ll send you a reset link.
                </p>
              </div>

              {error && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3">
                  <p className="text-[12px] text-red-400">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-[12px] font-medium text-white/60 uppercase tracking-[0.08em]">
                    Email address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="h-10 border-white/10 bg-white/5 text-[13px] text-white placeholder:text-white/20 focus:border-orange-500/40 focus:ring-orange-500/10 rounded-md"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-orange-500 px-4 text-[13px] font-semibold text-slate-950 transition-colors hover:bg-orange-400 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Send reset link
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
                  Check your inbox
                </p>
                <h2 className="text-[28px] font-bold leading-[1.1] tracking-[-0.025em] text-white">
                  Link sent.
                </h2>
                <p className="mt-3 text-[14px] leading-[1.6] text-white/50">
                  We&apos;ve sent a reset link to{' '}
                  <span className="font-medium text-white/70">{email}</span>.
                  Check your inbox — and spam folder.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => { setSuccess(false); setEmail(''); }}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-white/10 bg-white/5 px-4 text-[13px] font-semibold text-white transition-colors hover:bg-white/10"
                >
                  <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.5} />
                  Send another link
                </button>
                <Link
                  href="/login"
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-orange-500 px-4 text-[13px] font-semibold text-slate-950 transition-colors hover:bg-orange-400"
                >
                  Back to sign in
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
