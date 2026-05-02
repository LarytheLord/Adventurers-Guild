import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma, withDbRetry } from '@/lib/db';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Star, Zap } from 'lucide-react';

const DIFFICULTY_COLORS: Record<string, string> = {
  S: 'border-amber-300 bg-amber-100 text-amber-700',
  A: 'border-violet-300 bg-violet-100 text-violet-700',
  B: 'border-blue-300 bg-blue-100 text-blue-700',
  C: 'border-emerald-300 bg-emerald-100 text-emerald-700',
  D: 'border-slate-300 bg-slate-100 text-slate-700',
  E: 'border-stone-300 bg-stone-100 text-stone-600',
  F: 'border-gray-200 bg-gray-100 text-gray-500',
};

export default async function CompletedQuestsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  if (session.user.role === 'company') {
    redirect('/dashboard/company');
  }

  const completions = await withDbRetry(() =>
    prisma.questCompletion.findMany({
      where: { userId: session.user.id },
      include: {
        quest: {
          select: {
            title: true,
            difficulty: true,
            questCategory: true,
          },
        },
      },
      orderBy: { completionDate: 'desc' },
    })
  );

  const totalXp = completions.reduce((sum, c) => sum + c.xpEarned, 0);
  const totalCount = completions.length;

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Completed Quests</h1>
      <p className="text-muted-foreground mb-6">Your full completion history.</p>

      {/* Stat row */}
      <div className="grid grid-cols-2 gap-4 mb-8 md:w-fit">
        <div className="rounded-xl border bg-card p-4 flex items-center gap-3">
          <div className="rounded-full bg-amber-100 p-2">
            <Zap className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{totalXp.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total XP Earned</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4 flex items-center gap-3">
          <div className="rounded-full bg-green-100 p-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{totalCount}</p>
            <p className="text-xs text-muted-foreground">Quests Completed</p>
          </div>
        </div>
      </div>

      {/* List */}
      {completions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 px-4">
            <div className="rounded-full bg-muted p-4 mb-4">
              <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-center">No completions yet</h3>
            <p className="text-muted-foreground text-center text-sm">
              Complete your first quest to see your history here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {completions.map((c) => (
            <Card key={c.id} className="flex flex-col sm:flex-row overflow-hidden">
              <div className="w-full sm:w-1.5 bg-green-500 sm:h-auto h-1.5" />
              <div className="flex-1 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Badge
                      variant="outline"
                      className={DIFFICULTY_COLORS[c.quest.difficulty] ?? ''}
                    >
                      {c.quest.difficulty}-Rank
                    </Badge>
                    <Badge variant="secondary" className="capitalize">
                      {c.quest.questCategory.replace('_', ' ')}
                    </Badge>
                  </div>
                  <h3 className="text-base font-semibold truncate">{c.quest.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(c.completionDate).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-6 shrink-0">
                  <div className="flex items-center gap-1 text-amber-600">
                    <Zap className="h-4 w-4" />
                    <span className="font-semibold text-sm">+{c.xpEarned} XP</span>
                  </div>
                  {c.qualityScore !== null && (
                    <div className="flex items-center gap-1 text-slate-600">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="font-semibold text-sm">{c.qualityScore}/100</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
