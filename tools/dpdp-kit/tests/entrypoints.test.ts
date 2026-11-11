import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const CLIENT_ENTRIES = ['../src/client.ts', '../src/consent/client.ts', '../src/requests/client.ts']

function resolveImport(from: string, spec: string): string | null {
  const base = resolve(dirname(from), spec)
  for (const c of [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`]) {
    if (existsSync(c) && /\.(ts|tsx)$/.test(c)) return c
  }
  return null
}

/** Collect every module reachable from a client entry, with its import specifiers. */
function walk(entry: string): { file: string; specs: string[] }[] {
  const seen = new Set<string>()
  const out: { file: string; specs: string[] }[] = []
  const stack = [entry]
  while (stack.length) {
    const file = stack.pop()!
    if (seen.has(file)) continue
    seen.add(file)
    const src = readFileSync(file, 'utf8')
    const specs = [...src.matchAll(/(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g)].map((m) => m[1])
    out.push({ file, specs })
    for (const s of specs) {
      if (s.startsWith('.')) {
        const r = resolveImport(file, s)
        if (r) stack.push(r)
      }
    }
  }
  return out
}

describe('client entry points', () => {
  for (const rel of CLIENT_ENTRIES) {
    const entry = resolve(__dirname, rel)

    it(`${rel} exists`, () => {
      expect(existsSync(entry)).toBe(true)
    })

    it(`${rel} never reaches a node: module`, () => {
      if (!existsSync(entry)) throw new Error('missing entry')
      for (const { file, specs } of walk(entry)) {
        const bad = specs.filter((s) => s.startsWith('node:') || s === 'crypto')
        expect(bad, file).toEqual([])
      }
    })
  }

  it('component files start with a use client directive', () => {
    for (const f of ['../src/consent/ConsentNotice.tsx', '../src/requests/RequestsAdminTable.tsx']) {
      expect(readFileSync(resolve(__dirname, f), 'utf8').startsWith("'use client'")).toBe(true)
    }
  })
})
