'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Code,
  Database,
  Brain,
  Server,
  Zap,
  Lock,
  Trophy,
  CheckCircle,
  Award,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
  level: number;
  maxLevel: number;
  skillPoints: number;
  isUnlocked: boolean;
  icon: React.ReactNode;
  color: string;
}

interface SkillCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  totalSkillPoints: number;
  maxSkillPoints: number;
  skills: Skill[];
}

const skillCategories: SkillCategory[] = [
  {
    id: 'frontend',
    name: 'Frontend Development',
    description: 'Master the art of creating beautiful user interfaces',
    icon: <Code className="w-6 h-6" />,
    color: 'bg-blue-500',
    totalSkillPoints: 1250,
    maxSkillPoints: 3000,
    skills: [
      { id: 'react', name: 'React Mastery', description: 'Build dynamic user interfaces with React', category: 'frontend', level: 3, maxLevel: 5, skillPoints: 450, isUnlocked: true, icon: <Code className="w-4 h-4" />, color: 'bg-blue-500' },
      { id: 'typescript', name: 'TypeScript', description: 'Add type safety to your JavaScript code', category: 'frontend', level: 2, maxLevel: 5, skillPoints: 300, isUnlocked: true, icon: <Code className="w-4 h-4" />, color: 'bg-blue-600' },
      { id: 'tailwind', name: 'Tailwind CSS', description: 'Rapidly build custom user interfaces', category: 'frontend', level: 4, maxLevel: 5, skillPoints: 500, isUnlocked: true, icon: <Code className="w-4 h-4" />, color: 'bg-cyan-500' },
    ],
  },
  {
    id: 'backend',
    name: 'Backend Development',
    description: 'Build robust server-side applications',
    icon: <Server className="w-6 h-6" />,
    color: 'bg-green-500',
    totalSkillPoints: 800,
    maxSkillPoints: 3000,
    skills: [
      { id: 'nodejs', name: 'Node.js', description: 'Build scalable server applications', category: 'backend', level: 2, maxLevel: 5, skillPoints: 400, isUnlocked: true, icon: <Server className="w-4 h-4" />, color: 'bg-green-500' },
      { id: 'database', name: 'Database Design', description: 'Design and optimize database schemas', category: 'backend', level: 1, maxLevel: 5, skillPoints: 200, isUnlocked: true, icon: <Database className="w-4 h-4" />, color: 'bg-green-600' },
      { id: 'api', name: 'API Development', description: 'Create RESTful and GraphQL APIs', category: 'backend', level: 0, maxLevel: 5, skillPoints: 0, isUnlocked: false, icon: <Server className="w-4 h-4" />, color: 'bg-green-700' },
    ],
  },
  {
    id: 'ai',
    name: 'AI & Machine Learning',
    description: 'Explore the future of intelligent systems',
    icon: <Brain className="w-6 h-6" />,
    color: 'bg-purple-500',
    totalSkillPoints: 200,
    maxSkillPoints: 3000,
    skills: [
      { id: 'python', name: 'Python for AI', description: 'Master Python for machine learning', category: 'ai', level: 1, maxLevel: 5, skillPoints: 200, isUnlocked: true, icon: <Brain className="w-4 h-4" />, color: 'bg-purple-500' },
      { id: 'tensorflow', name: 'TensorFlow', description: 'Build and train neural networks', category: 'ai', level: 0, maxLevel: 5, skillPoints: 0, isUnlocked: false, icon: <Brain className="w-4 h-4" />, color: 'bg-purple-600' },
      { id: 'nlp', name: 'Natural Language Processing', description: 'Process and understand human language', category: 'ai', level: 0, maxLevel: 5, skillPoints: 0, isUnlocked: false, icon: <Brain className="w-4 h-4" />, color: 'bg-purple-700' },
    ],
  },
  {
    id: 'devops',
    name: 'DevOps & Infrastructure',
    description: 'Deploy and maintain production systems',
    icon: <Zap className="w-6 h-6" />,
    color: 'bg-orange-500',
    totalSkillPoints: 0,
    maxSkillPoints: 3000,
    skills: [
      { id: 'docker', name: 'Docker', description: 'Containerize your applications', category: 'devops', level: 0, maxLevel: 5, skillPoints: 0, isUnlocked: false, icon: <Zap className="w-4 h-4" />, color: 'bg-orange-500' },
      { id: 'kubernetes', name: 'Kubernetes', description: 'Orchestrate containerized applications', category: 'devops', level: 0, maxLevel: 5, skillPoints: 0, isUnlocked: false, icon: <Zap className="w-4 h-4" />, color: 'bg-orange-600' },
      { id: 'aws', name: 'AWS Cloud', description: 'Deploy applications on AWS infrastructure', category: 'devops', level: 0, maxLevel: 5, skillPoints: 0, isUnlocked: false, icon: <Zap className="w-4 h-4" />, color: 'bg-orange-700' },
    ],
  },
];

