import { existsSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { RULES } from "./rules.js";
import type { AnalysisResult, Severity } from "./types.js";

const SCHEMA = "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/main/sarif-2.1/schema/sarif-schema-2.1.0.json";

const LEVEL: Record<Severity, string> = { critical: "error", high: "error", medium: "warning", low: "note" };
// GitHub code scanning maps security-severity to critical/high/medium/low.
const SECURITY_SEVERITY: Record<Severity, string> = { critical: "9.5", high: "8.0", medium: "5.5", low: "3.0" };

/** Nearest ancestor of `from` that holds a .git entry, or `from` itself. */
function repoRoot(from: string): string {
  let dir = resolve(from);
  for (;;) {
    if (existsSync(join(dir, ".git"))) return dir;
    const up = dirname(dir);
    if (up === dir) return resolve(from);
    dir = up;
  }
}

/** Repo-relative uri with forward slashes, as code scanning expects. */
export function toUri(file: string, root: string): string {
  let p = isAbsolute(file) ? relative(root, file) : relative(root, resolve(file));
  p = p.split(sep).join("/");
  return p.split("/").map(encodeURIComponent).join("/");
}

export function formatSarif(r: AnalysisResult, version: string, cwd: string = process.cwd()): string {
  const root = repoRoot(cwd);
  const ruleIndex = new Map(RULES.map((x, i) => [x.id, i]));
  const log = {
    $schema: SCHEMA,
    version: "2.1.0",
    runs: [
      {
        tool: {
          driver: {
            name: "rls-open-check",
            version,
            rules: RULES.map((x) => ({
              id: x.id,
              name: x.name,
              shortDescription: { text: x.description },
              help: { text: x.description },
              defaultConfiguration: { level: LEVEL[x.severity] },
              properties: { "security-severity": SECURITY_SEVERITY[x.severity], tags: ["security", "supabase", "rls"] },
            })),
          },
        },
        results: r.findings.map((f) => ({
          ruleId: f.rule,
          ruleIndex: ruleIndex.get(f.rule),
          level: LEVEL[f.severity],
          message: { text: `${f.message} Fix: ${f.fix}` },
          locations: [
            {
              physicalLocation: {
                artifactLocation: { uri: toUri(f.file, root) },
                region: { startLine: Math.max(1, f.line) },
              },
            },
          ],
        })),
        invocations: [
          {
            executionSuccessful: true,
            toolExecutionNotifications: r.warnings.map((w) => ({
              level: "warning",
              message: { text: w.message },
              locations: [
                {
                  physicalLocation: {
                    artifactLocation: { uri: toUri(w.file, root) },
                    region: { startLine: Math.max(1, w.line) },
                  },
                },
              ],
            })),
          },
        ],
      },
    ],
  };
  return JSON.stringify(log, null, 2) + "\n";
}
