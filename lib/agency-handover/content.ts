// Handover checklist for agencies and freelancers who ship apps built with Lovable, Bolt,
// Cursor or v0. Every item is one line plus one line on how to check it. No statistics.
// Inline links use the form [label](href). Keep everything ASCII.

import { SITE_URL } from '@/lib/site-metadata';

export const HANDOVER_PATH = '/guides/agency-handover-checklist-ai-built-apps';
export const HANDOVER_MARKDOWN_PATH = '/agency-handover-checklist.md';
export const HANDOVER_PUBLISHED = '2026-11-17';
export const HANDOVER_TITLE = 'Handover checklist for apps built with Lovable, Bolt, Cursor or v0';
export const HANDOVER_DESCRIPTION =
  'A checklist for agencies and freelancers handing over an AI-built app: database access rules, keys and secrets, payments, auth, privacy basics for India, and who owns what. Each item has one line on how to check it.';
export const HANDOVER_DISCLAIMER =
  'This checklist is unofficial. It is not an audit and not legal advice. Run every check on your own project or your client\'s project, with their permission.';
export const HANDOVER_CTA_TEXT = 'Want a second pair of eyes before handover?';
export const HANDOVER_CTA_HREF = '/launch-check?src=agency';

export interface HandoverItem {
  /** One line: what must be true. */
  item: string;
  /** One line: how to check it. */
  check: string;
}

export interface HandoverSection {
  id: string;
  heading: string;
  intro: string;
  items: HandoverItem[];
}

