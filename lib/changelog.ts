// Source of the /changelog page. Newest day first. Each entry is one line of plain
// language; every part of it links to the merged pull request it describes.
// AG is the Adventurers-Guild repo (guilds.work); RLS is the rls-open-check repo.

export const CHANGELOG_PATH = '/changelog';

export const CHANGELOG_INTRO =
  'What changed on guilds.work and in rls-open-check, newest first. Every line links to the merged change.';

export const CHANGELOG_FOOTER = 'Found something wrong? Open an issue on GitHub; fixes are credited here.';

export type ChangelogRepo = 'AG' | 'RLS';

export interface ChangelogPart {
  text: string;
  repo: ChangelogRepo;
  pr: number;
}

export interface ChangelogEntry {
  parts: ChangelogPart[];
}

export interface ChangelogDay {
  /** ISO date, YYYY-MM-DD. */
  date: string;
  entries: ChangelogEntry[];
}

const REPO_NAME: Record<ChangelogRepo, string> = {
  AG: 'Adventurers-Guild',
  RLS: 'rls-open-check',
};

export function prUrl(part: Pick<ChangelogPart, 'repo' | 'pr'>): string {
  return `https://github.com/LarytheLord/${REPO_NAME[part.repo]}/pull/${part.pr}`;
}

export function prLabel(part: Pick<ChangelogPart, 'repo' | 'pr'>): string {
  return `${part.repo} #${part.pr}`;
}

export function formatChangelogDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export const CHANGELOG: ChangelogDay[] = [
  {
    date: '2026-11-21',
    entries: [
      {
        parts: [
          { text: 'Guide: payment webhook checklist for Razorpay and Stripe', repo: 'AG', pr: 509 },
        ],
      },
      {
        parts: [
          { text: 'Guide: leaked Supabase key, what to do first', repo: 'AG', pr: 507 },
        ],
      },
      {
        parts: [
          { text: 'Sample report now has a dated Checks table', repo: 'AG', pr: 510 },
        ],
      },
      {
        parts: [
          { text: 'rls-open-check: rules R10, R11 and R12 flag policies that pass without checking the row owner', repo: 'RLS', pr: 17 },
        ],
      },
    ],
  },
  {
    date: '2026-11-18',
    entries: [
      {
        parts: [
          { text: 'Guide: agency handover checklist for AI-built apps', repo: 'AG', pr: 506 },
        ],
      },
      {
        parts: [
          { text: 'rls-open-check: each finding links to its rule in the README', repo: 'RLS', pr: 16 },
        ],
      },
    ],
  },
  {
    date: '2026-11-17',
    entries: [
      {
        parts: [
          { text: 'New page /tools/rls-open-check', repo: 'AG', pr: 505 },
        ],
      },
      {
        parts: [
          { text: 'rls-open-check: rls-open-check-ignore comment to suppress a finding', repo: 'RLS', pr: 15 },
          { text: 'contributor guide and issue templates', repo: 'RLS', pr: 14 },
        ],
      },
    ],
  },
  {
    date: '2026-11-16',
    entries: [
      {
        parts: [
          { text: 'Guide: what 126 Supabase migration files taught us about RLS', repo: 'AG', pr: 503 },
        ],
      },
      {
        parts: [
          { text: 'rls-open-check: --strict makes unparseable SQL fail the run', repo: 'RLS', pr: 12 },
          { text: 'terminal demo', repo: 'RLS', pr: 11 },
          { text: 'real example output at the top of the README', repo: 'RLS', pr: 10 },
        ],
      },
    ],
  },
  {
    date: '2026-11-14',
    entries: [
      {
        parts: [
          { text: 'Request a Launch Check form on /audit and /launch-check', repo: 'AG', pr: 494 },
        ],
      },
      {
        parts: [
          { text: 'DPDP readiness check and guide, citing the Act sections and the Rules', repo: 'AG', pr: 481 },
        ],
      },
      {
        parts: [
          { text: 'Partial CERT-In AI audit evidence checklist page', repo: 'AG', pr: 487 },
        ],
      },
      {
        parts: [
          { text: 'Checklist adds entitlement, limit, spend-cap, key and AI behaviour checks', repo: 'AG', pr: 495 },
          { text: 'eight failure classes from real engagements', repo: 'AG', pr: 496 },
        ],
      },
      {
        parts: [
          { text: 'Accessibility fixes on public pages, axe check added to CI', repo: 'AG', pr: 484 },
        ],
      },
      {
        parts: [
          { text: 'rls-open-check: security policy and governance note', repo: 'RLS', pr: 3 },
          { text: 'validation re-run with R1 to R9', repo: 'RLS', pr: 4 },
        ],
      },
    ],
  },
  {
    date: '2026-11-13',
    entries: [
      {
        parts: [
          { text: 'rls-open-check moved to its own repo', repo: 'AG', pr: 488 },
          { text: 'rules R8, R9 and INSERT coverage for R3', repo: 'RLS', pr: 2 },
        ],
      },
      {
        parts: [
          { text: '/guides index of every guide and free tool', repo: 'AG', pr: 489 },
        ],
      },
      {
        parts: [
          { text: '/indic-ai-qa: Hindi, Gujarati and Hinglish AI checks', repo: 'AG', pr: 483 },
        ],
      },
      {
        parts: [
          { text: 'Open Graph images for public pages', repo: 'AG', pr: 491 },
          { text: 'faster header and footer', repo: 'AG', pr: 490 },
        ],
      },
      {
        parts: [
          { text: 'Home page puts Launch Check first', repo: 'AG', pr: 493 },
        ],
      },
    ],
  },
  {
    date: '2026-11-12',
    entries: [
      {
        parts: [
          { text: '/launch-check: 20-question self-assessment for AI-built apps', repo: 'AG', pr: 478 },
        ],
      },
      {
        parts: [
          { text: '/audit/sample-report: sample Launch Check report on a fictional app', repo: 'AG', pr: 482 },
        ],
      },
      {
        parts: [
          { text: 'rls-open-check first public release: static RLS policy linter for Supabase migrations, rules R1 to R7, SARIF output', repo: 'AG', pr: 467 },
        ],
      },
    ],
  },
  {
    date: '2026-11-11',
    entries: [
      {
        parts: [
          { text: 'The offer is renamed from Production Check to Launch Check', repo: 'AG', pr: 475 },
        ],
      },
    ],
  },
  {
    date: '2026-11-10',
    entries: [
      {
        parts: [
          { text: 'Three short answer pages under /guides', repo: 'AG', pr: 472 },
        ],
      },
      {
        parts: [
          { text: 'rls-open-check rule R7, SARIF output and a CI workflow', repo: 'AG', pr: 471 },
        ],
      },
    ],
  },
  {
    date: '2026-11-09',
    entries: [
      {
        parts: [
          { text: 'SEO and AEO pass: sitemap, robots, llms.txt, structured data, page metadata', repo: 'AG', pr: 466 },
        ],
      },
    ],
  },
];
