// components/company/QuestTable.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Eye, Edit, Trash2, Users, Target } from 'lucide-react';
import { getStatusColor } from '@/lib/status-utils';

interface Quest {
  id: string;
  title: string;
  description: string;
  status: string;
  difficulty: string;
  xpReward: number;
  skillPointsReward: number;
  monetaryReward?: number;
  maxParticipants?: number;
  createdAt: string;
}

interface QuestTableProps {
  quests: Quest[];
  loading: boolean;
  onViewQuest: (questId: string) => void;
  onEditQuest: (questId: string) => void;
  onDeleteQuest: (questId: string) => void;
  limit?: number;
}

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

export function QuestTable({
  quests,
  loading,
  onViewQuest,
  onEditQuest,
  onDeleteQuest,
  limit
}: QuestTableProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (quests.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-center py-8 sm:py-12">
          <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg sm:text-xl font-medium mb-2">No quests yet</h3>
          <p className="text-sm sm:text-base text-muted-foreground mb-4">Create your first quest to get started</p>
        </div>
      </div>
    );
  }

  const displayQuests = limit ? quests.slice(0, limit) : quests;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Quest</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Difficulty</TableHead>
            <TableHead>Rewards</TableHead>
            <TableHead>Participants</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayQuests.map((quest) => (
            <TableRow key={quest.id}>
              <TableCell className="font-medium">
                <div>
                  <div className="font-medium">{quest.title}</div>
                  <div className="text-sm text-muted-foreground line-clamp-1">
                    {quest.description}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={getStatusColor(quest.status)}>
                  {quest.status.replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell>
                <span className={getRankColor(quest.difficulty)}>{quest.difficulty}</span>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <div>XP: {quest.xpReward}</div>
                  {quest.skillPointsReward > 0 && (
                    <div>SP: {quest.skillPointsReward}</div>
                  )}
                  {quest.monetaryReward && (
                    <div>${quest.monetaryReward}</div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span>1/{quest.maxParticipants || 1}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {new Date(quest.createdAt).toLocaleDateString()}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewQuest(quest.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditQuest(quest.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeleteQuest(quest.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
