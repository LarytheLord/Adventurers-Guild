import { readFileSync } from "node:fs";
import type { AnalysisResult, Finding, Loc, Warning } from "./types.js";
import { Node, parseSql } from "./parse.js";

const DEFAULT_SCHEMA = "public";

interface TableState {
  schema: string;
  name: string;
  created: Loc | undefined;
  rls: boolean;
  disabledAt: Loc | undefined;
  /** Privileges granted to anon or PUBLIC, with where they were granted. */
  anonGrant: { loc: Loc; privs: Set<string> } | undefined;
  /** DML privileges (select, insert, update, delete) per API role, for R7. */
  dml: Map<ApiRole, DmlGrant>;
}

type ApiRole = "anon" | "authenticated";
const API_ROLES: ApiRole[] = ["anon", "authenticated"];
const DML = ["select", "insert", "update", "delete"];
interface DmlGrant {
  loc: Loc;
  privs: Set<string>;
}

/** API roles a grantee list reaches. PUBLIC reaches both. */
function apiRolesOf(roles: string[]): ApiRole[] {
  return API_ROLES.filter((r) => roles.includes(r) || roles.includes("public"));
}

/** DML privileges named by a privilege list, with ALL expanded. */
function dmlPrivs(privs: string[]): string[] {
  return privs.includes("all") ? DML : DML.filter((p) => privs.includes(p));
}

function applyDml(map: Map<ApiRole, DmlGrant>, role: ApiRole, isGrant: boolean, privs: string[], loc: Loc) {
  const ps = dmlPrivs(privs);
  if (ps.length === 0) return;
  if (isGrant) {
    const cur = map.get(role) ?? { loc, privs: new Set<string>() };
    for (const p of ps) cur.privs.add(p);
    map.set(role, cur);
  } else {
    const cur = map.get(role);
    if (!cur) return;
    for (const p of ps) cur.privs.delete(p);
    if (cur.privs.size === 0) map.delete(role);
  }
}

interface PolicyState {
  name: string;
  table: string;
  cmd: string;
  roles: string[];
  permissive: boolean;
  qual: Node | undefined;
  withCheck: Node | undefined;
  loc: Loc;
}

interface FunctionState {
  schema: string;
  name: string;
  signature: string;
  securityDefiner: boolean;
  hasSearchPath: boolean;
  loc: Loc;
}

const tkey = (schema: string, name: string) => `${schema}.${name}`;

function rangeVarKey(rv: Node): string {
  return tkey(rv.schemaname ?? DEFAULT_SCHEMA, rv.relname);
}

function strings(list: Node[] | undefined): string[] {
  return (list ?? []).map((x) => x.String?.sval).filter((s): s is string => typeof s === "string");
}

function typeName(t: Node | undefined): string {
  const names = strings(t?.names).filter((n) => n !== "pg_catalog");
  return names.join(".");
}

function roleNames(roles: Node[] | undefined): string[] {
  return (roles ?? []).map((r) => {
    const spec = r.RoleSpec;
    if (!spec) return "?";
    if (spec.roletype === "ROLESPEC_PUBLIC") return "public";
    if (spec.roletype === "ROLESPEC_CSTRING") return String(spec.rolename).toLowerCase();
    return String(spec.roletype).toLowerCase();
  });
}

const isAnonLike = (roles: string[]) => roles.includes("anon") || roles.includes("public");

