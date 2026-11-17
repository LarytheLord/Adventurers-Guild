import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import sitemap from '@/app/sitemap';
import { PUBLIC_PAGES, SITE_URL } from '@/lib/seo';
import { allGuideItems } from '@/lib/guides-hub/registry';
import {
  HANDOVER_CTA_HREF,
  HANDOVER_CTA_TEXT,
  HANDOVER_MARKDOWN_PATH,
  HANDOVER_PATH,
  HANDOVER_SECTIONS,
  HANDOVER_TITLE,
  HANDOVER_DESCRIPTION,
  handoverMarkdown,
  handoverPlainText,
} from '@/lib/agency-handover/content';

const root = join(__dirname, '..', '..');
const read = (p: string) => readFileSync(join(root, p), 'utf8');
const isAscii = (s: string) => /^[\x00-\x7F]*$/.test(s);

describe('agency handover checklist content', () => {
  it('uses the required route and CTA', () => {
    expect(HANDOVER_PATH).toBe('/guides/agency-handover-checklist-ai-built-apps');
    expect(HANDOVER_CTA_TEXT).toBe('Want a second pair of eyes before handover?');
    expect(HANDOVER_CTA_HREF).toBe('/launch-check?src=agency');
  });

  it('has the six sections in order', () => {
    expect(HANDOVER_SECTIONS.map((s) => s.id)).toEqual([
      'database-access',
      'keys-and-secrets',
      'payments',
      'auth',
      'privacy-india',
      'handover-items',
    ]);
  });

  it('gives every item one line and a how-to-check line', () => {
    for (const s of HANDOVER_SECTIONS) {
      expect(s.items.length).toBeGreaterThanOrEqual(4);
      for (const i of s.items) {
        expect(i.item.trim().length).toBeGreaterThan(10);
        expect(i.check.trim().length).toBeGreaterThan(10);
        expect(i.item).not.toMatch(/\n/);
        expect(i.check).not.toMatch(/\n/);
      }
    }
  });

  it('links the required internal pages', () => {
    const t = handoverPlainText();
    expect(t).toContain('(/tools/rls-open-check)');
    expect(t).toContain('(/guides/payment-webhook-checklist-razorpay-stripe)');
    expect(t).toContain('(/guides/dpdp-rules-what-startups-must-do)');
  });

  it('is ASCII and carries no invented statistics', () => {
    const all = JSON.stringify({ HANDOVER_SECTIONS, HANDOVER_TITLE, HANDOVER_DESCRIPTION });
    expect(isAscii(all)).toBe(true);
    expect(handoverPlainText()).not.toMatch(/\d+(\.\d+)?\s?%/);
    expect(handoverPlainText()).not.toMatch(/\b\d+ (out of|in) \d+\b/);
  });

  it('says it is not legal advice and not an audit', () => {
    const t = handoverPlainText().toLowerCase();
    expect(t).toContain('not legal advice');
    expect(t).toContain('not an audit');
  });
});

describe('downloadable markdown', () => {
  it('is served from public/ and matches the generator exactly', () => {
    expect(HANDOVER_MARKDOWN_PATH).toBe('/agency-handover-checklist.md');
    const file = `public${HANDOVER_MARKDOWN_PATH}`;
    expect(existsSync(join(root, file))).toBe(true);
    expect(read(file)).toBe(handoverMarkdown());
  });

  it('is ASCII, has one checkbox per item, and absolute links', () => {
    const md = handoverMarkdown();
    expect(isAscii(md)).toBe(true);
    const n = HANDOVER_SECTIONS.reduce((a, s) => a + s.items.length, 0);
    expect(md.match(/^- \[ \] /gm)?.length).toBe(n);
    expect(md).not.toMatch(/\]\(\//);
    expect(md).toContain(`${SITE_URL}/launch-check?src=agency`);
  });
});

describe('page and wiring', () => {
  it('has a page that exports metadata', () => {
    const f = `app${HANDOVER_PATH}/page.tsx`;
    expect(existsSync(join(root, f))).toBe(true);
    expect(read(f)).toMatch(/export const metadata/);
  });

  it('is in PUBLIC_PAGES, the sitemap, the hub and llms.txt', () => {
    expect(PUBLIC_PAGES.map((p) => p.path)).toContain(HANDOVER_PATH);
    expect(sitemap().map((e) => e.url)).toContain(`${SITE_URL}${HANDOVER_PATH}`);
    expect(allGuideItems().map((i) => i.path)).toContain(HANDOVER_PATH);
    const txt = read('public/llms.txt');
    expect(txt).toContain(`(${SITE_URL}${HANDOVER_PATH})`);
    expect(txt).toContain(`${SITE_URL}${HANDOVER_MARKDOWN_PATH}`);
    expect(isAscii(txt)).toBe(true);
  });
});
