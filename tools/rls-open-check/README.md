# rls-open-check

A free command line tool that reads your Supabase or Postgres SQL migration
files and flags Row Level Security (RLS) setups that let the wrong people read
or write your data.

It is made for apps built with AI app builders such as Lovable, Bolt and v0.
These tools often create tables with RLS turned on, then add a policy like
`USING (true)` to make an error go away. That policy lets anyone on the
internet with your public API key read or change every row.

Static check only. It runs on your files. It makes no network calls and needs
no database connection.

## Quick start

```
npx rls-open-check
```

With no arguments it scans `supabase/migrations`. You can pass files or
directories:

```
npx rls-open-check supabase/migrations
npx rls-open-check db/schema.sql
```

Example output:

```
supabase/migrations/20240101000000_init.sql:4  [critical] R2  public.orders.orders open
    Policy "orders open" on public.orders allows ALL for public with a condition that is always true, so anyone with the public API key gets access.
    Fix: Replace true with a real check such as auth.uid() = user_id, or change the role to authenticated.
```

## What it checks

Each finding has a rule id, a severity and a one-line fix hint.

| Id | Severity | What it flags | Fix hint |
|----|----------|---------------|----------|
| R1 | critical | A table in the `public` schema that never gets `ENABLE ROW LEVEL SECURITY` | Enable RLS and add policies |
| R2 | critical (INSERT, UPDATE, DELETE, ALL) or high (SELECT) | A policy with `USING (true)` or `WITH CHECK (true)` for `anon` or `public`. A policy with no `TO` clause counts as `public` | Use a real condition such as `auth.uid() = user_id` |
| R3 | high | A policy for `authenticated` with `USING (true)` on UPDATE, DELETE or ALL: any logged-in user can change anyone's rows | Limit rows to their owner |
| R4 | high | `GRANT ... TO anon` on a table that has no RLS | Enable RLS or `REVOKE` the grant |
| R5 | medium | A `SECURITY DEFINER` function in `public` with no `SET search_path` | Add `SET search_path = ''` |
| R6 | critical | `DISABLE ROW LEVEL SECURITY` on a table and no later `ENABLE` | Enable RLS again |

Details:

- **Migrations are applied in order.** Files are read in file name order (the
  timestamp prefix), like Supabase does. A later `DROP POLICY`, `ALTER POLICY`,
  `DROP TABLE`, `REVOKE`, `ENABLE ROW LEVEL SECURITY`, `CREATE OR REPLACE
  FUNCTION` or `ALTER FUNCTION ... SET search_path` removes an earlier finding.
- **Real parser.** SQL is parsed with the Postgres parser (`libpg-query`), not
  with regular expressions. Comments, quoting and dollar quoting are handled.
- **What counts as "always true".** `true`, `(true)`, `true::boolean`, `1 = 1`,
  and `OR` expressions that contain one of these.
- **Restrictive policies** (`AS RESTRICTIVE`) are skipped, because they only
  narrow access.
- **Policies on a table with RLS off** are not reported as R2 or R3. R1 or R6
  already covers that table.
- **R4 also looks at** `GRANT ... ON ALL TABLES IN SCHEMA` and
  `ALTER DEFAULT PRIVILEGES ... GRANT ... TO anon`. `PUBLIC` counts like `anon`.
- A statement that does not parse is skipped with a warning. The rest of the
  file is still checked.

## What it does NOT check

- **It is static.** It cannot see changes made in the Supabase dashboard, in the
  SQL editor, or by other tools. If your live database differs from your
  migration files, this tool does not know.
- **A clean result is not proof of safety.** It finds a short list of common
  mistakes. It does not understand what your policies mean.
- It does not judge policy logic. `USING (user_id IS NOT NULL)` or a policy that
  checks the wrong column passes.
- It does not check Storage bucket settings, Edge Functions, API keys in your
  front end, views (views run with the owner's rights unless
  `security_invoker` is set), or `service_role` use.
- It does not check `FORCE ROW LEVEL SECURITY`, column privileges, or roles
  other than `anon`, `public` and `authenticated`.
- It does not connect to a database. To check the live state, query
  `pg_policies` and `pg_class.relrowsecurity` on the real project.

## Options

```
rls-open-check [options] [paths...]

  --fail-on <level>  Exit 1 if a finding is at or above this level:
                     low, medium, high, critical (default: high)
  --json             Print JSON instead of text
  -h, --help
  -v, --version
```

Exit codes: `0` no finding at or above `--fail-on`, `1` at least one, `2` usage
error or no files found. Parse warnings do not change the exit code.

JSON output has `findings` (each with `rule`, `severity`, `object`, `file`,
`line`, `message`, `fix`), `summary` (counts by severity), `warnings` and
`filesScanned`.

## CI usage

GitHub Actions. This fails the pull request when a finding is high or critical:

```yaml
name: rls-check
on:
  pull_request:
    paths:
      - "supabase/migrations/**"

jobs:
  rls-open-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
      - run: npx rls-open-check supabase/migrations --fail-on high
```

Pin a version for repeatable builds, for example `npx rls-open-check@0.1.0`.
To see everything but never fail the build, add `|| true` to the command.

## Install

No install is needed with `npx`. To add it to a project:

```
npm install --save-dev rls-open-check
```

Requires Node 18 or newer.

## Develop

```
npm install
npm test        # vitest
npm run build   # compiles to dist/
```

Test fixtures are in `tests/fixtures`. Each rule has bad and good migrations,
and there are cases for migration order.

## License

MIT. Author: Guild (guilds.work).
