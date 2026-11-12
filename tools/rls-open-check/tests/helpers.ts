import { join } from "node:path";
import { analyzeFiles } from "../src/analyze.js";
import { collectSqlFiles } from "../src/files.js";
import type { Finding } from "../src/types.js";

export const FIXTURES = join(import.meta.dirname, "fixtures");

export async function scan(name: string) {
  return analyzeFiles(collectSqlFiles([join(FIXTURES, name)]));
}

export const rules = (fs: Finding[]) => fs.map((f) => f.rule);
export const only = (fs: Finding[], rule: string) => fs.filter((f) => f.rule === rule);
