// components/RankingsBoard.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Users,
  RotateCcw
} from 'lucide-react';
import { fetchRankings, getUserRank } from '@/lib/rank-utils';
import { toast } from 'sonner';

interface RankingUser {
  id: string;
  name: string;
  email: string;
  rank: string;
  xp: number;
  skill_points: number;
  level: number;
  position: number;
  adventurer_profiles?: {
    specialization?: string;
    quest_completion_rate?: number;
    total_quests_completed?: number;
  };
}

interface RankingsBoardProps {
  showUserPosition?: boolean;
  limit?: number;
}

export default function RankingsBoard({ showUserPosition = false, limit = 10 }: RankingsBoardProps) {
  const [rankings, setRankings] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<{ position: number; totalUsers: number } | null>(null);
  const [selectedRank, setSelectedRank] = useState<string>('all');
  
  useEffect(() => {
    const loadRankings = async () => {
      try {
        setLoading(true);
        const data = await fetchRankings({
          sort: 'xp',
          order: 'desc',
          limit: limit.toString(),
          rank: selectedRank === 'all' ? undefined : selectedRank
        });
        setRankings(data);
        
        if (showUserPosition) {
          // In a real implementation, you would get the current user's ID from the session
          // For now, we'll simulate with a mock user ID
          const mockUserId = 'mock-user-id'; // This should come from the session
          const userRankData = await getUserRank(mockUserId);
          setUserRank(userRankData);
        }
      } catch (error) {
        console.error('Error fetching rankings:', error);
        toast.error('Failed to load rankings');
      } finally {
        setLoading(false);
      }
    };

    loadRankings();
  }, [selectedRank, limit, showUserPosition]);

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

  const getRankIcon = (position: number) => {
    if (position === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (position === 2) return <Trophy className="h-5 w-5 text-gray-400" />;
    if (position === 3) return <Trophy className="h-5 w-5 text-amber-700" />;
    return <span className="text-sm font-medium">{position}</span>;
  };

  const rankFilters = ['all', 'F', 'E', 'D', 'C', 'B', 'A', 'S'];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Adventurer Rankings</CardTitle>
          <CardDescription>Top performers on the guild</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="w-8 h-8 rounded bg-muted"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
                <div className="h-4 w-16 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Adventurer Rankings
            </CardTitle>
            <CardDescription>Top performers on the guild</CardDescription>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {rankFilters.map((rank) => (
              <Button
                key={rank}
                variant={selectedRank === rank ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedRank(rank)}
                className={rank !== 'all' ? getRankColor(rank) : ''}
              >
                {rank === 'all' ? 'All Ranks' : rank}
              </Button>
            ))}
          </div>
        </div>
        
        {userRank && (
          <div className="mt-4 p-3 bg-muted rounded-md flex items-center justify-between">
            <span>Your position: {userRank.position} of {userRank.totalUsers}</span>
            <Button variant="ghost" size="sm" onClick={() => toast.info('Refreshed rankings')}>
              <RotateCcw className="h-4 w-4 mr-1" /> Refresh
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {rankings.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No adventurers found</h3>
            <p className="text-muted-foreground">Be the first to complete a quest!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {rankings.map((user) => {
              // Calculate progress to next rank
              const rankThresholds: Record<string, number> = {
                'F': 0,
                'E': 1000,
                'D': 3000,
                'C': 6000,
                'B': 10000,
                'A': 15000,
                'S': 25000
              };
              
              const currentRankThreshold = rankThresholds[user.rank] || 0;
              const nextRank = user.rank === 'S' ? 'S' : 
                Object.keys(rankThresholds).find(r => rankThresholds[r] > currentRankThreshold) || 'S';
              const nextRankThreshold = user.rank === 'S' ? currentRankThreshold : rankThresholds[nextRank];
              
              const progress = nextRankThreshold > 0 
                ? ((user.xp - currentRankThreshold) / (nextRankThreshold - currentRankThreshold)) * 100
                : 100;
              
              return (
                <div 
                  key={user.id} 
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    user.position <= 3 ? 'bg-secondary/30' : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      user.position === 1 ? 'bg-yellow-100 text-yellow-800' :
                      user.position === 2 ? 'bg-gray-100 text-gray-800' :
                      user.position === 3 ? 'bg-amber-100 text-amber-800' :
                      'bg-primary/10'
                    }`}>
                      {getRankIcon(user.position)}
                    </div>
                    
                    <div>
                      <div className="font-medium">{user.name || user.email}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className={getRankColor(user.rank)}>{user.rank}-Rank</span>
                        {user.adventurer_profiles?.specialization && (
                          <span>• {user.adventurer_profiles.specialization}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="font-medium">{user.xp.toLocaleString()} XP</div>
                        <div className="text-sm text-muted-foreground">{user.skill_points} SP</div>
                      </div>
                      <div className="flex flex-col items-end min-w-[100px]">
                        <Badge className={getRankColor(user.rank)}>
                          {user.rank}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          Level {user.level}
                        </div>
                      </div>
                    </div>
                    
                    {nextRank !== user.rank && (
                      <div className="w-32">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Progress</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <div className="text-xs text-muted-foreground mt-1 text-right">
                          {nextRankThreshold - user.xp} XP to {nextRank}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}