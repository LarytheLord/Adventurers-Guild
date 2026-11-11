import { json, readJsonObject } from '../http'
import { ConsentError, type ConsentService } from './service'

export interface ConsentHandlerOptions {
  service: ConsentService
  /** Return the id of the authenticated user from your session, or null. Never read it from the body. */
  getPrincipalId: (req: Request) => string | null | Promise<string | null>
}

/**
 * One handler for a Next.js route file:
 *   const handler = createConsentHandler(...)
 *   export { handler as GET, handler as POST, handler as DELETE }
 */
export function createConsentHandler({ service, getPrincipalId }: ConsentHandlerOptions) {
  return async function handler(req: Request): Promise<Response> {
    const principalId = await getPrincipalId(req)
    if (!principalId) return json({ error: 'unauthenticated' }, 401)
    try {
      if (req.method === 'GET') {
        return json({
          noticeVersion: service.noticeVersion,
          state: await service.current(principalId),
          history: await service.history(principalId),
        })
      }
      if (req.method === 'POST') {
        const body = await readJsonObject(req)
        if (!body) return json({ error: 'body must be a JSON object' }, 400)
        if (typeof body.purposeId !== 'string' || typeof body.language !== 'string') {
          return json({ error: 'purposeId and language are required' }, 400)
        }
        const event = await service.give(principalId, body.purposeId, body.language)
        return json({ event })
      }
      if (req.method === 'DELETE') {
        const q = new URL(req.url).searchParams
        const purposeId = q.get('purposeId')
        const language = q.get('language')
        if (!purposeId || !language) return json({ error: 'purposeId and language are required' }, 400)
        const event = await service.withdraw(principalId, purposeId, language)
        return json({ event })
      }
      return json({ error: 'method not allowed' }, 405)
    } catch (err) {
      if (err instanceof ConsentError) return json({ error: err.message }, 400)
      throw err
    }
  }
}
