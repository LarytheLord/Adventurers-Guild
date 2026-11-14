/**
 * Public marketing chrome (nav + footer) must not advertise the legacy
 * quest product, must point at the brand X account, and must link the
 * open-source linter. The /quests and /register routes themselves stay.
 */
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { SAME_AS } from '@/lib/seo';

const root = join(__dirname, '..', '..');
const read = (p: string) => readFileSync(join(root, p), 'utf8');

const footer = read('components/ui/footer-taped-design.tsx');
const nav = read('components/Navigation.tsx');
const LINTER = 'https://github.com/LarytheLord/rls-open-check';
const BRAND_X = 'https://x.com/AdvGuildHQ';

describe('marketing links', () => {
  it('footer has no guild_india link and links the brand X account', () => {
    expect(footer).not.toContain('guild_india');
    expect(footer).toContain(BRAND_X);
  });

  it('footer and nav link no legacy quest or register pages', () => {
    for (const src of [footer, nav]) {
      expect(src).not.toMatch(/href=["']\/quests/);
      expect(src).not.toMatch(/href=["']\/register/);
    }
  });

  it('footer keeps a plain log in path via nav and links the linter', () => {
    expect(footer).toContain(LINTER);
    expect(footer).toContain('rls-open-check (open source)');
    expect(footer).not.toContain('github.com/LarytheLord/Adventurers-Guild');
    expect(nav).toMatch(/href="\/login"/);
  });

  it('JSON-LD sameAs uses the brand account, not guild_india', () => {
    expect(SAME_AS).toContain(BRAND_X);
    expect(SAME_AS.join(' ')).not.toContain('guild_india');
    expect(SAME_AS).toContain(LINTER);
  });

  it('no site source file mentions guild_india', () => {
    for (const f of ['lib/seo.ts', 'components/ui/footer-taped-design.tsx', 'public/llms.txt']) {
      if (existsSync(join(root, f))) expect(read(f)).not.toContain('guild_india');
    }
  });
});