export default function SkillTreePage() {
  const { data: session } = useSession();
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | null>(null);
  const [userSP, setUserSP] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/users/me/stats');
        if (res.ok) {
          const data = await res.json();
          setUserSP(data.skillPoints ?? 0);
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    };
    if (session) fetchStats();
  }, [session]);

  const totalSkillPoints = skillCategories.reduce((sum, c) => sum + c.totalSkillPoints, 0);
  const maxTotalSkillPoints = skillCategories.reduce((sum, c) => sum + c.maxSkillPoints, 0);
  const overallProgress = (totalSkillPoints / maxTotalSkillPoints) * 100;
  const unlockedSkills = skillCategories.flatMap(c => c.skills.filter(s => s.isUnlocked)).length;
  const totalSkills = skillCategories.flatMap(c => c.skills).length;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Skill Tree</h1>
          <p className="text-muted-foreground mt-1">
            Develop your abilities and track your expertise
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
        </Button>
      </div>

      {/* Overall Progress */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 border-2 border-purple-200 dark:border-purple-800">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
            <div className="flex items-center space-x-3">
              <Trophy className="w-8 h-8 text-yellow-600" />
              <div>
                <h3 className="text-xl font-bold">Overall Progress</h3>
                <p className="text-muted-foreground">Your journey to becoming a legendary developer</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">{totalSkillPoints} SP</div>
              <div className="text-sm text-muted-foreground">of {maxTotalSkillPoints} SP</div>
              <div className="text-xs text-muted-foreground mt-1">Available: {userSP} SP</div>
            </div>
          </div>
          <Progress value={overallProgress} className="h-3" />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>{unlockedSkills}/{totalSkills} Skills Unlocked</span>
            <span>{Math.round(overallProgress)}% Complete</span>
          </div>
        </CardContent>
      </Card>

      {/* Skill Categories */}
      <div className="grid sm:grid-cols-2 gap-6">
        {skillCategories.map((category) => (
          <Card
            key={category.id}
            className={`cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${
              selectedCategory?.id === category.id
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-950'
                : 'border-border hover:border-muted-foreground/30'
            }`}
            onClick={() => setSelectedCategory(
              selectedCategory?.id === category.id ? null : category
            )}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${category.color} text-white`}>
                    {category.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{category.totalSkillPoints} SP</div>
                  <div className="text-xs text-muted-foreground">of {category.maxSkillPoints} SP</div>
                </div>
              </div>
              <Progress
                value={(category.totalSkillPoints / category.maxSkillPoints) * 100}
                className="h-2 mt-3"
              />
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Selected Category Skills */}
      {selectedCategory && (
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-lg ${selectedCategory.color} text-white`}>
              {selectedCategory.icon}
            </div>
            <div>
              <h3 className="text-2xl font-bold">{selectedCategory.name}</h3>
              <p className="text-muted-foreground">{selectedCategory.description}</p>
            </div>
          </div>

          <div className="grid gap-4">
            {selectedCategory.skills.map((skill) => (
              <Card
                key={skill.id}
                className={`transition-all duration-300 ${
                  skill.isUnlocked
                    ? 'border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800'
                    : 'border-gray-200 bg-gray-50 dark:bg-gray-900 dark:border-gray-800 opacity-70'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${skill.color} text-white`}>
                        {skill.isUnlocked ? skill.icon : <Lock className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold">{skill.name}</h4>
                          {skill.isUnlocked && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Unlocked
                            </Badge>
                          )}
                          {!skill.isUnlocked && (
                            <Badge variant="secondary" className="text-xs">
                              <Lock className="w-3 h-3 mr-1" />
                              Locked
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{skill.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{skill.skillPoints} SP</div>
                      <div className="text-xs text-muted-foreground">
                        Level {skill.level}/{skill.maxLevel}
                      </div>
                      {skill.isUnlocked && (
                        <div className="flex space-x-1 mt-2 justify-end">
                          {Array.from({ length: skill.maxLevel }, (_, i) => (
                            <div
                              key={i}
                              className={`w-2.5 h-2.5 rounded-full ${
                                i < skill.level ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Achievement Badges */}
      <div>
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <Award className="w-5 h-5 mr-2" />
          Recent Achievements
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { name: 'First Quest', icon: '🎯', color: 'bg-blue-500' },
            { name: 'Frontend Pioneer', icon: '⚛️', color: 'bg-green-500' },
            { name: 'Code Warrior', icon: '⚔️', color: 'bg-purple-500' },
            { name: 'Skill Master', icon: '🏆', color: 'bg-yellow-500' },
          ].map((achievement, index) => (
            <Card key={index} className="text-center p-4 hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 rounded-full ${achievement.color} text-white flex items-center justify-center mx-auto mb-2 text-xl`}>
                {achievement.icon}
              </div>
              <h4 className="font-semibold text-sm">{achievement.name}</h4>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
