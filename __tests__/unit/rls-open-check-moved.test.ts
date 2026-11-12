/**
 * rls-open-check now lives in its own repo. These tests check that the old
 * folder and workflow are gone and that the docs point at the new repo.
 */
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const root = join(__dirname, '..', '..');
const read = (p: string) => readFileSync(join(root, p), 'utf8');
const NEW_REPO = 'https://github.com/LarytheLord/rls-open-check';

describe('rls-open-check move', () => {
  it('removes the old tool folder and its workflow', () => {
    expect(existsSync(join(root, 'tools/rls-open-check'))).toBe(false);
    expect(existsSync(join(root, '.github/workflows/rls-open-check.yml'))).toBe(false);
  });

  it('has a tools/README.md that points at the new repo', () => {
    const readme = read('tools/README.md');
    expect(readme).toContain(NEW_REPO);
  });

  it('points every GitHub link in the Show HN draft at the new repo', () => {
    const draft = read('docs/launch/SHOW_HN_DRAFT.md');
    const links = draft.match(/https:\/\/github\.com\/[^\s)>`]+/g) ?? [];
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      expect(link.startsWith(NEW_REPO)).toBe(true);
    }
    expect(draft).not.toContain('tools/rls-open-check');
    expect(draft).not.toContain('Adventurers-Guild');
  });

  it('gives install commands that work from the new repo', () => {
    const draft = read('docs/launch/SHOW_HN_DRAFT.md');
    expect(draft).toContain(`git clone ${NEW_REPO}.git`);
    expect(draft).toMatch(/npm ci/);
  });

  it('keeps llms.txt free of links to the old folder', () => {
    expect(read('public/llms.txt')).not.toContain('tools/rls-open-check');
  });
});
