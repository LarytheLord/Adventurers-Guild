#!/usr/bin/env node
/**
 * Blocks destructive Prisma commands from running against the production database.
 *
 * Production schema changes must go through CI (`prisma migrate deploy` in
 * .github/workflows/db-migrate-deploy.yml). Local development uses the Neon
 * "development" branch. See docs/DATABASE_SAFETY.md.
 *
 * Set SEED_BLOCKED_HOSTS to a comma-separated list of host fragments that must
 * never be targeted (for example the production endpoint id). It can live in .env.
 */
require("dotenv/config");

const blocked = (process.env.SEED_BLOCKED_HOSTS || "")
  .split(",")
  .map((h) => h.trim().toLowerCase())
  .filter(Boolean);

if (blocked.length === 0) {
  console.warn("db-guard: SEED_BLOCKED_HOSTS is empty, so no hosts are blocked by name. Set it in .env (see docs/DATABASE_SAFETY.md).");
}

const urls = [
  process.env.DATABASE_URL,
  process.env.DATABASE_URL_UNPOOLED,
  process.env.DIRECT_URL,
].filter(Boolean);

const offending = urls.find((u) => blocked.some((b) => u.toLowerCase().includes(b)));

if (offending) {
  console.error("");
  console.error("BLOCKED: your DATABASE_URL points at a blocked (production) database.");
  console.error("");
  console.error("   `prisma migrate dev`, `db push`, `migrate reset`, and `db seed`");
  console.error("   must never run against production.");
  console.error("");
  console.error("   - Local dev: point DATABASE_URL at the Neon 'development' branch.");
  console.error("   - Prod schema changes: merge a migration to main; CI runs");
  console.error("     `prisma migrate deploy` (which never resets data).");
  console.error("");
  console.error("   See docs/DATABASE_SAFETY.md");
  console.error("");
  process.exit(1);
}
