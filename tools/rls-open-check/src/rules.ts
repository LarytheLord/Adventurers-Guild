import type { RuleId, Severity } from "./types.js";

export interface RuleInfo {
  id: RuleId;
  name: string;
  description: string;
  severity: Severity;
}

export const RULES: RuleInfo[] = [
  { id: "R1", name: "TableWithoutRls", severity: "critical", description: "Table in the public schema never has Row Level Security enabled." },
  { id: "R2", name: "OpenPolicyForAnon", severity: "high", description: "Policy lets anon or public use rows with a condition that is always true." },
  { id: "R3", name: "AuthenticatedChangesAnyRow", severity: "high", description: "Policy lets any logged-in user update or delete any row." },
  { id: "R4", name: "AnonGrantWithoutRls", severity: "high", description: "anon is granted privileges on a table that has no Row Level Security." },
  { id: "R5", name: "SecurityDefinerWithoutSearchPath", severity: "medium", description: "SECURITY DEFINER function has no SET search_path." },
  { id: "R6", name: "RlsDisabled", severity: "critical", description: "Row Level Security was disabled on a table in the public schema." },
  { id: "R7", name: "GrantWithoutPolicy", severity: "high", description: "anon or authenticated has SELECT, INSERT, UPDATE or DELETE on a public table, and RLS is off or no policy covers that command." },
];
