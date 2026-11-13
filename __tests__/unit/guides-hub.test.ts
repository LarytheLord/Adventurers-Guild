import { existsSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import sitemap from '@/app/sitemap';
import { PUBLIC_PAGES, SITE_URL, guidesHubJsonLd, serializeJsonLd } from '@/lib/seo';
import { GUIDES_HUB_PATH, GUIDE_GROUPS, allGuideItems, cleanTitle, firstSentence } from '@/lib/guides-hub/registry';
import * as home from '@/lib/home/content';

const root = join(__dirname, '..', '..');
const read = (p: string) => readFileSync(join(root, p), 'utf8');
const isAscii = (s: string) => /^[\x00-\x7F]*$/.test(s);
const items = allGuideItems();

describe('guides hub registry', () => {
  it('is on /guides', () => {
    expect(GUIDES_HUB_PATH).toBe('/guides');
  });

  it('lists every guide and free tool on main', () => {
    const paths = items.map((i) => i.path);
    for (const p of [
      '/guides/cert-in-ai-security-auditing-guidelines',
      '/guides/does-cert-in-require-an-ai-audit',
      '/guides/check-supabase-rls-lovable-bolt',
      '/guides/what-is-an-ai-risk-tier-cert-in',
      '/ai-risk-tier',
      '/launch-check',
      '/checklist',
      '/indic-ai-qa',
    ]) {
      expect(paths).toContain(p);
    }
  });

  it('every listed route has a page file that exports metadata', () => {
    for (const i of items) {
      const file = `app${i.path}/page.tsx`;
      expect(existsSync(join(root, file))).toBe(true);
      expect(read(file)).toMatch(/export const metadata/);
    }
  });

  it('has no duplicate routes and no empty group', () => {
    expect(new Set(items.map((i) => i.path)).size).toBe(items.length);
    expect(GUIDE_GROUPS.length).toBeGreaterThan(0);
    for (const g of GUIDE_GROUPS) {
      expect(g.items.length).toBeGreaterThan(0);
      expect(g.title.length).toBeGreaterThan(3);
    }
  });

  it('does not list the hub itself, noindex pages, or the paid service page', () => {
    const paths = items.map((i) => i.path);
    expect(paths).not.toContain('/guides');
    expect(paths).not.toContain('/audit/sample-report');
    expect(paths).not.toContain('/audit');
  });

  it('drift guard: every page under app/guides/<slug>/ is listed', () => {
    const slugs = readdirSync(join(root, 'app/guides'), { withFileTypes: true })
      .filter((d) => d.isDirectory() && existsSync(join(root, 'app/guides', d.name, 'page.tsx')))
      .map((d) => `/guides/${d.name}`);
    expect(slugs.length).toBeGreaterThan(0);
    for (const s of slugs) expect(items.map((i) => i.path)).toContain(s);
  });
});

describe('guides hub page', () => {
  const src = () => read('app/guides/page.tsx');

  it('takes each description from the listed page own metadata export', () => {
    const s = src();
    for (const i of items) {
      expect(s).toContain(`from '@/app${i.path}/page'`);
    }
    expect(s).toContain('metadata');
  });

  it('is ASCII, uses the metadata builder and the JSON-LD component', () => {
    const s = src();
    expect(isAscii(s)).toBe(true);
    expect(s).toContain('buildPageMetadata');
    expect(s).toContain("path: '/guides'");
    expect(s).toContain('guidesHubJsonLd');
    expect(s).toMatch(/const TITLE = '[^']+'/);
    expect(s).toMatch(/const DESCRIPTION =\s*'[^']+'/);
  });

  it('never claims empanelment, and says it is not an auditor', () => {
    const s = src();
    expect(s).toMatch(/not a CERT-In empanelled auditor/);
    expect(s).not.toMatch(/\bis (a )?CERT-In empanelled/i);
  });
});

describe('metadata helpers', () => {
  it('cleanTitle strips the site suffix', () => {
    expect(cleanTitle('Does CERT-In require an AI audit? - Guild')).toBe('Does CERT-In require an AI audit?');
    expect(cleanTitle('Plain title')).toBe('Plain title');
  });

  it('firstSentence returns one line and keeps version numbers intact', () => {
    expect(firstSentence('Free self-check (v1.0, 4 November 2026) of your system. Runs in your browser.')).toBe(
      'Free self-check (v1.0, 4 November 2026) of your system.',
    );
    expect(firstSentence('One sentence only')).toBe('One sentence only');
    expect(firstSentence('  Spaced   out.  Next one. ')).toBe('Spaced out.');
  });
});

describe('guides hub JSON-LD', () => {
  const data = items.map((i) => ({ name: `Name of ${i.path}`, description: `About ${i.path}.`, path: i.path }));
  const ld = JSON.parse(serializeJsonLd(guidesHubJsonLd(data)));

  it('is a CollectionPage on /guides with an ItemList of every entry', () => {
    expect(ld['@context']).toBe('https://schema.org');
    expect(ld['@type']).toBe('CollectionPage');
    expect(ld.url).toBe(`${SITE_URL}/guides`);
    expect(ld.mainEntity['@type']).toBe('ItemList');
    expect(ld.mainEntity.numberOfItems).toBe(items.length);
    expect(ld.mainEntity.itemListElement.map((e: { url: string }) => e.url)).toEqual(
      items.map((i) => `${SITE_URL}${i.path}`),
    );
    expect(ld.mainEntity.itemListElement[0].position).toBe(1);
    expect(ld.publisher.name).toBe('Guild');
  });
});

describe('guides hub wiring', () => {
  it('is in PUBLIC_PAGES, the sitemap and llms.txt', () => {
    expect(PUBLIC_PAGES.map((p) => p.path)).toContain('/guides');
    expect(sitemap().map((e) => e.url)).toContain(`${SITE_URL}/guides`);
    const txt = read('public/llms.txt');
    expect(txt).toContain('(https://www.guilds.work/guides)');
    expect(isAscii(txt)).toBe(true);
  });

  it('every listed page is also in the sitemap', () => {
    const urls = sitemap().map((e) => e.url);
    for (const i of items) expect(urls).toContain(`${SITE_URL}${i.path}`);
  });

  it('is linked from the footer and the footer shows on /guides', () => {
    expect(read('components/ui/footer-taped-design.tsx')).toMatch(/href="\/guides"/);
    expect(read('components/ConditionalFooter.tsx')).toContain("'/guides'");
  });

  it('is linked from the home page content', () => {
    expect(JSON.stringify(home)).toContain('"/guides"');
  });
});