/** True when the expression is a constant that is always true. */
export function isTrueConst(expr: Node | undefined): boolean {
  if (!expr) return false;
  if (expr.A_Const) {
    const c = expr.A_Const;
    if (c.boolval?.boolval === true) return true;
    if (c.sval && ["true", "t", "yes", "on", "1"].includes(String(c.sval.sval).toLowerCase()))
      return false; // bare string is not a boolean; only matters when cast
    return false;
  }
  if (expr.TypeCast) {
    const inner = expr.TypeCast.arg;
    if (inner?.A_Const?.sval) {
      const v = String(inner.A_Const.sval.sval).toLowerCase();
      const t = typeName(expr.TypeCast.typeName);
      return t === "bool" && ["true", "t", "yes", "on", "1"].includes(v);
    }
    return isTrueConst(inner);
  }
  if (expr.A_Expr && expr.A_Expr.kind === "AEXPR_OP") {
    const op = strings(expr.A_Expr.name)[0];
    const l = expr.A_Expr.lexpr?.A_Const;
    const r = expr.A_Expr.rexpr?.A_Const;
    if (op === "=" && l && r) {
      const lv = l.ival?.ival ?? l.sval?.sval;
      const rv = r.ival?.ival ?? r.sval?.sval;
      // ival 0 is serialized as an empty object
      const lz = l.ival ? (l.ival.ival ?? 0) : lv;
      const rz = r.ival ? (r.ival.ival ?? 0) : rv;
      return lz !== undefined && lz === rz;
    }
  }
  if (expr.BoolExpr && expr.BoolExpr.boolop === "OR_EXPR") {
    return (expr.BoolExpr.args ?? []).some((a: Node) => isTrueConst(a));
  }
  if (expr.BoolExpr && expr.BoolExpr.boolop === "AND_EXPR") {
    const args: Node[] = expr.BoolExpr.args ?? [];
    return args.length > 0 && args.every((a) => isTrueConst(a));
  }
  return false;
}

class Analyzer {
  tables = new Map<string, TableState>();
  policies = new Map<string, PolicyState>();
  functions = new Map<string, FunctionState>();
  /** Default privileges for anon on future tables, per schema ("*" = all). */
  defaultAnon = new Map<string, { loc: Loc; privs: Set<string> }>();
  /** Default DML privileges for anon and authenticated, per schema ("*" = all). */
  defaultDml = new Map<string, Map<ApiRole, DmlGrant>>();

  private table(key: string, schema: string, name: string): TableState {
    let t = this.tables.get(key);
    if (!t) {
      t = { schema, name, created: undefined, rls: false, disabledAt: undefined, anonGrant: undefined, dml: new Map() };
      this.tables.set(key, t);
    }
    return t;
  }

  private createTable(rv: Node, loc: Loc) {
    if (rv.relpersistence === "t") return; // temp table
    const schema = rv.schemaname ?? DEFAULT_SCHEMA;
    const key = tkey(schema, rv.relname);
    // CREATE TABLE IF NOT EXISTS on an existing table changes nothing.
    if (this.tables.get(key)?.created) return;
    const t = this.table(key, schema, rv.relname);
    t.created = loc;
    const d = this.defaultAnon.get(schema) ?? this.defaultAnon.get("*");
    if (d) t.anonGrant = { loc: d.loc, privs: new Set(d.privs) };
    const dd = this.defaultDml.get(schema) ?? this.defaultDml.get("*");
    if (dd) for (const [role, g] of dd) t.dml.set(role, { loc: g.loc, privs: new Set(g.privs) });
  }

  private dropTable(key: string) {
    this.tables.delete(key);
    for (const [pk, p] of this.policies) if (p.table === key) this.policies.delete(pk);
  }

  private privNames(g: Node): string[] {
    const privs: Node[] | undefined = g.privileges;
    if (!privs || privs.length === 0) return ["all"];
    return privs.map((p) => String(p.AccessPriv?.priv_name ?? "all").toLowerCase());
  }

  private applyGrant(g: Node, loc: Loc) {
    if (g.objtype !== "OBJECT_TABLE") return;
    const grantees = roleNames(g.grantees);
    const apiRoles = apiRolesOf(grantees);
    if (apiRoles.length === 0) return;
    const privs = this.privNames(g);
    let targets: TableState[] = [];
    if (g.targtype === "ACL_TARGET_OBJECT") {
      for (const o of g.objects ?? []) {
        if (!o.RangeVar) continue;
        const t = this.tables.get(rangeVarKey(o.RangeVar));
        if (t) targets.push(t);
      }
    } else if (g.targtype === "ACL_TARGET_ALL_IN_SCHEMA") {
      const schemas = strings(g.objects);
      targets = [...this.tables.values()].filter((t) => schemas.includes(t.schema));
    } else return;
    for (const t of targets) {
      for (const role of apiRoles) applyDml(t.dml, role, g.is_grant === true, privs, loc);
      if (isAnonLike(grantees)) this.updateGrant(t, g.is_grant === true, privs, loc);
    }
  }

