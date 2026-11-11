import type { Metadata } from 'next';
import Link from 'next/link';
import { InfoPageAside, InfoPageShell } from '@/components/public/info-page-shell';
import { buildPageMetadata } from '@/lib/seo';
import { Button } from '@/components/ui/button';
import {
  AUDIT_AREAS,
  AUDIT_HONEST_NOTE,
  AUDIT_MAILTO,
  AUDIT_PACKAGES,
  AUDIT_PRICE_NOTE,
  AUDIT_TOOLS,
  AUDIT_STEPS,
} from '@/lib/audit-offer/content';
import { SAMPLE_REPORT_PATH } from '@/lib/audit-offer/sample-report';

const TITLE = 'Launch Check for apps built with Lovable, Bolt, Replit, v0 or Cursor - Guild';
const DESCRIPTION =
  'We check, fix and ship your AI-built app: payments, deployment and domains, performance and cost, and security and data access. For apps made with Lovable, Bolt, Replit, v0 or Cursor. Guild is not a CERT-In empanelled auditor.';

export const metadata: Metadata = buildPageMetadata({ path: '/audit', title: TITLE, description: DESCRIPTION });

export default function AuditPage() {
  return (
    <InfoPageShell
      eyebrow="Launch Check"
      title="Built your app with an AI tool? We check it, fix it and help you ship it."
      description={`For apps built with ${AUDIT_TOOLS}. We check four areas by hand: payments, deployment, performance and security. Then we fix what we find.`}
      aside={
        <InfoPageAside title="Free checklist">
          <p>Want to look yourself first? Our free launch checklist covers the basics.</p>
          <p>
            <Link href="/checklist" className="font-semibold text-orange-600 underline underline-offset-4">
              Read the checklist
            </Link>
          </p>
        </InfoPageAside>
      }
    >
      <div className="space-y-12 text-slate-600">
        <section aria-labelledby="what-we-check" className="space-y-4">
          <h2 id="what-we-check" className="font-display text-2xl font-bold tracking-[-0.03em] text-slate-950">
            Four areas, checked equally
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {AUDIT_AREAS.map((area) => (
              <div key={area.id} data-area={area.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="text-lg font-semibold text-slate-900">{area.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{area.summary}</p>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6">
                  {area.checks.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="packages" className="space-y-4">
          <h2 id="packages" className="font-display text-2xl font-bold tracking-[-0.03em] text-slate-950">
            Three packages
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {AUDIT_PACKAGES.map((p) => (
              <div key={p.name} className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="text-lg font-semibold text-slate-900">{p.name}</h3>
                <p className="mt-1 text-2xl font-bold text-slate-950">{p.price}</p>
                <p className="text-sm text-slate-500">{p.time}</p>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6">
                  {p.points.map((pt) => (
                    <li key={pt}>{pt}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="text-sm leading-6">{AUDIT_PRICE_NOTE}</p>
        </section>

        <section aria-labelledby="how-it-works" className="space-y-4">
          <h2 id="how-it-works" className="font-display text-2xl font-bold tracking-[-0.03em] text-slate-950">
            How it works
          </h2>
          <ol className="list-decimal space-y-2 pl-6 leading-7">
            {AUDIT_STEPS.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          <p className="leading-7">
            Want to see the result first?{' '}
            <Link href={SAMPLE_REPORT_PATH} className="font-semibold text-orange-600 underline underline-offset-4">
              Read a sample report on a fictional app
            </Link>
            .
          </p>
        </section>

        <section aria-labelledby="honest-note" className="space-y-2">
          <h2 id="honest-note" className="font-display text-2xl font-bold tracking-[-0.03em] text-slate-950">
            An honest note
          </h2>
          <p className="leading-8">{AUDIT_HONEST_NOTE}</p>
        </section>

        <section aria-labelledby="get-started" className="space-y-4 rounded-2xl bg-orange-50 p-6">
          <h2 id="get-started" className="font-display text-2xl font-bold tracking-[-0.03em] text-slate-950">
            Ask for a Launch Check
          </h2>
          <p>Email us your app link, the stack, and what the app does.</p>
          <div className="flex flex-wrap items-center gap-4">
            <Button asChild size="lg">
              <a href={AUDIT_MAILTO}>Request a Launch Check</a>
            </Button>
            <Link href="/checklist" className="font-semibold text-orange-600 underline underline-offset-4">
              Or read the free checklist first
            </Link>
          </div>
        </section>
      </div>
    </InfoPageShell>
  );
}
