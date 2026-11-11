import type { AuditEntry, AuditStore, PrincipalRequest, RequestStore } from './types'

export class MemoryRequestStore implements RequestStore {
  private rows = new Map<string, PrincipalRequest>()

  async insert(r: PrincipalRequest) {
    this.rows.set(r.id, { ...r })
  }
  async get(id: string) {
    const r = this.rows.get(id)
    return r ? { ...r } : null
  }
  async update(r: PrincipalRequest) {
    this.rows.set(r.id, { ...r })
  }
  async list(filter: { principalId?: string } = {}) {
    return [...this.rows.values()]
      .filter((r) => !filter.principalId || r.principalId === filter.principalId)
      .map((r) => ({ ...r }))
  }
}

export class MemoryAuditStore implements AuditStore {
  private rows: AuditEntry[] = []

  async append(e: AuditEntry) {
    this.rows.push(e)
  }
  /** Returns the live array so tests can simulate tampering. */
  async list() {
    return this.rows
  }
}
