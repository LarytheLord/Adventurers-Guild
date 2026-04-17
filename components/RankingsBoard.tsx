// components/RankingsBoard.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Trophy,
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
  skillPoints: number;
  level: number;
  position: number;
  adventurerProfiles?: {
    specialization?: string;
    questCompletionRate?: number;
    totalQuestsCompleted?: number;
  };
}

interface RankingsBoardProps {
  showUserPosition?: boolean;
  limit?: number;
}

export default function RankingsBoard({ showUserPosition = false, limit = 10 }: RankingsBoardProps) {
  const { data: session } = useSession();
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

        if (showUserPosition && session?.user?.id) {
          const userRankData = await getUserRank(session.user.id);
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
  }, [selectedRank, limit, showUserPosition, session?.user?.id]);

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
                <div className="h-8 w-8 rounded bg-muted"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-muted"></div>
                  <div className="h-3 w-1/2 rounded bg-muted"></div>
                </div>
                <div className="h-4 w-16 rounded bg-muted"></div>
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
          <div className="mt-4 flex items-center justify-between rounded-md bg-muted p-3">
            <span>Your position: {userRank.position} of {userRank.totalUsers}</span>
            <Button variant="ghost" size="sm" onClick={() => toast.info('Refreshed rankings')}>
              <RotateCcw className="mr-1 h-4 w-4" /> Refresh
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {rankings.length === 0 ? (
          <div className="py-8 text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-medium">No adventurers found</h3>
            <p className="text-muted-foreground">Be the first to complete a quest!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="space-y-4">
              {rankings.map((user) => {
                const rankThresholds: Record<string, number> = {
                  F: 0,
                  E: 1000,
                  D: 3000,
                  C: 6000,
                  B: 10000,
                  A: 15000,
                  S: 25000
                };

                const currentRankThreshold = rankThresholds[user.rank] || 0;
                const nextRank = user.rank === 'S'
                  ? 'S'
                  : Object.keys(rankThresholds).find((rank) => rankThresholds[rank] > currentRankThreshold) || 'S';
                const nextRankThreshold = user.rank === 'S' ? currentRankThreshold : rankThresholds[nextRank];
                const progress = nextRankThreshold > 0
                  ? ((user.xp - currentRankThreshold) / (nextRankThreshold - currentRankThreshold)) * 100
                  : 100;
                const rowClasses = user.position <= 3 ? 'bg-secondary/30' : 'bg-background hover:bg-muted/50';
                const stickyClasses = user.position <= 3
                  ? 'bg-secondary/30'
                  : 'bg-background group-hover:bg-muted/50';

                return (
                  <div
                    key={user.id}
                    className={`group grid grid-cols-[minmax(0,1fr)_auto] gap-3 rounded-lg border p-4 sm:min-w-[640px] sm:grid-cols-[minmax(240px,1fr)_minmax(120px,auto)_minmax(110px,auto)] md:grid-cols-[minmax(240px,1fr)_minmax(120px,auto)_minmax(110px,auto)_minmax(180px,auto)] ${rowClasses}`}
                  >
                    <div className={`sticky left-0 z-10 flex min-w-0 items-center space-x-4 pr-3 ${stickyClasses}`}>
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        user.position === 1 ? 'bg-yellow-100 text-yellow-800' :
                        user.position === 2 ? 'bg-gray-100 text-gray-800' :
                        user.position === 3 ? 'bg-amber-100 text-amber-800' :
                        'bg-primary/10'
                      }`}>
                        {getRankIcon(user.position)}
                      </div>

                      <div className="min-w-0">
                        <div className="truncate font-medium">{user.name || user.email}</div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline" className={getRankColor(user.rank)}>
                            {user.rank}-Rank
                          </Badge>
                          {user.adventurerProfiles?.specialization && (
                            <span className="hidden truncate sm:inline">{user.adventurerProfiles.specialization}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-center text-right">
                      <div className="font-medium">{user.xp.toLocaleString()} XP</div>
                      <div className="hidden text-sm text-muted-foreground sm:block">{user.skillPoints} SP</div>
                    </div>

                    <div className="hidden flex-col items-end justify-center sm:flex">
                      <Badge variant="outline" className={getRankColor(user.rank)}>
                        {user.rank}
                      </Badge>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Level {user.level}
                      </div>
                    </div>

                    {nextRank !== user.rank ? (
                      <div className="hidden w-full max-w-[200px] md:block">
                        <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                          <span>Progress</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <div className="mt-1 text-right text-xs text-muted-foreground">
                          {nextRankThreshold - user.xp} XP to {nextRank}
                        </div>
                      </div>
                    ) : (
                      <div className="hidden md:block" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
