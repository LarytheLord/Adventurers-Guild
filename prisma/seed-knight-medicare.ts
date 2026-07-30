// prisma/seed-knight-medicare.ts
// Seeds the Knight Medicare company account + a representative engagement
// quest. Knight Medicare is Abid's other venture (healthcare-tech platform
// connecting patients with doctors, Harvard MD clinical co-founder) — it has
// been Guild's documented pilot company since the project's earliest docs
// (see docs/EXECUTIVE_BRIEF.md, docs/critical.txt, docs/QUEST_POSTING_GUIDE.md)
// and reuses the same reserved company ID those docs/scripts already
// reference. Wiped in the 2026-07-09 production incident, never restored.
//
// Idempotent: re-running updates the same quest (matched by title + company).
//   Run: npx tsx prisma/seed-knight-medicare.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const COMPANY_ID = '11111111-1111-1111-1111-111111111111';

async function main() {
  console.log('🌱 Seeding Knight Medicare company + engagement…');

  const passwordHash = await bcrypt.hash(process.env.KNIGHT_MEDICARE_PASSWORD || 'ChangeMe-KnightMedicare-2026', 12);
  const company = await prisma.user.upsert({
    where: { id: COMPANY_ID },
    update: {},
    create: {
      id: COMPANY_ID,
      name: 'Knight Medicare',
      username: 'knight-medicare',
      email: 'contact@knightmedicare.com',
      passwordHash,
      role: 'company',
      rank: 'S',
      isVerified: true,
      bio: 'Healthcare technology platform connecting patients with doctors.',
      website: 'https://knightmedicare.com',
      location: 'Ahmedabad, India',
    },
  });
  await prisma.companyProfile.upsert({
    where: { userId: company.id },
    update: { companyName: 'Knight Medicare', industry: 'Healthcare Tech', isVerified: true },
    create: {
      userId: company.id,
      companyName: 'Knight Medicare',
      companyWebsite: 'https://knightmedicare.com',
      companyDescription: 'Healthcare technology platform connecting patients with doctors.',
      industry: 'Healthcare Tech',
      size: 'small',
      isVerified: true,
    },
  });
  console.log(`  ✓ company: ${company.email}`);

  const questData = {
    title: 'Patient Dashboard UI',
    description: 'A responsive dashboard for patients to view medical records, upcoming appointments, and prescriptions.',
    detailedDescription:
      'Build a clean, intuitive patient-facing dashboard using React/Next.js and Tailwind CSS — appointment history, records access, and prescription tracking in one view.',
    questType: 'commission' as const,
    questCategory: 'frontend' as const,
    difficulty: 'C' as const,
    xpReward: 1200,
    skillPointsReward: 15,
    monetaryReward: null,
    requiredSkills: ['React', 'TypeScript', 'CSS/Tailwind'],
    maxParticipants: 1,
    track: 'OPEN' as const, // getPublicQuests() defaults to track=OPEN — see the Xtream fix (#444) for why
    source: 'CLIENT_PORTAL' as const,
    companyId: company.id,
    status: 'available' as const, // getPublicQuests() also hardcodes status=available
  };

  const existing = await prisma.quest.findFirst({ where: { title: questData.title, companyId: company.id } });
  if (existing) {
    await prisma.quest.update({ where: { id: existing.id }, data: questData });
    console.log('  ↻ updated quest: Patient Dashboard UI');
  } else {
    await prisma.quest.create({ data: questData });
    console.log('  ＋ created quest: Patient Dashboard UI');
  }

  console.log('✅ Done. Knight Medicare will now appear in the landing page trusted-companies section.');
  console.log('   ⚠️  Company login password = $KNIGHT_MEDICARE_PASSWORD or "ChangeMe-KnightMedicare-2026" — rotate before real use.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
