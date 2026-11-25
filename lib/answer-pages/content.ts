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
  /** Optional FAQ. Shown on the page and emitted as FAQPage JSON-LD. Plain text answers. */
  faq?: { q: string; a: string }[];
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
          text: 'Want a second pair of eyes on an AI-built app? See the [Launch Check](/audit). ' + ANSWER_DISCLAIMER,
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

const REPO = 'https://github.com/LarytheLord/rls-open-check';
const REPO_SRC = REPO + '?src=guide';

const rlsMigrations: AnswerPage = {
  path: '/guides/supabase-rls-mistakes-in-real-migrations',
  title: 'What 126 Supabase migration files taught us about RLS',
  description:
    'The five Row Level Security patterns an open-source linter found most often in 126 public SQL files, what each means, why AI-built apps often have it, and the fix.',
  answer:
    'We ran the open-source linter rls-open-check on 126 public SQL files from eight public repositories and got 137 findings, in five patterns that come up again and again. Each is a small, fixable mistake, and the numbers come from the linter\'s own validation notes, not a survey.',
  sections: [
    {
      id: 'definer-search-path',
      heading: '1. SECURITY DEFINER with no search_path (52 findings)',
      blocks: [
        {
          kind: 'p',
          text: 'The function runs with its owner\'s rights and does not pin where Postgres looks for names. A common reason is that the function works without that line, so nothing prompts anyone to add it.',
        },
        { kind: 'p', text: 'Fix: add SET search_path = \'\' to the function and use full schema names inside it.' },
      ],
    },
    {
      id: 'definer-exposed',
      heading: '2. A SECURITY DEFINER function anyone can call (39 findings)',
      blocks: [
        {
          kind: 'p',
          text: 'Postgres lets the public role run new functions by default, so the anon key can call it through the API. Impact varies: low for a role-check helper, high for one that takes a user id or writes to auth.users. A common reason is that the default never fails a test.',
        },
        { kind: 'p', text: 'Fix: REVOKE EXECUTE on the function FROM PUBLIC, then grant it only to the roles that need it.' },
      ],
    },
    {
      id: 'open-policy',
      heading: '3. Policies that say USING (true) (27 findings)',
      blocks: [
        {
          kind: 'p',
          text: 'The policy lets anon or public through on every row. Open reads are often intended, such as a docs or product table. Open writes are not: the two critical findings in this run were anonymous INSERT policies. A policy named like \'Service can insert\' with FOR INSERT TO public WITH CHECK (true) is the clearest case, explained in [this guide](/guides/supabase-policy-service-can-insert). A common reason is that true is the shortest way to make a "permission denied" error go away.',
        },
        {
          kind: 'p',
          text: 'Fix: keep open reads only on data meant to be public, and scope writes to the signed-in user, for example auth.uid() = user_id.',
        },
      ],
    },
    {
      id: 'rls-off',
      heading: '4. Tables with RLS off (14 findings)',
      blocks: [
        {
          kind: 'p',
          text: 'With the default setup the table is reachable through the API by anyone holding the anon key. All 14 were in Supabase\'s own demo code (supabase/supabase, the examples folder), where examples often skip RLS to stay short. A common reason is that the app works fine without it, so the gap stays invisible.',
        },
        { kind: 'p', text: 'Fix: turn RLS on for every table in the public schema, then add the narrowest policies the app needs.' },
      ],
    },
    {
      id: 'dead-grants',
      heading: '5. Grants with no policy behind them (4 findings, low)',
      blocks: [
        {
          kind: 'p',
          text: 'The anon role was granted rights that no policy uses. With RLS on, the grant does nothing today. A common reason is a schema dump that grants everything to anon.',
        },
        { kind: 'p', text: 'Fix: revoke what the app does not use, so a later policy cannot open it by accident.' },
      ],
    },
    {
      id: 'not-proved',
      heading: 'What a clean result does not prove',
      blocks: [
        {
          kind: 'p',
          text: 'A clean result does not prove the app is safe. The linter read migration files only. It did not look at a live database, application code, Storage policies set in the dashboard, or Edge Functions, and a repository can differ from production. 24 of the 52 SECURITY DEFINER findings and 24 of the 39 exposed-function findings came from one docs file, and partitioned tables are reported once per partition, so read the counts as a map, not a rate. A later hand-read of 52 findings across all twelve rules judged 27 true, 18 false and 7 unclear, so about 60 percent of the findings we could decide were real, and the three newer heuristic rules (R10 to R12) were mostly false positives. A hand-read of 36 more findings on those three rules gave the same picture. Both are small samples; the rule-by-rule numbers are in the [validation notes](' + REPO + '/blob/main/docs/VALIDATION.md).',
        },
      ],
    },
    {
      id: 'run-it',
      heading: 'Run it on your own project',
      blocks: [
        {
          kind: 'p',
          text: `Clone [rls-open-check](${REPO_SRC}), build it, and point it at your own migrations folder, one project per run. It reads files only and connects to nothing:`,
        },
        { kind: 'code', text: 'node dist/bin.js ./supabase/migrations' },
        { kind: 'p', text: 'Then work through the free [launch checklist](/checklist). ' + ANSWER_DISCLAIMER },
      ],
    },
  ],
  sources: [
    { label: 'rls-open-check: validation on public code', href: REPO + '/blob/main/docs/VALIDATION.md' },
    { label: 'Supabase docs: Row Level Security', href: 'https://supabase.com/docs/guides/database/postgres/row-level-security' },
  ],
};

