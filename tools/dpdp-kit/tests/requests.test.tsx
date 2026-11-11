import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { createElement } from 'react'
import {
  RequestService,
  MemoryRequestStore,
  MemoryAuditStore,
  AuditLog,
  RequestError,
  createRequestHandlers,
} from '../src/requests/server'
import { RequestsAdminTable } from '../src/requests/client'

function setup(days = 30) {
  let n = 0
  let t = Date.parse('2026-02-01T00:00:00Z')
  const audit = new AuditLog(new MemoryAuditStore())
  const service = new RequestService(new MemoryRequestStore(), audit, {
    now: () => new Date(t),
    newId: () => `r${++n}`,
    responseWindowDays: days,
  })
  return { service, audit, advance: (ms: number) => (t += ms) }
}

describe('RequestService', () => {
  it('submits each kind with a due date and audit entry', async () => {
    const { service, audit } = setup(10)
    for (const kind of ['access', 'correction', 'erasure', 'grievance'] as const) {
      const r = await service.submit('u1', { kind, details: 'please', language: 'en' })
      expect(r.status).toBe('received')
      expect(r.dueAt).toBe('2026-02-11T00:00:00.000Z')
    }
    const entries = await audit.entries()
    expect(entries).toHaveLength(4)
    expect(entries[0]).toMatchObject({ action: 'request.submitted', actor: 'principal:u1' })
  })

  it('rejects unknown kinds and empty details', async () => {
    const { service } = setup()
    await expect(service.submit('u1', { kind: 'bogus' as never, details: 'x', language: 'en' })).rejects.toThrow(RequestError)
    await expect(service.submit('u1', { kind: 'access', details: '  ', language: 'en' })).rejects.toThrow(RequestError)
  })

  it('lists only the principal own requests', async () => {
    const { service } = setup()
    await service.submit('u1', { kind: 'access', details: 'a', language: 'en' })
    await service.submit('u2', { kind: 'access', details: 'b', language: 'en' })
    expect(await service.listForPrincipal('u1')).toHaveLength(1)
  })

  it('walks the status flow and audits every step', async () => {
    const { service, audit } = setup()
    const r = await service.submit('u1', { kind: 'erasure', details: 'delete me', language: 'en' })
    await service.verifyIdentity(r.id, 'admin:a1')
    await service.transition(r.id, 'in_progress', 'admin:a1')
    const done = await service.transition(r.id, 'completed', 'admin:a1', 'Data erased from primary store')
    expect(done.status).toBe('completed')
    expect(done.resolution).toBe('Data erased from primary store')
    const actions = (await audit.entries()).map((e) => e.action)
    expect(actions).toEqual([
      'request.submitted',
      'request.identity_verified',
      'request.status_changed',
      'request.status_changed',
    ])
  })

  it('refuses invalid transitions and terminal reopen', async () => {
    const { service } = setup()
    const r = await service.submit('u1', { kind: 'access', details: 'a', language: 'en' })
    await expect(service.transition(r.id, 'completed', 'admin:a1', 'x')).rejects.toThrow(RequestError)
    await service.transition(r.id, 'rejected', 'admin:a1', 'Could not verify identity')
    await expect(service.transition(r.id, 'in_progress', 'admin:a1')).rejects.toThrow(RequestError)
  })

  it('requires a resolution note to close', async () => {
    const { service } = setup()
    const r = await service.submit('u1', { kind: 'access', details: 'a', language: 'en' })
    await service.transition(r.id, 'in_progress', 'admin:a1')
    await expect(service.transition(r.id, 'completed', 'admin:a1')).rejects.toThrow(RequestError)
  })

  it('flags overdue open requests only', async () => {
    const { service, advance } = setup(1)
    const a = await service.submit('u1', { kind: 'access', details: 'a', language: 'en' })
    const b = await service.submit('u1', { kind: 'grievance', details: 'b', language: 'en' })
    await service.transition(b.id, 'rejected', 'admin:a1', 'duplicate')
    advance(2 * 86400000)
    const overdue = await service.listOverdue()
    expect(overdue.map((r) => r.id)).toEqual([a.id])
  })

  it('keeps request text out of the audit log', async () => {
    const { service, audit } = setup()
    await service.submit('u1', { kind: 'correction', details: 'my phone is 9999999999', language: 'en' })
    expect(JSON.stringify(await audit.entries())).not.toContain('9999999999')
  })
})

