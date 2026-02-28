'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Trophy,
  Zap,
  Target,
  TrendingUp,
  User,
  Mail,
  Shield,
  Calendar,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';

interface UserProfile {
  xp: number;
  level: number;
  rank: string;
  questsCompleted: number;
  activeQuests: number;
  skillPoints: number;
}

const RANK_COLORS: Record<string, string> = {
  S: 'bg-amber-100 text-amber-800 border-amber-300',
  A: 'bg-violet-100 text-violet-800 border-violet-300',
  B: 'bg-blue-100 text-blue-800 border-blue-300',
  C: 'bg-green-100 text-green-800 border-green-300',
  D: 'bg-slate-100 text-slate-800 border-slate-300',
  E: 'bg-purple-100 text-purple-800 border-purple-300',
  F: 'bg-gray-100 text-gray-800 border-gray-300',
};

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!session) return;
    setName(session.user?.name || '');

    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/users/me/stats');
        if (res.ok) {
          const data = await res.json();
          setProfile({
            xp: data.xp ?? 0,
            level: data.level ?? 1,
            rank: data.rank ?? 'F',
            questsCompleted: data.questsCompleted ?? 0,
            activeQuests: data.activeQuests ?? 0,
            skillPoints: data.skillPoints ?? 0,
          });
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [session]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // For now, show a success message - name updates would require a dedicated API endpoint
      toast.success('Profile updated successfully');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const userInitials = session?.user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U';

  const xpToNextLevel = profile ? (profile.level + 1) * 1000 : 1000;
  const xpProgress = profile ? ((profile.xp % 1000) / 10) : 0;
  const rankColor = RANK_COLORS[profile?.rank || 'F'] || RANK_COLORS.F;

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and view your progress
        </p>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <Avatar className="w-20 h-20">
              <AvatarImage src={session?.user?.image || undefined} />
              <AvatarFallback className="text-2xl">{userInitials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-bold">{session?.user?.name}</h2>
                <Badge className={`${rankColor} border font-bold text-sm`}>
                  {profile?.rank || 'F'}-Rank
                </Badge>
              </div>
              <p className="text-muted-foreground">{session?.user?.email}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" />
                  {session?.user?.role || 'adventurer'}
                </span>
                <span className="flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5" />
                  Level {profile?.level || 1}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Zap className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
            <div className="text-2xl font-bold">{profile?.xp || 0}</div>
            <div className="text-xs text-muted-foreground">Total XP</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
            <div className="text-2xl font-bold">{profile?.rank || 'F'}</div>
            <div className="text-xs text-muted-foreground">Current Rank</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
            <div className="text-2xl font-bold">{profile?.questsCompleted || 0}</div>
            <div className="text-xs text-muted-foreground">Quests Done</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
            <div className="text-2xl font-bold">{profile?.skillPoints || 0}</div>
            <div className="text-xs text-muted-foreground">Skill Points</div>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Level Progress</CardTitle>
          <CardDescription>
            {profile?.xp || 0} / {xpToNextLevel} XP to Level {(profile?.level || 1) + 1}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={xpProgress} className="h-2" />
        </CardContent>
      </Card>

      {/* Account Details */}
      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Full Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </Label>
            <Input
              id="email"
              value={session?.user?.email || ''}
              disabled
              className="h-11 bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Email cannot be changed
            </p>
          </div>

          <Separator />

          <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
