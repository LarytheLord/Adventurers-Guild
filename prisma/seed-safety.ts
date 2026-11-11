// prisma/seed-safety.ts
// Shared guards for the prisma/seed*.ts scripts.
import 'dotenv/config';
import { randomBytes } from 'crypto';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);

// "dev" or "test" as a whole word, delimited by - _ . or the string edge.
const DEV_OR_TEST = /(^|[-_.])(dev|test)([-_.]|$)/;

/** Hosts that must never be seeded: comma-separated SEED_BLOCKED_HOSTS, matched as substrings. */
function blockedHosts(): string[] {
  return (process.env.SEED_BLOCKED_HOSTS ?? '')
    .split(',')
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * A seed target is safe when the host is local, or when the host or database
 * name contains "test" or "dev" as a whole word (for example guild-dev, but not
 * devops-prod). Only the host and database name are checked,
 * so credentials such as "devuser" cannot make a remote database look safe.
 */
export function isSafeSeedTarget(databaseUrl: string | undefined): boolean {
  if (!databaseUrl) return false;
  let parsed: URL;
  try {
    parsed = new URL(databaseUrl);
  } catch {
    return false;
  }
  const host = parsed.hostname.toLowerCase();
  const dbName = decodeURIComponent(parsed.pathname).replace(/^\//, '').toLowerCase();
  if (blockedHosts().some((b) => host.includes(b))) return false;
  if (LOCAL_HOSTS.has(host)) return true;
  return DEV_OR_TEST.test(host) || DEV_OR_TEST.test(dbName);
}

/** Throws unless DATABASE_URL points at a local, test or dev database. */
export function assertSafeSeedTarget(databaseUrl: string | undefined = process.env.DATABASE_URL): void {
  if (!isSafeSeedTarget(databaseUrl)) {
    throw new Error(
      'Refusing to seed: DATABASE_URL must point at localhost, or its host or database name must contain "test" or "dev" as a whole word.',
    );
  }
}

/** Random URL-safe password, 24 characters. */
export function generateSeedPassword(): string {
  return randomBytes(18).toString('base64url');
}
