'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Briefcase, User, Loader2, Sword, Building2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';
import { RankBadge } from '@/components/ui/rank-badge';

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
    const email = role === 'company' ? companyEmail : adventurerEmail;
    const password = role === 'company' ? companyPassword : adventurerPassword;
    const name = role === 'company' ? companyName : adventurerName;
    const normalizedCompanyName = role === 'company' ? companyName : '';

    if (!email || !password || !name) {
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
        // Extract specific Zod validation error if available
        if (data.details?.fieldErrors) {
          const firstErrors = Object.values(data.details.fieldErrors as Record<string, string[]>);
          const firstMsg = firstErrors[0]?.[0];
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

  async function onSubmit(event: React.FormEvent<HTMLFormElement>, role: 'adventurer' | 'company') {
    event.preventDefault();
    await onRegister(role);
  }

  const inputClass =
    'bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-orange-500/50 focus:ring-orange-500/20 h-11';

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
              Two paths await
            </p>
            <h2 className="text-3xl font-bold text-white mb-3">Choose your role in the Guild</h2>
            <p className="text-slate-400 leading-relaxed">
              Join as an adventurer and complete quests to level up. Or post quests as a company
              and hire verified developers.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <div className="w-9 h-9 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
                <Sword className="w-4 h-4 text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white mb-1">Adventurer Path</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Take on coding quests, earn XP and real money, climb from F-Rank to S-Rank.
                </p>
              </div>
              <RankBadge rank="F" size="sm" className="flex-shrink-0 mt-0.5" />
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <div className="w-9 h-9 rounded-lg bg-slate-700/40 border border-slate-600/40 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-4 h-4 text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white mb-1">Company Path</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Post development tasks, get ranked submissions, pay only for work that meets your standards.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-6">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 justify-center mb-2">
            <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-sm">AG</span>
            </div>
            <span className="text-white font-bold text-lg">Adventurers Guild</span>
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold text-white tracking-tight">Choose Your Path</h1>
            <p className="text-sm text-slate-400">Create your account and start your journey.</p>
          </div>

          <Tabs defaultValue="adventurer" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-5 bg-slate-900 border border-slate-800">
              <TabsTrigger
                value="adventurer"
                className="data-[state=active]:bg-orange-500 data-[state=active]:text-black text-slate-400 font-medium"
              >
                <Sword className="w-3.5 h-3.5 mr-1.5" />
                Adventurer
              </TabsTrigger>
              <TabsTrigger
                value="company"
                className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400 font-medium"
              >
                <Briefcase className="w-3.5 h-3.5 mr-1.5" />
                Company
              </TabsTrigger>
            </TabsList>

            <TabsContent value="adventurer">
              <div className="mb-4 p-3 rounded-lg bg-orange-500/5 border border-orange-500/15">
                <p className="text-xs text-orange-400/80">
                  <span className="font-semibold">Adventurer</span> — Complete quests to earn XP and real money. Start at F-Rank.
                </p>
              </div>
              <form
                onSubmit={(e) => onSubmit(e, 'adventurer')}
                method="post"
                className="space-y-4"
                data-auth-ready={isHydrated ? 'true' : 'false'}
              >
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-300 text-sm font-medium">Full Name</Label>
                  <Input id="name" name="name" placeholder="John Doe" type="text" autoCorrect="off" value={adventurerName} onChange={(event) => setAdventurerName(event.target.value)} disabled={!isHydrated || isLoading} required className={inputClass} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-300 text-sm font-medium">Email</Label>
                  <Input id="email" name="email" placeholder="name@example.com" type="email" autoCapitalize="none" autoCorrect="off" autoComplete="email" value={adventurerEmail} onChange={(event) => setAdventurerEmail(event.target.value)} disabled={!isHydrated || isLoading} required className={inputClass} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-300 text-sm font-medium">Password</Label>
                  <Input id="password" name="password" type="password" minLength={8} placeholder="Min. 8 characters" autoComplete="new-password" value={adventurerPassword} onChange={(event) => setAdventurerPassword(event.target.value)} disabled={!isHydrated || isLoading} required className={inputClass} />
                </div>
                <Button type="button" className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-black font-semibold rounded-lg shadow-lg shadow-orange-500/20 transition-all mt-1" disabled={!isHydrated || isLoading} onClick={() => { void onRegister('adventurer'); }}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {!isLoading && <User className="mr-2 h-4 w-4" />}
                  Join as Adventurer
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="company">
              <div className="mb-4 p-3 rounded-lg bg-slate-800/60 border border-slate-700/50">
                <p className="text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Company</span> — Post coding quests and hire verified developers.
                </p>
              </div>
              <form
                onSubmit={(e) => onSubmit(e, 'company')}
                method="post"
                className="space-y-4"
                data-auth-ready={isHydrated ? 'true' : 'false'}
              >
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-slate-300 text-sm font-medium">Company Name</Label>
                  <Input id="company" name="company" placeholder="Acme Inc." type="text" value={companyName} onChange={(event) => setCompanyName(event.target.value)} disabled={!isHydrated || isLoading} required className={inputClass} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="work-email" className="text-slate-300 text-sm font-medium">Work Email</Label>
                  <Input id="work-email" name="work-email" placeholder="name@company.com" type="email" autoComplete="email" value={companyEmail} onChange={(event) => setCompanyEmail(event.target.value)} disabled={!isHydrated || isLoading} required className={inputClass} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-password" className="text-slate-300 text-sm font-medium">Password</Label>
                  <Input id="client-password" name="client-password" type="password" minLength={8} placeholder="Min. 8 characters" autoComplete="new-password" value={companyPassword} onChange={(event) => setCompanyPassword(event.target.value)} disabled={!isHydrated || isLoading} required className={inputClass} />
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
            <Link href="/terms" className="text-slate-500 hover:text-orange-400 underline underline-offset-4 transition-colors">
              Terms
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-slate-500 hover:text-orange-400 underline underline-offset-4 transition-colors">
              Privacy Policy
            </Link>
            .
          </p>
          <p className="text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="text-orange-400 hover:text-orange-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
