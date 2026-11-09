#!/usr/bin/env node
// Fails when added lines in a diff contain email addresses or Indian phone
// numbers that are not on the allow-list (scripts/lib/pii-core.cjs).
// Only the diff is scanned. History is never read.
//
// Usage:
//   node scripts/check-pii.mjs --staged            # pre-commit: staged changes
//   node scripts/check-pii.mjs --base origin/main  # PR: base...HEAD
//   git diff -U0 | node scripts/check-pii.mjs --stdin
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { scanDiff, redact } = require('./lib/pii-core.cjs');

const DIFF_ARGS = ['-c', 'core.quotepath=off', 'diff', '--unified=0', '--no-color', '--no-ext-diff', '--diff-filter=ACMR'];

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
}

function readDiff(argv) {
  if (argv.includes('--stdin')) return readFileSync(0, 'utf8');
  if (argv.includes('--staged')) return git([...DIFF_ARGS, '--cached']);

  const i = argv.indexOf('--base');
  if (i === -1 || !argv[i + 1]) {
    console.error('usage: check-pii.mjs (--staged | --base <ref> | --stdin)');
    process.exit(2);
  }
  const base = argv[i + 1];
  if (base.startsWith('-')) {
    console.error('invalid --base value');
    process.exit(2);
  }
  // A new branch push reports an all-zero "before" sha; use the parent commit.
  const ref = /^0+$/.test(base) ? 'HEAD^' : base;
  try {
    return git([...DIFF_ARGS, `${ref}...HEAD`]);
  } catch {
    // Force pushes can leave "before" unreachable; fall back to the last commit.
    console.error(`could not diff against ${ref}; scanning HEAD^..HEAD instead`);
    return git([...DIFF_ARGS, 'HEAD^', 'HEAD']);
  }
}

const findings = scanDiff(readDiff(process.argv.slice(2)));

if (findings.length === 0) {
  console.log('check-pii: no unlisted emails or Indian phone numbers in added lines.');
  process.exit(0);
}

const inCI = process.env.GITHUB_ACTIONS === 'true';
for (const f of findings) {
  const msg = `possible ${f.kind} ${redact(f.match)}`;
  console.error(`${f.file}:${f.line}: ${msg}`);
  if (inCI) console.error(`::error file=${f.file},line=${f.line}::${msg}`);
}
console.error(
  `\ncheck-pii: ${findings.length} finding(s). Remove the value, use an allow-listed address ` +
    '(see scripts/lib/pii-core.cjs), or add a "pii-allow" comment on that line if it is intentional.',
);
process.exit(1);
