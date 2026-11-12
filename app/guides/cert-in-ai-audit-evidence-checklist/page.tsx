import type { Metadata } from 'next';
import Link from 'next/link';
import { InfoPageAside, InfoPageShell } from '@/components/public/info-page-shell';
import { JsonLd } from '@/components/seo/json-ld';
import { buildPageMetadata, checklistJsonLd } from '@/lib/seo';
import {
  CERTIN_PDF_URL,
  CHECKLIST_DESCRIPTION,
  CHECKLIST_DOMAINS,
  CHECKLIST_FAQ,
  CHECKLIST_INTRO,
  CHECKLIST_NOTE,
  CHECKLIST_PATH,
  CHECKLIST_PREFIELDWORK,
  CHECKLIST_TITLE,
  EXPLAINER_DISCLAIMER,
  EXPLAINER_PATH,
} from '@/lib/cert-in-explainer/evidence-checklist';

export const metadata: Metadata = buildPageMetadata({
  path: CHECKLIST_PATH,
  title: `${CHECKLIST_TITLE} - Guild`,
  description: CHECKLIST_DESCRIPTION,
  type: 'article',
  keywords: ['CERT-In AI audit evidence', 'CERT-In AI Security Auditing Guidelines', 'AI audit checklist India'],
});

const linkClass = 'font-semibold text-orange-700 underline underline-offset-4';
const h2Class = 'font-display text-2xl font-bold tracking-[-0.03em] text-slate-950';

export default function EvidenceChecklistPage() {
  return (
    <InfoPageShell
      eyebrow="Guide"
      title={CHECKLIST_TITLE}
      description="Evidence to prepare for each CERT-In AI audit domain, with the section number for every item."
      updatedAt="12 November 2026"
      backHref={EXPLAINER_PATH}
      backLabel="Back to the guide"
      aside={
        <InfoPageAside title="Unofficial guide">
          <p>{EXPLAINER_DISCLAIMER}</p>
          <p>
            <a href={CERTIN_PDF_URL} className={linkClass} target="_blank" rel="noopener noreferrer">
              Read the official CERT-In PDF
            </a>
          </p>
        </InfoPageAside>
      }
    >
      <JsonLd data={checklistJsonLd()} />
      <article className="space-y-12 text-slate-600">
        <p className="text-lg leading-8 text-slate-800">{CHECKLIST_INTRO}</p>
        <p className="text-sm font-semibold text-slate-900">{EXPLAINER_DISCLAIMER}</p>

        <section aria-labelledby="domains" className="space-y-6">
          <h2 id="domains" className={h2Class}>
            Evidence by audit domain
          </h2>
          <p className="leading-7">{CHECKLIST_NOTE}</p>
          {CHECKLIST_DOMAINS.map((d) => (
            <div key={d.section} className="space-y-2 rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-base font-semibold text-slate-900">
                {d.section} {d.name}
              </h3>
              {d.items.length > 0 ? (
                <ul className="list-disc space-y-2 pl-6 leading-7">
                  {d.items.map((i) => (
                    <li key={i.text}>
                      {i.text} <span className="text-slate-500">({i.ref})</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">Not yet covered. No evidence items are listed for this section.</p>
              )}
            </div>
          ))}
        </section>

        <section aria-labelledby="prefieldwork" className="space-y-3">
          <h2 id="prefieldwork" className={h2Class}>
            Before fieldwork starts
          </h2>
          <ul className="list-disc space-y-2 pl-6 leading-7">
            {CHECKLIST_PREFIELDWORK.map((i) => (
              <li key={i.text}>
                {i.text} <span className="text-slate-500">({i.ref})</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="faq" className="space-y-4">
          <h2 id="faq" className={h2Class}>
            FAQ
          </h2>
          {CHECKLIST_FAQ.map((f) => (
            <div key={f.q} className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-base font-semibold text-slate-900">{f.q}</h3>
              <p className="mt-1 text-sm leading-6">{f.a}</p>
            </div>
          ))}
        </section>

        <p>
          <Link href={EXPLAINER_PATH} className={linkClass}>
            Read the full explainer
          </Link>
        </p>
      </article>
    </InfoPageShell>
  );
}
