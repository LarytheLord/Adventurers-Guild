import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { createElement } from 'react'
import {
  ConsentService,
  MemoryConsentStore,
  ConsentError,
  createConsentHandler,
  ConsentNotice,
  type NoticeConfig,
} from '../src/consent'

const notice: NoticeConfig = {
  version: '2026-01',
  defaultLanguage: 'en',
  languages: ['en', 'hi'],
  grievanceContact: 'grievance@example.test',
  purposes: [
    {
      id: 'marketing_email',
      label: { en: 'Product updates by email', hi: 'Email se updates' },
      description: { en: 'We email you product news.', hi: 'Hum updates bhejte hain.' },
    },
    {
      id: 'analytics',
      label: { en: 'Usage analytics' },
      description: { en: 'We measure which features are used.' },
    },
  ],
}

function makeService() {
  let n = 0
  let t = Date.parse('2026-01-01T00:00:00Z')
  return new ConsentService(new MemoryConsentStore(), notice, {
    now: () => new Date((t += 1000)),
    newId: () => `c${++n}`,
  })
}

describe('ConsentService', () => {
  it('has no consent by default', async () => {
    const s = makeService()
    expect(await s.hasConsent('u1', 'analytics')).toBe(false)
    expect((await s.current('u1')).analytics).toBe('none')
  })

  it('records give with notice version and language', async () => {
    const s = makeService()
    const ev = await s.give('u1', 'marketing_email', 'hi')
    expect(ev).toMatchObject({ action: 'given', noticeVersion: '2026-01', language: 'hi', purposeId: 'marketing_email' })
    expect(await s.hasConsent('u1', 'marketing_email')).toBe(true)
    expect(await s.hasConsent('u1', 'analytics')).toBe(false)
  })

  it('withdraw uses the same call shape and keeps history', async () => {
    const s = makeService()
    await s.give('u1', 'analytics', 'en')
    const ev = await s.withdraw('u1', 'analytics', 'en')
    expect(ev?.action).toBe('withdrawn')
    expect(await s.hasConsent('u1', 'analytics')).toBe(false)
    expect((await s.history('u1')).map((e) => e.action)).toEqual(['given', 'withdrawn'])
  })

  it('withdraw when nothing was given is a no-op', async () => {
    const s = makeService()
    expect(await s.withdraw('u1', 'analytics', 'en')).toBeNull()
    expect(await s.history('u1')).toHaveLength(0)
  })

  it('give is idempotent while already given', async () => {
    const s = makeService()
    await s.give('u1', 'analytics', 'en')
    expect(await s.give('u1', 'analytics', 'en')).toBeNull()
    expect(await s.history('u1')).toHaveLength(1)
  })

  it('rejects unknown purposes and unsupported languages', async () => {
    const s = makeService()
    await expect(s.give('u1', 'nope', 'en')).rejects.toThrow(ConsentError)
    await expect(s.give('u1', 'analytics', 'fr')).rejects.toThrow(ConsentError)
  })

  it('keeps principals separate', async () => {
    const s = makeService()
    await s.give('u1', 'analytics', 'en')
    expect(await s.hasConsent('u2', 'analytics')).toBe(false)
  })
})

describe('createConsentHandler', () => {
  function setup(user: string | null = 'u1') {
    const service = makeService()
    const handler = createConsentHandler({ service, getPrincipalId: () => user })
    return { service, handler }
  }
  const url = 'http://x.test/api/consent'

  it('401 without an authenticated principal', async () => {
    const { handler } = setup(null)
    expect((await handler(new Request(url))).status).toBe(401)
  })

  it('POST gives and DELETE withdraws', async () => {
    const { handler, service } = setup()
    const post = await handler(
      new Request(url, { method: 'POST', body: JSON.stringify({ purposeId: 'analytics', language: 'en' }) }),
    )
    expect(post.status).toBe(200)
    expect(await service.hasConsent('u1', 'analytics')).toBe(true)
    const del = await handler(new Request(`${url}?purposeId=analytics&language=en`, { method: 'DELETE' }))
    expect(del.status).toBe(200)
    expect(await service.hasConsent('u1', 'analytics')).toBe(false)
  })

  it('ignores a principal id supplied in the body', async () => {
    const { handler, service } = setup('u1')
    await handler(
      new Request(url, {
        method: 'POST',
        body: JSON.stringify({ purposeId: 'analytics', language: 'en', principalId: 'victim' }),
      }),
    )
    expect(await service.hasConsent('victim', 'analytics')).toBe(false)
    expect(await service.hasConsent('u1', 'analytics')).toBe(true)
  })

  it('400 on bad input and 405 on other methods', async () => {
    const { handler } = setup()
    expect((await handler(new Request(url, { method: 'POST', body: 'not json' }))).status).toBe(400)
    expect(
      (await handler(new Request(url, { method: 'POST', body: JSON.stringify({ purposeId: 'zzz', language: 'en' }) })))
        .status,
    ).toBe(400)
    expect((await handler(new Request(url, { method: 'PUT' }))).status).toBe(405)
  })

  it('GET returns state and history', async () => {
    const { handler, service } = setup()
    await service.give('u1', 'analytics', 'en')
    const body = await (await handler(new Request(url))).json()
    expect(body.noticeVersion).toBe('2026-01')
    expect(body.state.analytics).toBe('given')
    expect(body.history).toHaveLength(1)
  })
})

describe('ConsentNotice component', () => {
  const render = (language: string, granted: Record<string, boolean> = {}) =>
    renderToStaticMarkup(
      createElement(ConsentNotice, { notice, language, granted, onChange: () => {}, onLanguageChange: () => {} }),
    )

  it('lists each purpose as its own unchecked checkbox', () => {
    const html = render('en')
    expect(html.match(/type="checkbox"/g)).toHaveLength(2)
    expect(html).not.toContain('checked')
    expect(html).toContain('Product updates by email')
    expect(html).toContain('Usage analytics')
  })

  it('offers language selection and falls back to the default language', () => {
    const html = render('hi')
    expect(html).toContain('<select')
    expect(html).toContain('Email se updates')
    expect(html).toContain('We measure which features are used.')
  })

  it('shows withdrawal instructions and grievance contact', () => {
    const html = render('en', { analytics: true })
    expect(html).toContain('checked')
    expect(html.toLowerCase()).toContain('withdraw')
    expect(html).toContain('grievance@example.test')
  })
})