const serviceCanInsert: AnswerPage = {
  path: '/guides/supabase-policy-service-can-insert',
  title: 'A Supabase policy called "Service can insert" that lets anyone insert',
  description:
    'A Supabase policy named "Service can insert orders" and written FOR INSERT TO public WITH CHECK (true) does not restrict inserts to your backend, because the service role bypasses RLS and, by default, anyone with the public anon key can insert.',
  answer:
    'A Supabase policy named "Service can insert orders" and written FOR INSERT TO public WITH CHECK (true) does not restrict inserts to your backend. It lets anyone with your project\'s public anon key insert rows.',
  sections: [
    {
      id: 'example',
      heading: 'An invented example',
      blocks: [
        { kind: 'p', text: 'The example below is invented. It is not taken from any real project.' },
        {
          kind: 'code',
          text: [
            'create table public.orders (',
            '  id uuid primary key default gen_random_uuid(),',
            '  customer_email text not null,',
            '  total_cents integer not null,',
            "  status text not null default 'pending'",
            ');',
            'alter table public.orders enable row level security;',
            'create policy "Service can insert orders" on public.orders',
            '  for insert to public with check (true);',
          ].join('\n'),
        },
      ],
    },
    {
      id: 'why-the-name-misleads',
      heading: 'Why the name misleads',
      blocks: [
        { kind: 'p', text: 'The name describes what the author wanted. The code says something else. Two facts explain the gap.' },
        {
          kind: 'p',
          text: 'First, the service role key bypasses row level security entirely. Your backend, using that key, never evaluates this policy. The policy does nothing for the service, so it is not needed for it.',
        },
        {
          kind: 'p',
          text: 'Second, "public" in Postgres is not "the public internet" in a vague sense. It is the role that every other role belongs to, and that includes anon. The anon key ships in your frontend by design, so anyone can read it. With check (true), every row passes the check. By default, anyone holding that key can send an insert to the REST API for this table (unless INSERT was revoked from anon), with any email, any total, and any status.',
        },
        { kind: 'p', text: 'So the policy grants the very access the name suggests it prevents.' },
      ],
    },
    {
      id: 'the-fix',
      heading: 'The fix',
      blocks: [
        {
          kind: 'p',
          text: 'If only your backend writes orders, delete the policy. With RLS enabled and no insert policy, anon and authenticated users are denied, and the service role still works.',
        },
        { kind: 'p', text: 'If signed-in users should create their own orders, add a user_id column and scope the policy:' },
        {
          kind: 'code',
          text: 'create policy "Users insert own orders" on public.orders\n  for insert to authenticated with check (auth.uid() = user_id);',
        },
        {
          kind: 'p',
          text: 'If public inserts are intended, as with a contact form, say so in the policy name, for example "Anyone can submit a contact message". Then limit what can be written. Restrict the columns with grants, check values in the with check clause, and add rate limiting in front of it. A form that anyone can post to will be posted to by everyone.',
        },
      ],
    },
    {
      id: 'how-to-check',
      heading: 'How to check',
      blocks: [
        {
          kind: 'p',
          text: 'Write a short script that creates a client with your anon key, tries to insert a row into the table, and see whether it succeeds. If it does, the policy is open. Delete any test rows afterward from the dashboard or with the service role, and run this against a development project, not production. To test a whole multi-tenant app, see [the two-user tenant test](/guides/prove-tenant-isolation-supabase).',
        },
      ],
    },
    {
      id: 'one-limit',
      heading: 'One limit',
      blocks: [
        {
          kind: 'p',
          text: `This covers INSERT only. A table can have other problems, such as permissive select or update policies, and a scanner can be wrong. Our scanner, [rls-open-check](${REPO_SRC}), flags this pattern as critical. Treat a flag as a prompt to read the policy, not as proof.`,
        },
        { kind: 'p', text: ANSWER_DISCLAIMER },
      ],
    },
  ],
  sources: [
    { label: 'Supabase docs: Row Level Security', href: 'https://supabase.com/docs/guides/database/postgres/row-level-security' },
    { label: 'PostgreSQL docs: CREATE POLICY', href: 'https://www.postgresql.org/docs/current/sql-createpolicy.html' },
  ],
};

