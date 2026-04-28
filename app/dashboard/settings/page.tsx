import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { ArrowLeft, UserCircle2, Wallet } from 'lucide-react';
import PayoutSetupCard from '@/components/dashboard/payout-setup-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authOptions } from '@/lib/auth';
import { prisma, withDbRetry } from '@/lib/db';
import { isStripeConfigured } from '@/lib/stripe';

interface SettingsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.role === 'company') {
    redirect('/dashboard/company/profile');
  }

  if (session.user.role === 'admin') {
    redirect('/admin');
  }

  const params = await searchParams;
  const stripeStatus = typeof params.stripe === 'string' ? params.stripe : undefined;
  const profile = await withDbRetry(() =>
    prisma.adventurerProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        stripeAccountId: true,
        stripeOnboardingDone: true,
      },
    })
  );

  return (
    <div className="container mx-auto max-w-4xl space-y-6 py-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your payout setup and jump back to your adventurer profile details.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <PayoutSetupCard
        stripeConfigured={isStripeConfigured()}
        stripeAccountId={profile?.stripeAccountId ?? null}
        stripeOnboardingDone={profile?.stripeOnboardingDone ?? false}
        flashStatus={stripeStatus}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <UserCircle2 className="h-5 w-5 text-sky-600" />
            Profile Details
          </CardTitle>
          <CardDescription>
            Personal info and progression stats still live on your profile page.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3 text-sm text-muted-foreground">
            <Wallet className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <p>
              Use this settings page for payout onboarding, then head to your profile for account edits,
              XP snapshots, and rank progress.
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/profile">Open profile</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
