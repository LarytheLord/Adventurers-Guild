'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side validation
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
      setError('Invalid reset link');
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
        toast.success('Password reset successful! Redirecting to login...');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-slate-900 border-r border-slate-800">
        <Link href="/home" className="flex items-center gap-2.5 group w-fit">
          <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:bg-orange-600 transition-colors">
            <span className="text-black font-bold text-sm">AG</span>
          </div>
          <span className="text-white font-bold text-lg">Adventurers Guild</span>
        </Link>

        <div className="space-y-8">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.15em] text-orange-400/60 uppercase mb-3">
              Security matters
            </p>
            <h2 className="text-3xl font-bold text-white mb-3">
              Reset your password securely
            </h2>
            <p className="text-slate-400 leading-relaxed">
              Your password is the key to your Guild account. Keep it strong and unique to protect your quests and earnings.
            </p>
          </div>

          <div className="rounded-xl border border-slate-700/50 bg-slate-800/60 p-4">
            <p className="text-sm text-slate-300 leading-relaxed">
              Make sure your new password is at least 8 characters long and includes a mix of uppercase, lowercase, numbers, and symbols for maximum security.
            </p>
          </div>
        </div>

        <blockquote className="border-l-2 border-orange-500/40 pl-4">
          <p className="text-slate-400 text-sm leading-relaxed mb-3">
            &ldquo;A strong password is your first line of defense against unauthorized access.&rdquo;
          </p>
          <footer className="text-sm text-slate-500">Security Best Practices</footer>
        </blockquote>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-sm space-y-8">
          <div className="lg:hidden flex items-center gap-2.5 justify-center mb-2">
            <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-sm">AG</span>
            </div>
            <span className="text-white font-bold text-lg">Adventurers Guild</span>
          </div>

          {!success ? (
            <>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-white tracking-tight">Reset Your Password</h1>
                <p className="text-sm text-slate-400">Enter your new password below.</p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-300 text-sm font-medium">
                    New Password
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    minLength={8}
                    className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-orange-500/50 focus:ring-orange-500/20 h-11"
                  />
                  <p className="text-xs text-slate-500">Minimum 8 characters</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-slate-300 text-sm font-medium">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    minLength={8}
                    className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-orange-500/50 focus:ring-orange-500/20 h-11"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-black font-semibold rounded-lg shadow-lg shadow-orange-500/20 transition-all mt-2"
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="mr-2 h-4 w-4" />
                  )}
                  Reset Password
                </Button>
              </form>

              <p className="text-center text-sm text-slate-500">
                Remember your password?{' '}
                <Link href="/login" className="text-orange-400 hover:text-orange-300 font-medium transition-colors">
                  Sign in
                </Link>
              </p>
            </>
          ) : (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center text-green-500">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Password Reset Successful</h2>
                <p className="text-slate-400">
                  Your password has been reset. You&apos;ll be redirected to the login page in a moment.
                </p>
              </div>
              <Link href="/login">
                <Button className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-black font-semibold">
                  Go to Login
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
