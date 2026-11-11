// prisma/seed-safety.ts
// Shared guards for the prisma/seed*.ts scripts.
import { randomBytes } from 'crypto';

// Endpoint of the production database. Never seed it, whatever else the URL says.
const PROD_ENDPOINT = 'ep-dry-dew-a11hidob';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);

/**
 * A seed target is safe when the host is local, or when the host or database
 * name contains "test" or "dev". Only the host and database name are checked,
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
  const dbName = decodeURIComponent(parsed.pathname).toLowerCase();
  if (host.includes(PROD_ENDPOINT) || dbName.includes(PROD_ENDPOINT)) return false;
  if (LOCAL_HOSTS.has(host)) return true;
  return /test|dev/.test(host) || /test|dev/.test(dbName);
}

/** Throws unless DATABASE_URL points at a local, test or dev database. */
export function assertSafeSeedTarget(databaseUrl: string | undefined = process.env.DATABASE_URL): void {
  if (!isSafeSeedTarget(databaseUrl)) {
    throw new Error(
      'Refusing to seed: DATABASE_URL must point at localhost, or its host or database name must contain "test" or "dev".',
    );
  }
}

/** Random URL-safe password, 24 characters. */
export function generateSeedPassword(): string {
  return randomBytes(18).toString('base64url');
}
