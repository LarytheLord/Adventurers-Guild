'use client';

import { motion } from 'framer-motion';
import { Flame, Trophy, Zap, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StreakPanelProps {
  currentStreak: number;
  maxStreak: number;
  lastActivityDate?: Date;
}

export default function StreakPanel({ currentStreak, maxStreak }: StreakPanelProps) {
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const todayIndex = new Date().getDay();
  
  return (
    <Card className="overflow-hidden border-slate-300 bg-slate-950/50 text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent pointer-events-none" />
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Flame className={cn("h-4 w-4", currentStreak > 0 ? "text-orange-500 animate-pulse" : "text-slate-500")} />
          Adventurer Streak
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold tracking-tighter text-slate-100">{currentStreak}</span>
              <span className="text-xs text-slate-400 uppercase font-semibold">days</span>
            </div>
            <p className="text-[10px] text-orange-500 uppercase tracking-wider mt-1 font-medium">
              Best: {currentStreak > maxStreak ? currentStreak : maxStreak} days
            </p>
          </div>
          <div className="flex gap-1.5">
            {days.map((day, i) => {
              const isActive = i <= todayIndex && i > todayIndex - currentStreak;
              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className={cn("w-3 h-3 rounded-sm", isActive ? "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" : "bg-slate-800")} />
                  <span className="text-[8px] text-slate-500 font-bold">{day}</span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
