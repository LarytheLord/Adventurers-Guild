import { readdirSync, readFileSync, statSync } from 'fs';
import { join, relative } from 'path';

const ROOT = join(__dirname, '../..');
const TARGETS = ['app', 'components', 'lib', 'prisma/seed.ts'];
const SKIP_DIRS = new Set(['node_modules', '.next', '.git']);
const PATTERN = /open\s?paws/i;

function collect(path: string, out: string[]): void {
  const stat = statSync(path);
  if (stat.isDirectory()) {
    for (const name of readdirSync(path)) {
      if (!SKIP_DIRS.has(name)) collect(join(path, name), out);
    }
  } else if (/\.(ts|tsx|js|jsx|mjs|json|css|md|mdx)$/.test(path)) {
    out.push(path);
  }
}

describe('public showcase has no references to another organisation', () => {
  it.each(TARGETS)('%s contains no "open paws" text (case-insensitive)', (target) => {
    const files: string[] = [];
    collect(join(ROOT, target), files);
    expect(files.length).toBeGreaterThan(0);

    const hits: string[] = [];
    for (const file of files) {
      readFileSync(file, 'utf8')
        .split('\n')
        .forEach((line, i) => {
          if (PATTERN.test(line)) hits.push(`${relative(ROOT, file)}:${i + 1}`);
        });
    }
    expect(hits).toEqual([]);
  });
});
