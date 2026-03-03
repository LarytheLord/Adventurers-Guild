import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SkillTreeVisualization } from '@/components/skill-tree';

export default async function SkillTreePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="container py-8 md:py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-2">Skill Tree</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Track your progress, unlock new abilities, and master the art of development.
        </p>
      </div>
      <SkillTreeVisualization />
    </div>
  );
}