# Show HN draft: rls-open-check

Status: draft for the founder to review. Nothing here has been posted.

## Before posting (checklist)

- [ ] Publish 0.1.0 to npm (name `rls-open-check` returned E404 on 2026-11-10,
      so it looked free; a 404 does not reserve it, so check again right
      before publishing). If it is taken, use `@guilds-work/rls-open-check`
      and update the commands below.
- [ ] Check that `npx rls-open-check` works from a clean machine.
- [ ] Try the SARIF upload once on a scratch repo. The tests check the SARIF
      structure, but an upload to GitHub has not been tried yet.
- [ ] Read the Supabase changelog page linked in the README yourself before
      anyone states a date about Supabase's Data API defaults.
- [x] Repo link: the tool lives in its own repo, `https://github.com/LarytheLord/rls-open-check`.
- [ ] Confirm the "Why we built it" paragraph is true in your words (it was
      drafted without knowing your real motivation, including whether Guild
      runs its own migrations through this tool).
- [ ] Do not describe Guild as an auditor or certifier of any kind.

## Title

Show HN: rls-open-check, a static linter for risky Supabase RLS policies

Alternative:

Show HN: A CLI that flags open Row Level Security policies in SQL migrations

## URL

https://github.com/LarytheLord/rls-open-check

## First comment

I built rls-open-check, a small command line tool that reads Supabase/Postgres
migration files and flags Row Level Security setups that let the wrong people
read or write data.

Try it from a project root:

    npx rls-open-check

Or from source (Node 18 or newer):

    git clone https://github.com/LarytheLord/rls-open-check.git
    cd rls-open-check
    npm ci
    npm run build
    node dist/bin.js path/to/your/supabase/migrations

Source and issues: https://github.com/LarytheLord/rls-open-check

It scans supabase/migrations, prints findings with a one-line fix hint, and
exits 1 on high or critical findings, so it can run in CI. It can also write
SARIF for GitHub code scanning (--format sarif) or JSON (--json).

What it checks (seven rules):

- R1: a table in public that never gets RLS enabled
- R2: a policy with an always-true condition (for example USING (true)) for
  anon or public
- R3: an authenticated policy with USING (true) on update/delete, so any
  logged-in user can change any row
- R4: a grant to anon on a table without RLS
- R5: a SECURITY DEFINER function in public with no SET search_path
- R6: RLS disabled on a table and never enabled again
- R7: grants of select/insert/update/delete to anon or authenticated where RLS
  is off or no policy covers that command

It parses SQL with the real Postgres parser (libpg-query) and applies
migrations in file name order, so a later DROP POLICY, REVOKE or ENABLE ROW
LEVEL SECURITY clears an earlier finding. It makes no network calls and does
not connect to a database.

What it does not do:

- It only reads your migration files. It cannot see changes made in the
  Supabase dashboard or SQL editor, so if your live database differs from your
  files, it does not know.
- It does not judge policy logic. A policy like USING (user_id IS NOT NULL)
  passes, and so does one that checks the wrong column.
- It does not check Storage buckets, Edge Functions, views, FORCE ROW LEVEL
  SECURITY, column privileges, or how your front end uses keys.
- A clean result is not proof that your app is safe. It is a linter for a short
  list of common mistakes, not a security review.

Why we built it: we build Guild (guilds.work) on Postgres and wanted a
check we could run on our own migrations in CI. A common failure is a table
with RLS on and a policy added just to make an error go away, which leaves the
table open to anyone with the public API key. We wanted a small
check that runs offline on the migration files and also reads grants, so we
wrote one and put it under MIT.

It is version 0.1.0 and I expect false positives and gaps. Bug reports with a
minimal SQL snippet are the most useful feedback. I would also like to know
which rules you think are missing or too noisy.
