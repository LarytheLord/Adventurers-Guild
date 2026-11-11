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

## STATUS OF THE LEGAL MAPPING: UNVERIFIED

The mapping below is meant to be sourced only from the official MeitY / Gazette
of India text. The environment this kit was written in could not reach those
official sites, so the section numbers below were written from memory and have
NOT been checked against the official text. Treat every row as "to be verified".
The DPDP Rules are not cited by rule number at all for the same reason. Do not
quote this table in a notice, contract or filing. A maintainer must verify each
row against the official PDF (MeitY website / eGazette) and then remove this banner.
There are also no quotations of the law here, on purpose.

## What is in the box

| Piece | Where | Provision it is meant to support (UNVERIFIED) |
|-------|-------|-----------------------------------------------|
| Itemised notice with plain-language purposes | `src/consent/ConsentNotice.tsx`, `NoticeConfig` | Act s.5 (notice) |
| Consent record: per purpose, notice version, language, timestamp, append-only history | `src/consent/service.ts` | Act s.6 (consent), and being able to show consent was given |
| Language selection in the notice | `ConsentNotice` language select, `language` stored on each record | Act s.5 / s.6 (notice and consent in clear language, language choice) |
| Withdraw as easy as give: same checkbox, same API shape | `ConsentNotice`, `ConsentService.withdraw`, `DELETE` in the handler | Act s.6 (withdrawal) |
| Right of access request | `kind: 'access'` | Act s.11 |
| Correction and erasure requests | `kind: 'correction'`, `kind: 'erasure'` | Act s.12 |
| Grievance | `kind: 'grievance'`, grievance contact shown in the notice | Act s.8 (grievance redressal) and s.13 |
| Request deadline tracking and overdue flag | `dueAt`, `listOverdue`, `RequestsAdminTable` | Supports meeting response times; the window is YOUR setting, see below |
| Audit log of who did what to each request | `src/requests/audit.ts` (hash chained) | Supports accountability under s.8 and showing handling of requests |
| Breach runbook template | `templates/breach-runbook.md` | Act s.8 (breach intimation) and s.8 (security safeguards); regulator-facing duties are left as blanks to fill from the official text |

Not covered: children's data and verifiable parental consent, significant data
fiduciary duties, consent managers, cross-border transfer, retention and
automatic erasure jobs, nomination by a data principal. Do not assume these are handled.

## Using it

Copy `src/` into your app (or import it), then:

```ts
// lib/dpdp.ts
import { ConsentService, MemoryConsentStore, RequestService, MemoryRequestStore,
         AuditLog, MemoryAuditStore } from '@/vendor/dpdp-kit'
// Replace the Memory* classes with your own implementations of
// ConsentStore, RequestStore, AuditStore. The in-memory ones lose data on restart.

// app/api/consent/route.ts
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
npm install
npm test
npm run type-check
```

This directory is excluded from the app's tsconfig and eslint and is not part of
the app build.
