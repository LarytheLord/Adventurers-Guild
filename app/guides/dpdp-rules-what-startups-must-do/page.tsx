import type { Metadata } from 'next';
import Link from 'next/link';
import { Fragment } from 'react';
import { InfoPageAside, InfoPageShell } from '@/components/public/info-page-shell';
import { JsonLd } from '@/components/seo/json-ld';
import { buildPageMetadata, dpdpGuideJsonLd } from '@/lib/seo';
import { Button } from '@/components/ui/button';
import {
  DPDP_GUIDE_CHECK_NOTE,
  DPDP_GUIDE_DESCRIPTION,
  DPDP_GUIDE_DISCLAIMER,
  DPDP_GUIDE_FAQ,
  DPDP_GUIDE_PATH,
  DPDP_GUIDE_SECTIONS,
  DPDP_GUIDE_SUMMARY,
  DPDP_GUIDE_TITLE,
  type Block,
} from '@/lib/dpdp-explainer/content';
import { DPDP_ACT_PDF_URL, DPDP_MAILTO, DPDP_RULES_PAGE_URL } from '@/lib/dpdp-readiness/data';

export const metadata: Metadata = buildPageMetadata({
  path: DPDP_GUIDE_PATH,
  title: `${DPDP_GUIDE_TITLE} - Guild`,
  description: DPDP_GUIDE_DESCRIPTION,
  type: 'article',
  keywords: ['DPDP Rules 2025', 'DPDP Act 2023', 'DPDP compliance startups India', 'G.S.R. 846(E)'],
});

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

const h2Class = 'font-display text-2xl font-bold tracking-[-0.03em] text-slate-950';

export default function DpdpGuidePage() {
  return (
    <InfoPageShell
      eyebrow="Guide"
      title={DPDP_GUIDE_TITLE}
      description="What the DPDP Act 2023 and the DPDP Rules 2025 ask of a startup, with the Act section for every duty."
      updatedAt="12 November 2026"
      aside={
        <InfoPageAside title="Unofficial guide">
          <p>{DPDP_GUIDE_DISCLAIMER}</p>
          <p>
            <a href={DPDP_ACT_PDF_URL} className={linkClass} target="_blank" rel="noopener noreferrer">
              Read the Act (official PDF)
            </a>
          </p>
          <p>
            <a href={DPDP_RULES_PAGE_URL} className={linkClass} target="_blank" rel="noopener noreferrer">
              MeitY page for the Rules
            </a>
          </p>
          <p>
            <Link href="/dpdp-readiness" className={linkClass}>
              Free DPDP readiness check
            </Link>
          </p>
        </InfoPageAside>
      }
    >
      <JsonLd data={dpdpGuideJsonLd()} />
      <article className="space-y-12 text-slate-600">
        <section aria-labelledby="summary" className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h2 id="summary" className="font-display text-lg font-bold text-slate-950">
            The short version
          </h2>
          <ul className="list-disc space-y-2 pl-6 leading-7">
            {DPDP_GUIDE_SUMMARY.map((t) => (
              <li key={t}>
                <RichText text={t} />
              </li>
            ))}
          </ul>
          <p className="text-sm font-semibold text-slate-900">{DPDP_GUIDE_CHECK_NOTE}</p>
          <p className="text-sm font-semibold text-slate-900">{DPDP_GUIDE_DISCLAIMER}</p>
        </section>

        {DPDP_GUIDE_SECTIONS.map((s) => (
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
            {DPDP_GUIDE_FAQ.map((f) => (
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
            Email us how you handle personal data. We can help with the data map, the notice and consent screens and the
            incident plan. {DPDP_GUIDE_DISCLAIMER}
          </p>
          <Button asChild size="lg">
            <a href={DPDP_MAILTO}>Email about DPDP readiness</a>
          </Button>
        </section>
      </article>
    </InfoPageShell>
  );
}
