// prisma/seed-field-templates.ts
// Idempotently seeds the canonical default QuestFieldTemplates into the DB.
// Safe to run multiple times — matches existing templates by name.
//   Run: npx tsx prisma/seed-field-templates.ts
import { PrismaClient, Prisma } from '@prisma/client';
import { DEFAULT_FIELD_TEMPLATES } from '../lib/quest-field-templates';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding quest field templates…');
  for (const t of DEFAULT_FIELD_TEMPLATES) {
    const existing = await prisma.questFieldTemplate.findFirst({ where: { name: t.name } });
    const data = {
      name: t.name,
      description: t.description,
      questCategory: t.questCategory,
      questType: t.questType,
      briefFields: t.briefFields as unknown as Prisma.InputJsonValue,
      submissionFields: t.submissionFields as unknown as Prisma.InputJsonValue,
      defaultCriteria: t.defaultCriteria,
      isDefault: t.isDefault,
      isActive: true,
    };
    if (existing) {
      await prisma.questFieldTemplate.update({ where: { id: existing.id }, data });
      console.log(`  ↻ updated: ${t.name}`);
    } else {
      await prisma.questFieldTemplate.create({ data });
      console.log(`  ＋ created: ${t.name}`);
    }
  }
  const count = await prisma.questFieldTemplate.count();
  console.log(`✅ Done. ${count} templates in DB.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
