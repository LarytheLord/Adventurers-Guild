export const REQUEST_KINDS = ['access', 'correction', 'erasure', 'grievance'] as const
export type RequestKind = (typeof REQUEST_KINDS)[number]
export type RequestStatus = 'received' | 'in_progress' | 'completed' | 'rejected'

export interface PrincipalRequest {
  id: string
  principalId: string
  kind: RequestKind
  status: RequestStatus
  details: string
  language: string
  identityVerified: boolean
  createdAt: string
  updatedAt: string
  /** Deadline from the configured response window. Set it per your counsel's advice. */
  dueAt: string
  resolution?: string
}

export interface RequestStore {
  insert(r: PrincipalRequest): Promise<void>
  get(id: string): Promise<PrincipalRequest | null>
  update(r: PrincipalRequest): Promise<void>
  list(filter?: { principalId?: string }): Promise<PrincipalRequest[]>
}

export interface AuditEntry {
  seq: number
  at: string
  /** "principal:<id>", "admin:<id>" or "system". */
  actor: string
  action: string
  requestId: string
  /** Metadata only. Never put request text or other personal data here. */
  detail?: string
  prevHash: string
  hash: string
}

/** Append-only. Do not expose update or delete on the real table. */
export interface AuditStore {
  append(e: AuditEntry): Promise<void>
  list(): Promise<AuditEntry[]>
}
