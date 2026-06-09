import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma, withDbRetry } from '@/lib/db';
import { SkillTreeVisualization } from '@/components/skill-tree';

export default async function SkillTreePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  const userId = session.user.id;

  const [user, categories, achievements] = await withDbRetry(() => Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        skillPoints: true,
        skillProgress: {
          select: {
            skillId: true,
            level: true,
            experiencePoints: true,
          },
        },
      },
    }),
    prisma.skillCategory.findMany({
      include: {
        skills: {
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.achievement.findMany({
      where: { userId },
      orderBy: { unlockedAt: 'desc' },
      take: 4,
    }),
  ]));

  const progressBySkillId = new Map(
    (user?.skillProgress ?? []).map((progress) => [progress.skillId, progress])
  );

  const categoryViews = categories.map((category) => {
    const skills = category.skills.map((skill) => {
      const progress = progressBySkillId.get(skill.id);
      const level = progress?.level ?? 0;
      const experiencePoints = progress?.experiencePoints ?? 0;

      return {
        id: skill.id,
        name: skill.name,
        description: skill.description,
        level,
        experiencePoints,
        isUnlocked: level > 0 || experiencePoints > 0,
      };
    });

    return {
      id: category.id,
      name: category.name,
      description: category.description,
      totalSkills: skills.length,
      unlockedSkills: skills.filter((skill) => skill.isUnlocked).length,
      totalExperiencePoints: skills.reduce((sum, skill) => sum + skill.experiencePoints, 0),
      skills,
    };
  });

  const totalExperiencePoints = categoryViews.reduce(
    (sum, category) => sum + category.totalExperiencePoints,
    0
  );

  return (
    <div className="container py-8 md:py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-2">Skill Tree</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Track your live skill progress from the database without demo or placeholder data.
        </p>
      </div>
      <SkillTreeVisualization
        categories={categoryViews}
        totalExperiencePoints={totalExperiencePoints}
        availableSkillPoints={user?.skillPoints ?? 0}
        achievements={achievements.map((achievement) => ({
          id: achievement.id,
          type: achievement.type,
          unlockedAt: achievement.unlockedAt.toISOString(),
        }))}
      />
    </div>
  );
}
