# Database Safety Rules

> **Why this exists:** On 2026-07-09, `prisma migrate dev` was run with
> `DATABASE_URL` pointing at the production database. Prisma detected schema
> drift and **reset the database — all production data was dropped.** The
> point-in-time-restore window (6h) had passed before anyone noticed.
> These rules make that mistake impossible to repeat.

## The Golden Rules

1. **Local `DATABASE_URL` always points at the Neon `development` branch — never production.**
2. **`prisma migrate dev`, `prisma db push`, `prisma migrate reset`, and seeding run ONLY against the development branch.** The `db:*` npm scripts enforce this via `scripts/db-guard.js`.
3. **Production schema changes ship exclusively through CI**: merge a PR containing the migration → `.github/workflows/db-migrate-deploy.yml` runs `prisma migrate deploy` (which applies committed migrations and **never resets data**), taking an encrypted backup first.
4. **Migrations must be additive**: no `DROP TABLE`, no `DROP COLUMN`, no type-narrowing on live tables without an explicit team discussion and a fresh backup.
5. **Never paste the production connection string into a local `.env`,** a script, or a chat. It lives in exactly two places: Vercel env vars (runtime) and GitHub Actions secrets (CI).

## Environments

| Environment | Neon branch | Who uses it | Schema changes via |
|---|---|---|---|
| Production | `production` (default) | Vercel runtime, CI | `prisma migrate deploy` (CI only) |
| Development | `development` | Local dev, `prisma migrate dev` | freely |

To refresh the development branch with current prod data/schema: Neon Console → branches → `development` → "Reset from parent".

## Backups

- **Nightly**: `.github/workflows/db-backup.yml` takes an encrypted `pg_dump` at 03:00 IST, stored as a GitHub Actions artifact for 30 days.
- **Pre-migration**: `db-migrate-deploy.yml` dumps prod before applying any migration.
- Artifacts are AES-256 encrypted (`BACKUP_PASSPHRASE` secret) because artifacts on a public repo are downloadable.

### Restore procedure

```bash
# 1. Download the artifact from the Actions run, then:
openssl enc -d -aes-256-cbc -pbkdf2 -in backup.dump.enc -out backup.dump -pass pass:<BACKUP_PASSPHRASE>

# 2. Restore into a FRESH Neon branch first — verify before touching production:
pg_restore --no-owner --no-privileges -d "<branch-connection-string>" backup.dump
```

## Required GitHub secrets

| Secret | Purpose |
|---|---|
| `PROD_DATABASE_URL_UNPOOLED` | pg_dump + migrate deploy (direct connection) |
| `PROD_DATABASE_URL` | reserved for tooling needing the pooled URL |
| `BACKUP_PASSPHRASE` | encrypts/decrypts backup artifacts |

## If you think you just broke production

1. **Stop. Do not run anything else.** Every write shrinks the restore window.
2. Neon Console → project → **Restore** → pick a timestamp *before* the incident (works only within the history-retention window — act within minutes, not hours).
3. Otherwise, restore last night's backup artifact (procedure above).
4. Tell the team immediately. Speed matters more than blame.
