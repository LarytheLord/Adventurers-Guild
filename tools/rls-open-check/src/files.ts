import { existsSync, readdirSync, statSync } from "node:fs";
import { basename, join } from "node:path";

/** Collect .sql files from files and directories, in migration order. */
export function collectSqlFiles(paths: string[]): string[] {
  const found: string[] = [];
  const walk = (p: string) => {
    const st = statSync(p);
    if (st.isDirectory()) {
      for (const entry of readdirSync(p)) {
        if (entry === "node_modules" || entry.startsWith(".")) continue;
        walk(join(p, entry));
      }
    } else if (p.toLowerCase().endsWith(".sql")) found.push(p);
  };
  for (const p of paths) {
    if (!existsSync(p)) throw new Error(`Path not found: ${p}`);
    walk(p);
  }
  // Supabase applies migrations in order of file name (timestamp prefix).
  return found.sort((a, b) => {
    const ba = basename(a);
    const bb = basename(b);
    return ba < bb ? -1 : ba > bb ? 1 : a < b ? -1 : a > b ? 1 : 0;
  });
}
