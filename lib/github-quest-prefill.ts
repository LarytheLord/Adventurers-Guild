type GitHubLabel = {
  name?: string | null;
};

type GitHubIssue = {
  title: string;
  body?: string | null;
  html_url: string;
  labels?: GitHubLabel[];
  repository_url?: string;
};

type GitHubRepository = {
  html_url: string;
  full_name: string;
  name: string;
  owner?: {
    login?: string | null;
  } | null;
  description?: string | null;
  language?: string | null;
  topics?: string[];
  default_branch?: string | null;
  homepage?: string | null;
};

export type GitHubQuestPrefill = {
  title: string;
  description: string;
  detailedDescription: string;
  questType: 'commission' | 'bug_bounty' | 'code_refactor';
  questCategory: string;
  difficulty: 'F' | 'E' | 'D' | 'C';
  xpReward: number;
  skillPointsReward: number;
  requiredSkills: string[];
  requiredRank: 'F' | 'E' | 'D' | 'C';
  maxParticipants: number;
  acceptanceCriteria: string[];
  partnerOrgName: string;
  track: 'OPEN';
  source: 'CLIENT_PORTAL';
  githubIssueUrl: string;
  repositoryUrl: string;
};

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  frontend: ['frontend', 'ui', 'ux', 'react', 'next', 'tailwind', 'css', 'component', 'page'],
  backend: ['backend', 'api', 'server', 'database', 'prisma', 'auth', 'endpoint', 'postgres'],
  fullstack: ['fullstack', 'full stack', 'dashboard', 'workflow', 'feature'],
  mobile: ['mobile', 'ios', 'android', 'react native', 'flutter'],
  ai_ml: ['ai', 'ml', 'llm', 'rag', 'model', 'embedding', 'inference'],
  devops: ['devops', 'deployment', 'docker', 'ci', 'cd', 'infra', 'kubernetes'],
  security: ['security', 'authz', 'permission', 'vulnerability', 'encryption'],
  qa: ['qa', 'test', 'testing', 'playwright', 'jest', 'cypress'],
  design: ['design', 'figma', 'visual', 'branding', 'layout'],
  data_science: ['data', 'analytics', 'pipeline', 'notebook', 'visualization'],
};

const SKILL_KEYWORDS: Record<string, string[]> = {
  React: ['react'],
  'Next.js': ['next.js', 'nextjs', 'next'],
  TypeScript: ['typescript', 'ts'],
  JavaScript: ['javascript'],
  TailwindCSS: ['tailwind'],
  'Node.js': ['node', 'node.js'],
  Prisma: ['prisma'],
  PostgreSQL: ['postgres', 'postgresql'],
  Python: ['python'],
  Docker: ['docker'],
  Playwright: ['playwright'],
  Jest: ['jest'],
  'GitHub Actions': ['github actions', 'ci'],
};

const SIMPLE_LABELS = ['good first issue', 'beginner', 'easy', 'starter', 'documentation', 'docs'];
const MEDIUM_LABELS = ['enhancement', 'feature', 'help wanted'];
const HARD_LABELS = ['epic', 'complex', 'architecture', 'refactor', 'performance'];

export function parseGitHubIssueUrl(issueUrl: string): { owner: string; repo: string; issueNumber: string } | null {
  const trimmed = issueUrl.trim();

  try {
    const url = new URL(trimmed);
    if (url.hostname !== 'github.com') return null;

    const parts = url.pathname.split('/').filter(Boolean);
    if (parts.length < 4) return null;
    const [owner, repo, resource, issueNumber] = parts;
    if (resource !== 'issues' || !owner || !repo || !issueNumber) return null;
    if (!/^\d+$/.test(issueNumber)) return null;

    return { owner, repo, issueNumber };
  } catch {
    return null;
  }
}

function normalizeText(value?: string | null): string {
  return (value ?? '').replace(/\r/g, '').trim();
}

function firstMeaningfulParagraph(body: string): string {
  const paragraphs = body
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/\n+/g, ' ').trim())
    .filter(Boolean)
    .filter((paragraph) => !paragraph.startsWith('#') && !paragraph.startsWith('- ['));

  return paragraphs[0] ?? '';
}

