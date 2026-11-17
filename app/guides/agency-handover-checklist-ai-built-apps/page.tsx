import type { Metadata } from 'next';
import Link from 'next/link';
import { Fragment } from 'react';
import { InfoPageAside, InfoPageShell } from '@/components/public/info-page-shell';
import { JsonLd } from '@/components/seo/json-ld';
import { Button } from '@/components/ui/button';
import {
  HANDOVER_CTA_HREF,
  HANDOVER_CTA_TEXT,
  HANDOVER_DESCRIPTION,
  HANDOVER_DISCLAIMER,
  HANDOVER_MARKDOWN_PATH,
  HANDOVER_PATH,
  HANDOVER_PUBLISHED,
  HANDOVER_SECTIONS,
  HANDOVER_TITLE,
} from '@/lib/agency-handover/content';
import { SITE_NAME, SITE_URL, absoluteUrl, buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  path: HANDOVER_PATH,
  title: `${HANDOVER_TITLE} - Guild`,
  description: HANDOVER_DESCRIPTION,
  type: 'article',
  keywords: ['app handover checklist', 'Lovable handover', 'Bolt app handover', 'Supabase RLS checklist'],
});

const linkClass = 'font-semibold text-orange-700 underline underline-offset-4';
const h2Class = 'font-display text-2xl font-bold tracking-[-0.03em] text-slate-950';

function RichText({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(
      <Link key={i++} href={m[2]} className={linkClass}>
        {m[1]}
      </Link>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return (
    <>
      {parts.map((p, idx) => (
        <Fragment key={idx}>{p}</Fragment>
      ))}
    </>
  );
}

const pageUrl = absoluteUrl(HANDOVER_PATH);
const org = { '@type': 'Organization', name: SITE_NAME, url: SITE_URL };
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: HANDOVER_TITLE,
  description: HANDOVER_DESCRIPTION,
  datePublished: HANDOVER_PUBLISHED,
  dateModified: HANDOVER_PUBLISHED,
  inLanguage: 'en-IN',
  mainEntityOfPage: pageUrl,
  url: pageUrl,
  author: org,
  publisher: org,
};

export default function AgencyHandoverChecklistPage() {
  return (
    <InfoPageShell
      eyebrow="Guide"
      title={HANDOVER_TITLE}
      description="For agencies and freelancers handing over an app to a client. One line for what must be true, one line for how to check it."
      updatedAt="17 November 2026"
      backHref="/guides"
      backLabel="All guides"
      aside={
        <InfoPageAside title="Take it with you">
          <p>{HANDOVER_DISCLAIMER}</p>
          <p>
            <a href={HANDOVER_MARKDOWN_PATH} download className={linkClass}>
              Download the checklist (Markdown)
            </a>
          </p>
        </InfoPageAside>
      }
    >
      <JsonLd data={jsonLd} />
      <article className="space-y-12 text-slate-600">
        {HANDOVER_SECTIONS.map((s) => (
          <section key={s.id} aria-labelledby={s.id} className="space-y-4">
            <h2 id={s.id} className={h2Class}>
              {s.heading}
            </h2>
            <p className="leading-7">
              <RichText text={s.intro} />
            </p>
            <ul className="space-y-3">
              {s.items.map((it) => (
                <li key={it.item} className="rounded-2xl border border-slate-200 bg-white p-4 leading-7">
                  <p className="font-semibold text-slate-900">
                    <RichText text={it.item} />
                  </p>
                  <p className="mt-1 text-sm">
                    <span className="font-semibold text-slate-700">How to check: </span>
                    <RichText text={it.check} />
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section aria-labelledby="second-look" className="space-y-4 rounded-2xl bg-orange-50 p-6">
          <h2 id="second-look" className={h2Class}>
            {HANDOVER_CTA_TEXT}
          </h2>
          <p className="leading-7">
            Run the free self-check, or ask us to look at the app before you hand it over.
          </p>
          <Button asChild size="lg">
            <Link href={HANDOVER_CTA_HREF}>Run the launch check</Link>
          </Button>
        </section>
      </article>
    </InfoPageShell>
  );
}
