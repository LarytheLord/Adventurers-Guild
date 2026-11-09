import { readFileSync } from 'fs';
import { join } from 'path';
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from '@/lib/site-metadata';

describe('site default metadata', () => {
  const strings = { SITE_TITLE, SITE_DESCRIPTION, SITE_URL };

  it.each(Object.entries(strings))('%s is plain ASCII', (_name, value) => {
    expect(/^[\x20-\x7E]+$/.test(value)).toBe(true);
  });

  it.each(Object.entries(strings))('%s has no unverifiable user count', (_name, value) => {
    expect(value).not.toContain('500+');
    expect(value.toLowerCase()).not.toContain('fixed price');
  });

  it('is wired into app/layout.tsx with metadataBase', () => {
    const layout = readFileSync(join(__dirname, '../../app/layout.tsx'), 'utf8');
    expect(layout).toContain('metadataBase: new URL(SITE_URL)');
    expect(layout).toContain('title: SITE_TITLE');
    expect(layout).toContain('description: SITE_DESCRIPTION');
  });
});
