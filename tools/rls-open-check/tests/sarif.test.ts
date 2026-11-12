import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { run } from "../src/cli.js";
import { FIXTURES } from "./helpers.js";

const fx = (n: string) => join(FIXTURES, n);
const LEVELS = ["error", "warning", "note", "none"];

// Structural checks for the parts of SARIF 2.1.0 that GitHub code scanning reads.
function checkSarif(text: string) {
  const log = JSON.parse(text);
  expect(log.version).toBe("2.1.0");
  expect(log.$schema).toMatch(/sarif-schema-2\.1\.0\.json$/);
  expect(Array.isArray(log.runs)).toBe(true);
  expect(log.runs).toHaveLength(1);
  const run0 = log.runs[0];
  expect(run0.tool.driver.name).toBe("rls-open-check");
  expect(typeof run0.tool.driver.version).toBe("string");
  const rules: { id: string }[] = run0.tool.driver.rules;
  const ids = rules.map((r) => r.id);
  expect(new Set(ids).size).toBe(ids.length);
  for (const r of rules as any[]) {
    expect(r.shortDescription.text).toBeTruthy();
    expect(r.help.text).toBeTruthy();
    expect(LEVELS).toContain(r.defaultConfiguration.level);
    expect(Number(r.properties["security-severity"])).toBeGreaterThan(0);
  }
  for (const res of run0.results) {
    expect(ids).toContain(res.ruleId);
    expect(rules[res.ruleIndex].id).toBe(res.ruleId);
    expect(LEVELS).toContain(res.level);
    expect(res.message.text).toBeTruthy();
    expect(res.locations).toHaveLength(1);
    const loc = res.locations[0].physicalLocation;
    const uri: string = loc.artifactLocation.uri;
    expect(uri).not.toMatch(/^(\/|[A-Za-z]:|file:)/);
    expect(uri).not.toContain("\\");
    expect(Number.isInteger(loc.region.startLine)).toBe(true);
    expect(loc.region.startLine).toBeGreaterThanOrEqual(1);
  }
  return log;
}

describe("--format sarif", () => {
  it("prints a valid SARIF 2.1.0 log with one result per finding", async () => {
    const r = await run(["--format", "sarif", fx("mixed-app")]);
    const log = checkSarif(r.stdout);
    expect(log.runs[0].results).toHaveLength(3);
    expect(log.runs[0].results.map((x: any) => x.ruleId)).toEqual(["R1", "R2", "R5"]);
    expect(r.code).toBe(1);
  });
  it("maps severities to SARIF levels", async () => {
    const log = checkSarif((await run(["--format=sarif", fx("mixed-app")])).stdout);
    expect(log.runs[0].results.map((x: any) => x.level)).toEqual(["error", "error", "warning"]);
  });
  it("uses a repo-relative forward-slash uri and the right line", async () => {
    const log = checkSarif((await run(["--format", "sarif", fx("r2-bad-anon")])).stdout);
    const loc = log.runs[0].results[0].locations[0].physicalLocation;
    expect(loc.artifactLocation.uri).toMatch(/^tools\/rls-open-check\/tests\/fixtures\/r2-bad-anon\/.+\.sql$/);
  });
  it("is valid with zero findings and still lists the rules", async () => {
    const r = await run(["--format", "sarif", fx("r1-good")]);
    const log = checkSarif(r.stdout);
    expect(log.runs[0].results).toEqual([]);
    expect(log.runs[0].tool.driver.rules.map((x: any) => x.id)).toEqual(["R1", "R2", "R3", "R4", "R5", "R6", "R7"]);
    expect(r.code).toBe(0);
  });
  it("reports parse warnings as notifications, not results", async () => {
    const log = checkSarif((await run(["--format", "sarif", fx("parse-error")])).stdout);
    const n = log.runs[0].invocations[0].toolExecutionNotifications;
    expect(n).toHaveLength(1);
    expect(n[0].level).toBe("warning");
  });
  it("output is plain ASCII and --fail-on still sets the exit code", async () => {
    const r = await run(["--format", "sarif", "--fail-on", "critical", fx("r5-bad")]);
    expect(r.stdout).toMatch(/^[\x09\x0a\x0d\x20-\x7e]*$/);
    expect(r.code).toBe(0);
  });
  it("rejects an unknown format and keeps --json working", async () => {
    expect((await run(["--format", "xml", fx("r1-good")])).code).toBe(2);
    expect(JSON.parse((await run(["--json", fx("r1-good")])).stdout).tool).toBe("rls-open-check");
    expect(JSON.parse((await run(["--format", "json", fx("r1-good")])).stdout).tool).toBe("rls-open-check");
  });
});

describe("sarif toUri", () => {
  it("keeps paths inside the root relative with forward slashes", async () => {
    const { toUri } = await import("../src/sarif.js");
    expect(toUri("/repo/supabase/migrations/001 a.sql", "/repo")).toBe("supabase/migrations/001%20a.sql");
  });
  it("falls back to an absolute file URI for paths outside the root", async () => {
    const { toUri } = await import("../src/sarif.js");
    expect(toUri("/other/db/001.sql", "/repo/app")).toBe("file:///other/db/001.sql");
    expect(toUri("/repo/other/001.sql", "/repo/app")).toBe("file:///repo/other/001.sql");
  });
  it("does not treat a sibling folder with the same prefix as inside the root", async () => {
    const { toUri } = await import("../src/sarif.js");
    expect(toUri("/repo2/001.sql", "/repo")).toBe("file:///repo2/001.sql");
  });
});
