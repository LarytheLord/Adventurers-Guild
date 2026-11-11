import type { ConsentEvent, ConsentStore } from './types'

export class MemoryConsentStore implements ConsentStore {
  private events: ConsentEvent[] = []

  async append(event: ConsentEvent): Promise<void> {
    this.events.push({ ...event })
  }

  async list(principalId: string): Promise<ConsentEvent[]> {
    return this.events.filter((e) => e.principalId === principalId).map((e) => ({ ...e }))
  }
}
