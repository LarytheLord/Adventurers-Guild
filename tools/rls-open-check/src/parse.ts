import { loadModule, parseSync } from "libpg-query";

// Loose view of the Postgres parse tree. The shapes come from libpg-query.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Node = Record<string, any>;

export interface ParsedStatement {
  node: Node;
  line: number;
}

export interface ParseOutput {
  statements: ParsedStatement[];
  errors: { line: number; message: string }[];
}

let loaded: Promise<void> | undefined;

export function ensureLoaded(): Promise<void> {
  if (!loaded) loaded = loadModule();
  return loaded;
}

function countNewlines(text: string): number {
  let n = 0;
  for (let i = 0; i < text.length; i++) if (text.charCodeAt(i) === 10) n++;
  return n;
}

/** Index of the first character that is not whitespace or a comment. */
function skipTrivia(text: string, from: number): number {
  let i = from;
  for (;;) {
    while (i < text.length && /\s/.test(text[i])) i++;
    if (text.startsWith("--", i)) {
      while (i < text.length && text[i] !== "\n") i++;
    } else if (text.startsWith("/*", i)) {
      let depth = 1;
      i += 2;
      while (i < text.length && depth > 0) {
        if (text.startsWith("/*", i)) {
          depth++;
          i += 2;
        } else if (text.startsWith("*/", i)) {
          depth--;
          i += 2;
        } else i++;
      }
    } else return i;
  }
}

/** Convert a UTF-8 byte offset in `text` to a character index. */
function byteToCharIndex(text: string, byteOffset: number): number {
  if (byteOffset <= 0) return 0;
  const buf = Buffer.from(text, "utf8");
  return buf.subarray(0, Math.min(byteOffset, buf.length)).toString("utf8").length;
}

function parseChunk(
  chunk: string,
  baseLine: number
): ParsedStatement[] {
  const result = parseSync(chunk);
  const out: ParsedStatement[] = [];
  for (const raw of result.stmts ?? []) {
    const charStart = byteToCharIndex(chunk, raw.stmt_location ?? 0);
    const start = skipTrivia(chunk, charStart);
    out.push({
      node: raw.stmt as Node,
      line: baseLine + countNewlines(chunk.slice(0, start)) + 1,
    });
  }
  return out;
}

/**
 * Split SQL text on top-level semicolons. Aware of single quotes, double
 * quotes, dollar quoting and comments. Used only when the whole file does
 * not parse, so that one odd statement does not hide the others.
 */
export function splitStatements(text: string): { text: string; start: number }[] {
  const parts: { text: string; start: number }[] = [];
  let start = 0;
  let i = 0;
  const n = text.length;
  while (i < n) {
    const c = text[i];
    if (c === "'" ) {
      i++;
      while (i < n) {
        if (text[i] === "'" && text[i + 1] === "'") i += 2;
        else if (text[i] === "'") break;
        else i++;
      }
      i++;
    } else if (c === '"') {
      i++;
      while (i < n && text[i] !== '"') i++;
      i++;
    } else if (c === "-" && text[i + 1] === "-") {
      while (i < n && text[i] !== "\n") i++;
    } else if (c === "/" && text[i + 1] === "*") {
      i = skipTrivia(text, i);
    } else if (c === "$") {
      const m = /^\$([A-Za-z_][A-Za-z0-9_]*)?\$/.exec(text.slice(i, i + 64));
      if (m) {
        const tag = m[0];
        const end = text.indexOf(tag, i + tag.length);
        i = end === -1 ? n : end + tag.length;
      } else i++;
    } else if (c === ";") {
      parts.push({ text: text.slice(start, i + 1), start });
      i++;
      start = i;
    } else i++;
  }
  if (text.slice(start).trim()) parts.push({ text: text.slice(start), start });
  return parts;
}

export async function parseSql(text: string): Promise<ParseOutput> {
  await ensureLoaded();
  try {
    return { statements: parseChunk(text, 0), errors: [] };
  } catch {
    // fall through to per-statement parsing
  }
  const statements: ParsedStatement[] = [];
  const errors: { line: number; message: string }[] = [];
  for (const part of splitStatements(text)) {
    const baseLine = countNewlines(text.slice(0, part.start));
    try {
      statements.push(...parseChunk(part.text, baseLine));
    } catch (e) {
      const at = skipTrivia(text, part.start);
      const msg = (e as Error).message.split("\n")[0].replace(/[^\x20-\x7e]/g, "?");
      errors.push({ line: countNewlines(text.slice(0, at)) + 1, message: msg });
    }
  }
  return { statements, errors };
}
