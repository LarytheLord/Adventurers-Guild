// components/QuestMatcher.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  Zap, 
  TrendingUp, 
  User, 
  Star,
  Bot
} from 'lucide-react';
import { toast } from 'sonner';

// Types
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
  users?: {
    name: string;
    is_verified: boolean;
  };
  matchScore?: number;
  recommendationScore?: number;
}

interface QuestMatcherProps {
  userId: string;
  onQuestSelect?: (questId: string) => void;
}

export default function QuestMatcher({ userId, onQuestSelect }: QuestMatcherProps) {
  const [matches, setMatches] = useState<Quest[]>([]);
  const [recommendations, setRecommendations] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'matches' | 'recommendations'>('matches');

  // Fetch matched quests
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        
        if (activeTab === 'matches') {
          // Fetch matched quests
          const response = await fetch(`/api/matching?user_id=${userId}&limit=5`);
          const data = await response.json();
          
          if (data.success) {
            setMatches(data.matches || []);
          } else {
            toast.error(data.error || 'Failed to fetch matched quests');
          }
        } else {
          // Fetch recommendations
          const response = await fetch('/api/matching', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user_id: userId,
              num_recommendations: 5
            }),
          });
          
          const data = await response.json();
          
          if (data.success) {
            setRecommendations(data.recommendations || []);
          } else {
            toast.error(data.error || 'Failed to fetch recommendations');
          }
        }
      } catch (error) {
        console.error('Error fetching matches/recommendations:', error);
        toast.error('Error fetching matches/recommendations');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchMatches();
    }
  }, [userId, activeTab]);

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'S': return 'text-yellow-500';
      case 'A': return 'text-red-500';
      case 'B': return 'text-blue-500';
      case 'C': return 'text-green-500';
      case 'D': return 'text-gray-500';
      case 'E': return 'text-purple-500';
      case 'F': return 'text-gray-300';
      default: return 'text-gray-500';
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const quests = activeTab === 'matches' ? matches : recommendations;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Quest Matcher
          </h2>
          <p className="text-muted-foreground">
            {activeTab === 'matches' 
              ? 'Quests matched to your skills and rank' 
              : 'Personalized recommendations based on your activity'}
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant={activeTab === 'matches' ? 'default' : 'outline'}
            onClick={() => setActiveTab('matches')}
            size="sm"
          >
            <Target className="h-4 w-4 mr-2" />
            Matches
          </Button>
          <Button
            variant={activeTab === 'recommendations' ? 'default' : 'outline'}
            onClick={() => setActiveTab('recommendations')}
            size="sm"
          >
            <Star className="h-4 w-4 mr-2" />
            Recommendations
          </Button>
        </div>
      </div>

      {quests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Bot className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No {activeTab === 'matches' ? 'matches' : 'recommendations'} found</h3>
            <p className="text-muted-foreground">
              {activeTab === 'matches' 
                ? 'No quests match your current skills and rank' 
                : 'Not enough data to generate recommendations yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
          {quests.map((quest) => (
            <Card key={quest.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{quest.title}</CardTitle>
                    <div className="flex items-center mt-1 space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {quest.users?.name || 'Unknown Company'}
                      </div>
                      <div className="flex items-center">
                        <Target className="h-4 w-4 mr-1" />
                        <span className={getRankColor(quest.difficulty)}>{quest.difficulty}</span>
                      </div>
                    </div>
                  </div>
                  
                  {activeTab === 'matches' && quest.matchScore !== undefined && (
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getMatchScoreColor(quest.matchScore)}`}>
                        {quest.matchScore}%
                      </div>
                      <div className="text-xs text-muted-foreground">Match</div>
                    </div>
                  )}
                  
                  {activeTab === 'recommendations' && quest.recommendationScore !== undefined && (
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">
                        {Math.round(quest.recommendationScore)}
                      </div>
                      <div className="text-xs text-muted-foreground">Score</div>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pb-3">
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {quest.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="outline">{quest.quest_category}</Badge>
                  <Badge variant="outline">{quest.quest_type}</Badge>
                  {quest.required_rank && (
                    <Badge variant="outline" className={getRankColor(quest.required_rank)}>
                      Req: {quest.required_rank}
                    </Badge>
                  )}
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center">
                    <Zap className="h-4 w-4 mr-1 text-yellow-500" />
                    <span>{quest.xp_reward} XP</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-1 text-blue-500" />
                    <span>{quest.skill_points_reward} SP</span>
                  </div>
                  {quest.monetary_reward && (
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                      <span>${quest.monetary_reward}</span>
                    </div>
                  )}
                </div>
                
                {quest.required_skills && quest.required_skills.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-xs font-medium text-muted-foreground mb-1">Required Skills:</h4>
                    <div className="flex flex-wrap gap-1">
                      {quest.required_skills.slice(0, 3).map((skill, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {quest.required_skills.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{quest.required_skills.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <div className="text-xs text-muted-foreground">
                  Posted: {new Date(quest.created_at).toLocaleDateString()}
                </div>
                <Button 
                  size="sm" 
                  onClick={() => onQuestSelect ? onQuestSelect(quest.id) : window.location.assign(`/quests/${quest.id}`)}
                >
                  View Quest
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}