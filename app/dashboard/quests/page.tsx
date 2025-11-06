'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Target, Zap, Users, Clock, Search, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface Quest {
  id: string;
  title: string;
  description: string;
  quest_type: string;
  status: string;
  difficulty: string;
  xp_reward: number;
  skill_points_reward: number;
  monetary_reward?: number;
  required_skills: string[];
  required_rank?: string;
  max_participants?: number;
  quest_category: string;
  company_id: string;
  created_at: string;
  deadline?: string;
  users: {
    name: string;
    email: string;
  };
}

export default function QuestsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && session?.user?.role === 'company') {
      // Companies shouldn't access this page
      router.push('/dashboard/company');
      return;
    }

    const fetchQuests = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/quests?status=available');
        const data = await response.json();

        if (!data.success) {
          setError(data.error || 'Failed to fetch quests');
          return;
        }

        setQuests(data.quests || data.quest);
      } catch (err) {
        console.error('Error fetching quests:', err);
        setError('An error occurred while fetching quests');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchQuests();
    }
  }, [status, session, router]);

  const filteredQuests = quests.filter(quest =>
    quest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quest.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quest.quest_category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quest.required_skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Available Quests</h1>
        <p className="text-muted-foreground mt-1">
          Browse and accept quests to earn XP, skill points, and real-world experience
        </p>
      </div>

      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search quests by title, category, or required skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => router.push('/dashboard')}>
            ← Back to Dashboard
          </Button>
        </div>
      </div>

      {filteredQuests.length === 0 ? (
        <div className="text-center py-12">
          <Target className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">No quests available</h3>
          <p className="text-muted-foreground mb-4">
            Check back later for new quests or filter your search
          </p>
          <Button onClick={() => setSearchTerm('')}>
            Clear Search
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuests.map((quest) => (
            <Card key={quest.id} className="flex flex-col h-full">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{quest.title}</CardTitle>
                    <CardDescription>
                      Posted by {quest.users?.name || 'Unknown Company'}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">{quest.difficulty}-Rank</Badge>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="secondary">{quest.quest_category}</Badge>
                  <Badge variant="outline">{quest.quest_type}</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col flex-grow">
                <p className="text-muted-foreground mb-4 line-clamp-2">
                  {quest.description}
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center">
                    <Zap className="w-4 h-4 mr-2 text-yellow-500" />
                    <span className="text-sm">{quest.xp_reward} XP</span>
                  </div>
                  <div className="flex items-center">
                    <Target className="w-4 h-4 mr-2 text-blue-500" />
                    <span className="text-sm">{quest.skill_points_reward} SP</span>
                  </div>
                  {quest.monetary_reward && (
                    <div className="flex items-center col-span-2">
                      <span className="text-sm font-medium">${quest.monetary_reward}</span>
                    </div>
                  )}
                </div>
                
                {quest.required_skills && quest.required_skills.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground mb-1">Required Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {quest.required_skills.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {quest.required_skills.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{quest.required_skills.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                
                {quest.deadline && (
                  <div className="flex items-center text-sm text-muted-foreground mb-4">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>Due: {new Date(quest.deadline).toLocaleDateString()}</span>
                  </div>
                )}
                
                <div className="mt-auto">
                  <Link href={`/dashboard/quests/${quest.id}`} className="w-full">
                    <Button className="w-full">
                      View Quest Details
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}