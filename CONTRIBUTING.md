# Contributing to Guild

## What this is

This repo is the code for the Guild website at [guilds.work](https://guilds.work).
Guild runs independent checks on apps and AI systems before people rely on them. The
site has free self-checks, a checklist, guides and a paid audit offer. Read the
[README](README.md) for the full list of pages and what Guild does and does not do.

Some code from an older product is still in the repo. It is not the current product.
The README has a "Legacy code" section that lists where it lives. Do not extend it.

## Local setup

You need Node.js, npm, and a Postgres database (a free Neon project works).

```bash
git clone https://github.com/LarytheLord/Adventurers-Guild.git
cd Adventurers-Guild
npm install
cp .env.example .env.local
# fill in .env.local
npm run db:push
npm run dev
```

The app runs at `http://localhost:3000`. `npm install` also runs `prisma generate`.
`npm run db:push` runs a guard script first (`scripts/db-guard.js`). Read
[docs/DATABASE_SAFETY.md](docs/DATABASE_SAFETY.md) before you point it at a database
you care about. Never use a production database for local work. Do not commit real
values from `.env.local`.

Most content pages (the checklist, the guides, the self-checks) do not need the
database. If you only change copy, `npm run dev` is enough.

## Tests

```bash
npm run test             # Jest
npm run test:e2e:smoke   # Playwright smoke tests
npm run test:a11y        # Playwright accessibility tests
```

CI also runs `npm run lint`, `npm run type-check` and `npm run build`. Run the same
commands before you open a PR.

## Branches and pull requests

- Make a feature branch from `main`. Do not commit to `main`.
- Open a pull request to `main`. CI must pass before it can merge.
- One purpose per PR. A copy fix and a refactor are two PRs.
- Link an issue with a closing line in the PR body, for example `Closes #123`. A
  check fails without it. Maintainers can apply the `no-issue` label for changes that
  have no issue.
- Write content files in plain ASCII: straight quotes, plain hyphens, no emoji, no
  special dashes. Use plain English and short sentences.
- For anything larger than a bug fix or a copy change, open an issue first and agree
  the approach with a maintainer.

## Where content lives

| What | Where |
|---|---|
| The checklist and the paid offer (`/checklist`, `/audit`) | `lib/audit-offer/content.ts` |
| DPDP guide and DPDP self-check (`/dpdp-readiness`) | `lib/dpdp-explainer/content.ts`, `lib/dpdp-readiness/` |
| CERT-In guides | `lib/cert-in-explainer/content.ts`, `lib/cert-in-explainer/evidence-checklist.ts` |
| AI risk tier calculator | `lib/ai-risk-tier/` |
| Launch Check questions | `lib/launch-check/` |

Pages under `app/` read from these files. Change the text in `lib/`, not in the page.

## Propose a checklist item

Open an issue with the "Checklist item proposal" template. A good proposal has:

- **A failure class.** The kind of mistake it catches, for example "a database table
  that anyone can read without logging in".
- **A plain-English check.** A step the app owner can do without special tools.
- **A plain-English fix.** What to change.
- **A source for any statistic, standard or rule.** Do not name clients. Do not quote
  a number without a link to where it comes from.

## Good first issues

Issues labelled [good first issue](https://github.com/LarytheLord/Adventurers-Guild/labels/good%20first%20issue)
are small and well defined. Comment on the issue before you start so two people do
not do the same work.

## Security

Report a security problem privately. Follow [SECURITY.md](SECURITY.md). Never open a
public issue, pull request or discussion for a vulnerability.

## Code of conduct

See [docs/CODE_OF_CONDUCT.md](docs/CODE_OF_CONDUCT.md).
