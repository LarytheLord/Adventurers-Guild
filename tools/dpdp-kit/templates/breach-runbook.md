# Personal Data Breach Runbook (template)

Copy this file, fill every [BRACKET], and have your counsel review it before you
rely on it. Legal deadlines, recipients and required content are deliberately NOT
written in here: look them up in the official DPDP Act 2023 and DPDP Rules text
and record them in section 0 so the on-call person does not have to guess.

## 0. Fill in before an incident

| Item | Value |
|------|-------|
| Incident lead (name, phone) | [BRACKET] |
| Backup lead | [BRACKET] |
| Counsel contact | [BRACKET] |
| Regulator notification: who, how, by when (from official text) | [BRACKET] |
| Data principal notification: content and timing (from official text) | [BRACKET] |
| Security contractor on retainer, if any | [BRACKET] |
| Where evidence is stored (access-restricted) | [BRACKET] |
| Where the data principal request audit log lives | [BRACKET] |

## 1. Detect and declare (first hour)

- [ ] Who noticed, when, how. Write it down with a UTC timestamp.
- [ ] Declare an incident. Name the incident lead.
- [ ] Open a private incident log (one append-only document). Every action gets a time and a name.
- [ ] Do not discuss on public channels. Do not delete anything.

## 2. Contain

- [ ] Revoke or rotate exposed credentials, keys and sessions.
- [ ] Disable the affected endpoint, account or integration if needed.
- [ ] Preserve evidence first: snapshot logs and affected systems before you clean up.
- [ ] Record what was done and what was NOT done yet.

## 3. Assess

- [ ] What data: categories, approximate number of data principals, time window.
- [ ] Was it accessed, copied, altered, lost or only exposed?
- [ ] Are children's data or other sensitive categories involved?
- [ ] Which of your processors or vendors are involved? Contact them.
- [ ] Is the cause fixed, or could it recur?
- [ ] Decide with counsel whether notification duties apply (section 0 row).

## 4. Notify

- [ ] Regulator: use the route, content and deadline recorded in section 0.
- [ ] Affected data principals: use the content and timing recorded in section 0.
      Plain language, in the language they chose in the consent notice where you can.
- [ ] Keep a copy of every notice sent and the time it was sent.
- [ ] Other duties you may have (contracts, customers, insurers): [BRACKET].

## 5. Recover

- [ ] Restore from known-good state.
- [ ] Re-verify access controls and secrets.
- [ ] Monitor for follow-on activity for [BRACKET] days.

## 6. Review (within [BRACKET] days)

- [ ] Timeline from the incident log.
- [ ] Root cause and contributing factors (blameless).
- [ ] Actions with an owner and a date.
- [ ] Update this runbook, the consent purposes and your retention rules if needed.
- [ ] Keep the record for [BRACKET] (retention period per counsel).

## Communication holding statement (edit before use)

"We identified a security incident affecting [BRACKET] on [DATE]. We have
[contained it / are investigating]. We will contact affected users directly with
details and what to do. Contact: [grievance contact]."
