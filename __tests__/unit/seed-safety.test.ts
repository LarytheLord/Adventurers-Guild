import fs from 'fs';
import path from 'path';
import {
  assertSafeSeedTarget,
  isSafeSeedTarget,
  generateSeedPassword,
} from '../../prisma/seed-safety';

describe('isSafeSeedTarget', () => {
  it.each([
    'postgresql://u:p@localhost:5432/guild',
    'postgresql://u:p@127.0.0.1:5432/guild',
    'postgresql://u:p@[::1]:5432/guild',
    'postgresql://u:p@db.internal:5432/guild_test',
    'postgresql://u:p@db.internal:5432/guild_dev',
    'postgresql://u:p@ep-dev-branch.example.com/neondb',
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
    // the known production endpoint is always refused
    'postgresql://u:p@ep-dry-dew-a11hidob.example.com/dev',
  ])('refuses %s', (url) => {
    expect(isSafeSeedTarget(url as string | undefined)).toBe(false);
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
  });
});
