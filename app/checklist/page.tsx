import type { Metadata } from 'next';
import Link from 'next/link';
import { InfoPageShell } from '@/components/public/info-page-shell';
import { Button } from '@/components/ui/button';
import { CHECKLIST_GROUPS } from '@/lib/audit-offer/content';

const TITLE = 'The AI-built app launch checklist - Guild';
const DESCRIPTION =
  'A free checklist of about 25 things to check before you launch an app built with Lovable, Bolt or Replit: database access, keys, login, payments, backups, email, privacy and cost.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/checklist' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/checklist',
    siteName: 'Guild',
    type: 'article',
  },
  twitter: { card: 'summary', title: TITLE, description: DESCRIPTION },
};

export default function ChecklistPage() {
  return (
    <InfoPageShell
      eyebrow="Free checklist"
      title="The AI-built app launch checklist"
      description="Things to check before real users put real data into your app. Each item says what to check and why it matters. Only check apps you own."
    >
      <div className="space-y-10">
        {CHECKLIST_GROUPS.map((group) => (
          <section key={group.id} aria-labelledby={`g-${group.id}`} className="space-y-4">
            <h2 id={`g-${group.id}`} className="font-display text-2xl font-bold tracking-[-0.03em] text-slate-950">
              {group.title}
            </h2>
            <ul className="space-y-4">
              {group.items.map((item) => (
                <li key={item.check} className="rounded-2xl border border-slate-200 bg-white p-4 leading-7">
                  <p className="font-semibold text-slate-900">{item.check}</p>
                  <p className="mt-1 text-slate-600">Why it matters: {item.why}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section aria-labelledby="want-help" className="space-y-4 rounded-2xl bg-orange-50 p-6">
          <h2 id="want-help" className="font-display text-2xl font-bold tracking-[-0.03em] text-slate-950">
            Want us to check all 114?
          </h2>
          <p className="text-slate-600">
            This list is a short version. Our Production Check goes through 114 items by hand and gives you a report with a fixed quote.
          </p>
          <Button asChild size="lg">
            <Link href="/audit">See the Production Check</Link>
          </Button>
        </section>
      </div>
    </InfoPageShell>
  );
}
