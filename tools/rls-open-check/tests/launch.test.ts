import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { run, VERSION } from "../src/cli.js";
import { FIXTURES } from "./helpers.js";

const root = join(import.meta.dirname, "..");
const read = (f: string) => readFileSync(join(root, f), "utf8");
const pkg = () => JSON.parse(read("package.json"));

describe("package metadata", () => {
  it("has the fields a public npm page needs", () => {
    const p = pkg();
    expect(p.name).toBe("rls-open-check");
    expect(p.version).toBe(VERSION);
    expect(p.license).toBe("MIT");
    expect(p.description).toBeTruthy();
    expect(p.repository).toMatchObject({
      type: "git",
      url: "git+https://github.com/LarytheLord/Adventurers-Guild.git",
      directory: "tools/rls-open-check",
    });
    expect(p.homepage).toContain("tools/rls-open-check");
    expect(p.bugs?.url).toContain("github.com/LarytheLord/Adventurers-Guild/issues");
    expect(p.engines.node).toBeTruthy();
    expect(p.keywords).toEqual(expect.arrayContaining(["supabase", "rls", "sarif"]));
  });
  it("ships the changelog and does not publish tests", () => {
    const p = pkg();
    expect(p.files).toEqual(expect.arrayContaining(["dist", "README.md", "LICENSE", "CHANGELOG.md"]));
    expect(p.files).not.toContain("tests");
    expect(p.publishConfig?.access).toBe("public");
  });
  it("has a changelog entry for the current version", () => {
    expect(existsSync(join(root, "CHANGELOG.md"))).toBe(true);
    expect(read("CHANGELOG.md")).toMatch(new RegExp(`^## \\[?${VERSION.replace(/\./g, "\\.")}\\]?`, "m"));
  });
});

describe("README", () => {
  const readme = () => read("README.md");
  it("has the launch sections", () => {
    for (const h of [
      "## Quick start",
      "## Sample output",
      "## GitHub Action",
      "## SARIF and GitHub code scanning",
      "## Limits",
    ])
      expect(readme()).toContain(h);
  });
  it("sample output is what the CLI really prints", async () => {
    const m = readme().match(/## Sample output[\s\S]*?```text\n([\s\S]*?)```/);
    expect(m).not.toBeNull();
    const r = await run([join(FIXTURES, "readme-sample")]);
    const actual = r.stdout.split(join(FIXTURES, "readme-sample")).join("supabase/migrations");
    expect(m![1].trimEnd()).toBe(actual.trimEnd());
  });
  it("Limits section names the untracked SQL that can cause false R1 findings", () => {
    const limits = readme().split("## Limits")[1].split("\n## ")[0];
    expect(limits).toContain("SET search_path");
    expect(limits).toMatch(/DO \$\$/);
    expect(limits).toContain("EXECUTE");
    expect(limits).toContain("false R1");
  });
  it("documents the SARIF path fallback", () => {
    expect(readme()).toMatch(/outside the git root[\s\S]*file:\/\/\//);
  });
  it("does not claim certification or audit status", () => {
    expect(readme()).not.toMatch(/CERT-In|empanel|certified|audit(ed|or)/i);
  });
  it("is plain ASCII", () => {
    for (const f of ["README.md", "CHANGELOG.md"])
      if (existsSync(join(root, f))) expect(read(f)).toMatch(/^[\x09\x0a\x0d\x20-\x7e]*$/);
  });
});