  private updateGrant(t: TableState, isGrant: boolean, privs: string[], loc: Loc) {
    if (isGrant) {
      if (!t.anonGrant) t.anonGrant = { loc, privs: new Set() };
      for (const p of privs) t.anonGrant.privs.add(p);
    } else if (t.anonGrant) {
      if (privs.includes("all")) t.anonGrant = undefined;
      else {
        for (const p of privs) t.anonGrant.privs.delete(p);
        if (t.anonGrant.privs.has("all")) t.anonGrant.privs.clear(), t.anonGrant.privs.add("all");
        if (t.anonGrant.privs.size === 0) t.anonGrant = undefined;
      }
    }
  }

  private applyDefaultPrivileges(s: Node, loc: Loc) {
    const action = s.action;
    if (!action || action.objtype !== "OBJECT_TABLE") return;
    const grantees = roleNames(action.grantees);
    const apiRoles = apiRolesOf(grantees);
    if (apiRoles.length === 0) return;
    let schemas: string[] = ["*"];
    for (const o of s.options ?? []) {
      if (o.DefElem?.defname === "schemas") schemas = strings(o.DefElem.arg?.List?.items);
    }
    const privs = this.privNames(action);
    for (const sc of schemas) {
      const dm = this.defaultDml.get(sc) ?? new Map<ApiRole, DmlGrant>();
      for (const role of apiRoles) applyDml(dm, role, action.is_grant === true, privs, loc);
      this.defaultDml.set(sc, dm);
      if (!isAnonLike(grantees)) continue;
      if (action.is_grant !== true) {
        if (sc === "*") this.defaultAnon.clear();
        else this.defaultAnon.delete(sc);
      } else {
        const cur = this.defaultAnon.get(sc) ?? { loc, privs: new Set<string>() };
        for (const p of privs) cur.privs.add(p);
        this.defaultAnon.set(sc, cur);
      }
    }
  }

  private funcSignature(parameters: Node[] | undefined): string {
    return (parameters ?? [])
      .map((p) => p.FunctionParameter)
      .filter((p) => p && p.mode !== "FUNC_PARAM_OUT" && p.mode !== "FUNC_PARAM_TABLE")
      .map((p) => typeName(p.argType))
      .join(",");
  }

  private objWithArgsSig(o: Node): string | undefined {
    if (o.args_unspecified) return undefined;
    return (o.objargs ?? []).map((a: Node) => typeName(a.TypeName ?? a)).join(",");
  }

  private splitFuncName(names: string[]): { schema: string; name: string } {
    return names.length > 1
      ? { schema: names[names.length - 2], name: names[names.length - 1] }
      : { schema: DEFAULT_SCHEMA, name: names[0] };
  }

  private createFunction(s: Node, loc: Loc) {
    const { schema, name } = this.splitFuncName(strings(s.funcname));
    const signature = this.funcSignature(s.parameters);
    let securityDefiner = false;
    let hasSearchPath = false;
    for (const o of s.options ?? []) {
      const d = o.DefElem;
      if (!d) continue;
      if (d.defname === "security") securityDefiner = d.arg?.Boolean?.boolval === true;
      if (d.defname === "set" && d.arg?.VariableSetStmt?.name === "search_path") hasSearchPath = true;
    }
    this.functions.set(`${schema}.${name}(${signature})`, {
      schema,
      name,
      signature,
      securityDefiner,
      hasSearchPath,
      loc,
    });
  }

  private matchingFunctions(o: Node): [string, FunctionState][] {
    const { schema, name } = this.splitFuncName(strings(o.objname));
    const sig = this.objWithArgsSig(o);
    return [...this.functions.entries()].filter(
      ([, f]) => f.schema === schema && f.name === name && (sig === undefined || f.signature === sig)
    );
  }

