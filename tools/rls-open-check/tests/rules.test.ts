import { describe, expect, it } from "vitest";
import { only, rules, scan } from "./helpers.js";
import { analyzeSources } from "../src/analyze.js";

describe("R1 table without RLS", () => {
  it("flags a public table that never enables RLS", async () => {
    const r = await scan("r1-bad");
    expect(rules(r.findings)).toEqual(["R1"]);
    expect(r.findings[0].object).toBe("public.todos");
    expect(r.findings[0].severity).toBe("critical");
    expect(r.findings[0].line).toBe(1);
  });
  it("does not flag tables with RLS, other schemas or temp tables", async () => {
    expect((await scan("r1-good")).findings).toEqual([]);
  });
  it("does not flag when RLS is enabled in a later migration", async () => {
    expect((await scan("r1-enabled-later")).findings).toEqual([]);
  });
});

describe("R2 open policy for anon or public", () => {
  it("flags every write command granted to anon", async () => {
    const r = await scan("r2-bad-anon");
    const f = only(r.findings, "R2");
    expect(f.map((x) => x.object)).toEqual([
      "public.posts.anyone writes",
      "public.posts.anyone edits",
      "public.posts.anyone deletes",
      "public.posts.anyone all",
    ]);
    expect(f.every((x) => x.severity === "critical")).toBe(true);
    expect(r.findings).toHaveLength(4);
  });
  it("treats a missing TO clause, TO public and 1=1 as open", async () => {
    const f = only((await scan("r2-bad-public-default")).findings, "R2");
    expect(f.map((x) => x.object)).toEqual([
      "public.notes.read all",
      "public.notes.explicit public",
      "public.notes.tautology",
    ]);
  });
  it("rates a SELECT-only open policy high, not critical", async () => {
    const f = only((await scan("r2-select-only")).findings, "R2");
    expect(f).toHaveLength(1);
    expect(f[0].severity).toBe("high");
  });
  it("does not flag real conditions, authenticated reads or restrictive policies", async () => {
    expect((await scan("r2-good")).findings).toEqual([]);
  });
});

describe("R3 authenticated can change anyone's rows", () => {
  it("flags USING (true) for UPDATE, DELETE and ALL", async () => {
    const r = await scan("r3-bad");
    expect(rules(r.findings)).toEqual(["R3", "R3", "R3"]);
    expect(r.findings[0].severity).toBe("high");
  });
  it("does not flag owner checks", async () => {
    expect((await scan("r3-good")).findings).toEqual([]);
  });
});

describe("R4 grant to anon on a table without RLS", () => {
  it("flags explicit and ALL TABLES grants", async () => {
    const f = only((await scan("r4-bad")).findings, "R4");
    expect(f.map((x) => x.object).sort()).toEqual(["public.events", "public.logs"]);
    expect(f.find((x) => x.object === "public.logs")?.line).toBe(3);
  });
  it("does not flag grants on tables that have RLS", async () => {
    // the grant has no policy, so R7 (low) applies; this test is about R4
    expect(only((await scan("r4-good")).findings, "R4")).toEqual([]);
  });
  it("does not flag grants that were revoked", async () => {
    expect((await scan("r4-revoked")).findings).toEqual([]);
  });
});

describe("R5 SECURITY DEFINER without search_path", () => {
  it("flags functions with and without a schema prefix", async () => {
    const f = only((await scan("r5-bad")).findings, "R5");
    expect(f.map((x) => x.object)).toEqual(["public.get_secret()", "public.increment(int4)"]);
  });
  it("does not flag search_path, invoker functions or other schemas", async () => {
    expect((await scan("r5-good")).findings).toEqual([]);
  });
});

describe("R6 RLS disabled later", () => {
  it("flags DISABLE ROW LEVEL SECURITY in a later migration", async () => {
    const r = await scan("r6-bad");
    expect(rules(r.findings)).toEqual(["R6"]);
    expect(r.findings[0].file).toMatch(/002_disable\.sql$/);
    expect(r.findings[0].line).toBe(1);
  });
  it("clears the finding when RLS is enabled again", async () => {
    expect((await scan("r6-reenabled")).findings).toEqual([]);
  });
});

