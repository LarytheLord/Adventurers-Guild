#!/usr/bin/env node
/**
 * Blocks destructive Prisma commands from running against the production database.
 *
 * Production schema changes must go through CI (`prisma migrate deploy` in
 * .github/workflows/db-migrate-deploy.yml). Local development uses the Neon
 * "development" branch. See docs/DATABASE_SAFETY.md.
 */
const PROD_ENDPOINT = "ep-dry-dew-a11hidob";

const urls = [
  process.env.DATABASE_URL,
  process.env.DATABASE_URL_UNPOOLED,
  process.env.DIRECT_URL,
].filter(Boolean);

const offending = urls.find((u) => u.includes(PROD_ENDPOINT));

if (offending) {
  console.error("");
  console.error("🚫 BLOCKED: your DATABASE_URL points at the PRODUCTION database.");
  console.error("");
  console.error("   `prisma migrate dev`, `db push`, `migrate reset`, and `db seed`");
  console.error("   must NEVER run against production. On 2026-07-09 this exact");
  console.error("   mistake wiped all production data.");
  console.error("");
  console.error("   → Local dev: point DATABASE_URL at the Neon 'development' branch.");
  console.error("   → Prod schema changes: merge a migration to main; CI runs");
  console.error("     `prisma migrate deploy` (which never resets data).");
  console.error("");
  console.error("   See docs/DATABASE_SAFETY.md");
  console.error("");
  process.exit(1);
}