export const HANDOVER_SECTIONS: HandoverSection[] = [
  {
    id: 'database-access',
    heading: '1. Database access rules (Supabase RLS)',
    intro:
      'Apps built with Lovable, Bolt, Cursor or v0 often get tables first and policies later, or never. Row Level Security (RLS) is what stops one user reading another user\'s rows.',
    items: [
      {
        item: 'RLS is enabled on every table in the public schema.',
        check:
          'In the Supabase SQL editor run: select tablename, rowsecurity from pg_tables where schemaname = \'public\'; every row should say true.',
      },
      {
        item: 'No policy on a table with user data uses true as its condition for anon or authenticated.',
        check: 'In the Supabase Authentication section, open the policies list and read each USING and WITH CHECK expression for a bare true.',
      },
      {
        item: 'Tables owned by a user filter on auth.uid() for read, update and delete.',
        check: 'Sign in as two test users and confirm user B cannot read or change user A\'s rows through the API.',
      },
      {
        item: 'Views and security-definer functions do not return rows that RLS would block.',
        check: 'List views in the SQL editor. For each one that reads user data, confirm it uses security_invoker = true (Postgres 15 or newer) or is not exposed through the API. Do the same for functions declared security definer.',
      },
      {
        item: 'Storage buckets are private unless a file is meant to be public.',
        check: 'In Storage, check each bucket\'s visibility and read its policies.',
      },
      {
        item: 'The migration files pass a static RLS check.',
        check:
          'Run [rls-open-check](/tools/rls-open-check) on the migrations folder. A clean result does not prove the app is safe, so still do the checks above.',
      },
    ],
  },
  {
    id: 'keys-and-secrets',
    heading: '2. Keys and secrets (which keys may be public)',
    intro:
      'May be in browser code: the Supabase anon or publishable key (safe only with RLS on), the Stripe publishable key (starts pk_), the Razorpay key id. Must never be in browser code or the repo: the Supabase service_role key, Stripe secret and restricted keys (sk_, rk_), the Razorpay key secret, webhook signing secrets, database connection strings and AI model API keys.',
    items: [
      {
        item: 'No secret key appears in the code the browser downloads.',
        check:
          'Open the live site, search the loaded JavaScript in dev tools for service_role, sk_, rk_ and your key secret names. Next.js only ships variables that start with NEXT_PUBLIC_, Vite only VITE_.',
      },
      {
        item: 'No secret was ever committed to git, including old commits.',
        check: 'Run a secret scanner such as gitleaks over the full history. Rotate anything it finds; deleting the file is not enough.',
      },
      {
        item: 'Keys that were pasted into a chat, a ticket or a screenshot are rotated.',
        check: 'List every key you shared that way and confirm each has been regenerated and the old one revoked.',
      },
      {
        item: '.env files are git-ignored and .env.example holds placeholders only.',
        check: 'Run git ls-files | grep -i env and open .env.example to confirm there are no real values.',
      },
      {
        item: 'Test keys and live keys are kept apart per environment.',
        check: 'Compare the variables on the preview and production deployments; production must not hold test keys and the reverse.',
      },
    ],
  },
  {
    id: 'payments',
    heading: '3. Payments',
    intro: 'These are the handover essentials for payments.',
    items: [
      {
        item: 'The webhook endpoint verifies the provider signature before it acts.',
        check: 'In test mode send a request to the endpoint with a wrong or missing signature; it must be rejected.',
      },
      {
        item: 'The server decides the amount and currency, not the browser.',
        check: 'Edit the price in the checkout request from dev tools; the payment must still use the server-side price.',
      },
      {
        item: 'A repeated webhook event does not grant access or credit twice.',
        check: 'Resend the same test event from the provider dashboard and confirm nothing changes the second time.',
      },
      {
        item: 'The provider account and payouts belong to the client, not the agency.',
        check: 'Open the provider dashboard and confirm the client is the account owner and the settlement bank account is theirs.',
      },
      {
        item: 'Live mode has been tested with a real small payment and a refund.',
        check: 'Make one small live payment, confirm the app unlocks, then refund it and confirm the app reacts.',
      },
    ],
  },
  {
    id: 'auth',
    heading: '4. Auth',
    intro: 'Auth screens in apps built with Lovable, Bolt, Cursor or v0 usually look finished while skipping the settings behind them.',
    items: [
      {
        item: 'Email confirmation is required before an account can use the app.',
        check:
          'Sign up with a new address in a private window and try to open a protected page before clicking the link. In Supabase, look for the email confirmation setting in the Authentication section.',
      },
      {
        item: 'Password reset links work once, expire, and do not reveal whether an email is registered.',
        check: 'Use one reset link twice, and request a reset for an unknown address; the message should match the known-address case.',
      },
      {
        item: 'Sessions expire and logging out really ends the session.',
        check: 'Read the session and JWT expiry settings in Supabase, then log out and try to reuse the old token against the API.',
      },
      {
        item: 'Site URL and redirect URLs point at the production domain, not localhost.',
        check: 'In the Supabase Authentication section, find the Site URL and redirect URL settings and read the list.',
      },
      {
        item: 'Admin pages and admin API routes check the role on the server.',
        check: 'Call an admin route while signed in as a normal user; it must return an error, not data.',
      },
    ],
  },
  {
    id: 'privacy-india',
    heading: '5. Privacy basics for India (DPDP)',
    intro:
      'If the app processes digital personal data of people in India, the Digital Personal Data Protection Act 2023 and the DPDP Rules 2025 may apply to you, and some Rules start on later dates. Read [what startups must do under the DPDP Rules](/guides/dpdp-rules-what-startups-must-do) for the detail. This section is a basic hygiene list, not legal advice.',
    items: [
      {
        item: 'Users see a plain-language notice of what personal data is collected and why, before they give it.',
        check: 'Walk through sign-up as a new user and read what is shown before the first data field.',
      },
      {
        item: 'A user can withdraw consent and ask for their account and data to be deleted.',
        check: 'Try it end to end with a test account and confirm the data is gone from the database, and that your privacy page says how long backups keep it.',
      },
      {
        item: 'The app collects only the fields it needs.',
        check: 'List every form field and database column holding personal data and ask what each one is used for.',
      },
      {
        item: 'There is a written list of services that receive user data (hosting, analytics, email, payments, AI model APIs).',
        check: 'Check each third-party script and API key in the code and add it to the list with its purpose.',
      },
      {
        item: 'A privacy policy page exists and matches what the app actually does.',
        check: 'Compare the policy text with the data list above and fix any gap.',
      },
      {
        item: 'A named person receives privacy and deletion requests and knows what to do after a data leak.',
        check: 'Ask the client who that is and confirm the contact email on the privacy page reaches them.',
      },
    ],
  },
  {
    id: 'handover-items',
    heading: '6. Handover items (accounts, env vars, backups)',
    intro: 'Most handover problems are not code problems. They are about who can log in to what.',
    items: [
      {
        item: 'The client owns every account: domain registrar, hosting, database, payments, email sender, analytics and the code repository.',
        check: 'Open each dashboard and confirm the client is Owner; the agency should be a removable member, not the owner.',
      },
      {
        item: 'The code is in a repository the client owns and builds from a clean clone.',
        check: 'Have the client clone it, install, and run the build with no help. Export or connect the Lovable, Bolt or v0 project to that repository.',
      },
      {
        item: 'Every environment variable is listed in .env.example with what it is, where to get it and who owns it.',
        check: 'Compare the variable names in the hosting dashboard with .env.example; neither list should have extras.',
      },
      {
        item: 'Database backups are on, and a restore has been tried.',
        check: 'Check the backup settings for your Supabase plan, then restore a backup into a separate scratch project, never into production.',
      },
      {
        item: 'Domain renewal and DNS are in the client\'s name, with expiry emails going to the client.',
        check: 'Read the registrar account contact email and the auto-renew setting.',
      },
      {
        item: 'Error and uptime alerts go to the client or their chosen person.',
        check: 'Trigger a test alert and confirm who receives it.',
      },
      {
        item: 'Known issues and unfinished work are written down.',
        check: 'Open the handover note and confirm it lists them, so the client does not find them first.',
      },
      {
        item: 'After handover the agency\'s access is removed and any shared passwords or keys are rotated.',
        check: 'Review each dashboard\'s member list the week after handover and confirm the agency is gone.',
      },
    ],
  },
];