describe("migration ordering", () => {
  it("DROP POLICY removes an earlier finding", async () => {
    expect((await scan("order-drop-policy")).findings).toEqual([]);
  });
  it("ALTER POLICY that fixes the condition removes the finding", async () => {
    expect((await scan("order-alter-policy")).findings).toEqual([]);
  });
  it("DROP TABLE removes the table, its policies and grants", async () => {
    expect((await scan("order-drop-table")).findings).toEqual([]);
  });
  it("CREATE OR REPLACE, ALTER FUNCTION and DROP FUNCTION update R5", async () => {
    expect((await scan("order-replace-fn")).findings).toEqual([]);
  });
  it("enabling RLS after an anon grant removes R4", async () => {
    expect(only((await scan("order-grant-before-rls")).findings, "R4")).toEqual([]);
  });
  it("reads files in file name order, not argument order", async () => {
    const { analyzeSources } = await import("../src/analyze.js");
    const create = { file: "20240101_a.sql", sql: "create table public.t (id int);" };
    const secure = { file: "20240102_b.sql", sql: "alter table public.t enable row level security;" };
    expect((await analyzeSources([create, secure])).findings).toEqual([]);
    // wrong order would hide nothing here, so also prove a later disable wins
    const disable = { file: "20240103_c.sql", sql: "alter table public.t disable row level security;" };
    expect(rules((await analyzeSources([create, secure, disable])).findings)).toEqual(["R6"]);
  });
});

describe("REVOKE handling", () => {
  it("drops an anon grant on a table that never gets RLS (no R4, no R7)", async () => {
    const r = await analyzeSources([
      { file: "a.sql", sql: "create table public.t (id int); grant all on public.t to anon; revoke all on public.t from anon;" },
    ]);
    expect(rules(r.findings)).toEqual(["R1"]);
  });
});

describe("R7 grant without matching RLS policy", () => {
  it("flags all four commands when the table has no RLS", async () => {
    const f = only((await scan("r7-no-rls")).findings, "R7");
    expect(f).toHaveLength(1);
    expect(f[0].object).toBe("public.notes");
    expect(f[0].severity).toBe("high");
    expect(f[0].line).toBe(2);
    expect(f[0].message).toContain("authenticated");
    expect(f[0].message).toContain("SELECT, INSERT, UPDATE, DELETE");
  });
  it("flags only the commands that have no policy when RLS is on", async () => {
    const f = only((await scan("r7-no-policy-cmd")).findings, "R7");
    expect(f).toHaveLength(2);
    const auth = f.find((x) => x.message.includes("authenticated"))!;
    const anon = f.find((x) => x.message.includes("anon"))!;
    expect(auth.message).toContain("INSERT, UPDATE, DELETE");
    expect(auth.message).not.toContain("SELECT,");
    expect(auth.severity).toBe("low");
    expect(anon.message).toContain("SELECT");
  });
  it("does not flag when every granted command has a policy for the role", async () => {
    expect(only((await scan("r7-good")).findings, "R7")).toEqual([]);
  });
  it("does not flag a revoked grant", async () => {
    expect(only((await scan("r7-revoked")).findings, "R7")).toEqual([]);
  });
  it("follows ALTER DEFAULT PRIVILEGES for tables created later", async () => {
    const f = only((await scan("r7-defaults")).findings, "R7");
    expect(f).toHaveLength(1);
    expect(f[0].object).toBe("public.later");
    expect(f[0].message).toContain("SELECT, INSERT");
  });
  it("handles GRANT ON ALL TABLES IN SCHEMA and a policy for public", async () => {
    const f = only((await scan("r7-all-in-schema")).findings, "R7");
    expect(f.map((x) => x.object)).toEqual(["public.a"]);
  });
  it("ignores tables outside the public schema", async () => {
    const r = await analyzeSources([
      { file: "a.sql", sql: "create table app.t (id int); grant select on app.t to authenticated;" },
    ]);
    expect(only(r.findings, "R7")).toEqual([]);
  });
});

describe("mixed app and parse errors", () => {
  it("reports findings across several files with file and line", async () => {
    const r = await scan("mixed-app");
    expect(r.findings.map((f) => `${f.rule}:${f.object}`)).toEqual([
      "R1:public.profiles",
      "R2:public.orders.orders open",
      "R5:public.admin_sum()",
    ]);
    expect(r.findings[1].file).toMatch(/20240101000000_init\.sql$/);
    expect(r.findings[1].line).toBe(4);
  });
  it("skips one bad statement, warns, and still checks the rest", async () => {
    const r = await scan("parse-error");
    expect(r.warnings).toHaveLength(1);
    expect(r.warnings[0].line).toBe(2);
    expect(rules(r.findings)).toEqual(["R1"]);
  });
});
