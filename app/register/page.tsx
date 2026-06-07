'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowRight, Building2, Loader2, Sword } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const steps = [
  { num: '01', title: 'Create your account', sub: 'Free · Under 60 seconds' },
  { num: '02', title: 'Pick your first quest', sub: 'F-rank quests unlock immediately' },
  { num: '03', title: 'Ship the work', sub: 'Submit → get feedback → get paid' },
];

export default function RegisterPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  const [aName, setAName] = useState('');
  const [aUsername, setAUsername] = useState('');
  const [aEmail, setAEmail] = useState('');
  const [aPassword, setAPassword] = useState('');

  const [cName, setCName] = useState('');
  const [cEmail, setCEmail] = useState('');
  const [cPassword, setCPassword] = useState('');

  useEffect(() => { setIsHydrated(true); }, []);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  async function register(role: 'adventurer' | 'company') {
    const email = role === 'company' ? cEmail : aEmail;
    const password = role === 'company' ? cPassword : aPassword;
    const name = role === 'company' ? cName : aName;

    if (!email || !password || !name) return;
    if (role === 'adventurer' && !aUsername) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          name,
          role,
          companyName: role === 'company' ? cName : '',
          username: role === 'adventurer' ? aUsername : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.details?.fieldErrors) {
          const firstMsg = Object.values(data.details.fieldErrors as Record<string, string[]>)[0]?.[0];
          if (firstMsg) throw new Error(firstMsg);
        }
        throw new Error(data.error || data.message || 'Registration failed');
      }

      toast.success('Account created! Logging you in...');
      await signIn('credentials', { email, password, callbackUrl: '/dashboard' });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed');
      setIsLoading(false);
    }
  }

  const inputClass =
    'h-10 border-white/10 bg-white/5 text-[13px] text-white placeholder:text-white/20 focus:border-orange-500/40 focus:ring-orange-500/10 rounded-md';

  const labelClass = 'text-[12px] font-medium text-white/60 uppercase tracking-[0.08em]';

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
              Get started
            </p>
            <h2 className="mt-5 text-[36px] font-bold leading-[1.1] tracking-[-0.025em] text-white md:text-[42px]">
              Your quest<br />starts here.
            </h2>
            <p className="mt-5 text-[14px] leading-[1.65] text-white/50">
              No resume. No portfolio. No gatekeepers. Pick a task, ship it, get paid. Rank up as your work speaks for itself.
            </p>
          </div>

          <ol className="space-y-0 divide-y divide-white/8 border-y border-white/8">
            {steps.map((step) => (
              <li key={step.num} className="grid grid-cols-[56px_1fr] gap-4 py-5">
                <span className="text-[32px] font-bold leading-none tracking-[-0.03em] tabular-nums text-orange-400">
                  {step.num}
                </span>
                <div className="flex flex-col justify-center">
                  <p className="text-[15px] font-semibold leading-tight tracking-[-0.01em] text-white">
                    {step.title}
                  </p>
                  <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.08em] text-white/30">
                    {step.sub}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <p className="text-[11px] text-white/20">
          Free to join · Open source · Backed by Open Paws
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 sm:px-8">
        <div className="w-full max-w-[380px] space-y-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-orange-500">
              <span className="text-[11px] font-bold text-slate-950">AG</span>
            </div>
            <span className="text-[14px] font-semibold text-white">Adventurers Guild</span>
          </div>

          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-orange-400/70 mb-4">
              Choose your path
            </p>
            <h1 className="text-[28px] font-bold leading-[1.1] tracking-[-0.025em] text-white">
              Join the Guild.
            </h1>
            <p className="mt-3 text-[14px] leading-[1.6] text-white/50">
              Create your free account and start your first quest today.
            </p>
          </div>

          <Tabs defaultValue="adventurer" className="w-full">
            <TabsList className="mb-6 grid w-full grid-cols-2 border border-white/10 bg-white/5 rounded-lg h-9">
              <TabsTrigger
                value="adventurer"
                className="rounded-md text-[12px] font-medium text-white/40 data-[state=active]:bg-orange-500 data-[state=active]:text-slate-950 data-[state=active]:font-semibold"
              >
                <Sword className="mr-1.5 h-3 w-3" />
                Adventurer
              </TabsTrigger>
              <TabsTrigger
                value="company"
                className="rounded-md text-[12px] font-medium text-white/40 data-[state=active]:bg-white/10 data-[state=active]:text-white"
              >
                <Building2 className="mr-1.5 h-3 w-3" />
                Company
              </TabsTrigger>
            </TabsList>

            {/* Adventurer tab */}
            <TabsContent value="adventurer">
              <div className="mb-5 rounded-lg border border-orange-500/15 bg-orange-500/5 px-4 py-3">
                <p className="text-[12px] leading-[1.5] text-orange-400/80">
                  Complete quests, earn XP and real money. Start at F-Rank — no experience required.
                </p>
              </div>
              <form
                onSubmit={(e) => { e.preventDefault(); void register('adventurer'); }}
                className="space-y-4"
                data-auth-ready={isHydrated ? 'true' : 'false'}
              >
                <div className="space-y-1.5">
                  <Label htmlFor="a-name" className={labelClass}>Full Name</Label>
                  <Input id="a-name" type="text" placeholder="John Doe" autoCorrect="off" value={aName} onChange={(e) => setAName(e.target.value)} disabled={!isHydrated || isLoading} required className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="a-username" className={labelClass}>Username</Label>
                  <Input id="a-username" type="text" placeholder="yourhandle" autoCorrect="off" value={aUsername} onChange={(e) => setAUsername(e.target.value)} disabled={!isHydrated || isLoading} required className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="a-email" className={labelClass}>Email</Label>
                  <Input id="a-email" type="email" placeholder="you@example.com" autoCapitalize="none" autoCorrect="off" autoComplete="email" value={aEmail} onChange={(e) => setAEmail(e.target.value)} disabled={!isHydrated || isLoading} required className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="a-password" className={labelClass}>Password</Label>
                  <Input id="a-password" type="password" minLength={8} placeholder="Min. 8 characters" autoComplete="new-password" value={aPassword} onChange={(e) => setAPassword(e.target.value)} disabled={!isHydrated || isLoading} required className={inputClass} />
                </div>
                <button
                  type="submit"
                  disabled={!isHydrated || isLoading}
                  className="mt-1 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-orange-500 px-4 text-[13px] font-semibold text-slate-950 transition-colors hover:bg-orange-400 disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Create Adventurer account
                      <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
                    </>
                  )}
                </button>
              </form>
            </TabsContent>

            {/* Company tab */}
            <TabsContent value="company">
              <div className="mb-5 rounded-lg border border-white/8 bg-white/3 px-4 py-3">
                <p className="text-[12px] leading-[1.5] text-white/50">
                  Post quests and hire verified developers. Pay only on approved submissions.
                </p>
              </div>
              <form
                onSubmit={(e) => { e.preventDefault(); void register('company'); }}
                className="space-y-4"
                data-auth-ready={isHydrated ? 'true' : 'false'}
              >
                <div className="space-y-1.5">
                  <Label htmlFor="c-name" className={labelClass}>Company Name</Label>
                  <Input id="c-name" type="text" placeholder="Acme Inc." value={cName} onChange={(e) => setCName(e.target.value)} disabled={!isHydrated || isLoading} required className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="c-email" className={labelClass}>Work Email</Label>
                  <Input id="c-email" type="email" placeholder="you@company.com" autoComplete="email" value={cEmail} onChange={(e) => setCEmail(e.target.value)} disabled={!isHydrated || isLoading} required className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="c-password" className={labelClass}>Password</Label>
                  <Input id="c-password" type="password" minLength={8} placeholder="Min. 8 characters" autoComplete="new-password" value={cPassword} onChange={(e) => setCPassword(e.target.value)} disabled={!isHydrated || isLoading} required className={inputClass} />
                </div>
                <button
                  type="submit"
                  disabled={!isHydrated || isLoading}
                  className="mt-1 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-white/15 bg-white/5 px-4 text-[13px] font-semibold text-white transition-colors hover:bg-white/10 hover:border-white/25 disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Create Company account
                      <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
                    </>
                  )}
                </button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="border-t border-white/8 pt-6 space-y-3 text-center">
            <p className="text-[13px] text-white/35">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-orange-400 hover:text-orange-300 transition-colors">
                Sign in
              </Link>
            </p>
            <p className="text-[11px] text-white/20">
              By signing up you agree to our{' '}
              <Link href="/terms" className="hover:text-white/40 transition-colors underline underline-offset-2">Terms</Link>
              {' '}and{' '}
              <Link href="/privacy" className="hover:text-white/40 transition-colors underline underline-offset-2">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