const tenantIsolation: AnswerPage = {
  path: '/guides/prove-tenant-isolation-supabase',
  title: "How to prove that one tenant cannot read another tenant's data in a Supabase app",
  description:
    "A two-user test, run through the public API with the anon key, that checks whether one firm can read, change, insert or delete another firm's rows or files in a Supabase app, and what the test does not cover.",
  answer:
    "Reading your row level security (RLS) policies is not proof that they work. The proof is to log in as a user from firm B and try to read, change and insert firm A's rows through the same public API an attacker would use.",
  sections: [
    {
      id: 'setup',
      heading: 'Setup',
      blocks: [
        { kind: 'p', text: 'Use a development or staging Supabase project. Never use production data for this.' },
        {
          kind: 'p',
          text: "Create two test firms, Firm A and Firm B. Create one test user in each firm. In every table that holds tenant data, add one known row for each firm, and write down the id of each row. Do the same for each storage bucket: upload one known file per firm and write down its path.",
        },
      ],
    },
    {
      id: 'the-test',
      heading: 'The test',
      blocks: [
        { kind: 'p', text: 'Do these steps for each table and each storage bucket.' },
        {
          kind: 'ol',
          items: [
            "Sign in as Firm B's user. Use the project's public anon key and that user's session. These are the same things anyone can get from your app in a browser.",
            "Try to select Firm A's row by its id. Expected result: nothing comes back.",
            "Try to update Firm A's row. Expected result: the request is refused, or it reports zero rows changed. Then check as Firm A's user that the row is unchanged.",
            'Try to insert a new row that claims Firm A\'s tenant id. Expected result: the insert is refused.',
            "Try to delete Firm A's row. Expected result: refused or zero rows deleted. Then confirm as Firm A's user that the row still exists.",
            "For storage, try to download, overwrite and delete Firm A's file using Firm B's session.",
          ],
        },
        {
          kind: 'p',
          text: 'Then repeat every step with no login at all, using only the anon key. Every attempt must be refused or return nothing.',
        },
        {
          kind: 'p',
          text: "You can send these requests with the Supabase client library, or with plain HTTP calls to your project's REST address. Use the real API, not the dashboard's SQL editor, because the editor runs with elevated rights and will not show what an attacker sees.",
        },
      ],
    },
    {
      id: 'pass-and-fail',
      heading: 'What pass and fail look like',
      blocks: [
        {
          kind: 'p',
          text: 'If every attempt is refused or returns nothing, that path is closed. If any attempt succeeds, you have a leak. Run this test before real customer data goes in.',
        },
        {
          kind: 'p',
          text: "A pass: every read returns no rows of Firm A, and every update, insert and delete is refused or has no effect, which you confirm by checking the data afterward as Firm A.",
        },
        {
          kind: 'p',
          text: "A fail: any of Firm A's data comes back to Firm B or to the anonymous caller, or any change succeeds, even a single field. A fail on any one step means the table or bucket is not isolated. Fix it and run the whole test again.",
        },
      ],
    },
    {
      id: 'what-it-does-not-cover',
      heading: 'What this test does not cover',
      blocks: [
        { kind: 'p', text: 'Four things need a separate read by a reviewer, because the two-user test will not reach them:' },
        {
          kind: 'ul',
          items: [
            'Server code that uses the service-role key. That key bypasses RLS entirely, so the code must enforce tenant checks itself.',
            'SECURITY DEFINER functions. They run with their owner\'s rights, not the caller\'s, so they can return data the caller should not see.',
            'Views without security_invoker. By default a view runs with its owner\'s rights and can expose rows that the underlying policies would hide.',
            'Policies that trust user_metadata. Users can edit that field themselves, so a policy that relies on it for tenant identity can be bypassed.',
          ],
        },
      ],
    },
    {
      id: 'one-limit',
      heading: 'One honest limit',
      blocks: [
        {
          kind: 'p',
          text: `This test checks only the paths you test. Passing it does not prove the app is safe. A free [open-source linter](${REPO_SRC}) can read your migration files and flag common policy mistakes, but it cannot run this test, because it never signs in as a user and never sends a request. Use both, and still treat the result as partial evidence.`,
        },
        { kind: 'p', text: ANSWER_DISCLAIMER },
      ],
    },
  ],
  sources: [{ label: 'Supabase docs: Row Level Security', href: 'https://supabase.com/docs/guides/database/postgres/row-level-security' }],
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

const leakedKey: AnswerPage = {
  path: '/guides/leaked-supabase-key-what-to-do-first',
  title: 'Leaked a Supabase key? What to do first',
  description:
    'Which Supabase key leaked decides everything: the anon or publishable key is public by design, a service_role or secret key bypasses RLS. Steps: rotate, check logs, close open policies, clean up git, ask for a human check.',
  answer:
    'Which key leaked matters: the anon (publishable, sb_publishable_...) key is public by design and mainly a risk when your Row Level Security (RLS) policies are open, while a service_role (secret, sb_secret_...) key bypasses RLS, so we suggest rotating it now. If a service_role key leaked, we suggest working through the steps below in order and rotating before you clean up anything else; for an anon key, go to step 4.',
  sections: [
    {
      id: 'which-key',
      heading: '1. Which key leaked',
      blocks: [
        {
          kind: 'table',
          head: ['Key', 'Meant to be public?', 'What to do'],
          rows: [
            [
              'sb_publishable_... (legacy: anon) key',
              'Yes, it can go in client code. What it can reach is set by your RLS policies.',
              'Check your policies (step 4). In our view, rotating this key does not close an open policy.',
            ],
            [
              'sb_secret_... (legacy: service_role) key',
              'No. It bypasses RLS, so it must never leave your control.',
              'We suggest rotating now (step 2), then checking logs (step 3).',
            ],
          ],
        },
        {
          kind: 'p',
          text: 'Not sure which one it was? We suggest treating it as a service_role key until you know. New-style keys start with sb_publishable_ or sb_secret_; legacy keys are called anon and service_role. The [API keys docs](https://supabase.com/docs/guides/api/api-keys) describe each key type.',
        },
      ],
    },
    {
      id: 'rotate',
      heading: '2. Rotate or roll the key',
      blocks: [
        {
          kind: 'p',
          text: 'Follow Supabase\'s guide to [rotate a leaked or compromised API key](https://supabase.com/docs/guides/security/rotate-leaked-api-keys). Per the [API keys docs](https://supabase.com/docs/guides/api/api-keys), legacy anon and service_role keys stay valid until you disable them in the Settings > API Keys section of the Dashboard. After rotating, we suggest updating every server, job and deploy setting that used the old key, or they will start failing.',
        },
      ],
    },
    {
      id: 'logs',
      heading: '3. Check API and auth logs',
      blocks: [
        {
          kind: 'p',
          text: 'Open the Logs Explorer in your project dashboard ([Supabase logging docs](https://supabase.com/docs/guides/telemetry/logs)) and look at the API and Auth logs from the time the key was exposed. We suggest looking for requests you do not recognise, and for reads or writes on tables only your server should touch.',
        },
      ],
    },
    {
      id: 'policies',
      heading: '4. Close open policies',
      blocks: [
        {
          kind: 'p',
          text: 'Read the [Supabase RLS docs](https://supabase.com/docs/guides/database/postgres/row-level-security), then check each public table. Run [rls-open-check](/tools/rls-open-check) on your migration files and read [what we found in real migrations](/guides/supabase-rls-mistakes-in-real-migrations?src=guide) for the common open patterns.',
        },
      ],
    },
    {
      id: 'cleanup',
      heading: '5. Remove the key from git history and frontend bundles',
      blocks: [
        {
          kind: 'ul',
          items: [
            'Git: GitHub documents how to [remove sensitive data from a repository](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository).',
            'Frontend: we suggest removing the key from the source, then rebuilding and redeploying so the new bundle does not contain it.',
          ],
        },
      ],
    },
    {
      id: 'human-check',
      heading: '6. When to ask for a human check',
      blocks: [
        {
          kind: 'p',
          text: 'If a service_role key was exposed and the logs show requests you cannot explain, or you cannot tell whether your policies are open, [ask for a Launch Check](/launch-check?src=guide). We suggest this only as a second pair of eyes: it is a hand check, not an audit.',
        },
      ],
    },
  ],
  faq: [
    {
      q: 'Is the Supabase anon key a secret?',
      a: 'No. The anon (publishable) key is designed for client code. What it can reach depends on your Row Level Security policies, so open policies are the main risk.',
    },
    {
      q: 'What if my service_role key leaked?',
      a: 'A service_role (secret) key bypasses Row Level Security. We suggest rotating it first and then checking your logs.',
    },
    {
      q: 'Does removing the key from git fix the leak?',
      a: 'We suggest treating removal from git as cleanup, not the fix. Rotate the key first, then remove it from history and from deployed frontend bundles.',
    },
  ],
  sources: [
    { label: 'Supabase docs: API keys', href: 'https://supabase.com/docs/guides/api/api-keys' },
    { label: 'Supabase docs: Rotate a leaked or compromised API key', href: 'https://supabase.com/docs/guides/security/rotate-leaked-api-keys' },
    { label: 'Supabase docs: Logging', href: 'https://supabase.com/docs/guides/telemetry/logs' },
    { label: 'Supabase docs: Row Level Security', href: 'https://supabase.com/docs/guides/database/postgres/row-level-security' },
    {
      label: 'GitHub docs: Removing sensitive data from a repository',
      href: 'https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository',
    },
  ],
};

export const ANSWER_PAGES: AnswerPage[] = [certAudit, supabaseRls, riskTier, rlsMigrations, serviceCanInsert, tenantIsolation, leakedKey];

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
  for (const f of page.faq ?? []) parts.push(f.q, f.a);
  parts.push(...page.sources.map((s) => `${s.label} (${s.href})`));
  parts.push(ANSWER_DISCLAIMER);
  return parts.map(stripLinks).join('\n');
}
