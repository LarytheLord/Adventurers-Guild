import { readFileSync } from 'fs';
import { join } from 'path';
import {
  CHECKLIST_PATH,
  CHECKLIST_DOMAINS,
  CHECKLIST_FAQ,
  CHECKLIST_INTRO,
  CHECKLIST_TITLE,
  CHECKLIST_DESCRIPTION,
  checklistPlainText,
} from '@/lib/cert-in-explainer/evidence-checklist';
import { PUBLIC_PAGES, checklistJsonLd, serializeJsonLd } from '@/lib/seo';
import sitemap from '@/app/sitemap';

const root = join(__dirname, '..', '..');
const read = (p: string) => readFileSync(join(root, p), 'utf8');
const isAscii = (s: string) => /^[\x00-\x7F]*$/.test(s);

describe('CERT-In evidence checklist', () => {
  it('lists the nine domains 8.1 to 8.9 in order', () => {
    expect(CHECKLIST_DOMAINS.map((d) => d.section)).toEqual([
      '8.1', '8.2', '8.3', '8.4', '8.5', '8.6', '8.7', '8.8', '8.9',
    ]);
  });

  it('gives every item a section reference inside its own domain', () => {
    let count = 0;
    for (const d of CHECKLIST_DOMAINS) {
      for (const item of d.items) {
        count += 1;
        expect(item.text.trim().length).toBeGreaterThan(10);
        expect(item.ref).toMatch(/^(8\.[1-9]|7\.8)\b/);
        if (item.ref.startsWith('8.')) expect(item.ref.startsWith(d.section)).toBe(true);
      }
    }
    expect(count).toBeGreaterThan(0);
  });

  it('has a two-sentence intro', () => {
    expect(CHECKLIST_INTRO.split(/(?<=\.)\s+/).filter(Boolean)).toHaveLength(2);
  });

  it('every FAQ answer cites a section', () => {
    expect(CHECKLIST_FAQ.length).toBeGreaterThan(0);
    for (const f of CHECKLIST_FAQ) expect(f.a).toMatch(/\(\d\.\d/);
  });

  it('is ASCII, in the page source too', () => {
    expect(isAscii(checklistPlainText() + CHECKLIST_PATH + CHECKLIST_TITLE + CHECKLIST_DESCRIPTION)).toBe(true);
    expect(isAscii(read('app/guides/cert-in-ai-audit-evidence-checklist/page.tsx'))).toBe(true);
  });

  it('does not claim empanelment', () => {
    expect(checklistPlainText()).toMatch(/not a CERT-In empanelled auditor/);
  });

  it('emits Article JSON-LD', () => {
    const a = JSON.parse(serializeJsonLd(checklistJsonLd()));
    expect(a['@type']).toBe('Article');
    expect(a.url).toBe('https://www.guilds.work' + CHECKLIST_PATH);
  });

  it('is in PUBLIC_PAGES and the sitemap', () => {
    expect(PUBLIC_PAGES.map((p) => p.path)).toContain(CHECKLIST_PATH);
    expect(sitemap().map((e) => e.url)).toContain('https://www.guilds.work' + CHECKLIST_PATH);
  });

  it('is linked from the existing guide', () => {
    expect(read('lib/cert-in-explainer/content.ts')).toContain(CHECKLIST_PATH);
  });
});
