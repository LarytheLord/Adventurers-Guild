// Decides whether a pull request satisfies the issue-link requirement.
// Pure function so it can be unit tested without GitHub.
//
// A PR passes if any of these hold:
//   1. its title or body has a closing reference ("Closes #N", etc.)
//   2. it carries the "no-issue" label
//   3. its author is the repository owner

const CLOSING_PATTERN =
  /\b(close[sd]?|fix(e[sd])?|resolve[sd]?)\b[:\s]+(?:issue\s+)?(?:(?:#\d+)|(?:https:\/\/github\.com\/[^/\s]+\/[^/\s]+\/issues\/\d+))/i;

const EXEMPT_LABEL = "no-issue";

function evaluate(pr, repoOwner) {
  const text = [pr.title || "", pr.body || ""].join("\n");
  if (CLOSING_PATTERN.test(text)) {
    return { ok: true, reason: "closing reference found" };
  }

  const labels = Array.isArray(pr.labels) ? pr.labels : [];
  if (labels.some((l) => String((l && l.name) || "").toLowerCase() === EXEMPT_LABEL)) {
    return { ok: true, reason: `labeled ${EXEMPT_LABEL}` };
  }

  const author = String((pr.user && pr.user.login) || "").toLowerCase();
  if (author && repoOwner && author === String(repoOwner).toLowerCase()) {
    return { ok: true, reason: "author is the repository owner" };
  }

  return {
    ok: false,
    reason:
      "PRs must include a closing issue reference like 'Closes #123' so GitHub can track and credit the contribution. " +
      `Maintainers can instead apply the '${EXEMPT_LABEL}' label for changes that have no issue.`,
  };
}

module.exports = { evaluate, CLOSING_PATTERN, EXEMPT_LABEL };
