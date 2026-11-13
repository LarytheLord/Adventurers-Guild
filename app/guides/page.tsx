import type { Metadata } from 'next';
import Link from 'next/link';
import { InfoPageAside, InfoPageShell } from '@/components/public/info-page-shell';
import { JsonLd } from '@/components/seo/json-ld';
import { buildPageMetadata, guidesHubJsonLd } from '@/lib/seo';
import { GUIDE_GROUPS, cleanTitle, firstSentence, type GuideItem } from '@/lib/guides-hub/registry';
// Each listed page's own metadata is the single source for its title and description.
import { metadata as certInGuide } from '@/app/guides/cert-in-ai-security-auditing-guidelines/page';
import { metadata as certInRequired } from '@/app/guides/does-cert-in-require-an-ai-audit/page';
import { metadata as supabaseRls } from '@/app/guides/check-supabase-rls-lovable-bolt/page';
import { metadata as riskTierGuide } from '@/app/guides/what-is-an-ai-risk-tier-cert-in/page';
import { metadata as riskTierTool } from '@/app/ai-risk-tier/page';
import { metadata as launchCheck } from '@/app/launch-check/page';
import { metadata as checklist } from '@/app/checklist/page';
import { metadata as indicQa } from '@/app/indic-ai-qa/page';

const TITLE = 'Guides and free tools - Guild';
const DESCRIPTION =
  'Every guide and free self-check on Guild, grouped by topic: launching apps built with AI tools, the CERT-In AI Security Auditing Guidelines, and Indian-language AI. Unofficial; not an audit.';

const DISCLAIMER =
  'These are unofficial guides and self-checks. They are not audits or legal advice. Guild is not a CERT-In empanelled auditor.';

export const metadata: Metadata = buildPageMetadata({ path: '/guides', title: TITLE, description: DESCRIPTION });

const PAGE_METADATA: Record<string, Metadata> = {
  '/guides/cert-in-ai-security-auditing-guidelines': certInGuide,
  '/guides/does-cert-in-require-an-ai-audit': certInRequired,
  '/guides/check-supabase-rls-lovable-bolt': supabaseRls,
  '/guides/what-is-an-ai-risk-tier-cert-in': riskTierGuide,
  '/ai-risk-tier': riskTierTool,
  '/launch-check': launchCheck,
  '/checklist': checklist,
  '/indic-ai-qa': indicQa,
};

function entryFor(item: GuideItem) {
  const meta = PAGE_METADATA[item.path];
  if (!meta || typeof meta.title !== 'string' || typeof meta.description !== 'string') {
    throw new Error(`Guides hub: no string title and description in the metadata of ${item.path}`);
  }
  return {
    path: item.path,
    kind: item.kind,
    name: cleanTitle(meta.title),
    description: firstSentence(meta.description),
  };
}

const KIND_LABEL = { guide: 'Guide', tool: 'Free tool', service: 'Pilot offer' } as const;

export default function GuidesHubPage() {
  const groups = GUIDE_GROUPS.map((g) => ({ ...g, entries: g.items.map(entryFor) }));
  const all = groups.flatMap((g) => g.entries);

  return (
    <InfoPageShell
      eyebrow="Guides and free tools"
      title="Every guide and free tool, in one place"
      description="Short guides and in-browser self-checks for founders of AI-built apps and for teams in India running AI. Each line below is the page's own summary."
      aside={
        <InfoPageAside title="Not an audit">
          <p>{DISCLAIMER}</p>
          <p>
            <Link href="/audit" className="font-semibold text-orange-700 underline underline-offset-4">
              See the Launch Check
            </Link>
          </p>
        </InfoPageAside>
      }
    >
      <JsonLd data={guidesHubJsonLd(all)} />
      <div className="space-y-12">
        {groups.map((g) => (
          <section key={g.id} aria-labelledby={`g-${g.id}`} className="space-y-4">
            <div>
              <h2 id={`g-${g.id}`} className="font-display text-2xl font-bold tracking-[-0.03em] text-slate-950">
                {g.title}
              </h2>
              <p className="mt-1 leading-7 text-slate-600">{g.intro}</p>
            </div>
            <ul className="space-y-3">
              {g.entries.map((e) => (
                <li key={e.path} className="rounded-2xl border border-slate-200 bg-white p-4 leading-7">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {KIND_LABEL[e.kind]}
                  </p>
                  <Link
                    href={e.path}
                    className="font-semibold text-orange-700 underline underline-offset-4 hover:text-orange-800"
                  >
                    {e.name}
                  </Link>
                  <p className="mt-1 text-slate-600">{e.description}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </InfoPageShell>
  );
}
