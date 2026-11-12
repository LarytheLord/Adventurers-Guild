import type { Metadata } from 'next';
import Link from 'next/link';
import { InfoPageAside, InfoPageShell } from '@/components/public/info-page-shell';
import { JsonLd } from '@/components/seo/json-ld';
import { Button } from '@/components/ui/button';
import { buildPageMetadata, indicQaJsonLd } from '@/lib/seo';
import {
  INDIC_QA_CHECKS,
  INDIC_QA_CHECKS_TITLE,
  INDIC_QA_CITATION,
  INDIC_QA_CITATION_TITLE,
  INDIC_QA_CONTACT,
  INDIC_QA_DELIVERABLES,
  INDIC_QA_DELIVERABLES_TITLE,
  INDIC_QA_DESCRIPTION,
  INDIC_QA_HERO,
  INDIC_QA_LIMITS,
  INDIC_QA_LIMITS_TITLE,
  INDIC_QA_MAILTO,
  INDIC_QA_PATH,
  INDIC_QA_PILOT,
  INDIC_QA_PILOT_INTRO,
  INDIC_QA_PILOT_TITLE,
  INDIC_QA_TITLE,
} from '@/lib/indic-ai-qa/content';

export const metadata: Metadata = buildPageMetadata({
  path: INDIC_QA_PATH,
  title: INDIC_QA_TITLE,
  description: INDIC_QA_DESCRIPTION,
  type: 'article',
});

const h2 = 'font-display text-2xl font-bold tracking-[-0.03em] text-slate-950';

export default function IndicAiQaPage() {
  return (
    <>
      {indicQaJsonLd().map((d) => (
        <JsonLd key={d['@type']} data={d} />
      ))}
      <InfoPageShell
        eyebrow={INDIC_QA_HERO.eyebrow}
        title={INDIC_QA_HERO.title}
        description={INDIC_QA_HERO.lead}
        aside={
          <InfoPageAside title="Talk to us">
            <p>Shipping in Hindi, Gujarati or Hinglish? Tell us what you run.</p>
            <p>
              <a href={INDIC_QA_MAILTO} className="font-semibold text-orange-600 underline underline-offset-4">
                {INDIC_QA_CONTACT.label}
              </a>
            </p>
          </InfoPageAside>
        }
      >
        <div className="space-y-12 text-slate-600">
          <section aria-labelledby="what-we-check" className="space-y-4">
            <h2 id="what-we-check" className={h2}>{INDIC_QA_CHECKS_TITLE}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {INDIC_QA_CHECKS.map((c) => (
                <div key={c.id} data-check={c.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h3 className="text-lg font-semibold text-slate-900">{c.title}</h3>
                  <p className="mt-2 text-sm leading-6">{c.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section aria-labelledby="pilot" className="space-y-4">
            <h2 id="pilot" className={h2}>{INDIC_QA_PILOT_TITLE}</h2>
            <p className="leading-7">{INDIC_QA_PILOT_INTRO}</p>
            <ol className="space-y-4">
              {INDIC_QA_PILOT.map((s) => (
                <li key={s.title} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h3 className="text-lg font-semibold text-slate-900">{s.title}</h3>
                  <p className="mt-2 text-sm leading-6">{s.body}</p>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="deliverables" className="space-y-4">
            <h2 id="deliverables" className={h2}>{INDIC_QA_DELIVERABLES_TITLE}</h2>
            <ul className="list-disc space-y-2 pl-6 leading-7">
              {INDIC_QA_DELIVERABLES.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="limits" className="space-y-4">
            <h2 id="limits" className={h2}>{INDIC_QA_LIMITS_TITLE}</h2>
            <ul className="list-disc space-y-2 pl-6 leading-7">
              {INDIC_QA_LIMITS.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="background" className="space-y-2">
            <h2 id="background" className={h2}>{INDIC_QA_CITATION_TITLE}</h2>
            <p className="leading-7">
              <a
                href={INDIC_QA_CITATION.href}
                rel="noopener noreferrer"
                className="font-semibold text-orange-600 underline underline-offset-4"
              >
                {INDIC_QA_CITATION.label}
              </a>
            </p>
            <p className="text-sm leading-6">{INDIC_QA_CITATION.note}</p>
          </section>

          <section aria-labelledby="contact" className="space-y-4 rounded-2xl bg-orange-50 p-6">
            <h2 id="contact" className={h2}>{INDIC_QA_CONTACT.title}</h2>
            <p>{INDIC_QA_CONTACT.body}</p>
            <div className="flex flex-wrap items-center gap-4">
              <Button asChild size="lg">
                <a href={INDIC_QA_MAILTO}>{INDIC_QA_CONTACT.label}</a>
              </Button>
              <Link href="/" className="font-semibold text-orange-600 underline underline-offset-4">
                Back to the Guild home page
              </Link>
            </div>
          </section>
        </div>
      </InfoPageShell>
    </>
  );
}
