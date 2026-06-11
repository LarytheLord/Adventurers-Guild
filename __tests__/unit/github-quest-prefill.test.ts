import {
  buildQuestPrefillFromGitHubIssue,
  parseGitHubIssueUrl,
} from '@/lib/github-quest-prefill';

describe('github quest prefill helpers', () => {
  it('parses a standard GitHub issue URL', () => {
    expect(parseGitHubIssueUrl('https://github.com/vercel/next.js/issues/12345')).toEqual({
      owner: 'vercel',
      repo: 'next.js',
      issueNumber: '12345',
    });
  });

  it('rejects non-issue GitHub URLs', () => {
    expect(parseGitHubIssueUrl('https://github.com/vercel/next.js/pull/12345')).toBeNull();
    expect(parseGitHubIssueUrl('https://example.com/vercel/next.js/issues/12345')).toBeNull();
  });

  it('builds a quest draft from issue and repo metadata', () => {
    const prefill = buildQuestPrefillFromGitHubIssue(
      {
        title: 'Add filters to the issues dashboard',
        body: 'The current dashboard is hard to scan.\n\nAdd status and label filters to the React page and update tests.',
        html_url: 'https://github.com/open-source/demo/issues/17',
        labels: [{ name: 'enhancement' }, { name: 'frontend' }],
      },
      {
        html_url: 'https://github.com/open-source/demo',
        full_name: 'open-source/demo',
        name: 'demo',
        owner: { login: 'open-source' },
        description: 'A Next.js demo app',
        language: 'TypeScript',
        topics: ['nextjs', 'react', 'dashboard'],
        default_branch: 'main',
      }
    );

    expect(prefill.title).toBe('Add filters to the issues dashboard');
    expect(prefill.questCategory).toBe('frontend');
    expect(prefill.questType).toBe('commission');
    expect(prefill.requiredSkills).toEqual(expect.arrayContaining(['React', 'Next.js', 'TypeScript']));
    expect(prefill.partnerOrgName).toBe('open-source');
    expect(prefill.track).toBe('OPEN');
    expect(prefill.source).toBe('CLIENT_PORTAL');
    expect(prefill.acceptanceCriteria.length).toBeGreaterThan(2);
    expect(prefill.detailedDescription).toContain('## Repository');
    expect(prefill.detailedDescription).toContain('https://github.com/open-source/demo/issues/17');
  });
});
