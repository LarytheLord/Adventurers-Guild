import type { Metadata } from 'next';
import Link from 'next/link';
import { InfoPageAside, InfoPageShell } from '@/components/public/info-page-shell';
import { DpdpReadinessCheck } from '@/components/dpdp-readiness/dpdp-readiness-check';
import { JsonLd } from '@/components/seo/json-ld';
import { buildPageMetadata, dpdpToolJsonLd } from '@/lib/seo';
import {
  DPDP_ACT_PDF_URL,
  DPDP_DISCLAIMER,
  DPDP_PHASE_DATES_NOTE,
  DPDP_RULES_NOTIFICATION,
  DPDP_RULES_PAGE_URL,
  DPDP_SOURCE_NOTE,
} from '@/lib/dpdp-readiness/data';

const TITLE = 'DPDP readiness check for Indian startups - Guild';
const DESCRIPTION =
  'Free self-check: 20 yes/no questions mapped to sections of the Digital Personal Data Protection Act 2023. See your gaps with the section and a plain-English fix. Runs in your browser; nothing is sent. Not legal advice.';

export const metadata: Metadata = buildPageMetadata({
  path: '/dpdp-readiness',
  title: TITLE,
  description: DESCRIPTION,
  keywords: ['DPDP readiness', 'DPDP Act 2023 checklist', 'DPDP Rules 2025', 'data protection India startup'],
});

const linkClass = 'font-semibold text-orange-700 underline underline-offset-4';

export default function DpdpReadinessPage() {
  return (
    <InfoPageShell
      eyebrow="Free self-check"
      title="How ready are you for India's DPDP law?"
      description="Twenty yes/no questions on notice, consent, children's data, security, breaches, erasure, grievances, Significant Data Fiduciaries and processors. Each gap shows the Act section and a plain-English fix."
      aside={
        <InfoPageAside title="Not legal advice">
          <p>{DPDP_DISCLAIMER}</p>
          <p>
            <a href={DPDP_ACT_PDF_URL} className={linkClass} target="_blank" rel="noopener noreferrer">
              Read the Act (official PDF)
            </a>
          </p>
          <p>
            <Link href="/guides/dpdp-rules-what-startups-must-do" className={linkClass}>
              Read the guide
            </Link>
          </p>
        </InfoPageAside>
      }
    >
      <JsonLd data={dpdpToolJsonLd()} />
      <div className="space-y-12 text-slate-600">
        <section aria-labelledby="disclaimer" className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h2 id="disclaimer" className="font-display text-lg font-bold text-slate-950">
            Read this first
          </h2>
          <p className="leading-7">{DPDP_DISCLAIMER}</p>
          <p className="leading-7">{DPDP_SOURCE_NOTE}</p>
          <p className="leading-7">
            The Rules are Gazette notification {DPDP_RULES_NOTIFICATION}. See the{' '}
            <a href={DPDP_RULES_PAGE_URL} className={linkClass} target="_blank" rel="noopener noreferrer">
              MeitY page
            </a>
            . {DPDP_PHASE_DATES_NOTE}
          </p>
        </section>

        <section aria-labelledby="check" className="space-y-4">
          <h2 id="check" className="font-display text-2xl font-bold tracking-[-0.03em] text-slate-950">
            Answer the 20 questions
          </h2>
          <DpdpReadinessCheck />
        </section>
      </div>
    </InfoPageShell>
  );
}
