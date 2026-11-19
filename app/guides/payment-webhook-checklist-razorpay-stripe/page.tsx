import type { Metadata } from 'next';
import Link from 'next/link';
import { InfoPageAside, InfoPageShell } from '@/components/public/info-page-shell';
import { JsonLd } from '@/components/seo/json-ld';
import { Button } from '@/components/ui/button';
import {
  WEBHOOK_CONTEXT,
  WEBHOOK_CTA_HREF,
  WEBHOOK_CTA_TEXT,
  WEBHOOK_DESCRIPTION,
  WEBHOOK_EXAMPLES,
  WEBHOOK_EXAMPLES_NOTE,
  WEBHOOK_ITEMS,
  WEBHOOK_PATH,
  WEBHOOK_PUBLISHED,
  WEBHOOK_TITLE,
} from '@/lib/payment-webhook-checklist/content';
import { SITE_NAME, SITE_URL, absoluteUrl, buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  path: WEBHOOK_PATH,
  title: `${WEBHOOK_TITLE} - Guild`,
  description: WEBHOOK_DESCRIPTION,
  type: 'article',
  keywords: [
    'payment webhook checklist',
    'Razorpay webhook signature Next.js',
    'Stripe webhook signature Next.js',
    'webhook idempotency',
    'verify webhook raw body',
  ],
});

const linkClass = 'font-semibold text-orange-700 underline underline-offset-4';
const h2Class = 'font-display text-2xl font-bold tracking-[-0.03em] text-slate-950';

const pageUrl = absoluteUrl(WEBHOOK_PATH);
const org = { '@type': 'Organization', name: SITE_NAME, url: SITE_URL };
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: WEBHOOK_TITLE,
  description: WEBHOOK_DESCRIPTION,
  datePublished: WEBHOOK_PUBLISHED,
  dateModified: WEBHOOK_PUBLISHED,
  inLanguage: 'en-IN',
  mainEntityOfPage: pageUrl,
  url: pageUrl,
  author: org,
  publisher: org,
};

function DocLinks({ label, refs }: { label: string; refs: { label: string; url: string }[] }) {
  return (
    <p className="text-sm leading-6">
      <span className="font-semibold text-slate-900">{label}: </span>
      {refs.map((r, i) => (
        <span key={r.url + r.label}>
          {i > 0 ? ' | ' : ''}
          <a href={r.url} className={linkClass} target="_blank" rel="noopener noreferrer">
            {r.label}
          </a>
        </span>
      ))}
    </p>
  );
}

export default function PaymentWebhookChecklistPage() {
  return (
    <InfoPageShell
      eyebrow="Guide"
      title={WEBHOOK_TITLE}
      description="Six checks to run on your payment webhook before real money moves, with the official docs for each."
      updatedAt="19 November 2026"
      backHref="/guides"
      backLabel="All guides"
      aside={
        <InfoPageAside title="Before you start">
          <p>
            This checklist is unofficial and not an audit. Run every check on your own project, or on a client&apos;s
            with their permission, and always in test mode first.
          </p>
        </InfoPageAside>
      }
    >
      <JsonLd data={jsonLd} />
      <article className="space-y-12 text-slate-600">
        <section aria-labelledby="summary" className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h2 id="summary" className="font-display text-lg font-bold text-slate-950">
            Why a manual check
          </h2>
          <p className="leading-7">{WEBHOOK_CONTEXT}</p>
        </section>

        {WEBHOOK_ITEMS.map((item) => (
          <section key={item.id} aria-labelledby={item.id} className="space-y-3">
            <h2 id={item.id} className={h2Class}>
              {item.heading}
            </h2>
            <p className="leading-7">{item.check}</p>
            <DocLinks label="Stripe docs" refs={item.stripe} />
            <DocLinks label="Razorpay docs" refs={item.razorpay} />
          </section>
        ))}

        <section aria-labelledby="examples" className="space-y-4">
          <h2 id="examples" className={h2Class}>
            Route handler examples
          </h2>
          <p className="text-sm leading-6">{WEBHOOK_EXAMPLES_NOTE}</p>
          {WEBHOOK_EXAMPLES.map((e) => (
            <div key={e.provider} className="space-y-2">
              <h3 className="text-base font-semibold text-slate-900">
                {e.provider}: <code className="text-sm">{e.file}</code>
              </h3>
              <pre
                className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs leading-5 text-slate-100"
                tabIndex={0}
              >
                <code>{e.code}</code>
              </pre>
              <DocLinks label="Source" refs={[e.source]} />
            </div>
          ))}
        </section>

        <section aria-labelledby="second-look" className="space-y-4 rounded-2xl bg-orange-50 p-6">
          <h2 id="second-look" className={h2Class}>
            {WEBHOOK_CTA_TEXT}
          </h2>
          <p className="leading-7">
            Run the free launch check for database access rules, keys and backups, or read the{' '}
            <Link href="/checklist" className={linkClass}>
              launch checklist
            </Link>
            .
          </p>
          <Button asChild size="lg">
            <Link href={WEBHOOK_CTA_HREF}>Run the launch check</Link>
          </Button>
        </section>
      </article>
    </InfoPageShell>
  );
}