function inferQuestCategory(issue: GitHubIssue, repo: GitHubRepository): string {
  const haystack = [
    issue.title,
    issue.body,
    repo.description,
    repo.language,
    ...(issue.labels ?? []).map((label) => label.name ?? ''),
    ...(repo.topics ?? []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  let bestCategory = 'fullstack';
  let bestScore = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const score = keywords.reduce((sum, keyword) => sum + (haystack.includes(keyword) ? 1 : 0), 0);
    if (score > bestScore) {
      bestCategory = category;
      bestScore = score;
    }
  }

  if (bestScore === 0 && repo.language?.toLowerCase() === 'typescript') return 'frontend';
  return bestCategory;
}

function inferSkills(issue: GitHubIssue, repo: GitHubRepository): string[] {
  const haystack = [
    issue.title,
    issue.body,
    repo.description,
    repo.language,
    ...(issue.labels ?? []).map((label) => label.name ?? ''),
    ...(repo.topics ?? []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const detected = new Set<string>();
  for (const [skill, keywords] of Object.entries(SKILL_KEYWORDS)) {
    if (keywords.some((keyword) => haystack.includes(keyword))) {
      detected.add(skill);
    }
  }

  if (repo.language === 'TypeScript') detected.add('TypeScript');
  if (repo.language === 'JavaScript') detected.add('JavaScript');
  if (detected.size === 0) detected.add('GitHub');

  return Array.from(detected).slice(0, 6);
}

function inferDifficulty(issue: GitHubIssue): 'F' | 'E' | 'D' | 'C' {
  const labels = (issue.labels ?? []).map((label) => (label.name ?? '').toLowerCase());
  const text = `${issue.title} ${issue.body ?? ''}`.toLowerCase();

  if (labels.some((label) => HARD_LABELS.some((keyword) => label.includes(keyword)))) return 'C';
  if (labels.some((label) => SIMPLE_LABELS.some((keyword) => label.includes(keyword)))) return 'F';
  if (labels.some((label) => MEDIUM_LABELS.some((keyword) => label.includes(keyword)))) return 'D';

  if (text.includes('refactor') || text.includes('migration') || text.includes('multi-step')) return 'C';
  if (text.includes('bug') || text.includes('copy') || text.includes('docs')) return 'E';

  return 'D';
}

function rewardsForDifficulty(difficulty: 'F' | 'E' | 'D' | 'C'): { xpReward: number; skillPointsReward: number } {
  switch (difficulty) {
    case 'F':
      return { xpReward: 100, skillPointsReward: 10 };
    case 'E':
      return { xpReward: 200, skillPointsReward: 20 };
    case 'C':
      return { xpReward: 4000, skillPointsReward: 200 };
    case 'D':
    default:
      return { xpReward: 2500, skillPointsReward: 120 };
  }
}

function inferQuestType(issue: GitHubIssue): 'commission' | 'bug_bounty' | 'code_refactor' {
  const labels = (issue.labels ?? []).map((label) => (label.name ?? '').toLowerCase());
  const text = `${issue.title} ${issue.body ?? ''}`.toLowerCase();

  if (labels.some((label) => label.includes('bug')) || text.includes('bug') || text.includes('fix')) {
    return 'bug_bounty';
  }

  if (labels.some((label) => label.includes('refactor')) || text.includes('refactor') || text.includes('cleanup')) {
    return 'code_refactor';
  }

  return 'commission';
}

function buildAcceptanceCriteria(issue: GitHubIssue): string[] {
  const summary = firstMeaningfulParagraph(normalizeText(issue.body));

  return [
    `Resolve the GitHub issue requirements described in ${issue.html_url}.`,
    summary ? `Ship the change described here: ${summary}` : 'Implement the requested change end-to-end.',
    'Open a pull request against the partner repository with a clear implementation summary.',
    'Add or update tests/documentation where the touched area requires it.',
    'Ensure the final branch passes existing lint/typecheck/test workflows, or document any blockers.',
  ];
}

function buildDetailedDescription(issue: GitHubIssue, repo: GitHubRepository): string {
  const body = normalizeText(issue.body);
  const issueContext = body || 'See the linked GitHub issue for the full technical context.';
  const defaultBranch = repo.default_branch ?? 'main';

  return [
    '## Repository',
    repo.html_url,
    '',
    '## GitHub Issue',
    issue.html_url,
    '',
    '## Original Context',
    issueContext,
    '',
    '## Suggested Setup',
    '```bash',
    `git clone ${repo.html_url}.git`,
    `cd ${repo.name}`,
    '# Install dependencies using the repo README instructions',
    `git checkout ${defaultBranch}`,
    '```',
    '',
    '## Student Deliverables',
    '- Reference the GitHub issue in the PR description.',
    '- Implement the fix/feature with concise notes for reviewers.',
    '- Include screenshots, logs, or test proof when relevant.',
  ].join('\n');
}

export function buildQuestPrefillFromGitHubIssue(
  issue: GitHubIssue,
  repo: GitHubRepository,
  partnerOrgName?: string
): GitHubQuestPrefill {
  const difficulty = inferDifficulty(issue);
  const rewards = rewardsForDifficulty(difficulty);

  return {
    title: issue.title.trim(),
    description:
      firstMeaningfulParagraph(normalizeText(issue.body)) ||
      repo.description?.trim() ||
      `Resolve ${issue.title.trim()} in ${repo.full_name}.`,
    detailedDescription: buildDetailedDescription(issue, repo),
    questType: inferQuestType(issue),
    questCategory: inferQuestCategory(issue, repo),
    difficulty,
    xpReward: rewards.xpReward,
    skillPointsReward: rewards.skillPointsReward,
    requiredSkills: inferSkills(issue, repo),
    requiredRank: difficulty,
    maxParticipants: 1,
    acceptanceCriteria: buildAcceptanceCriteria(issue),
    partnerOrgName: partnerOrgName?.trim() || repo.owner?.login?.trim() || repo.full_name.split('/')[0],
    track: 'OPEN',
    source: 'CLIENT_PORTAL',
    githubIssueUrl: issue.html_url,
    repositoryUrl: repo.html_url,
  };
}
