// prisma/seed-bharatcode.ts
// Seeds the BharatCode company account + the first 6 real client quests, mapped
// from BharatCode's published "File & Artifact Platform" first-issues
// (https://github.com/BharatCode-ai/chat → docs/contributing/file-artifact-first-issues.md).
//
// Each quest carries a full structured brief (briefData against the matching
// field template) + acceptance criteria, so the context travels intact:
//   company brief → adventurer submission → PM/QA evaluation → forward to client.
//
// Idempotent: re-running updates the same quests (matched by title + company).
// Quests use track = INTERN so they route through the admin/PM QA gate
// (pending_admin_review) before being forwarded to BharatCode.
//
//   Run: npx tsx prisma/seed-bharatcode.ts
import { PrismaClient, Prisma, UserRank } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const REPO = 'https://github.com/BharatCode-ai/chat';
const COMPANY_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const ISSUES_DOC = `${REPO}/blob/main/docs/contributing/file-artifact-first-issues.md`;
const RFC = `${REPO}/blob/main/docs/rfcs/0001-file-artifact-platform.md`;

interface SeedQuest {
  title: string;
  description: string;
  detailedDescription: string;
  difficulty: UserRank;
  xpReward: number;
  category: 'backend' | 'frontend';
  templateName: string;
  requiredSkills: string[];
  brief: Record<string, unknown>;
  acceptanceCriteria: string[];
}

