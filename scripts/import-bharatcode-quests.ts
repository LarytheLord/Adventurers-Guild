#!/usr/bin/env node
/**
 * Import unclaimed BharatCode (https://github.com/BharatCode-ai) issues as Guild quests.
 *
 * - Pulls OPEN issues from every public BharatCode-ai repo.
 * - Skips: assigned issues, `maintainer-owned` issues (need production access),
 *   and "Start here"/contributing meta-issues (no real deliverable).
 * - Reuses the app's own GitHub→quest mapping (lib/github-quest-prefill).
 * - Forces requiredRank='F' so the entry barrier is the lowest rank (anyone can take it).
 * - Idempotent: skips an issue if a quest already references its URL.
 *
 * Usage:
 *   DRY_RUN=1 npx tsx scripts/import-bharatcode-quests.ts   # preview, no writes
 *   npx tsx scripts/import-bharatcode-quests.ts             # create quests
 */

import 'dotenv/config';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { PrismaClient } from '@prisma/client';
import {
  buildQuestPrefillFromGitHubIssue,
  type GitHubQuestPrefill,
} from '../lib/github-quest-prefill';

const ORG = 'BharatCode-ai';
const PARTNER = 'BharatCode';
const DRY_RUN = process.env.DRY_RUN === '1';

// Labels / titles that should NOT become F-rank student quests.
const EXCLUDED_LABELS = ['maintainer-owned'];
const EXCLUDED_TITLE_PREFIXES = ['start here'];

const databaseUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('No DATABASE_URL / DATABASE_URL_UNPOOLED in environment.');
  process.exit(1);
}

const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });

async function gh<T>(path: string): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'Adventurers-Guild',
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (!res.ok) {
    throw new Error(`GitHub ${path} failed (${res.status}): ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

type GHIssue = {
  number: number;
  title: string;
  html_url: string;
  body?: string | null;
  labels?: { name?: string | null }[];
  assignees?: unknown[];
  assignee?: unknown;
  pull_request?: unknown;
};

function isClaimable(issue: GHIssue): boolean {
  if (issue.pull_request) return false; // it's a PR, not an issue
  if ((issue.assignees?.length ?? 0) > 0 || issue.assignee) return false; // already claimed
  const labels = (issue.labels ?? []).map((l) => (l.name ?? '').toLowerCase());
  if (labels.some((l) => EXCLUDED_LABELS.includes(l))) return false;
  const title = issue.title.trim().toLowerCase();
  if (EXCLUDED_TITLE_PREFIXES.some((p) => title.startsWith(p))) return false;
  return true;
}

async function main() {
  console.log(`\n${DRY_RUN ? '🔍 DRY RUN — ' : ''}Importing unclaimed ${ORG} issues as F-rank quests\n`);

  const repos = await gh<{ name: string; archived: boolean }[]>(
    `/orgs/${ORG}/repos?per_page=100&type=public`,
  );

  let created = 0;
  let skippedExisting = 0;
  let skippedFiltered = 0;

  for (const repo of repos.filter((r) => !r.archived)) {
    const repoData = await gh<Parameters<typeof buildQuestPrefillFromGitHubIssue>[1]>(
      `/repos/${ORG}/${repo.name}`,
    );
    const issues = await gh<GHIssue[]>(
      `/repos/${ORG}/${repo.name}/issues?state=open&per_page=100`,
    );

    for (const issue of issues) {
      if (!isClaimable(issue)) {
        if (!issue.pull_request) skippedFiltered++;
        continue;
      }

      // Idempotency: a quest's detailedDescription embeds the issue URL.
      const existing = await prisma.quest.findFirst({
        where: { partnerOrgName: PARTNER, detailedDescription: { contains: issue.html_url } },
        select: { id: true },
      });
      if (existing) {
        skippedExisting++;
        console.log(`  ↷ skip (exists): ${repo.name}#${issue.number} — ${issue.title}`);
        continue;
      }

      const prefill: GitHubQuestPrefill = buildQuestPrefillFromGitHubIssue(
        issue as never,
        repoData,
        PARTNER,
      );

      const label = `${repo.name}#${issue.number} [${prefill.difficulty}→F] ${prefill.title}`;
      if (DRY_RUN) {
        console.log(`  + would create: ${label}`);
        created++;
        continue;
      }

      await prisma.quest.create({
        data: {
          title: prefill.title,
          description: prefill.description,
          detailedDescription: prefill.detailedDescription,
          questType: prefill.questType,
          questCategory: prefill.questCategory as never,
          difficulty: prefill.difficulty as never, // honest complexity (XP basis)
          xpReward: prefill.xpReward,
          skillPointsReward: prefill.skillPointsReward,
          monetaryReward: null,
          requiredSkills: prefill.requiredSkills,
          requiredRank: 'F', // ← minimum barrier to enter, per request
          maxParticipants: prefill.maxParticipants,
          acceptanceCriteria: prefill.acceptanceCriteria,
          track: 'OPEN',
          source: 'CLIENT_PORTAL',
          partnerOrgName: PARTNER,
          status: 'available',
          companyId: null,
        },
      });
      created++;
      console.log(`  ✓ created: ${label}`);
    }
  }

  console.log(
    `\n${DRY_RUN ? 'Would create' : 'Created'}: ${created} · skipped (already exists): ${skippedExisting} · skipped (filtered out): ${skippedFiltered}\n`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
