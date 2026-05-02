'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';
import { Briefcase, Building2, Loader2, Sword, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RankBadge } from '@/components/ui/rank-badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [adventurerName, setAdventurerName] = useState('');
  const [adventurerEmail, setAdventurerEmail] = useState('');
  const [adventurerPassword, setAdventurerPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyPassword, setCompanyPassword] = useState('');

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  async function onRegister(role: 'adventurer' | 'company') {
    const email = (role === 'company' ? companyEmail : adventurerEmail).trim().toLowerCase();
    const password = role === 'company' ? companyPassword : adventurerPassword;
    const name = (role === 'company' ? companyName : adventurerName).trim();
    const normalizedCompanyName = role === 'company' ? companyName.trim() : '';

    if (!email || !password || !name) {
      toast.error('Please complete all required fields');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    if (name.length > 120 || normalizedCompanyName.length > 120) {
      toast.error('Names must be 120 characters or fewer');
      return;
    }

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
          companyName: normalizedCompanyName,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.details?.fieldErrors) {
          const firstErrors = Object.values(data.details.fieldErrors as Record<string, string[]>);
          const firstMsg = firstErrors[0]?.[0];
          if (firstMsg) {
            throw new Error(firstMsg);
          }
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

  async function onSubmit(event: React.FormEvent<HTMLFormElement>, role: 'adventurer' | 'company') {
    event.preventDefault();
    await onRegister(role);
  }

  const inputClass =
    'h-11 border-slate-700 bg-slate-900 text-white placeholder:text-slate-500 focus:border-orange-500/50 focus:ring-orange-500/20';

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 lg:flex-row">
      <div className="hidden border-r border-slate-800 bg-slate-900 p-12 lg:flex lg:w-1/2 lg:flex-col lg:justify-between">
        <Link href="/home" className="group flex w-fit items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500 shadow-lg shadow-orange-500/20 transition-colors group-hover:bg-orange-600">
            <span className="text-sm font-bold text-black">AG</span>
          </div>
          <span className="text-lg font-bold text-white">Adventurers Guild</span>
        </Link>

        <div className="space-y-8">
          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-orange-400/60">
              Two paths await
            </p>
            <h2 className="mb-3 text-3xl font-bold text-white">Choose your role in the Guild</h2>
            <p className="leading-relaxed text-slate-400">
              Join as an adventurer and complete quests to level up. Or post quests as a company
              and hire verified developers.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4 rounded-xl border border-slate-700/50 bg-slate-800/60 p-4">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-orange-500/20 bg-orange-500/10">
                <Sword className="h-4 w-4 text-orange-400" />
              </div>
              <div>
                <p className="mb-1 text-sm font-semibold text-white">Adventurer Path</p>
                <p className="text-xs leading-relaxed text-slate-400">
                  Take on coding quests, earn XP and real money, and climb from F-Rank to S-Rank.
                </p>
              </div>
              <RankBadge rank="F" size="sm" className="mt-0.5 flex-shrink-0" />
            </div>

            <div className="flex items-start gap-4 rounded-xl border border-slate-700/50 bg-slate-800/60 p-4">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-slate-600/40 bg-slate-700/40">
                <Building2 className="h-4 w-4 text-slate-400" />
              </div>
              <div>
                <p className="mb-1 text-sm font-semibold text-white">Company Path</p>
                <p className="text-xs leading-relaxed text-slate-400">
                  Post development tasks, get ranked submissions, and pay only for work that meets
                  your standards.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="flex flex-1 items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-sm space-y-6">
          <div className="mb-2 flex items-center justify-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500">
              <span className="text-sm font-bold text-black">AG</span>
            </div>
            <span className="text-lg font-bold text-white">Adventurers Guild</span>
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">Choose Your Path</h1>
            <p className="text-sm text-slate-400">Create your account and start your journey.</p>
          </div>

          <Tabs defaultValue="adventurer" className="w-full">
            <TabsList className="mb-5 grid w-full grid-cols-2 border border-slate-800 bg-slate-900">
              <TabsTrigger
                value="adventurer"
                className="font-medium text-slate-400 data-[state=active]:bg-orange-500 data-[state=active]:text-black"
              >
                <Sword className="mr-1.5 h-3.5 w-3.5" />
                Adventurer
              </TabsTrigger>
              <TabsTrigger
                value="company"
                className="font-medium text-slate-400 data-[state=active]:bg-slate-700 data-[state=active]:text-white"
              >
                <Briefcase className="mr-1.5 h-3.5 w-3.5" />
                Company
              </TabsTrigger>
            </TabsList>

            <TabsContent value="adventurer">
              <div className="mb-4 rounded-lg border border-orange-500/15 bg-orange-500/5 p-3">
                <p className="text-xs text-orange-400/80">
                  <span className="font-semibold">Adventurer</span> - Complete quests to earn XP
                  and real money. Start at F-Rank.
                </p>
              </div>
              <form
                onSubmit={(e) => onSubmit(e, 'adventurer')}
                method="post"
                className="space-y-4"
                data-auth-ready={isHydrated ? 'true' : 'false'}
              >
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-slate-300">Full Name</Label>
                  <Input id="name" name="name" placeholder="John Doe" type="text" autoCorrect="off" value={adventurerName} onChange={(event) => setAdventurerName(event.target.value)} disabled={!isHydrated || isLoading} required maxLength={100} className={inputClass} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-slate-300">Email</Label>
                  <Input id="email" name="email" placeholder="name@example.com" type="email" autoCapitalize="none" autoCorrect="off" autoComplete="email" value={adventurerEmail} onChange={(event) => setAdventurerEmail(event.target.value)} disabled={!isHydrated || isLoading} required maxLength={254} className={inputClass} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-slate-300">Password</Label>
                  <Input id="password" name="password" type="password" minLength={8} placeholder="Min. 8 characters" autoComplete="new-password" value={adventurerPassword} onChange={(event) => setAdventurerPassword(event.target.value)} disabled={!isHydrated || isLoading} required maxLength={128} className={inputClass} />
                </div>
                <Button type="button" className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-black font-semibold rounded-lg shadow-lg shadow-orange-500/20 transition-all mt-1" disabled={!isHydrated || isLoading} onClick={() => { void onRegister('adventurer'); }}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {!isLoading && <User className="mr-2 h-4 w-4" />}
                  Join as Adventurer
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="company">
              <div className="mb-4 rounded-lg border border-slate-700/50 bg-slate-800/60 p-3">
                <p className="text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Company</span> - Post coding
                  quests and hire verified developers.
                </p>
              </div>
              <form
                onSubmit={(e) => onSubmit(e, 'company')}
                method="post"
                className="space-y-4"
                data-auth-ready={isHydrated ? 'true' : 'false'}
              >
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-sm font-medium text-slate-300">Company Name</Label>
                  <Input id="company" name="company" placeholder="Acme Inc." type="text" value={companyName} onChange={(event) => setCompanyName(event.target.value)} disabled={!isHydrated || isLoading} required maxLength={120} className={inputClass} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="work-email" className="text-sm font-medium text-slate-300">Work Email</Label>
                  <Input id="work-email" name="work-email" placeholder="name@company.com" type="email" autoComplete="email" value={companyEmail} onChange={(event) => setCompanyEmail(event.target.value)} disabled={!isHydrated || isLoading} required maxLength={254} className={inputClass} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-password" className="text-sm font-medium text-slate-300">Password</Label>
                  <Input id="client-password" name="client-password" type="password" minLength={8} placeholder="Min. 8 characters" autoComplete="new-password" value={companyPassword} onChange={(event) => setCompanyPassword(event.target.value)} disabled={!isHydrated || isLoading} required maxLength={128} className={inputClass} />
                </div>
                <Button type="button" className="w-full h-11 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors mt-1" disabled={!isHydrated || isLoading} onClick={() => { void onRegister('company'); }}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {!isLoading && <Building2 className="mr-2 h-4 w-4" />}
                  Create Company Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="text-center text-xs text-slate-600">
            By signing up you agree to our{' '}
            <Link
              href="/terms"
              className="text-slate-500 underline underline-offset-4 transition-colors hover:text-orange-400"
            >
              Terms
            </Link>{' '}
            and{' '}
            <Link
              href="/privacy"
              className="text-slate-500 underline underline-offset-4 transition-colors hover:text-orange-400"
            >
              Privacy Policy
            </Link>
            .
          </p>
          <p className="text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-orange-400 transition-colors hover:text-orange-300">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
