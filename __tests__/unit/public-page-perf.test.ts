import { readFileSync, statSync, existsSync } from 'fs';
import { join } from 'path';

const root = join(__dirname, '..', '..');
const read = (p: string) => readFileSync(join(root, p), 'utf8');

// The header and footer render the logo at 32-40 CSS px on every public page.
// They must not ship the 1254px full-size master for that.
const SMALL_LOGO = 'public/logo/guild-logo-sm.png';
const MAX_SMALL_LOGO_BYTES = 40 * 1024;

describe('public page performance guards', () => {
  it('has a small logo asset for header/footer use', () => {
    expect(existsSync(join(root, SMALL_LOGO))).toBe(true);
    expect(statSync(join(root, SMALL_LOGO)).size).toBeLessThan(MAX_SMALL_LOGO_BYTES);
  });

  it.each(['components/Navigation.tsx', 'components/ui/footer-taped-design.tsx'])(
    '%s uses the small logo with explicit dimensions',
    (file) => {
      const src = read(file);
      expect(src).toContain('/logo/guild-logo-sm.png');
      expect(src).not.toMatch(/src="\/logo\/guild-logo\.png"/);
      // next/image requires width and height, which also reserves layout space.
      expect(src).toMatch(/<Image[\s\S]*?width=\{/);
      expect(src).toMatch(/<Image[\s\S]*?height=\{/);
    }
  );

  it('keeps the footer markup out of the client bundle', () => {
    const src = read('components/ConditionalFooter.tsx');
    expect(src).not.toMatch(/footer-taped-design/);
  });

  it('layout passes the footer to ConditionalFooter as a server-rendered child', () => {
    const src = read('app/layout.tsx');
    expect(src).toMatch(/<ConditionalFooter>[\s\S]*<GuildFooter[\s\S]*<\/ConditionalFooter>/);
  });
});