  private alterTable(s: Node, loc: Loc) {
    if (s.objtype !== "OBJECT_TABLE" && s.objtype !== undefined) return;
    const rv = s.relation;
    if (!rv) return;
    const key = rangeVarKey(rv);
    for (const c of s.cmds ?? []) {
      const sub = c.AlterTableCmd?.subtype;
      if (sub === "AT_EnableRowSecurity") {
        const t = this.table(key, rv.schemaname ?? DEFAULT_SCHEMA, rv.relname);
        t.rls = true;
        t.disabledAt = undefined;
      } else if (sub === "AT_DisableRowSecurity") {
        const t = this.table(key, rv.schemaname ?? DEFAULT_SCHEMA, rv.relname);
        t.rls = false;
        t.disabledAt = loc;
      }
    }
  }

  apply(node: Node, file: string, line: number) {
    const loc: Loc = { file, line };
    const type = Object.keys(node)[0];
    const s = node[type];
    switch (type) {
      case "CreateStmt":
        this.createTable(s.relation, loc);
        break;
      case "CreateTableAsStmt":
        if (s.objtype === "OBJECT_TABLE" && s.into?.rel) this.createTable(s.into.rel, loc);
        break;
      case "AlterTableStmt":
        this.alterTable(s, loc);
        break;
      case "RenameStmt":
        if (s.renameType === "OBJECT_TABLE" && s.relation) {
          const old = rangeVarKey(s.relation);
          const t = this.tables.get(old);
          if (t) {
            const nk = tkey(t.schema, s.newname);
            this.tables.delete(old);
            t.name = s.newname;
            this.tables.set(nk, t);
            for (const p of this.policies.values()) if (p.table === old) p.table = nk;
          }
        } else if (s.renameType === "OBJECT_POLICY" && s.relation) {
          const tk = rangeVarKey(s.relation);
          const p = this.policies.get(`${tk}::${s.subname}`);
          if (p) {
            this.policies.delete(`${tk}::${s.subname}`);
            p.name = s.newname;
            this.policies.set(`${tk}::${s.newname}`, p);
          }
        }
        break;
      case "AlterObjectSchemaStmt":
        if (s.objectType === "OBJECT_TABLE" && s.relation) {
          const old = rangeVarKey(s.relation);
          const t = this.tables.get(old);
          if (t) {
            const nk = tkey(s.newschema, t.name);
            this.tables.delete(old);
            t.schema = s.newschema;
            this.tables.set(nk, t);
            for (const p of this.policies.values()) if (p.table === old) p.table = nk;
          }
        }
        break;
      case "DropStmt":
        this.applyDrop(s);
        break;
      case "CreatePolicyStmt": {
        const tk = rangeVarKey(s.table);
        const roles = roleNames(s.roles);
        this.policies.set(`${tk}::${s.policy_name}`, {
          name: s.policy_name,
          table: tk,
          cmd: String(s.cmd_name ?? "all").toLowerCase(),
          roles: roles.length ? roles : ["public"],
          permissive: s.permissive === true,
          qual: s.qual,
          withCheck: s.with_check,
          loc,
        });
        break;
      }
      case "AlterPolicyStmt": {
        const tk = rangeVarKey(s.table);
        const p = this.policies.get(`${tk}::${s.policy_name}`);
        if (p) {
          const roles = roleNames(s.roles);
          if (roles.length) p.roles = roles;
          if (s.qual) p.qual = s.qual;
          if (s.with_check) p.withCheck = s.with_check;
          p.loc = loc;
        }
        break;
      }
      case "GrantStmt":
        this.applyGrant(s, loc);
        break;
      case "AlterDefaultPrivilegesStmt":
        this.applyDefaultPrivileges(s, loc);
        break;
      case "CreateFunctionStmt":
        this.createFunction(s, loc);
        break;
      case "AlterFunctionStmt":
        if (s.func) {
          for (const [, f] of this.matchingFunctions(s.func)) {
            for (const a of s.actions ?? []) {
              const d = a.DefElem;
              if (d?.defname === "security") f.securityDefiner = d.arg?.Boolean?.boolval === true;
              if (d?.defname === "set" && d.arg?.VariableSetStmt?.name === "search_path") {
                f.hasSearchPath = d.arg.VariableSetStmt.kind !== "VAR_RESET";
              }
              if (d?.defname === "reset" && d.arg?.VariableSetStmt?.name === "search_path") {
                f.hasSearchPath = false;
              }
            }
          }
        }
        break;
      default:
        break;
    }
  }

