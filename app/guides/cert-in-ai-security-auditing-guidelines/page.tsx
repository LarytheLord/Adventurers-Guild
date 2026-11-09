import type { Metadata } from 'next';
import Link from 'next/link';
import { Fragment } from 'react';
import { InfoPageAside, InfoPageShell } from '@/components/public/info-page-shell';
import { Button } from '@/components/ui/button';
import {
  CERTIN_PDF_URL,
  EXPLAINER_DESCRIPTION,
  EXPLAINER_DISCLAIMER,
  EXPLAINER_FAQ,
  EXPLAINER_MAILTO,
  EXPLAINER_PATH,
  EXPLAINER_PUBLISHED,
  EXPLAINER_SECTIONS,
  EXPLAINER_SUMMARY,
  EXPLAINER_TITLE,
  stripLinks,
  type Block,
} from '@/lib/cert-in-explainer/content';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://guilds.work';
const PAGE_URL = `${SITE_URL}${EXPLAINER_PATH}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `${EXPLAINER_TITLE} - Guild`,
  description: EXPLAINER_DESCRIPTION,
  keywords: [
    'CERT-In AI Security Auditing Guidelines',
    'CERT-In AI audit',
    'AI security audit India',
    'AI risk tier',
    'AI audit readiness India',
  ],
  alternates: { canonical: EXPLAINER_PATH },
  openGraph: {
    title: EXPLAINER_TITLE,
    description: EXPLAINER_DESCRIPTION,
    url: EXPLAINER_PATH,
    siteName: 'Guild',
    type: 'article',
    publishedTime: EXPLAINER_PUBLISHED,
  },
  twitter: { card: 'summary', title: EXPLAINER_TITLE, description: EXPLAINER_DESCRIPTION },
};

const linkClass = 'font-semibold text-orange-700 underline underline-offset-4';

function RichText({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const [, label, href] = m;
    parts.push(
      href.startsWith('/') ? (
        <Link key={i++} href={href} className={linkClass}>
          {label}
        </Link>
      ) : (
        <a key={i++} href={href} className={linkClass} target="_blank" rel="noopener noreferrer">
          {label}
        </a>
      ),
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

function BlockView({ block }: { block: Block }) {
  switch (block.kind) {
    case 'p':
      return (
        <p className="leading-7">
          <RichText text={block.text} />
        </p>
      );
    case 'ul':
      return (
        <ul className="list-disc space-y-2 pl-6 leading-7">
          {block.items.map((it) => (
            <li key={it}>
              <RichText text={it} />
            </li>
          ))}
        </ul>
      );
    case 'quote':
      return (
        <blockquote className="border-l-4 border-orange-300 pl-4 italic leading-7 text-slate-700">
          &quot;{block.text}&quot; <span className="not-italic text-slate-500">({block.cite})</span>
        </blockquote>
      );
    case 'table':
      return (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-900">
              <tr>
                {block.head.map((h) => (
                  <th key={h} scope="col" className="px-4 py-3 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row) => (
                <tr key={row[0]} className="border-t border-slate-200 align-top">
                  {row.map((c, ci) => (
                    <td key={ci} className="px-4 py-3 leading-6">
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: EXPLAINER_TITLE,
    description: EXPLAINER_DESCRIPTION,
    datePublished: EXPLAINER_PUBLISHED,
    dateModified: EXPLAINER_PUBLISHED,
    inLanguage: 'en-IN',
    mainEntityOfPage: PAGE_URL,
    url: PAGE_URL,
    author: { '@type': 'Organization', name: 'Guild', url: SITE_URL },
    publisher: { '@type': 'Organization', name: 'Guild', url: SITE_URL },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: EXPLAINER_FAQ.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: stripLinks(f.a) },
    })),
  },
];

const h2Class = 'font-display text-2xl font-bold tracking-[-0.03em] text-slate-950';

export default function CertInExplainerPage() {
  return (
    <InfoPageShell
      eyebrow="Guide"
      title={EXPLAINER_TITLE}
      description="What the new CERT-In guideline says, who it covers, and what to prepare, with the section number for every claim."
      updatedAt="9 November 2026"
      aside={
        <InfoPageAside title="Unofficial guide">
          <p>{EXPLAINER_DISCLAIMER}</p>
          <p>
            <a href={CERTIN_PDF_URL} className={linkClass} target="_blank" rel="noopener noreferrer">
              Read the official CERT-In PDF
            </a>
          </p>
          <p>
            <Link href="/ai-risk-tier" className={linkClass}>
              Free risk tier calculator
            </Link>
          </p>
        </InfoPageAside>
      }
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="space-y-12 text-slate-600">
        <section aria-labelledby="summary" className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h2 id="summary" className="font-display text-lg font-bold text-slate-950">
            The short version
          </h2>
          <ul className="list-disc space-y-2 pl-6 leading-7">
            {EXPLAINER_SUMMARY.map((t) => (
              <li key={t}>
                <RichText text={t} />
              </li>
            ))}
          </ul>
          <p className="text-sm font-semibold text-slate-900">{EXPLAINER_DISCLAIMER}</p>
        </section>

        {EXPLAINER_SECTIONS.map((s) => (
          <section key={s.id} aria-labelledby={s.id} className="space-y-4">
            <h2 id={s.id} className={h2Class}>
              {s.heading}
            </h2>
            {s.blocks.map((b, i) => (
              <BlockView key={i} block={b} />
            ))}
          </section>
        ))}

        <section aria-labelledby="faq" className="space-y-4">
          <h2 id="faq" className={h2Class}>
            FAQ
          </h2>
          <div className="space-y-3">
            {EXPLAINER_FAQ.map((f) => (
              <div key={f.q} className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="text-base font-semibold text-slate-900">{f.q}</h3>
                <p className="mt-1 text-sm leading-6">
                  <RichText text={f.a} />
                </p>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="get-started" className="space-y-4 rounded-2xl bg-orange-50 p-6">
          <h2 id="get-started" className={h2Class}>
            Want help getting ready?
          </h2>
          <p>
            Email us the AI systems you run. We can help with the inventory, the scoring rationale and the
            evidence pack. {EXPLAINER_DISCLAIMER}
          </p>
          <Button asChild size="lg">
            <a href={EXPLAINER_MAILTO}>Email about AI audit readiness</a>
          </Button>
        </section>
      </article>
    </InfoPageShell>
  );
}
