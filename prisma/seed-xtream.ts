// prisma/seed-xtream.ts
// Seeds the Xtream Car Treatment company account + its live Guild engagement
// quest so it appears in the "trusted by" section on the landing page
// (components/landing/SocialProof.tsx pulls real companies from /api/public/quests).
//
// Idempotent: re-running updates the same quest (matched by title + company).
//   Run: npx tsx prisma/seed-xtream.ts
import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const COMPANY_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

async function main() {
  console.log('🌱 Seeding Xtream Car Treatment company + engagement…');

  const passwordHash = await bcrypt.hash(process.env.XTREAM_PASSWORD || 'ChangeMe-Xtream-2026', 12);
  const company = await prisma.user.upsert({
    where: { id: COMPANY_ID },
    update: {},
    create: {
      id: COMPANY_ID,
      name: 'Xtream Car Treatment',
      username: 'xtream-car-treatment',
      email: 'vinay.xtreamcartreatment@gmail.com',
      passwordHash,
      role: 'company',
      rank: 'B',
      isVerified: true,
      bio: 'Daily doorstep waterless car detailing for HNI car owners in Ahmedabad. Founded 2018.',
      location: 'Ahmedabad, India',
    },
  });
  await prisma.companyProfile.upsert({
    where: { userId: company.id },
    update: { companyName: 'Xtream Car Treatment', industry: 'Automotive Services', isVerified: true },
    create: {
      userId: company.id,
      companyName: 'Xtream Car Treatment',
      companyDescription: 'Waterless doorstep car detailing for HNI car owners, Ahmedabad.',
      industry: 'Automotive Services',
      size: 'small',
      isVerified: true,
    },
  });
  console.log(`  ✓ company: ${company.email}`);

  const questData = {
    title: 'Digital Growth & Automation Strategy',
    description: 'Reallocate ad spend from Meta to Google/YouTube intent marketing, build a WhatsApp lead-qualification bot, and set up AEO for a premium car detailing business.',
    detailedDescription:
      'Phase 1: pause underperforming Meta cold campaigns, reallocate the same daily budget to 45% Google Local Search / 30% YouTube Pre-Roll / 25% Meta retargeting, targeting HNI car owners in Ahmedabad. Phase 2: WhatsApp Business bot for lead qualification and smart routing. Phase 3: AEO (schema markup + Google My Business) so AI assistants recommend the business directly.',
    questType: 'commission' as const,
    questCategory: 'ai_ml' as const,
    difficulty: 'C' as const,
    xpReward: 1200,
    skillPointsReward: 24,
    monetaryReward: null,
    requiredSkills: ['Digital Marketing', 'WhatsApp Business API', 'SEO/AEO'],
    maxParticipants: 2,
    track: 'INTERN' as const,
    source: 'CLIENT_PORTAL' as const,
    companyId: company.id,
    partnerOrgName: 'Xtream Car Treatment',
    status: 'available' as const, // public quest feed (getPublicQuests) only returns 'available' quests
  };

  const existing = await prisma.quest.findFirst({ where: { title: questData.title, companyId: company.id } });
  if (existing) {
    await prisma.quest.update({ where: { id: existing.id }, data: questData });
    console.log('  ↻ updated quest: Digital Growth & Automation Strategy');
  } else {
    await prisma.quest.create({ data: questData });
    console.log('  ＋ created quest: Digital Growth & Automation Strategy');
  }

  console.log('✅ Done. Xtream Car Treatment will now appear in the landing page trusted-companies section.');
  console.log('   ⚠️  Company login password = $XTREAM_PASSWORD or "ChangeMe-Xtream-2026" — rotate before real use.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
