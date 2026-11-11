import * as React from 'react'
import type { NoticeConfig } from './types'

export interface ConsentNoticeProps {
  notice: NoticeConfig
  language: string
  /** purposeId -> currently granted. Missing means not granted. */
  granted: Record<string, boolean>
  /** Called for both give (true) and withdraw (false): one control, same effort. */
  onChange: (purposeId: string, granted: boolean) => void
  onLanguageChange: (language: string) => void
  /** Display names for language codes. Falls back to the code. */
  languageNames?: Record<string, string>
}

function pick(map: Record<string, string>, language: string, fallback: string): string {
  return map[language] ?? map[fallback] ?? ''
}

/**
 * Controlled, stateless notice. Nothing is pre-ticked. Each purpose is a separate
 * checkbox; unticking withdraws. Wording is yours to review with counsel.
 */
export function ConsentNotice({
  notice,
  language,
  granted,
  onChange,
  onLanguageChange,
  languageNames = {},
}: ConsentNoticeProps) {
  return (
    <section data-slot="consent-notice" aria-labelledby="consent-notice-title">
      <h2 id="consent-notice-title">Your data and your choices</h2>
      <p>
        <label htmlFor="consent-language">Language</label>{' '}
        <select
          id="consent-language"
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
        >
          {notice.languages.map((code) => (
            <option key={code} value={code}>
              {languageNames[code] ?? code}
            </option>
          ))}
        </select>
      </p>
      <fieldset>
        <legend>Choose what we may use your data for</legend>
        {notice.purposes.map((p) => {
          const id = `consent-${p.id}`
          return (
            <div key={p.id}>
              <input
                id={id}
                type="checkbox"
                checked={!!granted[p.id]}
                onChange={(e) => onChange(p.id, e.target.checked)}
              />{' '}
              <label htmlFor={id}>{pick(p.label, language, notice.defaultLanguage)}</label>
              <p>{pick(p.description, language, notice.defaultLanguage)}</p>
            </div>
          )
        })}
      </fieldset>
      <p>
        You can withdraw any consent at any time by unticking it here. It is as easy as giving it.
      </p>
      <p>
        Questions or complaints: <a href={`mailto:${notice.grievanceContact}`}>{notice.grievanceContact}</a>
      </p>
    </section>
  )
}
