import { createHash } from 'node:crypto'
import type { AuditEntry, AuditStore } from './types'

const GENESIS = '0'.repeat(64)

function hashEntry(e: Omit<AuditEntry, 'hash'>): string {
  const payload = JSON.stringify([e.seq, e.at, e.actor, e.action, e.requestId, e.detail ?? '', e.prevHash])
  return createHash('sha256').update(payload).digest('hex')
}

export type NewAuditEntry = Pick<AuditEntry, 'actor' | 'action' | 'requestId' | 'detail'>

/** Hash-chained log: editing or removing a past entry breaks verify(). */
export class AuditLog {
  constructor(
    private store: AuditStore,
    private now: () => Date = () => new Date(),
  ) {}

  async append(input: NewAuditEntry): Promise<AuditEntry> {
    const all = await this.store.list()
    const prev = all[all.length - 1]
    const base = {
      seq: all.length,
      at: this.now().toISOString(),
      actor: input.actor,
      action: input.action,
      requestId: input.requestId,
      detail: input.detail,
      prevHash: prev ? prev.hash : GENESIS,
    }
    const entry: AuditEntry = { ...base, hash: hashEntry(base) }
    await this.store.append(entry)
    return entry
  }

  entries(): Promise<AuditEntry[]> {
    return this.store.list()
  }

  async verify(): Promise<{ ok: boolean; brokenAt?: number }> {
    const all = await this.store.list()
    let prevHash = GENESIS
    for (let i = 0; i < all.length; i++) {
      const { hash, ...rest } = all[i]
      if (rest.seq !== i || rest.prevHash !== prevHash || hashEntry(rest) !== hash) {
        return { ok: false, brokenAt: i }
      }
      prevHash = hash
    }
    return { ok: true }
  }
}
