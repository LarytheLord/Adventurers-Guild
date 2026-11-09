'use strict';

// Pure helpers for scripts/check-pii.mjs. No I/O here so the regexes can be
// unit tested directly (see __tests__/unit/check-pii.test.ts).

// Email addresses. The local part needs at least one character before the @
// and the final domain label must be alphabetic, so "react@18.3.1" and npm
// scopes like "@radix-ui/react-dialog" do not match.
const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g;

// Indian mobile numbers: optional +91 / 0091 / 91 / 0 prefix, then 10 digits
// starting with 6-9, optionally split 5+5. The lookarounds stop us matching
// inside longer digit runs, ids, versions or decimals.
const PHONE_RE = /(?<![\w.])(?:(?:\+|00)?91[\s-]?|0)?[6-9]\d{4}[\s-]?\d{5}(?!\w)/g;

// Allow-list. Add entries here, not inline in the CLI.
const ALLOWED_EMAILS = ['abid@guilds.work'];
const ALLOWED_DOMAINS = [
  'example.com',
  'example.org',
  'example.net',
  'users.noreply.github.com',
];
const ALLOWED_LOCAL_PARTS_RE = /^(?:no-?reply|do-?not-?reply)$/i;

// A line carrying this marker is skipped entirely.
const INLINE_ALLOW_RE = /pii-allow/;

// Paths that are never scanned: generated files, binaries, and the files that
// define or test the patterns themselves.
const IGNORED_PATH_RES = [
  /(^|\/)package-lock\.json(\.bak)?$/,
  /(^|\/)(yarn\.lock|pnpm-lock\.yaml)$/,
  /\.(png|jpe?g|gif|webp|ico|svg|pdf|woff2?|ttf|eot|zip|mp4|mov)$/i,
  /^scripts\/lib\/pii-core\.cjs$/,
  /^scripts\/check-pii\.mjs$/,
  /^__tests__\/unit\/check-pii\.test\.ts$/,
  /^\.gitleaks\.toml$/,
];

function findEmails(text) {
  return text.match(EMAIL_RE) || [];
}

function findPhones(text) {
  return (text.match(PHONE_RE) || []).map((m) => m.trim());
}

function isAllowedEmail(email) {
  const lower = email.toLowerCase();
  if (ALLOWED_EMAILS.includes(lower)) return true;
  const at = lower.lastIndexOf('@');
  const local = lower.slice(0, at);
  const domain = lower.slice(at + 1);
  if (ALLOWED_LOCAL_PARTS_RE.test(local)) return true;
  return ALLOWED_DOMAINS.some((d) => domain === d || domain.endsWith('.' + d));
}

function scanLine(line) {
  if (INLINE_ALLOW_RE.test(line)) return [];
  const hits = [];
  for (const m of findEmails(line)) {
    if (!isAllowedEmail(m)) hits.push({ kind: 'email', match: m });
  }
  for (const m of findPhones(line)) {
    hits.push({ kind: 'phone', match: m });
  }
  return hits;
}

function isIgnoredPath(file) {
  return IGNORED_PATH_RES.some((re) => re.test(file));
}

// Parse a unified diff and return the added lines with new-file line numbers.
// Hunk counts are tracked so that an added line starting with "++" is not
// mistaken for a file header.
function parseAddedLines(diffText) {
  const out = [];
  let file = null;
  let newLine = 0;
  let oldLeft = 0;
  let newLeft = 0;

  for (const raw of diffText.split('\n')) {
    const inHunk = oldLeft > 0 || newLeft > 0;
    if (!inHunk) {
      if (raw.startsWith('+++ ')) {
        const p = raw.slice(4).trim();
        file = p === '/dev/null' ? null : p.replace(/^b\//, '');
        continue;
      }
      const h = /^@@ -\d+(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/.exec(raw);
      if (h) {
        oldLeft = h[1] === undefined ? 1 : Number(h[1]);
        newLine = Number(h[2]);
        newLeft = h[3] === undefined ? 1 : Number(h[3]);
      }
      continue;
    }
    if (raw.startsWith('\\')) continue; // "\ No newline at end of file"
    if (raw.startsWith('+')) {
      if (file) out.push({ file, line: newLine, text: raw.slice(1) });
      newLine += 1;
      newLeft -= 1;
    } else if (raw.startsWith('-')) {
      oldLeft -= 1;
    } else {
      newLine += 1;
      newLeft -= 1;
      oldLeft -= 1;
    }
  }
  return out;
}

function scanDiff(diffText) {
  const findings = [];
  for (const { file, line, text } of parseAddedLines(diffText)) {
    if (isIgnoredPath(file)) continue;
    for (const hit of scanLine(text)) {
      findings.push({ file, line, kind: hit.kind, match: hit.match });
    }
  }
  return findings;
}

// Mask a match so CI logs do not become a second copy of the data.
function redact(match) {
  const at = match.indexOf('@');
  if (at > 0) return match[0] + '***' + match.slice(at);
  const digits = match.replace(/\D/g, '');
  return '*'.repeat(Math.max(digits.length - 2, 0)) + digits.slice(-2);
}

module.exports = {
  EMAIL_RE,
  PHONE_RE,
  findEmails,
  findPhones,
  isAllowedEmail,
  scanLine,
  isIgnoredPath,
  parseAddedLines,
  scanDiff,
  redact,
};
