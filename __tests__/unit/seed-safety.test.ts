import { execFileSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  assertSafeSeedTarget,
  isSafeSeedTarget,
  generateSeedPassword,
} from '../../prisma/seed-safety';

const savedBlocked = process.env.SEED_BLOCKED_HOSTS;
afterEach(() => {
  if (savedBlocked === undefined) delete process.env.SEED_BLOCKED_HOSTS;
  else process.env.SEED_BLOCKED_HOSTS = savedBlocked;
});

describe('isSafeSeedTarget', () => {
  it.each([
    'postgresql://u:p@localhost:5432/guild',
    'postgresql://u:p@127.0.0.1:5432/guild',
    'postgresql://u:p@[::1]:5432/guild',
    'postgresql://u:p@db.internal.example.com:5432/guild_test',
    'postgresql://u:p@db.internal.example.com:5432/guild_dev',
    'postgresql://u:p@ep-dev-branch.example.com/neondb',
    'postgresql://u:p@db.example.com/guild-dev',
  ])('accepts %s', (url) => {
    expect(isSafeSeedTarget(url)).toBe(true);
  });

  it.each([
    undefined,
    '',
    'not a url',
    'postgresql://u:p@ep-cool-name-123.example.com/neondb',
    'postgresql://u:p@prod.example.com:5432/guild',
    // "dev" or "test" only in the credentials must not count
    'postgresql://devuser:testpass@ep-cool-name-123.example.com/neondb',
    // "dev" and "test" must be whole words, not substrings
    'postgresql://u:p@devops-prod.example.com/guild',
    'postgresql://u:p@db.example.com/contest',
    'postgresql://u:p@latest.example.com/guild',
  ])('refuses %s', (url) => {
    expect(isSafeSeedTarget(url as string | undefined)).toBe(false);
  });
});

describe('SEED_BLOCKED_HOSTS', () => {
  const url = 'postgresql://u:p@blocked-host.example.com/guild-dev';

  it('allows the host when the variable is unset', () => {
    delete process.env.SEED_BLOCKED_HOSTS;
    expect(isSafeSeedTarget(url)).toBe(true);
  });

  it('refuses a listed host even if the name looks like dev', () => {
    process.env.SEED_BLOCKED_HOSTS = 'other.example.com, blocked-host';
    expect(isSafeSeedTarget(url)).toBe(false);
  });

  it('refuses a listed host even on localhost', () => {
    process.env.SEED_BLOCKED_HOSTS = 'localhost';
    expect(isSafeSeedTarget('postgresql://u:p@localhost:5432/guild')).toBe(false);
  });
});

describe('.env loading', () => {
  it('reads DATABASE_URL from a .env file when it is not in the environment', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'seed-env-'));
    fs.writeFileSync(path.join(dir, '.env'), 'DATABASE_URL=postgresql://u:p@localhost:5432/from_dotenv\n');
    const script = path.join(dir, 'probe.ts');
    const mod = path.join(__dirname, '..', '..', 'prisma', 'seed-safety.ts');
    fs.writeFileSync(script, `import ${JSON.stringify(mod)};\nconsole.log(process.env.DATABASE_URL);\n`);
    const env = { ...process.env };
    delete env.DATABASE_URL;
    const tsx = path.join(__dirname, '..', '..', 'node_modules', '.bin', 'tsx');
    const out = execFileSync(tsx, [script], { cwd: dir, env, encoding: 'utf8' });
    expect(out.trim()).toBe('postgresql://u:p@localhost:5432/from_dotenv');
    fs.rmSync(dir, { recursive: true, force: true });
  });
});

describe('assertSafeSeedTarget', () => {
  it('throws for an unsafe target and does not echo credentials', () => {
    expect(() =>
      assertSafeSeedTarget('postgresql://admin:s3cret@prod.example.com/guild'),
    ).toThrow(/refusing to seed/i);
    try {
      assertSafeSeedTarget('postgresql://admin:s3cret@prod.example.com/guild');
    } catch (e) {
      expect(String((e as Error).message)).not.toContain('s3cret');
    }
  });

  it('does not throw for localhost', () => {
    expect(() =>
      assertSafeSeedTarget('postgresql://u:p@localhost:5432/guild'),
    ).not.toThrow();
  });
});

describe('generateSeedPassword', () => {
  it('returns a long random value each time', () => {
    const a = generateSeedPassword();
    const b = generateSeedPassword();
    expect(a).not.toEqual(b);
    expect(a.length).toBeGreaterThanOrEqual(16);
    expect(a).toMatch(/^[A-Za-z0-9_-]+$/);
  });
});

describe('prisma seed files', () => {
  const dir = path.join(__dirname, '..', '..', 'prisma');
  const seeds = fs.readdirSync(dir).filter((f) => /^seed.*\.ts$/.test(f) && f !== 'seed-safety.ts');

  it('finds the seed scripts', () => {
    expect(seeds.length).toBeGreaterThan(0);
  });

  it.each(seeds)('%s uses the guard and has no fixed passwords', (file) => {
    const src = fs.readFileSync(path.join(dir, file), 'utf8');
    expect(src).toContain('assertSafeSeedTarget');
    expect(src).not.toMatch(/password123/);
    expect(src).not.toMatch(/ChangeMe-/);
    expect(src).not.toMatch(/@gmail\.com/);
    expect(src).not.toMatch(/incident/i);
    expect(src).not.toMatch(/ep-[a-z]+-[a-z]+-[a-z0-9]{8}/);
  });
});
