'use client';

import { useEffect, useState } from 'react';
import { Award, CheckCircle, Code, Database, Lock, Server, Sparkles, Trophy, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

type SkillView = {
  id: string;
  name: string;
  description: string;
  level: number;
  experiencePoints: number;
  isUnlocked: boolean;
};

type SkillCategoryView = {
  id: string;
  name: string;
  description: string | null;
  totalSkills: number;
  unlockedSkills: number;
  totalExperiencePoints: number;
  skills: SkillView[];
};

type AchievementView = {
  id: string;
  type: string;
  unlockedAt: string;
};

type SkillTreeVisualizationProps = {
  categories: SkillCategoryView[];
  totalExperiencePoints: number;
  availableSkillPoints: number;
  achievements: AchievementView[];
};

const iconForCategory = (name: string) => {
  const key = name.toLowerCase();
  if (key.includes('front')) return Code;
  if (key.includes('back')) return Server;
  if (key.includes('data')) return Database;
  if (key.includes('devops') || key.includes('infra')) return Zap;
  return Sparkles;
};

const colorForCategory = (index: number) => {
  const colors = [
    'bg-sky-500',
    'bg-emerald-500',
    'bg-violet-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-cyan-500',
  ];
  return colors[index % colors.length];
};

const formatAchievement = (type: string) =>
  type
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export function SkillTreeVisualization({
  categories,
  totalExperiencePoints,
  availableSkillPoints,
  achievements,
}: SkillTreeVisualizationProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(categories[0]?.id ?? null);

  useEffect(() => {
    setSelectedCategoryId(categories[0]?.id ?? null);
  }, [categories]);

  const selectedCategory =
    categories.find((category) => category.id === selectedCategoryId) ?? categories[0] ?? null;
  const totalSkills = categories.reduce((sum, category) => sum + category.totalSkills, 0);
  const unlockedSkills = categories.reduce((sum, category) => sum + category.unlockedSkills, 0);
  const overallProgress = totalSkills > 0 ? (unlockedSkills / totalSkills) * 100 : 0;

  return (
    <div className="space-y-6">
      <Card className="border-2 border-slate-200 bg-gradient-to-r from-slate-50 to-sky-50">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="h-7 w-7 text-amber-500" />
              <div>
                <h3 className="text-lg font-bold sm:text-xl">Skill Progress</h3>
                <p className="text-sm text-slate-600">
                  Everything here is pulled from your live skill records.
                </p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-2xl font-bold text-slate-900">{totalExperiencePoints.toLocaleString()} XP</div>
              <div className="text-sm text-slate-500">{availableSkillPoints.toLocaleString()} skill points available</div>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={overallProgress} className="h-2.5" />
            <div className="mt-2 flex flex-col gap-1 text-xs text-slate-500 sm:flex-row sm:justify-between">
              <span>{unlockedSkills}/{totalSkills} skills unlocked</span>
              <span>{Math.round(overallProgress)}% unlocked</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {categories.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-slate-500">
            No skill categories are configured in the database yet.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {categories.map((category, index) => {
              const Icon = iconForCategory(category.name);
              const color = colorForCategory(index);
              const progress = category.totalSkills > 0
                ? (category.unlockedSkills / category.totalSkills) * 100
                : 0;

              return (
                <Card
                  key={category.id}
                  className={`cursor-pointer border-2 transition-all hover:shadow-md ${
                    selectedCategory?.id === category.id ? 'border-slate-900' : 'border-slate-200'
                  }`}
                  onClick={() => setSelectedCategoryId(category.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`rounded-lg p-2 text-white ${color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-base sm:text-lg">{category.name}</CardTitle>
                          <p className="text-sm text-slate-500">
                            {category.description || 'No description yet.'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-slate-900">
                          {category.totalExperiencePoints.toLocaleString()} XP
                        </div>
                        <div className="text-xs text-slate-500">
                          {category.unlockedSkills}/{category.totalSkills} unlocked
                        </div>
                      </div>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </CardHeader>
                </Card>
              );
            })}
          </div>

          {selectedCategory && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold sm:text-2xl">{selectedCategory.name}</h3>
                <p className="text-sm text-slate-500">
                  {selectedCategory.description || 'Live progress by skill.'}
                </p>
              </div>

              <div className="grid gap-3">
                {selectedCategory.skills.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-sm text-slate-500">
                      No skills have been added to this category yet.
                    </CardContent>
                  </Card>
                ) : (
                  selectedCategory.skills.map((skill, index) => {
                    const color = colorForCategory(index);

                    return (
                      <Card
                        key={skill.id}
                        className={skill.isUnlocked ? 'border-emerald-200 bg-emerald-50/40' : 'border-slate-200'}
                      >
                        <CardContent className="p-4">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-3">
                              <div className={`rounded-lg p-2 text-white ${skill.isUnlocked ? color : 'bg-slate-400'}`}>
                                {skill.isUnlocked ? <Sparkles className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                              </div>
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className="font-semibold text-slate-900">{skill.name}</h4>
                                  {skill.isUnlocked ? (
                                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                                      <CheckCircle className="mr-1 h-3 w-3" />
                                      Unlocked
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline">Locked</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-slate-500">{skill.description}</p>
                              </div>
                            </div>
                            <div className="text-left sm:text-right">
                              <div className="text-lg font-bold text-slate-900">
                                {skill.experiencePoints.toLocaleString()} XP
                              </div>
                              <div className="text-xs text-slate-500">Level {skill.level}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </>
      )}

      <div>
        <h3 className="mb-3 flex items-center text-lg font-bold sm:text-xl">
          <Award className="mr-2 h-5 w-5" />
          Recent Achievements
        </h3>
        {achievements.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-sm text-slate-500">
              No achievements unlocked yet.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {achievements.map((achievement, index) => (
              <Card key={achievement.id} className="p-4 text-center">
                <div className={`mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full text-white ${colorForCategory(index)}`}>
                  <Award className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-semibold text-slate-900">
                  {formatAchievement(achievement.type)}
                </h4>
                <p className="mt-1 text-xs text-slate-500">
                  {new Date(achievement.unlockedAt).toLocaleDateString()}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function SkillTree() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-2 text-base font-bold text-white shadow-lg transition-all duration-300 ease-out hover:from-purple-700 hover:to-blue-700 hover:shadow-xl sm:px-8 sm:py-3 sm:text-lg"
          onClick={() => setIsOpen(true)}
        >
          <Sparkles className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
          View Skill Tree
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Skill Tree</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-slate-500">
          Open the dashboard skill tree page to see your live database-backed progress.
        </p>
      </DialogContent>
    </Dialog>
  );
}
