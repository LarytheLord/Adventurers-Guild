import type { AnalysisResult, Finding } from "./types.js";
import { severityRank, type Severity } from "./types.js";

export function formatText(r: AnalysisResult, failOn: Severity): string {
  const lines: string[] = [];
  for (const f of r.findings) {
    lines.push(`${f.file}:${f.line}  [${f.severity}] ${f.rule}  ${f.object}`);
    lines.push(`    ${f.message}`);
    lines.push(`    Fix: ${f.fix}`);
    lines.push("");
  }
  for (const w of r.warnings) lines.push(`warning: ${w.file}:${w.line}  ${w.message}`);
  if (r.warnings.length) lines.push("");
  const counts = summarize(r.findings);
  lines.push(
    `Scanned ${r.filesScanned.length} file(s). ${r.findings.length} finding(s): ` +
      `${counts.critical} critical, ${counts.high} high, ${counts.medium} medium, ${counts.low} low.`
  );
  const failing = r.findings.filter((f) => severityRank(f.severity) >= severityRank(failOn)).length;
  lines.push(
    failing > 0
      ? `${failing} finding(s) at or above "${failOn}": failing.`
      : `No findings at or above "${failOn}".`
  );
  lines.push("Static check of migration files only. A clean result is not proof of safety.");
  return lines.join("\n") + "\n";
}

export function summarize(findings: Finding[]): Record<Severity, number> {
  const c: Record<Severity, number> = { low: 0, medium: 0, high: 0, critical: 0 };
  for (const f of findings) c[f.severity]++;
  return c;
}

export function formatJson(r: AnalysisResult, failOn: Severity): string {
  return (
    JSON.stringify(
      {
        tool: "rls-open-check",
        failOn,
        filesScanned: r.filesScanned,
        summary: summarize(r.findings),
        findings: r.findings,
        warnings: r.warnings,
      },
      null,
      2
    ) + "\n"
  );
}
