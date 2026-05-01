# Maintainers

This document lists the people responsible for the Adventurers Guild project. Maintainers have merge authority, set direction, and are accountable for the project's technical health.

## Current Maintainers

| Name | GitHub | Focus |
|------|--------|-------|
| Abi | [@LarytheLord](https://github.com/LarytheLord) | Architecture, infrastructure, payments, bootcamp pipeline, partnerships |
| Adil | [@Adil2009700](https://github.com/Adil2009700) | Frontend, dashboard UX, landing page, contributor coordination, day-to-day PR triage |

Both maintainers have full merge and review authority on every part of the codebase. Either can approve and merge PRs without waiting on the other.

## What Maintainers Do

- Review and merge pull requests
- Triage issues and assign owners
- Set technical direction and resolve architectural disagreements
- Coordinate with contributors (NSoC 2026 cohort, external collaborators)
- Keep the documentation map in sync with reality
- Decide when to cut releases and what goes into them

## What Maintainers Escalate to Each Other

A maintainer should consult the other before:

- Reverting another maintainer's merge
- Adding or removing a contributor's repo permissions
- Changing the project's strategic direction (e.g. payment provider, target market, monetization model)
- Major schema migrations affecting more than one feature area
- Decisions that would conflict with documented [Architecture Decisions](docs/ARCHITECTURE_DECISIONS.md)

## How Decisions Are Made

For day-to-day technical decisions: the maintainer touching the code decides.

For decisions affecting both maintainers' areas: brief written discussion in the relevant GitHub issue or PR comments. Default to async over meetings.

For strategic decisions: the [Architecture Decisions](docs/ARCHITECTURE_DECISIONS.md) doc is authoritative. New ADRs require both maintainers to agree before being added.

## Becoming a Maintainer

We add maintainers when the project's pace requires it, not on a schedule. Strong signals: sustained merged contributions, demonstrated judgment in code review, ability to coordinate with other contributors, alignment with the project's direction.

## Contact

- Open a GitHub issue for anything project-related
- Tag both maintainers (`@LarytheLord` `@Adil2009700`) on items that need shared input
- For sensitive matters: reach maintainers directly via email or Discord
