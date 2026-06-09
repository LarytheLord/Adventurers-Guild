'use client';

import { useState } from 'react';
import { SunIcon as Sunburst, ArrowRight, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
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

  const inputClass =
    'text-sm w-full py-2 px-3 border rounded-lg focus:outline-none focus:ring-1 bg-white text-black focus:ring-orange-500 border-gray-300';
  const labelClass = 'block text-sm mb-2';

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
              Lost access? We&apos;ll get you back in.
            </h1>
          </div>

          {/* Right panel */}
          <div className="p-8 md:p-12 md:w-1/2 flex flex-col bg-secondary text-secondary-foreground">
            <div className="flex flex-col items-left mb-8">
              <div className="text-orange-500 mb-4">
                <Sunburst className="h-10 w-10" />
              </div>
              {!success ? (
                <>
                  <h2 className="text-3xl font-medium mb-2 tracking-tight">Forgot password?</h2>
                  <p className="opacity-80">Enter your email and we&apos;ll send a reset link.</p>
                </>
              ) : (
                <>
                  <h2 className="text-3xl font-medium mb-2 tracking-tight">Check your inbox</h2>
                  <p className="opacity-80">
                    We sent a link to <span className="font-medium">{email}</span>. Check spam too.
                  </p>
                </>
              )}
            </div>

            {!success ? (
              <div className="flex flex-col gap-4">
                {error && (
                  <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
                )}
                <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
                  <div>
                    <label htmlFor="email" className={labelClass}>Email address</label>
                    <input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      className={inputClass}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                      <><ArrowRight className="h-4 w-4" /> Send reset link</>
                    )}
                  </button>
                  <div className="text-center text-gray-600 text-sm">
                    Remember it?{' '}
                    <Link href="/login" className="text-orange-500 font-medium underline">Sign in</Link>
                  </div>
                </form>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 rounded-lg bg-green-50 border border-green-200 px-4 py-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                  <p className="text-sm text-green-700">Reset link sent!</p>
                </div>
                <button
                  onClick={() => { setSuccess(false); setEmail(''); }}
                  className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" /> Send another link
                </button>
                <Link
                  href="/login"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  Back to sign in <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
