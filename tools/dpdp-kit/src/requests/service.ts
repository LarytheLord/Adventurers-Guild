import { randomUUID } from 'node:crypto'
import type { AuditLog } from './audit'
import {
  REQUEST_KINDS,
  type PrincipalRequest,
  type RequestKind,
  type RequestStatus,
  type RequestStore,
} from './types'

export class RequestError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RequestError'
  }
}

export interface RequestServiceOptions {
  now?: () => Date
  newId?: () => string
  /** Days until dueAt. Default 30 is a placeholder; set what your counsel advises. */
  responseWindowDays?: number
}

const TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  received: ['in_progress', 'rejected'],
  in_progress: ['completed', 'rejected'],
  completed: [],
  rejected: [],
}

const MAX_DETAILS = 5000

export class RequestService {
  private now: () => Date
  private newId: () => string
  private windowDays: number

  constructor(
    private store: RequestStore,
    private audit: AuditLog,
    opts: RequestServiceOptions = {},
  ) {
    this.now = opts.now ?? (() => new Date())
    this.newId = opts.newId ?? (() => randomUUID())
    this.windowDays = opts.responseWindowDays ?? 30
  }

  async submit(
    principalId: string,
    input: { kind: RequestKind; details: string; language: string },
  ): Promise<PrincipalRequest> {
    if (!principalId) throw new RequestError('principalId is required')
    if (!REQUEST_KINDS.includes(input.kind)) throw new RequestError(`unknown kind: ${String(input.kind)}`)
    const details = typeof input.details === 'string' ? input.details.trim() : ''
    if (!details) throw new RequestError('details are required')
    if (details.length > MAX_DETAILS) throw new RequestError('details too long')
    const now = this.now()
    const r: PrincipalRequest = {
      id: this.newId(),
      principalId,
      kind: input.kind,
      status: 'received',
      details,
      language: input.language || 'en',
      identityVerified: false,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      dueAt: new Date(now.getTime() + this.windowDays * 86400000).toISOString(),
    }
    await this.store.insert(r)
    await this.audit.append({
      actor: `principal:${principalId}`,
      action: 'request.submitted',
      requestId: r.id,
      detail: `kind=${r.kind}`,
    })
    return r
  }

  listForPrincipal(principalId: string): Promise<PrincipalRequest[]> {
    return this.store.list({ principalId })
  }

  /** Admin use only: the caller must have authorised the actor. */
  listAll(): Promise<PrincipalRequest[]> {
    return this.store.list()
  }

  async listOverdue(): Promise<PrincipalRequest[]> {
    const now = this.now().getTime()
    return (await this.store.list()).filter(
      (r) => (r.status === 'received' || r.status === 'in_progress') && Date.parse(r.dueAt) < now,
    )
  }

  async verifyIdentity(id: string, actor: string): Promise<PrincipalRequest> {
    const r = await this.mustGet(id)
    r.identityVerified = true
    r.updatedAt = this.now().toISOString()
    await this.store.update(r)
    await this.audit.append({ actor, action: 'request.identity_verified', requestId: id })
    return r
  }

  async transition(id: string, to: RequestStatus, actor: string, note?: string): Promise<PrincipalRequest> {
    const r = await this.mustGet(id)
    if (!TRANSITIONS[r.status].includes(to)) {
      throw new RequestError(`cannot move from ${r.status} to ${to}`)
    }
    const closing = to === 'completed' || to === 'rejected'
    if (closing && !note?.trim()) throw new RequestError('a resolution note is required to close a request')
    const from = r.status
    r.status = to
    r.updatedAt = this.now().toISOString()
    if (closing) r.resolution = note!.trim()
    await this.store.update(r)
    await this.audit.append({
      actor,
      action: 'request.status_changed',
      requestId: id,
      detail: `${from}->${to}`,
    })
    return r
  }

  private async mustGet(id: string): Promise<PrincipalRequest> {
    const r = await this.store.get(id)
    if (!r) throw new RequestError(`request not found: ${id}`)
    return r
  }
}