const QUESTS: SeedQuest[] = [
  {
    title: 'BharatCode: Storage Driver Interfaces',
    description: 'Define the StorageDriver interface + result/error types with an in-memory fake and unit tests.',
    detailedDescription:
      'Define a small, mockable `StorageDriver` interface and its result/error types covering write, read, metadata, delete, and copy/version operations. Add unit tests using an in-memory fake. No cloud SDK or production credentials.',
    difficulty: 'F',
    xpReward: 400,
    category: 'backend',
    templateName: 'Backend / API task',
    requiredSkills: ['TypeScript', 'Unit Testing'],
    brief: {
      repoUrl: REPO,
      baseBranch: 'main',
      apiContract:
        'StorageDriver with: write(objectName, data, meta), read(objectName), metadata(objectName), delete(objectName), copy(src, dst)/version(...). Define explicit Result and Error types for each.',
      filesInScope: 'New storage driver interface module + in-memory fake + its unit tests.',
      outOfScope: 'GCS, signed URLs, IAM, quotas, production object paths, Supabase / BharatCode identity integration.',
      setupSteps: 'npm ci → copy env files per README → run targeted checks.',
      testCommand: 'node --test',
    },
    acceptanceCriteria: [
      'Interfaces are small and mockable',
      'Tests describe success and common error cases',
      'No production credential or cloud SDK is required',
    ],
  },
  {
    title: 'BharatCode: Local Disk Storage Driver',
    description: 'Implement LocalDiskStorageDriver behind the StorageDriver interface with path-traversal protection.',
    detailedDescription:
      'Implement `LocalDiskStorageDriver` behind the `StorageDriver` interface. Store files under `.bharatcode/storage`. Prevent path traversal and unsafe object names. Generated local files must be git-ignored.',
    difficulty: 'E',
    xpReward: 650,
    category: 'backend',
    templateName: 'Backend / API task',
    requiredSkills: ['TypeScript', 'Node.js', 'Filesystem'],
    brief: {
      repoUrl: REPO,
      baseBranch: 'main',
      apiContract: 'Implements the StorageDriver interface (write/read/metadata/delete/version) against the local filesystem.',
      filesInScope: 'LocalDiskStorageDriver implementation + unit tests. .gitignore entry for .bharatcode/storage.',
      outOfScope: 'GCS parity behaviour, production retention and cleanup jobs.',
      setupSteps: 'npm ci → copy env files per README.',
      testCommand: 'node --test',
    },
    acceptanceCriteria: [
      'Unit tests cover write/read/delete/version paths',
      'Path traversal attempts fail',
      'Generated local files are ignored by git',
    ],
  },
  {
    title: 'BharatCode: File & Artifact Metadata Schemas',
    description: 'Add schema/type tests for files, file_versions, artifacts, artifact_versions, and related tables.',
    detailedDescription:
      'Add schema/type tests for `files`, `file_versions`, `artifacts`, `artifact_versions`, `artifact_files`, `file_attachments`, and `derived_assets`. Include ownership, MIME, size, lifecycle, version, and visibility fields. Default visibility must be private.',
    difficulty: 'E',
    xpReward: 650,
    category: 'backend',
    templateName: 'Backend / API task',
    requiredSkills: ['TypeScript', 'Schema Design', 'Testing'],
    brief: {
      repoUrl: REPO,
      baseBranch: 'main',
      apiContract:
        'Model shapes for files, file_versions, artifacts, artifact_versions, artifact_files, file_attachments, derived_assets — with ownership, MIME, size, lifecycle, version, visibility. Leave room for future projects/sharing.',
      filesInScope: 'Schema/type definitions + tests validating required fields and default privacy.',
      outOfScope: 'Database migrations against production data, Supabase ownership enforcement, live DB connection.',
      setupSteps: 'npm ci → copy env files per README.',
      testCommand: 'node --test',
    },
    acceptanceCriteria: [
      'Tests validate required fields and default privacy',
      'Model shape leaves room for future projects and sharing',
      'No production database connection is required',
    ],
  },
  {
    title: 'BharatCode: MIME Detection & Validation',
    description: 'Add MIME detection/validation helpers with tests; reject extension-only spoofing.',
    detailedDescription:
      'Add MIME detection helpers + tests for PDF, DOCX, PPTX, XLSX, CSV, Markdown, HTML, plain text, and common image types. Reject unsupported or ambiguous inputs with stable, API-suitable errors. Reject extension-only spoofing where content sniffing is available.',
    difficulty: 'D',
    xpReward: 900,
    category: 'backend',
    templateName: 'Backend / API task',
    requiredSkills: ['TypeScript', 'File Parsing', 'Testing'],
    brief: {
      repoUrl: REPO,
      baseBranch: 'main',
      apiContract:
        'detectMime(input) → mime + validation result. Stable error values suitable for API responses. Support: PDF, DOCX, PPTX, XLSX, CSV, Markdown, HTML, text, common images.',
      filesInScope: 'MIME helpers + tests using small local fixtures.',
      outOfScope: 'OCR, embedding, preview generation, malware scanning.',
      setupSteps: 'npm ci → copy env files per README.',
      testCommand: 'node --test',
    },
    acceptanceCriteria: [
      'Tests use small local fixtures',
      'Extension-only spoofing is rejected where content sniffing is available',
      'Error messages are suitable for API responses',
    ],
  },
  {
    title: 'BharatCode: Processor Registry Skeleton',
    description: 'Add a dependency-injected ProcessorRegistry with no-op processors and dispatch tests.',
    detailedDescription:
      'Add a `ProcessorRegistry` interface + no-op processor implementations. Route supported MIME types to named processor capabilities. Include tests for registration and dispatch behaviour. Unsupported MIME types must produce deterministic errors. No external binaries.',
    difficulty: 'D',
    xpReward: 900,
    category: 'backend',
    templateName: 'Backend / API task',
    requiredSkills: ['TypeScript', 'Design Patterns', 'Testing'],
    brief: {
      repoUrl: REPO,
      baseBranch: 'main',
      apiContract:
        'ProcessorRegistry.register(mime, processor) + dispatch(mime, payload). No-op processors for now. Deterministic error for unsupported MIME types.',
      filesInScope: 'ProcessorRegistry interface + no-op processors + registration/dispatch tests.',
      outOfScope: 'Real PDF parsing, Office conversion, OCR, embeddings, sandbox execution.',
      setupSteps: 'npm ci → copy env files per README.',
      testCommand: 'node --test',
    },
    acceptanceCriteria: [
      'Registry is dependency-injected and easy to test',
      'Unsupported MIME types produce deterministic errors',
      'No external binaries are required',
    ],
  },
  {
    title: 'BharatCode: Artifact Card UI (mock data)',
    description: 'Build a reusable artifact card for chat messages with loading/error/deleted states, using mock data.',
    detailedDescription:
      'Build a reusable artifact card component for chat messages showing name, type, size, created time, open/download actions, rename, and delete affordances. Use mocked data + local story/test fixtures. Handle long filenames, mobile widths, and loading/error/deleted states.',
    difficulty: 'E',
    xpReward: 700,
    category: 'frontend',
    templateName: 'Frontend / UI task',
    requiredSkills: ['React', 'TypeScript', 'UI'],
    brief: {
      repoUrl: REPO,
      baseBranch: 'main',
      designLinks: [RFC],
      componentsInScope: 'ArtifactCard component (name, type, size, created time, open/download, rename, delete) with mock data.',
      responsiveTargets: 'mobile + desktop',
      outOfScope: 'Real download endpoints, production artifact permissions.',
      testCommand: 'npm run frontend:ci',
    },
    acceptanceCriteria: [
      'Component handles long filenames and mobile widths',
      'Loading, error, and deleted states are represented',
      'Uses mocked data with local story/test fixtures',
    ],
  },
];

