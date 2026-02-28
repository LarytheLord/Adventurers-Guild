'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trophy, Medal, Award, Zap } from 'lucide-react';

interface RankedUser {
  id: string;
  name: string;
  rank: string;
  xp: number;
  level: number;
  skill_points: number;
  position: number;
  adventurer_profiles?: {
    specialization?: string;
    total_quests_completed?: number;
  };
}

const RANK_COLORS: Record<string, string> = {
  S: 'bg-amber-100 text-amber-700 border-amber-300',
  A: 'bg-violet-100 text-violet-700 border-violet-300',
  B: 'bg-blue-100 text-blue-700 border-blue-300',
  C: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  D: 'bg-slate-100 text-slate-700 border-slate-300',
  E: 'bg-stone-100 text-stone-600 border-stone-300',
  F: 'bg-gray-100 text-gray-500 border-gray-200',
};

export default function LeaderboardPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<RankedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('xp');

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const res = await fetch(`/api/rankings?sort=${sortBy}&order=desc&limit=50`);
        if (res.ok) {
          const data = await res.json();
          setUsers(data.rankings || []);
        }
      } catch (error) {
        console.error('Error fetching rankings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRankings();
  }, [sortBy]);

  const getPositionIcon = (pos: number) => {
    if (pos === 1) return <Trophy className="w-5 h-5 text-amber-500" />;
    if (pos === 2) return <Medal className="w-5 h-5 text-slate-400" />;
    if (pos === 3) return <Award className="w-5 h-5 text-amber-700" />;
    return <span className="w-5 text-center text-sm font-medium text-muted-foreground">{pos}</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Leaderboard</h1>
          <p className="text-muted-foreground mt-1">Top adventurers ranked by performance</p>
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="xp">Sort by XP</SelectItem>
            <SelectItem value="level">Sort by Level</SelectItem>
            <SelectItem value="skill_points">Sort by Skill Points</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Top 3 podium */}
      {users.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[users[1], users[0], users[2]].map((user, idx) => {
            const isFirst = idx === 1;
            return (
              <Card key={user.id} className={`text-center ${isFirst ? 'border-amber-300 bg-amber-50/50 -mt-4' : ''}`}>
                <CardContent className="pt-6 pb-4">
                  <div className="flex justify-center mb-2">
                    {getPositionIcon(user.position)}
                  </div>
                  <Avatar className={`mx-auto mb-2 ${isFirst ? 'h-16 w-16' : 'h-12 w-12'}`}>
                    <AvatarFallback className="text-lg font-bold">
                      {user.name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <p className="font-semibold text-sm truncate">{user.name}</p>
                  <Badge className={`mt-1 ${RANK_COLORS[user.rank] || ''}`} variant="outline">
                    {user.rank}-Rank
                  </Badge>
                  <div className="mt-2 flex items-center justify-center gap-1 text-sm">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span className="font-medium">{user.xp.toLocaleString()} XP</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Full rankings table */}
      <Card>
        <CardHeader>
          <CardTitle>All Rankings</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {users.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No adventurers ranked yet.
            </div>
          ) : (
            <div className="divide-y">
              {users.map(user => {
                const isCurrentUser = session?.user?.id === user.id;
                const profile = Array.isArray(user.adventurer_profiles)
                  ? user.adventurer_profiles[0]
                  : user.adventurer_profiles;

                return (
                  <div
                    key={user.id}
                    className={`flex items-center gap-4 px-6 py-3.5 ${isCurrentUser ? 'bg-indigo-50/50' : 'hover:bg-slate-50'}`}
                  >
                    <div className="w-8 flex justify-center shrink-0">
                      {getPositionIcon(user.position)}
                    </div>
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarFallback className="text-sm font-semibold">
                        {user.name?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {user.name}
                        {isCurrentUser && <span className="text-xs text-muted-foreground ml-2">(You)</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {profile?.specialization || 'Adventurer'} · Level {user.level}
                        {profile?.total_quests_completed ? ` · ${profile.total_quests_completed} quests` : ''}
                      </p>
                    </div>
                    <Badge className={`shrink-0 ${RANK_COLORS[user.rank] || ''}`} variant="outline">
                      {user.rank}
                    </Badge>
                    <div className="text-right shrink-0 w-24">
                      <p className="text-sm font-semibold">{user.xp.toLocaleString()} XP</p>
                      <p className="text-xs text-muted-foreground">{user.skill_points} SP</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
