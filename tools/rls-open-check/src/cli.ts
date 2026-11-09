import { analyzeFiles } from "./analyze.js";
import { collectSqlFiles } from "./files.js";
import { formatJson, formatText } from "./report.js";
import { SEVERITIES, severityRank, type Severity } from "./types.js";

export const VERSION = "0.1.0";

const HELP = `rls-open-check - static linter for risky Row Level Security setups

Usage: rls-open-check [options] [paths...]

Paths are .sql files or directories. Default: supabase/migrations
Files are read in file name order, like Supabase applies them.

Options:
  --fail-on <level>  Exit 1 if a finding is at or above this level:
                     low, medium, high, critical (default: high)
  --json             Print JSON instead of text
  -h, --help         Show this help
  -v, --version      Show the version

Exit codes: 0 ok, 1 findings at or above --fail-on, 2 usage or file error.
`;

export interface CliResult {
  code: number;
  stdout: string;
  stderr: string;
}

export async function run(argv: string[]): Promise<CliResult> {
  let failOn: Severity = "high";
  let json = false;
  const paths: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "-h" || a === "--help") return { code: 0, stdout: HELP, stderr: "" };
    if (a === "-v" || a === "--version") return { code: 0, stdout: VERSION + "\n", stderr: "" };
    if (a === "--json") json = true;
    else if (a === "--fail-on" || a.startsWith("--fail-on=")) {
      const v = a.includes("=") ? a.split("=")[1] : argv[++i];
      if (!SEVERITIES.includes(v as Severity))
        return { code: 2, stdout: "", stderr: `Invalid --fail-on value: ${v ?? "(missing)"}\n` };
      failOn = v as Severity;
    } else if (a.startsWith("-")) return { code: 2, stdout: "", stderr: `Unknown option: ${a}\n${HELP}` };
    else paths.push(a);
  }
  if (paths.length === 0) paths.push("supabase/migrations");

  let files: string[];
  try {
    files = collectSqlFiles(paths);
  } catch (e) {
    return { code: 2, stdout: "", stderr: `${(e as Error).message}\n` };
  }
  if (files.length === 0)
    return { code: 2, stdout: "", stderr: `No .sql files found in: ${paths.join(", ")}\n` };

  const result = await analyzeFiles(files);
  const failing = result.findings.some((f) => severityRank(f.severity) >= severityRank(failOn));
  return {
    code: failing ? 1 : 0,
    stdout: json ? formatJson(result, failOn) : formatText(result, failOn),
    stderr: "",
  };
}
