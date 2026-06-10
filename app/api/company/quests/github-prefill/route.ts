import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { buildQuestPrefillFromGitHubIssue, parseGitHubIssueUrl } from '@/lib/github-quest-prefill';

async function fetchGitHubJson(url: string) {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'Adventurers-Guild',
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const response = await fetch(url, {
    headers,
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GitHub request failed (${response.status}): ${errorText || response.statusText}`);
  }

  return response.json();
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await requireAuth(request, 'company', 'admin');
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const body = await request.json();
    const issueUrl = typeof body.issueUrl === 'string' ? body.issueUrl : '';
    const partnerOrgName = typeof body.partnerOrgName === 'string' ? body.partnerOrgName : '';

    const parsed = parseGitHubIssueUrl(issueUrl);
    if (!parsed) {
      return NextResponse.json(
        { error: 'Please provide a valid GitHub issue URL like https://github.com/org/repo/issues/123', success: false },
        { status: 400 }
      );
    }

    const issue = await fetchGitHubJson(
      `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/issues/${parsed.issueNumber}`
    );

    if (issue.pull_request) {
      return NextResponse.json(
        { error: 'This link points to a pull request. Please use a GitHub issue URL instead.', success: false },
        { status: 400 }
      );
    }

    const repo = await fetchGitHubJson(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}`);
    const prefill = buildQuestPrefillFromGitHubIssue(issue, repo, partnerOrgName);

    return NextResponse.json({ success: true, prefill });
  } catch (error) {
    console.error('Error creating GitHub quest prefill:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch GitHub issue details. Check that the issue is public and reachable.',
        success: false,
      },
      { status: 500 }
    );
  }
}