/** [label](href) -> label, for plain text. */
export function stripLinks(text: string): string {
  return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1');
}

/** Every visible string, with links left in [label](href) form so tests can see the targets. */
export function handoverPlainText(): string {
  return [
    HANDOVER_TITLE,
    HANDOVER_DESCRIPTION,
    HANDOVER_DISCLAIMER,
    ...HANDOVER_SECTIONS.flatMap((s) => [s.heading, s.intro, ...s.items.flatMap((i) => [i.item, i.check])]),
    HANDOVER_CTA_TEXT,
    HANDOVER_CTA_HREF,
  ].join('\n');
}

function absolutizeLinks(text: string): string {
  return text.replace(/\]\((\/[^)]*)\)/g, (_m, p: string) => `](${SITE_URL}${p})`);
}

/** The downloadable checklist. public/agency-handover-checklist.md must equal this output. */
export function handoverMarkdown(): string {
  const lines: string[] = [
    `# ${HANDOVER_TITLE}`,
    '',
    HANDOVER_DISCLAIMER,
    '',
    `Online version: ${SITE_URL}${HANDOVER_PATH}`,
    '',
  ];
  for (const s of HANDOVER_SECTIONS) {
    lines.push(`## ${s.heading}`, '', absolutizeLinks(s.intro), '');
    for (const i of s.items) {
      lines.push(`- [ ] ${absolutizeLinks(i.item)}`, `  - How to check: ${absolutizeLinks(i.check)}`);
    }
    lines.push('');
  }
  lines.push(`## ${HANDOVER_CTA_TEXT}`, '', `[Run the launch check](${SITE_URL}${HANDOVER_CTA_HREF})`, '');
  return lines.join('\n');
}
