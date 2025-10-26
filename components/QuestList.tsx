// components/QuestList.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { fetchAvailableQuests, assignToQuest } from '@/lib/quest-utils';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Lock, Target, Coins, Users, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface Quest {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  xp_reward: number;
  skill_points_reward: number;
  monetary_reward?: number;
  required_rank?: string;
  max_participants?: number;
  quest_category: string;
  company_id: string;
  deadline?: string;
  users?: {
    name: string;
  };
}

interface QuestListProps {
  filter?: {
    category?: string;
    difficulty?: string;
    search?: string;
  };
}

export default function QuestList({ filter }: QuestListProps) {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [assignedQuests, setAssignedQuests] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadQuests = async () => {
      try {
        setLoading(true);
        const allQuests = await fetchAvailableQuests();
        
        // Apply client-side filtering
        let filteredQuests = allQuests;
        
        if (filter?.category) {
          filteredQuests = filteredQuests.filter(q => 
            q.quest_category.toLowerCase() === filter.category?.toLowerCase()
          );
        }
        
        if (filter?.difficulty) {
          filteredQuests = filteredQuests.filter(q => 
            q.difficulty.toLowerCase() === filter.difficulty?.toLowerCase()
          );
        }
        
        if (filter?.search) {
          const searchTerm = filter.search.toLowerCase();
          filteredQuests = filteredQuests.filter(q => 
            q.title.toLowerCase().includes(searchTerm) || 
            q.description.toLowerCase().includes(searchTerm)
          );
        }
        
        setQuests(filteredQuests);
      } catch (error) {
        console.error('Error loading quests:', error);
        toast.error('Failed to load quests');
      } finally {
        setLoading(false);
      }
    };

    loadQuests();
  }, [filter]);

  const handleAssignToQuest = async (questId: string) => {
    if (status !== 'authenticated' || !session?.user?.id) {
      toast.error('Please log in to join a quest');
      router.push('/login');
      return;
    }

    try {
      const assignment = await assignToQuest(questId, session.user.id);
      if (assignment) {
        toast.success('Successfully assigned to quest!');
        setAssignedQuests(prev => new Set(prev).add(questId));
      }
    } catch (error) {
      console.error('Error assigning to quest:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to assign to quest');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'S': return 'bg-yellow-500 text-black';
      case 'A': return 'bg-red-500 text-white';
      case 'B': return 'bg-blue-500 text-white';
      case 'C': return 'bg-green-500 text-white';
      case 'D': return 'bg-gray-500 text-white';
      case 'E': return 'bg-purple-500 text-white';
      case 'F': return 'bg-gray-300 text-black';
      default: return 'bg-gray-400 text-white';
    }
  };

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="bg-card rounded-2xl shadow-lg border-0 overflow-hidden flex flex-col animate-pulse">
            <CardHeader className="p-0">
              <div className="w-full h-40 bg-muted rounded-t-2xl" />
            </CardHeader>
            <CardContent className="p-4 sm:p-6 flex-grow">
              <div className="h-4 bg-muted rounded w-1/4 mb-3"></div>
              <div className="h-6 bg-muted rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-muted rounded w-full mb-2"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </CardContent>
            <CardFooter className="p-4 sm:p-6 bg-card-foreground/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
              <div className="h-5 bg-muted rounded w-16"></div>
              <div className="h-10 bg-muted rounded w-full sm:w-32"></div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (quests.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
          <Target className="w-12 h-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-bold mb-2">No quests found</h3>
        <p className="text-muted-foreground">Try adjusting your filters to see more quests</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
      {quests.map((quest) => {
        const isAssigned = assignedQuests.has(quest.id);
        const canAssign = !isAssigned && status === 'authenticated';
        
        return (
          <Card 
            key={quest.id} 
            className="bg-card rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 overflow-hidden flex flex-col"
          >
            <CardHeader className="p-0">
              <div className="w-full h-40 bg-muted flex items-center justify-center">
                <Target className="w-16 h-16 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 flex-grow">
              <div className="flex justify-between items-start mb-3">
                <Badge className={`${getDifficultyColor(quest.difficulty)} text-xs sm:text-sm`}>
                  {quest.difficulty}-Rank
                </Badge>
                {quest.required_rank && (
                  <Badge variant="outline" className="text-xs">
                    Req: {quest.required_rank}
                  </Badge>
                )}
              </div>
              
              <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3">
                {quest.title}
              </CardTitle>
              
              <CardDescription className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-4">
                {quest.description}
              </CardDescription>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-muted-foreground">
                  <Target className="w-4 h-4 mr-2" />
                  <span>{quest.xp_reward} XP</span>
                  {quest.skill_points_reward > 0 && (
                    <><span className="mx-1">•</span> <span>{quest.skill_points_reward} SP</span></>
                  )}
                </div>
                
                <div className="flex items-center text-muted-foreground">
                  <Coins className="w-4 h-4 mr-2" />
                  {quest.monetary_reward ? (
                    <span>${quest.monetary_reward} reward</span>
                  ) : (
                    <span>Experience reward</span>
                  )}
                </div>
                
                {quest.max_participants && (
                  <div className="flex items-center text-muted-foreground">
                    <Users className="w-4 h-4 mr-2" />
                    <span>{quest.max_participants} max participants</span>
                  </div>
                )}
                
                {quest.deadline && (
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Due: {new Date(quest.deadline).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
            
            <CardFooter className="p-4 sm:p-6 bg-card-foreground/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{quest.quest_category}</Badge>
                {quest.users?.name && (
                  <Badge variant="outline">By {quest.users.name}</Badge>
                )}
              </div>
              
              <Button 
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold w-full sm:w-auto text-sm sm:text-base"
                onClick={() => handleAssignToQuest(quest.id)}
                disabled={!canAssign}
              >
                {isAssigned ? (
                  <>
                    <Lock className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    Assigned
                  </>
                ) : status !== 'authenticated' ? (
                  <>
                    <Lock className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    Log in to join
                  </>
                ) : (
                  <>
                    Claim Quest <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}