async function main() {
  console.log('🌱 Seeding BharatCode company + quests…');

  // 1. Company account ------------------------------------------------------
  const passwordHash = await bcrypt.hash(process.env.BHARATCODE_PASSWORD || 'ChangeMe-BharatCode-2026', 12);
  const company = await prisma.user.upsert({
    where: { id: COMPANY_ID },
    update: {},
    create: {
      id: COMPANY_ID,
      name: 'BharatCode',
      username: 'bharatcode',
      email: 'partners@bharatcode.ai',
      passwordHash,
      role: 'company',
      rank: 'A',
      isVerified: true,
      bio: 'Open-source AI chat platform (LibreChat fork). First Adventurers Guild client.',
      website: 'https://bharatcode.ai',
      github: 'BharatCode-ai',
    },
  });
  await prisma.companyProfile.upsert({
    where: { userId: company.id },
    update: { companyName: 'BharatCode' },
    create: { userId: company.id, companyName: 'BharatCode' },
  });
  console.log(`  ✓ company: ${company.email}`);

  // 2. Resolve templates by name -------------------------------------------
  const templates = await prisma.questFieldTemplate.findMany({ where: { isActive: true } });
  const byName = new Map(templates.map((t) => [t.name, t]));

  // 3. Quests (idempotent by title + company) -------------------------------
  for (const q of QUESTS) {
    const template = byName.get(q.templateName);
    const existing = await prisma.quest.findFirst({ where: { title: q.title, companyId: company.id } });
    const data = {
      title: q.title,
      description: q.description,
      detailedDescription: `${q.detailedDescription}\n\nSource: ${ISSUES_DOC}`,
      questType: 'commission' as const,
      questCategory: q.category,
      difficulty: q.difficulty,
      xpReward: q.xpReward,
      skillPointsReward: Math.round(q.xpReward / 50),
      monetaryReward: null, // set per your rate card before going paid
      requiredSkills: q.requiredSkills,
      maxParticipants: 1,
      track: 'INTERN' as const, // routes through the admin/PM QA gate before client
      source: 'CLIENT_PORTAL' as const,
      companyId: company.id,
      partnerOrgName: 'BharatCode',
      fieldTemplateId: template?.id ?? null,
      briefData: q.brief as Prisma.InputJsonValue,
      acceptanceCriteria: q.acceptanceCriteria,
      status: 'available' as const,
    };
    if (existing) {
      await prisma.quest.update({ where: { id: existing.id }, data });
      console.log(`  ↻ updated quest: ${q.title}`);
    } else {
      await prisma.quest.create({ data });
      console.log(`  ＋ created quest: ${q.title}`);
    }
  }

  const total = await prisma.quest.count({ where: { companyId: company.id } });
  console.log(`✅ Done. ${total} BharatCode quests in DB.`);
  console.log('   ⚠️  Company login password = $BHARATCODE_PASSWORD or "ChangeMe-BharatCode-2026" — reset it.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
