import type { Metadata } from 'next';
import Link from 'next/link';
import { InfoPageAside, InfoPageShell } from '@/components/public/info-page-shell';
import { RiskTierCalculator } from '@/components/ai-risk-tier/risk-tier-calculator';
import { JsonLd } from '@/components/seo/json-ld';
import { buildPageMetadata, softwareApplicationJsonLd } from '@/lib/seo';
import { Button } from '@/components/ui/button';
import { AI_RISK_PREPARE, AI_RISK_TIER_MAILTO, CERTIN_PDF_URL } from '@/lib/ai-risk-tier/data';

const TITLE = 'CERT-In AI security audit risk tier calculator - Guild';
const DESCRIPTION =
  'Free self-check: score an AI system on the eight risk factors in the CERT-In AI Security Auditing Guidelines (v1.0, 4 November 2026) and see its tier and minimum audit requirement. Runs in your browser; nothing is sent.';

export const metadata: Metadata = buildPageMetadata({
  path: '/ai-risk-tier',
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    'CERT-In AI security audit risk tier calculator',
    'CERT-In AI Security Auditing Guidelines',
    'AI risk tier',
    'AI audit readiness India',
  ],
});

export default function AiRiskTierPage() {
  return (
    <InfoPageShell
      eyebrow="Free self-check"
      title="Which CERT-In risk tier is your AI system?"
      description="Score your AI system on the eight factors in the CERT-In AI Security Auditing Guidelines and see the tier and the minimum audit requirement the guideline gives for it."
      aside={
        <InfoPageAside title="Not an audit">
          <p>
            This is an unofficial self-check based on the published guidelines. It is not an audit. Guild is
            not a CERT-In empanelled auditor.
          </p>
          <p>
            <a
              href={CERTIN_PDF_URL}
              className="font-semibold text-orange-700 underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              Read the CERT-In PDF
            </a>
          </p>
        </InfoPageAside>
      }
    >
      <JsonLd data={softwareApplicationJsonLd()} />
      <div className="space-y-12 text-slate-600">
        <section
          aria-labelledby="disclaimer"
          className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-5"
        >
          <h2 id="disclaimer" className="font-display text-lg font-bold text-slate-950">
            Read this first
          </h2>
          <p className="leading-7">
            This is an unofficial self-check based on the published{' '}
            <a
              href={CERTIN_PDF_URL}
              className="font-semibold text-orange-700 underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              CERT-In AI Security Auditing Guidelines
            </a>{' '}
            (Version 1.0, 4 November 2026, Section 5). It is not an audit. Guild is not a CERT-In empanelled
            auditor. The tier an auditor assigns can differ from yours, and where it does, the guideline says
            the higher tier applies for scoping (Section 7.3).
          </p>
        </section>

        <section aria-labelledby="calculator" className="space-y-4">
          <h2 id="calculator" className="font-display text-2xl font-bold tracking-[-0.03em] text-slate-950">
            Score your AI system
          </h2>
          <RiskTierCalculator />
        </section>

        <section aria-labelledby="what-to-prepare" className="space-y-4">
          <h2 id="what-to-prepare" className="font-display text-2xl font-bold tracking-[-0.03em] text-slate-950">
            What to prepare
          </h2>
          <ul className="space-y-3">
            {AI_RISK_PREPARE.map((p) => (
              <li key={p.title} className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="text-base font-semibold text-slate-900">
                  {p.title} <span className="font-normal text-slate-500">(Section {p.section})</span>
                </h3>
                <p className="mt-1 text-sm leading-6">{p.detail}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="get-started" className="space-y-4 rounded-2xl bg-orange-50 p-6">
          <h2 id="get-started" className="font-display text-2xl font-bold tracking-[-0.03em] text-slate-950">
            Want help getting ready?
          </h2>
          <p>
            Email us your company, the AI systems you run and your tier result. We can help with the inventory,
            the scoring rationale and the evidence pack. For independent audits at Tier 2 and above, the guideline
            requires a CERT-In empanelled auditor, and that is not us.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Button asChild size="lg">
              <a href={AI_RISK_TIER_MAILTO}>Email about AI audit readiness</a>
            </Button>
            <Link href="/audit" className="font-semibold text-orange-700 underline underline-offset-4">
              Or see our Launch Check for AI-built apps
            </Link>
          </div>
        </section>
      </div>
    </InfoPageShell>
  );
}