  private applyDrop(s: Node) {
    for (const o of s.objects ?? []) {
      if (s.removeType === "OBJECT_TABLE") {
        const names = strings(o.List?.items);
        const [schema, name] = names.length > 1 ? names.slice(-2) : [DEFAULT_SCHEMA, names[0]];
        this.dropTable(tkey(schema, name));
      } else if (s.removeType === "OBJECT_POLICY") {
        const names = strings(o.List?.items);
        if (names.length < 2) continue;
        const policy = names[names.length - 1];
        const table = names.slice(0, -1);
        const [schema, name] = table.length > 1 ? table.slice(-2) : [DEFAULT_SCHEMA, table[0]];
        this.policies.delete(`${tkey(schema, name)}::${policy}`);
      } else if (s.removeType === "OBJECT_FUNCTION" && o.ObjectWithArgs) {
        for (const [k] of this.matchingFunctions(o.ObjectWithArgs)) this.functions.delete(k);
      }
    }
  }

  /** True when a permissive policy on the table covers this command for the role. */
  private hasPolicy(table: string, cmd: string, role: ApiRole): boolean {
    for (const p of this.policies.values()) {
      if (p.table !== table || !p.permissive) continue;
      if (p.cmd !== cmd && p.cmd !== "all") continue;
      if (p.roles.includes(role) || p.roles.includes("public")) return true;
    }
    return false;
  }

