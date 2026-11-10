// Short answer pages under /guides/. Page 1 and page 3 draw on CERT-In, "Artificial
// Intelligence (AI) Security Auditing Guidelines", Version 1.0, 04 November 2026, and cite
// its section numbers (the same numbers used in lib/cert-in-explainer/content.ts).
// Inline links use the form [label](href). Keep everything ASCII and each page under 700 words.

import { AI_RISK_TIERS } from '@/lib/ai-risk-tier/data';
import { CERTIN_PDF_URL, stripLinks } from '@/lib/cert-in-explainer/content';

export const ANSWER_PUBLISHED = '2026-11-09';
export const ANSWER_DISCLAIMER =
  'Guild is not a CERT-In empanelled auditor. This page is unofficial and is not legal advice.';

/**
 * Repo path of the rls-open-check CLI. Not in this repository yet and no URL was given,
 * so it is left unset and the page omits the CLI step. See the PR body.
 */
export const RLS_OPEN_CHECK_URL: string | null = null;

export type AnswerBlock =
  | { kind: 'p'; text: string }
  | { kind: 'ul'; items: string[] }
  | { kind: 'ol'; items: string[] }
  | { kind: 'code'; text: string }
  | { kind: 'table'; head: string[]; rows: string[][] };

export interface AnswerSection {
  id: string;
  heading: string;
  blocks: AnswerBlock[];
}

export interface AnswerSource {
  label: string;
  href: string;
}

export interface AnswerPage {
  path: string;
  title: string;
  description: string;
  /** Exactly two sentences. */
  answer: string;
  sections: AnswerSection[];
  sources: AnswerSource[];
}

const certAudit: AnswerPage = {
  path: '/guides/does-cert-in-require-an-ai-audit',
  title: 'Does CERT-In require an AI audit?',
  description:
    'What CERT-In AI Security Auditing Guidelines v1.0 say about who needs an audit, which depends on the risk tier, and what they do not say: no effective date and no penalty.',
  answer:
    'The guidelines apply to all types and sizes of organisations operating AI in India, but the audit you need depends on each system\'s risk tier: self-assessment at Tier 1, and an independent audit by a CERT-In empanelled auditor at Tier 2 and above (4.4, 5.4). Version 1.0 states no effective date and no penalty.',
  sections: [
    {
      id: 'who',
      heading: 'Who is covered',
      blocks: [
        {
          kind: 'p',
          text: 'The framework "applies universally to all types and sizes of organisations operating AI systems within India or processing Indian citizens\' data" (4.4). Using a third-party model does not take you out of scope: AI systems "shall remain within audit scope regardless of model origin, ownership or delivery mechanism" (4.6).',
        },
        {
          kind: 'p',
          text: 'Section 4.9 excludes research AI that is not in production, purely rule-based automation, and consumer personal-use AI, each with a catch (for example, hybrid systems with ML components are in scope).',
        },
      ],
    },
    {
      id: 'by-tier',
      heading: 'What kind of audit, by tier',
      blocks: [
        {
          kind: 'p',
          text: 'Each system is scored on eight factors and given a tier from 1 to 4. The minimum audit requirement comes from that tier (5.4):',
        },
        {
          kind: 'table',
          head: ['Tier', 'Minimum audit requirement (5.4)'],
          rows: [
            ['Tier 1', 'Self-assessment or basic internal review with documented evidence.'],
            [
              'Tier 2',
              'Documented internal audit. Independent audit by CERT-In empanelled auditing organisations at least annually.',
            ],
            ['Tier 3', 'Periodic independent third-party audit by CERT-In empanelled auditing organisations.'],
            ['Tier 4', 'Independent audit by a CERT-In empanelled auditing organisation with continuous monitoring.'],
          ],
        },
        {
          kind: 'p',
          text: 'So the answer is not one audit for everyone. A low-risk system can stay at self-assessment; a moderate-risk or higher one needs an independent audit. Score your own system with the [risk tier calculator](/ai-risk-tier).',
        },
      ],
    },
    {
      id: 'unstated',
      heading: 'What v1.0 does not say',
      blocks: [
        {
          kind: 'p',
          text: 'Version 1.0 (dated 04 November 2026) states no effective date and no penalty. It uses the phrases "mandatory compliance scope" (4.9) and "mandatory security controls" (5.7) without saying who enforces them or from when. We do not guess. Treat enforcement as unclear and read the PDF yourself.',
        },
      ],
    },
  ],
  sources: [{ label: 'CERT-In, AI Security Auditing Guidelines, Version 1.0 (official PDF)', href: CERTIN_PDF_URL }],
};

