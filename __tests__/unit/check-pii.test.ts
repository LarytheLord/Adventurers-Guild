import { describe, it, expect } from '@jest/globals';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pii = require('../../scripts/lib/pii-core.cjs');

// Fixtures are assembled from parts so this file never contains a literal
// address or number that the scanner itself would flag.
const at = '@';
const mail = (local: string, domain: string) => `${local}${at}${domain}`;
const plus91 = '+91';

describe('findEmails', () => {
  it('finds a plain address', () => {
    expect(pii.findEmails(`contact ${mail('jane.doe', 'acme.io')} now`)).toEqual([
      mail('jane.doe', 'acme.io'),
    ]);
  });

  it('finds several addresses on one line', () => {
    const line = `${mail('a', 'b.co')}, ${mail('c+tag', 'd.org')}`;
    expect(pii.findEmails(line)).toHaveLength(2);
  });

  it('ignores npm scopes and version pins', () => {
    expect(pii.findEmails('"@radix-ui/react-dialog": "1.1.4"')).toEqual([]);
    expect(pii.findEmails('react@18.3.1 and next@15.5.7')).toEqual([]);
  });

  it('ignores plain text with no address', () => {
    expect(pii.findEmails('hello world')).toEqual([]);
  });
});

describe('isAllowedEmail', () => {
  it('allows the listed team address', () => {
    expect(pii.isAllowedEmail(mail('abid', 'guilds.work'))).toBe(true);
  });

  it('allows example domains and subdomains', () => {
    expect(pii.isAllowedEmail(mail('x', 'example.com'))).toBe(true);
    expect(pii.isAllowedEmail(mail('x', 'mail.example.com'))).toBe(true);
    expect(pii.isAllowedEmail(mail('x', 'example.org'))).toBe(true);
  });

  it('allows noreply style local parts', () => {
    expect(pii.isAllowedEmail(mail('noreply', 'anything.io'))).toBe(true);
    expect(pii.isAllowedEmail(mail('no-reply', 'anything.io'))).toBe(true);
    expect(pii.isAllowedEmail(mail('12345+user', 'users.noreply.github.com'))).toBe(true);
  });

  it('is case insensitive', () => {
    expect(pii.isAllowedEmail(mail('ABID', 'Guilds.Work'))).toBe(true);
  });

  it('does not allow lookalike domains', () => {
    expect(pii.isAllowedEmail(mail('x', 'notexample.com'))).toBe(false);
    expect(pii.isAllowedEmail(mail('x', 'example.com.evil.io'))).toBe(false);
  });

  it('does not allow other addresses on the team domain', () => {
    expect(pii.isAllowedEmail(mail('someone', 'guilds.work'))).toBe(false);
  });

  it('does not allow a real looking address', () => {
    expect(pii.isAllowedEmail(mail('jane.doe', 'gmail.com'))).toBe(false);
  });
});

describe('findPhones', () => {
  it('finds a bare 10 digit mobile', () => {
    expect(pii.findPhones('call 9876543210 today')).toEqual(['9876543210']);
  });

  it('finds +91 forms', () => {
    expect(pii.findPhones(`${plus91}98765 43210`)).toHaveLength(1);
    expect(pii.findPhones(`${plus91}-9876543210`)).toHaveLength(1);
    expect(pii.findPhones(`${plus91} 98765-43210`)).toHaveLength(1);
  });

  it('finds 91 and 0 prefixed forms', () => {
    expect(pii.findPhones('919876543210')).toHaveLength(1);
    expect(pii.findPhones('09876543210')).toHaveLength(1);
  });

  it('requires the first digit to be 6 to 9', () => {
    expect(pii.findPhones('5876543210')).toEqual([]);
    expect(pii.findPhones('1234567890')).toEqual([]);
  });

  it('ignores digits embedded in longer numbers or ids', () => {
    expect(pii.findPhones('1700000000000')).toEqual([]);
    expect(pii.findPhones('98765432101234')).toEqual([]);
    expect(pii.findPhones('id_9876543210abc')).toEqual([]);
    expect(pii.findPhones('v1.9876543210')).toEqual([]);
  });

  it('ignores short numbers', () => {
    expect(pii.findPhones('987654321')).toEqual([]);
  });
});

describe('scanLine', () => {
  it('reports emails and phones with kinds', () => {
    const hits = pii.scanLine(`${mail('jane', 'acme.io')} 9876543210`);
    expect(hits.map((h: { kind: string }) => h.kind).sort()).toEqual(['email', 'phone']);
  });

  it('skips allowed emails', () => {
    expect(pii.scanLine(`from ${mail('abid', 'guilds.work')}`)).toEqual([]);
  });

  it('honours the inline pii-allow marker', () => {
    expect(pii.scanLine(`${mail('jane', 'acme.io')} // pii-allow`)).toEqual([]);
  });
});

describe('isIgnoredPath', () => {
  it('ignores lockfiles, binaries and the scanner files', () => {
    expect(pii.isIgnoredPath('package-lock.json')).toBe(true);
    expect(pii.isIgnoredPath('public/logo.png')).toBe(true);
    expect(pii.isIgnoredPath('scripts/lib/pii-core.cjs')).toBe(true);
    expect(pii.isIgnoredPath('__tests__/unit/check-pii.test.ts')).toBe(true);
    expect(pii.isIgnoredPath('.gitleaks.toml')).toBe(true);
  });

  it('does not ignore app code', () => {
    expect(pii.isIgnoredPath('app/page.tsx')).toBe(false);
  });
});

describe('parseAddedLines', () => {
  const diff = [
    'diff --git a/app/a.ts b/app/a.ts',
    'index 111..222 100644',
    '--- a/app/a.ts',
    '+++ b/app/a.ts',
    '@@ -1,2 +10,3 @@',
    ' context',
    '-removed',
    '+added one',
    '+added two',
    'diff --git a/gone.ts b/gone.ts',
    '--- a/gone.ts',
    '+++ /dev/null',
    '@@ -1 +0,0 @@',
    '-bye',
    'diff --git a/n.ts b/n.ts',
    '--- /dev/null',
    '+++ b/n.ts',
    '@@ -0,0 +1 @@',
    '+new file line',
  ].join('\n');

  it('returns only added lines with file and line numbers', () => {
    expect(pii.parseAddedLines(diff)).toEqual([
      { file: 'app/a.ts', line: 11, text: 'added one' },
      { file: 'app/a.ts', line: 12, text: 'added two' },
      { file: 'n.ts', line: 1, text: 'new file line' },
    ]);
  });
});

describe('scanDiff', () => {
  it('flags only added lines outside ignored paths', () => {
    const diff = [
      '+++ b/app/x.ts',
      '@@ -0,0 +1,2 @@',
      `+const e = '${mail('jane', 'acme.io')}'`,
      `+const ok = '${mail('abid', 'guilds.work')}'`,
      '+++ b/package-lock.json',
      '@@ -0,0 +1 @@',
      `+"x": "${mail('jane', 'acme.io')}"`,
    ].join('\n');
    const findings = pii.scanDiff(diff);
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({ file: 'app/x.ts', line: 1, kind: 'email' });
  });

  it('never echoes the matched value in the redacted form', () => {
    const [f] = pii.scanDiff(
      ['+++ b/a.ts', '@@ -0,0 +1 @@', `+${mail('jane.doe', 'acme.io')}`].join('\n'),
    );
    expect(pii.redact(f.match)).not.toContain('jane.doe');
  });
});
