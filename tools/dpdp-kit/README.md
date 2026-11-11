# dpdp-kit

Small, dependency-light building blocks a small Indian startup can drop into a
Next.js app to support its obligations under India's Digital Personal Data
Protection Act, 2023 (DPDP Act) and the rules made under it (DPDP Rules).

License: MIT. Plain TypeScript and React. Storage-agnostic: you implement two
small interfaces over your own database; an in-memory reference version is included.

## NOT LEGAL ADVICE. YOU REMAIN RESPONSIBLE.

This kit is engineering scaffolding, not legal advice and not a compliance
certificate. Using it does not make you compliant. You (the Data Fiduciary) stay
responsible for your own notice wording, purposes, retention, security, deadlines
and breach duties. Have a lawyer review your use. Nobody involved in this kit is
a regulator, a lawyer or a certified auditor.

## STATUS OF THE LEGAL MAPPING: NOT YET VERIFIED

Source to check against: the official Digital Personal Data Protection Act, 2023
as published by MeitY:
https://www.meity.gov.in/static/uploads/2024/06/2bf1f0e9f04e6fb4f8fef35e82c42aa5.pdf

The author of this table could not open that PDF (the host was not reachable from
the environment used), so no row below has been checked against it. Each row names
the sub-section it is meant to support; read the section in the PDF before you rely
on the row. The "Verified" column is "No" for every row. A maintainer who has read
the PDF should flip a row to "Yes" only after checking it, and remove this paragraph
only when every row is "Yes". This table quotes no text from the law.

DPDP Rules: no rule numbers are cited anywhere in this kit. None of the Rules have
been verified, because the Gazette text could not be opened either. Rules that are
therefore NOT verified and not mapped: all of them. Once someone can open the
Gazette notification of the Rules, add rule numbers per row from that text only.

| Piece | Where | DPDP Act 2023 provision it is meant to support | Verified |
|-------|-------|-----------------------------------------------|----------|
| Itemised notice with plain-language purposes | `src/consent/ConsentNotice.tsx`, `NoticeConfig` | s.5 (notice) | No |
| Consent record: per purpose, notice version, language, timestamp, append-only history | `src/consent/service.ts` | s.6 (consent) | No |
| Language selection in the notice, language stored on each record | `ConsentNotice` language select | s.5, s.6 (notice and consent in clear language, language choice) | No |
| Withdraw as easy as give: same checkbox, same API shape | `ConsentNotice`, `ConsentService.withdraw`, `DELETE` in the handler | s.6 (withdrawal of consent) | No |
| Access request | `kind: 'access'` | s.11 | No |
| Correction and erasure requests | `kind: 'correction'`, `kind: 'erasure'` | s.12 | No |
| Grievance request, grievance contact shown in the notice | `kind: 'grievance'`, `NoticeConfig.grievanceContact` | s.8(10), s.13 | No |
| Request deadline tracking and overdue flag | `dueAt`, `listOverdue`, `RequestsAdminTable` | Supports handling requests under s.11, s.12, s.13; the window itself is YOUR setting, see below | No |
| Audit log of who did what to each request (hash chained, no request text) | `src/requests/audit.ts` | s.8(5) (reasonable security safeguards), as supporting evidence | No |
| Breach runbook template | `templates/breach-runbook.md` | s.8(5), s.8(6); regulator and data principal duties are blanks to fill from the official text | No |

Not covered: children's data and verifiable parental consent, significant data
fiduciary duties, consent managers, cross-border transfer, retention and
automatic erasure jobs, nomination by a data principal. Do not assume these are handled.

## Using it

Copy `src/` into your app (or import it), then:

There are two entry points. Client components import from `client` (no `node:`
modules). Route handlers and server code import from `server` (uses `node:crypto`).
Never import `server` from a client component.

```ts
// lib/dpdp.ts (server only)
import { ConsentService, MemoryConsentStore, RequestService, MemoryRequestStore,
         AuditLog, MemoryAuditStore } from '@/vendor/dpdp-kit/server'
// Replace the Memory* classes with your own implementations of
// ConsentStore, RequestStore, AuditStore. The in-memory ones lose data on restart.

// app/api/consent/route.ts (also server only)
const handler = createConsentHandler({ service, getPrincipalId: (req) => userIdFromSession(req) })
export { handler as GET, handler as POST, handler as DELETE }

// app/api/requests/route.ts and app/api/requests/admin/route.ts
const { principal, admin } = createRequestHandlers({
  service, audit,
  getPrincipalId: (req) => userIdFromSession(req),
  getAdminId: (req) => adminIdOrNull(req), // return null unless the caller is an admin
})
```

Design choices you should know about:

- The principal id always comes from your session callback, never from the request body.
- The admin endpoint denies everything unless `getAdminId` returns an id.
- The audit log stores metadata only (kind, status change, actor), not request text.
- `responseWindowDays` defaults to 30 as a placeholder only. Set it from the official
  Rules text with your lawyer.
- Production stores: make the audit table insert-only, and keep the consent history append-only.
- Identity verification of the requester is a manual admin step (`verifyIdentity`); how
  you verify is your decision.

## Develop

```bash
cd tools/dpdp-kit
npm ci
npm test
npm run type-check
```

This directory is excluded from the app's tsconfig and eslint and is not part of
the app build. It has its own lockfile and its own CI workflow
(`.github/workflows/dpdp-kit.yml`).

```tsx
// a client component
import { ConsentNotice } from '@/vendor/dpdp-kit/client'
```
