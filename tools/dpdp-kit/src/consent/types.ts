export interface Purpose {
  id: string
  /** Short title per language code. */
  label: Record<string, string>
  /** Plain-language description of what the data is used for, per language code. */
  description: Record<string, string>
}

export interface NoticeConfig {
  /** Bump this whenever the notice text or purposes change. Stored with each record. */
  version: string
  defaultLanguage: string
  languages: string[]
  purposes: Purpose[]
  grievanceContact: string
}

export type ConsentAction = 'given' | 'withdrawn'
export type ConsentState = ConsentAction | 'none'

export interface ConsentEvent {
  id: string
  principalId: string
  purposeId: string
  action: ConsentAction
  noticeVersion: string
  language: string
  at: string
}

/** Implement this over any database. Events are append-only. */
export interface ConsentStore {
  append(event: ConsentEvent): Promise<void>
  list(principalId: string): Promise<ConsentEvent[]>
}
