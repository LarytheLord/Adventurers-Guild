import { readFileSync } from 'fs';
import { join } from 'path';
import sitemap from '@/app/sitemap';
import {
  DPDP_GUIDE_CHECK_NOTE,
  DPDP_GUIDE_DESCRIPTION,
  DPDP_GUIDE_DISCLAIMER,
  DPDP_GUIDE_FAQ,
  DPDP_GUIDE_PATH,
  DPDP_GUIDE_SECTIONS,
  DPDP_GUIDE_SUMMARY,
  DPDP_GUIDE_TITLE,
  dpdpGuidePlainText,
} from '@/lib/dpdp-explainer/content';
import { allGuideItems } from '@/lib/guides-hub/registry';
import { OG_PAGES, ogImageUrl, ogSlugForPath } from '@/lib/og';
import { PUBLIC_PAGES, dpdpGuideJsonLd, dpdpToolJsonLd, serializeJsonLd } from '@/lib/seo';

const root = join(__dirname, '..', '..');
const read = (p: string) => readFileSync(join(root, p), 'utf8');
// eslint-disable-next-line no-control-regex
const isAscii = (s: string) => /^[\x00-\x7F]*$/.test(s);

describe('DPDP guide content', () => {
  const text = dpdpGuidePlainText();

  it('is ASCII', () => {
    expect(isAscii(text)).toBe(true);
    expect(isAscii(JSON.stringify({ DPDP_GUIDE_SECTIONS, DPDP_GUIDE_FAQ, DPDP_GUIDE_SUMMARY }))).toBe(true);
  });

  it('uses the required route and has a disclaimer that is not legal advice', () => {
    expect(DPDP_GUIDE_PATH).toBe('/guides/dpdp-rules-what-startups-must-do');
    expect(DPDP_GUIDE_DISCLAIMER).toMatch(/not legal advice/i);
    expect(text).toMatch(/not legal advice/i);
  });

  it('never claims Guild is an empanelled auditor', () => {
    expect(text).not.toMatch(/Guild is (a|an) (CERT-In )?empanelled/i);
    expect(text).toMatch(/Guild is not a CERT-In empanelled auditor/);
  });

  it('cites the Rules only as G.S.R. 846(E), with no invented rule numbers', () => {
    expect(text).toContain('G.S.R. 846(E)');
    expect(text).not.toMatch(/\bRule\s+\d/);
    expect(text).not.toMatch(/\brules?\s+\d+\(/i);
  });

  it('attributes phase dates to the named secondary sources and keeps a check-the-Gazette note', () => {
    expect(text).toMatch(/as reported by Bar & Bench and Mondaq/);
    expect(DPDP_GUIDE_CHECK_NOTE).toMatch(/Check the Gazette/);
    expect(text).toMatch(/dates per the notified Rules/i);
  });

  it('has 5 to 6 FAQ entries with a question and an answer', () => {
    expect(DPDP_GUIDE_FAQ.length).toBeGreaterThanOrEqual(5);
    expect(DPDP_GUIDE_FAQ.length).toBeLessThanOrEqual(6);
    for (const f of DPDP_GUIDE_FAQ) {
      expect(f.q.length).toBeGreaterThan(10);
      expect(f.a.length).toBeGreaterThan(40);
    }
  });

  it('places personal or domestic use in section 3(c)(i), not section 17', () => {
    expect(text).toContain('3(c)(i)');
    expect(text).not.toMatch(/personal or domestic[^.]*\(section 17\)/i);
  });

  it('does not list companion G.S.R. numbers and dates the notification as reported', () => {
    expect(text).not.toMatch(/84[345]\(E\)/);
    expect(text).toMatch(/13 November 2025/);
    expect(text).toMatch(/14 November 2025/);
    expect(text).toMatch(/as reported by Bar & Bench and Mondaq/);
  });

  it('links to the readiness tool', () => {
    expect(text).toContain('/dpdp-readiness');
  });
});

describe('DPDP SEO wiring', () => {
  it('Article and FAQPage JSON-LD parse and match the guide', () => {
    const [article, faq] = JSON.parse(serializeJsonLd(dpdpGuideJsonLd()));
    expect(article['@type']).toBe('Article');
    expect(article.headline).toBe(DPDP_GUIDE_TITLE);
    expect(article.description).toBe(DPDP_GUIDE_DESCRIPTION);
    expect(article.url).toBe('https://www.guilds.work/guides/dpdp-rules-what-startups-must-do');
    expect(faq['@type']).toBe('FAQPage');
    expect(faq.mainEntity).toHaveLength(DPDP_GUIDE_FAQ.length);
    const text = dpdpGuidePlainText();
    for (const q of faq.mainEntity) expect(text).toContain(q.acceptedAnswer.text);
  });

  it('tool JSON-LD is a free WebApplication at /dpdp-readiness', () => {
    const a = JSON.parse(serializeJsonLd(dpdpToolJsonLd()));
    expect(a['@type']).toBe('WebApplication');
    expect(a.url).toBe('https://www.guilds.work/dpdp-readiness');
    expect(a.offers.price).toBe('0');
  });

  it('both pages are in PUBLIC_PAGES, the sitemap and llms.txt', () => {
    const urls = sitemap().map((e) => e.url);
    const llms = read('public/llms.txt');
    expect(isAscii(llms)).toBe(true);
    for (const path of ['/dpdp-readiness', '/guides/dpdp-rules-what-startups-must-do']) {
      expect(PUBLIC_PAGES.map((p) => p.path)).toContain(path);
      expect(urls).toContain(`https://www.guilds.work${path}`);
      expect(llms).toContain(`(https://www.guilds.work${path})`);
    }
    expect(llms).toMatch(/G\.S\.R\. 846\(E\)/);
  });

  it('llms.txt has one entry per line: each page URL sits on a line that starts with "- ["', () => {
    const lines = read('public/llms.txt').split('\n');
    for (const path of ['/dpdp-readiness', '/guides/dpdp-rules-what-startups-must-do']) {
      const hits = lines.filter((l) => l.includes(`](https://www.guilds.work${path})`));
      expect(hits).toHaveLength(1);
      expect(hits[0].startsWith('- [')).toBe(true);
    }
    for (const l of lines) expect(l.split('- [').length - 1).toBeLessThanOrEqual(1);
  });

  it('the footer shows on /dpdp-readiness', () => {
    expect(read('components/ConditionalFooter.tsx')).toContain("'/dpdp-readiness'");
  });

  it('route files pin metadata and render JSON-LD', () => {
    const tool = read('app/dpdp-readiness/page.tsx');
    const guide = read('app/guides/dpdp-rules-what-startups-must-do/page.tsx');
    for (const src of [tool, guide]) {
      expect(src).toContain('buildPageMetadata');
      expect(src).toContain('JsonLd');
      expect(isAscii(src)).toBe(true);
    }
    expect(tool).toContain("path: '/dpdp-readiness'");
    expect(guide).toContain('path: DPDP_GUIDE_PATH');
    expect(guide).toContain('dpdpGuideJsonLd');
  });
});

describe('DPDP pages on the guides hub and social cards', () => {
  const hub = read('app/guides/page.tsx');

  it('are listed in the guides registry, the guide as a guide and the check as a tool', () => {
    const items = allGuideItems();
    expect(items).toContainEqual({ path: '/guides/dpdp-rules-what-startups-must-do', kind: 'guide' });
    expect(items).toContainEqual({ path: '/dpdp-readiness', kind: 'tool' });
  });

  it('are imported by the hub page so titles and descriptions come from their own metadata', () => {
    expect(hub).toContain("from '@/app/dpdp-readiness/page'");
    expect(hub).toContain("from '@/app/guides/dpdp-rules-what-startups-must-do/page'");
  });

  it('have an OG card each, ASCII, with the same title as the page and no empanelment claim', () => {
    for (const path of ['/dpdp-readiness', '/guides/dpdp-rules-what-startups-must-do']) {
      const slug = ogSlugForPath(path);
      expect(slug).not.toBeNull();
      expect(ogImageUrl(path)).toBe(`https://www.guilds.work/og/${slug}`);
      const card = OG_PAGES[slug as string];
      expect(isAscii(`${card.title} ${card.subtitle}`)).toBe(true);
      expect(`${card.title} ${card.subtitle}`).not.toMatch(/empanel|legal advice is|certif/i);
    }
    expect(OG_PAGES[ogSlugForPath('/guides/dpdp-rules-what-startups-must-do') as string].title).toBe(DPDP_GUIDE_TITLE);
    const toolTitle = /const TITLE = '([^']+)'/.exec(read('app/dpdp-readiness/page.tsx'))?.[1].replace(/ - Guild$/, '');
    expect(OG_PAGES[ogSlugForPath('/dpdp-readiness') as string].title).toBe(toolTitle);
  });
});