const supabaseRls: AnswerPage = {
  path: '/guides/check-supabase-rls-lovable-bolt',
  title: 'How to check Supabase RLS on an app built with Lovable or Bolt',
  description:
    'Three practical checks for Row Level Security on your own Supabase project: read the dashboard policy list, test with the anon key, and know what an open table looks like.',
  answer:
    'Apps built with tools like Lovable or Bolt often talk to Supabase straight from the browser, so Row Level Security (RLS) policies are the only thing between the public anon key and your data. Check the policy list in the dashboard, then try to read your own tables with the anon key, on a project you own.',
  sections: [
    {
      id: 'dashboard',
      heading: '1. Read the policy list in the dashboard',
      blocks: [
        {
          kind: 'p',
          text: 'In the Supabase dashboard open Database, then Policies (or Authentication, then Policies). For every table in the public schema, check three things:',
        },
        {
          kind: 'ul',
          items: [
            'RLS is switched on. A table with RLS off is open to anyone holding the anon key.',
            'It has at least one policy. With RLS on and no policies, access is denied, which is safe but may break your app.',
            'No policy is just "true". A SELECT, UPDATE or DELETE policy using (true), or an INSERT policy with check (true), granted to anon or public, is an open door.',
          ],
        },
        {
          kind: 'p',
          text: 'Prefer policies that compare the row to the signed-in user, for example auth.uid() = user_id. The Security Advisor in the dashboard also flags tables with RLS off.',
        },
      ],
    },
    {
      id: 'anon-key',
      heading: '2. Test with the anon key, on your own project only',
      blocks: [
        {
          kind: 'p',
          text: 'The anon key is meant to be public: it sits in your front-end bundle. That is why you can use it to see what a stranger would see. Find your project URL and anon key under Project Settings, then API. Only test a project you own or have written permission to test. Never run this against someone else\'s project, and never put the service_role key in a browser or a shared script, because it bypasses RLS.',
        },
        {
          kind: 'code',
          text: 'curl "https://YOUR-PROJECT.supabase.co/rest/v1/YOUR_TABLE?select=*&limit=5" \\\n  -H "apikey: YOUR_ANON_KEY" \\\n  -H "Authorization: Bearer YOUR_ANON_KEY"',
        },
        {
          kind: 'p',
          text: 'For a table that should be private, you want an empty list or a permission error. If rows come back, the table is open. Repeat for each table, and try an insert or update too, since write policies are separate from read policies.',
        },
      ],
    },
    {
      id: 'fix',
      heading: 'If a table is open',
      blocks: [
        {
          kind: 'ol',
          items: [
            'Turn RLS on for the table.',
            'Add the narrowest policies the app needs, scoped to the signed-in user.',
            'Re-run the anon-key test and confirm the rows no longer come back.',
          ],
        },
        {
          kind: 'p',
          text: 'Want a second pair of eyes on an AI-built app? See the [Production Check](/audit). ' + ANSWER_DISCLAIMER,
        },
      ],
    },
  ],
  sources: [
    {
      label: 'Supabase docs: Row Level Security',
      href: 'https://supabase.com/docs/guides/database/postgres/row-level-security',
    },
    { label: 'Supabase docs: API keys', href: 'https://supabase.com/docs/guides/api/api-keys' },
  ],
};

const riskTier: AnswerPage = {
  path: '/guides/what-is-an-ai-risk-tier-cert-in',
  title: 'What is an AI risk tier under CERT-In?',
  description:
    'A risk tier is a 1 to 4 rating the CERT-In AI Security Auditing Guidelines give each AI system from eight scored factors; it sets the minimum audit you need.',
  answer:
    'Under the CERT-In AI Security Auditing Guidelines, a risk tier is a rating from 1 (Low) to 4 (Critical) given to each AI system by scoring it on eight inherent-risk factors (5.3, 5.4). The tier sets the audit depth, evidence and frequency, and how independent the auditor must be (4.10).',
  sections: [
    {
      id: 'how',
      heading: 'How a tier is worked out',
      blocks: [
        {
          kind: 'p',
          text: 'Each system "shall first be assessed against the eight inherent-risk factors", without taking credit for claimed controls (5.3). Each factor scores 1 Low, 2 Moderate, 3 High or 4 Critical (5.4). Eight scores add up to a composite from 8 to 32, which maps to a tier:',
        },
        {
          kind: 'table',
          head: ['Composite score', 'Tier'],
          rows: AI_RISK_TIERS.map((t) => [`${t.min}-${t.max}`, `Tier ${t.tier} (${t.label})`]),
        },
        {
          kind: 'p',
          text: 'The eight factors are Impact Severity, Autonomy and Actionability, Data Sensitivity, Scale and Exposure, Reversibility and Recoverability, Operational / Sector Criticality, Adversarial Exposure, and Complexity and Auditability (5.3).',
        },
      ],
    },
    {
      id: 'escalation',
      heading: 'Escalation and reassessment',
      blocks: [
        {
          kind: 'ul',
          items: [
            'The composite does not have the last word. The auditor or system owner must consider escalation, for example for an AI that can autonomously execute code, transactions or external communications (5.4).',
            'If the auditor\'s tier differs from yours, the higher tier applies for scoping (7.3, Step 2).',
            'Tiers are reassessed at least annually (5.6, Table 15).',
          ],
        },
      ],
    },
    {
      id: 'next',
      heading: 'Find your own tier',
      blocks: [
        {
          kind: 'p',
          text: 'Use the free [AI risk tier calculator](/ai-risk-tier). It runs in your browser and is a self-check, not an audit. For what each tier means for audits, read [Does CERT-In require an AI audit?](/guides/does-cert-in-require-an-ai-audit). ' +
            ANSWER_DISCLAIMER,
        },
      ],
    },
  ],
  sources: [
    { label: 'CERT-In, AI Security Auditing Guidelines, Version 1.0 (official PDF)', href: CERTIN_PDF_URL },
    { label: 'Guild: AI risk tier calculator', href: '/ai-risk-tier' },
  ],
};

export const ANSWER_PAGES: AnswerPage[] = [certAudit, supabaseRls, riskTier];

/** Visible copy as one string, for tests and word counts. Links are flattened to "label (href)". */
export function answerPagePlainText(page: AnswerPage): string {
  const parts: string[] = [page.title, page.answer];
  for (const s of page.sections) {
    parts.push(s.heading);
    for (const b of s.blocks) {
      if (b.kind === 'p' || b.kind === 'code') parts.push(b.text);
      else if (b.kind === 'ul' || b.kind === 'ol') parts.push(...b.items);
      else parts.push(b.head.join(' '), ...b.rows.map((r) => r.join(' ')));
    }
  }
  parts.push(...page.sources.map((s) => `${s.label} (${s.href})`));
  parts.push(ANSWER_DISCLAIMER);
  return parts.map(stripLinks).join('\n');
}
