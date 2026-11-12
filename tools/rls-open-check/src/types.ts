export type Severity = "low" | "medium" | "high" | "critical";

export const SEVERITIES: Severity[] = ["low", "medium", "high", "critical"];

export function severityRank(s: Severity): number {
  return SEVERITIES.indexOf(s);
}

export type RuleId = "R1" | "R2" | "R3" | "R4" | "R5" | "R6" | "R7";

export interface Finding {
  rule: RuleId;
  severity: Severity;
  /** Qualified object name, for example public.todos or public.fn(int). */
  object: string;
  file: string;
  line: number;
  message: string;
  fix: string;
}

export interface Warning {
  file: string;
  line: number;
  message: string;
}

export interface AnalysisResult {
  filesScanned: string[];
  findings: Finding[];
  warnings: Warning[];
}

export interface Loc {
  file: string;
  line: number;
}
