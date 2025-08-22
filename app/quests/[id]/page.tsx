'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  ArrowLeft, 
  DollarSign, 
  Trophy, 
  Users, 
  Clock, 
  Calendar,
  Building,
  CheckCircle,
  AlertCircle,
  ExternalLink
} from 'lucide-react'
import { Database } from '@/types/supabase';
import { useAuth } from '@/hooks/useAuth';
import { QuestApplicationDialog } from '@/components/student/QuestApplicationDialog';
import { QuestSubmissionDialog } from '@/components/student/QuestSubmissionDialog';

type Quest = Database['public']['Tables']['quests']['Row'];

export default function QuestDetailPage() {
  const params = useParams();
  const { user, profile } = useAuth();
  const [quest, setQuest] = useState<Quest | null>(null);
  const [loading, setLoading] = useState(true);
  const [similarQuests, setSimilarQuests] = useState<Quest[]>([]);

  useEffect(() => {
    const fetchQuest = async () => {
      if (params.id) {
        const response = await fetch(`/api/quests/${params.id}`);
        const data = await response.json();
        setQuest(data);
      }
      setLoading(false);
    };

    const fetchSimilarQuests = async () => {
      const response = await fetch(`/api/quests`);
      const data = await response.json();
      if (quest) {
        setSimilarQuests(
          data.filter(
            (q: Quest) => q.id !== quest.id && q.difficulty === quest.difficulty
          )
        );
      }
    };

    fetchQuest();
    fetchSimilarQuests();
  }, [params.id, quest]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!quest) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Quest Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The quest you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/quests">
            <Button>Browse All Quests</Button>
          </Link>
        </div>
      </div>
    )
  }

  const getRankColor = (rank: string) => {
    const colors = {
      S: 'bg-yellow-500 text-black',
      A: 'bg-red-500 text-white',
      B: 'bg-blue-500 text-white',
      C: 'bg-green-500 text-white',
      D: 'bg-gray-500 text-white',
      F: 'bg-gray-400 text-white'
    }
    return colors[rank as keyof typeof colors] || 'bg-gray-400 text-white'
  }

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      completed: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const canApply = user && profile?.role === 'student' && quest.status === 'active'
  const canSubmit = user && profile?.role === 'student' && quest.status === 'in_progress' && quest.assigned_to === user.id

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/quests" className="flex items-center space-x-2">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Quests</span>
          </Link>
          <div className="flex items-center space-x-2">
            <Image src="/images/guild-logo.png" alt="The Adventurers Guild" width={32} height={32} />
            <span className="text-xl font-bold">Quest Details</span>
          </div>
          {!user && (
            <Link href="/login">
              <Button>Join Guild</Button>
            </Link>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quest Header */}
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge className={getRankColor(quest.difficulty)}>
                  {quest.difficulty}-Rank Quest
                </Badge>
                <Badge className={getStatusColor(quest.status)}>
                  {quest.status.replace('_', ' ')}
                </Badge>
                {quest.status === 'active' && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Accepting Applications
                  </Badge>
                )}
              </div>
              
              <h1 className="text-4xl font-bold mb-4">{quest.title}</h1>
              
              <div className="flex items-center space-x-4 text-muted-foreground mb-6">
                <div className="flex items-center">
                  <Building className="w-4 h-4 mr-2" />
                  <span>{quest.company_name}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Posted {new Date(quest.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Quest Description */}
            <Card>
              <CardHeader>
                <CardTitle>Quest Description</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  {quest.description}
                </p>
              </CardContent>
            </Card>

            {/* Requirements */}
            {quest.requirements && (
              <Card>
                <CardHeader>
                  <CardTitle>Technical Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {quest.requirements}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Skills & Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Required Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {quest.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Skill Rewards */}
            <Card>
              <CardHeader>
                <CardTitle>Skill Rewards</CardTitle>
                <CardDescription>
                  XP and skill points you'll earn upon successful completion
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">Total XP</span>
                    <span className="text-lg font-bold text-primary">{quest.xp_reward} XP</span>
                  </div>
                  {quest.skill_rewards && Object.entries(quest.skill_rewards).map(([skill, points]) => (
                    <div key={skill} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="font-medium">{skill}</span>
                      <span className="text-lg font-bold text-secondary">+{points} SP</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quest Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quest Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-muted-foreground">
                    <DollarSign className="w-4 h-4 mr-2" />
                    <span>Budget</span>
                  </div>
                  <span className="font-semibold">${quest.budget}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-muted-foreground">
                    <Trophy className="w-4 h-4 mr-2" />
                    <span>XP Reward</span>
                  </div>
                  <span className="font-semibold">{quest.xp_reward} XP</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-muted-foreground">
                    <Users className="w-4 h-4 mr-2" />
                    <span>Applications</span>
                  </div>
                  <span className="font-semibold">{quest.applications_count}</span>
                </div>
                
                {quest.deadline && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>Deadline</span>
                    </div>
                    <span className="font-semibold">
                      {new Date(quest.deadline).toLocaleDateString()}
                    </span>
                  </div>
                )}

                <Separator />

                {canApply ? (
                  <QuestApplicationDialog quest={quest} />
                ) : canSubmit ? (
                  <QuestSubmissionDialog quest={quest} />
                ) : quest.status !== 'active' ? (
                  <Button disabled className="w-full" size="lg">
                    Quest {quest.status.replace('_', ' ')}
                  </Button>
                ) : !user ? (
                  <Link href="/login">
                    <Button className="w-full" size="lg">
                      Join Guild to Apply
                    </Button>
                  </Link>
                ) : (
                  <Link href="/commission">
                    <Button variant="outline" className="w-full" size="lg">
                      Post Your Own Quest
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            {/* Company Info */}
            <Card>
              <CardHeader>
                <CardTitle>Quest Giver</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3 mb-4">
                  <Avatar>
                    <AvatarFallback>
                      {quest.company_name.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">{quest.company_name}</h4>
                    <p className="text-sm text-muted-foreground">Verified Company</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  A trusted partner in The Adventurers Guild community, committed to 
                  providing quality projects and fair compensation.
                </p>
                <Button variant="outline" className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Company Profile
                </Button>
              </CardContent>
            </Card>

            {/* Similar Quests */}
            <Card>
              <CardHeader>
                <CardTitle>Similar Quests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {similarQuests
                    .slice(0, 3)
                    .map((similarQuest) => (
                      <Link key={similarQuest.id} href={`/quests/${similarQuest.id}`}>
                        <div className="p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                          <h5 className="font-medium text-sm line-clamp-2 mb-1">
                            {similarQuest.title}
                          </h5>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{similarQuest.company_name}</span>
                            <span>{similarQuest.xp_reward} XP</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}