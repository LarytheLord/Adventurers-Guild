import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import sitemap from '@/app/sitemap';
import {
  CHANGELOG,
  CHANGELOG_FOOTER,
  CHANGELOG_INTRO,
  CHANGELOG_PATH,
  prUrl,
  type ChangelogDay,
} from '@/lib/changelog';
import { PUBLIC_PAGES, SITE_URL } from '@/lib/seo';
import { ogSlugForPath } from '@/lib/og';

const root = join(__dirname, '..', '..');
const read = (p: string) => readFileSync(join(root, p), 'utf8');
const isAscii = (s: string) => /^[\x00-\x7F]*$/.test(s);

const allParts = (days: ChangelogDay[]) => days.flatMap((d) => d.entries.flatMap((e) => e.parts));
const allText = (days: ChangelogDay[]) => allParts(days).map((p) => p.text);

// Existing page names that legitimately contain the word. New text never uses it.
const EXISTING_PAGE_NAMES = ['/audit/sample-report', '/audit', 'CERT-In AI audit evidence checklist'];

describe('changelog data', () => {
  it('has entries', () => {
    expect(CHANGELOG.length).toBeGreaterThan(0);
  });

  it('is grouped by date, newest first, one group per date', () => {
    const dates = CHANGELOG.map((d) => d.date);
    for (const d of dates) expect(d).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(new Set(dates).size).toBe(dates.length);
    const sorted = [...dates].sort().reverse();
    expect(dates).toEqual(sorted);
  });

  it('every day has entries and every entry has parts', () => {
    for (const d of CHANGELOG) {
      expect(d.entries.length).toBeGreaterThan(0);
      for (const e of d.entries) {
        expect(e.parts.length).toBeGreaterThan(0);
        for (const p of e.parts) expect(p.text.trim().length).toBeGreaterThan(3);
      }
    }
  });

  it('every part links to a merged change in one of the two repos', () => {
    for (const p of allParts(CHANGELOG)) {
      expect(['AG', 'RLS']).toContain(p.repo);
      expect(Number.isInteger(p.pr)).toBe(true);
      expect(p.pr).toBeGreaterThan(0);
      const url = prUrl(p);
      const repo = p.repo === 'AG' ? 'Adventurers-Guild' : 'rls-open-check';
      expect(url).toBe(`https://github.com/LarytheLord/${repo}/pull/${p.pr}`);
      expect(url).toMatch(/^https:\/\/github\.com\/LarytheLord\/[A-Za-z-]+\/pull\/\d+$/);
    }
  });

  it('is plain ASCII with no em or en dashes', () => {
    const blob = JSON.stringify(CHANGELOG) + CHANGELOG_INTRO + CHANGELOG_FOOTER;
    expect(isAscii(blob)).toBe(true);
    expect(blob).not.toMatch(/[–—]/);
  });

  it('does not use the word audit except in the existing page names', () => {
    let seen = 0;
    for (const t of allText(CHANGELOG)) {
      let rest = t;
      for (const name of EXISTING_PAGE_NAMES) {
        if (rest.includes(name)) seen += 1;
        rest = rest.split(name).join('');
      }
      expect(rest).not.toMatch(/audit/i);
    }
    expect(seen).toBeGreaterThan(0);
    expect(`${CHANGELOG_INTRO} ${CHANGELOG_FOOTER}`).not.toMatch(/audit/i);
  });

  it('never mentions AI tooling in authorship and makes no traction claim', () => {
    const blob = (JSON.stringify(CHANGELOG) + CHANGELOG_INTRO + CHANGELOG_FOOTER).toLowerCase();
    expect(blob).not.toMatch(/claude|copilot|chatgpt|generated with/);
    expect(blob).not.toMatch(/\busers?\b|customers?|downloads?|stars?\b/);
  });

  it('uses the exact intro and footer copy', () => {
    expect(CHANGELOG_INTRO).toBe(
      'What changed on guilds.work and in rls-open-check, newest first. Every line links to the merged change.',
    );
    expect(CHANGELOG_FOOTER).toBe('Found something wrong? Open an issue on GitHub; fixes are credited here.');
  });

  it('does not list a change twice', () => {
    const keys = allParts(CHANGELOG).map((p) => `${p.repo}#${p.pr}`);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe('changelog wiring', () => {
  it('is at /changelog', () => {
    expect(CHANGELOG_PATH).toBe('/changelog');
  });

  it('is in PUBLIC_PAGES, the sitemap, llms.txt and has an Open Graph card', () => {
    expect(PUBLIC_PAGES.map((p) => p.path)).toContain('/changelog');
    expect(sitemap().map((e) => e.url)).toContain(`${SITE_URL}/changelog`);
    const txt = read('public/llms.txt');
    expect(txt).toContain('(https://www.guilds.work/changelog)');
    expect(isAscii(txt)).toBe(true);
    expect(ogSlugForPath('/changelog')).not.toBeNull();
  });

  it('page is a server component with canonical metadata, ASCII only', () => {
    const f = 'app/changelog/page.tsx';
    expect(existsSync(join(root, f))).toBe(true);
    const s = read(f);
    expect(s).not.toMatch(/['"]use client['"]/);
    expect(s).toContain('buildPageMetadata');
    expect(s).toContain("path: '/changelog'");
    expect(s).toMatch(/const TITLE = '[^']+'/);
    expect(s).toMatch(/const DESCRIPTION =\s*'[^']+'/);
    expect(s).toContain('InfoPageShell');
    expect(isAscii(s)).toBe(true);
    expect(s).not.toMatch(/audit/i);
  });

  it('is linked from the site footer and the footer route list', () => {
    expect(read('components/ui/footer-taped-design.tsx')).toContain('href="/changelog"');
    expect(read('components/ConditionalFooter.tsx')).toContain("'/changelog'");
  });

  it('is in the axe and smoke page lists', () => {
    expect(read('__tests__/a11y/public-pages.a11y.spec.ts')).toContain("'/changelog'");
    expect(read('__tests__/e2e/smoke/public-pages.smoke.ts')).toContain("path: '/changelog'");
  });
});