describe('AuditLog', () => {
  it('is hash chained and detects tampering', async () => {
    const store = new MemoryAuditStore()
    const log = new AuditLog(store, () => new Date('2026-02-01T00:00:00Z'))
    await log.append({ actor: 'system', action: 'a', requestId: 'r1' })
    await log.append({ actor: 'system', action: 'b', requestId: 'r1' })
    await log.append({ actor: 'system', action: 'c', requestId: 'r2' })
    expect((await log.verify()).ok).toBe(true)
    const all = await store.list()
    all[1].action = 'tampered'
    const res = await log.verify()
    expect(res.ok).toBe(false)
    expect(res.brokenAt).toBe(1)
  })
})

describe('createRequestHandlers', () => {
  function build(user: string | null, admin: string | null) {
    const { service, audit } = setup()
    const h = createRequestHandlers({ service, audit, getPrincipalId: () => user, getAdminId: () => admin })
    return { service, audit, ...h }
  }
  const url = 'http://x.test/api/requests'
  const post = (body: unknown) => new Request(url, { method: 'POST', body: JSON.stringify(body) })

  it('principal endpoint needs login and creates requests for the session user', async () => {
    const anon = build(null, null)
    expect((await anon.principal(post({ kind: 'access', details: 'x', language: 'en' }))).status).toBe(401)
    const b = build('u1', null)
    const res = await b.principal(post({ kind: 'access', details: 'x', language: 'en', principalId: 'victim' }))
    expect(res.status).toBe(201)
    expect(await b.service.listForPrincipal('victim')).toHaveLength(0)
    expect(await b.service.listForPrincipal('u1')).toHaveLength(1)
    const list = await (await b.principal(new Request(url))).json()
    expect(list.requests).toHaveLength(1)
  })

  it('principal endpoint rejects bad input with 400', async () => {
    const b = build('u1', null)
    for (const body of ['null', '5', '[]', 'true']) {
      expect((await b.principal(new Request(url, { method: 'POST', body }))).status).toBe(400)
    }
    expect((await b.principal(post({ kind: 'bogus', details: 'x', language: 'en' }))).status).toBe(400)
  })

  it('admin endpoint denies by default and for normal users', async () => {
    const b = build('u1', null)
    expect((await b.admin(new Request(`${url}/admin`))).status).toBe(403)
  })

  it('admin PATCH with a non-object JSON body is 400', async () => {
    const b = build('u1', 'a1')
    for (const body of ['null', '5', '[]', 'true']) {
      expect((await b.admin(new Request(`${url}/admin`, { method: 'PATCH', body }))).status).toBe(400)
    }
  })

  it('admin can list, verify identity and transition; audit records the admin', async () => {
    const b = build('u1', 'a1')
    await b.principal(post({ kind: 'erasure', details: 'x', language: 'en' }))
    const list = await (await b.admin(new Request(`${url}/admin`))).json()
    expect(list.requests).toHaveLength(1)
    const id = list.requests[0].id
    const patch = (body: unknown) => new Request(`${url}/admin`, { method: 'PATCH', body: JSON.stringify(body) })
    expect((await b.admin(patch({ id, verifyIdentity: true }))).status).toBe(200)
    expect((await b.admin(patch({ id, status: 'in_progress' }))).status).toBe(200)
    expect((await b.admin(patch({ id, status: 'completed' }))).status).toBe(400)
    expect((await b.admin(patch({ id, status: 'completed', note: 'done' }))).status).toBe(200)
    const entries = await b.audit.entries()
    expect(entries.some((e) => e.actor === 'admin:a1')).toBe(true)
    const log = await (await b.admin(new Request(`${url}/admin?audit=1`))).json()
    expect(log.verified).toBe(true)
  })
})

describe('RequestsAdminTable', () => {
  it('renders rows and marks overdue requests', async () => {
    const { service, advance } = setup(1)
    await service.submit('u1', { kind: 'access', details: 'a', language: 'en' })
    advance(3 * 86400000)
    const requests = await service.listAll()
    const html = renderToStaticMarkup(createElement(RequestsAdminTable, { requests, now: new Date(Date.parse('2026-02-04T00:00:00Z')) }))
    expect(html).toContain('<table')
    expect(html).toContain('access')
    expect(html.toLowerCase()).toContain('overdue')
  })
})
