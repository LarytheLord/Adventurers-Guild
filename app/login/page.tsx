'use client';

import Link from 'next/link';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RankBadge } from '@/components/ui/rank-badge';
import type { Rank } from '@/components/ui/rank-badge';

const ranks: { rank: Rank; label: string; pay: string }[] = [
  { rank: 'F', label: 'Beginner', pay: '₹500–2K' },
  { rank: 'C', label: 'Intermediate', pay: '₹5K–15K' },
  { rank: 'A', label: 'Expert', pay: '₹25K–60K' },
  { rank: 'S', label: 'Elite', pay: '₹80K+' },
];

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => { setIsHydrated(true); }, []);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  async function handleLogin() {
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }
    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        email,
        password,
        callbackUrl: '/dashboard',
        redirect: false,
      });
      if (result?.error) {
        toast.error('Invalid email or password');
      } else {
        if (result?.url) {
          window.location.assign(result.url);
          return;
        }
        router.replace('/dashboard');
        router.refresh();
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Left panel — editorial */}
      <div className="hidden lg:flex lg:w-[52%] flex-col justify-between border-r border-white/10 bg-slate-950 p-14 xl:p-20">
        <Link href="/home" className="flex items-center gap-2.5 group w-fit">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-orange-500 group-hover:bg-orange-400 transition-colors">
            <span className="text-[11px] font-bold text-slate-950">AG</span>
          </div>
          <span className="text-[14px] font-semibold text-white">Adventurers Guild</span>
        </Link>

        <div className="space-y-10">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-orange-400/70">
              Rank progression
            </p>
            <h2 className="mt-5 text-[36px] font-bold leading-[1.1] tracking-[-0.025em] text-white md:text-[42px]">
              Every quest<br />brings you closer<br />to S-Rank.
            </h2>
            <p className="mt-5 text-[14px] leading-[1.65] text-white/50">
              Complete real projects, earn XP, unlock bigger pay. Your code history is your reputation — no resume needed.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {ranks.map(({ rank, label, pay }) => (
              <div
                key={rank}
                className="flex items-center gap-3 rounded-lg border border-white/8 bg-white/3 px-4 py-3"
              >
                <RankBadge rank={rank} size="sm" />
                <div>
                  <p className="text-[12px] font-medium text-white">{label}</p>
                  <p className="text-[11px] text-white/35">{pay}/quest</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <blockquote className="border-l-2 border-orange-500/30 pl-5">
          <p className="text-[13px] leading-[1.65] text-white/40">
            &ldquo;The quest system ensures developers actually have the skills they claim. Best hiring decision I&apos;ve made.&rdquo;
          </p>
          <footer className="mt-3 text-[11px] font-medium text-white/25">
            Sofia Davis — CTO, TechStart
          </footer>
        </blockquote>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 sm:px-8">
        <div className="w-full max-w-[360px] space-y-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-orange-500">
              <span className="text-[11px] font-bold text-slate-950">AG</span>
            </div>
            <span className="text-[14px] font-semibold text-white">Adventurers Guild</span>
          </div>

          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-orange-400/70 mb-4">
              Welcome back
            </p>
            <h1 className="text-[28px] font-bold leading-[1.1] tracking-[-0.025em] text-white">
              Back in the game.
            </h1>
            <p className="mt-3 text-[14px] leading-[1.6] text-white/50">
              Sign in to access your quest board.
            </p>
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); void handleLogin(); }}
            className="space-y-4"
            data-auth-ready={isHydrated ? 'true' : 'false'}
          >
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[12px] font-medium text-white/60 uppercase tracking-[0.08em]">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!isHydrated || isLoading}
                required
                className="h-10 border-white/10 bg-white/5 text-[13px] text-white placeholder:text-white/20 focus:border-orange-500/40 focus:ring-orange-500/10 rounded-md"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-[12px] font-medium text-white/60 uppercase tracking-[0.08em]">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] text-white/35 hover:text-orange-400 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={!isHydrated || isLoading}
                required
                className="h-10 border-white/10 bg-white/5 text-[13px] text-white placeholder:text-white/20 focus:border-orange-500/40 focus:ring-orange-500/10 rounded-md"
              />
            </div>

            <button
              type="submit"
              disabled={!isHydrated || isLoading}
              className="mt-2 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-orange-500 px-4 text-[13px] font-semibold text-slate-950 transition-colors hover:bg-orange-400 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Sign in
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
                </>
              )}
            </button>
          </form>

          <div className="border-t border-white/8 pt-6 text-center">
            <p className="text-[13px] text-white/35">
              No account?{' '}
              <Link href="/register" className="font-medium text-orange-400 hover:text-orange-300 transition-colors">
                Join the Guild
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
