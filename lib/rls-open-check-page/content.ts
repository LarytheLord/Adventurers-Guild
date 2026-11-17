// Copy for /tools/rls-open-check. Every fact here comes from the public repo
// https://github.com/LarytheLord/rls-open-check: README.md and docs/VALIDATION.md. Do not add
// a claim that is not in one of those two files. Keep everything ASCII.

export const RLS_REPO_URL = 'https://github.com/LarytheLord/rls-open-check';
export const RLS_DEMO_GIF_URL = 'https://raw.githubusercontent.com/LarytheLord/rls-open-check/main/docs/demo.gif';
export const RLS_DEMO_GIF_ALT =
  'rls-open-check flags an open read policy and a table without RLS, then exits 1';
export const RLS_PUBLISHED = '2026-11-17';
export const RLS_UPDATED_LABEL = '17 November 2026';

/** Internal links carry ?src=guide. The GitHub link does not. */
export const RLS_GUIDE_PATH = '/guides/supabase-rls-mistakes-in-real-migrations';
export const RLS_LAUNCH_CHECK_PATH = '/launch-check';
export const SRC_GUIDE = '?src=guide';

export const RLS_PATH = '/tools/rls-open-check';
export const RLS_TITLE = 'rls-open-check: a free linter for Supabase migration files';
export const RLS_DESCRIPTION =
  'rls-open-check is a free, MIT-licensed linter that reads Supabase or Postgres migration files and flags Row Level Security setups that let the wrong people read or write your data. Static, with no network calls.';

export const RLS_ANSWER =
  'rls-open-check is a free, MIT-licensed command line linter for Supabase and Postgres SQL migration files. It reads your files and flags Row Level Security (RLS) setups that let the wrong people read or write your data, such as a policy with USING (true). It is a static check: it runs on your files, makes no network calls and needs no database connection. It checks nine rules, R1 to R9, listed in the table below.';

export const RLS_RULES_HEAD = ['Id', 'Severity', 'What it flags'];

// Wording follows the "What it checks" table in the README.
export const RLS_RULES: string[][] = [
  ['R1', 'critical', 'A table in the public schema that never gets ENABLE ROW LEVEL SECURITY'],
  [
    'R2',
    'critical (INSERT, UPDATE, DELETE, ALL) or high (SELECT)',
    'A policy with USING (true) or WITH CHECK (true) for anon or public. A policy with no TO clause counts as public',
  ],
  [
    'R3',
    'high',
    'A policy for authenticated with USING (true) on UPDATE, DELETE or ALL, or WITH CHECK (true) on INSERT, UPDATE or ALL: any logged-in user can change or add anyone\'s rows',
  ],
  ['R4', 'high', 'GRANT ... TO anon on a table that has no RLS'],
  ['R5', 'medium', 'A SECURITY DEFINER function in public with no SET search_path'],
  ['R6', 'critical', 'DISABLE ROW LEVEL SECURITY on a table and no later ENABLE'],
  [
    'R7',
    'high (RLS off) or low (RLS on)',
    'A public table with GRANT SELECT, INSERT, UPDATE or DELETE to anon or authenticated, where RLS is off or no policy covers that command for that role',
  ],
  [
    'R8',
    'high',
    'A policy whose USING or WITH CHECK reads user_metadata or raw_user_meta_data. Users can edit their own user_metadata, so they can pass the check',
  ],
  [
    'R9',
    'medium',
    'A SECURITY DEFINER function in public that anon or authenticated can run: GRANT EXECUTE to either role or PUBLIC, or no REVOKE EXECUTE ... FROM PUBLIC',
  ],
];

// Quick start, as in the README.
export const RLS_BUILD_STEPS = `git clone https://github.com/LarytheLord/rls-open-check.git
cd rls-open-check
npm ci
npm run build
node dist/bin.js path/to/supabase/migrations`;

export const RLS_NODE_NOTE = 'Needs Node 18 or newer.';
export const RLS_NPM_NOTE =
  'It is not on npm yet, so npx rls-open-check does not work today. The README says it will once the package is published.';
export const RLS_EXIT_NOTE =
  'It exits 1 if it finds anything high or critical. No config, no database connection, no network calls.';

export const RLS_CI_OPTIONS_URL = `${RLS_REPO_URL}#options`;
export const RLS_CI_SARIF_URL = `${RLS_REPO_URL}#sarif-and-github-code-scanning`;
export const RLS_CI_ACTION_URL = `${RLS_REPO_URL}#github-action`;

export const RLS_VALIDATION_URL = `${RLS_REPO_URL}/blob/main/docs/VALIDATION.md`;

export const RLS_LIMITS_LINE = 'A clean result is not proof of safety.';

/** Numbers as written in docs/VALIDATION.md (re-run of 14 November 2026, rules R1 to R9). */
export const RLS_VALIDATION = {
  files: 126,
  findings: 137,
  readByHand: 19,
  truePositive: 17,
  unclear: 2,
  falsePositive: 0,
};

export const RLS_TOOL = {
  path: RLS_PATH,
  title: RLS_TITLE,
  description: RLS_DESCRIPTION,
  answer: RLS_ANSWER,
  rules: RLS_RULES,
  validation: RLS_VALIDATION,
};