  findings(): Finding[] {
    const out: Finding[] = [];

    for (const [key, t] of this.tables) {
      const isPublic = t.schema === DEFAULT_SCHEMA;
      if (!t.rls && t.disabledAt && isPublic) {
        out.push({
          rule: "R6",
          severity: "critical",
          object: key,
          file: t.disabledAt.file,
          line: t.disabledAt.line,
          message: `Row Level Security is disabled on ${key}, so the API can read and write every row.`,
          fix: `Run ALTER TABLE ${key} ENABLE ROW LEVEL SECURITY and add policies for the access you want.`,
        });
      } else if (!t.rls && t.created && isPublic) {
        out.push({
          rule: "R1",
          severity: "critical",
          object: key,
          file: t.created.file,
          line: t.created.line,
          message: `Table ${key} is in the public schema and never has Row Level Security enabled.`,
          fix: `Add ALTER TABLE ${key} ENABLE ROW LEVEL SECURITY and policies for who may read and write.`,
        });
      }
      if (!t.rls && t.anonGrant && isPublic && (t.created || t.disabledAt)) {
        const privs = [...t.anonGrant.privs].sort().join(", ");
        out.push({
          rule: "R4",
          severity: "high",
          object: key,
          file: t.anonGrant.loc.file,
          line: t.anonGrant.loc.line,
          message: `anon is granted (${privs}) on ${key}, which has no Row Level Security.`,
          fix: `Enable RLS on ${key}, or run REVOKE ALL ON ${key} FROM anon.`,
        });
      }
    }

    for (const [key, t] of this.tables) {
      if (t.schema !== DEFAULT_SCHEMA || !(t.created || t.disabledAt)) continue;
      for (const role of API_ROLES) {
        const grant = t.dml.get(role);
        if (!grant) continue;
        const granted = DML.filter((c) => grant.privs.has(c));
        const uncovered = t.rls ? granted.filter((c) => !this.hasPolicy(key, c, role)) : granted;
        if (uncovered.length === 0) continue;
        const cmds = uncovered.map((c) => c.toUpperCase()).join(", ");
        out.push({
          rule: "R7",
          severity: t.rls ? "low" : "high",
          object: key,
          file: grant.loc.file,
          line: grant.loc.line,
          message: t.rls
            ? `${role} is granted ${cmds} on ${key}, but no policy covers that command for ${role}. The grant does nothing, or a policy is missing.`
            : `${role} is granted ${cmds} on ${key}, which has no Row Level Security, so the API lets ${role} use every row.`,
          fix: t.rls
            ? `Add a policy for ${cmds} to ${role} on ${key}, or REVOKE the privilege.`
            : `Enable RLS on ${key} and add policies, or REVOKE ${cmds} ON ${key} FROM ${role}.`,
        });
      }
    }

    for (const p of this.policies.values()) {
      const t = this.tables.get(p.table);
      // A policy on a table whose RLS is off does nothing; R1 or R6 covers it.
      if (t && !t.rls) continue;
      if (!p.permissive) continue; // restrictive policies only narrow access
      const readsUsing = ["select", "update", "delete", "all"].includes(p.cmd) && isTrueConst(p.qual);
      const writesCheck = ["insert", "update", "all"].includes(p.cmd) && isTrueConst(p.withCheck);
      if (!readsUsing && !writesCheck) continue;
      const writes = p.cmd !== "select";

      if (isAnonLike(p.roles)) {
        const who = p.roles.includes("anon") ? "anon" : "public";
        out.push({
          rule: "R2",
          severity: writes ? "critical" : "high",
          object: `${p.table}.${p.name}`,
          file: p.loc.file,
          line: p.loc.line,
          message: `Policy "${p.name}" on ${p.table} allows ${p.cmd.toUpperCase()} for ${who} with a condition that is always true, so anyone with the public API key gets access.`,
          fix: `Replace true with a real check such as auth.uid() = user_id, or change the role to authenticated.`,
        });
      } else if (
        p.roles.includes("authenticated") &&
        ["update", "delete", "all"].includes(p.cmd) &&
        (readsUsing || writesCheck)
      ) {
        out.push({
          rule: "R3",
          severity: "high",
          object: `${p.table}.${p.name}`,
          file: p.loc.file,
          line: p.loc.line,
          message: `Policy "${p.name}" on ${p.table} lets any logged-in user ${p.cmd === "all" ? "change or delete" : p.cmd} any row.`,
          fix: `Limit the rows to their owner, for example USING (auth.uid() = user_id).`,
        });
      }
    }

    for (const f of this.functions.values()) {
      if (f.schema === DEFAULT_SCHEMA && f.securityDefiner && !f.hasSearchPath) {
        out.push({
          rule: "R5",
          severity: "medium",
          object: `${f.schema}.${f.name}(${f.signature})`,
          file: f.loc.file,
          line: f.loc.line,
          message: `SECURITY DEFINER function ${f.schema}.${f.name} has no SET search_path, so a caller can hijack which objects it uses.`,
          fix: `Add SET search_path = '' to the function and use fully qualified names inside it.`,
        });
      }
    }

    return out.sort(
      (a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.rule.localeCompare(b.rule)
    );
  }
}

export async function analyzeSources(
  sources: { file: string; sql: string }[]
): Promise<AnalysisResult> {
  const a = new Analyzer();
  const warnings: Warning[] = [];
  for (const src of sources) {
    const parsed = await parseSql(src.sql);
    for (const e of parsed.errors) {
      warnings.push({
        file: src.file,
        line: e.line,
        message: `Could not parse statement, skipped: ${e.message}`,
      });
    }
    for (const st of parsed.statements) a.apply(st.node, src.file, st.line);
  }
  return { filesScanned: sources.map((s) => s.file), findings: a.findings(), warnings };
}

/** Analyze files in the order given. Callers sort by migration name first. */
export async function analyzeFiles(files: string[]): Promise<AnalysisResult> {
  return analyzeSources(files.map((file) => ({ file, sql: readFileSync(file, "utf8") })));
}
