'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { RankBadge } from '@/components/ui/rank-badge';
import type { Rank } from '@/components/ui/rank-badge';

const rankShowcase: { rank: Rank; label: string }[] = [
  { rank: 'F', label: 'Beginner' },
  { rank: 'D', label: 'Developing' },
  { rank: 'B', label: 'Skilled' },
  { rank: 'S', label: 'Elite' },
];

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

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
        toast.success('Logged in successfully');
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
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left panel — branding */}
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
              Rank progression
            </p>
            <h2 className="text-3xl font-bold text-white mb-3">
              Every quest brings you closer to S-Rank
            </h2>
            <p className="text-slate-400 leading-relaxed">
              Complete real projects, earn XP, and climb the ranks. Your code history is your reputation.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {rankShowcase.map(({ rank, label }) => (
              <div key={rank} className="flex flex-col items-center gap-2">
                <RankBadge rank={rank} size="md" glow />
                <span className="text-[10px] text-slate-500">{label}</span>
              </div>
            ))}
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
                <span className="text-slate-500 text-xs font-bold">···</span>
              </div>
            </div>
          </div>
        </div>

        <blockquote className="border-l-2 border-orange-500/40 pl-4">
          <p className="text-slate-400 text-sm leading-relaxed mb-3">
            &ldquo;The quest system ensures developers actually have the skills they claim. Best hiring decision I&apos;ve made.&rdquo;
          </p>
          <footer className="text-sm text-slate-500">Sofia Davis, CTO at TechStart</footer>
        </blockquote>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 justify-center mb-2">
            <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-sm">AG</span>
            </div>
            <span className="text-white font-bold text-lg">Adventurers Guild</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back, Adventurer</h1>
            <p className="text-sm text-slate-400">Enter your credentials to access your quest board.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300 text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                placeholder="name@example.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={isLoading}
                required
                className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-orange-500/50 focus:ring-orange-500/20 h-11"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-300 text-sm font-medium">
                  Password
                </Label>
                <Link href="/forgot-password" className="text-xs text-slate-500 hover:text-orange-400 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                disabled={isLoading}
                required
                className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-orange-500/50 focus:ring-orange-500/20 h-11"
              />
            </div>

            <Button
              disabled={isLoading}
              className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-black font-semibold rounded-lg shadow-lg shadow-orange-500/20 transition-all mt-2"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="mr-2 h-4 w-4" />
              )}
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500">
            No account?{' '}
            <Link href="/register" className="text-orange-400 hover:text-orange-300 font-medium transition-colors">
              Join the Guild
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
