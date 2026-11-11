# Changelog

All notable changes to rls-open-check are listed here. The format follows
Keep a Changelog, and the project uses Semantic Versioning.

## [0.1.0] - Unreleased

First public version. Not yet published to npm.

### Added

- Command line tool that reads Supabase and Postgres SQL migration files with
  the Postgres parser (`libpg-query`) and applies them in file name order.
- Rule R1: table in `public` that never gets `ENABLE ROW LEVEL SECURITY`.
- Rule R2: policy with an always true condition for `anon` or `public`.
- Rule R3: policy for `authenticated` that lets any logged-in user update or
  delete any row.
- Rule R4: `GRANT` to `anon` on a table without RLS, including
  `GRANT ... ON ALL TABLES IN SCHEMA` and `ALTER DEFAULT PRIVILEGES`.
- Rule R5: `SECURITY DEFINER` function in `public` without `SET search_path`.
- Rule R6: `DISABLE ROW LEVEL SECURITY` with no later `ENABLE`.
- Rule R7: grant of `SELECT`, `INSERT`, `UPDATE` or `DELETE` to `anon` or
  `authenticated` where RLS is off, or no policy covers that command for that
  role.
- Output formats: text (default), `--format json` (and `--json`), and
  `--format sarif` (SARIF 2.1.0) for GitHub code scanning.
- `--fail-on <low|medium|high|critical>` for CI. Exit codes: 0 ok, 1 findings
  at or above the level, 2 usage or file error.
- No network calls and no database connection.

### Fixed

- `REVOKE` statements were read as grants because the parser omits `is_grant`
  for them, so a `REVOKE` never removed an earlier grant. They are now handled
  correctly.

### Known limits

- Static check of migration files only. It cannot see changes made in the
  dashboard or SQL editor.
- `SET search_path` and `DO $$ ... EXECUTE` blocks are not tracked. This can
  cause false R1 findings, and tables created inside `EXECUTE` are not checked.
- SARIF paths outside the git root are written as absolute `file:///` URIs.
- It does not judge policy logic, and a clean result is not proof of safety.
  See "Limits" in the README.
