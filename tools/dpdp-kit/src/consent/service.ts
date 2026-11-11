import { randomUUID } from 'node:crypto'
import type { ConsentEvent, ConsentState, ConsentStore, NoticeConfig } from './types'

export class ConsentError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ConsentError'
  }
}

export interface ConsentServiceOptions {
  now?: () => Date
  newId?: () => string
}

export class ConsentService {
  private now: () => Date
  private newId: () => string

  constructor(
    private store: ConsentStore,
    private notice: NoticeConfig,
    opts: ConsentServiceOptions = {},
  ) {
    this.now = opts.now ?? (() => new Date())
    this.newId = opts.newId ?? (() => randomUUID())
  }

  /** Records consent. Returns null if the purpose is already consented to. */
  give(principalId: string, purposeId: string, language: string): Promise<ConsentEvent | null> {
    return this.record(principalId, purposeId, language, 'given')
  }

  /** Records withdrawal. Same shape as give. Returns null if nothing is currently given. */
  withdraw(principalId: string, purposeId: string, language: string): Promise<ConsentEvent | null> {
    return this.record(principalId, purposeId, language, 'withdrawn')
  }

  async hasConsent(principalId: string, purposeId: string): Promise<boolean> {
    return (await this.current(principalId))[purposeId] === 'given'
  }

  async current(principalId: string): Promise<Record<string, ConsentState>> {
    const state: Record<string, ConsentState> = {}
    for (const p of this.notice.purposes) state[p.id] = 'none'
    for (const e of await this.store.list(principalId)) state[e.purposeId] = e.action
    return state
  }

  history(principalId: string): Promise<ConsentEvent[]> {
    return this.store.list(principalId)
  }

  get noticeVersion(): string {
    return this.notice.version
  }

  private async record(
    principalId: string,
    purposeId: string,
    language: string,
    action: ConsentEvent['action'],
  ): Promise<ConsentEvent | null> {
    if (!principalId) throw new ConsentError('principalId is required')
    if (!this.notice.purposes.some((p) => p.id === purposeId)) {
      throw new ConsentError(`unknown purpose: ${purposeId}`)
    }
    if (!this.notice.languages.includes(language)) {
      throw new ConsentError(`unsupported language: ${language}`)
    }
    const current = (await this.current(principalId))[purposeId]
    if (action === 'given' && current === 'given') return null
    if (action === 'withdrawn' && current !== 'given') return null
    const event: ConsentEvent = {
      id: this.newId(),
      principalId,
      purposeId,
      action,
      noticeVersion: this.notice.version,
      language,
      at: this.now().toISOString(),
    }
    await this.store.append(event)
    return event
  }
}
