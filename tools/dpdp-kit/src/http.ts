export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
}

/** Parses the body and returns it only if it is a plain JSON object; otherwise null (caller sends 400). */
export async function readJsonObject(req: Request): Promise<Record<string, unknown> | null> {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return null
  }
  if (body === null || typeof body !== 'object' || Array.isArray(body)) return null
  return body as Record<string, unknown>
}
