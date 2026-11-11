import type { AuditLog } from './audit'
import { RequestError, type RequestService } from './service'
import type { RequestStatus } from './types'

export interface RequestHandlersOptions {
  service: RequestService
  audit: AuditLog
  /** Authenticated user id from your session, or null. */
  getPrincipalId: (req: Request) => string | null | Promise<string | null>
  /** Admin id if (and only if) the caller is an admin. Anything else must return null. */
  getAdminId: (req: Request) => string | null | Promise<string | null>
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
}

/**
 * Returns two handlers for two route files:
 *   app/api/requests/route.ts        -> principal (GET list own, POST submit)
 *   app/api/requests/admin/route.ts  -> admin (GET list, GET ?audit=1, PATCH update)
 */
export function createRequestHandlers(opts: RequestHandlersOptions) {
  const { service, audit } = opts

  async function principal(req: Request): Promise<Response> {
    const principalId = await opts.getPrincipalId(req)
    if (!principalId) return json({ error: 'unauthenticated' }, 401)
    try {
      if (req.method === 'GET') return json({ requests: await service.listForPrincipal(principalId) })
      if (req.method === 'POST') {
        let body: { kind?: never; details?: unknown; language?: unknown }
        try {
          body = await req.json()
        } catch {
          return json({ error: 'invalid json' }, 400)
        }
        const r = await service.submit(principalId, {
          kind: body.kind as never,
          details: body.details as string,
          language: typeof body.language === 'string' ? body.language : 'en',
        })
        return json({ request: r }, 201)
      }
      return json({ error: 'method not allowed' }, 405)
    } catch (err) {
      if (err instanceof RequestError) return json({ error: err.message }, 400)
      throw err
    }
  }

  async function admin(req: Request): Promise<Response> {
    const adminId = await opts.getAdminId(req)
    if (!adminId) return json({ error: 'forbidden' }, 403)
    const actor = `admin:${adminId}`
    try {
      if (req.method === 'GET') {
        if (new URL(req.url).searchParams.get('audit')) {
          const v = await audit.verify()
          return json({ verified: v.ok, brokenAt: v.brokenAt, entries: await audit.entries() })
        }
        return json({ requests: await service.listAll(), overdue: (await service.listOverdue()).map((r) => r.id) })
      }
      if (req.method === 'PATCH') {
        let body: { id?: unknown; status?: unknown; note?: unknown; verifyIdentity?: unknown }
        try {
          body = await req.json()
        } catch {
          return json({ error: 'invalid json' }, 400)
        }
        if (typeof body.id !== 'string') return json({ error: 'id is required' }, 400)
        if (body.verifyIdentity === true) return json({ request: await service.verifyIdentity(body.id, actor) })
        if (typeof body.status !== 'string') return json({ error: 'status is required' }, 400)
        const note = typeof body.note === 'string' ? body.note : undefined
        return json({ request: await service.transition(body.id, body.status as RequestStatus, actor, note) })
      }
      return json({ error: 'method not allowed' }, 405)
    } catch (err) {
      if (err instanceof RequestError) return json({ error: err.message }, 400)
      throw err
    }
  }

  return { principal, admin }
}
