// Decides whether a pull request satisfies the issue-link requirement.
// Pure function so it can be unit tested without GitHub.

const CLOSING_PATTERN =
  /\b(close[sd]?|fix(e[sd])?|resolve[sd]?)\b[:\s]+(?:issue\s+)?(?:(?:#\d+)|(?:https:\/\/github\.com\/[^/\s]+\/[^/\s]+\/issues\/\d+))/i;

function evaluate(pr) {
  const text = [pr.title || "", pr.body || ""].join("\n");
  if (CLOSING_PATTERN.test(text)) {
    return { ok: true, reason: "closing reference found" };
  }
  return {
    ok: false,
    reason:
      "PRs must include a closing issue reference like 'Closes #123' so GitHub can track and credit the contribution.",
  };
}

module.exports = { evaluate, CLOSING_PATTERN };
