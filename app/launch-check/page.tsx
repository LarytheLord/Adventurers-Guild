import type { Metadata } from 'next';
import Link from 'next/link';
import { InfoPageAside, InfoPageShell } from '@/components/public/info-page-shell';
import { LaunchCheckQuiz } from '@/components/launch-check/launch-check-quiz';
import { JsonLd } from '@/components/seo/json-ld';
import { buildPageMetadata, launchCheckJsonLd } from '@/lib/seo';
import { Button } from '@/components/ui/button';

const TITLE = 'Launch check for apps built with Lovable, Bolt, Replit, v0 or Cursor - Guild';
const DESCRIPTION =
  'Free 20-question self-check for founders of AI-built apps: payments, deployment, performance and cost, and security. See your gaps, a one-line fix for each, and a link to the matching checklist item. Runs in your browser; nothing is sent.';

export const metadata: Metadata = buildPageMetadata({
  path: '/launch-check',
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    'launch checklist AI-built app',
    'Lovable Bolt Replit production readiness',
    'Razorpay Stripe webhook check',
    'Supabase RLS check',
  ],
});

export default function LaunchCheckPage() {
  return (
    <InfoPageShell
      eyebrow="Free self-check"
      title="Is your AI-built app ready for real users and real money?"
      description="Twenty yes or no questions on payments, deployment, performance and cost, and security. You get a score for each area and a list of gaps, each with a one-line fix."
      aside={
        <InfoPageAside title="Not an audit">
          <p>
            This is a self-assessment. It is not an audit, and a clean result does not mean your app is
            secure. Guild is not a CERT-In empanelled auditor.
          </p>
          <p>
            <Link href="/checklist" className="font-semibold text-orange-700 underline underline-offset-4">
              Read the full checklist
            </Link>
          </p>
        </InfoPageAside>
      }
    >
      <JsonLd data={launchCheckJsonLd()} />
      <div className="space-y-12 text-slate-600">
        <section
          aria-labelledby="disclaimer"
          className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-5"
        >
          <h2 id="disclaimer" className="font-display text-lg font-bold text-slate-950">
            Read this first
          </h2>
          <p className="leading-7">
            This is a self-assessment for apps made with tools such as Lovable, Bolt, Replit, v0 or Cursor.
            It is not an audit. Your answers stay in your browser and are never sent to us. Only check apps
            you own. Guild is not a CERT-In empanelled auditor.
          </p>
        </section>

        <section aria-labelledby="quiz" className="space-y-4">
          <h2 id="quiz" className="font-display text-2xl font-bold tracking-[-0.03em] text-slate-950">
            Answer 20 questions
          </h2>
          <LaunchCheckQuiz />
        </section>

        <section aria-labelledby="get-started" className="space-y-4 rounded-2xl bg-orange-50 p-6">
          <h2 id="get-started" className="font-display text-2xl font-bold tracking-[-0.03em] text-slate-950">
            Want someone else to look?
          </h2>
          <p>
            A self-check only finds what you know to look for. We check your app by hand, write down each
            finding with a severity, and give you a fixed quote to fix what we found.
          </p>
          <Button asChild size="lg">
            <Link href="/audit">See how we check your app</Link>
          </Button>
        </section>
      </div>
    </InfoPageShell>
  );
}
